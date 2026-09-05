import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeIndiVeraReady, getIndiVeraReadyRules } from './src/core/indivera-ready.mjs';
import { assessIndiVeraVerified } from './src/core/indivera-verified.mjs';
import { extractIndiVeraEvidence } from './src/core/document-engine.mjs';
import { runIndiVeraMatch } from './src/core/indivera-match.mjs';
import { buildIndiVeraPassport } from './src/core/indivera-passport.mjs';
import { buildIndiVeraTradeResult } from './src/core/indivera-trade.mjs';
import { explainIndiVeraReady, INDIVERA_AI_POLICY } from './src/core/ai-policy.mjs';
import { publicSources } from './src/core/sources.mjs';
import { JsonStore } from './src/core/store.mjs';
import { ValidationError, validateProduct, validateRfq, validateSupplier } from './src/core/validation.mjs';
import { verifyIndiVeraAudit } from './src/core/audit.mjs';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PUBLIC=path.join(__dirname,'public');
const BODY_LIMIT=256*1024;
const DEMO_MODE=String(process.env.DEMO_MODE??'true').toLowerCase()==='true';
const API_TOKEN=process.env.APP_API_TOKEN||'';
const rateBuckets=new Map();

function securityHeaders(){return{
  'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer',
  'permissions-policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'cross-origin-opener-policy':'same-origin','cross-origin-resource-policy':'same-origin','cache-control':'no-store'
};}
function json(res,status,body,extra={}){res.writeHead(status,{...securityHeaders(),'content-type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(body));}
function clientIp(req){return String(req.headers['cf-connecting-ip']||req.socket.remoteAddress||'unknown').slice(0,120);}
function rateLimit(req,limit=90,windowMs=60_000){const key=`${clientIp(req)}:${new URL(req.url,'http://localhost').pathname}`;const now=Date.now();const bucket=rateBuckets.get(key)||{start:now,count:0};if(now-bucket.start>=windowMs){bucket.start=now;bucket.count=0;}bucket.count+=1;rateBuckets.set(key,bucket);return bucket.count<=limit;}
async function readJson(req){const type=String(req.headers['content-type']||'');if(!type.includes('application/json'))throw new ValidationError('Content-Type must be application/json');let total=0;const chunks=[];for await(const chunk of req){total+=chunk.length;if(total>BODY_LIMIT){const e=new ValidationError('Request body too large');e.status=413;throw e;}chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw new ValidationError('Malformed JSON');}}
function requireWriteAuth(req){if(DEMO_MODE)return;if(!API_TOKEN||API_TOKEN.length<24){const e=new Error('Server write protection is not configured');e.status=503;throw e;}if(String(req.headers.authorization||'')!==`Bearer ${API_TOKEN}`){const e=new Error('Unauthorized');e.status=401;throw e;}const origin=req.headers.origin;if(origin){const parsed=new URL(origin);if(parsed.host!==req.headers.host){const e=new Error('Cross-origin mutation rejected');e.status=403;throw e;}}}
function serveStatic(req,res,pathname){const relative=pathname==='/'?'index.html':pathname.replace(/^\//,'');if(!/^[A-Za-z0-9._/-]+$/.test(relative)||relative.includes('..'))return false;const file=path.join(PUBLIC,relative);if(!file.startsWith(PUBLIC)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return false;const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};res.writeHead(200,{...securityHeaders(),'content-type':types[ext]||'application/octet-stream','cache-control':ext==='.html'?'no-store':'public, max-age=3600'});fs.createReadStream(file).pipe(res);return true;}

export function createIndiVeraRequestHandler({store=new JsonStore()}={}){return async function handler(req,res){const requestId=crypto.randomUUID();try{
  if(!rateLimit(req))return json(res,429,{error:'rate_limited',requestId},{'retry-after':'60'});
  const url=new URL(req.url,'http://localhost');const p=url.pathname;const method=req.method||'GET';
  if(method==='GET'&&p==='/api/indivera/health')return json(res,200,{ok:true,service:'indivera',brand:'IndiVera',modules:['IndiVera Ready','IndiVera Verified','IndiVera Match','IndiVera Passport','IndiVera Trade'],demoMode:DEMO_MODE,requestId});
  if(method==='GET'&&p==='/api/indivera/sources')return json(res,200,{brand:'IndiVera',sources:publicSources(),requestId});
  if(method==='GET'&&p==='/api/indivera/ready/rules')return json(res,200,{module:'IndiVera Ready',rules:getIndiVeraReadyRules(),aiPolicy:INDIVERA_AI_POLICY,requestId});
  if(method==='POST'&&p==='/api/indivera/ready/analyze'){const body=await readJson(req);const analysis=analyzeIndiVeraReady(body);return json(res,200,{...analysis,aiExplanation:explainIndiVeraReady(analysis),requestId});}
  if(method==='POST'&&p==='/api/indivera/verified/documents/extract'){const body=await readJson(req);return json(res,200,{module:'IndiVera Verified',result:extractIndiVeraEvidence(body),requestId});}
  if(method==='GET'&&p==='/api/indivera/verified/suppliers'){const suppliers=store.suppliers();const products=store.products();return json(res,200,{module:'IndiVera Verified',suppliers:suppliers.map((s)=>({...s,verification:assessIndiVeraVerified(s,products)})),requestId});}
  if(method==='POST'&&p==='/api/indivera/verified/suppliers'){requireWriteAuth(req);const supplier=validateSupplier(await readJson(req));const stored=store.upsertSupplier(supplier);return json(res,201,{module:'IndiVera Verified',supplier:{...stored,verification:assessIndiVeraVerified(stored,store.products())},requestId});}
  if(method==='GET'&&p==='/api/indivera/ready/products'){const products=store.products().map((product)=>({...product,readiness:analyzeIndiVeraReady(product)}));return json(res,200,{module:'IndiVera Ready',products,requestId});}
  if(method==='POST'&&p==='/api/indivera/ready/products'){requireWriteAuth(req);const body=await readJson(req);const product=validateProduct(body);const stored=store.upsertProduct({...product,supplierId:String(body.supplierId||'')});return json(res,201,{module:'IndiVera Ready',product:stored,readiness:analyzeIndiVeraReady(stored),requestId});}
  if(method==='POST'&&p==='/api/indivera/match'){const rfq=validateRfq(await readJson(req));return json(res,200,{...runIndiVeraMatch(rfq,store.suppliers(),store.products()),requestId});}
  if(method==='GET'&&p.startsWith('/api/indivera/passport/')){const id=decodeURIComponent(p.slice('/api/indivera/passport/'.length));const product=store.products().find((x)=>x.id===id);if(!product)return json(res,404,{error:'not_found',requestId});return json(res,200,{...buildIndiVeraPassport(product),requestId});}
  if(method==='GET'&&p==='/api/indivera/trade/rfqs')return json(res,200,{module:'IndiVera Trade',rfqs:store.rfqs(),requestId});
  if(method==='POST'&&p==='/api/indivera/trade/rfqs'){requireWriteAuth(req);const rfq=validateRfq(await readJson(req));const stored=store.createRfq(rfq);const matches=runIndiVeraMatch(stored,store.suppliers(),store.products()).results;return json(res,201,{...buildIndiVeraTradeResult(stored,matches),requestId});}
  if(method==='GET'&&p==='/api/indivera/audit'){const audit=store.audit();return json(res,200,{brand:'IndiVera',audit,valid:verifyIndiVeraAudit(audit),requestId});}
  if(method==='GET'||method==='HEAD'){if(serveStatic(req,res,p))return;if(serveStatic(req,res,'/index.html'))return;}
  return json(res,404,{error:'not_found',requestId});
}catch(error){const status=Number(error.status||500);const safe=status>=500?'Internal server error':error.message;if(status>=500)console.error(`[${requestId}]`,error);return json(res,status,{error:error.name||'Error',message:safe,field:error.field||null,requestId});}};}

export function startIndiVeraServer({port=Number(process.env.PORT||8787),store}={}){const server=http.createServer(createIndiVeraRequestHandler({store}));return new Promise((resolve)=>server.listen(port,'127.0.0.1',()=>resolve(server)));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=await startIndiVeraServer();const address=server.address();console.log(`IndiVera listening on http://127.0.0.1:${address.port}`);console.log(`Mode: ${DEMO_MODE?'demo (mutations enabled)':'protected'}`);}

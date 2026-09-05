import { SOURCES } from './sources.mjs';
import { validateProduct } from './validation.mjs';

const INDIVERA_READY_RULES = [
  { id:'TXT-001', title:'Fibre composition available', applies:(p)=>p.composition.length>0||isTextile(p), pass:compositionTotalsValid, severity:'blocker', weight:16, source:SOURCES.textileLabel, kind:'mandatory', message:'Covered textile products need accurate fibre-composition information. “100%/pure/all” should only be used when the product is exclusively one fibre.' },
  { id:'TXT-002', title:'Composition evidence supplied', applies:isTextile, pass:(p)=>p.compositionEvidence, severity:'improvement', weight:7, source:SOURCES.textileLabel, kind:'evidence', message:'The composition claim is stronger when backed by supplier or test evidence.' },
  { id:'GPSR-001', title:'Manufacturer identity and contact details', applies:()=>true, pass:(p)=>Boolean(p.manufacturerName&&p.manufacturerPostalAddress&&p.manufacturerEmail), severity:'blocker', weight:14, source:SOURCES.gpsr, kind:'mandatory', message:'For online/distance sales, manufacturer identity plus postal and electronic contact information must be available.' },
  { id:'GPSR-002', title:'EU responsible person data for non-EU manufacturer', applies:(p)=>!EU_COUNTRIES.has(p.originCountry), pass:(p)=>Boolean(p.euResponsiblePersonName&&p.euResponsiblePersonPostalAddress&&p.euResponsiblePersonEmail), severity:'blocker', weight:16, source:SOURCES.gpsr, kind:'mandatory', message:'Where the manufacturer is outside the EU, GPSR distance-sale information includes an EU responsible person.' },
  { id:'GPSR-003', title:'Product identifier available', applies:()=>true, pass:(p)=>Boolean(p.productIdentifier), severity:'blocker', weight:10, source:SOURCES.gpsr, kind:'mandatory', message:'A listing should allow the product to be identified by picture, type and another identifier.' },
  { id:'GPSR-004', title:'Safety/warning information assessed', applies:()=>true, pass:(p)=>Boolean(p.safetyInformation), severity:'improvement', weight:6, source:SOURCES.gpsr, kind:'mandatory-context', message:'Applicable warnings and safety information must be made available in a language consumers can understand. “No special warnings identified” should still be an explicit reviewed decision.' },
  { id:'REACH-001', title:'REACH evidence package available', applies:()=>true, pass:(p)=>p.reachEvidence, severity:'improvement', weight:8, source:SOURCES.reach, kind:'buyer-evidence', message:'EU importers have REACH obligations. A supplier evidence package helps the importer perform its own assessment; IndiVera does not certify REACH compliance.' },
  { id:'OPS-001', title:'Packaging specification available', applies:()=>true, pass:(p)=>p.packagingSpecification, severity:'improvement', weight:5, source:SOURCES.access2Markets, kind:'buyer-readiness', message:'Structured packaging information reduces buyer and import friction.' },
  { id:'VERA-001', title:'Business identity reviewed', applies:()=>true, pass:(p)=>p.businessVerified, severity:'improvement', weight:7, source:null, kind:'indivera-verified', message:'IndiVera Verified status must reflect an actual evidence review; self-attestation alone never counts as independent verification.' },
  { id:'VERA-002', title:'Quality evidence supplied', applies:()=>true, pass:(p)=>p.qualityEvidence, severity:'improvement', weight:6, source:null, kind:'indivera-verified', message:'Inspection or test evidence is a buyer-trust signal and is kept separate from legal compliance.' },
  { id:'PASS-001', title:'Traceability record ready', applies:isTextile, pass:(p)=>Boolean(p.productIdentifier&&p.productionBatch&&p.manufacturerName), severity:'future', weight:5, source:SOURCES.textileDpp, kind:'indivera-passport', message:'IndiVera Passport collects structured traceability fields now; it is not the final legally mandated textile DPP.' }
];

const EU_COUNTRIES = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']);

function isTextile(p){ return ['table-linen','bed-linen','cushion-cover','fabric','bag','apparel','other-textile'].includes(p.category); }
function compositionTotalsValid(p){ if(!p.composition.length) return false; const total=p.composition.reduce((s,x)=>s+x.percentage,0); return Math.abs(total-100)<=0.01; }
function opportunityScore(p){
  const base={ 'table-linen':91,'bed-linen':82,'cushion-cover':84,fabric:86,bag:75,apparel:72,'other-textile':65 }[p.category]??60;
  const destination={DE:0,NL:-3,AT:-6,FR:-7,BE:-7,IT:-9,ES:-9,SE:-8,DK:-9,FI:-10,IE:-10,PL:-11,CZ:-11}[p.destination]??-12;
  const evidence=[p.compositionEvidence,p.reachEvidence,p.certificateVerified,p.qualityEvidence].filter(Boolean).length*2;
  const moqPenalty=p.moq&&p.moq>500?8:p.moq&&p.moq>250?4:0;
  return Math.max(0,Math.min(100,base+destination+evidence-moqPenalty));
}

export function analyzeIndiVeraReady(rawProduct){
  const product=validateProduct(rawProduct);
  const findings=INDIVERA_READY_RULES.filter((r)=>r.applies(product)).map((rule)=>({
    ruleId:rule.id,title:rule.title,status:rule.pass(product)?'passed':rule.severity,kind:rule.kind,weight:rule.weight,message:rule.message,
    source:rule.source?{id:rule.source.id,authority:rule.source.authority,title:rule.source.title,url:rule.source.url,checked:rule.source.checked}:null
  }));
  const possible=findings.reduce((s,f)=>s+f.weight,0)||1;
  const earned=findings.filter((f)=>f.status==='passed').reduce((s,f)=>s+f.weight,0);
  const score=Math.round(earned/possible*100);
  const blockers=findings.filter((f)=>f.status==='blocker');
  const improvements=findings.filter((f)=>f.status==='improvement');
  const future=findings.filter((f)=>f.status==='future');
  return {
    module:'IndiVera Ready', product, score,
    level:score>=90&&blockers.length===0?'buyer-ready':score>=70?'needs-evidence':'not-ready',
    blockers,improvements,future,passed:findings.filter((f)=>f.status==='passed'),
    market:{destination:product.destination,opportunityScore:opportunityScore(product),basis:'IndiVera decision-support score using seeded category demand, destination and evidence factors; not a sales forecast.',source:{id:SOURCES.cbiDemand.id,url:SOURCES.cbiDemand.url}},
    disclaimer:'IndiVera Ready is decision support only. It does not certify legal compliance and does not replace qualified legal, customs, laboratory or conformity-assessment advice.',
    generatedAt:new Date().toISOString()
  };
}

export function getIndiVeraReadyRules(){ return INDIVERA_READY_RULES.map(({applies,pass,...r})=>({...r,source:r.source?{...r.source}:null})); }

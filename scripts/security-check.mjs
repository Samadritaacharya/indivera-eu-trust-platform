import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['.git', '.runtime', 'node_modules']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p); else if (/\.(mjs|js|json|md|yml|yaml|html|css|example)$/.test(entry.name)) files.push(p);
  }
}
walk(root);
const forbidden = [
  { name: 'eval()', re: /\beval\s*\(/ },
  { name: 'new Function()', re: /new\s+Function\s*\(/ },
  { name: 'dangerous innerHTML assignment', re: /\.innerHTML\s*=/ },
  { name: 'GitHub personal token', re: /ghp_[A-Za-z0-9]{30,}/ },
  { name: 'OpenAI-style secret', re: /sk-[A-Za-z0-9_-]{24,}/ },
  { name: 'private key', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ }
];
const failures = [];
for (const file of files) {
  if (path.relative(root, file) === 'scripts/security-check.mjs') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) if (rule.re.test(text)) failures.push(`${path.relative(root, file)}: ${rule.name}`);
}
if (failures.length) {
  console.error('Security check failed:\n' + failures.join('\n'));
  process.exit(1);
}
console.log(`Security check passed across ${files.length} text/code files.`);

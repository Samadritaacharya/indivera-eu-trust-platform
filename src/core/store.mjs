import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { appendIndiVeraAudit } from './audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RUNTIME = path.join(ROOT, '.runtime');
const DB_FILE = path.join(RUNTIME, 'db.json');
const SEED_FILE = path.join(ROOT, 'data', 'seed.json');

function clone(value) { return structuredClone(value); }

export class JsonStore {
  constructor(file = DB_FILE) {
    this.file = file;
    this.data = null;
  }

  load() {
    if (this.data) return this.data;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (!fs.existsSync(this.file)) fs.copyFileSync(SEED_FILE, this.file);
    this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    this.data.audit ||= [];
    return this.data;
  }

  save() {
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, this.file);
  }

  snapshot() { return clone(this.load()); }
  suppliers() { return clone(this.load().suppliers || []); }
  products() { return clone(this.load().products || []); }
  rfqs() { return clone(this.load().rfqs || []); }
  audit() { return clone(this.load().audit || []); }

  upsertSupplier(supplier) {
    const data = this.load();
    const id = supplier.id || `sup_${crypto.randomUUID().slice(0, 8)}`;
    const next = { ...supplier, id, updatedAt: new Date().toISOString() };
    const index = data.suppliers.findIndex((x) => x.id === id);
    if (index >= 0) data.suppliers[index] = next; else data.suppliers.push(next);
    appendIndiVeraAudit(data.audit, { type: 'supplier.upserted', objectId: id, details: { businessVerified: next.businessVerified } });
    this.save();
    return clone(next);
  }

  upsertProduct(product) {
    const data = this.load();
    const id = product.id || `prd_${crypto.randomUUID().slice(0, 8)}`;
    const next = { ...product, id, updatedAt: new Date().toISOString() };
    const index = data.products.findIndex((x) => x.id === id);
    if (index >= 0) data.products[index] = next; else data.products.push(next);
    appendIndiVeraAudit(data.audit, { type: 'product.upserted', objectId: id, details: { supplierId: next.supplierId, category: next.category } });
    this.save();
    return clone(next);
  }

  createRfq(rfq) {
    const data = this.load();
    const next = { ...rfq, id: `rfq_${crypto.randomUUID().slice(0, 8)}`, createdAt: new Date().toISOString() };
    data.rfqs.push(next);
    appendIndiVeraAudit(data.audit, { type: 'rfq.created', objectId: next.id, details: { category: next.category, destination: next.destination } });
    this.save();
    return clone(next);
  }
}

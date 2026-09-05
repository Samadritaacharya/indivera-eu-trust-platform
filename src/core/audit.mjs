import crypto from 'node:crypto';

export function appendIndiVeraAudit(chain, event) {
  const previousHash = chain.length ? chain[chain.length - 1].hash : 'GENESIS';
  const record = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    type: String(event.type || 'event'),
    actor: String(event.actor || 'anonymous'),
    objectId: String(event.objectId || ''),
    details: event.details && typeof event.details === 'object' ? event.details : {},
    previousHash
  };
  record.hash = crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex');
  chain.push(record);
  return record;
}

export function verifyIndiVeraAudit(chain) {
  let previousHash = 'GENESIS';
  for (const record of chain) {
    const { hash, ...withoutHash } = record;
    if (withoutHash.previousHash !== previousHash) return false;
    const expected = crypto.createHash('sha256').update(JSON.stringify(withoutHash)).digest('hex');
    if (expected !== hash) return false;
    previousHash = hash;
  }
  return true;
}

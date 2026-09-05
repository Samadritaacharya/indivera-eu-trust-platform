import os from 'node:os';
import path from 'node:path';
import { createIndiVeraRequestHandler } from '../server.mjs';
import { JsonStore } from '../src/core/store.mjs';

const runtimeFile = path.join(os.tmpdir(), 'indivera', 'db.json');
const app = createIndiVeraRequestHandler({ store: new JsonStore(runtimeFile) });

export default async function handler(req, res) {
  const parsed = new URL(req.url || '/', 'http://localhost');
  const originalPath = parsed.searchParams.get('__iv_path');
  if (originalPath) {
    parsed.searchParams.delete('__iv_path');
    const query = parsed.searchParams.toString();
    req.url = originalPath + (query ? `?${query}` : '');
  }

  if (req.body !== undefined && req.body !== null) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    req[Symbol.asyncIterator] = async function* () {
      yield Buffer.from(raw);
    };
  }

  return app(req, res);
}

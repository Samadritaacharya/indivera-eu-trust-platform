// Vercel zero-config Node server entrypoint.
// The application logic remains in server.mjs so local development and tests keep one source of truth.
// @ts-nocheck
import http from 'node:http';
import { createIndiVeraRequestHandler } from './server.mjs';

const port = Number(process.env.PORT ?? 3000);
const server = http.createServer(createIndiVeraRequestHandler());
server.listen(port);

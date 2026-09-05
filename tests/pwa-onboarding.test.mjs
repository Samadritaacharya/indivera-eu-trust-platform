import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const loader=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const manifest=JSON.parse(await readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
const sw=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');
const onboarding=await readFile(new URL('../public/onboarding.js',import.meta.url),'utf8');

test('IndiVera is installable without external PWA dependencies',()=>{
  assert.equal(manifest.short_name,'IndiVera');
  assert.equal(manifest.display,'standalone');
  assert.match(loader,/pwa\.js/);
  assert.match(sw,/serviceWorker|CACHE|caches/);
});

test('service worker never caches API responses',()=>{
  assert.match(sw,/startsWith\('\/api\/'\)/);
  assert.match(sw,/req\.method!=='GET'/);
});

test('guided onboarding and public demo feed the real Ready form',()=>{
  assert.match(loader,/onboarding\.js/);
  assert.match(onboarding,/#scanForm/);
  assert.match(onboarding,/requestSubmit/);
  assert.match(onboarding,/Public demo/);
  assert.match(onboarding,/Guided setup/);
});

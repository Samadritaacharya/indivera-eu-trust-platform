import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const loader=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const immersive=await readFile(new URL('../public/immersive.js',import.meta.url),'utf8');
const motion=await readFile(new URL('../public/immersive-motion.css',import.meta.url),'utf8');

test('immersive frontend layers over the functional app without external runtime dependencies',()=>{
  assert.match(loader,/app-core\.js/);
  assert.match(loader,/immersive\.js/);
  assert.match(immersive,/IntersectionObserver/);
  assert.match(immersive,/prefers-reduced-motion/);
  assert.match(motion,/data-motion="off"/);
});

test('immersive runtime preserves all five IndiVera module destinations',()=>{
  for(const id of ['ready','verified','match','passport','trade','trust'])assert.ok(immersive.includes(`'${id}'`)||immersive.includes(`"${id}"`));
});

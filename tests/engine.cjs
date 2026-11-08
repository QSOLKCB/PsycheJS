/* Development-only Node runner. The shipped app has no Node dependency. */
const assert = require('node:assert/strict');
require('../web/model.js');
require('../web/kernel-rom.js');
const {score,run6502,generate,receipt} = require('../web/engine.js');
assert.equal(globalThis.PsycheModel.sentences,71);
assert.match(globalThis.PsycheModel.corpusSha256,/^[0-9a-f]{64}$/);
for (let s=0;s<=8;s++) for (let e=0;e<=8;e++) {
  const reference = Math.min(99,11*s+7*e+(s?35:0));
  assert.equal(score(s,e),reference);
  const cpu=run6502(s,e);assert.equal(cpu.score,reference);assert.equal(cpu.evidence,0);assert(cpu.steps<150);
  if(e>0)assert(score(s,e)>=score(s,e-1));
}
for (const invalid of [-1,9,0.5,NaN,Infinity,'1',null,undefined,true]) {
  assert.throws(()=>score(invalid,0));assert.throws(()=>score(0,invalid));assert.throws(()=>run6502(invalid,0));
}
assert.throws(()=>run6502(0,0,[255]),/Unsupported/);
assert.throws(()=>run6502(0,0,[0xa9]),/outside/);
assert.throws(()=>run6502(0,0,[0xa9,0,0xf0,254]),/budget/);
assert.throws(()=>run6502(0,0,[999]),/Invalid ROM/);
for(let seed=1;seed<=200;seed++) {
  const text=generate(seed);assert.equal(text,generate(seed));assert(text.length>0);assert(text.split(' ').length<=60);
}
assert(new Set(Array.from({length:100},(_,i)=>generate(i+1))).size>10);
assert.throws(()=>generate(0));
const config={a:'Teapot Compiler',b:'Lunar Sandwich',features:[],echoes:8};
const comedy=receipt(config),audit=receipt(config,true);
assert.equal(comedy.theatricalScore,56);assert.equal(comedy.independentEvidenceItems,0);
assert.equal(audit.theatricalScore,comedy.theatricalScore);assert.equal(audit.independentEvidenceItems,0);
assert.equal(audit.languageModel.text,comedy.languageModel.text);assert.equal(audit.mode,'reality-check');
assert.equal(JSON.stringify(receipt(config)),JSON.stringify(comedy));
assert.throws(()=>receipt({...config,features:['A','A']}));
console.log('PASS JS + 6502: all 81 pairs, invalid inputs, malformed ROM, budget guard, 200 replay seeds, receipt controls');

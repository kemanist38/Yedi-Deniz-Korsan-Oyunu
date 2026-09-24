import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const load=async f=>{const c=ts.transpile(readFileSync(new URL(`../src/${f}`,import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});return import(`data:text/javascript;base64,${Buffer.from(c).toString('base64')}`);};
const E=await load('equipment.ts');
const src=readFileSync(new URL('../src/treasure.ts',import.meta.url),'utf8').replace("import {EQUIPMENT} from './equipment';",'const EQUIPMENT=globalThis.__EQ;').replace(/import type[^\n]*\n/,'');
globalThis.__EQ=E.EQUIPMENT;
const T=await import(`data:text/javascript;base64,${Buffer.from(ts.transpile(src,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022})).toString('base64')}`);
test('treasure reward scales with the sea and may carry equipment by rarity odds',()=>{
  const seq=v=>{let i=0;return()=>v[i++%v.length];};
  const none=T.treasureReward(3,69,seq([.9]));assert.equal(none.gold,69*30);assert.equal(none.pearls,20);assert.equal(none.equip,null);
  assert.equal(E.equipById(T.treasureReward(1,27,seq([.01,0])).equip).rarity,2);
  assert.equal(E.equipById(T.treasureReward(1,27,seq([.05,0])).equip).rarity,1);
  assert.equal(E.equipById(T.treasureReward(1,27,seq([.2,0])).equip).rarity,0);
  assert.equal(T.TREASURE_PARTS,4);
});

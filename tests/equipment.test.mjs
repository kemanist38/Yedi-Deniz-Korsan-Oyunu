import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpile(readFileSync(new URL('../src/equipment.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const E=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('four slots × three rarities; common for gold, rare/epic for pearls, stronger with rarity',()=>{
  assert.equal(E.EQUIPMENT.length,12);
  for(const s of E.EQUIP_SLOTS){const items=E.EQUIPMENT.filter(e=>e.slot===s.id).sort((a,b)=>a.rarity-b.rarity);assert.equal(items.length,3);
    assert.equal(items[0].price.currency,'gold');assert.equal(items[1].price.currency,'pearls');assert.equal(items[2].price.currency,'pearls');
    const val=e=>Object.values(e.stats).reduce((a,b)=>a+b,0);assert.ok(val(items[1])>val(items[0])&&val(items[2])>val(items[1]));
    assert.ok(items[2].price.amount>items[1].price.amount);}
});
test('equipped totals add up per stat',()=>{
  const t=E.equipTotals({sail:'sail-2',armor:'armor-1',carriage:'carriage-2',figure:null});
  assert.equal(t.speed,.16);assert.equal(t.hp,.12);assert.equal(t.reload,.14);assert.equal(t.range,40);assert.equal(t.damage,0);
});

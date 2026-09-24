import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const code=ts.transpile(readFileSync(new URL('../src/arsenal.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const A=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('elite levels rise with elite points and cap at 15',()=>{
  assert.equal(A.eliteLevelFromEp(0),1);assert.equal(A.eliteLevelEp(2),1000);
  assert.equal(A.eliteLevelFromEp(999),1);assert.equal(A.eliteLevelFromEp(1000),2);
  for(let l=2;l<=A.ELITE_MAX_LEVEL;l++)assert.ok(A.eliteLevelEp(l)>A.eliteLevelEp(l-1),'thresholds increase');
  assert.equal(A.eliteLevelFromEp(1e9),A.ELITE_MAX_LEVEL);
});
test('only pearl ammo earns elite points, more for pricier balls',()=>{
  const order=['grape','fire','breaker','explosive','leech'];
  for(const k of order){assert.equal(A.AMMO_PRICES[k].currency,'pearls');assert.ok(A.ELITE_POINTS_PER_BALL[k]>0);}
  for(let i=1;i<order.length;i++)assert.ok(A.ELITE_POINTS_PER_BALL[order[i]]>A.ELITE_POINTS_PER_BALL[order[i-1]]);
  assert.equal(A.ELITE_POINTS_PER_BALL.chain,undefined);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const c=ts.transpile(readFileSync(new URL('../src/daily.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const D=await import(`data:text/javascript;base64,${Buffer.from(c).toString('base64')}`);
const day=(y,m,d)=>new Date(y,m-1,d,12);
test('daily calendar: once per day, consecutive days advance, a missed day resets, loops after day 7',()=>{
  let s={last:null,streak:0};
  assert.deepEqual(D.dailyStatus(s,day(2026,9,1)),{day:1,canClaim:true});
  s=D.claimDaily(s,day(2026,9,1));assert.deepEqual(D.dailyStatus(s,day(2026,9,1)),{day:1,canClaim:false});
  assert.equal(D.claimDaily(s,day(2026,9,1)),s,'no double claim');
  s=D.claimDaily(s,day(2026,9,2));assert.equal(s.streak,2);
  assert.equal(D.dailyStatus(s,day(2026,9,4)).day,1,'missed day resets');
  let t={last:'2026-09-30',streak:7};assert.equal(D.dailyStatus(t,day(2026,10,1)).day,1,'after 7 starts over');
  t={last:'2026-09-30',streak:3};assert.equal(D.dailyStatus(t,day(2026,10,1)).day,4,'month boundary counts as consecutive');
});
test('rewards grow with captain level and day 7 is the grand prize',()=>{
  assert.ok(D.dailyReward(1,5).gold>D.dailyReward(1,1).gold);
  const g=D.dailyReward(7,1);assert.equal(g.equip,'common');assert.ok(g.pearls>=50);
});

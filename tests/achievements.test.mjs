import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const c=ts.transpile(readFileSync(new URL('../src/achievements.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const A=await import(`data:text/javascript;base64,${Buffer.from(c).toString('base64')}`);
test('achievements unlock once when their goal is reached and add their bonus',()=>{
  const s={stats:{npc:0,heavy:0,monster:0,boss:0,chest:0,treasure:0,quest:0,eliteBalls:0,level:1,daily:0},unlocked:[]};
  assert.equal(A.unlockReached(s).length,0);
  s.stats.npc=100;s.stats.boss=1;const fresh=A.unlockReached(s).map(d=>d.id);assert.deepEqual(fresh.sort(),['boss-1','npc-100']);
  assert.equal(A.unlockReached(s).length,0,'not twice');
  const b=A.achievementBonus(s);assert.equal(b.gold,.01);assert.equal(b.hp,.01);
  assert.equal(new Set(A.ACHIEVEMENTS.map(d=>d.id)).size,A.ACHIEVEMENTS.length);assert.ok(A.ACHIEVEMENTS.length<=A.BADGE_COLS*A.BADGE_ROWS);
});

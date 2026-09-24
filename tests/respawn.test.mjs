import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source=ts.createSourceFile('main.ts',readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true);
const fn=name=>source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);
// Run the actual projectile loop, including the real respawn function.
const loop=fn('update').body.statements.find(n=>ts.isForStatement(n)&&n.initializer?.getText(source)==='let i=shots.length-1');
assert.ok(loop,'Projectile update loop must be covered');
const code=ts.transpile(`${fn('respawn').getText(source)}\nfunction tick(dt:number){${loop.getText(source)}}`,{target:ts.ScriptTarget.ES2022});
function scenario(count,lethalIndex=count-1){
  const noop=()=>{};
  const c=vm.createContext({Math,shots:Array.from({length:count},(_,i)=>({x:100,y:100,vx:0,vy:0,life:2,owner:'enemy',damage:i===lethalIndex?50:0})),
    player:{x:100,y:100,speed:70},camera:{x:100,y:100},
    state:{hp:17,invulnerable:0,attacking:true,repairing:false},currentMap:'5/2',WORLD_STORAGE:'world',
    localStorage:{setItem:noop},randomSafePlayerPoint:()=>({x:2700,y:500}),effectiveMaxHp:()=>225,
    fleetSafe:{x:100,y:100},collisionNotice:1,destination:{x:150,y:150},routeTarget:{x:150,y:150},
    selected:{},salvoQueue:[{}],enemies:[{x:800,y:800,aggro:true,combatTimer:10}],monsters:[{x:900,y:900,aggro:true,combatTimer:10}],
    bonus:{taken:1},eliteEnabled:()=>false,eliteIncomingFactor:()=>1,abilityActive:()=>false,
    dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),damageText:noop,playHit:noop,burst:noop,
    ui:()=>({classList:{remove:noop}}),mapFade:0,playSplash:noop,saveAccount:noop,toast:noop,
    mapDef:()=>({key:'5/2'}),coordLabel:()=>'',targetExists:()=>false,
    targetExistsOrPlayer:()=>true,shotHeight:()=>0,splashAt:noop,particles:[]});
  vm.runInContext(code,c);return c;
}
for(const [count,index] of [[1,0],[6,5],[6,2]])test(`lethal shot ${index} among ${count}: respawn and next tick do not throw`,()=>{
  const c=scenario(count,index);
  assert.doesNotThrow(()=>vm.runInContext('tick(.016)',c));
  assert.equal(c.currentMap,'5/2');assert.equal(c.state.hp,23);
  assert.equal(c.player.x,2700);assert.equal(c.player.y,500);
  assert.equal(c.camera.x,c.player.x);assert.equal(c.camera.y,c.player.y);
  assert.equal(c.fleetSafe.x,c.player.x);assert.equal(c.fleetSafe.y,c.player.y);
  assert.equal(c.state.repairing,true);assert.equal(c.state.invulnerable,4);
  assert.equal(c.state.attacking,false);assert.equal(c.player.speed,0);
  assert.equal(c.shots.length,0);assert.equal(c.salvoQueue.length,0);
  assert.equal(c.destination,null);assert.equal(c.routeTarget,null);assert.equal(c.selected,null);
  assert.equal(c.enemies[0].aggro,false);assert.equal(c.monsters[0].aggro,false);
  assert.doesNotThrow(()=>vm.runInContext('tick(.016)',c));
});

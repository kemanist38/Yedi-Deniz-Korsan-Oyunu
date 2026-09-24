import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function moduleAt(path){
  const context=vm.createContext({exports:{}});
  vm.runInContext(ts.transpile(readFileSync(new URL(path,import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS}),context);
  return context.exports;
}
const geometry=moduleAt('../src/towerGeometry.ts');
const {TOWER_TYPES}=moduleAt('../src/guild.ts');
const source=ts.createSourceFile('main.ts',readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true);
const update=source.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text==='updateOwnTowers');
const updateCode=ts.transpile(update.getText(source),{target:ts.ScriptTarget.ES2022});

test('tower art is clickable above its foundation, empty sites stay ground-level',()=>{
  const tower={x:200,y:300};
  assert.equal(geometry.towerContains({x:200,y:200},tower),true);
  assert.equal(geometry.towerContains({x:200,y:200},tower,false),false);
  assert.equal(geometry.towerContains({x:200,y:300},tower,false),true);
  assert.equal(geometry.towerContains({x:280,y:200},tower),false);
});

function scene(type){
  const tower={x:200,y:300,type,slot:0,cooldown:0};
  const context=vm.createContext({Math,TOWER_TYPES,hasFleetIsland:()=>true,fleetOwner:()=>'player',
    fleetTower:()=>({range:460,reload:2.2,ownDamage:40}),mapDef:()=>({tier:5}),
    ownTowers:[tower],player:{x:200,y:400},state:{hp:50},effectiveMaxHp:()=>100,
    dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),particles:[],
    enemies:[{x:300,y:400,hp:100}],monsters:[],shots:[],theme:()=>({fleet:'verdant'}),
    towerMuzzle:geometry.towerMuzzle});
  vm.runInContext(updateCode,context);
  return context;
}
for(const type of ['cannon','mortar','chain'])test(`${type} fires from its artwork with the correct effect and cooldown`,()=>{
  const c=scene(type);vm.runInContext('updateOwnTowers(.1)',c);
  assert.equal(c.shots.length,1);
  const shot=c.shots[0],muzzle=geometry.towerMuzzle(c.ownTowers[0],type);
  assert.equal(shot.x,muzzle.x);assert.equal(shot.y,muzzle.y);
  assert.equal(shot.target,c.enemies[0]);
  assert.equal(shot.damage,40*TOWER_TYPES[type].damage);
  assert.equal(shot.splash,type==='mortar'?90:undefined);
  assert.equal(shot.slow,type==='chain'?3:undefined);
  vm.runInContext('updateOwnTowers(.1)',c);assert.equal(c.shots.length,1);
});
test('beacon heals nearby friendly ship without firing',()=>{
  const c=scene('beacon');vm.runInContext('updateOwnTowers(1)',c);
  assert.equal(c.state.hp,53);assert.equal(c.shots.length,0);
  c.player.x=3000;vm.runInContext('updateOwnTowers(1)',c);assert.equal(c.state.hp,53);
});
test('unowned island does not activate player towers',()=>{
  const c=scene('cannon');c.fleetOwner=()=>'npc';
  vm.runInContext('updateOwnTowers(1)',c);assert.equal(c.shots.length,0);
});

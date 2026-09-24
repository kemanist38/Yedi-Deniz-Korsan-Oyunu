import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const campaign=readFileSync(new URL('../src/campaign.ts',import.meta.url),'utf8');
const code=ts.transpile(campaign,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const world=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const {MAPS,MAP_KEYS,WORLD_WIDTH,WORLD_HEIGHT,FLEET,islandLayout,coordLabel,neighbor}=world;

test('6000 × 4000 world retains all coordinate extremes and chart wrapping',()=>{
  assert.equal(WORLD_WIDTH,6000);assert.equal(WORLD_HEIGHT,4000);
  assert.equal(coordLabel({x:0,y:0}),'00AA');
  assert.equal(coordLabel({x:5999,y:3999}),'60CZ');
  assert.equal(neighbor('3/1','west'),'4/2');assert.equal(neighbor('2/1','south'),'8/1');
});
test('all sixteen maps follow the supplied sea names and retain safe maps',()=>{
  const names=['Güvenli Harita','İnciyolu Denizi','Azurya Denizi','Hayalet Denizi','Buzmahzen Denizi','Fırtına Denizi','Karanlık Uçurum Denizi','Alev Denizi'];
  assert.equal(MAP_KEYS.length,16);
  for(const m of Object.values(MAPS)){assert.equal(m.name,names[m.tier-1]);assert.equal(m.safe,m.tier===1);}
});
test('map-specific island layouts are repeatable, separated and inside the rectangular sea',()=>{
  const layouts=new Set();
  for(const m of Object.values(MAPS)){
    assert.deepEqual(m.islands,islandLayout(m.key,m.fleet));assert.ok(m.islands.length>=8);
    layouts.add(JSON.stringify(m.islands.map(i=>[i.x,i.y])));
    for(const i of m.islands){
      assert.ok(i.x-i.r>0&&i.x+i.r<WORLD_WIDTH&&i.y-i.r>0&&i.y+i.r<WORLD_HEIGHT);
      if(m.tier>=5)assert.ok(Math.hypot(i.x-m.fleet.x,i.y-m.fleet.y)>=FLEET.islandR+i.r+400);
      for(const j of m.islands)if(i!==j)assert.ok(Math.hypot(i.x-j.x,i.y-j.y)>=i.r+j.r+230);
    }
  }
  assert.equal(layouts.size,16);
});
test('actual edge detection uses width for east/west and height for north/south',()=>{
  const source=ts.createSourceFile('main.ts',readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true);
  const fn=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='edgeDir');
  const c=vm.createContext({WORLD_WIDTH,WORLD_HEIGHT,EDGE:100,player:{x:3000,y:2000}});
  vm.runInContext(ts.transpile(fn.getText(source)),c);
  for(const [x,y,dir] of [[3000,50,'north'],[3000,3950,'south'],[50,2000,'west'],[5950,2000,'east'],[4000,2000,null]]){
    c.player={x,y};assert.equal(vm.runInContext('edgeDir()',c),dir);
  }
});
test('NPC and monster rewards scale with hitpoints and give only XP and gold',()=>{
  const {NPCS,MONSTERS,XP_PER_HP,GOLD_PER_HP}=world;
  for(const d of [...Object.values(NPCS),...Object.values(MONSTERS)]){
    assert.equal(d.xp,Math.round(d.hp*XP_PER_HP(d.tier)));assert.equal(d.gold,Math.round(d.hp*GOLD_PER_HP));
    assert.ok(!('wood' in d)&&!('pearls' in d),`${d.id} gives only XP and gold`);}
  const heavy=NPCS['n3-1-heavy'],monster=MONSTERS['m3-1'];assert.ok(monster.hp>heavy.hp*2&&monster.hp<heavy.hp*2.5);
  // Seafight ölçeği: 1. deniz NPC canları binlerle başlar (Seafight 1.500–4.000)
  assert.equal(NPCS['n1-1-light'].hp,2500);assert.equal(NPCS['n1-1-heavy'].hp,6000);
});
test('every map has its own boss, summoned by 200 of the map\'s strongest NPC',()=>{
  const {bossFor,BOSS_KILLS,MAP_KEYS:keys,MAPS:maps,NPCS}=world;assert.equal(BOSS_KILLS,200);
  const names=new Set();
  keys.forEach((key,i)=>{const b=bossFor(key),heavy=NPCS[maps[key].npcs[1]];
    assert.equal(b.trigger,heavy.id);assert.equal(b.hp,heavy.hp*30);assert.equal(b.gold,0);
    assert.equal(b.pearls,50*maps[key].tier);assert.ok(b.xp>0);assert.equal(b.portrait,i);names.add(b.name);
    assert.equal(b.sprite,`/assets/boss-${key.replace('/','-')}.webp`);});
  assert.equal(names.size,keys.length,'unique boss names');
});
test('each map offers its own four quests whose rewards grow with the map level',()=>{
  const {QUESTS,MAP_KEYS:keys,MAPS:maps,NPCS}=world;
  for(const key of keys){const qs=QUESTS.filter(q=>q.map===key);assert.equal(qs.length,4);
    const light=qs.find(q=>q.id.endsWith('-light'));assert.deepEqual(light.ids,[maps[key].npcs[0]]);
    assert.equal(light.gold,Math.round(light.required*NPCS[maps[key].npcs[0]].gold*1.5));assert.ok(!('wood' in light));}
  const g=k=>QUESTS.find(q=>q.id===`q${k}-heavy`);
  for(let t=2;t<=8;t++){assert.ok(g(`${t}/1`).gold>g(`${t-1}/1`).gold);assert.ok(g(`${t}/1`).xp>g(`${t-1}/1`).xp);assert.ok(g(`${t}/1`).pearls>g(`${t-1}/1`).pearls);}
});

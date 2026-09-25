// Kullanım: npm run render  → ../../public/assets altına WebP sprite sayfaları yazar,
// preview/ altına deniz zeminli PNG önizlemeler koyar ve çapa noktalarını yazdırır.
import {chromium} from 'playwright';
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../public/assets'),preview=path.join(here,'preview');
fs.mkdirSync(preview,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript'};
const server=http.createServer((q,s)=>{const f=path.join(here,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(here)||!fs.existsSync(f)){s.writeHead(404).end();return;}s.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(s);}).listen(0);
const port=server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();page.on('console',m=>console.log('[studio]',m.text()));page.on('pageerror',e=>{console.error(e);process.exitCode=1;});
await page.goto(`http://localhost:${port}/studio.html`);await page.waitForFunction(()=>window.studioReady);
const only=process.argv.slice(2);
const jobs={
  // Her biyom için 6 farklı profesyonel 3B ada raster atlası ve tematik filo kalesi.

  'enemy-scout-v1':()=>page.evaluate(()=>renderShipSheet('scout')),
  'enemy-raider-v1':()=>page.evaluate(()=>renderShipSheet('raider')),
  'enemy-warship-v1':()=>page.evaluate(()=>renderShipSheet('warship')),
  'leviathan-v1':()=>page.evaluate(()=>renderLeviathan()),
  'loot-chests-v1':()=>page.evaluate(()=>renderChests()),
  'leviathan-storm-v1':()=>page.evaluate(()=>renderLeviathan({look:'storm'})),
  'sea-tile-v1':()=>page.evaluate(()=>renderSeaTile()),
  'vfx-atlas-v1':()=>page.evaluate(()=>renderVfxAtlas()),
  'world-scroll-v1':()=>page.evaluate(()=>renderWorldScroll()),
  'sea-sparkle-v1':()=>page.evaluate(()=>renderSeaSparkle()),
};
const islandThemes=['verdant','misty','coral','haven','crimson','storm','ice','toxic','lava','abyss'];
for(const theme of islandThemes){jobs[`islands-${theme}`]=()=>page.evaluate(t=>renderIslandAtlas(t),theme);jobs[`fleet-base-${theme}`]=()=>page.evaluate(t=>renderFleetFortress(t),theme);}
for(const name of ['ammo-fire','ammo-grape','ammo-explosive','ammo-breaker','ammo-leech','icon-mine','icon-attack','icon-repair','icon-speed','icon-shield','icon-hat','icon-chest','officer-helmsman','officer-carpenter','officer-lookout','officer-quartermaster','officer-surgeon','ui-ring','ui-ring-attack','ui-slot','icon-scroll','icon-gear','icon-anvil','gunner-vignette','icon-market','icon-menu','captain-bust','icon-flag'])jobs[`${name}-v1`]=()=>page.evaluate(n=>renderIcon(n),name);
jobs['equip-atlas-v2']=()=>page.evaluate(()=>renderEquipAtlas());
jobs['icon-powder-v2']=()=>page.evaluate(()=>renderItem('powder'));
jobs['icon-treasure-map-v2']=()=>page.evaluate(()=>renderItem('treasure'));
jobs['icon-inventory-v2']=()=>page.evaluate(()=>renderItem('inventory'));
// Başarım madalyaları (src/achievements.ts ACHIEVEMENTS sırası)
jobs['badge-atlas-v2']=()=>page.evaluate(l=>renderMedalAtlas(l),[['skull',0],['skull',1],['skull',2],['anchor',1],['trident',0],['trident',2],['crown',1],['crown',2],['coin',0],['xmap',0],['xmap',2],['scroll',0],['scroll',2],['flame',1],['star',1],['star',2],['sun',1]]);
jobs['sea-mine-v1']=()=>page.evaluate(()=>renderMineSprite());
const {SHIPS,MONSTERS,BOSSES}=await import('./catalog.js');
for(const b of BOSSES)jobs[b.id]=()=>page.evaluate(id=>renderCatalogShip(id,{frame:224}),b.id);
jobs['boss-portraits-v1']=()=>page.evaluate(ids=>renderPortraitsV2(ids,{cols:8}),BOSSES.map(b=>b.id));
for(const sp of SHIPS)jobs[`ship-${sp.id}`]=()=>page.evaluate(id=>renderCatalogShip(id),sp.id);
for(const m of MONSTERS)jobs[`monster-${m.id}`]=()=>page.evaluate(id=>renderCatalogMonster(id),m.id);
{const src=fs.readFileSync(path.resolve(here,'../../src/campaign.ts'),'utf8');const npcIds=[...src.matchAll(/npc\('(n\d-\d-(?:light|heavy))'/g)].map(m=>m[1]),monIds=[...src.matchAll(/mon\('(m\d-\d)'/g)].map(m=>m[1]);jobs['portraits-v2']=()=>page.evaluate(order=>renderPortraitsV2(order),[...npcIds,...monIds]);}
for(const [name,job] of Object.entries(jobs)){
  if(only.length&&!only.includes(name))continue;
  const t=Date.now(),r=await job();
  fs.writeFileSync(path.join(out,`${name}.webp`),Buffer.from(r.webp.split(',')[1],'base64'));
  fs.writeFileSync(path.join(preview,`${name}.png`),Buffer.from(r.png.split(',')[1],'base64'));
  const {webp,png,...meta}=r;console.log(name,JSON.stringify(meta),`${(fs.statSync(path.join(out,`${name}.webp`)).size/1024).toFixed(0)}KB`,`${Date.now()-t}ms`);
}
await browser.close();server.close();

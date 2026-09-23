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
  'enemy-scout-v1':()=>page.evaluate(()=>renderShipSheet('scout')),
  'enemy-raider-v1':()=>page.evaluate(()=>renderShipSheet('raider')),
  'enemy-warship-v1':()=>page.evaluate(()=>renderShipSheet('warship')),
  'leviathan-v1':()=>page.evaluate(()=>renderLeviathan()),
  'loot-chests-v1':()=>page.evaluate(()=>renderChests()),
  'npc-portraits-v1':()=>page.evaluate(()=>renderPortraits()),
  'enemy-ghost-v1':()=>page.evaluate(()=>renderShipSheet('ghost')),
  'fort-v1':()=>page.evaluate(()=>renderFort()),
  'leviathan-storm-v1':()=>page.evaluate(()=>renderLeviathan({look:'storm'})),
  'portal-v1':()=>page.evaluate(()=>renderPortal()),
  'sea-tile-v1':()=>page.evaluate(()=>renderSeaTile()),
  'world-chart-v1':()=>page.evaluate(()=>renderWorldChart()),
  'sea-sparkle-v1':()=>page.evaluate(()=>renderSeaSparkle()),
  'fleet-towers-built-v1':()=>page.evaluate(()=>renderBuiltTowers()),
};
for(const name of ['ammo-fire','ammo-grape','icon-mine','icon-attack','icon-repair','icon-speed','icon-shield','icon-hat','icon-chest','officer-gunner','officer-helmsman','officer-carpenter','officer-lookout','officer-quartermaster','officer-surgeon','ui-ring','ui-ring-attack','ui-slot','icon-scroll','icon-gear','icon-anvil','gunner-vignette'])jobs[`${name}-v1`]=()=>page.evaluate(n=>renderIcon(n),name);
jobs['sea-mine-v1']=()=>page.evaluate(()=>renderMineSprite());
const {SHIPS,MONSTERS}=await import('./catalog.js');
for(const sp of SHIPS)jobs[`ship-${sp.id}`]=()=>page.evaluate(id=>renderCatalogShip(id),sp.id);
for(const m of MONSTERS)jobs[`monster-${m.id}`]=()=>page.evaluate(id=>renderCatalogMonster(id),m.id);
const {FLEET_THEMES}=await import('./fleet.js');
{const src=fs.readFileSync(path.resolve(here,'../../src/campaign.ts'),'utf8');const npcIds=[...src.matchAll(/npc\('(n\d-\d-(?:light|heavy))'/g)].map(m=>m[1]),monIds=[...src.matchAll(/mon\('(m\d-\d)'/g)].map(m=>m[1]);jobs['portraits-v2']=()=>page.evaluate(order=>renderPortraitsV2(order),[...npcIds,...monIds,'boss']);}
for(const th of Object.keys(FLEET_THEMES)){jobs[`fleet-base-${th}-v2`]=()=>page.evaluate(t=>renderFleetBase(t),th);jobs[`fleet-towers-${th}-v2`]=()=>page.evaluate(t=>renderFleetTowers(t),th);}
for(const [look,a,b] of [['ice',71,72],['toxic',81,82],['lava',91,92],['abyss',101,102],['verdant',11,12],['misty',21,22],['coral',31,32],['haven',41,42],['crimson',51,52],['storm',61,62]])
  jobs[`islands-${look}-v1`]=()=>page.evaluate(([look,a,b])=>renderIslands([[look,a],[look,b]]),[look,a,b]);
for(const [name,job] of Object.entries(jobs)){
  if(only.length&&!only.includes(name))continue;
  const t=Date.now(),r=await job();
  fs.writeFileSync(path.join(out,`${name}.webp`),Buffer.from(r.webp.split(',')[1],'base64'));
  fs.writeFileSync(path.join(preview,`${name}.png`),Buffer.from(r.png.split(',')[1],'base64'));
  const {webp,png,...meta}=r;console.log(name,JSON.stringify(meta),`${(fs.statSync(path.join(out,`${name}.webp`)).size/1024).toFixed(0)}KB`,`${Date.now()-t}ms`);
}
await browser.close();server.close();

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
  'leviathan-storm-v1':()=>page.evaluate(()=>renderLeviathan({look:'storm'})),
  'portal-v1':()=>page.evaluate(()=>renderPortal()),
  'sea-tile-v1':()=>page.evaluate(()=>renderSeaTile()),
  'world-chart-v1':()=>page.evaluate(()=>renderWorldChart()),
};
for(const name of ['ammo-fire','ammo-grape','icon-mine','icon-attack','icon-repair','icon-speed','icon-shield'])jobs[`${name}-v1`]=()=>page.evaluate(n=>renderIcon(n),name);
jobs['sea-mine-v1']=()=>page.evaluate(()=>renderMineSprite());
for(const [look,a,b] of [['verdant',11,12],['misty',21,22],['coral',31,32],['haven',41,42],['crimson',51,52],['storm',61,62]])
  jobs[`islands-${look}-v1`]=()=>page.evaluate(([look,a,b])=>renderIslands([[look,a],[look,b]]),[look,a,b]);
for(const [name,job] of Object.entries(jobs)){
  if(only.length&&!only.includes(name))continue;
  const t=Date.now(),r=await job();
  fs.writeFileSync(path.join(out,`${name}.webp`),Buffer.from(r.webp.split(',')[1],'base64'));
  fs.writeFileSync(path.join(preview,`${name}.png`),Buffer.from(r.png.split(',')[1],'base64'));
  const {webp,png,...meta}=r;console.log(name,JSON.stringify(meta),`${(fs.statSync(path.join(out,`${name}.webp`)).size/1024).toFixed(0)}KB`,`${Date.now()-t}ms`);
}
await browser.close();server.close();

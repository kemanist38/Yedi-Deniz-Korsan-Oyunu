// Kullanım: node sfx.mjs [ad…] → public/assets/sfx/<ad>-<varyant>.mp3 (44,1 kHz stereo, 112 kbps) ve src/sfxManifest.ts
import {chromium} from 'playwright';import {Mp3Encoder} from '@breezystack/lamejs';
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),out=path.join(root,'public/assets/sfx'),preview=path.join(here,'preview/sfx');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(preview,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript'};
const server=http.createServer((q,s)=>{const f=path.join(here,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(here)||!fs.existsSync(f)){s.writeHead(404).end();return;}s.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(s);}).listen(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'});
const page=await browser.newPage();page.on('pageerror',e=>{console.error(e);process.exitCode=1;});page.on('console',m=>console.log('[sfx]',m.text()));
await page.goto(`http://localhost:${server.address().port}/sfx.html`);await page.waitForFunction(()=>window.sfxReady);
const list=await page.evaluate(()=>window.SOUND_LIST),only=process.argv.slice(2);
const i16=b64=>{const buf=Buffer.from(b64,'base64');return new Int16Array(buf.buffer,buf.byteOffset,buf.length/2);};
function wav(l,r,sr){const n=l.length,b=Buffer.alloc(44+n*4);b.write('RIFF',0);b.writeUInt32LE(36+n*4,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*4,40);for(let i=0;i<n;i++){b.writeInt16LE(l[i],44+i*4);b.writeInt16LE(r[i],46+i*4);}return b;}
let total=0;
for(const [name,count] of Object.entries(list)){if(only.length&&!only.includes(name))continue;
  for(let v=0;v<count;v++){const t=Date.now(),res=await page.evaluate(([n,v])=>renderOne(n,v),[name,v]),l=i16(res.l),r=i16(res.r);
    const enc=new Mp3Encoder(2,res.sr,112),chunks=[];for(let i=0;i<l.length;i+=1152){const m=enc.encodeBuffer(l.subarray(i,i+1152),r.subarray(i,i+1152));if(m.length)chunks.push(Buffer.from(m));}chunks.push(Buffer.from(enc.flush()));
    const mp3=Buffer.concat(chunks),file=path.join(out,`${name}-${v}.mp3`);fs.writeFileSync(file,mp3);fs.writeFileSync(path.join(preview,`${name}-${v}.wav`),wav(l,r,res.sr));total+=mp3.length;
    console.log(`${name}-${v}`,(l.length/res.sr).toFixed(2)+'s',(mp3.length/1024).toFixed(0)+'KB',`${Date.now()-t}ms`);}}
fs.writeFileSync(path.join(root,'src/sfxManifest.ts'),`// Otomatik üretildi: tools/asset-studio/sfx.mjs — elle düzenlemeyin.\n// Ses adı → varyant sayısı; dosyalar public/assets/sfx/<ad>-<varyant>.mp3\nexport const SFX_VARIANTS:Record<string,number>=${JSON.stringify(list)};\n`);
console.log('toplam',(total/1024).toFixed(0)+'KB');await browser.close();server.close();

// Kullanım: node music.mjs [tema…] → public/assets/music/boss-<tema>.mp3 (44,1 kHz stereo, 80 kbps, kesintisiz döngü)
import {chromium} from 'playwright';import {Mp3Encoder} from '@breezystack/lamejs';
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../public/assets/music'),preview=path.join(here,'preview/music');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(preview,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript'};
const server=http.createServer((q,s)=>{const f=path.join(here,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(here)||!fs.existsSync(f)){s.writeHead(404).end();return;}s.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(s);}).listen(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'});
const page=await browser.newPage();page.on('pageerror',e=>{console.error(e);process.exitCode=1;});
await page.goto(`http://localhost:${server.address().port}/sfx.html`);await page.waitForFunction(()=>window.sfxReady);
const list=await page.evaluate(()=>window.MUSIC_LIST),only=process.argv.slice(2);
const i16=b64=>{const buf=Buffer.from(b64,'base64');return new Int16Array(buf.buffer,buf.byteOffset,buf.length/2);};
for(const t of list){if(only.length&&!only.includes(t))continue;const s0=Date.now(),res=await page.evaluate(t=>renderMusicOne(t),t),l=i16(res.l),r=i16(res.r);
  const enc=new Mp3Encoder(2,res.sr,80),chunks=[];for(let i=0;i<l.length;i+=1152){const m=enc.encodeBuffer(l.subarray(i,i+1152),r.subarray(i,i+1152));if(m.length)chunks.push(Buffer.from(m));}chunks.push(Buffer.from(enc.flush()));
  const mp3=Buffer.concat(chunks);fs.writeFileSync(path.join(out,`boss-${t}.mp3`),mp3);
  const n=l.length,w=Buffer.alloc(44+n*4);w.write('RIFF',0);w.writeUInt32LE(36+n*4,4);w.write('WAVEfmt ',8);w.writeUInt32LE(16,16);w.writeUInt16LE(1,20);w.writeUInt16LE(2,22);w.writeUInt32LE(res.sr,24);w.writeUInt32LE(res.sr*4,28);w.writeUInt16LE(4,32);w.writeUInt16LE(16,34);w.write('data',36);w.writeUInt32LE(n*4,40);for(let i=0;i<n;i++){w.writeInt16LE(l[i],44+i*4);w.writeInt16LE(r[i],46+i*4);}fs.writeFileSync(path.join(preview,`boss-${t}.wav`),w);
  console.log(`boss-${t}`,res.seconds.toFixed(1)+'s',(mp3.length/1024).toFixed(0)+'KB',`${Date.now()-s0}ms`);}
await browser.close();server.close();

// ffmpeg.wasm çalıştırıcı: node ffrun.cjs in1[,in2..] out -- ffmpeg argümanları (girdiler FS'ye adlarıyla yazılır)
const fs=require('fs'),path=require('path');const of=globalThis.fetch;globalThis.fetch=async(u,...a)=>{const s=String(u);if(s.startsWith('/')||s.startsWith('file:'))return new Response(fs.readFileSync(s.replace('file://','')),{headers:{'content-type':'application/wasm'}});return of(u,...a);};
const {createFFmpeg}=require('@ffmpeg/ffmpeg');
(async()=>{const argv=process.argv.slice(2),sep=argv.indexOf('--'),ins=argv[0].split(','),outs=argv[1].split(','),args=argv.slice(sep+1);
  const ff=createFFmpeg({log:false,logger:({message})=>{if(process.env.V||/Error|error|Invalid/.test(message))console.log(message);}});await ff.load();
  for(const f of ins)ff.FS('writeFile',path.basename(f),fs.readFileSync(f));
  await ff.run(...args);
  for(const o of outs){if(o.includes('%')){for(const f of ff.FS('readdir','.'))if(new RegExp('^'+o.replace(/%0?\d*d/,'\\d+').replace('.','\\.')+'$').test(f))fs.writeFileSync(path.join(process.env.OUT||'.',f),ff.FS('readFile',f));}else fs.writeFileSync(path.join(process.env.OUT||'.',o),ff.FS('readFile',o));}
  process.exit(0);})().catch(e=>{console.error('ERR',e.message);process.exit(1);});

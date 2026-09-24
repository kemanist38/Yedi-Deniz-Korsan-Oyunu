// Envanter sekmesi ikonu: solda depo (sandık), sağda gemi, ortada iki yönlü ok. Kullanım: node inventory-icon.mjs ../../public/assets/icon-inventory-v1.webp
import {chromium} from 'playwright';import fs from 'fs';
const A='/home/user/kara-yelken/public/assets/';
const chest='data:image/webp;base64,'+fs.readFileSync(A+'icon-chest-v1.webp').toString('base64');
const ship='data:image/webp;base64,'+fs.readFileSync(A+'icon-ship-nav-v1.b64','utf8').trim();
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(async({chest,ship})=>{
  const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});const [C,S]=await Promise.all([load(chest),load(ship)]);
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');
  const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,r);};
  // gövde: iki yarım kare
  const pad=14,w=N-pad*2,half=w/2;
  g.save();rr(pad,pad,w,w,26);g.clip();
  let lg=g.createLinearGradient(0,pad,0,pad+w);lg.addColorStop(0,'#6b4323');lg.addColorStop(1,'#2c180c');g.fillStyle=lg;g.fillRect(pad,pad,half,w);
  // tahta çizgileri
  g.strokeStyle='#00000055';g.lineWidth=3;for(let y=pad+24;y<pad+w;y+=30){g.beginPath();g.moveTo(pad,y);g.lineTo(pad+half,y);g.stroke();}
  lg=g.createLinearGradient(0,pad,0,pad+w);lg.addColorStop(0,'#1f6f7a');lg.addColorStop(1,'#0a2e38');g.fillStyle=lg;g.fillRect(pad+half,pad,half,w);
  g.strokeStyle='#bfe9ee33';g.lineWidth=3;for(let y=pad+30;y<pad+w;y+=34){g.beginPath();for(let x=pad+half;x<=pad+w;x+=4)g.lineTo(x,y+Math.sin(x/9)*4);g.stroke();}
  let rg=g.createRadialGradient(N/2,N/2,40,N/2,N/2,170);rg.addColorStop(0,'#0000');rg.addColorStop(1,'#000a');g.fillStyle=rg;g.fillRect(0,0,N,N);
  g.restore();
  // görseller
  const fit=(im,cx,cy,box)=>{const k=box/Math.max(im.width,im.height);g.save();g.shadowColor='#000c';g.shadowBlur=12;g.shadowOffsetY=5;g.drawImage(im,cx-im.width*k/2,cy-im.height*k/2,im.width*k,im.height*k);g.restore();};
  fit(C,pad+half/2,N/2+4,half*0.92);fit(S,pad+half*1.5,N/2+2,half*0.98);
  // orta ayraç ve oklar
  lg=g.createLinearGradient(N/2-6,0,N/2+6,0);lg.addColorStop(0,'#8a5a1e');lg.addColorStop(.5,'#ffe08a');lg.addColorStop(1,'#8a5a1e');g.fillStyle=lg;g.fillRect(N/2-4,pad+4,8,w-8);
  const arrow=(y,dir)=>{g.save();g.translate(N/2,y);g.scale(dir,1);g.beginPath();g.moveTo(-20,-9);g.lineTo(4,-9);g.lineTo(4,-18);g.lineTo(22,0);g.lineTo(4,18);g.lineTo(4,9);g.lineTo(-20,9);g.closePath();
    g.fillStyle='#ffe08a';g.shadowColor='#000';g.shadowBlur=8;g.fill();g.lineWidth=3;g.strokeStyle='#5a3510';g.stroke();g.restore();};
  arrow(pad+34,1);arrow(pad+w-34,-1);
  // altın çerçeve
  g.lineWidth=10;lg=g.createLinearGradient(0,0,N,N);lg.addColorStop(0,'#ffe8a3');lg.addColorStop(.45,'#b07a2c');lg.addColorStop(1,'#f4c86a');g.strokeStyle=lg;rr(pad,pad,w,w,26);g.stroke();
  g.lineWidth=2;g.strokeStyle='#3a220b';rr(pad+6,pad+6,w-12,w-12,20);g.stroke();
  return cv.toDataURL('image/webp',.9);
},{chest,ship});
fs.writeFileSync(process.argv[2],Buffer.from(out.split(',')[1],'base64'));await b.close();

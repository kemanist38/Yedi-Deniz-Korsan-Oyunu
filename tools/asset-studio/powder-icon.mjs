// Kara Barut sarf ikonu: siyah barut fıçısı, önünde barut yığını ve yanan fitil. Kullanım: node powder-icon.mjs ../../public/assets/icon-powder-v1.webp
import {chromium} from 'playwright';import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(()=>{
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');
  g.translate(N/2,N/2);g.scale(.72,.72);g.translate(-N/2-8,-N/2+18);
  // fıçı gövdesi
  const bx=128,by=118,rw=70,rh=84;
  const body=g.createLinearGradient(bx-rw,0,bx+rw,0);body.addColorStop(0,'#2a1a0f');body.addColorStop(.35,'#6b4424');body.addColorStop(.55,'#8a5a30');body.addColorStop(1,'#1e120a');
  g.save();g.shadowColor='#000c';g.shadowBlur=16;g.shadowOffsetY=8;
  g.beginPath();g.moveTo(bx-rw*.86,by-rh);g.bezierCurveTo(bx-rw*1.08,by-rh*.4,bx-rw*1.08,by+rh*.4,bx-rw*.86,by+rh);g.lineTo(bx+rw*.86,by+rh);g.bezierCurveTo(bx+rw*1.08,by+rh*.4,bx+rw*1.08,by-rh*.4,bx+rw*.86,by-rh);g.closePath();g.fillStyle=body;g.fill();g.restore();
  // tahta çıtaları
  g.strokeStyle='#00000066';g.lineWidth=2.5;for(const k of [-.55,-.2,.15,.5]){g.beginPath();g.moveTo(bx+rw*k*.95,by-rh);g.quadraticCurveTo(bx+rw*k*1.18,by,bx+rw*k*.95,by+rh);g.stroke();}
  // demir çemberler
  const hoop=(y,w)=>{const hg=g.createLinearGradient(bx-rw,0,bx+rw,0);hg.addColorStop(0,'#2b2b2b');hg.addColorStop(.45,'#9a9a92');hg.addColorStop(.6,'#c9c6b8');hg.addColorStop(1,'#222');g.fillStyle=hg;g.beginPath();g.ellipse(bx,y,w,9,0,0,Math.PI*2);g.fill();g.fillStyle='#00000055';g.beginPath();g.ellipse(bx,y+4,w,5,0,0,Math.PI);g.fill();};
  hoop(by-rh*.72,rw*.97);hoop(by+rh*.72,rw*.97);
  // üst kapak
  const lid=g.createRadialGradient(bx-10,by-rh-4,4,bx,by-rh,rw);lid.addColorStop(0,'#7a5431');lid.addColorStop(1,'#2e1c0f');g.fillStyle=lid;g.beginPath();g.ellipse(bx,by-rh,rw*.86,16,0,0,Math.PI*2);g.fill();g.strokeStyle='#15100a';g.lineWidth=3;g.stroke();
  // kafatası etiketi
  g.fillStyle='#e9dfc6';g.beginPath();g.arc(bx,by-4,19,Math.PI,0);g.lineTo(bx+13,by+14);g.lineTo(bx-13,by+14);g.closePath();g.fill();
  g.fillStyle='#1b120b';g.beginPath();g.arc(bx-7,by-3,5.5,0,Math.PI*2);g.arc(bx+7,by-3,5.5,0,Math.PI*2);g.fill();g.fillRect(bx-1.5,by+5,3,6);
  g.strokeStyle='#e9dfc6';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(bx-26,by+22);g.lineTo(bx+26,by+34);g.moveTo(bx+26,by+22);g.lineTo(bx-26,by+34);g.stroke();
  // barut yığını
  const pile=g.createRadialGradient(bx+6,by+rh+6,4,bx,by+rh+14,90);pile.addColorStop(0,'#3a3a3a');pile.addColorStop(.6,'#141414');pile.addColorStop(1,'#050505');
  g.fillStyle=pile;g.beginPath();g.moveTo(bx-96,by+rh+30);g.quadraticCurveTo(bx-40,by+rh-18,bx+6,by+rh-6);g.quadraticCurveTo(bx+60,by+rh-14,bx+100,by+rh+30);g.closePath();g.fill();
  for(let i=0;i<120;i++){const a=Math.random()*Math.PI,r=Math.random();g.fillStyle=Math.random()<.5?'#5a5a5a':'#222';g.fillRect(bx+Math.cos(a)*r*92,by+rh+22-Math.sin(a)*r*30,2,2);}
  // fitil ve kıvılcım
  g.strokeStyle='#c9b27a';g.lineWidth=4;g.beginPath();g.moveTo(bx+30,by-rh-6);g.bezierCurveTo(bx+60,by-rh-40,bx+44,by-rh-58,bx+78,by-rh-70);g.stroke();
  const fx=bx+80,fy=by-rh-72,sp=g.createRadialGradient(fx,fy,0,fx,fy,30);sp.addColorStop(0,'#fffbe0');sp.addColorStop(.25,'#ffd24a');sp.addColorStop(.6,'#ff6a1a88');sp.addColorStop(1,'#ff3a0000');
  g.fillStyle=sp;g.beginPath();g.arc(fx,fy,30,0,Math.PI*2);g.fill();
  g.strokeStyle='#ffe38a';g.lineWidth=2;for(let i=0;i<9;i++){const a=i/9*Math.PI*2,l=14+Math.random()*12;g.beginPath();g.moveTo(fx+Math.cos(a)*6,fy+Math.sin(a)*6);g.lineTo(fx+Math.cos(a)*l,fy+Math.sin(a)*l);g.stroke();}
  return cv.toDataURL('image/webp',.9);
});
fs.writeFileSync(process.argv[2],Buffer.from(out.split(',')[1],'base64'));await b.close();

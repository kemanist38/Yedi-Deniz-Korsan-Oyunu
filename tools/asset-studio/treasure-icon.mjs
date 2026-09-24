// Hazine haritası ikonu: kıvrık parşömen, kesikli rota, kırmızı X ve pusula gülü. Kullanım: node treasure-icon.mjs ../../public/assets/icon-treasure-map-v1.webp
import {chromium} from 'playwright';import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(()=>{
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');
  g.save();g.shadowColor='#000c';g.shadowBlur=14;g.shadowOffsetY=6;
  g.beginPath();g.moveTo(40,52);g.bezierCurveTo(90,36,150,62,214,44);g.lineTo(222,196);g.bezierCurveTo(160,214,100,188,34,206);g.closePath();
  const pg=g.createLinearGradient(30,40,230,210);pg.addColorStop(0,'#f3e0b0');pg.addColorStop(.5,'#e2c68a');pg.addColorStop(1,'#c9a060');g.fillStyle=pg;g.fill();g.restore();
  g.save();g.clip();for(let i=0;i<900;i++){g.fillStyle=`rgba(120,80,30,${Math.random()*.08})`;g.fillRect(30+Math.random()*196,40+Math.random()*170,2,2);}
  const vg=g.createRadialGradient(128,128,40,128,128,150);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#5a3a1466');g.fillStyle=vg;g.fillRect(0,0,N,N);g.restore();
  g.strokeStyle='#8a5a2a';g.lineWidth=3;g.beginPath();g.moveTo(40,52);g.bezierCurveTo(90,36,150,62,214,44);g.lineTo(222,196);g.bezierCurveTo(160,214,100,188,34,206);g.closePath();g.stroke();
  // rulolar
  for(const [x,y] of [[40,52],[34,206]]){g.fillStyle='#b88a4a';g.beginPath();g.ellipse(x,y-2,10,26,0,0,7);g.fill();g.strokeStyle='#6a4420';g.stroke();}
  // ada kıyısı
  g.fillStyle='#a8c07a';g.beginPath();g.moveTo(140,90);g.bezierCurveTo(180,70,206,110,190,140);g.bezierCurveTo(176,172,130,168,128,136);g.bezierCurveTo(126,112,120,100,140,90);g.fill();g.strokeStyle='#6a7a3a';g.lineWidth=2;g.stroke();
  // rota
  g.setLineDash([7,7]);g.strokeStyle='#7a2a14';g.lineWidth=4;g.beginPath();g.moveTo(62,176);g.bezierCurveTo(90,120,110,160,150,124);g.stroke();g.setLineDash([]);
  // X
  g.strokeStyle='#c0291a';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(144,110);g.lineTo(170,136);g.moveTo(170,110);g.lineTo(144,136);g.stroke();
  // pusula gülü
  g.save();g.translate(78,92);g.fillStyle='#5a3a1a';for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,-26);g.lineTo(6,0);g.lineTo(-6,0);g.closePath();g.fill();}
  g.fillStyle='#c0291a';g.beginPath();g.moveTo(0,-26);g.lineTo(6,0);g.lineTo(-6,0);g.closePath();g.fill();g.fillStyle='#e2c68a';g.beginPath();g.arc(0,0,4,0,7);g.fill();g.restore();
  return cv.toDataURL('image/webp',.9);});
fs.writeFileSync(process.argv[2],Buffer.from(out.split(',')[1],'base64'));await b.close();

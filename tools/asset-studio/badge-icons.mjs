// Başarım madalyaları atlası: 17 madalya (6 sütun × 3 satır, 128 px). Metal: bronz/gümüş/altın (zorluk), ortada kategori amblemi.
// Sıra src/achievements.ts ACHIEVEMENTS ile aynıdır. Kullanım: node badge-icons.mjs ../../public/assets/badge-atlas-v1.webp
import {chromium} from 'playwright';import fs from 'fs';
const LIST=[['skull',0],['skull',1],['skull',2],['anchor',1],['trident',0],['trident',2],['crown',1],['crown',2],['coin',0],['xmap',0],['xmap',2],['scroll',0],['scroll',2],['flame',1],['star',1],['star',2],['sun',1]];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(LIST=>{
  const C=128,cols=6,cv=document.createElement('canvas');cv.width=C*cols;cv.height=C*3;const g=cv.getContext('2d');
  const METAL=[['#f0b27a','#a0582a','#5a2a10'],['#f4f6f8','#a8b0b8','#4a525a'],['#ffe9a0','#d4a13a','#6a4a10']];
  const E={
    skull:(c)=>{g.fillStyle=c;g.beginPath();g.arc(0,-6,18,0,7);g.fill();g.fillRect(-10,6,20,10);g.fillStyle='#0008';g.beginPath();g.arc(-7,-6,5,0,7);g.arc(7,-6,5,0,7);g.fill();g.strokeStyle=c;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-24,14);g.lineTo(24,28);g.moveTo(24,14);g.lineTo(-24,28);g.stroke();},
    anchor:(c)=>{g.strokeStyle=c;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-24);g.lineTo(0,24);g.moveTo(-14,-12);g.lineTo(14,-12);g.stroke();g.beginPath();g.arc(0,6,20,.2,Math.PI-.2);g.stroke();g.beginPath();g.arc(0,-28,5,0,7);g.stroke();},
    trident:(c)=>{g.strokeStyle=c;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-26);g.lineTo(0,28);g.moveTo(-16,-24);g.lineTo(-16,-6);g.quadraticCurveTo(0,6,16,-6);g.lineTo(16,-24);g.stroke();},
    crown:(c)=>{g.fillStyle=c;g.beginPath();g.moveTo(-24,16);g.lineTo(-24,-14);g.lineTo(-12,0);g.lineTo(0,-22);g.lineTo(12,0);g.lineTo(24,-14);g.lineTo(24,16);g.closePath();g.fill();g.fillRect(-24,19,48,6);},
    coin:(c)=>{g.fillStyle=c;for(const [x,y] of [[-8,8],[8,8],[0,-6]]){g.beginPath();g.ellipse(x,y,14,9,0,0,7);g.fill();g.strokeStyle='#0005';g.lineWidth=2;g.stroke();}},
    xmap:(c)=>{g.fillStyle=c;g.fillRect(-22,-18,44,36);g.strokeStyle='#8a1a10';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-8,-8);g.lineTo(8,8);g.moveTo(8,-8);g.lineTo(-8,8);g.stroke();},
    scroll:(c)=>{g.fillStyle=c;g.fillRect(-16,-22,32,44);g.beginPath();g.ellipse(0,-22,18,5,0,0,7);g.ellipse(0,22,18,5,0,0,7);g.fill();g.strokeStyle='#0006';g.lineWidth=2;for(let y=-12;y<16;y+=8){g.beginPath();g.moveTo(-10,y);g.lineTo(10,y);g.stroke();}},
    flame:(c)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,-28);g.bezierCurveTo(22,-4,18,24,0,26);g.bezierCurveTo(-18,24,-22,0,-6,-12);g.bezierCurveTo(-4,0,2,2,2,-6);g.bezierCurveTo(2,-16,-2,-22,0,-28);g.fill();},
    star:(c)=>{g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const r=i%2?11:26,a=-Math.PI/2+i*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();},
    sun:(c)=>{g.fillStyle=c;for(let i=0;i<12;i++){g.save();g.rotate(i*Math.PI/6);g.beginPath();g.moveTo(0,-28);g.lineTo(5,-14);g.lineTo(-5,-14);g.closePath();g.fill();g.restore();}g.beginPath();g.arc(0,0,13,0,7);g.fill();},
  };
  LIST.forEach(([em,m],i)=>{const x=(i%cols)*C+64,y=Math.floor(i/cols)*C+64,M=METAL[m];g.save();g.translate(x,y);
    // kurdele
    g.fillStyle=['#8a1a1a','#1a3a8a','#6a1a8a'][m];g.beginPath();g.moveTo(-22,20);g.lineTo(-34,58);g.lineTo(-20,50);g.lineTo(-10,62);g.lineTo(-4,24);g.fill();g.beginPath();g.moveTo(22,20);g.lineTo(34,58);g.lineTo(20,50);g.lineTo(10,62);g.lineTo(4,24);g.fill();
    g.shadowColor='#000b';g.shadowBlur=8;g.shadowOffsetY=3;
    const rg=g.createRadialGradient(-12,-14,4,0,0,46);rg.addColorStop(0,M[0]);rg.addColorStop(.6,M[1]);rg.addColorStop(1,M[2]);g.fillStyle=rg;g.beginPath();
    for(let k=0;k<24;k++){const r=k%2?44:48,a=k/24*Math.PI*2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.shadowColor='transparent';
    g.fillStyle=M[2];g.beginPath();g.arc(0,0,36,0,7);g.fill();const ig=g.createRadialGradient(-8,-10,2,0,0,34);ig.addColorStop(0,M[1]);ig.addColorStop(1,M[2]);g.fillStyle=ig;g.beginPath();g.arc(0,0,33,0,7);g.fill();
    E[em](M[0]);g.restore();});
  return cv.toDataURL('image/webp',.9);},LIST);
fs.writeFileSync(process.argv[2],Buffer.from(out.split(',')[1],'base64'));await b.close();

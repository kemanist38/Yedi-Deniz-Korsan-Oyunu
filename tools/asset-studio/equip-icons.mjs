// Donanım ikonları atlası: 4 sütun (yelken, pruva heykeli, gövde zırhı, top kundağı) × 3 satır (sıradan, nadir, destansı), 128 px kare.
// Kullanım: node equip-icons.mjs ../../public/assets/equip-atlas-v1.webp
import {chromium} from 'playwright';import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(()=>{
  const C=128,cv=document.createElement('canvas');cv.width=C*4;cv.height=C*3;const g=cv.getContext('2d');
  const RAR=[{glow:'#9aa4a8',ring:'#6b7478'},{glow:'#4fa8ff',ring:'#2f6fb8'},{glow:'#d08cff',ring:'#f1c662'}];
  const lin=(x0,y0,x1,y1,stops)=>{const l=g.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>l.addColorStop(o,c));return l;};
  const shade=()=>{g.shadowColor='#000c';g.shadowBlur=8;g.shadowOffsetY=4;};
  const plain=()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;};
  function backdrop(r){const R=RAR[r],rg=g.createRadialGradient(64,64,6,64,64,64);rg.addColorStop(0,R.glow+'66');rg.addColorStop(.7,R.glow+'18');rg.addColorStop(1,R.glow+'00');g.fillStyle=rg;g.fillRect(0,0,C,C);
    if(r===2){g.strokeStyle=R.ring+'aa';g.lineWidth=2;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.beginPath();g.moveTo(64+Math.cos(a)*50,64+Math.sin(a)*50);g.lineTo(64+Math.cos(a)*60,64+Math.sin(a)*60);g.stroke();}}}
  // ---- yelken
  function sail(r){const cloth=[['#efe2c0','#c9b48a'],['#f7f9ff','#b9cde6'],['#3a3f52','#1c2030']][r],trim=['#8a6a44','#e0b24e','#f1c662'][r];
    shade();g.fillStyle=lin(0,0,0,128,[[0,'#6a4a2c'],[1,'#3a2616']]);g.fillRect(61,10,7,110);g.fillRect(26,22,76,6);g.fillRect(30,94,68,5);plain();
    g.beginPath();g.moveTo(28,28);g.quadraticCurveTo(64,40,100,28);g.quadraticCurveTo(110,62,98,94);g.quadraticCurveTo(64,104,30,94);g.quadraticCurveTo(18,62,28,28);g.closePath();
    shade();g.fillStyle=lin(20,0,108,0,[[0,cloth[1]],[.45,cloth[0]],[1,cloth[1]]]);g.fill();plain();g.lineWidth=3;g.strokeStyle=trim;g.stroke();
    g.strokeStyle='#00000022';g.lineWidth=1.5;for(const x of [46,64,82]){g.beginPath();g.moveTo(x,31);g.quadraticCurveTo(x+(x-64)*.2,62,x,98);g.stroke();}
    if(r===1){g.fillStyle='#e0b24e';g.beginPath();g.arc(64,62,11,0,7);g.fill();g.fillStyle='#b9cde6';g.beginPath();g.arc(64,62,6,0,7);g.fill();}
    if(r===2){g.fillStyle='#ffe07a';g.beginPath();g.moveTo(70,40);g.lineTo(54,66);g.lineTo(65,66);g.lineTo(58,88);g.lineTo(78,58);g.lineTo(67,58);g.closePath();g.fill();g.shadowColor='#ffe07a';g.shadowBlur=12;g.fill();plain();}
    g.fillStyle=trim;g.beginPath();g.moveTo(64,6);g.lineTo(76,10);g.lineTo(64,14);g.fill();}
  // ---- pruva heykeli
  function figure(r){const mat=[['#8a5a32','#4a2e18'],['#d69a4a','#7a4a1a'],['#ffe08a','#b8862f']][r];
    shade();g.fillStyle=lin(0,30,0,120,[[0,'#6a4424'],[1,'#2e1c0e']]);g.beginPath();g.moveTo(18,118);g.quadraticCurveTo(30,70,70,58);g.lineTo(84,70);g.quadraticCurveTo(52,84,40,120);g.closePath();g.fill();plain();
    const body=lin(40,20,100,100,[[0,mat[0]],[1,mat[1]]]);g.fillStyle=body;shade();
    g.beginPath();g.moveTo(58,98);g.quadraticCurveTo(62,72,74,64);g.quadraticCurveTo(92,60,92,44);g.quadraticCurveTo(92,20,70,20);g.quadraticCurveTo(50,22,52,44);g.quadraticCurveTo(54,58,62,62);g.quadraticCurveTo(50,76,46,100);g.closePath();g.fill();plain();
    g.fillStyle=mat[1];g.beginPath();g.arc(80,38,3,0,7);g.fill();
    if(r===0){g.strokeStyle='#3a2210';g.lineWidth=3;for(let i=0;i<4;i++){g.beginPath();g.moveTo(58+i*3,24+i*2);g.quadraticCurveTo(44,50,52+i*4,72);g.stroke();}}
    if(r===1){g.fillStyle='#7a4a1a';for(let i=0;i<10;i++){const a=Math.PI*.6+i/9*Math.PI*.9;g.beginPath();g.ellipse(70+Math.cos(a)*22,40+Math.sin(a)*22,8,5,a,0,7);g.fill();}g.fillStyle=body;g.beginPath();g.arc(72,40,16,0,7);g.fill();g.fillStyle='#3a2210';g.beginPath();g.arc(80,38,2.6,0,7);g.fill();}
    if(r===2){g.strokeStyle='#b8862f';g.lineWidth=5;g.lineCap='round';for(let i=0;i<5;i++){g.beginPath();g.moveTo(62+i*6,56);g.bezierCurveTo(58+i*8,80,76+i*6,86,70+i*9,104);g.stroke();}
      g.fillStyle='#6dffc4';g.shadowColor='#6dffc4';g.shadowBlur=10;g.beginPath();g.arc(80,38,3.5,0,7);g.fill();plain();}}
  // ---- gövde zırhı
  function armor(r){g.save();g.beginPath();g.moveTo(64,14);g.lineTo(106,28);g.quadraticCurveTo(106,86,64,116);g.quadraticCurveTo(22,86,22,28);g.closePath();shade();
    g.fillStyle=[lin(0,0,128,128,[[0,'#8a5e36'],[1,'#4a2e18']]),lin(0,0,128,128,[[0,'#f0a060'],[.5,'#b8622e'],[1,'#6a3416']]),lin(0,0,128,128,[[0,'#4fd68a'],[1,'#1a5a36']])][r];g.fill();plain();g.clip();
    if(r===0){g.strokeStyle='#2e1c0e';g.lineWidth=2;for(let y=30;y<116;y+=14){g.beginPath();g.moveTo(20,y);g.lineTo(108,y);g.stroke();}}
    if(r===1){g.fillStyle='#ffd0a0';for(let y=30;y<110;y+=18)for(let x=34;x<100;x+=16){g.beginPath();g.arc(x+((y/18)%2)*8,y,2.2,0,7);g.fill();}g.fillStyle='#ffffff30';g.fillRect(20,14,30,110);}
    if(r===2){for(let y=18;y<120;y+=12)for(let x=16;x<112;x+=14){const xx=x+((y/12)%2)*7;g.fillStyle=lin(xx,y,xx,y+12,[[0,'#8affb8'],[1,'#12482a']]);g.beginPath();g.moveTo(xx-7,y);g.quadraticCurveTo(xx,y+16,xx+7,y);g.closePath();g.fill();}}
    g.restore();g.lineWidth=4;g.strokeStyle=['#c9a36a','#ffd0a0','#f1c662'][r];g.beginPath();g.moveTo(64,14);g.lineTo(106,28);g.quadraticCurveTo(106,86,64,116);g.quadraticCurveTo(22,86,22,28);g.closePath();g.stroke();}
  // ---- top kundağı
  function carriage(r){const metal=[['#6a6e72','#2a2c2e'],['#a8c0d8','#3a4a5e'],['#ffe08a','#8a5a1a']][r];
    shade();g.fillStyle=lin(0,60,0,110,[[0,'#7a5230'],[1,'#3a2414']]);g.beginPath();g.moveTo(22,98);g.lineTo(34,66);g.lineTo(92,66);g.lineTo(106,98);g.closePath();g.fill();
    for(const x of [38,90]){g.fillStyle='#3a2414';g.beginPath();g.arc(x,100,14,0,7);g.fill();g.strokeStyle=r===2?'#f1c662':'#1a0f08';g.lineWidth=3;g.stroke();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.beginPath();g.moveTo(x,100);g.lineTo(x+Math.cos(a)*12,100+Math.sin(a)*12);g.stroke();}}
    g.fillStyle=lin(0,40,0,70,[[0,metal[0]],[1,metal[1]]]);g.beginPath();g.moveTo(26,52);g.lineTo(104,40);g.quadraticCurveTo(112,48,104,58);g.lineTo(26,70);g.quadraticCurveTo(18,61,26,52);g.fill();plain();
    g.fillStyle=metal[1];g.beginPath();g.ellipse(106,49,5,9,-.15,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(107,49,3,6,-.15,0,7);g.fill();
    g.strokeStyle=metal[0];g.lineWidth=3;for(const x of [44,66,86]){g.beginPath();g.moveTo(x,68-(x-26)*.15);g.lineTo(x,50-(x-26)*.15);g.stroke();}
    if(r===2){g.strokeStyle='#f1c662';g.lineWidth=4;g.beginPath();g.ellipse(64,112,34,8,0,0,7);g.stroke();}}
  const draw=[sail,figure,armor,carriage];
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){g.save();g.translate(c*C,r*C);backdrop(r);draw[c](r);g.restore();}
  return cv.toDataURL('image/webp',.9);
});
fs.writeFileSync(process.argv[2],Buffer.from(out.split(',')[1],'base64'));await b.close();

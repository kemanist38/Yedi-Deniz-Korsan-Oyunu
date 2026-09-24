// Yedi Deniz Korsan Oyunu — atış ve savaş efektleri atlası (raster). 8 sütun × 5 satır, kare 128 px.
// Sıra src/vfx.ts içindeki VFX sabitleriyle aynı tutulmalıdır.
// satır 0: demir gülle, ateş güllesi, saçma tanesi, zincirli gülle, düşman güllesi, gölge, hedef halkası, namlu alevi
// satır 1: patlama (8 kare)   satır 2: su sütunu (8 kare)
// satır 3: duman ×4, kıymık ×3, kor   satır 4: köpük ×2, kabarcık, alev puf, canavar tükürüğü, enkaz tahtası, kıvılcım yıldızı, zehir puf
// satır 5: patlayıcı bomba, kule kırıcı mermi (sağa bakar), can emici gülle, ruh ışığı, şok dalgası halkası
import {canvas,rng,noise2} from './textures.js';

const C=128,COLS=8,ROWS=6,TAU=Math.PI*2;
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(a,b,t)=>a.map((v,i)=>Math.round(lerp(v,b[i],t)));
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;

function blob(x,cx,cy,r,inner,outer,a=1){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,rgba(inner,a));g.addColorStop(1,rgba(outer,0));x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();}

// Dövme demir küre: sol üstten ışık, kenar gölgesi, çekiç izleri, sıcak kenar yansıması
function ironBall(x,cx,cy,r,{tint=[0,0,0],hot=0,seed=1}={}){
  const R=rng(seed);
  const g=x.createRadialGradient(cx-r*.38,cy-r*.42,r*.08,cx,cy,r);
  g.addColorStop(0,rgba(mix([196,192,182],tint,.25),1));g.addColorStop(.35,rgba(mix([92,90,88],tint,.35),1));g.addColorStop(.8,rgba(mix([34,33,34],tint,.3),1));g.addColorStop(1,rgba([12,12,14],1));
  x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();
  x.save();x.beginPath();x.arc(cx,cy,r,0,TAU);x.clip();
  for(let i=0;i<26;i++){const a=R()*TAU,d=R()*r*.9,px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d;blob(x,px,py,r*(.08+R()*.12),R()<.5?[0,0,0]:[220,215,205],[0,0,0],.18);}
  // alttan sıcak deniz yansıması
  const rim=x.createLinearGradient(cx,cy+r*.3,cx,cy+r);rim.addColorStop(0,'rgba(80,190,190,0)');rim.addColorStop(1,'rgba(80,190,190,.28)');x.fillStyle=rim;x.fillRect(cx-r,cy,r*2,r);
  if(hot){const h=x.createRadialGradient(cx,cy,r*.2,cx,cy,r);h.addColorStop(0,`rgba(255,120,40,${.55*hot})`);h.addColorStop(1,'rgba(255,60,20,0)');x.fillStyle=h;x.fillRect(cx-r,cy-r,r*2,r*2);}
  x.restore();
  blob(x,cx-r*.35,cy-r*.4,r*.28,[255,252,240],[255,252,240],.75);
}
function fireBall(x,cx,cy,r){
  blob(x,cx,cy,r*2.3,[255,150,40],[255,60,10],.55);blob(x,cx,cy,r*1.5,[255,210,90],[255,90,20],.7);
  ironBall(x,cx,cy,r,{tint:[120,40,10],hot:1,seed:7});
  // kor çatlakları
  const R=rng(9);x.save();x.beginPath();x.arc(cx,cy,r,0,TAU);x.clip();x.lineCap='round';
  for(let i=0;i<9;i++){let px=cx+(R()-.5)*r*1.6,py=cy+(R()-.5)*r*1.6;x.strokeStyle=`rgba(255,${170+R()*70|0},60,.9)`;x.lineWidth=1.2+R()*1.8;x.beginPath();x.moveTo(px,py);for(let k=0;k<3;k++){px+=(R()-.5)*r*.7;py+=(R()-.5)*r*.7;x.lineTo(px,py);}x.stroke();}
  x.restore();blob(x,cx,cy,r*.6,[255,250,210],[255,200,80],.45);
}
function chainShot(x,cx,cy){
  const d=32;x.lineCap='round';
  for(let k=-3;k<=3;k++){const px=cx+k*8.2,py=cy+Math.sin(k*.9)*3;x.save();x.translate(px,py);x.rotate(k%2?0:Math.PI/2*.0);
    x.strokeStyle='#1a1a1c';x.lineWidth=5;x.beginPath();x.ellipse(0,0,k%2?5.5:5.5,k%2?2.8:4.2,0,0,TAU);x.stroke();
    x.strokeStyle='#9a968c';x.lineWidth=2;x.beginPath();x.ellipse(0,0,k%2?5.5:5.5,k%2?2.8:4.2,0,Math.PI*1.1,Math.PI*1.9);x.stroke();x.restore();}
  ironBall(x,cx-d,cy,15,{seed:3});ironBall(x,cx+d,cy,15,{seed:4});
}
function shadow(x,cx,cy){const g=x.createRadialGradient(cx,cy,0,cx,cy,34);g.addColorStop(0,'rgba(0,12,16,.55)');g.addColorStop(.6,'rgba(0,12,16,.25)');g.addColorStop(1,'rgba(0,12,16,0)');x.save();x.translate(cx,cy);x.scale(1,.55);x.translate(-cx,-cy);x.fillStyle=g;x.beginPath();x.arc(cx,cy,34,0,TAU);x.fill();x.restore();}
function targetRing(x,cx,cy){
  x.save();x.translate(cx,cy);x.scale(1,.6);
  blob(x,0,0,58,[255,90,40],[255,60,20],.18);
  x.strokeStyle='rgba(255,120,60,.95)';x.lineWidth=4;for(let k=0;k<8;k++){x.beginPath();x.arc(0,0,48,k/8*TAU+.08,(k+1)/8*TAU-.08);x.stroke();}
  x.strokeStyle='rgba(255,220,160,.8)';x.lineWidth=2;x.beginPath();x.arc(0,0,40,0,TAU);x.stroke();
  x.fillStyle='rgba(255,200,120,.9)';for(let k=0;k<4;k++){x.save();x.rotate(k*Math.PI/2);x.beginPath();x.moveTo(0,-30);x.lineTo(5,-18);x.lineTo(-5,-18);x.closePath();x.fill();x.restore();}
  x.restore();
}
function muzzleFlash(x,cx,cy){
  blob(x,cx,cy,56,[255,170,60],[255,80,20],.6);
  x.save();x.translate(cx,cy);const R=rng(21);
  for(let k=0;k<11;k++){const a=k/11*TAU+R()*.3,len=30+R()*28,w=6+R()*6;const g=x.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.5,'rgba(255,190,70,.9)');g.addColorStop(1,'rgba(255,90,20,0)');
    x.fillStyle=g;x.beginPath();x.moveTo(Math.cos(a+1.4)*w,Math.sin(a+1.4)*w);x.lineTo(Math.cos(a)*len,Math.sin(a)*len);x.lineTo(Math.cos(a-1.4)*w,Math.sin(a-1.4)*w);x.closePath();x.fill();}
  x.restore();blob(x,cx,cy,20,[255,255,240],[255,220,140],1);
}
// Patlama: ateş topu büyür, sönerken koyu dumana döner; kor parçaları dışa saçılır
function explosion(x,cx,cy,f){
  const t=f/7,R=rng(40),n=noise2(41);
  const fire=Math.max(0,1-t*1.5),smoke=Math.min(1,t*1.6)*(1-t*.55);
  for(let i=0;i<14;i++){const a=R()*TAU,d=(8+R()*26)*(.4+t*1.1),rr=(12+R()*14)*(.6+t*.9);
    blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d-t*10,rr*1.25,mix([70,64,60],[40,36,34],R()),[30,28,28],smoke*.7);}
  for(let i=0;i<12;i++){const a=R()*TAU,d=(4+R()*20)*(.5+t),rr=(10+R()*14)*(.7+t*.6);
    blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d,rr,mix([255,214,90],[235,80,20],Math.min(1,t*1.8+R()*.3)),[200,40,10],fire);}
  blob(x,cx,cy,30*(1-t*.6),[255,250,200],[255,160,40],Math.max(0,1-t*2.2));
  for(let i=0;i<10;i++){const a=R()*TAU,d=20+t*46+R()*10;blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d,3+R()*2,[255,210,110],[255,90,20],Math.max(0,1-t)*.9);}
}
// Su sütunu: köpük damlaları yükselip düşer, tabanda genişleyen halka
function splash(x,cx,cy,f){
  const t=f/7,R=rng(60),base=cy+42;
  x.save();x.translate(cx,base);x.scale(1,.42);const rr=14+t*42;x.strokeStyle=`rgba(225,250,245,${.8*(1-t)})`;x.lineWidth=6*(1-t)+1;x.beginPath();x.arc(0,0,rr,0,TAU);x.stroke();
  blob(x,0,0,rr*.9,[190,240,235],[120,210,210],.35*(1-t));x.restore();
  const h=Math.sin(Math.PI*Math.min(1,t*1.25))*52;
  for(let i=0;i<34;i++){const sx=(R()-.5)*28*(1+t),vy=.55+R()*.6,life=Math.min(1,t*1.2/vy),py=base-Math.sin(Math.PI*life)*h*vy-4,sz=(3+R()*6)*(1-t*.5);
    if(life>=1)continue;blob(x,cx+sx*(1+life*.8),py,sz*1.5,[240,252,250],[160,225,225],.95*(1-t*.6));}
  const col=x.createLinearGradient(cx,base-h,cx,base);col.addColorStop(0,'rgba(235,252,250,0)');col.addColorStop(.3,`rgba(225,250,248,${.6*(1-t)})`);col.addColorStop(1,`rgba(150,225,225,${.7*(1-t)})`);
  x.fillStyle=col;x.beginPath();x.moveTo(cx-12-t*8,base);x.quadraticCurveTo(cx-6,base-h*.7,cx,base-h);x.quadraticCurveTo(cx+6,base-h*.7,cx+12+t*8,base);x.closePath();x.fill();
}
function smokePuff(x,cx,cy,seed){const R=rng(seed);for(let i=0;i<9;i++){const a=R()*TAU,d=R()*18;blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d,18+R()*14,mix([150,146,138],[90,88,86],R()),[60,60,60],.55);}blob(x,cx-6,cy-8,14,[215,210,200],[160,160,160],.35);}
function splinter(x,cx,cy,seed){const R=rng(seed);x.save();x.translate(cx,cy);x.rotate(R()*TAU);const L=46+R()*20,W=8+R()*5;
  x.fillStyle='#6a4428';x.beginPath();x.moveTo(-L/2,-W/2);x.lineTo(L/2-4,-W/2+1);x.lineTo(L/2,0);x.lineTo(L/2-6,W/2);x.lineTo(-L/2+3,W/2);x.lineTo(-L/2-3,W*.1);x.closePath();x.fill();
  x.fillStyle='#a8784a';x.fillRect(-L/2+2,-W/2+1,L-8,1.6);x.fillStyle='#3a2414';x.fillRect(-L/2+3,W/2-1.8,L-10,1.4);x.restore();}
function ember(x,cx,cy){blob(x,cx,cy,20,[255,180,70],[255,80,20],.6);blob(x,cx,cy,7,[255,250,220],[255,200,90],1);}
function foam(x,cx,cy,seed){const R=rng(seed);for(let i=0;i<8;i++){const a=R()*TAU,d=R()*16;blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6,14+R()*10,[240,252,250],[170,225,225],.6);}}
function bubble(x,cx,cy){x.strokeStyle='rgba(220,250,250,.9)';x.lineWidth=2.5;x.beginPath();x.arc(cx,cy,14,0,TAU);x.stroke();blob(x,cx-5,cy-5,5,[255,255,255],[255,255,255],.9);blob(x,cx,cy,14,[120,210,210],[120,210,210],.2);}
function firePuff(x,cx,cy){blob(x,cx,cy+6,26,[255,120,30],[200,40,10],.55);blob(x,cx,cy,18,[255,210,90],[255,110,30],.85);blob(x,cx,cy-4,8,[255,250,220],[255,220,140],.9);}
function spit(x,cx,cy){blob(x,cx,cy,42,[90,230,200],[20,120,140],.45);const g=x.createRadialGradient(cx-8,cy-9,2,cx,cy,22);g.addColorStop(0,'rgba(230,255,250,1)');g.addColorStop(.4,'rgba(80,220,200,.95)');g.addColorStop(1,'rgba(10,90,110,.95)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,22,0,TAU);x.fill();
  const R=rng(81);for(let i=0;i<7;i++){const a=R()*TAU,d=26+R()*14;blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d,4+R()*3,[200,255,245],[80,200,200],.9);}}
function plank(x,cx,cy){x.save();x.translate(cx,cy);x.rotate(-.35);x.fillStyle='#5a3a22';x.fillRect(-44,-8,88,16);x.fillStyle='#8a5e38';x.fillRect(-44,-8,88,4);x.fillStyle='#2e1c10';x.fillRect(-44,5,88,3);
  for(const px of [-34,34]){x.fillStyle='#2a2a2a';x.beginPath();x.arc(px,0,2.4,0,TAU);x.fill();}x.fillStyle='#2e1c10';x.beginPath();x.moveTo(40,-8);x.lineTo(46,-2);x.lineTo(41,8);x.closePath();x.fill();x.restore();}
function sparkStar(x,cx,cy){blob(x,cx,cy,30,[255,230,140],[255,180,60],.5);x.fillStyle='rgba(255,250,220,1)';x.beginPath();for(let k=0;k<8;k++){const a=k/8*TAU,rr=k%2?6:30;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();}
function poisonPuff(x,cx,cy){const R=rng(91);for(let i=0;i<8;i++){const a=R()*TAU,d=R()*16;blob(x,cx+Math.cos(a)*d,cy+Math.sin(a)*d,16+R()*10,[150,230,90],[60,120,30],.55);}}


function bomb(x,cx,cy){ironBall(x,cx,cy,20,{seed:31});x.fillStyle='#b8843a';x.fillRect(cx-5,cy-25,10,7);x.strokeStyle='#8a6a3a';x.lineWidth=3;x.beginPath();x.moveTo(cx,cy-25);x.quadraticCurveTo(cx+8,cy-34,cx+12,cy-40);x.stroke();blob(x,cx+12,cy-41,14,[255,230,140],[255,120,30],.9);blob(x,cx+12,cy-41,5,[255,255,240],[255,220,140],1);}
function breakerShell(x,cx,cy){x.save();x.translate(cx,cy);const g=x.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#c8ccd0');g.addColorStop(.45,'#6a6e74');g.addColorStop(1,'#26282c');x.fillStyle=g;
  x.beginPath();x.moveTo(-28,-11);x.lineTo(10,-11);x.quadraticCurveTo(26,-8,34,0);x.quadraticCurveTo(26,8,10,11);x.lineTo(-28,11);x.closePath();x.fill();
  x.fillStyle='#c8943e';x.fillRect(-24,-12,5,24);x.fillRect(-8,-12,5,24);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(-26,-8,40,2.5);x.restore();blob(x,cx-34,cy,14,[200,200,200],[120,120,120],.5);}
function leechBall(x,cx,cy){blob(x,cx,cy,44,[90,255,150],[40,160,110],.5);ironBall(x,cx,cy,20,{tint:[20,60,40],seed:41});
  const R=rng(42);x.save();x.beginPath();x.arc(cx,cy,20,0,TAU);x.clip();x.lineCap='round';for(let i=0;i<8;i++){let px=cx+(R()-.5)*34,py=cy+(R()-.5)*34;x.strokeStyle='rgba(110,255,170,.95)';x.lineWidth=1.2+R()*1.6;x.beginPath();x.moveTo(px,py);for(let k=0;k<3;k++){px+=(R()-.5)*14;py+=(R()-.5)*14;x.lineTo(px,py);}x.stroke();}x.restore();}
function soulWisp(x,cx,cy){blob(x,cx,cy,34,[120,255,170],[60,200,140],.55);x.fillStyle='rgba(210,255,225,.95)';x.beginPath();x.moveTo(cx,cy-24);x.quadraticCurveTo(cx+14,cy-4,cx+4,cy+14);x.quadraticCurveTo(cx,cy+22,cx-4,cy+14);x.quadraticCurveTo(cx-14,cy-4,cx,cy-24);x.fill();blob(x,cx,cy+2,8,[255,255,255],[200,255,220],1);}
function shockRing(x,cx,cy){x.save();x.translate(cx,cy);x.scale(1,.6);for(const [r,w,a] of [[54,10,.35],[50,4,.9],[42,2,.5]]){x.strokeStyle=`rgba(255,${200-r},120,${a})`;x.lineWidth=w;x.beginPath();x.arc(0,0,r,0,TAU);x.stroke();}x.restore();}

export function paintVfxAtlas(){
  const [c,x]=canvas(C*COLS,C*ROWS),at=(col,row,fn)=>{x.save();x.beginPath();x.rect(col*C,row*C,C,C);x.clip();fn(col*C+C/2,row*C+C/2);x.restore();};
  at(0,0,(cx,cy)=>ironBall(x,cx,cy,22,{seed:1}));
  at(1,0,(cx,cy)=>fireBall(x,cx,cy,20));
  at(2,0,(cx,cy)=>ironBall(x,cx,cy,11,{seed:5}));
  at(3,0,(cx,cy)=>chainShot(x,cx,cy));
  at(4,0,(cx,cy)=>{blob(x,cx,cy,40,[255,90,50],[200,30,10],.35);ironBall(x,cx,cy,20,{tint:[90,20,10],hot:.55,seed:11});});
  at(5,0,(cx,cy)=>shadow(x,cx,cy));
  at(6,0,(cx,cy)=>targetRing(x,cx,cy));
  at(7,0,(cx,cy)=>muzzleFlash(x,cx,cy));
  for(let f=0;f<8;f++){at(f,1,(cx,cy)=>explosion(x,cx,cy,f));at(f,2,(cx,cy)=>splash(x,cx,cy-10,f));}
  for(let k=0;k<4;k++)at(k,3,(cx,cy)=>smokePuff(x,cx,cy,100+k*7));
  for(let k=0;k<3;k++)at(4+k,3,(cx,cy)=>splinter(x,cx,cy,200+k*13));
  at(7,3,(cx,cy)=>ember(x,cx,cy));
  at(0,4,(cx,cy)=>foam(x,cx,cy,300));at(1,4,(cx,cy)=>foam(x,cx,cy,311));at(2,4,(cx,cy)=>bubble(x,cx,cy));at(3,4,(cx,cy)=>firePuff(x,cx,cy));
  at(4,4,(cx,cy)=>spit(x,cx,cy));at(5,4,(cx,cy)=>plank(x,cx,cy));at(6,4,(cx,cy)=>sparkStar(x,cx,cy));at(7,4,(cx,cy)=>poisonPuff(x,cx,cy));
  at(0,5,(cx,cy)=>bomb(x,cx,cy+8));at(1,5,(cx,cy)=>breakerShell(x,cx,cy));at(2,5,(cx,cy)=>leechBall(x,cx,cy));at(3,5,(cx,cy)=>soulWisp(x,cx,cy));at(4,5,(cx,cy)=>shockRing(x,cx,cy));
  return c;
}

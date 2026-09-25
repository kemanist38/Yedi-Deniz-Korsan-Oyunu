// Elit yetenek animasyonları (prosedürel, görsel dosyası gerektirmez). Her efekt dünya koordinatında yaşar;
// gemi/hedef referansı verilen efektler (a) o nesneyi her karede izler. Çizim her karede worldToScreen ile yapılır.
type Vec={x:number;y:number};
type Kind='bolt'|'frost'|'meteor'|'lava'|'tentacle'|'steam'|'moon'|'dome'|'ripple'|'scythe'|'soul'|'banner'|'coin'|'breath'|'rage'|'text'|'vortex'|'coral'|'sun'|'blind';
type Fx={kind:Kind;t:number;dur:number;seed:number;a?:Vec;b?:Vec;n?:number;s?:string;ship?:boolean};
const fx:Fx[]=[];
let flash=0,flashColor='200,220,255',tint=0,tintColor='150,20,30';
const TAU=Math.PI*2;
const pt=(v:Vec)=>({x:v.x,y:v.y});
const add=(f:Omit<Fx,'t'|'seed'>)=>{fx.push({...f,t:0,seed:Math.random()*1e4});};

// ---------------------------------------------------------------- oluşturucular
export function spawnLightning(from:Vec,to:Vec,dur=.55,fromShip=true){add({kind:'bolt',a:fromShip?from:pt(from),b:to,dur,ship:fromShip});flash=Math.max(flash,.35);flashColor='200,220,255';}
export function spawnFrost(target:Vec,dur:number){add({kind:'frost',a:target,dur});}
export function spawnMeteor(at:Vec,delay:number){add({kind:'meteor',b:pt(at),dur:.7+delay,n:delay});}
export function spawnLavaPool(at:Vec,dur:number){add({kind:'lava',b:pt(at),dur});}
export function spawnTentacles(target:Vec,dur:number){add({kind:'tentacle',a:target,dur});}
export function spawnSteam(ship:Vec,dur:number){add({kind:'steam',a:ship,dur});}
export function spawnBloodMoon(ship:Vec,dur:number){add({kind:'moon',a:ship,dur});}
export function spawnDome(ship:Vec,dur:number){add({kind:'dome',a:ship,dur});}
export function spawnRipple(at:Vec){add({kind:'ripple',b:pt(at),dur:.5});}
export function spawnScythe(target:Vec){add({kind:'scythe',a:target,b:pt(target),dur:.9});}
export function spawnSoul(from:Vec,to:Vec){add({kind:'soul',b:pt(from),a:to,dur:1.1});}
export function spawnBanner(ship:Vec,dur:number){add({kind:'banner',a:ship,dur});}
export function spawnCoins(from:Vec,to:Vec){for(let i=0;i<8;i++)add({kind:'coin',b:pt(from),a:to,dur:.9+i*.05,n:i});}
export function spawnBreath(ship:Vec,angle:number,len:number,dur:number){add({kind:'breath',a:ship,n:angle,b:{x:len,y:0},dur});}
export function spawnRage(ship:Vec,dur:number){add({kind:'rage',a:ship,dur});}
export function spawnText(at:Vec,text:string,color='#ffcf5a'){add({kind:'text',a:at,s:text+'|'+color,dur:1.4});}
export function spawnVortex(at:Vec,dur:number){add({kind:'vortex',b:pt(at),dur});}
export function spawnCoral(ship:Vec,dur:number){add({kind:'coral',a:ship,dur});}
export function spawnSun(ship:Vec,dur:number){add({kind:'sun',a:ship,dur});flash=Math.max(flash,.5);flashColor='255,230,150';}
export function spawnBlind(target:Vec,dur:number){add({kind:'blind',a:target,dur});}
export function screenTint(v:number,color:string){tint=Math.max(tint,v);tintColor=color;}

export function updateAbilityFx(dt:number){
  flash=Math.max(0,flash-dt*2.2);tint=Math.max(0,tint-dt*.6);
  for(let i=fx.length-1;i>=0;i--){fx[i].t+=dt;if(fx[i].t>=fx[i].dur)fx.splice(i,1);}
}

// ---------------------------------------------------------------- yardımcılar
function rng(seed:number){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function jag(a:Vec,b:Vec,r:()=>number,spread:number,depth:number):Vec[]{
  if(depth===0)return[a,b];
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,off=(r()-.5)*spread;
  const m={x:mx-dy/len*off,y:my+dx/len*off};
  return[...jag(a,m,r,spread*.55,depth-1).slice(0,-1),...jag(m,b,r,spread*.55,depth-1)];
}
function stroke(ctx:CanvasRenderingContext2D,pts:Vec[],w:number,color:string,blur=0){
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(const p of pts.slice(1))ctx.lineTo(p.x,p.y);
  ctx.lineWidth=w;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();
}
function glow(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,inner:string,outer:string){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
}
const life=(f:Fx,fadeIn=.2,fadeOut=.4)=>Math.max(0,Math.min(1,f.t/fadeIn,(f.dur-f.t)/fadeOut));

// ---------------------------------------------------------------- çizimler
function drawBolt(ctx:CanvasRenderingContext2D,b:Fx,w2s:(v:Vec)=>Vec){
  const a=w2s(b.a!),c=w2s(b.b!),k=b.t/b.dur,alpha=k<.15?1:Math.max(0,1-(k-.15)/.85);
  const r=rng(b.seed+Math.floor(b.t/.045)*97),src={x:a.x,y:a.y-(b.ship?38:0)},len=Math.hypot(c.x-src.x,c.y-src.y);
  const main=jag(src,c,r,Math.min(90,len*.28),6);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=alpha;
  stroke(ctx,main,12,'rgba(90,140,255,.35)',24);stroke(ctx,main,5,'rgba(150,200,255,.8)',12);stroke(ctx,main,2,'#ffffff',6);
  for(let i=0;i<3;i++){const p=main[4+Math.floor(r()*(main.length-8))],ang=Math.atan2(c.y-src.y,c.x-src.x)+(r()-.5)*1.8,l=30+r()*50;
    const br=jag(p,{x:p.x+Math.cos(ang)*l,y:p.y+Math.sin(ang)*l},r,22,3);stroke(ctx,br,3,'rgba(150,200,255,.7)',8);stroke(ctx,br,1.2,'#fff',0);}
  ctx.shadowBlur=0;glow(ctx,c.x,c.y,70,`rgba(220,235,255,${.9*alpha})`,'rgba(80,120,255,0)');
  for(let i=0;i<10;i++){const ang=r()*TAU,d=20+k*60+r()*20;ctx.fillStyle='#cfe4ff';ctx.fillRect(c.x+Math.cos(ang)*d,c.y+Math.sin(ang)*d*.6,2.5,2.5);}
  if(b.ship)glow(ctx,src.x,src.y,26,`rgba(255,255,255,${alpha})`,'rgba(120,170,255,0)');
  ctx.restore();
}
function shard(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,ang:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  const g=ctx.createLinearGradient(0,-h,0,0);g.addColorStop(0,'rgba(240,252,255,.95)');g.addColorStop(1,'rgba(120,190,235,.75)');
  ctx.fillStyle=g;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(h*.22,-h*.25);ctx.lineTo(0,0);ctx.lineTo(-h*.22,-h*.25);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function drawFrost(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),r=rng(f.seed),t=f.t,grow=Math.min(1,t/.35),fade=Math.min(1,(f.dur-t)/.5),a=grow*fade;
  ctx.save();
  if(t<.6){const rr=40+t*260;ctx.strokeStyle=`rgba(200,240,255,${(1-t/.6)*.8})`;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(s.x,s.y+6,rr,rr*.62,0,0,TAU);ctx.stroke();}
  const g=ctx.createRadialGradient(s.x,s.y,10,s.x,s.y,78);g.addColorStop(0,`rgba(190,235,255,${.55*a})`);g.addColorStop(.7,`rgba(120,200,245,${.35*a})`);g.addColorStop(1,'rgba(120,200,245,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y,78,56,0,0,TAU);ctx.fill();
  ctx.globalAlpha=a;
  for(let i=0;i<14;i++){const ang=r()*TAU,d=34+r()*26,h=(14+r()*22)*grow;shard(ctx,s.x+Math.cos(ang)*d,s.y+8+Math.sin(ang)*d*.6,h,(r()-.5)*.8);}
  for(let i=0;i<18;i++){const ang=r()*TAU,d=r()*70,y=((r()*60+t*25)%60)-30;ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*d,s.y+y+Math.sin(ang)*d*.4,1.6,0,TAU);ctx.fill();}
  // Çözülme: son 0,4 sn buz parçaları dışa saçılır
  if(f.dur-t<.4){const k=1-(f.dur-t)/.4;ctx.globalAlpha=1-k;for(let i=0;i<10;i++){const ang=r()*TAU;shard(ctx,s.x+Math.cos(ang)*(50+k*60),s.y+Math.sin(ang)*(30+k*40),10,ang);}}
  ctx.restore();
}
function drawMeteor(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.b!),delay=f.n??0,t=f.t-delay;if(t<0)return;
  ctx.save();
  if(t<.45){const k=t/.45,x=s.x+(1-k)*140,y=s.y-(1-k)*420;
    const g=ctx.createLinearGradient(x+60,y-180,x,y);g.addColorStop(0,'rgba(255,120,20,0)');g.addColorStop(1,'rgba(255,190,60,.9)');
    ctx.strokeStyle=g;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+60,y-180);ctx.lineTo(x,y);ctx.stroke();
    glow(ctx,x,y,22,'rgba(255,255,200,1)','rgba(255,90,10,0)');
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s.x,s.y+8,18*k,8*k,0,0,TAU);ctx.stroke();}
  else{const k=(t-.45)/.25;ctx.globalAlpha=Math.max(0,1-k);glow(ctx,s.x,s.y,40+k*80,'rgba(255,230,140,1)','rgba(255,70,0,0)');
    const r=rng(f.seed);for(let i=0;i<12;i++){const ang=r()*TAU,d=k*(60+r()*50);ctx.fillStyle=i%2?'#ffb040':'#ff5a14';ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*d,s.y+Math.sin(ang)*d*.6-k*20,3,0,TAU);ctx.fill();}}
  ctx.restore();
}
function drawLava(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.b!),a=life(f,.3,.8),r=rng(f.seed),t=f.t;
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(s.x,s.y,6,s.x,s.y,120);g.addColorStop(0,'rgba(255,210,90,.95)');g.addColorStop(.45,'rgba(240,80,20,.8)');g.addColorStop(.85,'rgba(90,20,10,.55)');g.addColorStop(1,'rgba(40,10,5,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y,120,74,0,0,TAU);ctx.fill();
  for(let i=0;i<9;i++){const ang=r()*TAU,d=r()*90,ph=(t*1.6+r())%1;ctx.fillStyle=`rgba(255,${190+r()*50},90,${(1-ph)*.9})`;ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*d,s.y+Math.sin(ang)*d*.6,3+ph*7,0,TAU);ctx.fill();}
  for(let i=0;i<5;i++){const ph=(t*.5+i/5)%1,x=s.x+(r()-.5)*140;ctx.fillStyle=`rgba(60,50,50,${.35*(1-ph)})`;ctx.beginPath();ctx.arc(x,s.y-ph*90,8+ph*18,0,TAU);ctx.fill();}
  ctx.restore();
}
function tentacle(ctx:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,wave:number,w:number){
  const mx=(x0+x1)/2+wave,my=(y0+y1)/2-40;
  ctx.lineCap='round';
  for(const [lw,col] of [[w,'#3a1640'],[w*.72,'#7a2e7c'],[w*.3,'#c070b8']] as const){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();}
  for(let i=1;i<5;i++){const k=i/5,x=(1-k)*(1-k)*x0+2*(1-k)*k*mx+k*k*x1,y=(1-k)*(1-k)*y0+2*(1-k)*k*my+k*k*y1;ctx.fillStyle='#f0c0e0';ctx.beginPath();ctx.arc(x,y,w*.13,0,TAU);ctx.fill();}
}
function drawTentacles(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),rise=Math.min(1,f.t/.35),a=life(f,.15,.45),t=f.t;
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(s.x,s.y+12,5,s.x,s.y+12,90);g.addColorStop(0,'rgba(60,10,70,.7)');g.addColorStop(1,'rgba(60,10,70,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y+12,90,52,0,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(200,140,230,.5)`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y+12,70+Math.sin(t*6)*6,40,t,0,TAU);ctx.stroke();
  for(let i=0;i<4;i++){const ang=i/4*TAU+.4,bx=s.x+Math.cos(ang)*70,by=s.y+12+Math.sin(ang)*40,tx=s.x+Math.cos(ang)*18,ty=s.y-10-rise*30;
    tentacle(ctx,bx,by,bx+(tx-bx)*rise,by+(ty-by)*rise,Math.sin(t*4+i)*18,12);}
  ctx.restore();
}
function drawSteam(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.2,.6),r=rng(f.seed),t=f.t;
  ctx.save();ctx.globalAlpha=a;
  for(let i=0;i<14;i++){const ph=(t*.7+i/14)%1,x=s.x+(r()-.5)*30+Math.sin(ph*6+i)*10,y=s.y-40-ph*110;ctx.fillStyle=`rgba(235,238,240,${.55*(1-ph)})`;ctx.beginPath();ctx.arc(x,y,10+ph*26,0,TAU);ctx.fill();}
  for(let i=0;i<8;i++){const ph=(t*1.8+r())%1,ang=r()*TAU;ctx.fillStyle=`rgba(255,${150+r()*80},40,${1-ph})`;ctx.fillRect(s.x+Math.cos(ang)*40*ph,s.y-10-ph*40+Math.sin(ang)*15,2.5,2.5);}
  // Dönen dişliler
  for(const [dx,dy,rr,dir] of [[-34,-58,11,1],[34,-66,8,-1]] as const){ctx.save();ctx.translate(s.x+dx,s.y+dy);ctx.rotate(t*3*dir);ctx.strokeStyle='rgba(230,170,70,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.stroke();
    for(let k=0;k<8;k++){const g=k/8*TAU;ctx.beginPath();ctx.moveTo(Math.cos(g)*rr,Math.sin(g)*rr);ctx.lineTo(Math.cos(g)*(rr+5),Math.sin(g)*(rr+5));ctx.stroke();}ctx.restore();}
  ctx.restore();
}
function drawMoon(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.4,.6),x=s.x,y=s.y-120+Math.sin(f.t*2)*4;
  ctx.save();ctx.globalAlpha=a;glow(ctx,x,y,60,'rgba(255,60,60,.55)','rgba(255,0,0,0)');
  ctx.fillStyle='#ff3b3b';ctx.shadowColor='#ff2020';ctx.shadowBlur=24;ctx.beginPath();ctx.arc(x,y,22,0,TAU);ctx.fill();
  ctx.globalCompositeOperation='destination-out';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x+9,y-5,19,0,TAU);ctx.fill();
  ctx.restore();
}
function drawDome(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),grow=Math.min(1,f.t/.3),end=f.dur-f.t,a=end<.4?end/.4:1,R=86*grow,t=f.t;
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,R);g.addColorStop(0,'rgba(200,255,250,.12)');g.addColorStop(.8,'rgba(80,220,220,.22)');g.addColorStop(1,'rgba(160,255,250,.55)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y-6,R,R*.82,0,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(190,255,250,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(s.x,s.y-6,R,R*.82,0,0,TAU);ctx.stroke();
  for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(220,255,255,${.35-i*.1})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(s.x,s.y-6,R*(.55+i*.14)+Math.sin(t*3+i)*3,R*.8*(.55+i*.14),0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(s.x-R*.4,s.y-R*.5,R*.16,R*.07,-.6,0,TAU);ctx.fill();
  if(end<.4){const k=1-end/.4,r=rng(f.seed);for(let i=0;i<14;i++){const ang=r()*TAU;ctx.fillStyle='rgba(180,240,255,.8)';ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*R*(1+k*.6),s.y-6+Math.sin(ang)*R*.8*(1+k*.6),3,0,TAU);ctx.fill();}}
  ctx.restore();
}
function drawRipple(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.b!),k=f.t/f.dur,a=1-k;ctx.save();ctx.globalCompositeOperation='lighter';
  // Tek çizgi yerine üç katmanlı su şok halkası: merkez köpüğü + ana halka + dış kırınım.
  for(let i=0;i<3;i++){const kk=Math.max(0,Math.min(1,k-i*.08)),r=12+kk*(58+i*16);ctx.strokeStyle=`rgba(${205+i*12},255,255,${a*(.62-i*.13)})`;ctx.lineWidth=4-i;ctx.beginPath();ctx.ellipse(s.x,s.y,r,r*.55,0,0,TAU);ctx.stroke();}
  glow(ctx,s.x,s.y,38+k*42,`rgba(220,255,255,${a*.22})`,'rgba(100,220,255,0)');ctx.restore();
}
function drawScythe(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(targetOrLast(f)),k=f.t/f.dur,a=life(f,.15,.25),swing=-1.4+Math.min(1,k/.6)*2.6;
  ctx.save();ctx.globalAlpha=a*.9;ctx.translate(s.x-40,s.y-70);ctx.rotate(swing);
  ctx.strokeStyle='rgba(180,255,220,.35)';ctx.lineWidth=26;ctx.beginPath();ctx.arc(0,0,90,-.3,.9);ctx.stroke();
  ctx.strokeStyle='#5a4a3a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(0,70);ctx.stroke();
  const g=ctx.createLinearGradient(0,-70,110,-10);g.addColorStop(0,'#e8fff4');g.addColorStop(1,'#6ad6a8');
  ctx.fillStyle=g;ctx.shadowColor='#8affd0';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(0,-70);ctx.quadraticCurveTo(80,-90,120,-20);ctx.quadraticCurveTo(70,-55,0,-52);ctx.closePath();ctx.fill();
  ctx.restore();
}
function targetOrLast(f:Fx){if(f.a){f.b={x:f.a.x,y:f.a.y};}return f.b!;}
function drawSoul(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const k=Math.min(1,f.t/f.dur),from=w2s(f.b!),to=w2s(f.a!),x=from.x+(to.x-from.x)*k,y=from.y+(to.y-from.y)*k-Math.sin(k*Math.PI)*80,r=rng(f.seed);
  ctx.save();ctx.globalAlpha=1-k*.55;ctx.globalCompositeOperation='lighter';glow(ctx,x,y,34,'rgba(225,255,240,.95)','rgba(50,255,160,0)');
  // Ruh çekirdeği + arkada kıvrılan iki enerji kuyruğu.
  ctx.strokeStyle='rgba(120,255,190,.45)';ctx.lineCap='round';for(let j=0;j<2;j++){ctx.lineWidth=5-j*2;ctx.beginPath();for(let i=0;i<8;i++){const q=Math.max(0,k-i*.035),xx=from.x+(to.x-from.x)*q,yy=from.y+(to.y-from.y)*q-Math.sin(q*Math.PI)*80+Math.sin(f.t*9+i+j)*7*(i/8);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}
  ctx.fillStyle='rgba(235,255,245,.96)';ctx.beginPath();ctx.arc(x,y-4,7,0,TAU);ctx.fill();for(let i=0;i<7;i++){const a=r()*TAU,d=12+r()*24;ctx.fillStyle='rgba(150,255,205,.7)';ctx.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,2,2);}ctx.restore();
}
function drawBanner(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.3,.5),t=f.t,rise=Math.min(1,t/.5),x=s.x+22,top=s.y-150;
  ctx.save();ctx.globalAlpha=a;
  ctx.strokeStyle='rgba(255,210,90,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,s.y+6,80,48,t*1.5,0,TAU*.8);ctx.stroke();
  ctx.strokeStyle='#b8872e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,s.y-20);ctx.lineTo(x,top);ctx.stroke();
  const fy=top+(1-rise)*90,w=46,h=34;ctx.fillStyle='#b01822';ctx.beginPath();ctx.moveTo(x,fy);
  for(let i=0;i<=8;i++){const u=i/8;ctx.lineTo(x+u*w,fy+Math.sin(t*6+u*4)*4*u);}ctx.lineTo(x+w,fy+h);for(let i=8;i>=0;i--){const u=i/8;ctx.lineTo(x+u*w,fy+h+Math.sin(t*6+u*4)*4*u);}ctx.closePath();ctx.fill();
  ctx.strokeStyle='#ffd24a';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ffd24a';ctx.font='700 20px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('♌',x+w/2,fy+h/2+Math.sin(t*6+2)*2);
  ctx.restore();
}
function drawCoin(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const d=(f.n??0)*.05,k=Math.max(0,Math.min(1,(f.t-d)/(f.dur-d)));if(f.t<d)return;
  const from=w2s(f.b!),to=w2s(f.a!),r=rng(f.seed),ox=(r()-.5)*60,x=from.x+ox*(1-k)+(to.x-from.x)*k,y=from.y+(to.y-from.y)*k-Math.sin(k*Math.PI)*(70+r()*40);
  ctx.save();ctx.fillStyle='#ffd24a';ctx.strokeStyle='#8a5a10';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,6*Math.abs(Math.cos(f.t*10))+1,6,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
}
function drawBreath(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),ang=f.n??0,len=f.b!.x,a=life(f,.12,.45),t=f.t,r=rng(f.seed+Math.floor(t/.05));
  const ex=s.x+Math.cos(ang)*len,ey=s.y+Math.sin(ang)*len;
  ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';
  const g=ctx.createLinearGradient(s.x,s.y,ex,ey);g.addColorStop(0,'rgba(255,255,200,.95)');g.addColorStop(.3,'rgba(120,255,140,.8)');g.addColorStop(1,'rgba(40,160,80,0)');
  ctx.strokeStyle=g;ctx.lineCap='round';ctx.lineWidth=46;ctx.beginPath();ctx.moveTo(s.x,s.y-10);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.lineWidth=18;ctx.strokeStyle='rgba(255,240,150,.7)';ctx.beginPath();ctx.moveTo(s.x,s.y-10);ctx.lineTo(s.x+(ex-s.x)*.7,s.y+(ey-s.y)*.7);ctx.stroke();
  for(let i=0;i<22;i++){const u=r(),px=s.x+(ex-s.x)*u+(r()-.5)*40*u,py=s.y+(ey-s.y)*u+(r()-.5)*40*u;ctx.fillStyle=`rgba(${160+r()*90},255,${120+r()*80},${.8*(1-u)})`;ctx.beginPath();ctx.arc(px,py-10,3+r()*8,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawRage(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.2,.4),t=f.t,r=rng(f.seed);
  ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';
  glow(ctx,s.x,s.y-20,110,'rgba(255,120,30,.35)','rgba(255,30,0,0)');
  for(let i=0;i<16;i++){const ang=i/16*TAU,ph=(t*2+r())%1,x=s.x+Math.cos(ang)*(56+Math.sin(t*5+i)*6),y=s.y+Math.sin(ang)*34-ph*50;ctx.fillStyle=`rgba(255,${80+r()*120},20,${(1-ph)*.85})`;ctx.beginPath();ctx.ellipse(x,y,6*(1-ph)+2,12*(1-ph)+3,0,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawText(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),[text,color]=(f.s||'').split('|'),k=f.t/f.dur,a=life(f,.1,.5);
  ctx.save();ctx.globalAlpha=a;ctx.font=`900 ${26+Math.min(1,f.t/.15)*8}px Cinzel, serif`;ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#000';ctx.fillStyle=color;
  ctx.strokeText(text,s.x,s.y-110-k*20);ctx.fillText(text,s.x,s.y-110-k*20);ctx.restore();
}
function drawVortex(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.b!),a=life(f,.3,.35),t=f.t,r=rng(f.seed),R=150*Math.min(1,f.t/.4);
  ctx.save();ctx.globalAlpha=a;
  const g=ctx.createRadialGradient(s.x,s.y,4,s.x,s.y,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.3,'rgba(40,0,70,.9)');g.addColorStop(.7,'rgba(140,60,220,.45)');g.addColorStop(1,'rgba(90,20,160,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y,R,R*.62,0,0,TAU);ctx.fill();
  for(let arm=0;arm<4;arm++){ctx.strokeStyle=`rgba(${190+arm*10},140,255,.7)`;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=30;i++){const u=i/30,ang=arm/4*TAU+t*4+u*5,rr=R*(1-u);const x=s.x+Math.cos(ang)*rr,y=s.y+Math.sin(ang)*rr*.62;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  for(let i=0;i<30;i++){const ph=(t*.8+r())%1,ang=r()*TAU+t*3,rr=R*1.4*(1-ph);ctx.fillStyle=`rgba(220,190,255,${ph})`;ctx.fillRect(s.x+Math.cos(ang)*rr,s.y+Math.sin(ang)*rr*.62,2,2);}
  if(f.dur-t<.35){const k=1-(f.dur-t)/.35;ctx.strokeStyle=`rgba(200,150,255,${1-k})`;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(s.x,s.y,R*(.3+k*1.6),R*.62*(.3+k*1.6),0,0,TAU);ctx.stroke();}
  ctx.restore();
}
function coralBranch(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,color:string,r:()=>number){
  ctx.strokeStyle=color;ctx.lineCap='round';
  const grow=(x0:number,y0:number,len:number,ang:number,w:number,d:number)=>{if(d===0||len<3)return;const x1=x0+Math.cos(ang)*len,y1=y0+Math.sin(ang)*len;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
    grow(x1,y1,len*.7,ang-.5+r()*.2,w*.7,d-1);grow(x1,y1,len*.7,ang+.5-r()*.2,w*.7,d-1);};
  grow(x,y,h,-Math.PI/2,5,4);
}
function drawCoral(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.3,.6),grow=Math.min(1,f.t/.6),t=f.t;
  ctx.save();ctx.globalAlpha=a;
  glow(ctx,s.x,s.y+6,150,'rgba(60,220,200,.18)','rgba(60,220,200,0)');
  const r=rng(f.seed);
  for(let i=0;i<9;i++){const ang=i/9*TAU+.3,rx=s.x+Math.cos(ang)*(95+r()*20),ry=s.y+10+Math.sin(ang)*(58+r()*12);coralBranch(ctx,rx,ry,(10+r()*10)*grow,i%2?'#ff7a3a':'#3ad6c8',rng(f.seed+i));}
  for(let i=0;i<12;i++){const ph=(t*.6+i/12)%1,x=s.x+Math.sin(i*2.1)*50;ctx.fillStyle=`rgba(120,255,160,${(1-ph)*.9})`;ctx.font='700 16px sans-serif';ctx.fillText('+',x,s.y-10-ph*80);}
  ctx.restore();
}
function drawSun(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.1,.6),t=f.t,r=rng(f.seed);
  ctx.save();ctx.globalAlpha=a;
  if(t<.5){const k=t/.5;glow(ctx,s.x,s.y-20,60+k*140,`rgba(255,240,170,${1-k})`,'rgba(255,200,80,0)');
    ctx.strokeStyle=`rgba(255,220,120,${1-k})`;ctx.lineWidth=3;for(let i=0;i<16;i++){const g=i/16*TAU;ctx.beginPath();ctx.moveTo(s.x+Math.cos(g)*40,s.y-20+Math.sin(g)*40);ctx.lineTo(s.x+Math.cos(g)*(70+k*120),s.y-20+Math.sin(g)*(70+k*120));ctx.stroke();}}
  for(let i=0;i<60;i++){const ang=r()*TAU+t*(1.5+r()),rr=50+r()*60;ctx.fillStyle=`rgba(${210+r()*30},${170+r()*30},${100+r()*30},${.35+r()*.35})`;ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*rr,s.y+Math.sin(ang)*rr*.55-10,2+r()*4,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawBlind(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec){
  const s=w2s(f.a!),a=life(f,.1,.3),t=f.t,pulse=.85+Math.sin(t*8)*.15;ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';
  glow(ctx,s.x,s.y-70,52*pulse,'rgba(255,235,130,.42)','rgba(255,185,40,0)');ctx.translate(s.x,s.y-70);ctx.rotate(t*2);
  ctx.fillStyle='#ffe27a';ctx.strokeStyle='#fff2b0';ctx.shadowColor='#ffc33a';ctx.shadowBlur=16;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<24;i++){const rr=i%2?8:17,g=i/24*TAU;i?ctx.lineTo(Math.cos(g)*rr,Math.sin(g)*rr):ctx.moveTo(Math.cos(g)*rr,Math.sin(g)*rr);}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,238,150,.55)';ctx.lineWidth=2;for(let i=0;i<8;i++){const g=i/8*TAU;ctx.beginPath();ctx.moveTo(Math.cos(g)*22,Math.sin(g)*22);ctx.lineTo(Math.cos(g)*(38+8*pulse),Math.sin(g)*(38+8*pulse));ctx.stroke();}ctx.restore();
}
const UNDER=new Set<Kind>(['lava','vortex','coral','ripple']);
const DRAW:Record<Kind,(ctx:CanvasRenderingContext2D,f:Fx,w2s:(v:Vec)=>Vec)=>void>={bolt:drawBolt,frost:drawFrost,meteor:drawMeteor,lava:drawLava,tentacle:drawTentacles,steam:drawSteam,moon:drawMoon,dome:drawDome,ripple:drawRipple,
  scythe:drawScythe,soul:drawSoul,banner:drawBanner,coin:drawCoin,breath:drawBreath,rage:drawRage,text:drawText,vortex:drawVortex,coral:drawCoral,sun:drawSun,blind:drawBlind};
// Gemilerin altına çizilen efektler (su yüzeyi: lav gölü, girdap, mercan resifi, dalga halkası)
export function drawAbilityFxUnder(ctx:CanvasRenderingContext2D,w2s:(v:Vec)=>Vec){for(const f of fx)if(UNDER.has(f.kind))DRAW[f.kind](ctx,f,w2s);}
export function drawAbilityFx(ctx:CanvasRenderingContext2D,w2s:(v:Vec)=>Vec,W:number,H:number){
  if(tint>0){ctx.save();ctx.fillStyle=`rgba(${tintColor},${tint*.22})`;ctx.fillRect(0,0,W,H);ctx.restore();}
  const order:Kind[]=['frost','tentacle','steam','dome','rage','banner','coin','soul','moon','scythe','breath','meteor','sun','blind','bolt','text'];
  for(const k of order)for(const f of fx)if(f.kind===k)DRAW[k](ctx,f,w2s);
  if(flash>0){ctx.save();ctx.fillStyle=`rgba(${flashColor},${flash*.35})`;ctx.fillRect(0,0,W,H);ctx.restore();}
}

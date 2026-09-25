// Elit yetenek animasyonları (prosedürel, görsel dosyası gerektirmez): zincir yıldırım, dondurma, hayalet geçiş.
// Dünya koordinatında yaşar; çizim her karede worldToScreen ile yapılır.
type Vec={x:number;y:number};
type Bolt={kind:'bolt';from:Vec;to:Vec;t:number;dur:number;seed:number};
type Frost={kind:'frost';target:Vec;t:number;dur:number;seed:number};
type Fx=Bolt|Frost;
const fx:Fx[]=[];
let flash=0;

export function spawnLightning(from:Vec,to:Vec,dur=.55){fx.push({kind:'bolt',from,to,t:0,dur,seed:Math.random()*1e4});flash=Math.max(flash,.35);}
export function spawnFrost(target:Vec,dur:number){fx.push({kind:'frost',target,t:0,dur,seed:Math.random()*1e4});}
export function updateAbilityFx(dt:number){flash=Math.max(0,flash-dt*2.2);for(let i=fx.length-1;i>=0;i--){fx[i].t+=dt;if(fx[i].t>=fx[i].dur)fx.splice(i,1);}}

function rng(seed:number){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
// Kırık çizgi: iki nokta arasında orta noktadan sapan yinelemeli yol
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
function drawBolt(ctx:CanvasRenderingContext2D,b:Bolt,w2s:(v:Vec)=>Vec){
  const a=w2s(b.from),c=w2s(b.to),k=b.t/b.dur,alpha=k<.15?1:Math.max(0,1-(k-.15)/.85);
  // Titreme: her 45 ms'de yol yeniden kırılır
  const r=rng(b.seed+Math.floor(b.t/.045)*97),src={x:a.x,y:a.y-38},len=Math.hypot(c.x-src.x,c.y-src.y);
  const main=jag(src,c,r,Math.min(90,len*.28),6);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=alpha;
  stroke(ctx,main,12,'rgba(90,140,255,.35)',24);stroke(ctx,main,5,'rgba(150,200,255,.8)',12);stroke(ctx,main,2,'#ffffff',6);
  for(let i=0;i<3;i++){const p=main[4+Math.floor(r()*(main.length-8))],ang=Math.atan2(c.y-src.y,c.x-src.x)+(r()-.5)*1.8,l=30+r()*50;
    const br=jag(p,{x:p.x+Math.cos(ang)*l,y:p.y+Math.sin(ang)*l},r,22,3);stroke(ctx,br,3,'rgba(150,200,255,.7)',8);stroke(ctx,br,1.2,'#fff',0);}
  // Çarpma: parlak halka ve kıvılcımlar
  const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,70);g.addColorStop(0,`rgba(220,235,255,${.9*alpha})`);g.addColorStop(.35,`rgba(120,170,255,${.45*alpha})`);g.addColorStop(1,'rgba(80,120,255,0)');
  ctx.fillStyle=g;ctx.shadowBlur=0;ctx.beginPath();ctx.arc(c.x,c.y,70,0,Math.PI*2);ctx.fill();
  for(let i=0;i<10;i++){const ang=r()*Math.PI*2,d=20+k*60+r()*20;ctx.fillStyle='#cfe4ff';ctx.fillRect(c.x+Math.cos(ang)*d,c.y+Math.sin(ang)*d*.6,2.5,2.5);}
  // Gemide yük toplama küresi
  const o=ctx.createRadialGradient(src.x,src.y,0,src.x,src.y,26);o.addColorStop(0,`rgba(255,255,255,${alpha})`);o.addColorStop(1,'rgba(120,170,255,0)');ctx.fillStyle=o;ctx.beginPath();ctx.arc(src.x,src.y,26,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function shard(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,ang:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  const g=ctx.createLinearGradient(0,-h,0,0);g.addColorStop(0,'rgba(240,252,255,.95)');g.addColorStop(1,'rgba(120,190,235,.75)');
  ctx.fillStyle=g;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(h*.22,-h*.25);ctx.lineTo(0,0);ctx.lineTo(-h*.22,-h*.25);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function drawFrost(ctx:CanvasRenderingContext2D,f:Frost,w2s:(v:Vec)=>Vec){
  const s=w2s(f.target),r=rng(f.seed),t=f.t,grow=Math.min(1,t/.35),fade=Math.min(1,(f.dur-t)/.5),a=grow*fade;
  ctx.save();
  // Donma dalgası: dışa açılan ayaz halkası
  if(t<.6){const rr=40+t*260;ctx.strokeStyle=`rgba(200,240,255,${(1-t/.6)*.8})`;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(s.x,s.y+6,rr,rr*.62,0,0,Math.PI*2);ctx.stroke();}
  // Buz kabuğu: gövdeyi saran mavi parıltı
  const g=ctx.createRadialGradient(s.x,s.y,10,s.x,s.y,78);g.addColorStop(0,`rgba(190,235,255,${.55*a})`);g.addColorStop(.7,`rgba(120,200,245,${.35*a})`);g.addColorStop(1,'rgba(120,200,245,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y,78,56,0,0,Math.PI*2);ctx.fill();
  // Buz kristalleri
  ctx.globalAlpha=a;
  for(let i=0;i<14;i++){const ang=r()*Math.PI*2,d=34+r()*26,h=(14+r()*22)*grow;shard(ctx,s.x+Math.cos(ang)*d,s.y+8+Math.sin(ang)*d*.6,h,(r()-.5)*.8);}
  // Kar taneleri
  for(let i=0;i<18;i++){const ang=r()*Math.PI*2,d=r()*70,y=((r()*60+t*25)%60)-30;ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(s.x+Math.cos(ang)*d,s.y+y+Math.sin(ang)*d*.4,1.6,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
export function drawAbilityFx(ctx:CanvasRenderingContext2D,w2s:(v:Vec)=>Vec,W:number,H:number){
  for(const f of fx)if(f.kind==='frost')drawFrost(ctx,f,w2s);
  for(const f of fx)if(f.kind==='bolt')drawBolt(ctx,f,w2s);
  if(flash>0){ctx.save();ctx.fillStyle=`rgba(200,220,255,${flash*.35})`;ctx.fillRect(0,0,W,H);ctx.restore();}
}

// Kara Yelken — prosedürel el boyaması dokular.
// Her doku tohumlu rastgelelikle üretilir; aynı tohum her seferinde aynı görseli verir.
import * as THREE from 'three';

export function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}

export function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}

export function toTexture(c,{repeat=false}={}){
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}
  return t;
}

// İnce boya lekesi ve tahta damarı gürültüsü.
export function grain(ctx,w,h,r,{alpha=.08,count=900,light='#ffffff',dark='#000000',stretch=1}={}){
  for(let i=0;i<count;i++){
    ctx.globalAlpha=alpha*r();ctx.fillStyle=r()<.5?light:dark;
    const x=r()*w,y=r()*h,len=(4+r()*26)*stretch;ctx.fillRect(x,y,len,1+r()*1.6);
  }
  ctx.globalAlpha=1;
}
export function blotches(ctx,w,h,r,{alpha=.1,count=60,colors=['#000']}={}){
  for(let i=0;i<count;i++){
    ctx.globalAlpha=alpha*r();ctx.fillStyle=colors[Math.floor(r()*colors.length)];
    ctx.beginPath();ctx.ellipse(r()*w,r()*h,4+r()*28,3+r()*16,r()*3,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
}

// Gövde dokusu: u = kıçtan pruvaya, v = omurgadan (0) küpeşteye (1).
export function hullTexture({seed,plank='#3a2519',plankDark='#24160f',band='#7a3a2a',trim='#c89a45',tar='#1b1512',ports=0,portColor='#140d0a',portLid='#6d2a20',stripe=null}){
  const W=1024,H=256,[c,x]=canvas(W,H),r=rng(seed);
  // v ekseni tuvalde yukarıdan aşağıya: y=0 küpeşte, y=H omurga.
  x.fillStyle=plank;x.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=9){x.fillStyle=r()<.5?plank:plankDark;x.globalAlpha=.35+r()*.3;x.fillRect(0,y,W,8);x.globalAlpha=.5;x.fillStyle='#0d0806';x.fillRect(0,y+8,W,1);
    for(let s=r()*120;s<W;s+=90+r()*140){x.fillRect(s,y,1,8);} }
  x.globalAlpha=1;grain(x,W,H,r,{alpha:.12,count:2600,light:'#b98a5e',dark:'#0a0604'});
  // Küpeşte süsü
  x.fillStyle=trim;x.fillRect(0,0,W,7);x.fillStyle='#00000055';x.fillRect(0,7,W,2);
  x.fillStyle=trim;x.globalAlpha=.8;x.fillRect(0,34,W,3);x.globalAlpha=1;
  if(stripe){x.fillStyle=stripe;x.fillRect(0,12,W,20);grain(x,W,40,r,{alpha:.15,count:400});}
  // Top güvertesi şeridi
  if(ports>0){
    x.fillStyle=band;x.fillRect(0,40,W,34);grain(x,W,74,r,{alpha:.18,count:500,light:'#ffb08a'});
    x.fillStyle=trim;x.fillRect(0,40,W,2);x.fillRect(0,73,W,2);
    for(let i=0;i<ports;i++){const px=W*(.14+.72*(i+.5)/ports)-11;x.fillStyle=portLid;x.fillRect(px-2,44,26,27);x.fillStyle=portColor;x.fillRect(px+2,48,18,19);x.fillStyle='#ffffff18';x.fillRect(px-2,44,26,2);}
  }
  // Su hattı: katran ve bakır
  const g=x.createLinearGradient(0,H*.55,0,H);g.addColorStop(0,'#00000000');g.addColorStop(.35,tar+'cc');g.addColorStop(1,tar);x.fillStyle=g;x.fillRect(0,H*.55,W,H*.45);
  blotches(x,W,H,r,{alpha:.18,count:120,colors:['#0b0605','#5a3d28','#6b5a44']});
  return toTexture(c);
}

export function deckTexture({seed,wood='#8a6440',dark='#5b3f27'}){
  const W=512,H=512,[c,x]=canvas(W,H),r=rng(seed);
  x.fillStyle=wood;x.fillRect(0,0,W,H);
  for(let px=0;px<W;px+=16){x.fillStyle=r()<.5?wood:dark;x.globalAlpha=.25+r()*.3;x.fillRect(px,0,15,H);x.globalAlpha=.55;x.fillStyle='#2a1a0f';x.fillRect(px+15,0,1,H);
    for(let s=r()*90;s<H;s+=80+r()*120){x.fillRect(px,s,15,1);} }
  x.globalAlpha=1;grain(x,W,H,r,{alpha:.14,count:2400,light:'#d8b485',dark:'#2c1a0e',stretch:.6});
  blotches(x,W,H,r,{alpha:.12,count:70,colors:['#2c1a0e','#b99467']});
  return toTexture(c);
}

// Kaba kasnak/kale duvarı: pencereler ve yaldız.
export function castleTexture({seed,wood='#3b2418',trim='#c89a45',glass='#f2c46a',windows=4,frame='#1a0f0a'}){
  const W=512,H=256,[c,x]=canvas(W,H),r=rng(seed);
  x.fillStyle=wood;x.fillRect(0,0,W,H);grain(x,W,H,r,{alpha:.15,count:1500,light:'#b98a5e',dark:'#0a0604'});
  x.fillStyle=trim;x.fillRect(0,0,W,10);x.fillRect(0,H-14,W,6);
  for(let i=0;i<windows;i++){const wx=W*(i+.5)/windows-26;x.fillStyle=frame;x.fillRect(wx-6,54,64,110);
    const g=x.createLinearGradient(0,60,0,160);g.addColorStop(0,glass);g.addColorStop(1,'#8a4a1c');x.fillStyle=g;x.fillRect(wx,60,52,98);
    x.fillStyle=frame;x.fillRect(wx+24,60,4,98);x.fillRect(wx,104,52,4);x.fillStyle=trim;x.fillRect(wx-8,48,68,6);x.fillRect(wx-8,164,68,6);}
  return toTexture(c);
}

// Yelken: renk, dikiş, gölge, amblem, yırtık kenarlar.
export function sailTexture({seed,base='#d9ceb2',seam='#00000022',stripes=null,stripeColor='#8b2925',border=null,emblem=null,emblemColor='#1a1411',patches=0,patchColors=['#6b4a33'],ragged=0,dirt=.12}){
  const W=256,H=256,[c,x]=canvas(W,H),r=rng(seed);
  x.fillStyle=base;x.fillRect(0,0,W,H);
  if(stripes){for(let i=0;i<stripes;i++){if(i%2)continue;x.fillStyle=stripeColor;x.fillRect(W*i/stripes,0,W/stripes,H);}}
  for(let px=0;px<W;px+=W/9){x.fillStyle=seam;x.fillRect(px,0,2,H);}
  for(let py=H/5;py<H;py+=H/5){x.fillStyle='#00000012';x.fillRect(0,py,W,1);}
  for(let i=0;i<patches;i++){x.fillStyle=patchColors[i%patchColors.length];x.globalAlpha=.85;const pw=30+r()*50,ph=24+r()*44,px=r()*(W-pw),py=r()*(H-ph);x.fillRect(px,py,pw,ph);x.globalAlpha=.6;x.strokeStyle='#1d130c';x.setLineDash([3,3]);x.strokeRect(px+2,py+2,pw-4,ph-4);x.setLineDash([]);x.globalAlpha=1;}
  if(emblem)emblem(x,W,H,emblemColor);
  if(border){x.strokeStyle=border;x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);}
  grain(x,W,H,r,{alpha:.1,count:900,light:'#fff',dark:'#3a2a1a',stretch:.4});
  blotches(x,W,H,r,{alpha:dirt,count:40,colors:['#3b2b1c','#6d5a40']});
  // Kenar kararması
  const g=x.createRadialGradient(W/2,H/2,W*.2,W/2,H/2,W*.75);g.addColorStop(0,'#0000');g.addColorStop(1,'#00000055');x.fillStyle=g;x.fillRect(0,0,W,H);
  if(ragged){x.globalCompositeOperation='destination-out';for(let i=0;i<ragged;i++){const px=r()*W,py=H-r()*28;x.beginPath();x.moveTo(px-6-r()*10,H+2);x.lineTo(px,py);x.lineTo(px+6+r()*10,H+2);x.fill();}
    for(let i=0;i<ragged/3;i++){x.beginPath();x.arc(r()*W,r()*H*.8+20,2+r()*6,0,7);x.fill();}x.globalCompositeOperation='source-over';}
  const t=toTexture(c);return t;
}

export function flagTexture({seed,base,mark=null,markColor='#e8dcc0',tail=true}){
  const W=128,H=64,[c,x]=canvas(W,H),r=rng(seed);
  x.fillStyle=base;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);if(tail){x.lineTo(W*.78,H/2);}x.lineTo(W,H);x.lineTo(0,H);x.fill();
  if(mark)mark(x,W,H,markColor);
  grain(x,W,H,r,{alpha:.12,count:120});
  return toTexture(c);
}

// Canavar derisi: benekli, pullu.
export function skinTexture({seed,base='#2f5a53',dark='#153531',light='#6f9f86',spots='#c9c46a'}){
  const W=512,H=256,[c,x]=canvas(W,H),r=rng(seed);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dark);g.addColorStop(.5,base);g.addColorStop(1,light);x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=10)for(let px=(y/10%2)*8;px<W;px+=16){x.fillStyle='#00000026';x.beginPath();x.arc(px,y,7,0,Math.PI);x.fill();x.fillStyle='#ffffff10';x.beginPath();x.arc(px,y-1,6,Math.PI,0);x.fill();}
  blotches(x,W,H,r,{alpha:.35,count:90,colors:[dark,'#0b1f1d']});
  for(let i=0;i<60;i++){x.fillStyle=spots;x.globalAlpha=.25+r()*.5;x.beginPath();x.arc(r()*W,r()*H*.55,1.5+r()*3.5,0,7);x.fill();}
  x.globalAlpha=1;return toTexture(c);
}

// Dokunaç: üstte koyu, altta vantuz sırası.
export function tentacleTexture({seed,top='#1f4540',mid='#3b7466',under='#c9b890'}){
  const W=512,H=128,[c,x]=canvas(W,H),r=rng(seed);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,under);g.addColorStop(.18,mid);g.addColorStop(.5,top);g.addColorStop(.82,mid);g.addColorStop(1,under);
  x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let px=6;px<W;px+=14){for(const cy of [8,H-8]){x.fillStyle='#e8dcb4';x.beginPath();x.arc(px,cy,4.2,0,7);x.fill();x.fillStyle='#7a5a4a';x.beginPath();x.arc(px,cy,1.8,0,7);x.fill();}}
  blotches(x,W,H,r,{alpha:.3,count:70,colors:['#0b1f1d','#5e9a82']});
  return toTexture(c);
}

export function foamTexture({seed,color='255,255,255',strength=1,inner=.3}){
  const W=256,H=256,[c,x]=canvas(W,H),r=rng(seed);
  for(let i=0;i<900;i++){const a=r()*Math.PI*2,rad=W*(inner+r()*(.49-inner));const px=W/2+Math.cos(a)*rad,py=H/2+Math.sin(a)*rad;x.fillStyle=`rgba(${color},${(.05+r()*.28)*strength})`;x.beginPath();x.arc(px,py,1+r()*3.2,0,7);x.fill();}
  const g=x.createRadialGradient(W/2,H/2,W*.28,W/2,H/2,W*.5);g.addColorStop(0,`rgba(${color},0)`);g.addColorStop(.35,`rgba(${color},${.35*strength})`);g.addColorStop(.6,`rgba(${color},${.12*strength})`);g.addColorStop(1,`rgba(${color},0)`);x.fillStyle=g;x.fillRect(0,0,W,H);
  return toTexture(c);
}

export function chestWoodTexture({seed,wood='#6a4128',dark='#3d2415'}){
  const W=256,H=256,[c,x]=canvas(W,H),r=rng(seed);
  x.fillStyle=wood;x.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=32){x.fillStyle=r()<.5?wood:dark;x.globalAlpha=.4;x.fillRect(0,y,W,31);x.globalAlpha=.7;x.fillStyle='#1b0f07';x.fillRect(0,y+31,W,2);}
  x.globalAlpha=1;grain(x,W,H,r,{alpha:.2,count:900,light:'#c49366',dark:'#120a05'});
  return toTexture(c);
}

// Tekrarlanabilir değer gürültüsü (ada arazisi için).
export function noise2(seed){
  const r=rng(seed),N=256,perm=new Uint8Array(512),grad=new Float32Array(N);
  for(let i=0;i<N;i++){perm[i]=i;grad[i]=r()*2-1;}
  for(let i=N-1;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
  for(let i=0;i<N;i++)perm[i+N]=perm[i];
  const f=t=>t*t*(3-2*t),h=(x,y)=>grad[perm[(perm[x&255]+y)&511]];
  const n=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=f(xf),v=f(yf);
    const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  return(x,y,oct=4)=>{let s=0,amp=1,fr=1,norm=0;for(let o=0;o<oct;o++){s+=n(x*fr,y*fr)*amp;norm+=amp;amp*=.5;fr*=2.03;}return s/norm;};
}

// Sığlık: adanın etrafındaki turkuaz halka.
export function shallowTexture({seed,inner='#6fd6c4',outer='#1f6f77',alpha=.75}){
  const W=512,[c,x]=canvas(W,W),r=rng(seed);
  const g=x.createRadialGradient(W/2,W/2,W*.2,W/2,W/2,W/2);
  g.addColorStop(0,inner);g.addColorStop(.62,inner);g.addColorStop(.8,outer);g.addColorStop(1,outer+'00');
  x.globalAlpha=alpha;x.fillStyle=g;x.fillRect(0,0,W,W);x.globalAlpha=1;
  for(let i=0;i<700;i++){const a=r()*Math.PI*2,d=W*(.3+r()*.2);x.fillStyle=`rgba(255,255,255,${r()*.18})`;x.beginPath();x.arc(W/2+Math.cos(a)*d,W/2+Math.sin(a)*d,1+r()*3,0,7);x.fill();}
  return toTexture(c);
}

export function stoneTexture({seed,base='#6d6a60',dark='#3b3a35',moss='#4d6a3a'}){
  const W=256,[c,x]=canvas(W,W),r=rng(seed);
  x.fillStyle=base;x.fillRect(0,0,W,W);
  for(let y=0;y<W;y+=32){for(let px=(y/32%2)*24;px<W;px+=48){x.fillStyle=r()<.5?base:dark;x.globalAlpha=.5;x.fillRect(px,y,46,30);x.globalAlpha=.8;x.strokeStyle='#1c1b18';x.strokeRect(px+.5,y+.5,46,30);}}
  x.globalAlpha=1;blotches(x,W,W,r,{alpha:.4,count:40,colors:[moss,dark]});grain(x,W,W,r,{alpha:.15,count:900});
  return toTexture(c);
}

// Girdap: üç kollu sarmal, parlak merkez.
export function vortexTexture({seed,core='#e8fff8',arm='#4fe0d0',deep='#08323a'}){
  const W=512,[c,x]=canvas(W,W),r=rng(seed);
  const g=x.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);g.addColorStop(0,core);g.addColorStop(.18,arm);g.addColorStop(.7,deep);g.addColorStop(1,deep+'00');
  x.fillStyle=g;x.fillRect(0,0,W,W);
  x.translate(W/2,W/2);
  for(let k=0;k<3;k++){for(let i=0;i<220;i++){const t=i/220,a=k*Math.PI*2/3+t*Math.PI*3.2,d=t*W*.46;x.fillStyle=`rgba(210,255,245,${(1-t)*.5*(.5+r()*.5)})`;x.beginPath();x.arc(Math.cos(a)*d,Math.sin(a)*d,2+(1-t)*9,0,7);x.fill();}}
  x.setTransform(1,0,0,1,0,0);
  return toTexture(c);
}

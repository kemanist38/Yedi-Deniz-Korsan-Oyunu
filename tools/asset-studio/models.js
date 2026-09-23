// Kara Yelken — düşman filosu, Derinlik Leviathanı ve ganimet sandıkları için 3B modeller.
// Eksenler: +Z pruva, +Y yukarı, +X sancak. Güverte ortası (0,0,0).
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.82,metalness:0,...o});
const smooth=(e0,e1,v)=>{const t=Math.min(1,Math.max(0,(v-e0)/(e1-e0)));return t*t*(3-2*t);};

// ---------------------------------------------------------------- Gövde
function hullShape(p){
  const {L,B,sternW=.62,bowRise=3,sternRise=4}=p;
  const w=t=>{
    if(t<.42)return B/2*(sternW+(1-sternW)*smooth(0,.42,t));
    const k=(t-.42)/.58;return B/2*Math.pow(Math.max(0,1-k*k),.62);
  };
  const top=t=>t>.5?bowRise*Math.pow((t-.5)/.5,2):sternRise*Math.pow((.5-t)/.5,2.2);
  const bot=t=>-p.D*(t>.8?1-.55*Math.pow((t-.8)/.2,1.6):1)*(t<.08?.85+t*1.9:1);
  const z=t=>-L/2+t*L;
  return{w,top,bot,z};
}

function buildHull(p,mats){
  const g=new THREE.Group(),S=hullShape(p),NS=48,NP=24;
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=NS;i++){const t=i/NS,w=Math.max(S.w(t),.02),yt=S.top(t),yb=S.bot(t);
    for(let j=0;j<=NP;j++){const s=j/NP,th=(s-.5)*Math.PI;
      const x=w*Math.sign(Math.sin(th))*Math.pow(Math.abs(Math.sin(th)),.55);
      const y=yt-(yt-yb)*Math.pow(Math.abs(Math.cos(th)),.75);
      pos.push(x,y,S.z(t));uv.push(t,Math.abs(s-.5)*2);}
  }
  for(let i=0;i<NS;i++)for(let j=0;j<NP;j++){const a=i*(NP+1)+j,b=a+NP+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const hull=new THREE.Mesh(geo,mats.hull);g.add(hull);
  // Ayna kıç: kıçtaki kesiti kapat
  const tp=[],ti=[];const c0=S.z(0);tp.push(0,(S.top(0)+S.bot(0))/2,c0);
  for(let j=0;j<=NP;j++){tp.push(pos[j*3],pos[j*3+1],c0);}for(let j=1;j<=NP;j++)ti.push(0,j+1,j);
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));tg.setIndex(ti);tg.computeVertexNormals();
  g.add(new THREE.Mesh(tg,mats.transom));
  // Güverte
  const dp=[],du=[],di=[],bh=p.bulwark??1;
  for(let i=0;i<=NS;i++){const t=i/NS,w=Math.max(S.w(t)*.93,.01),y=S.top(t)-bh;dp.push(-w,y,S.z(t),w,y,S.z(t));du.push(0,t*p.L/10,1,t*p.L/10);}
  for(let i=0;i<NS;i++){const a=i*2;di.push(a,a+2,a+1,a+1,a+2,a+3);}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(dp,3));dg.setAttribute('uv',new THREE.Float32BufferAttribute(du,2));dg.setIndex(di);dg.computeVertexNormals();
  const deck=new THREE.Mesh(dg,mats.deck);g.add(deck);
  return{group:g,shape:S};
}

function cyl(r0,r1,h,mat,seg=10){return new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,seg),mat);}
function between(a,b,r,mat){const d=new THREE.Vector3().subVectors(b,a),m=cyl(r,r,d.length(),mat,6);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return m;}

// Kare yelken: yardaya asılı, rüzgârla pruvaya doğru şişkin.
function squareSail(width,height,bulge,mat,{taper=.12}={}){
  const geo=new THREE.PlaneGeometry(1,1,14,12),pa=geo.attributes.position;
  for(let i=0;i<pa.count;i++){const u=pa.getX(i)+.5,v=pa.getY(i)+.5;const wv=width*(1+taper*(1-v));pa.setX(i,(u-.5)*wv);pa.setY(i,(v-1)*height);pa.setZ(i,bulge*Math.sin(Math.PI*u)*Math.sin(Math.PI*Math.min(1,v*1.05+.05))*.9+bulge*.25*(1-v));}
  geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
// Baştan kıça yelken (gafa veya flok): dört köşe, YZ düzleminde.
function foreAftSail(corners,bulge,mat){
  const [a,b,c,d]=corners.map(v=>new THREE.Vector3(...v)),geo=new THREE.PlaneGeometry(1,1,10,10),pa=geo.attributes.position;
  for(let i=0;i<pa.count;i++){const u=pa.getX(i)+.5,v=pa.getY(i)+.5;
    const top=new THREE.Vector3().lerpVectors(d,c,u),bottom=new THREE.Vector3().lerpVectors(a,b,u),pt=new THREE.Vector3().lerpVectors(bottom,top,v);
    pt.x+=bulge*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);pa.setXYZ(i,pt.x,pt.y,pt.z);}
  geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
function flag(len,h,mat,wave=.25){
  const geo=new THREE.PlaneGeometry(len,h,10,2),pa=geo.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i)+len/2;pa.setX(i,x);pa.setZ(i,Math.sin(x/len*Math.PI*2.2)*wave*x/len*len*.18);}
  geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);return m;
}

// ---------------------------------------------------------------- Gemi
const wrapHalf=a=>{a=((a+Math.PI/2)%Math.PI+Math.PI)%Math.PI-Math.PI/2;return a;};
const clampA=(v,m)=>Math.max(-m,Math.min(m,v));
// heading: pusula açısı (0 = kuzey, saat yönü). Sereneler ve gafa yelkeni gerçekçi sınırlar
// içinde kameraya doğru kırılır; böylece her yönde yelken okunur kalır.
export function buildShip(def,{heading=Math.PI*1.25}={}){
  const root=new THREE.Group(),seed=def.seed;
  const brace=clampA(-wrapHalf(Math.PI-heading),.6),swing=clampA(wrapHalf(heading-Math.PI/2),.5);
  const mats={
    hull:std({map:T.hullTexture({seed,...def.hullPaint}),side:THREE.DoubleSide}),
    transom:std({color:def.hullPaint.plank||'#3a2519'}),
    deck:std({map:T.deckTexture({seed:seed+1,...(def.deckPaint||{})})}),
    wood:std({color:def.spar||'#4a3121',roughness:.9}),
    trim:std({color:def.hullPaint.trim||'#c89a45',metalness:.55,roughness:.38}),
    iron:std({color:'#1b1c1e',metalness:.6,roughness:.45}),
    rope:new THREE.LineBasicMaterial({color:'#20160f',transparent:true,opacity:.75}),
  };
  const {group:hullG,shape:S}=buildHull(def.hull,mats);root.add(hullG);
  const deckY=t=>S.top(t)-(def.hull.bulwark??1);
  const tAt=z=>(z+def.hull.L/2)/def.hull.L;
  // Kaleler (kıç ve baş kasarası)
  for(const c of def.castles||[]){
    const t0=c.from,t1=c.to,len=(t1-t0)*def.hull.L,wd=Math.min(S.w(t0),S.w(t1))*2*.9,zc=S.z((t0+t1)/2),y0=deckY((t0+t1)/2);
    const tex=T.castleTexture({seed:seed+7,wood:def.hullPaint.plank,trim:def.hullPaint.trim,windows:c.windows||3,glass:c.glass||'#f2c46a'});
    const side=std({map:tex}),top=std({map:mats.deck.map});
    const box=new THREE.Mesh(new THREE.BoxGeometry(wd,c.h,len),[side,side,top,side,side,side]);box.position.set(0,y0+c.h/2,zc);root.add(box);
    for(const [bw,bl,bx,bz] of [[wd+.4,.4,0,-len/2],[wd+.4,.4,0,len/2],[.4,len,-wd/2,0],[.4,len,wd/2,0]]){const rail=new THREE.Mesh(new THREE.BoxGeometry(bw,.7,bl),mats.trim);rail.position.set(bx,y0+c.h+.35,zc+bz);root.add(rail);}
    if(c.lanterns){for(const sx of [-1,1]){const l=new THREE.Mesh(new THREE.SphereGeometry(.7,10,8),std({color:def.glow||'#ffd27a',emissive:def.glow||'#ffb54a',emissiveIntensity:1.6}));l.position.set(sx*wd*.42,y0+c.h+1.2,S.z(t0)+.4);root.add(l);const post=cyl(.12,.12,1,mats.trim);post.position.set(sx*wd*.42,y0+c.h+.55,S.z(t0)+.4);root.add(post);}}
  }
  // Toplar
  if(def.guns){const n=def.guns.count;for(let i=0;i<n;i++){const t=.14+.72*(i+.5)/n;for(const sx of [-1,1]){const th=.39*Math.PI,w=S.w(t)*Math.pow(Math.sin(th),.55),y=S.top(t)-(S.top(t)-S.bot(t))*Math.pow(Math.cos(th),.75);const gun=cyl(.38,.46,2.4,mats.iron,8);gun.rotation.z=Math.PI/2;gun.position.set(sx*(w+.5),y,S.z(t));root.add(gun);}}}
  // Güverte yükü
  const r=T.rng(seed+3);
  for(let i=0;i<(def.cargo||0);i++){const t=.28+r()*.4,w=S.w(t)*.55;const crate=r()<.5?new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4),std({color:'#6e4a2c'})):cyl(.65,.65,1.4,std({color:'#5a3a22'}),10);crate.position.set((r()*2-1)*w,deckY(t)+.7,S.z(t));crate.rotation.y=r()*3;root.add(crate);}
  // Cıvadra
  const bowT=1,bowZ=S.z(bowT)-.5,bowY=S.top(bowT)-.2;
  const bsEnd=new THREE.Vector3(0,bowY+def.bowsprit*.35,bowZ+def.bowsprit);
  root.add(between(new THREE.Vector3(0,bowY-.4,bowZ-3),bsEnd,.32,mats.wood));
  if(def.figurehead){const fh=new THREE.Mesh(new THREE.SphereGeometry(.9,10,8),mats.trim);fh.scale.set(.7,1,1.4);fh.position.set(0,bowY-1.2,bowZ+.6);root.add(fh);}
  // Direkler, sereneler, yelkenler
  const ropes=[];
  const sailMats=def.sails.map((s,i)=>{const map=T.sailTexture({seed:seed+20+i,...s});return std({map,side:THREE.DoubleSide,transparent:!!s.ragged,alphaTest:.4,roughness:.95,...(def.glow?{emissive:def.glow,emissiveMap:map,emissiveIntensity:.55}:{})});});
  let foreTop=null,mainTop=null;
  def.masts.forEach((m,mi)=>{
    const z=S.z(m.t),y0=deckY(m.t),top=y0+m.h;
    const mast=cyl(m.r*1.0,m.r*1.45,m.h,mats.wood,10);mast.position.set(0,y0+m.h/2,z);root.add(mast);
    // Direk üstü ve bayrak
    const cap=cyl(m.r*1.6,m.r*1.6,.5,mats.trim,10);cap.position.set(0,top,z);root.add(cap);
    if(m.flag){const fm=std({map:T.flagTexture({seed:seed+40+mi,...def.flag}),side:THREE.DoubleSide});const f=flag(m.flag,m.flag*.42,fm);f.position.set(0,top+.6,z);f.rotation.y=Math.PI/2+.5;root.add(f);}
    for(const yd of m.yards||[]){const yy=y0+yd.y,pivot=new THREE.Group();pivot.position.set(0,yy,z);pivot.rotation.y=brace;root.add(pivot);
      const yard=cyl(.3,.3,yd.w,mats.wood,6);yard.rotation.z=Math.PI/2;yard.position.set(0,0,.3);pivot.add(yard);
      const sail=squareSail(yd.w*.94,yd.drop,yd.bulge??1.6,sailMats[yd.sail??0]);sail.position.set(0,-.2,.55);pivot.add(sail);
      ropes.push([new THREE.Vector3(-yd.w/2,yy,z+.3),new THREE.Vector3(-S.w(m.t)*.95,y0,z-2.5)],[new THREE.Vector3(yd.w/2,yy,z+.3),new THREE.Vector3(S.w(m.t)*.95,y0,z-2.5)]);}
    if(m.gaff){const g=m.gaff,gs=sailMats[g.sail??0];
      const pivot=new THREE.Group();pivot.position.set(0,0,z);pivot.rotation.y=swing;root.add(pivot);
      pivot.add(foreAftSail([[0,y0+g.foot,-.4],[0,y0+g.foot,-g.len],[0,y0+g.peak,-g.len*1.05],[0,y0+g.throat,-.4]],g.bulge??1.4,gs));
      pivot.add(between(new THREE.Vector3(0,y0+g.foot,0),new THREE.Vector3(0,y0+g.foot,-g.len-.4),.28,mats.wood));
      pivot.add(between(new THREE.Vector3(0,y0+g.throat,0),new THREE.Vector3(0,y0+g.peak,-g.len*1.05),.24,mats.wood));}
    // Çarmıh halatları
    for(const sx of [-1,1])for(const dz of [-1.5,.2,1.9])ropes.push([new THREE.Vector3(0,top-.6,z),new THREE.Vector3(sx*S.w(m.t)*.98,S.top(m.t)-.2,z+dz)]);
    if(mi===0)foreTop=new THREE.Vector3(0,top-1,z);mainTop=new THREE.Vector3(0,top-1,z);
  });
  // Flok
  if(def.jib){const j=def.jib,js=sailMats[j.sail??0];const tip=bsEnd.clone(),mt=foreTop.clone();mt.y-=j.drop??0;
    const sail=foreAftSail([[0,bowY+1,bowZ-1.5],[0,tip.y,tip.z-.5],[0,tip.y+.2,tip.z-.3],[0,mt.y,mt.z+.5]],j.bulge??1,js);root.add(sail);
    ropes.push([mt,tip]);}
  // Direkler arası halat
  const tops=def.masts.map(m=>new THREE.Vector3(0,deckY(m.t)+m.h-.6,S.z(m.t)));for(let i=0;i+1<tops.length;i++)ropes.push([tops[i+1],tops[i]]);
  ropes.push([tops[0],bsEnd]);ropes.push([tops[tops.length-1],new THREE.Vector3(0,S.top(0)+.5,S.z(0))]);
  const rp=[];ropes.forEach(([a,b])=>rp.push(a.x,a.y,a.z,b.x,b.y,b.z));
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));root.add(new THREE.LineSegments(rg,mats.rope));
  root.userData.waterline=S.bot(.5)*(def.hull.waterline??.55);
  return root;
}

// ---------------------------------------------------------------- Amblemler
const emblems={
  // Gözcü: tek dalga ve göz — kaçakçıların işareti
  wave:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(W*.26,H*.6);x.bezierCurveTo(W*.38,H*.42,W*.5,H*.78,W*.62,H*.58);x.bezierCurveTo(W*.68,H*.48,W*.74,H*.52,W*.76,H*.6);x.stroke();x.fillStyle=c;x.beginPath();x.arc(W*.5,H*.38,14,0,7);x.fill();},
  // Yağmacılar: çapraz kanca ve kırık kürek
  hooks:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=13;x.lineCap='round';
    for(const s of [-1,1]){x.beginPath();x.moveTo(W/2-s*52,H*.72);x.lineTo(W/2+s*30,H*.34);x.stroke();x.beginPath();x.arc(W/2+s*42,H*.36,16,s>0?Math.PI*1.1:-Math.PI*.1,s>0?Math.PI*2.05:Math.PI*.85,s<0);x.stroke();}
    x.fillStyle=c;x.beginPath();x.arc(W/2,H*.55,17,0,7);x.fill();},
  // Kızıl Savaş Gemisi: pusula güneşi
  sun:(x,W,H,c)=>{x.save();x.translate(W/2,H*.5);x.fillStyle=c;for(let i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,-72);x.lineTo(10,-30);x.lineTo(-10,-30);x.closePath();x.fill();}x.beginPath();x.arc(0,0,30,0,7);x.fill();x.fillStyle='#6d1a17';x.beginPath();x.arc(0,0,17,0,7);x.fill();x.fillStyle=c;x.beginPath();x.moveTo(0,-15);x.lineTo(5,0);x.lineTo(0,15);x.lineTo(-5,0);x.fill();x.restore();},
};
const flagMarks={
  eye:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.ellipse(W*.38,H/2,16,9,0,0,7);x.fill();x.fillStyle='#1a2a2e';x.beginPath();x.arc(W*.38,H/2,5,0,7);x.fill();},
  hook:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(W*.38,H*.15);x.lineTo(W*.38,H*.62);x.arc(W*.3,H*.62,W*.08,0,Math.PI*.9);x.stroke();},
  sun:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W*.36,H/2,10,0,7);x.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;x.fillRect(W*.36+Math.cos(a)*14-2,H/2+Math.sin(a)*14-2,4,4);}},
};

// ---------------------------------------------------------------- Filo tanımları
export const FLEET={
  // Kaçakçı Gözcü — hızlı, tek direkli şalupa. Kurşun-yeşil yelken.
  scout:{seed:101,
    hull:{L:40,B:13.5,D:8,bowRise:2.6,sternRise:2.8,sternW:.52,bulwark:1,waterline:.72},
    hullPaint:{plank:'#3d3a33',plankDark:'#26241f',trim:'#9ab8b5',tar:'#141718',stripe:'#4d6c75'},
    deckPaint:{wood:'#6f5d45',dark:'#4a3d2c'},spar:'#3a3129',
    sails:[{base:'#b7c7c0',stripes:0,emblem:emblems.wave,emblemColor:'#2c4a52',dirt:.16},{base:'#c3d0c8',dirt:.12}],
    masts:[{t:.56,h:30,r:.6,flag:4,gaff:{foot:2.2,throat:24,peak:28,len:16,sail:0,bulge:1.6}}],
    jib:{sail:1,bulge:1.3,drop:1},bowsprit:9,cargo:3,
    flag:{base:'#2f5560',mark:flagMarks.eye,markColor:'#d9e6df'},
    castles:[{from:0,to:.14,h:1.6,windows:2,glass:'#a9d6d0'}],
  },
  // Yağmacılar — iki direkli brigantin, yamalı pas rengi yelkenler.
  raider:{seed:202,
    hull:{L:52,B:16.5,D:9.5,bowRise:3,sternRise:4,sternW:.6,bulwark:1.2,waterline:.72},
    hullPaint:{plank:'#3a2418',plankDark:'#211309',trim:'#a9824a',tar:'#150d09',band:'#5b2a20',ports:4,portLid:'#79372f'},
    deckPaint:{wood:'#654731',dark:'#3f2a1a'},spar:'#3b281b',
    sails:[{base:'#8e4a34',patches:4,patchColors:['#6b4a33','#a5693f','#5a3325'],ragged:26,emblem:emblems.hooks,emblemColor:'#1c120d',dirt:.25},
           {base:'#9a5a3d',patches:3,patchColors:['#6b4a33','#b07a4f'],ragged:18,dirt:.25},
           {base:'#a8674a',patches:2,ragged:10,dirt:.2}],
    masts:[{t:.66,h:36,r:.75,flag:5,yards:[{y:33,w:17,drop:12,sail:0,bulge:1.9},{y:20.5,w:20,drop:13,sail:1,bulge:2}]},
           {t:.33,h:38,r:.8,flag:5,gaff:{foot:2.5,throat:30,peak:35,len:19,sail:2,bulge:1.5}}],
    jib:{sail:2,bulge:1.2,drop:2},bowsprit:11,cargo:4,guns:{count:4},
    flag:{base:'#171311',mark:flagMarks.hook,markColor:'#e0d2b4'},
    castles:[{from:0,to:.17,h:2.4,windows:3,glass:'#e3a653',lanterns:true}],
  },
  // Kızıl Savaş Gemisi — üç direkli fırkateyn, koyu kızıl yelken ve yaldız.
  warship:{seed:303,
    hull:{L:64,B:19.5,D:11,bowRise:3.8,sternRise:5,sternW:.66,bulwark:1.4,waterline:.72},
    hullPaint:{plank:'#221512',plankDark:'#140b09',trim:'#d4a64c',tar:'#0f0908',band:'#7d1f1b',ports:7,portLid:'#a3302a'},
    deckPaint:{wood:'#6e5033',dark:'#48321f'},spar:'#2f1f16',
    sails:[{base:'#8e231f',border:'#d4a64c',emblem:emblems.sun,emblemColor:'#e2b75a',dirt:.1},
           {base:'#9c2a24',border:'#c8963f',dirt:.1},{base:'#a3322b',dirt:.08}],
    masts:[{t:.72,h:40,r:.85,flag:6,yards:[{y:37,w:15,drop:9,sail:1},{y:27.5,w:19,drop:10.5,sail:1},{y:16.5,w:23,drop:11.5,sail:1,bulge:2.1}]},
           {t:.46,h:46,r:.95,flag:8,yards:[{y:43,w:17,drop:10,sail:1},{y:32,w:21.5,drop:12,sail:1},{y:19,w:26,drop:13.5,sail:0,bulge:2.3}]},
           {t:.2,h:36,r:.8,flag:5,yards:[{y:33,w:13,drop:8.5,sail:2},{y:23.5,w:16.5,drop:9.5,sail:2}],gaff:{foot:3,throat:14,peak:18,len:12,sail:2,bulge:1}}],
    jib:{sail:2,bulge:1.2,drop:3},bowsprit:14,cargo:2,guns:{count:7},figurehead:true,
    flag:{base:'#a01f1c',mark:flagMarks.sun,markColor:'#f0c766'},
    castles:[{from:0,to:.2,h:3.2,windows:4,glass:'#ffc86a',lanterns:true},{from:.83,to:.93,h:1.6,windows:2}],
  },
  // Hayalet Amiral — batıktan dönen dev kalyon. Soluk yeşil, ışıldayan yırtık yelkenler.
  ghost:{seed:404,
    hull:{L:74,B:21,D:12,bowRise:4,sternRise:6,sternW:.7,bulwark:1.5,waterline:.72},
    hullPaint:{plank:'#1d2422',plankDark:'#0e1312',trim:'#7fe0b8',tar:'#050807',band:'#1f3a33',ports:8,portLid:'#2f5a4a',portColor:'#6dffc4'},
    deckPaint:{wood:'#3a3f38',dark:'#22271f'},spar:'#1a1e1b',
    sails:[{base:'#9fd8c0',ragged:40,patches:3,patchColors:['#6aa892','#bfe8d6'],emblem:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W/2,H*.42,40,0,7);x.fill();x.fillStyle='#9fd8c0';for(const sx of [-16,16]){x.beginPath();x.arc(W/2+sx,H*.4,10,0,7);x.fill();}x.fillRect(W/2-22,H*.58,44,12);x.fillStyle=c;for(let i=0;i<4;i++)x.fillRect(W/2-18+i*11,H*.58,4,12);},emblemColor:'#16302a',dirt:.3},
           {base:'#a8dcc6',ragged:34,patches:2,patchColors:['#6aa892'],dirt:.3},{base:'#b4e2cf',ragged:26,dirt:.25}],
    masts:[{t:.74,h:44,r:.9,flag:6,yards:[{y:41,w:16,drop:9,sail:1},{y:30.5,w:21,drop:11,sail:1},{y:18.5,w:25,drop:12.5,sail:1,bulge:2.1}]},
           {t:.47,h:52,r:1,flag:9,yards:[{y:49,w:18,drop:10,sail:1},{y:37,w:23,drop:12.5,sail:1},{y:23,w:28,drop:14.5,sail:0,bulge:2.4}]},
           {t:.2,h:40,r:.85,flag:5,yards:[{y:37,w:14,drop:9,sail:2},{y:26.5,w:18,drop:10,sail:2}],gaff:{foot:3,throat:16,peak:20,len:13,sail:2,bulge:1}}],
    jib:{sail:2,bulge:1.2,drop:3},bowsprit:16,cargo:2,guns:{count:8},figurehead:true,glow:'#6dffc4',
    flag:{base:'#0e1a17',mark:flagMarks.eye,markColor:'#8dffd0'},
    castles:[{from:0,to:.22,h:4,windows:4,glass:'#8dffd0',lanterns:true},{from:.82,to:.93,h:2,windows:2,glass:'#8dffd0'}],
  },
};

// ---------------------------------------------------------------- Derinlik Leviathanı
function taperedTube(curve,r0,r1,mat,seg=48,radial=10){
  const geo=new THREE.TubeGeometry(curve,seg,1,radial,false),pa=geo.attributes.position,frames=curve.computeFrenetFrames(seg,false);
  for(let i=0;i<=seg;i++){const t=i/seg,c=curve.getPointAt(t),rad=r0+(r1-r0)*Math.pow(t,.8);
    for(let j=0;j<=radial;j++){const k=i*(radial+1)+j,v=new THREE.Vector3(pa.getX(k),pa.getY(k),pa.getZ(k)).sub(c).multiplyScalar(rad).add(c);pa.setXYZ(k,v.x,v.y,v.z);}}
  geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
export const LEVIATHAN_LOOKS={
  deep:{seed:909,skin:{},tentacle:{},eye:['#ffcf3a','#ff9a1f'],spike:'#1a3a36',brow:'#16322f',foam:'214,240,232'},
  storm:{seed:919,skin:{base:'#3d3563',dark:'#191331',light:'#8577b8',spots:'#8fe8ff'},tentacle:{top:'#231c42',mid:'#4f4485',under:'#b9b3d9'},eye:['#b8fbff','#34d6ff'],spike:'#15102b',brow:'#1c1636',foam:'200,214,255'},
};
export function buildLeviathan(phase,look='deep'){
  const L=LEVIATHAN_LOOKS[look],root=new THREE.Group(),seed=L.seed;
  const skin=std({map:T.skinTexture({seed,...L.skin}),roughness:.55,metalness:.05});
  const tmat=std({map:T.tentacleTexture({seed:seed+1,...L.tentacle}),roughness:.5});
  // Gövde: sudan yükselen kubbe ve sırt dikenleri
  const bodyGeo=new THREE.SphereGeometry(20,48,32),bp=bodyGeo.attributes.position,r=T.rng(seed);
  for(let i=0;i<bp.count;i++){const v=new THREE.Vector3(bp.getX(i),bp.getY(i),bp.getZ(i));const n=1+.05*Math.sin(v.x*.5+v.z*.3)+.04*Math.sin(v.z*.9-v.y*.4);v.multiplyScalar(n);bp.setXYZ(i,v.x*1.05,v.y*.62,v.z*1.25);}
  bodyGeo.computeVertexNormals();const body=new THREE.Mesh(bodyGeo,skin);body.position.set(0,-2+Math.sin(phase)*.8,0);root.add(body);
  for(let i=0;i<7;i++){const z=-16+i*4.6,h=5.5-Math.abs(i-2.5)*.9;const sp=new THREE.Mesh(new THREE.ConeGeometry(1.5,h,6),std({color:L.spike,roughness:.4}));sp.position.set(0,10.5-Math.abs(z)*.14+h/2-1+Math.sin(phase)*.8,z);sp.rotation.x=-.35;root.add(sp);}
  // Gözler ve ağız (+Z yönü = ekranın aşağısı, oyuncuya bakar)
  const eyeMat=std({color:L.eye[0],emissive:L.eye[1],emissiveIntensity:2.2,roughness:.2});
  for(const sx of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(2.4,16,12),eyeMat);e.scale.set(1.35,.62,1);e.rotation.z=sx*.38;e.position.set(sx*6.6,5.4+Math.sin(phase)*.8,19.6);root.add(e);
    const pupil=new THREE.Mesh(new THREE.BoxGeometry(.55,2.6,.6),std({color:'#110c05'}));pupil.position.set(sx*6.6,5.4+Math.sin(phase)*.8,21.8);root.add(pupil);
    const brow=new THREE.Mesh(new THREE.ConeGeometry(1.4,5,6),std({color:L.brow}));brow.position.set(sx*7.4,7.6+Math.sin(phase)*.8,18.6);brow.rotation.z=sx*1.25;brow.rotation.x=.9;root.add(brow);}
  for(let k=0;k<9;k++){const a=Math.PI*(.15+.7*k/8),tooth=new THREE.Mesh(new THREE.ConeGeometry(.55,2.2,5),std({color:'#e9e0c4',roughness:.35}));tooth.position.set(Math.cos(a)*4.6,.6-Math.sin(a)*1.6+Math.sin(phase)*.8,22.4);tooth.rotation.x=Math.PI;root.add(tooth);}
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(4.2,.9,8,24,Math.PI),std({color:'#0d1a18'}));mouth.position.set(0,1.2+Math.sin(phase)*.8,22.6);mouth.rotation.z=Math.PI;root.add(mouth);
  // Dokunaçlar
  const N=8;
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2+.2,w=phase+i*1.7;
    const dir=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),side=new THREE.Vector3(-dir.z,0,dir.x);
    const reach=34+7*Math.sin(i*2.3),arc=16+7*Math.sin(w);
    const pts=[0,.25,.5,.72,.88,1].map((k,n)=>{const p=dir.clone().multiplyScalar(14+k*reach);p.y=-3+Math.sin(k*Math.PI)*arc-k*6;p.addScaledVector(side,Math.sin(w+k*3.2)*7*k);if(n===5){p.y+=Math.sin(w*1.3)*5;}return p;});
    root.add(taperedTube(new THREE.CatmullRomCurve3(pts),4.6,.45,tmat));}
  // Köpük halkası
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(64,64),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:seed+5,color:L.foam,strength:.55,inner:.36}),transparent:true,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.y=.05;root.add(foam);
  root.userData.waterline=0;return root;
}

// ---------------------------------------------------------------- Ganimet sandıkları
export function buildChest(kind){
  const root=new THREE.Group(),gilded=kind==='gilded';
  const wood=std({map:T.chestWoodTexture({seed:gilded?72:71,wood:gilded?'#6e2a22':'#6a4128',dark:gilded?'#3d1512':'#3d2415'})});
  const band=std({color:gilded?'#e0b24e':'#34302b',metalness:gilded?.8:.6,roughness:gilded?.28:.5});
  const body=new THREE.Mesh(new THREE.BoxGeometry(12,7,8),wood);body.position.y=3.5;root.add(body);
  const lidG=new THREE.CylinderGeometry(4,4,12,20,1,false,0,Math.PI);const lid=new THREE.Mesh(lidG,wood);lid.rotation.z=Math.PI/2;lid.rotation.y=Math.PI/2;lid.rotation.x=0;lid.position.y=7;
  lid.rotation.set(0,0,Math.PI/2);lid.scale.set(1,1,1);root.add(lid);
  // Bantlar
  for(const x of [-4.2,0,4.2]){const b=new THREE.Mesh(new THREE.BoxGeometry(1,7.2,8.25),band);b.position.set(x,3.5,0);root.add(b);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(4.1,.5,6,20,Math.PI),band);arc.position.set(x,7,0);arc.rotation.y=Math.PI/2;root.add(arc);}
  const edge=new THREE.Mesh(new THREE.BoxGeometry(12.3,.7,8.3),band);edge.position.y=6.9;root.add(edge);
  const lock=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.6,.9),std({color:'#f1c35a',metalness:.9,roughness:.25,emissive:gilded?'#6a4a10':'#000'}));lock.position.set(0,6.2,4.3);root.add(lock);
  if(gilded){// kenarlardan taşan inciler ve altın
    const pearl=std({color:'#f4efe2',roughness:.15,metalness:.2});const coin=std({color:'#f0c04a',metalness:.9,roughness:.25});
    const r=T.rng(5);for(let i=0;i<9;i++){const m=new THREE.Mesh(i%3?new THREE.CylinderGeometry(.9,.9,.25,14):new THREE.SphereGeometry(.7,10,8),i%3?coin:pearl);m.position.set(-4+r()*8,1.9+r()*.8,5+r()*2.5);m.rotation.set(r()*2,r()*2,r()*2);root.add(m);}}
  // Yüzen tahta parçaları
  const plank=std({color:'#5b3b24'});const r=T.rng(gilded?9:8);
  for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(7+r()*4,.8,2),plank);const a=r()*6;p.position.set(Math.cos(a)*9,.25,Math.sin(a)*8);p.rotation.y=a+1.2;p.userData.float=true;root.add(p);}
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(25,25),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:gilded?33:31,color:gilded?'255,236,180':'225,245,240',strength:.6,inner:.34}),transparent:true,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.y=.02;foam.userData.float=true;root.add(foam);
  root.children.forEach(ch=>{if(!ch.userData.float)ch.position.y-=1.5;});root.userData.waterline=0;
  return root;
}

// ---------------------------------------------------------------- Adalar
// Ada yarıçapı ~100 birim; kıyı ~78. Oyunda çizim boyu = 2.36 × ada yarıçapı.
export const ISLAND_LOOKS={
  verdant:{sand:'#d9c48a',grass:'#3f6a35',grass2:'#5e8a40',rock:'#6f6655',peak:'#8b8270',shallow:['#74dccb','#1f6f77'],height:22,trees:'palm',treeCount:38,rocks:8},
  misty:{sand:'#a9a58f',grass:'#3f5d4a',grass2:'#56705a',rock:'#5b605c',peak:'#9aa19c',shallow:['#6fb8b8','#1d5a63'],height:30,trees:'pine',treeCount:44,rocks:16,rugged:1.4},
  coral:{sand:'#ecd9a6',grass:'#4d7a3a',grass2:'#72964a',rock:'#8a7a60',peak:'#a09070',shallow:['#8ff0dc','#2a8a8c'],height:14,trees:'palm',treeCount:26,rocks:4,coral:30},
  haven:{sand:'#e6d39c',grass:'#4a7a3c',grass2:'#6e9a4a',rock:'#7c7263',peak:'#958a78',shallow:['#86ecd8','#237d80'],height:20,trees:'palm',treeCount:30,rocks:6,lighthouse:true},
  crimson:{sand:'#caa27a',grass:'#7a5a36',grass2:'#94703f',rock:'#8a3b2c',peak:'#b0553d',shallow:['#d69a7e','#5b2a2a'],height:26,trees:'dead',treeCount:16,rocks:18,rugged:1.3,ruins:true},
  storm:{sand:'#6e6a66',grass:'#2e3530',grass2:'#3d4640',rock:'#26262b',peak:'#3a3940',shallow:['#6f86a8','#1c2740'],height:34,trees:'pine',treeCount:14,rocks:20,rugged:1.6,volcano:true},
};
function palm(mat,leaf,r,h){
  const g=new THREE.Group(),bend=(r()*2-1)*.35,pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(new THREE.Vector3(Math.sin(bend)*t*t*h*.4,t*h,Math.cos(bend)*t*t*h*.1));}
  const trunk=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,.45,6),mat);g.add(trunk);
  const top=pts[6];for(let k=0;k<7;k++){const a=k/7*Math.PI*2+r(),fr=new THREE.Mesh(new THREE.ConeGeometry(1.1,6.5,4),leaf);fr.scale.set(1,1,.25);fr.position.set(top.x+Math.cos(a)*2.6,top.y-.6,top.z+Math.sin(a)*2.6);fr.rotation.set(Math.sin(a)*1.25,0,-Math.cos(a)*1.25);g.add(fr);}
  return g;
}
function pine(mat,leaf,r,h){const g=new THREE.Group(),t=cyl(.35,.5,h*.4,mat,6);t.position.y=h*.2;g.add(t);for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(2.8-k*.7,h*.45,7),leaf);c.position.y=h*(.42+k*.2);g.add(c);}return g;}
function deadTree(mat,r,h){const g=new THREE.Group(),t=cyl(.3,.55,h,mat,5);t.position.y=h/2;t.rotation.z=(r()-.5)*.3;g.add(t);for(let k=0;k<3;k++){const b=cyl(.12,.25,h*.45,mat,4);b.position.set((r()-.5)*1.5,h*(.55+k*.13),(r()-.5)*1.5);b.rotation.set((r()-.5)*1.8,0,(r()-.5)*1.8);g.add(b);}return g;}
export function buildIsland(lookName,seed){
  const L=ISLAND_LOOKS[lookName],root=new THREE.Group(),n=T.noise2(seed),r=T.rng(seed+1),rug=L.rugged||1;
  const coast=a=>78*(1+.13*n(Math.cos(a)*1.3+5,Math.sin(a)*1.3+5,3)*2.2);
  const S=160,geo=new THREE.PlaneGeometry(240,240,S,S);geo.rotateX(-Math.PI/2);
  const pa=geo.attributes.position,colors=[],c=new THREE.Color(),col=k=>new THREE.Color(L[k]);
  const hAt=(x,z)=>{const d=Math.hypot(x,z),a=Math.atan2(z,x),R=coast(a),k=d/R;
    if(k>=1)return -6*Math.min(1,(k-1)*6)-.5;
    const dome=Math.pow(1-k*k,1.3),ridge=Math.abs(n(x*.035+11,z*.035+3,4))*rug,bump=n(x*.06,z*.06,3);
    let h=L.height*dome*(.55+ridge*.9)+bump*3*dome+1.2*(1-k);
    if(L.volcano){const cd=Math.hypot(x+8,z-6);h+=Math.max(0,24*(1-cd/40))-Math.max(0,16*(1-cd/9));}
    return h;};
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=hAt(x,z);pa.setY(i,h);
    const slope=Math.abs(hAt(x+1.5,z)-h)+Math.abs(hAt(x,z+1.5)-h),t=h/L.height,mix=(n(x*.08+40,z*.08,2)+1)/2;
    if(h<1.6)c.copy(col('sand'));else if(slope>2.6||t>.78)c.copy(col('rock')).lerp(col('peak'),Math.min(1,Math.max(0,t-.6)*2));else c.copy(col('grass')).lerp(col('grass2'),mix);
    if(h>=1.6&&h<2.6)c.lerp(col('sand'),1-(h-1.6));
    const shade=.9+n(x*.2,z*.2,2)*.18;c.multiplyScalar(shade);colors.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  root.add(new THREE.Mesh(geo,std({vertexColors:true,roughness:.92})));
  // Sığlık halkası
  const sh=new THREE.Mesh(new THREE.CircleGeometry(104,64),new THREE.MeshBasicMaterial({map:T.shallowTexture({seed,inner:L.shallow[0],outer:L.shallow[1],alpha:.5}),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;sh.userData.float=true;root.add(sh);
  // Ağaçlar
  const trunkMat=std({color:lookName==='crimson'?'#3a2a20':'#5a4230'}),leafMat=std({color:lookName==='misty'||lookName==='storm'?'#2f4a36':'#3f7a34',roughness:.8,side:THREE.DoubleSide});
  let placed=0;for(let tries=0;tries<600&&placed<L.treeCount;tries++){const a=r()*Math.PI*2,d=r()*coast(a)*.86,x=Math.cos(a)*d,z=Math.sin(a)*d,h=hAt(x,z);
    if(h<2.2||h>L.height*.75)continue;const slope=Math.abs(hAt(x+1.5,z)-h)+Math.abs(hAt(x,z+1.5)-h);if(slope>2.4)continue;
    const size=.8+r()*.5,tree=L.trees==='palm'?palm(trunkMat,leafMat,r,9*size):L.trees==='pine'?pine(trunkMat,leafMat,r,10*size):deadTree(trunkMat,r,6*size);tree.position.set(x,h-.3,z);tree.rotation.y=r()*6;root.add(tree);placed++;}
  // Kayalar
  const rockMat=std({color:L.rock,roughness:.95});
  for(let i=0;i<L.rocks;i++){const a=r()*Math.PI*2,d=coast(a)*(.75+r()*.35),x=Math.cos(a)*d,z=Math.sin(a)*d,m=new THREE.Mesh(new THREE.DodecahedronGeometry(2+r()*3.5,0),rockMat);m.scale.set(1,.6+r()*.5,1);m.position.set(x,Math.max(hAt(x,z),-.5)+.5,z);m.rotation.set(r()*3,r()*3,r()*3);root.add(m);}
  if(L.coral){const cm=[std({color:'#ff8a7a',roughness:.6}),std({color:'#ffb86a',roughness:.6}),std({color:'#d97ad8',roughness:.6})];for(let i=0;i<L.coral;i++){const a=r()*Math.PI*2,d=coast(a)*(1.02+r()*.2),m=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2+r()*1.6,1),cm[i%3]);m.scale.y=.5;m.position.set(Math.cos(a)*d,.2,Math.sin(a)*d);m.userData.float=true;root.add(m);}}
  if(L.lighthouse){const lh=new THREE.Group();root.add(lh);const a=-.9,d=coast(a)*.74,x0=Math.cos(a)*d,z0=Math.sin(a)*d,y0=hAt(x0,z0);lh.position.set(x0,y0,z0);lh.scale.setScalar(1.7);const x=0,z=0,y=0;
    const tower=cyl(2.4,3.4,20,std({map:T.stoneTexture({seed:seed+9,base:'#ded6c2',dark:'#b9ae95',moss:'#8b9b7a'})}),16);tower.position.set(x,y+10,z);lh.add(tower);
    for(const k of [5,11,17]){const band=cyl(3.1-k*.04,3.2-k*.04,1.2,std({color:'#a8342b'}),16);band.position.set(x,y+k,z);lh.add(band);}
    const lamp=cyl(2,2,3,std({color:'#fff0b0',emissive:'#ffcf5a',emissiveIntensity:2.4}),12);lamp.position.set(x,y+21.5,z);lh.add(lamp);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.8,3,12),std({color:'#7a2a24'}));roof.position.set(x,y+24.5,z);lh.add(roof);
    const house=new THREE.Mesh(new THREE.BoxGeometry(7,4,5),std({color:'#d8ccb0'}));house.position.set(x+6,y+2,z+3);lh.add(house);const hr=new THREE.Mesh(new THREE.ConeGeometry(5.2,3,4),std({color:'#8a3a2c'}));hr.rotation.y=Math.PI/4;hr.position.set(x+6,y+5.4,z+3);hr.scale.z=.75;lh.add(hr);}
  if(L.ruins){const sm=std({map:T.stoneTexture({seed:seed+4,base:'#8b6f5f',dark:'#5a4035',moss:'#6a5a3a'})});for(let i=0;i<7;i++){const a=.4+i*.28,d=38,x=Math.cos(a)*d,z=Math.sin(a)*d,h=hAt(x,z),ht=3+r()*7;const p=new THREE.Mesh(new THREE.BoxGeometry(2.4,ht,2.4),sm);p.position.set(x,h+ht/2-.5,z);p.rotation.y=a;root.add(p);}}
  if(L.volcano){const lava=new THREE.Mesh(new THREE.CircleGeometry(8,24),std({color:'#ff6a1a',emissive:'#ff4a0a',emissiveIntensity:2.6}));lava.rotation.x=-Math.PI/2;lava.position.set(-8,hAt(-8,6)+.3,6);root.add(lava);}
  root.scale.z=1/Math.sin(65*Math.PI/180);root.userData.waterline=0;
  return root;
}

// ---------------------------------------------------------------- Geçit
export function buildPortal(frame,count){
  const root=new THREE.Group(),stone=std({map:T.stoneTexture({seed:515})}),spin=frame/count*Math.PI*2/3;
  const base=new THREE.Mesh(new THREE.TorusGeometry(40,5,10,48),stone);base.rotation.x=Math.PI/2;base.scale.z=.5;root.add(base);
  const flame=std({color:'#bffff4',emissive:'#3fe6d2',emissiveIntensity:2.6});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.26,x=Math.cos(a)*40,z=Math.sin(a)*40;
    const p=new THREE.Mesh(new THREE.BoxGeometry(6,22,6),stone);p.position.set(x,11,z);p.rotation.y=-a;root.add(p);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(8,2,8),stone);cap.position.set(x,22.5,z);cap.rotation.y=-a;root.add(cap);
    const f=new THREE.Mesh(new THREE.OctahedronGeometry(2.2+.5*Math.sin(frame/count*Math.PI*2+i),0),flame);f.position.set(x,26.5,z);f.rotation.y=spin*2+i;root.add(f);}
  const vortex=new THREE.Mesh(new THREE.CircleGeometry(38,64),new THREE.MeshBasicMaterial({map:T.vortexTexture({seed:77}),transparent:true,depthWrite:false}));vortex.rotation.x=-Math.PI/2;vortex.rotation.z=spin;vortex.position.y=.3;vortex.userData.float=true;root.add(vortex);
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:88,color:'190,255,240',strength:.5,inner:.34}),transparent:true,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.y=.1;foam.userData.float=true;root.add(foam);
  root.userData.waterline=0;return root;
}

// ---------------------------------------------------------------- Kale
// Kayalık adacık üzerinde altıgen sur, 4 kule, merkez burç. owner: npc (kızıl sancak) / player (turkuaz sancak).
export function buildFort(owner){
  const root=new THREE.Group(),stone=std({map:T.stoneTexture({seed:606,base:'#7d776a',dark:'#4f4a42',moss:'#56613f'}),roughness:.95}),dark=std({map:T.stoneTexture({seed:607,base:'#5d584f',dark:'#3a3630',moss:'#46502f'}),roughness:.95});
  const roof=std({color:owner==='player'?'#1f5f5a':'#6e2a22',roughness:.7}),flagColor=owner==='player'?'#2fb8a8':'#a01f1c';
  // Kaya taban
  const n=T.noise2(66),rock=new THREE.CylinderGeometry(48,58,14,40,4),rp=rock.attributes.position;
  for(let i=0;i<rp.count;i++){const x=rp.getX(i),z=rp.getZ(i),a=Math.atan2(z,x),k=1+.1*n(Math.cos(a)*2,Math.sin(a)*2,3);rp.setX(i,x*k);rp.setZ(i,z*k);rp.setY(i,rp.getY(i)+n(x*.08,z*.08,2)*2);}
  rock.computeVertexNormals();const base=new THREE.Mesh(rock,std({color:'#5a5448',roughness:1}));base.position.y=0;root.add(base);
  const top=7;
  // Altıgen sur
  const R=34;for(let k=0;k<6;k++){const a0=k/6*Math.PI*2,a1=(k+1)/6*Math.PI*2,x0=Math.cos(a0)*R,z0=Math.sin(a0)*R,x1=Math.cos(a1)*R,z1=Math.sin(a1)*R,len=Math.hypot(x1-x0,z1-z0);
    const wall=new THREE.Mesh(new THREE.BoxGeometry(len,9,4),stone);wall.position.set((x0+x1)/2,top+4.5,(z0+z1)/2);wall.rotation.y=-Math.atan2(z1-z0,x1-x0);root.add(wall);
    for(let m=0;m<5;m++){const t=(m+.5)/5,mer=new THREE.Mesh(new THREE.BoxGeometry(2.4,2,4.4),stone);mer.position.set(x0+(x1-x0)*t,top+10,z0+(z1-z0)*t);mer.rotation.y=wall.rotation.y;root.add(mer);}}
  // Kuleler
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,x=Math.cos(a)*R,z=Math.sin(a)*R;
    const tw=new THREE.Mesh(new THREE.CylinderGeometry(6.5,7.5,18,20),dark);tw.position.set(x,top+9,z);root.add(tw);
    const rf=new THREE.Mesh(new THREE.ConeGeometry(8,9,20),roof);rf.position.set(x,top+22.5,z);root.add(rf);
    const gun=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,6,10),std({color:'#1b1c1e',metalness:.7,roughness:.4}));gun.rotation.z=Math.PI/2;gun.rotation.y=-a;gun.position.set(x+Math.cos(a)*7,top+14,z+Math.sin(a)*7);root.add(gun);}
  // Burç
  const keep=new THREE.Mesh(new THREE.BoxGeometry(20,24,20),stone);keep.position.y=top+12;root.add(keep);
  for(let m=0;m<4;m++)for(let q=0;q<4;q++){const mer=new THREE.Mesh(new THREE.BoxGeometry(3,2.6,3),stone);const s2=[[-1,0],[1,0],[0,-1],[0,1]][m];mer.position.set(s2[0]*9+(s2[1]?(q-1.5)*5:0),top+25.3,s2[1]*9+(s2[0]?(q-1.5)*5:0));root.add(mer);}
  for(const [x,z] of [[0,10.1],[10.1,0]]){const win=new THREE.Mesh(new THREE.PlaneGeometry(3,5),std({color:'#ffcf6a',emissive:'#ffb040',emissiveIntensity:1.4}));win.position.set(x,top+16,z);win.rotation.y=x?Math.PI/2:0;root.add(win);}
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,16,8),std({color:'#3a2a1a'}));pole.position.y=top+32;root.add(pole);
  const fm=std({map:T.flagTexture({seed:owner==='player'?9:8,base:flagColor,mark:null,tail:true}),side:THREE.DoubleSide});
  const fgeo=new THREE.PlaneGeometry(12,6,10,2),fp=fgeo.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i)+6;fp.setX(i,x);fp.setZ(i,Math.sin(x/12*Math.PI*2)*1.2*x/12);}fgeo.computeVertexNormals();
  const flagM=new THREE.Mesh(fgeo,fm);flagM.position.set(0,top+37,0);flagM.rotation.y=.6;root.add(flagM);
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:44,color:'225,245,240',strength:.55,inner:.36}),transparent:true,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.y=.05;foam.userData.float=true;root.add(foam);
  root.userData.waterline=0;return root;
}

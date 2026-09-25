// Yedi Deniz Korsan Oyunu — düşman filosu, Derinlik Leviathanı ve ganimet sandıkları için 3B modeller.
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
  // Toplar: namlu + bronz ağız bileziği + gerçek 3B tekerlekli kundak.
  if(def.guns){const n=def.guns.count;for(let i=0;i<n;i++){const t=.14+.72*(i+.5)/n;for(const sx of [-1,1]){const th=.39*Math.PI,w=S.w(t)*Math.pow(Math.sin(th),.55),y=S.top(t)-(S.top(t)-S.bot(t))*Math.pow(Math.cos(th),.75),z=S.z(t);
    const gun=cyl(.38,.5,2.6,mats.iron,12);gun.rotation.z=Math.PI/2;gun.position.set(sx*(w+.55),y,z);root.add(gun);
    const muzzle=new THREE.Mesh(new THREE.TorusGeometry(.5,.09,6,12),mats.trim);muzzle.rotation.y=Math.PI/2;muzzle.position.set(sx*(w+1.78),y,z);root.add(muzzle);
    const carriage=new THREE.Mesh(new THREE.BoxGeometry(1.35,.38,1.15),std({color:'#55351f',roughness:.86}));carriage.position.set(sx*(w-.15),y-.7,z);root.add(carriage);
    for(const dz of [-.38,.38]){const wheel=cyl(.32,.32,.16,mats.wood,10);wheel.rotation.z=Math.PI/2;wheel.position.set(sx*(w-.15),y-.9,z+dz);root.add(wheel);}
  }}}
  // Top mazgalları ve kapak çerçeveleri: namlular artık gövdeden "yapıştırılmış" görünmez.
  if(def.guns){const n=def.guns.count,portMat=std({color:def.hullPaint.portColor||'#120b08',roughness:.78}),lidMat=std({color:def.hullPaint.portLid||def.hullPaint.band||'#4d281d',roughness:.7});
    for(let i=0;i<n;i++){const t=.14+.72*(i+.5)/n,z=S.z(t),th=.39*Math.PI,w=S.w(t)*Math.pow(Math.sin(th),.55),y=S.top(t)-(S.top(t)-S.bot(t))*Math.pow(Math.cos(th),.75);
      for(const sx of [-1,1]){const port=new THREE.Mesh(new THREE.BoxGeometry(.16,1.25,1.55),portMat);port.position.set(sx*(w+.08),y,z);root.add(port);
        const lid=new THREE.Mesh(new THREE.BoxGeometry(.14,.9,1.38),lidMat);lid.position.set(sx*(w+.16),y+1.02,z-.12);lid.rotation.z=sx*.42;root.add(lid);}}}
  // Güverte korkulukları: ince dikmeler ve üst küpeşte, uzaktan gemi siluetini zenginleştirir.
  for(const sx of [-1,1]){const pts=[];for(let i=0;i<=8;i++){const t=.12+i*.095,x=sx*S.w(t)*.91,y=deckY(t)+1.35,z=S.z(t);pts.push(new THREE.Vector3(x,y,z));if(i>0&&i<8){const post=between(new THREE.Vector3(x,deckY(t)+.15,z),new THREE.Vector3(x,y,z),.09,mats.wood);root.add(post);}}
    for(let i=0;i+1<pts.length;i++)root.add(between(pts[i],pts[i+1],.11,mats.wood));}
  // Güverte yükü
  const r=T.rng(seed+3);
  for(let i=0;i<(def.cargo||0);i++){const t=.28+r()*.4,w=S.w(t)*.55,isCrate=r()<.5,crate=isCrate?new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4),std({color:'#6e4a2c',roughness:.9})):cyl(.65,.65,1.4,std({color:'#5a3a22',roughness:.82}),12);crate.position.set((r()*2-1)*w,deckY(t)+.7,S.z(t));crate.rotation.y=r()*3;root.add(crate);if(!isCrate){for(const yy of [-.45,.45]){const band=new THREE.Mesh(new THREE.TorusGeometry(.66,.055,5,12),mats.iron);band.rotation.x=Math.PI/2;band.position.set(crate.position.x,crate.position.y+yy,crate.position.z);root.add(band);}}}
  // Cıvadra
  const bowT=1,bowZ=S.z(bowT)-.5,bowY=S.top(bowT)-.2;
  const bsEnd=new THREE.Vector3(0,bowY+def.bowsprit*.35,bowZ+def.bowsprit);
  root.add(between(new THREE.Vector3(0,bowY-.4,bowZ-3),bsEnd,.32,mats.wood));
  if(def.figurehead){const fh=new THREE.Group();fh.position.set(0,bowY-1.2,bowZ+.8);const torso=new THREE.Mesh(new THREE.SphereGeometry(.9,16,10),mats.trim);torso.scale.set(.72,1.15,.75);fh.add(torso);const wingMat=std({color:def.hullPaint.trim||'#c89a45',metalness:.62,roughness:.32});for(const sx of [-1,1]){const wing=new THREE.Mesh(new THREE.ConeGeometry(.45,2.8,7),wingMat);wing.position.set(sx*.7,.2,-.2);wing.rotation.set(.25,0,sx*.72);fh.add(wing);}const head=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),wingMat);head.position.y=1.05;fh.add(head);root.add(fh);}
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
    if(m.lateen){const L=m.lateen,ls=sailMats[L.sail??0],pivot=new THREE.Group();pivot.position.set(0,0,z);pivot.rotation.y=swing;root.add(pivot);
      const fore=new THREE.Vector3(0,y0+L.low,L.len*.42),aft=new THREE.Vector3(0,y0+L.high,-L.len*.58),foot=new THREE.Vector3(0,y0+2.2,-L.len*.36);
      pivot.add(between(fore,aft,.26,mats.wood));
      pivot.add(foreAftSail([[0,foot.y,foot.z],[0,fore.y-.4,fore.z-.6],[0,fore.y-.3,fore.z-.4],[0,aft.y-.4,aft.z+.2]],L.bulge??1.6,ls));}
    if(m.junk){const J=m.junk,js=sailMats[J.sail??0],pivot=new THREE.Group();pivot.position.set(0,0,z);pivot.rotation.y=swing;root.add(pivot);
      pivot.add(foreAftSail([[0,y0+J.foot,.4],[0,y0+J.foot,-J.w],[0,y0+J.h,-J.w*.8],[0,y0+J.h+1,.4]],J.bulge??.9,js));
      for(let k=0;k<=J.battens;k++){const yy=y0+J.foot+(J.h-J.foot)*k/J.battens,w=J.w*(1-.2*k/J.battens);pivot.add(between(new THREE.Vector3(.25,yy,.4),new THREE.Vector3(.25,yy,-w),.14,mats.wood));}}
    if(m.gaff){const g=m.gaff,gs=sailMats[g.sail??0];
      const pivot=new THREE.Group();pivot.position.set(0,0,z);pivot.rotation.y=swing;root.add(pivot);
      pivot.add(foreAftSail([[0,y0+g.foot,-.4],[0,y0+g.foot,-g.len],[0,y0+g.peak,-g.len*1.05],[0,y0+g.throat,-.4]],g.bulge??1.4,gs));
      pivot.add(between(new THREE.Vector3(0,y0+g.foot,0),new THREE.Vector3(0,y0+g.foot,-g.len-.4),.28,mats.wood));
      pivot.add(between(new THREE.Vector3(0,y0+g.throat,0),new THREE.Vector3(0,y0+g.peak,-g.len*1.05),.24,mats.wood));}
    // Çarmıh halatları + basamaklı ip merdivenler.
    for(const sx of [-1,1])for(const dz of [-1.5,.2,1.9])ropes.push([new THREE.Vector3(0,top-.6,z),new THREE.Vector3(sx*S.w(m.t)*.98,S.top(m.t)-.2,z+dz)]);
    for(const sx of [-1,1]){const railTop=new THREE.Vector3(sx*m.r*.8,top*.78+y0*.22,z),railBot=new THREE.Vector3(sx*S.w(m.t)*.88,S.top(m.t),z);ropes.push([railTop,railBot]);
      for(let k=1;k<=5;k++){const t=k/6,p=new THREE.Vector3().lerpVectors(railTop,railBot,t),half=.55+.7*t;ropes.push([new THREE.Vector3(p.x-half,p.y,p.z),new THREE.Vector3(p.x+half,p.y,p.z)]);}}
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
  abyss:{seed:929,skin:{base:'#3a2458',dark:'#140a24',light:'#9a6ad0',spots:'#e0b0ff'},tentacle:{top:'#1e1034',mid:'#4a2a78',under:'#d8b8ff'},eye:['#ffe0a0','#ff9a2a'],spike:'#120820',brow:'#1a0e2e',foam:'214,200,255'},
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

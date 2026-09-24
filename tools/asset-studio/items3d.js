// Eşya ikonları (3B): donanım parçaları (yelken, pruva heykeli, gövde zırhı, top kundağı × sıradan/nadir/destansı),
// Kara Barut fıçısı, hazine haritası ve envanter plaketi. Hepsi three.js ile modellenir, stüdyoda ortam ışığıyla çekilir.
import * as THREE from 'three';
import * as T from './textures.js';
import {buildShip} from './models.js';
import {SHIPS} from './catalog.js';

const std=o=>new THREE.MeshStandardMaterial({roughness:.6,metalness:0,...o});
const metal=(color,rough=.3)=>new THREE.MeshStandardMaterial({color,metalness:1,roughness:rough});
function woodTex(seed,wood='#6a4128',dark='#3d2415'){const t=T.chestWoodTexture({seed,wood,dark});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const wood=(seed,w,d)=>std({map:woodTex(seed,w,d),roughness:.8});
function grooveBump(seed){const W=128,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle='#888';x.fillRect(0,0,W,W);for(let i=0;i<400;i++){x.fillStyle=r()<.5?'#777':'#999';x.fillRect(r()*W,r()*W,1+r()*3,1+r()*3);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const ext=(shape,depth,bevel=.08,seg=3)=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:seg,curveSegments:24});
const cyl=(r1,r2,h,mat,seg=16)=>new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat);
const glow=(color,size)=>{const [c,x]=T.canvas(64,64),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.3,color);g.addColorStop(1,color+'00');x.fillStyle=g;x.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:T.toTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.scale.setScalar(size);return s;};

// ---------------------------------------------------------------- yelken
const SAIL=[{base:'#e6d8b4',border:null,patches:3,dirt:.2,emblem:null,trim:'#8a6a44'},
  {base:'#f6f8fc',border:'#d9a441',patches:0,dirt:.05,emblem:(x,W,H)=>{x.strokeStyle='#d9a441';x.lineWidth=14;x.beginPath();x.arc(W/2,H/2,48,0,7);x.stroke();x.fillStyle='#8fb4dc';x.beginPath();x.arc(W/2,H/2,30,0,7);x.fill();},trim:'#d9a441'},
  {base:'#2a2f44',border:'#f1c662',patches:0,dirt:.1,emblem:(x,W,H)=>{x.fillStyle='#ffe07a';x.beginPath();x.moveTo(W*.56,H*.14);x.lineTo(W*.32,H*.55);x.lineTo(W*.48,H*.55);x.lineTo(W*.4,H*.88);x.lineTo(W*.7,H*.42);x.lineTo(W*.53,H*.42);x.closePath();x.fill();},trim:'#f1c662'}];
function sail(r){const g=new THREE.Group(),p=SAIL[r],spar=wood(3,'#5a3a22','#2e1c10');
  const mast=cyl(.32,.4,15,spar);mast.position.y=6;g.add(mast);
  for(const [y,w] of [[11.4,11],[1.2,10]]){const yard=cyl(.22,.22,w,spar);yard.rotation.z=Math.PI/2;yard.position.set(0,y,.35);g.add(yard);}
  const tex=T.sailTexture({seed:21+r,base:p.base,border:p.border,patches:p.patches,dirt:p.dirt,emblem:p.emblem});
  const geo=new THREE.PlaneGeometry(10.6,10,24,24),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),u=x/5.3,v=(y+5)/10;pos.setZ(i,(1-u*u)*2.4*Math.sin(Math.PI*Math.min(1,v*.95+.05))+.35);pos.setX(i,x*(1-.06*(1-v)));}
  geo.computeVertexNormals();
  const mat=std({map:tex,side:THREE.DoubleSide,roughness:.85});if(r===2){mat.emissive=new THREE.Color('#ffd24a');mat.emissiveMap=T.sailTexture({seed:9,base:'#000',emblem:p.emblem,dirt:0});mat.emissiveIntensity=1.3;}
  const cloth=new THREE.Mesh(geo,mat);cloth.position.set(0,6.3,.35);g.add(cloth);
  const rope=std({color:'#3a2a1a',roughness:.9});for(const s of [-1,1]){const c=new THREE.CatmullRomCurve3([new THREE.Vector3(s*5.3,1.2,.4),new THREE.Vector3(s*3,-1.4,1.5),new THREE.Vector3(s*1,-2.4,2)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,.06,6),rope));}
  const pen=new THREE.Shape();pen.moveTo(0,0);pen.lineTo(3,.5);pen.lineTo(0,1.1);pen.closePath();const flag=new THREE.Mesh(new THREE.ShapeGeometry(pen),std({color:r===0?'#8a2a1a':p.trim,side:THREE.DoubleSide,metalness:r?.6:0,roughness:.4}));flag.position.set(.3,12.8,0);g.add(flag);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.45,16,12),metal(p.trim==='#8a6a44'?'#9a7a4a':p.trim));cap.position.y=13.6;g.add(cap);
  g.userData.cam={pos:[5,4,16],look:[0,6,0]};return g;}

// ---------------------------------------------------------------- pruva heykeli (kıvrık ahşap kaide üzerinde büst, kameraya bakar)
function figure(r){const g=new THREE.Group(),bow=wood(7,'#4a2e18','#241408'),trim=metal(['#a07a3a','#c88a3a','#f0bf4c'][r],.3);
  const base=new THREE.Shape();base.moveTo(-3,-5);base.quadraticCurveTo(-3.4,-2,-1.4,-.6);base.lineTo(1.4,-.6);base.quadraticCurveTo(3.4,-2,3,-5);base.closePath();
  const b=new THREE.Mesh(ext(base,1.8,.25),bow);b.position.z=-1.2;g.add(b);
  const band=new THREE.Mesh(new THREE.TorusGeometry(1.55,.2,10,32),trim);band.rotation.x=Math.PI/2;band.position.y=-.55;g.add(band);
  for(const x of [-2.3,2.3]){const scroll=new THREE.Mesh(new THREE.TorusGeometry(.55,.18,8,20,Math.PI*1.5),trim);scroll.position.set(x,-3.6,.65);g.add(scroll);}
  if(r===0){const w=new THREE.MeshStandardMaterial({color:'#b98352',roughness:.62,bumpMap:grooveBump(11),bumpScale:.25});
    const chest=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),w);chest.scale.set(1.7,1.15,1.05);chest.position.y=.7;g.add(chest);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.45,.6,1,20),w);neck.position.y=2;g.add(neck);
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.05,32,24),w);head.scale.set(.9,1.12,.95);head.position.set(0,3.2,.05);g.add(head);
    const hair=new THREE.MeshStandardMaterial({color:'#6a3c1c',roughness:.7,bumpMap:grooveBump(12),bumpScale:.3});
    const cap=new THREE.Mesh(new THREE.SphereGeometry(1.12,32,16,0,Math.PI*2,0,Math.PI*.55),hair);cap.position.set(0,3.3,-.08);cap.rotation.x=-.25;g.add(cap);
    for(let i=0;i<12;i++){const a=(i/11-.5)*2.8,c=new THREE.CatmullRomCurve3([new THREE.Vector3(Math.sin(a)*1,3.6,Math.cos(a)*.3-.4),new THREE.Vector3(Math.sin(a)*1.3,2.6,Math.cos(a)*.4-.6),new THREE.Vector3(Math.sin(a)*1.6+Math.sin(i*2)*.2,1.4,Math.cos(a)*.6-.4),new THREE.Vector3(Math.sin(a)*1.5,.4,Math.cos(a)*.7-.2)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,20,.2,8),hair));}
    for(const x of [-.36,.36]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),std({color:'#2a1a0a'}));eye.position.set(x,3.3,.98);g.add(eye);}
    const nose=new THREE.Mesh(new THREE.ConeGeometry(.12,.35,8),w);nose.rotation.x=Math.PI/2;nose.position.set(0,3.1,1.05);g.add(nose);
    const necklace=new THREE.Mesh(new THREE.TorusGeometry(.75,.08,8,24,Math.PI),trim);necklace.rotation.set(Math.PI/2+.5,0,Math.PI);necklace.position.set(0,1.6,.35);g.add(necklace);
    const shell=new THREE.Mesh(new THREE.SphereGeometry(.34,16,8,0,Math.PI*2,0,Math.PI/2),trim);shell.rotation.x=Math.PI/2;shell.position.set(0,1.15,1.05);g.add(shell);}
  if(r===1){const br=new THREE.MeshStandardMaterial({color:'#c88a3a',metalness:1,roughness:.3,bumpMap:grooveBump(3),bumpScale:.4});
    for(let ring=0;ring<2;ring++)for(let i=0;i<20;i++){const a=i/20*Math.PI*2+ring*.16,rad=2.1+ring*.5,m=new THREE.Mesh(new THREE.ConeGeometry(.55,1.8,10),br);m.position.set(Math.cos(a)*rad,2.6+Math.sin(a)*rad,-.6-ring*.4);m.rotation.z=a-Math.PI/2;m.rotation.x=-.4;g.add(m);}
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.9,32,24),br);head.scale.set(1,1.05,.85);head.position.y=2.6;g.add(head);
    const snout=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),br);snout.scale.set(1.1,.8,.9);snout.position.set(0,1.9,1.35);g.add(snout);
    const nose=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),metal('#6a3a14',.4));nose.position.set(0,2.3,2.15);g.add(nose);
    for(const x of [-.7,.7]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),std({color:'#1a0f08'}));eye.position.set(x,3.2,1.45);g.add(eye);const brow=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.6,4,8),br);brow.rotation.z=Math.PI/2+x*.4;brow.position.set(x,3.55,1.4);g.add(brow);}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.14,12,28),metal('#f0d890',.2));ring.position.set(0,1.1,1.8);g.add(ring);}
  if(r===2){const au=new THREE.MeshStandardMaterial({color:'#f0bf4c',metalness:1,roughness:.2});
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.8,32,24),au);head.scale.set(1,1.4,.95);head.position.y=3.4;g.add(head);
    for(const x of [-.75,.75]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),new THREE.MeshStandardMaterial({color:'#6dffc4',emissive:'#3fe6a8',emissiveIntensity:2.4}));eye.position.set(x,2.9,1.55);g.add(eye);const gl=glow('#6dffc4',1.6);gl.position.set(x,2.9,1.8);g.add(gl);}
    for(let i=0;i<8;i++){const a=(i/7-.5)*2.4,sw=Math.sin(i*1.7)*.6,c=new THREE.CatmullRomCurve3([new THREE.Vector3(Math.sin(a)*1.1,1.9,.6),new THREE.Vector3(Math.sin(a)*2+sw,.6,1.2),new THREE.Vector3(Math.sin(a)*2.8,-.8,.8+sw*.5),new THREE.Vector3(Math.sin(a)*2.2-sw,-1.6,1.6)]);
      const tube=new THREE.TubeGeometry(c,40,.38,10),tp=tube.attributes.position,rs=11;
      for(let k=0;k<tp.count;k++){const t=Math.min(1,Math.floor(k/rs)/40),cp=c.getPoint(t),sc=1-t*.85;tp.setXYZ(k,cp.x+(tp.getX(k)-cp.x)*sc,cp.y+(tp.getY(k)-cp.y)*sc,cp.z+(tp.getZ(k)-cp.z)*sc);}tube.computeVertexNormals();g.add(new THREE.Mesh(tube,au));}}
  g.userData.cam={pos:[3,3,15],look:[0,1,0]};return g;}

// ---------------------------------------------------------------- gövde zırhı (hafif kavisli kalkan levhası)
function bend(geo,k=.05){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)-k*(x*x+.4*y*y));}geo.computeVertexNormals();return geo;}
function armor(r){const g=new THREE.Group(),sh=new THREE.Shape();sh.moveTo(0,5.4);sh.lineTo(4.2,4.2);sh.quadraticCurveTo(4.4,-1.6,0,-5.4);sh.quadraticCurveTo(-4.4,-1.6,-4.2,4.2);sh.closePath();
  const edge=metal(['#5a5e62','#e0a070','#f0bf4c'][r],.3);
  if(r===0){const plate=new THREE.Mesh(bend(ext(sh,.5,.15)),wood(17,'#8a5e36','#4a2e18'));g.add(plate);
    for(const y of [2.6,-.6,-3.2]){const band=new THREE.Mesh(bend(new THREE.BoxGeometry(8.6,.55,.3,24,1,1)),metal('#4a4c50',.45));band.position.set(0,y,.55);band.scale.x=y<-2?.62:1;g.add(band);
      for(const x of [-3.4,-1.2,1.2,3.4])if(Math.abs(x)<(y<-2?2.4:3.8)){const rv=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),metal('#6a6e72',.35));rv.position.set(x,y,.75-.05*(x*x+.4*y*y));g.add(rv);}}}
  if(r===1){const cu=new THREE.MeshStandardMaterial({color:'#d9814a',metalness:1,roughness:.28,bumpMap:grooveBump(5),bumpScale:.25});g.add(new THREE.Mesh(bend(ext(sh,.4,.18)),cu));
    for(let y=3.8;y>-4.4;y-=1.3)for(let x=-3.6;x<=3.6;x+=1.2){const inside=Math.abs(x)<4.1-Math.max(0,(3-y))*.55;if(!inside)continue;const rv=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),metal('#f0c8a0',.2));rv.position.set(x,y,.62-.05*(x*x+.4*y*y));g.add(rv);}
    const boss=new THREE.Mesh(new THREE.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI/2),metal('#f0c070',.2));boss.rotation.x=Math.PI/2;boss.position.set(0,.4,.5);g.add(boss);}
  if(r===2){const back=new THREE.Mesh(bend(ext(sh,.35,.12)),metal('#123a24',.5));g.add(back);
    const scale=new THREE.MeshStandardMaterial({color:'#3fb86a',metalness:.9,roughness:.2,emissive:'#06200e'}),us=new THREE.Shape();us.moveTo(-.55,.3);us.lineTo(.55,.3);us.quadraticCurveTo(.6,-.5,0,-.75);us.quadraticCurveTo(-.6,-.5,-.55,.3);
    const ug=ext(us,.08,.1);for(let row=0;row<10;row++){const y=4.3-row*.95;for(let col=-5;col<=5;col++){const x=col*.95+(row%2)*.47;if(Math.abs(x)>4.0-Math.max(0,(2.4-y))*.6||y<-4.6)continue;
      const sc=new THREE.Mesh(ug,scale);sc.rotation.x=-.35;sc.position.set(x,y,.45-.05*(x*x+.4*y*y)+row*.05);g.add(sc);}}
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.6),new THREE.MeshPhysicalMaterial({color:'#ffd060',metalness:.3,roughness:.05,clearcoat:1,emissive:'#6a4a00'}));gem.position.set(0,.4,1.3);g.add(gem);}
  const rim=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(60).map(p=>new THREE.Vector3(p.x,p.y,.5-.05*(p.x*p.x+.4*p.y*p.y))),true),120,.22,8,true),edge);g.add(rim);
  g.userData.cam={pos:[3,3,16],look:[0,0,0]};return g;}

// ---------------------------------------------------------------- top kundağı
function cannonBarrel(mat,len=8){const prof=[[0,0],[.95,0],[1.05,.4],[.9,.6],[.95,1.2],[.8,2],[.72,len-1.2],[.9,len-.8],[.9,len-.3],[.62,len],[.5,len]].map(([x,y])=>new THREE.Vector2(x,y));
  const m=new THREE.Mesh(new THREE.LatheGeometry(prof,32),mat);const cas=new THREE.Mesh(new THREE.SphereGeometry(.45,16,12),mat);cas.position.y=-.3;m.add(cas);return m;}
function wheel(mat,hub,rad=1.4){const w=new THREE.Group(),tire=new THREE.Mesh(new THREE.TorusGeometry(rad,.28,10,28),mat);w.add(tire);const h=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.7,16),hub);h.rotation.x=Math.PI/2;w.add(h);
  for(let i=0;i<8;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.18,rad*2,.18),mat);s.rotation.z=i*Math.PI/8;w.add(s);}return w;}
function carriage(r){const g=new THREE.Group(),W=wood(31+r,r===1?'#4a2a18':'#7a5230',r===1?'#241408':'#3a2414'),fit=metal(['#3a3c40','#c8a050','#f0bf4c'][r],.35);
  const barrelMat=[new THREE.MeshStandardMaterial({color:'#3a3d42',metalness:.9,roughness:.55,bumpMap:grooveBump(1),bumpScale:.5}),metal('#9fb4c8',.18),metal('#f0bf4c',.2)][r];
  const side=new THREE.Shape();side.moveTo(-3.6,0);side.lineTo(3.6,0);side.lineTo(3.6,1.4);side.lineTo(1.8,1.4);side.lineTo(1.8,2.2);side.lineTo(-.2,2.2);side.lineTo(-.2,3);side.lineTo(-2.6,3);side.lineTo(-3.6,1.8);side.closePath();
  for(const z of [-1.3,.9]){const s=new THREE.Mesh(ext(side,.4,.08),W);s.position.set(0,.6,z);g.add(s);}
  const axle=new THREE.Mesh(new THREE.BoxGeometry(7,.5,2.2),W);axle.position.set(0,.6,-.2);g.add(axle);
  for(const x of [-2.4,2.4])for(const z of [-1.9,1.5]){const w=wheel(W,fit,1.1);w.position.set(x,.2,z);g.add(w);}
  const b=cannonBarrel(barrelMat,8.4);b.rotation.z=-Math.PI/2+.12;b.position.set(-3.4,3.1,-.2);g.add(b);
  for(const x of [-1.8,1]){const strap=new THREE.Mesh(new THREE.TorusGeometry(.95,.12,8,20,Math.PI),fit);strap.rotation.set(0,Math.PI/2,0);strap.position.set(x,2.9-(x+1.8)*.12,-.2);g.add(strap);}
  if(r===2){const base=new THREE.Mesh(new THREE.CylinderGeometry(4.6,5,.7,48),metal('#d9a441',.25));base.position.y=-1.2;g.add(base);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4.8,.18,10,64),metal('#fff0b0',.15));ring.rotation.x=Math.PI/2;ring.position.y=-.8;g.add(ring);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,bolt=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),metal('#fff0b0',.2));bolt.position.set(Math.cos(a)*4.1,-.8,Math.sin(a)*4.1);g.add(bolt);}}
  if(r===1){const plate=new THREE.Mesh(new THREE.BoxGeometry(1.2,.9,.1),fit);plate.position.set(-1,1.6,1.35);g.add(plate);}
  g.userData.cam={pos:[7,7,13],look:[0,1.6,0]};return g;}

export function buildEquip(slot,rarity){return({sail,figure,armor,carriage})[slot](rarity);}

// ---------------------------------------------------------------- Kara Barut fıçısı
export function buildPowderKeg(){const g=new THREE.Group();
  const [c,x]=T.canvas(512,256),r=T.rng(4);x.fillStyle='#6a4128';x.fillRect(0,0,512,256);for(let i=0;i<16;i++){x.fillStyle=i%2?'#5a3620':'#734a2c';x.fillRect(i*32,0,31,256);x.fillStyle='#1b0f07';x.fillRect(i*32+31,0,2,256);}
  T.grain(x,512,256,r,{alpha:.22,count:1400,light:'#c49366',dark:'#120a05'});
  x.fillStyle='#e8dcc0';x.save();x.translate(256,120);x.beginPath();x.arc(0,-10,30,Math.PI,0);x.lineTo(20,20);x.lineTo(-20,20);x.closePath();x.fill();x.fillStyle='#2a1a0e';x.beginPath();x.arc(-11,-8,8,0,7);x.arc(11,-8,8,0,7);x.fill();
  x.strokeStyle='#e8dcc0';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(-40,34);x.lineTo(40,56);x.moveTo(40,34);x.lineTo(-40,56);x.stroke();x.restore();
  x.font='bold 28px serif';x.fillStyle='#e8dcc0';x.textAlign='center';x.fillText('BARUT',256,210);
  const tex=T.toTexture(c);
  const prof=[];for(let i=0;i<=20;i++){const t=i/20,y=t*7;prof.push(new THREE.Vector2(2.4+Math.sin(Math.PI*t)*.55,y));}
  const keg=new THREE.Mesh(new THREE.LatheGeometry(prof,48),std({map:tex,roughness:.75}));keg.rotation.y=Math.PI*1.12;g.add(keg);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.35,.2,40),std({map:woodTex(8),roughness:.8}));lid.position.y=6.9;g.add(lid);
  const iron=metal('#4a4c50',.45);for(const y of [.6,1.9,5.1,6.4]){const t=y/7,rad=2.4+Math.sin(Math.PI*t)*.55+.05;const hoop=new THREE.Mesh(new THREE.TorusGeometry(rad,.16,8,48),iron);hoop.rotation.x=Math.PI/2;hoop.position.y=y;g.add(hoop);}
  // barut yığını
  const pile=new THREE.ConeGeometry(3,1.6,40,6),pp=pile.attributes.position,nr=T.rng(9);for(let i=0;i<pp.count;i++){if(pp.getY(i)>.79)continue;pp.setY(i,pp.getY(i)+nr()*.15);}pile.computeVertexNormals();
  const heap=new THREE.Mesh(pile,std({color:'#1a1a1c',roughness:1}));heap.position.set(3.6,.6,2.4);g.add(heap);
  // fitil ve kıvılcım
  const fuse=new THREE.CatmullRomCurve3([new THREE.Vector3(.6,6.95,.4),new THREE.Vector3(1.2,8.2,.6),new THREE.Vector3(.4,9.2,1),new THREE.Vector3(1.4,10,1.2)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(fuse,24,.1,6),std({color:'#c9b27a',roughness:.9})));
  const spark=glow('#ffb43a',3);spark.position.set(1.4,10.05,1.2);g.add(spark);const core=glow('#ffffff',1.1);core.position.copy(spark.position);g.add(core);
  g.userData.cam={pos:[3,5,15],look:[1,4,1]};return g;}

// ---------------------------------------------------------------- hazine haritası
export function buildTreasureMap(){const g=new THREE.Group();
  const [c,x]=T.canvas(512,384),r=T.rng(12);const pg=x.createLinearGradient(0,0,512,384);pg.addColorStop(0,'#f1dfae');pg.addColorStop(1,'#cfa865');x.fillStyle=pg;x.fillRect(0,0,512,384);
  T.blotches(x,512,384,r,{alpha:.18,count:60,colors:['#8a5a2a','#b08040']});T.grain(x,512,384,r,{alpha:.12,count:1500,light:'#fff',dark:'#6a4420'});
  x.fillStyle='#8fb07a';x.strokeStyle='#5a6a2a';x.lineWidth=4;x.beginPath();x.moveTo(300,120);x.bezierCurveTo(380,80,440,170,400,230);x.bezierCurveTo(360,300,270,290,262,230);x.bezierCurveTo(254,180,240,150,300,120);x.fill();x.stroke();
  x.fillStyle='#6a8a5a';for(let i=0;i<7;i++){x.beginPath();x.arc(300+r()*90,160+r()*90,6,0,7);x.fill();}
  x.setLineDash([12,10]);x.strokeStyle='#7a2a14';x.lineWidth=6;x.beginPath();x.moveTo(80,320);x.bezierCurveTo(150,220,210,300,320,200);x.stroke();x.setLineDash([]);
  x.strokeStyle='#c0291a';x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(300,180);x.lineTo(345,225);x.moveTo(345,180);x.lineTo(300,225);x.stroke();
  x.save();x.translate(110,110);x.fillStyle='#4a2e14';for(let i=0;i<8;i++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,i%2?-26:-46);x.lineTo(7,0);x.lineTo(-7,0);x.closePath();x.fill();}x.fillStyle='#c0291a';x.beginPath();x.moveTo(0,-46);x.lineTo(7,0);x.lineTo(-7,0);x.fill();x.restore();
  const vg=x.createRadialGradient(256,192,80,256,192,300);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#4a2a0a88');x.fillStyle=vg;x.fillRect(0,0,512,384);
  const geo=new THREE.PlaneGeometry(10,7.5,40,20),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const px=pos.getX(i),py=pos.getY(i);pos.setZ(i,.25*Math.sin(px*1.3+py*.6)+.12*Math.sin(py*2.1));}geo.computeVertexNormals();
  const sheet=new THREE.Mesh(geo,std({map:T.toTexture(c),roughness:.9,side:THREE.DoubleSide}));sheet.rotation.x=-Math.PI/2+.35;g.add(sheet);
  for(const s of [-1,1]){const roll=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,7.9,24),std({color:'#d9b474',roughness:.85}));roll.rotation.x=Math.PI/2-.35;roll.position.set(s*5.2,Math.sin(.35)*0,-.0);roll.position.y=0;g.add(roll);
    const cap=metal('#b8862f',.3);for(const e of [-1,1]){const k=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.3,20),cap);k.rotation.x=Math.PI/2-.35;k.position.set(s*5.2,e*3.9*Math.sin(.35),e*3.9*Math.cos(.35));g.add(k);}}
  // pirinç pusula
  const comp=new THREE.Group(),brass=metal('#c9a04a',.25);comp.add(new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.35,.45,40),brass));
  const face=new THREE.Mesh(new THREE.CircleGeometry(1.1,40),std({color:'#f3ead2'}));face.rotation.x=-Math.PI/2;face.position.y=.24;comp.add(face);
  const needle=new THREE.Mesh(new THREE.ConeGeometry(.12,1.6,8),std({color:'#c0291a'}));needle.rotation.z=Math.PI/2;needle.rotation.y=.8;needle.position.y=.3;comp.add(needle);
  const glass=new THREE.Mesh(new THREE.SphereGeometry(1.12,32,12,0,Math.PI*2,0,.5),new THREE.MeshPhysicalMaterial({color:'#ffffff',transmission:.9,roughness:.02,thickness:.1,transparent:true,opacity:.25}));glass.position.y=-.2;comp.add(glass);
  comp.position.set(-3.2,.9,2.2);comp.rotation.x=.35;g.add(comp);
  g.userData.cam={pos:[0,9,11],look:[0,0,.4]};return g;}

// ---------------------------------------------------------------- envanter plaketi: solda depo (sandık ve gülleler), sağda denizde gemi
export function buildInventoryPlaque(){const g=new THREE.Group(),W=wood(41,'#5a3a22','#2e1c10'),brass=metal('#d9a441',.25);
  const board=new THREE.Mesh(ext((()=>{const s=new THREE.Shape(),w=7,h=5,rr=.8;s.moveTo(-w+rr,-h);s.lineTo(w-rr,-h);s.quadraticCurveTo(w,-h,w,-h+rr);s.lineTo(w,h-rr);s.quadraticCurveTo(w,h,w-rr,h);s.lineTo(-w+rr,h);s.quadraticCurveTo(-w,h,-w,h-rr);s.lineTo(-w,-h+rr);s.quadraticCurveTo(-w,-h,-w+rr,-h);return s;})(),.6,.3),W);board.rotation.x=-Math.PI/2;board.position.y=-.6;g.add(board);
  const sea=new THREE.Mesh(new THREE.BoxGeometry(6.4,.2,9.2),new THREE.MeshPhysicalMaterial({color:'#1f6f7a',roughness:.15,clearcoat:1,metalness:.1}));sea.position.set(3.4,.42,0);g.add(sea);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(6.4,.2,9.2),std({map:woodTex(44,'#8a5e36','#4a2e18'),roughness:.8}));floor.position.set(-3.4,.42,0);g.add(floor);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.5,.6,9.6),brass);bar.position.y=.62;g.add(bar);
  const frame=new THREE.Mesh(new THREE.TorusGeometry(1,.2,8,4),brass);frame.visible=false;g.add(frame);
  // sandık
  const crate=new THREE.Mesh(new THREE.BoxGeometry(2.6,2,2),std({map:woodTex(46,'#9a6a3a','#5a3a1a'),roughness:.8}));crate.position.set(-3.6,1.55,-.6);crate.rotation.y=.3;g.add(crate);
  for(const y of [.6,1.8]){const band=new THREE.Mesh(new THREE.BoxGeometry(2.7,.18,2.1),metal('#4a4c50',.45));band.position.set(-3.6,y+.35,-.6);band.rotation.y=.3;g.add(band);}
  const ball=new THREE.MeshStandardMaterial({color:'#2a2c30',metalness:.9,roughness:.4});for(const [x,z,y] of [[-4.6,2.2,.62],[-3.6,2.4,.62],[-4.1,1.6,.62],[-4.1,2.1,1.35]]){const b=new THREE.Mesh(new THREE.SphereGeometry(.5,20,14),ball);b.position.set(x,y+.35,z);g.add(b);}
  // gemi
  const ship=buildShip(SHIPS.find(s=>s.id==='n2-2-heavy').def,{heading:Math.PI*1.25});ship.scale.setScalar(.11);ship.rotation.y=Math.PI-Math.PI*1.25;ship.position.set(3.4,.5,0);g.add(ship);
  // oklar
  for(const [s,z] of [[1,-3.6],[-1,3.6]]){const a=new THREE.Shape();a.moveTo(-1.2,-.3);a.lineTo(.3,-.3);a.lineTo(.3,-.7);a.lineTo(1.2,0);a.lineTo(.3,.7);a.lineTo(.3,.3);a.lineTo(-1.2,.3);a.closePath();const m=new THREE.Mesh(ext(a,.2,.06),brass);m.rotation.x=-Math.PI/2;m.scale.x=s;m.position.set(0,1,z);g.add(m);}
  g.userData.cam={pos:[0,12,10],look:[0,.5,0]};return g;}

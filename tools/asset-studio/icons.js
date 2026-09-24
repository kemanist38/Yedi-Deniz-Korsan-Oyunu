// Kara Yelken — yetenek ve mühimmat ikonları (256 px, 3/4 açı, dövme metal).
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.6,metalness:.2,...o});

function hammered(seed,{base='#3a3836',light='#8d8980'}={}){
  const W=256,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle=base;x.fillRect(0,0,W,W);
  for(let i=0;i<500;i++){const px=r()*W,py=r()*W,rad=3+r()*9,g=x.createRadialGradient(px-rad*.3,py-rad*.3,1,px,py,rad);g.addColorStop(0,light+'66');g.addColorStop(1,'#00000000');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,7);x.fill();}
  T.blotches(x,W,W,r,{alpha:.35,count:40,colors:['#1a1816','#5a3a22']});
  const t=T.toTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function bump(seed){const W=256,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle='#808080';x.fillRect(0,0,W,W);for(let i=0;i<700;i++){x.fillStyle=r()<.5?'#5a5a5a':'#a6a6a6';x.globalAlpha=.5;x.beginPath();x.arc(r()*W,r()*W,2+r()*7,0,7);x.fill();}x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const iron=(seed)=>std({map:hammered(seed),bumpMap:bump(seed+1),bumpScale:2.2,metalness:.7,roughness:.5});

function emberTexture(seed){const W=256,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle='#000';x.fillRect(0,0,W,W);x.strokeStyle='#ff7a1a';x.lineCap='round';
  for(let i=0;i<46;i++){let px=r()*W,py=r()*W;x.lineWidth=1+r()*3.5;x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=(r()-.5)*40;py+=(r()-.5)*40;x.lineTo(px,py);}x.stroke();}
  const t=T.toTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function flameTexture(){const W=128,H=256,[c,x]=T.canvas(W,H);const g=x.createRadialGradient(W/2,H*.75,4,W/2,H*.6,H*.55);g.addColorStop(0,'#fff6c8');g.addColorStop(.25,'#ffc23a');g.addColorStop(.55,'#ff5a14aa');g.addColorStop(1,'#ff2a0000');
  x.fillStyle=g;x.beginPath();x.moveTo(W/2,0);x.bezierCurveTo(W*1.05,H*.45,W*.95,H,W/2,H);x.bezierCurveTo(W*.05,H,-W*.05,H*.45,W/2,0);x.fill();return T.toTexture(c);}
function flame(h,mat){const m=new THREE.Mesh(new THREE.PlaneGeometry(h*.5,h),mat);return m;}

function cutlass(steel,gold,grip){
  const g=new THREE.Group(),shape=new THREE.Shape();
  shape.moveTo(0,0);shape.lineTo(1.1,0);shape.quadraticCurveTo(1.6,6,.4,11.5);shape.lineTo(-.2,12.2);shape.quadraticCurveTo(.6,6,0,0);
  const blade=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSize:.12,bevelThickness:.08,bevelSegments:2}),steel);blade.position.set(-.55,1.2,-.09);g.add(blade);
  const guard=new THREE.Mesh(new THREE.TorusGeometry(1.2,.22,8,20,Math.PI*1.2),gold);guard.position.set(0,.5,0);guard.rotation.z=Math.PI*1.4;g.add(guard);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(3.2,.45,.6),gold);bar.position.y=1.1;g.add(bar);
  const hilt=new THREE.Mesh(new THREE.CylinderGeometry(.32,.36,3,10),grip);hilt.position.y=-.6;g.add(hilt);
  const pommel=new THREE.Mesh(new THREE.SphereGeometry(.55,12,10),gold);pommel.position.y=-2.25;g.add(pommel);
  return g;
}

export function buildIcon(name){
  const root=new THREE.Group();
  if(name==='ammo-fire'){
    const mats=[0,1,2].map(i=>std({map:hammered(10+i,{base:'#2a2422',light:'#6e5a50'}),bumpMap:bump(20+i),bumpScale:2,metalness:.6,roughness:.55,emissive:'#ff5a10',emissiveMap:emberTexture(30+i),emissiveIntensity:2.4}));
    [[-1.9,0,0],[1.9,0,0],[0,0,-1.7],[0,2.9,-.6]].forEach(([x,y,z],i)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(2,32,24),mats[i%3]);b.position.set(x,y+2,z);b.rotation.set(i,i*2,0);root.add(b);});
    const fm=new THREE.MeshBasicMaterial({map:flameTexture(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    [[-1.4,6.6,.6,4.2,-.25],[.6,7.2,.2,5,.1],[1.9,6,.8,3.4,.35],[-.3,5.4,1.6,2.8,0]].forEach(([x,y,z,h,rz])=>{const f=flame(h,fm);f.position.set(x,y,z);f.rotation.z=rz;root.add(f);});
    root.userData.cam={pos:[0,6.5,14],look:[0,3.4,0],fov:38};
  }
  if(name==='ammo-explosive'){
    // Fitilli iki bomba: dövme demir gövde, pirinç ağız, kıvrık fitil ve ucunda kıvılcım
    const brass=std({color:'#c8943e',metalness:.85,roughness:.35}),rope=std({color:'#8a6a3a',roughness:.95,metalness:0});
    const fm=new THREE.MeshBasicMaterial({map:flameTexture(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    [[-1.9,0,.4,2.6],[2.4,0,-1,2.2]].forEach(([x,y,z,r],i)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,36,28),iron(50+i));b.position.set(x,y+r,z);root.add(b);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.36,r*.4,18),brass);neck.position.set(x,y+r*2.05,z);root.add(neck);
      const pts=[0,1,2,3].map(k=>new THREE.Vector3(x+Math.sin(k*.9)*.5*(i?-1:1),y+r*2.2+k*.55,z+k*.15));const fuse=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.13,8),rope);root.add(fuse);
      const tip=pts[3],f=flame(1.8,fm);f.position.set(tip.x,tip.y+.7,tip.z);root.add(f);const spark=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),std({color:'#fff0b0',emissive:'#ffc040',emissiveIntensity:4}));spark.position.copy(tip);root.add(spark);});
    root.userData.cam={pos:[0,6,14],look:[0,2.8,0]};
  }
  if(name==='ammo-breaker'){
    // Kule kırıcı: sivri uçlu çelik mermiler, pirinç kuşaklar, yanında kırık taş parçaları
    const steel=std({map:hammered(61,{base:'#4a4c50',light:'#b0b4b8'}),metalness:.85,roughness:.35}),brass=std({color:'#c8943e',metalness:.85,roughness:.3});
    const shell=()=>{const g=new THREE.Group(),body=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,3.4,28),steel);g.add(body);const tip=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.4,28),steel);tip.position.y=2.9;g.add(tip);
      for(const y of [-1.1,.9]){const band=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.35,28),brass);band.position.y=y;g.add(band);}const base=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.3,28),brass);base.position.y=-1.8;g.add(base);return g;};
    const a=shell();a.position.set(-1.4,1.95,0);a.rotation.z=.12;root.add(a);
    const b=shell();b.position.set(1.6,1.2,1.2);b.rotation.set(0,.4,-1.45);root.add(b);
    const stone=std({map:T.stoneTexture({seed:66,base:'#8a8478',dark:'#4a463e'}),roughness:.9,metalness:0}),r=T.rng(12);
    for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+r()*.5,0),stone);m.position.set(-3.6+r()*7.2,.4,2.4+r()*1.2);m.rotation.set(r()*3,r()*3,0);root.add(m);}
    root.userData.cam={pos:[0,6,14],look:[0,2.2,0]};
  }
  if(name==='ammo-leech'){
    // Can emici: yeşil ruh damarları parlayan kara gülleler ve yükselen hayalet alevleri
    const vein=(seed)=>{const W=256,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle='#000';x.fillRect(0,0,W,W);x.strokeStyle='#5aff9a';x.lineCap='round';for(let i=0;i<40;i++){let px=r()*W,py=r()*W;x.lineWidth=1+r()*3;x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=(r()-.5)*40;py+=(r()-.5)*40;x.lineTo(px,py);}x.stroke();}const t=T.toTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
    const mats=[0,1].map(i=>std({map:hammered(70+i,{base:'#1c1a24',light:'#4a4658'}),metalness:.6,roughness:.5,emissive:'#3aff8a',emissiveMap:vein(80+i),emissiveIntensity:2.2}));
    [[-1.7,0,0,2.3],[1.9,0,-1,2]].forEach(([x,y,z,r],i)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,36,28),mats[i]);b.position.set(x,y+r,z);root.add(b);});
    const gm=new THREE.MeshBasicMaterial({map:flameTexture(),color:'#6affb0',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    [[-1.8,6,.4,4],[1.6,5.4,-.4,3.2],[.1,7,0,3.6]].forEach(([x,y,z,h],i)=>{const f=flame(h,gm);f.position.set(x,y,z);f.rotation.z=(i-1)*.25;root.add(f);});
    root.userData.cam={pos:[0,6,14],look:[0,3.2,0]};
  }
  if(name==='ammo-grape'){
    const cloth=std({map:T.sailTexture({seed:5,base:'#b39a72',dirt:.35}),roughness:.95,metalness:0});
    const sack=new THREE.Mesh(new THREE.SphereGeometry(3.4,32,24),cloth);sack.scale.set(1,1.05,.95);sack.position.y=3.2;root.add(sack);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.8,1.8,20),cloth);neck.position.y=6.6;root.add(neck);
    const top=new THREE.Mesh(new THREE.ConeGeometry(1.6,1.6,14),cloth);top.position.y=8.2;top.rotation.x=Math.PI;root.add(top);
    const rope=new THREE.Mesh(new THREE.TorusGeometry(1.05,.28,8,24),std({color:'#6b4a2a',roughness:.9,metalness:0}));rope.rotation.x=Math.PI/2;rope.position.y=7.2;root.add(rope);
    const im=iron(40),r=T.rng(9);
    for(let i=0;i<11;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.85,20,16),im);const a=-.2+r()*1.6;b.position.set(Math.cos(a)*(3.2+r()*2.2),.85,Math.sin(a)*(2.4+r()*2)+1);root.add(b);}
    root.userData.cam={pos:[0,7,14],look:[0,3.2,0],fov:40};
  }
  if(name==='icon-mine'){
    const body=new THREE.Mesh(new THREE.SphereGeometry(3.3,40,30),std({map:hammered(51,{base:'#1d1f22',light:'#5a6068'}),bumpMap:bump(52),bumpScale:2,metalness:.75,roughness:.45}));body.position.y=4;root.add(body);
    const brass=std({color:'#c89a45',metalness:.9,roughness:.3});
    const dirs=[[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[.7,.7,0],[-.7,.7,0],[0,.7,.7],[0,.7,-.7],[.6,-.5,.6],[-.6,-.5,.6]];
    for(const d of dirs){const v=new THREE.Vector3(...d).normalize(),h=new THREE.Mesh(new THREE.CylinderGeometry(.28,.45,1.6,10),brass);h.position.copy(v.clone().multiplyScalar(3.8)).add(new THREE.Vector3(0,4,0));h.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v);root.add(h);const cap=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),brass);cap.position.copy(v.clone().multiplyScalar(4.6)).add(new THREE.Vector3(0,4,0));root.add(cap);}
    const band=new THREE.Mesh(new THREE.TorusGeometry(3.32,.22,8,40),brass);band.rotation.x=Math.PI/2;band.position.y=4;root.add(band);
    const chain=std({color:'#3a3a3c',metalness:.8,roughness:.4});for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.TorusGeometry(.45,.14,8,16),chain);l.position.set(0,.2-i*.75,0);l.rotation.y=i%2?Math.PI/2:0;l.scale.y=1.4;root.add(l);}
    root.userData.cam={pos:[0,7,13],look:[0,3.4,0],fov:40};
  }
  if(name==='icon-attack'){
    const steel=std({color:'#c9ced4',metalness:.95,roughness:.22}),gold=std({color:'#d4a64c',metalness:.9,roughness:.3}),grip=std({color:'#5a2a1c',roughness:.8,metalness:0});
    const a=cutlass(steel,gold,grip);a.rotation.z=-.72;a.position.set(-1.6,1.2,0);root.add(a);
    const b=cutlass(steel,gold,grip);b.scale.x=-1;b.rotation.z=.72;b.position.set(1.6,1.2,.4);root.add(b);
    root.userData.cam={pos:[0,4.5,17],look:[0,4.2,0],fov:40};
  }
  if(name==='icon-repair'){
    const wood=std({map:T.chestWoodTexture({seed:61,wood:'#8a5a34',dark:'#5a3820'}),roughness:.85,metalness:0});
    for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(11,.9,2.6),wood);p.position.set(0,.45+i*.02,-3+i*2.7);p.rotation.y=(i-1)*.08;root.add(p);
      for(const x of [-4.2,4.2]){const n=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.2,10),std({color:'#8a8a8a',metalness:.9,roughness:.3}));n.position.set(x,1,-3+i*2.7);root.add(n);}}
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.42,.52,8.5,12),std({color:'#9a6a3a',roughness:.7,metalness:0}));handle.rotation.z=-.9;handle.position.set(-.8,4.8,1);root.add(handle);
    const head=new THREE.Group();const hb=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,4.4),iron(62));head.add(hb);const face=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.8,16),iron(63));face.rotation.x=Math.PI/2;face.position.z=2.5;head.add(face);
    const claw=new THREE.Mesh(new THREE.ConeGeometry(.7,2.2,4),iron(64));claw.rotation.x=-Math.PI/2;claw.position.z=-3;head.add(claw);head.rotation.set(0,Math.PI/2,-.9);head.position.set(2.6,7.6,1);root.add(head);
    root.userData.cam={pos:[0,9,15],look:[0,3.4,0],fov:40};
  }
  if(name==='icon-speed'){
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,12,10),std({color:'#5a3a24',roughness:.8,metalness:0}));mast.position.y=5.5;root.add(mast);
    const yard=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,9,8),std({color:'#5a3a24',roughness:.8,metalness:0}));yard.rotation.z=Math.PI/2;yard.position.set(0,10,0);root.add(yard);
    const sailMat=std({map:T.sailTexture({seed:71,base:'#efe6cf',stripes:5,stripeColor:'#a3302a',dirt:.08}),side:THREE.DoubleSide,roughness:.9,metalness:0});
    const geo=new THREE.PlaneGeometry(8.4,8,16,14),pa=geo.attributes.position;for(let i=0;i<pa.count;i++){const u=pa.getX(i)/8.4+.5,v=pa.getY(i)/8+.5;pa.setZ(i,2.6*Math.sin(Math.PI*u)*Math.sin(Math.PI*Math.min(1,v*1.05+.05)));}geo.computeVertexNormals();
    const sail=new THREE.Mesh(geo,sailMat);sail.position.set(0,5.9,.3);root.add(sail);
    const wind=new THREE.MeshBasicMaterial({color:'#bff6ea',transparent:true,opacity:.75,side:THREE.DoubleSide});
    [[-6,8.5,-2,5],[-6.5,5.5,-1.5,6],[-5.5,2.8,-1,4.2]].forEach(([x,y,z,len])=>{const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x-len,y+.6,z),new THREE.Vector3(x-len*.4,y-.2,z+.5),new THREE.Vector3(x,y+.3,z+1),new THREE.Vector3(x+1.2,y+1.3,z+1.4)]);root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.16,6),wind));});
    root.rotation.y=.55;root.userData.cam={pos:[0,6.5,16],look:[0,5.6,0],fov:42};
  }
  if(name==='icon-shield'){
    const wood=std({map:T.chestWoodTexture({seed:81,wood:'#6e3a22',dark:'#43200f'}),roughness:.8,metalness:0});
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.9,48),wood);disc.rotation.x=Math.PI/2;root.add(disc);
    const rimMat=iron(82),rim=new THREE.Mesh(new THREE.TorusGeometry(5,.45,12,48),rimMat);root.add(rim);
    for(const a of [0,Math.PI/2]){const band=new THREE.Mesh(new THREE.BoxGeometry(10,.9,.3),rimMat);band.position.z=.5;band.rotation.z=a+Math.PI/4;root.add(band);}
    const boss=new THREE.Mesh(new THREE.SphereGeometry(1.7,32,16,0,Math.PI*2,0,Math.PI/2),std({color:'#d4a64c',metalness:.9,roughness:.28}));boss.rotation.x=Math.PI/2;boss.position.z=.45;root.add(boss);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,rv=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),std({color:'#d4a64c',metalness:.9,roughness:.3}));rv.position.set(Math.cos(a)*4.35,Math.sin(a)*4.35,.5);root.add(rv);}
    root.rotation.set(-.25,.45,0);root.position.y=5;root.userData.cam={pos:[0,6,15],look:[0,5,0],fov:42};
  }
  if(name==='icon-hat'){
    const felt=std({map:hammered(91,{base:'#1f1814',light:'#4a3a30'}),roughness:.95,metalness:0,side:THREE.DoubleSide}),gold=std({color:'#d4a64c',metalness:.9,roughness:.3});
    const crown=new THREE.Mesh(new THREE.SphereGeometry(3,32,20,0,Math.PI*2,0,Math.PI/2),felt);crown.scale.set(1,1.1,1);crown.position.y=.6;root.add(crown);
    // Kenar: yukarı kıvrık halka, üç noktadan sıkıştırılmış (üç köşe)
    const prof=[[2.9,.6],[4,.8],[5,1.6],[5.5,3.2],[5.4,3.6]].map(([x,y])=>new THREE.Vector2(x,y));
    const brim=new THREE.LatheGeometry(prof,72),bp=brim.attributes.position;
    for(let i=0;i<bp.count;i++){const x=bp.getX(i),z=bp.getZ(i),y=bp.getY(i),a=Math.atan2(z,x),d=Math.hypot(x,z),pinch=1-.26*Math.max(0,Math.cos(3*(a-Math.PI/2)));const out=2.9+(d-2.9)*pinch;bp.setX(i,Math.cos(a)*out);bp.setZ(i,Math.sin(a)*out);bp.setY(i,.6+(y-.6)*(.55+.45*pinch));}
    brim.computeVertexNormals();root.add(new THREE.Mesh(brim,felt));
    const edge=new THREE.Mesh(new THREE.TorusGeometry(1,.14,6,72),gold);const ep=edge.geometry.attributes.position;
    for(let i=0;i<ep.count;i++){const x=ep.getX(i),y=ep.getY(i),a=Math.atan2(y,x),pinch=1-.26*Math.max(0,Math.cos(3*(-a-Math.PI/2)));const rr=2.9+(5.4-2.9)*pinch,t=Math.hypot(x,y)-1;ep.setX(i,Math.cos(a)*(rr+t));ep.setY(i,Math.sin(a)*(rr+t));ep.setZ(i,ep.getZ(i)+.6+3*(.55+.45*pinch));}
    edge.rotation.x=-Math.PI/2;edge.geometry.computeVertexNormals();root.add(edge);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(3.02,3.02,.7,32,1,true),std({color:'#7a1f1a',roughness:.8,metalness:0,side:THREE.DoubleSide}));band.position.y=1;root.add(band);
    const badge=new THREE.Mesh(new THREE.SphereGeometry(.7,16,12),gold);badge.scale.z=.4;badge.position.set(0,1.1,3.05);root.add(badge);
    const feather=new THREE.Mesh(new THREE.ConeGeometry(.8,6,8),std({color:'#e9e1cc',roughness:.9,metalness:0}));feather.scale.z=.3;feather.rotation.set(-.2,0,-1.1);feather.position.set(3,3.4,-.5);root.add(feather);
    root.userData.cam={pos:[0,8,13],look:[0,1.6,0]};
  }
  if(name==='officer-gunner'){
    const wood=std({map:T.chestWoodTexture({seed:101,wood:'#7a4a2a',dark:'#4a2a16'}),roughness:.8,metalness:0});
    const keg=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,5,24),wood);keg.scale.set(1,1,1);const kp=keg.geometry.attributes.position;for(let i=0;i<kp.count;i++){const y=kp.getY(i),f=1+.16*Math.cos(y/2.5*Math.PI/2);kp.setX(i,kp.getX(i)*f);kp.setZ(i,kp.getZ(i)*f);}keg.geometry.computeVertexNormals();keg.position.y=2.5;root.add(keg);
    for(const [y,rr] of [[.35,2.68],[2.5,3.04],[4.65,2.68]]){const hoop=new THREE.Mesh(new THREE.TorusGeometry(rr,.16,8,32),iron(102));hoop.rotation.x=Math.PI/2;hoop.position.y=y;root.add(hoop);}
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,10,8),std({color:'#8a5a30',roughness:.8,metalness:0}));rod.rotation.z=-.5;rod.position.set(1.8,4.4,1.8);root.add(rod);
    const sponge=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.4,12),std({color:'#3a2a20',roughness:1,metalness:0}));sponge.rotation.z=-.5;sponge.position.set(4.3,8.7,1.8);root.add(sponge);
    for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.9,20,16),iron(103+i));b.position.set(-3.2+i*1.1,.9,2.4-i*.4);root.add(b);}
    root.userData.cam={pos:[0,6,14],look:[0,3.5,0]};
  }
  if(name==='officer-helmsman'){
    const wood=std({color:'#7a4a28',roughness:.7,metalness:0}),brass=std({color:'#d4a64c',metalness:.9,roughness:.3});
    const rim=new THREE.Mesh(new THREE.TorusGeometry(4.2,.42,12,48),wood);root.add(rim);const inner=new THREE.Mesh(new THREE.TorusGeometry(2.2,.3,10,32),wood);root.add(inner);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,20),brass);hub.rotation.x=Math.PI/2;root.add(hub);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2,sp=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,6.4,8),wood);sp.position.set(Math.cos(a)*3.2,Math.sin(a)*3.2,0);sp.rotation.z=a-Math.PI/2;root.add(sp);
      const h=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,1.6,10),wood);h.position.set(Math.cos(a)*5.6,Math.sin(a)*5.6,0);h.rotation.z=a-Math.PI/2;root.add(h);const kn=new THREE.Mesh(new THREE.SphereGeometry(.42,10,8),wood);kn.position.set(Math.cos(a)*6.5,Math.sin(a)*6.5,0);root.add(kn);}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4.2,.16,8,48),brass);ring.position.z=.4;root.add(ring);
    root.rotation.set(-.3,.35,0);root.userData.cam={pos:[0,1,15],look:[0,0,0]};
  }
  if(name==='officer-carpenter'){
    const blade=std({color:'#c9ced4',metalness:.95,roughness:.28});
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(9,0);shape.lineTo(9,.6);for(let i=18;i>=0;i--){shape.lineTo(i*.5,i%2?2.6:2.2);}shape.lineTo(0,0);
    const saw=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false}),blade);saw.position.set(-5,1.5,0);saw.rotation.z=.25;root.add(saw);
    const handle=new THREE.Mesh(new THREE.TorusGeometry(1.1,.45,10,20),std({color:'#8a5a30',roughness:.7,metalness:0}));handle.position.set(-5.6,1.4,0);handle.scale.set(1,1.3,1);root.add(handle);
    const plank=new THREE.Mesh(new THREE.BoxGeometry(10,1,3),std({map:T.chestWoodTexture({seed:111,wood:'#b07a44',dark:'#7a4a24'}),roughness:.8,metalness:0}));plank.position.set(1,-.6,-1);plank.rotation.y=.25;root.add(plank);
    const square=new THREE.Mesh(new THREE.BoxGeometry(.5,4.5,.25),iron(112));square.position.set(3.4,1.6,1);root.add(square);const sq2=new THREE.Mesh(new THREE.BoxGeometry(3,.5,.25),iron(113));sq2.position.set(4.65,-.4,1);root.add(sq2);
    root.userData.cam={pos:[0,5,15],look:[0,1,0]};
  }
  if(name==='officer-lookout'){
    const brass=std({color:'#d4a64c',metalness:.9,roughness:.28}),leather=std({color:'#5a2a1c',roughness:.8,metalness:0});
    const parts=[[0,1.1,3.2,leather],[3.2,.9,2.6,brass],[5.8,.75,2.4,brass],[8.2,.6,2.2,brass]];
    for(const [x,r,len,m] of parts){const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,24),m);c.rotation.z=Math.PI/2;c.position.x=x-4;root.add(c);const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.05,.12,8,24),brass);ring.rotation.y=Math.PI/2;ring.position.x=x-4+len/2;root.add(ring);}
    const lens=new THREE.Mesh(new THREE.CircleGeometry(.6,24),std({color:'#9fe8ff',metalness:.2,roughness:.05,emissive:'#3fa8c8',emissiveIntensity:.6}));lens.rotation.y=Math.PI/2;lens.position.x=5.35;root.add(lens);
    root.rotation.set(.2,-.5,.35);root.userData.cam={pos:[0,4,15],look:[0,0,0]};
  }
  if(name==='officer-quartermaster'){
    const cloth=std({color:'#6a2a22',roughness:.9,metalness:0}),gold=std({color:'#f0c04a',metalness:.9,roughness:.25});
    const bag=new THREE.Mesh(new THREE.SphereGeometry(3,32,24),cloth);bag.scale.set(1,.95,.9);bag.position.y=2.9;root.add(bag);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(1.4,.7,1.6,16),cloth);neck.position.y=6.2;root.add(neck);
    const tie=new THREE.Mesh(new THREE.TorusGeometry(.8,.22,8,20),std({color:'#d4a64c',metalness:.6,roughness:.4}));tie.rotation.x=Math.PI/2;tie.position.y=5.6;root.add(tie);
    const r=T.rng(7);for(let i=0;i<9;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.22,20),gold);c.position.set(2.2+r()*3,.12+i*.24*(i<5?1:0),1.5+r()*1.5-(i>4?2:0));if(i>4){c.position.y=.12;c.rotation.set(r()*.6,0,r()*.6);}root.add(c);}
    root.userData.cam={pos:[0,6,14],look:[0,3,0]};
  }
  if(name==='officer-surgeon'){
    const glass=std({color:'#3f8a5a',metalness:.1,roughness:.08,transparent:true,opacity:.85}),cork=std({color:'#b08a5a',roughness:.9,metalness:0});
    const pts=[[0,0],[1.8,0],[1.9,.3],[1.9,3.6],[1.2,4.6],[.6,5],[.6,6.2],[0,6.2]].map(([x,y])=>new THREE.Vector2(x,y));
    const bottle=new THREE.Mesh(new THREE.LatheGeometry(pts,32),glass);root.add(bottle);
    const liquid=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,2.6,24),std({color:'#b02a2a',roughness:.2,metalness:0,emissive:'#4a0a0a'}));liquid.position.y=1.4;root.add(liquid);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.5,1,12),cork);c.position.y=6.6;root.add(c);
    const label=new THREE.Mesh(new THREE.CylinderGeometry(1.93,1.93,1.4,24,1,true),std({color:'#e8dcc0',roughness:.9,metalness:0}));label.position.y=2.4;root.add(label);
    
    root.userData.cam={pos:[0,5,14],look:[0,3,0]};
  }
  if(name==='ui-ring'||name==='ui-ring-attack'){
    const attack=name==='ui-ring-attack',brass=std({color:'#c89a45',metalness:.9,roughness:.32}),dark=std({color:'#3a2616',metalness:.4,roughness:.5});
    const [fc,fx]=T.canvas(256,256),fg=fx.createRadialGradient(110,100,10,128,128,130);fg.addColorStop(0,attack?'#8a2a1e':'#1f5a60');fg.addColorStop(.7,attack?'#4a120c':'#0c2a30');fg.addColorStop(1,attack?'#2a0806':'#061a1f');fx.fillStyle=fg;fx.fillRect(0,0,256,256);T.grain(fx,256,256,T.rng(attack?131:132),{alpha:.06,count:500});
    const face=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,.4,64),std({map:T.toTexture(fc),metalness:.2,roughness:.6}));face.rotation.x=Math.PI/2;root.add(face);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(4.75,.42,16,72),brass);root.add(rim);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(4.05,.14,10,72),dark);inner.position.z=.25;root.add(inner);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rv=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),brass);rv.position.set(Math.cos(a)*4.75,Math.sin(a)*4.75,.4);root.add(rv);}
    root.userData.cam={pos:[0,0,16],look:[0,0,0]};root.userData.flat=true;
  }
  if(name==='ui-slot'){
    const wood=std({map:T.chestWoodTexture({seed:141,wood:'#2a1c12',dark:'#1a110a'}),roughness:.8,metalness:0}),brass=std({color:'#b8904c',metalness:.9,roughness:.35});
    const base=new THREE.Mesh(new THREE.BoxGeometry(9,9,.6),wood);root.add(base);
    const inset=new THREE.Mesh(new THREE.BoxGeometry(7.8,7.8,.2),std({color:'#0a1c21',roughness:.9,metalness:0}));inset.position.z=.35;root.add(inset);
    for(const [x,y] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const c=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.25),brass);c.position.set(x*3.8,y*4.25,.4);root.add(c);const c2=new THREE.Mesh(new THREE.BoxGeometry(.5,1.8,.25),brass);c2.position.set(x*4.25,y*3.8,.4);root.add(c2);const rv=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),brass);rv.position.set(x*4.1,y*4.1,.55);root.add(rv);}
    root.userData.cam={pos:[0,0,16],look:[0,0,0]};root.userData.flat=true;
  }
  if(name==='icon-scroll'){
    const paper=std({map:T.sailTexture({seed:151,base:'#e8d7ae',dirt:.2}),roughness:.95,metalness:0,side:THREE.DoubleSide});
    const roll=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,9,28),paper);roll.rotation.z=Math.PI/2;roll.position.set(0,1.3,0);root.add(roll);
    for(const x of [-4.7,4.7]){const k=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1.2,14),std({color:'#6a3a1c',roughness:.6,metalness:0}));k.rotation.z=Math.PI/2;k.position.set(x,1.3,0);root.add(k);const ball=new THREE.Mesh(new THREE.SphereGeometry(.6,12,10),std({color:'#d4a64c',metalness:.9,roughness:.3}));ball.position.set(x*1.12,1.3,0);root.add(ball);}
    const sheet=new THREE.Mesh(new THREE.PlaneGeometry(8.4,5,8,4),paper);const sp=sheet.geometry.attributes.position;for(let i=0;i<sp.count;i++)sp.setZ(i,Math.sin(sp.getY(i)*.6)*.3);sheet.geometry.computeVertexNormals();sheet.rotation.x=-1.25;sheet.position.set(0,.3,2.6);root.add(sheet);
    const ribbon=new THREE.Mesh(new THREE.CylinderGeometry(1.36,1.36,.5,28),std({color:'#8a1f1a',roughness:.7,metalness:0}));ribbon.rotation.z=Math.PI/2;ribbon.position.set(-1.2,1.3,0);root.add(ribbon);
    const seal=new THREE.Mesh(new THREE.CylinderGeometry(.95,1,.4,20),std({color:'#a3251d',roughness:.45,metalness:.1}));seal.rotation.x=.9;seal.position.set(-1.2,1.7,1.25);root.add(seal);
    root.userData.cam={pos:[0,8,12],look:[0,1,1]};
  }
  if(name==='icon-gear'){
    const brass=std({color:'#c89a45',metalness:.9,roughness:.3});
    const shape=new THREE.Shape();const teeth=12;for(let i=0;i<=teeth*4;i++){const a=i/(teeth*4)*Math.PI*2,r=(i%4<2)?4.4:3.6;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}
    const hole=new THREE.Path();hole.absarc(0,0,1.3,0,Math.PI*2,true);shape.holes.push(hole);
    const gear=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:true,bevelSize:.15,bevelThickness:.15,bevelSegments:2,curveSegments:24}),brass);root.add(gear);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2,h=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.4,14),std({color:'#1b1c1e',metalness:.6,roughness:.5}));h.rotation.x=Math.PI/2;h.position.set(Math.cos(a)*2.4,Math.sin(a)*2.4,.5);root.add(h);}
    const small=gear.clone();small.scale.setScalar(.5);small.position.set(4.2,-3.6,-.6);small.rotation.z=.2;root.add(small);
    root.rotation.set(-.5,.3,0);root.userData.cam={pos:[0,2,15],look:[0,0,0]};
  }
  if(name==='icon-anvil'){
    const iron2=iron(161),shape=new THREE.Shape();shape.moveTo(-5,1.4);shape.lineTo(3.2,1.4);shape.quadraticCurveTo(6.2,1.3,6.6,.3);shape.quadraticCurveTo(4,.2,3,-.4);shape.lineTo(2,-1);shape.lineTo(1.8,-2.4);shape.lineTo(3,-3.6);shape.lineTo(-4,-3.6);shape.lineTo(-2.8,-2.4);shape.lineTo(-3,-1);shape.lineTo(-5,-.2);shape.closePath();
    const anvil=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:3,bevelEnabled:true,bevelSize:.15,bevelThickness:.15,bevelSegments:2}),iron2);anvil.position.set(-.5,3.6,-1.5);root.add(anvil);
    const glow=new THREE.Mesh(new THREE.BoxGeometry(3.4,.5,1.2),std({color:'#ff9a3a',emissive:'#ff6a10',emissiveIntensity:2.2}));glow.position.set(0,5.3,0);glow.rotation.y=.2;root.add(glow);
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,6,10),std({color:'#9a6a3a',roughness:.7,metalness:0}));handle.rotation.z=.9;handle.position.set(3.2,7.4,1.6);root.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,3),iron(162));head.position.set(1,8.9,1.6);head.rotation.set(0,Math.PI/2,.9);root.add(head);
    root.userData.cam={pos:[0,7,14],look:[0,4,0]};
  }
  if(name==='gunner-vignette'){
    const bronze=std({color:'#b07a3a',metalness:.9,roughness:.3}),wood=std({map:T.chestWoodTexture({seed:171,wood:'#6a3f22',dark:'#43240f'}),roughness:.8,metalness:0});
    const barrel=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[1.5,0],[1.6,.4],[1.35,.8],[1.25,5],[1.1,5.3],[1.05,9],[1.25,9.3],[1.25,9.8],[.7,9.8],[.7,9.5],[0,9.5]].map(([x,y])=>new THREE.Vector2(x,y)),40),bronze);
    barrel.rotation.z=-Math.PI/2+.12;barrel.position.set(-4.5,3.4,0);root.add(barrel);
    for(const x of [-2.6,2.2]){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.32,.16,8,32),bronze);ring.rotation.y=Math.PI/2;ring.position.set(x,3.4-(x+4.5)*.12,0);root.add(ring);}
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.6,16,12),bronze);knob.position.set(-5.2,3.3,0);root.add(knob);
    const carriage=new THREE.Mesh(new THREE.BoxGeometry(6.5,1.6,3.6),wood);carriage.position.set(-1.8,1.6,0);root.add(carriage);
    for(const [x,z] of [[-4.2,2],[-4.2,-2],[.6,2],[.6,-2]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.6,20),wood);w.rotation.x=Math.PI/2;w.position.set(x,1.05,z);root.add(w);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.7,10),iron(172));hub.rotation.x=Math.PI/2;hub.position.set(x,1.05,z);root.add(hub);}
    const im=iron(173);[[3.4,.9,1.6],[5.2,.9,1.6],[4.3,.9,3.1],[4.3,2.4,2.1]].forEach(([x,y,z])=>{const b=new THREE.Mesh(new THREE.SphereGeometry(.9,20,16),im);b.position.set(x,y,z);root.add(b);});
    const keg=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,2.8,20),std({map:T.chestWoodTexture({seed:174,wood:'#7a4a2a',dark:'#4a2a16'}),roughness:.8,metalness:0}));keg.position.set(5.2,1.4,-2);root.add(keg);
    for(const y of [.3,1.4,2.5]){const h=new THREE.Mesh(new THREE.TorusGeometry(1.45,.1,8,24),iron(175));h.rotation.x=Math.PI/2;h.position.set(5.2,y,-2);root.add(h);}
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,9,8),std({color:'#8a5a30',roughness:.8,metalness:0}));rod.rotation.z=.35;rod.position.set(6.6,4.4,-2.6);root.add(rod);
    const lantern=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,1.8,8),std({color:'#ffcf6a',emissive:'#ffa53a',emissiveIntensity:1.6}));lantern.position.set(2.2,.9,-2.6);root.add(lantern);
    root.userData.cam={pos:[2,7,15],look:[.5,2.4,0]};
  }
  if(name==='icon-chest'){
    const c=buildChestIcon();root.add(c);root.userData.cam={pos:[0,8,15],look:[0,3,0]};
  }
  if(name==='icon-flag'){
    // "Buradasın" sancağı: ahşap direk, pirinç topuz, dalgalanan kızıl korsan bayrağı
    const wood=std({color:'#5a3a1e',roughness:.8,metalness:0}),brass=std({color:'#d4a64c',metalness:.9,roughness:.3});
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,12,12),wood);pole.position.y=6;root.add(pole);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),brass);knob.position.y=12.2;root.add(knob);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.7,.6,20),brass);base.position.y=.3;root.add(base);
    const tex=T.flagTexture({seed:44,base:'#b3261e',mark:(c,W,H,col)=>{c.fillStyle=col;c.beginPath();c.arc(W*.4,H*.42,H*.2,0,7);c.fill();c.fillRect(W*.4-H*.12,H*.55,H*.24,H*.12);c.fillStyle='#b3261e';c.beginPath();c.arc(W*.4-H*.08,H*.4,H*.055,0,7);c.arc(W*.4+H*.08,H*.4,H*.055,0,7);c.fill();c.strokeStyle=col;c.lineWidth=H*.06;c.beginPath();c.moveTo(W*.4-H*.3,H*.72);c.lineTo(W*.4+H*.3,H*.9);c.moveTo(W*.4+H*.3,H*.72);c.lineTo(W*.4-H*.3,H*.9);c.stroke();},markColor:'#f0e2c0',tail:false});
    const g=new THREE.PlaneGeometry(7,4.6,14,4),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+3.5;p.setX(i,x);p.setZ(i,Math.sin(x/7*Math.PI*1.6)*.7*x/7);p.setY(i,p.getY(i)-x*.08);}g.computeVertexNormals();
    const flag=new THREE.Mesh(g,std({map:tex,side:THREE.DoubleSide,roughness:.85,metalness:0}));flag.position.set(.2,9.4,0);root.add(flag);
    root.rotation.y=-.35;root.userData.cam={pos:[0,4,15],look:[1.6,6.5,0]};
  }
  if(name==='icon-market'){
    // Pazar tezgâhı: ahşap tezgâh, dört direk, kırmızı-krem çizgili tente, çuval, fıçı ve altın yığını
    const wood=std({map:T.chestWoodTexture({seed:131,wood:'#8a5a32',dark:'#4a2c16'}),roughness:.8,metalness:0}),post=std({color:'#5a3a20',roughness:.8,metalness:0});
    const counter=new THREE.Mesh(new THREE.BoxGeometry(9,3,4),wood);counter.position.set(0,1.5,1);root.add(counter);
    const top=new THREE.Mesh(new THREE.BoxGeometry(9.6,.4,4.6),post);top.position.set(0,3.2,1);root.add(top);
    for(const [x,z] of [[-4.3,-1.6],[4.3,-1.6],[-4.3,2.8],[4.3,2.8]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,z<0?8.6:7,8),post);p.position.set(x,(z<0?8.6:7)/2,z);root.add(p);}
    const [sc,sx]=T.canvas(256,128);for(let i=0;i<8;i++){sx.fillStyle=i%2?'#efe2c4':'#b3261e';sx.fillRect(i*32,0,32,128);}T.grain(sx,256,128,T.rng(5),{alpha:.12,count:600});
    const cloth=std({map:T.toTexture(sc),roughness:.9,metalness:0,side:THREE.DoubleSide});
    const aw=new THREE.PlaneGeometry(10.4,5.6,12,6),ap=aw.attributes.position;for(let i=0;i<ap.count;i++){const y=ap.getY(i);ap.setZ(i,Math.sin((y+2.8)/5.6*Math.PI)*.35);}aw.computeVertexNormals();
    const awning=new THREE.Mesh(aw,cloth);awning.rotation.x=-Math.PI/2+.42;awning.position.set(0,7.8,.6);root.add(awning);
    for(let k=0;k<8;k++){const f=new THREE.Mesh(new THREE.CircleGeometry(.66,12,0,Math.PI),cloth);f.rotation.z=Math.PI;f.position.set(-4.55+k*1.3,6.72,3.2);f.rotation.x=-.2;root.add(f);}
    const sack=std({color:'#b89868',roughness:1,metalness:0});for(const [x,z,s] of [[-3,1.4,1.1],[-1.6,.6,1]]){const m=new THREE.Mesh(new THREE.SphereGeometry(s,16,12),sack);m.scale.y=1.2;m.position.set(x,3.4+s*1.1,z);root.add(m);}
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,1.9,16),wood);barrel.position.set(3,4.35,.8);root.add(barrel);
    const coin=std({color:'#f0c04a',metalness:.9,roughness:.25});for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.16,16),coin);c.position.set(.6+(i%3)*.3,3.5+i*.17,1.6);root.add(c);}
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.6,0),std({color:'#6fd8ff',metalness:.2,roughness:.1,emissive:'#1a6a8a',emissiveIntensity:.5}));gem.position.set(1.5,3.9,2.2);root.add(gem);
    root.rotation.y=-.35;root.userData.cam={pos:[0,6,15],look:[0,4,0]};
  }
  if(name==='icon-menu'){
    // Üç yatay pirinç çubuk (menü)
    const brass=std({color:'#d9a94a',metalness:.9,roughness:.3}),cap=std({color:'#7a4a1a',metalness:.6,roughness:.4});
    for(const y of [2.6,0,-2.6]){const bar=new THREE.Mesh(new THREE.CapsuleGeometry(.85,7.6,8,20),brass);bar.rotation.z=Math.PI/2;bar.position.y=y;root.add(bar);
      for(const x of [-4.4,4.4]){const k=new THREE.Mesh(new THREE.SphereGeometry(.95,16,12),cap);k.position.set(x,y,0);root.add(k);}}
    root.rotation.x=.25;root.userData.cam={pos:[0,1,15],look:[0,0,0],flat:true};
  }
  if(name==='captain-bust'){
    // Korsan kaptan büstü: kızıl sakal, göz bandı, üç köşeli şapka, apoletli lacivert ceket
    const skin=std({color:'#d99a74',roughness:.75,metalness:0}),beardM=std({color:'#b4481f',roughness:.95,metalness:0}),dark=std({color:'#141010',roughness:.6,metalness:0});
    const head=new THREE.Mesh(new THREE.SphereGeometry(3.1,40,32),skin);head.scale.set(1,1.15,1.02);root.add(head);
    const nose=new THREE.Mesh(new THREE.SphereGeometry(.7,20,16),skin);nose.scale.set(.85,1,1.25);nose.position.set(0,-.1,3.1);root.add(nose);
    for(const x of [-3,3]){const ear=new THREE.Mesh(new THREE.SphereGeometry(.75,16,12),skin);ear.scale.set(.45,1,.8);ear.position.set(x,.1,0);root.add(ear);}
    const eyeW=std({color:'#f4efe6',roughness:.3,metalness:0});const ew=new THREE.Mesh(new THREE.SphereGeometry(.42,16,12),eyeW);ew.position.set(1.15,.85,2.72);root.add(ew);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),dark);pupil.position.set(1.2,.85,3.08);root.add(pupil);
    const patch=new THREE.Mesh(new THREE.SphereGeometry(.75,20,14),dark);patch.scale.set(1,.85,.35);patch.position.set(-1.15,.85,2.8);root.add(patch);
    const strap=new THREE.Mesh(new THREE.TorusGeometry(3.18,.1,6,48),dark);strap.rotation.set(0,0,-.35);strap.scale.set(1,1.1,1.05);strap.position.y=.9;root.add(strap);
    const brow=std({color:'#8a2e14',roughness:.9,metalness:0});for(const x of [-1.2,1.2]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,.32,.4),brow);b.position.set(x,1.55,2.75);b.rotation.z=x>0?-.18:.18;root.add(b);}
    const bg=new THREE.SphereGeometry(2.9,36,28),bp=bg.attributes.position,n=T.noise2(21),v=new THREE.Vector3();
    for(let i=0;i<bp.count;i++){v.fromBufferAttribute(bp,i);v.multiplyScalar(1+n(v.x*1.4,v.y*1.4+v.z,3)*.18);bp.setXYZ(i,v.x,v.y,v.z);}bg.computeVertexNormals();
    const beard=new THREE.Mesh(bg,beardM);beard.scale.set(1.02,1.05,.78);beard.position.set(0,-2.2,1.2);root.add(beard);
    for(const s of [-1,1]){const m=new THREE.Mesh(new THREE.CapsuleGeometry(.36,1.6,6,12),beardM);m.rotation.z=s*1.2;m.position.set(s*1.05,-.72,3.05);root.add(m);}
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,.3),std({color:'#5a1a10',roughness:.8,metalness:0}));mouth.position.set(0,-1.15,3.05);root.add(mouth);
    const coat=std({color:'#20304c',roughness:.8,metalness:0}),gold=std({color:'#d4a64c',metalness:.9,roughness:.3});
    const body=new THREE.Mesh(new THREE.SphereGeometry(4.6,32,20,0,Math.PI*2,0,Math.PI/2),coat);body.scale.set(1.25,.7,.8);body.position.y=-6.2;root.add(body);
    for(const x of [-4.6,4.6]){const ep=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.4,20),gold);ep.position.set(x,-3.8,.2);ep.rotation.z=x>0?-.35:.35;root.add(ep);}
    const collar=new THREE.Mesh(new THREE.TorusGeometry(2.2,.5,10,24,Math.PI),std({color:'#e8e0cc',roughness:.9,metalness:0}));collar.rotation.x=Math.PI/2;collar.position.set(0,-4,.8);root.add(collar);
    const hat=buildIcon('icon-hat');hat.userData={};hat.scale.setScalar(.78);hat.position.set(0,2.4,-.2);hat.rotation.set(-.12,0,.05);root.add(hat);
    root.rotation.y=.28;root.userData.cam={pos:[0,1.5,16],look:[0,-.4,0]};
  }

  return root;
}
function buildChestIcon(){
  const g=new THREE.Group(),wood=std({map:T.chestWoodTexture({seed:72,wood:'#6e2a22',dark:'#3d1512'}),roughness:.8,metalness:0}),band=std({color:'#e0b24e',metalness:.85,roughness:.28});
  const body=new THREE.Mesh(new THREE.BoxGeometry(8,4.6,5.4),wood);body.position.y=2.3;g.add(body);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(2.7,2.7,8,20,1,false,0,Math.PI),wood);lid.rotation.z=Math.PI/2;lid.position.y=4.6;g.add(lid);
  for(const x of [-2.8,0,2.8]){const b=new THREE.Mesh(new THREE.BoxGeometry(.6,4.7,5.55),band);b.position.set(x,2.3,0);g.add(b);const arc=new THREE.Mesh(new THREE.TorusGeometry(2.72,.32,6,20,Math.PI),band);arc.position.set(x,4.6,0);arc.rotation.y=Math.PI/2;g.add(arc);}
  const lock=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.7,.5),band);lock.position.set(0,4,2.9);g.add(lock);
  const coin=std({color:'#f0c04a',metalness:.9,roughness:.25});const r=T.rng(3);for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.16,16),coin);m.position.set(-3+r()*6,.1,3.2+r()*1.4);m.rotation.set(r()*.4,0,r()*.4);g.add(m);}
  return g;
}

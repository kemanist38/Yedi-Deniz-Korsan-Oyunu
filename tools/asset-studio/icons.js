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
  return root;
}

// Kara Yelken — deniz canavarları: yengeç, deniz yılanı, denizanası, kaplumbağa, hidra.
// Her biri 8 karelik döngü için phase (0..2π) alır; su hattı y=0'da kesilir.
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.6,metalness:.05,...o});
function tube(points,r0,r1,mat,seg=40,radial=10){
  const curve=new THREE.CatmullRomCurve3(points),geo=new THREE.TubeGeometry(curve,seg,1,radial,false),pa=geo.attributes.position;
  for(let i=0;i<=seg;i++){const t=i/seg,c=curve.getPointAt(t),rad=r0+(r1-r0)*t;for(let j=0;j<=radial;j++){const k=i*(radial+1)+j,v=new THREE.Vector3(pa.getX(k),pa.getY(k),pa.getZ(k)).sub(c).multiplyScalar(rad).add(c);pa.setXYZ(k,v.x,v.y,v.z);}}
  geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
function foam(root,size,color,seed){const f=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:T.foamTexture({seed,color,strength:.38,inner:.36}),transparent:true,depthWrite:false}));f.rotation.x=-Math.PI/2;f.position.y=.05;f.userData.float=true;root.add(f);}
function eyes(root,pal,positions,size=2){const m=std({color:pal.eye[0],emissive:pal.eye[1],emissiveIntensity:2.2,roughness:.2});for(const p of positions){const e=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),m);e.position.set(...p);root.add(e);const pu=new THREE.Mesh(new THREE.BoxGeometry(size*.25,size*1.2,size*.3),std({color:'#110c05'}));pu.position.set(p[0],p[1],p[2]+size*.9);root.add(pu);}}
function skin(pal,seed){return std({map:T.skinTexture({seed,base:pal.base,dark:pal.dark,light:pal.light,spots:pal.spots}),roughness:.5});}
function lavaMat(pal){return std({color:pal.lava,emissive:pal.lava,emissiveIntensity:2.2});}

export function buildCrab(pal,phase,seed=1){
  const root=new THREE.Group(),shell=skin(pal,seed),limb=std({color:pal.limb,roughness:.45}),bob=Math.sin(phase)*.6;
  const body=new THREE.Mesh(new THREE.SphereGeometry(16,40,24),shell);body.scale.set(1.35,.55,1);body.position.y=3+bob;root.add(body);
  for(let i=0;i<9;i++){const a=(i/8-.5)*2.2,sp=new THREE.Mesh(new THREE.ConeGeometry(1.4,4,6),std({color:pal.dark,roughness:.4}));sp.position.set(Math.sin(a)*14,9.5+bob-Math.abs(a)*1.5,Math.cos(a)*6-4);root.add(sp);}
  if(pal.lava){for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,10+i),lavaMat(pal));c.position.set(-10+i*4,11+bob-Math.abs(i-2.5)*.6,0);c.rotation.y=.5-i*.2;root.add(c);}}
  // Bacaklar
  for(const sx of [-1,1])for(let k=0;k<4;k++){const lift=Math.max(0,Math.sin(phase+k*1.3+(sx>0?Math.PI:0)))*3,z=-8+k*5,base=new THREE.Vector3(sx*18,2+bob,z),knee=new THREE.Vector3(sx*28,9+lift,z+2),foot=new THREE.Vector3(sx*36,-2+lift*.6,z+4);
    root.add(tube([base,knee],1.6,1.2,limb,6,8));root.add(tube([knee,foot],1.2,.4,limb,6,8));}
  // Kıskaçlar
  for(const sx of [-1,1]){const open=.35+.3*Math.sin(phase*2+(sx>0?1:0)),sh=new THREE.Vector3(sx*12,4+bob,12),el=new THREE.Vector3(sx*20,8+bob,22),wr=new THREE.Vector3(sx*14,6+bob,32);
    root.add(tube([sh,el],2.2,1.8,limb,6,10));root.add(tube([el,wr],1.8,2.4,limb,6,10));
    const claw=new THREE.Group();claw.position.copy(wr);claw.rotation.y=sx*-.4;
    const upper=new THREE.Mesh(new THREE.ConeGeometry(2.6,10,10),shell);upper.rotation.x=Math.PI/2-open;upper.position.set(0,1.5,5);claw.add(upper);
    const lower=new THREE.Mesh(new THREE.ConeGeometry(2,8,10),shell);lower.rotation.x=Math.PI/2+open;lower.position.set(0,-1,4);claw.add(lower);
    const palm=new THREE.Mesh(new THREE.SphereGeometry(3.4,16,12),shell);palm.scale.set(1,.8,1.3);claw.add(palm);root.add(claw);}
  // Göz sapları
  for(const sx of [-1,1]){root.add(tube([new THREE.Vector3(sx*4,8+bob,13),new THREE.Vector3(sx*5,14+bob,15)],.7,.5,limb,4,6));}
  eyes(root,pal,[[-5,15+bob,15],[5,15+bob,15]],1.6);
  foam(root,84,'214,240,232',seed+3);root.scale.setScalar(1.25);root.userData.waterline=0;return root;
}

export function buildSerpent(pal,phase,seed=2){
  const root=new THREE.Group(),sk=skin(pal,seed),fin=std({color:pal.fin,roughness:.5,side:THREE.DoubleSide,...(pal.lava?{emissive:pal.lava,emissiveIntensity:.8}:{})});
  // Sudan yükselen kıvrımlar (arka → ön)
  const arcs=[[-34,-30,7],[-12,-14,9],[10,2,10]];
  arcs.forEach(([x,z,h],i)=>{const w=phase+i*1.1,rise=h+Math.sin(w)*2.2,r=4.4-i*.2+1;const pts=[];for(let k=0;k<=10;k++){const t=k/10,a=t*Math.PI;pts.push(new THREE.Vector3(x+Math.sin(w*.5)*2+(t-.5)*14,Math.sin(a)*rise*2-2,z+(t-.5)*10));}
    root.add(tube(pts,r*.9,r,sk,24,12));
    for(let k=0;k<4;k++){const t=.25+k*.17,p=pts[Math.round(t*10)],sp=new THREE.Mesh(new THREE.ConeGeometry(1.1,4.5,5),fin);sp.position.set(p.x,p.y+r*.9,p.z);root.add(sp);}});
  // Kuyruk
  root.add(tube([new THREE.Vector3(-46,-2,-40),new THREE.Vector3(-52,4+Math.sin(phase)*2,-46),new THREE.Vector3(-56,9+Math.sin(phase)*3,-50)],3,.4,sk,12,8));
  const tail=new THREE.Mesh(new THREE.ConeGeometry(4,8,3),fin);tail.scale.z=.2;tail.position.set(-57,12+Math.sin(phase)*3,-51);tail.rotation.z=.8;root.add(tail);
  // Boyun ve baş
  const sway=Math.sin(phase)*3,neck=[new THREE.Vector3(24,-2,14),new THREE.Vector3(28,12,20),new THREE.Vector3(26+sway,24,24),new THREE.Vector3(24+sway,30,30)];
  root.add(tube(neck,5.6,4.6,sk,24,14));
  const head=new THREE.Group();head.position.copy(neck[3]);head.rotation.x=.35;
  const skull=new THREE.Mesh(new THREE.SphereGeometry(6,24,16),sk);skull.scale.set(1,.8,1.6);head.add(skull);
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(5,20,12),sk);jaw.scale.set(.9,.45,1.4);jaw.position.set(0,-3.5-Math.max(0,Math.sin(phase*2))*1.4,2);head.add(jaw);
  for(const sx of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(1.2,8,8),std({color:pal.dark,roughness:.35}));horn.position.set(sx*3.5,4.5,-4);horn.rotation.set(-.9,0,sx*-.35);head.add(horn);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(7,5),fin);f.position.set(sx*6,1,-3);f.rotation.set(0,sx*.9,sx*.3);head.add(f);}
  root.add(head);eyes(root,pal,[[neck[3].x-3.6,neck[3].y+3.4,neck[3].z+4.6],[neck[3].x+3.6,neck[3].y+3.4,neck[3].z+4.6]],1.5);
  if(pal.lava)for(let i=0;i<5;i++){const drip=new THREE.Mesh(new THREE.SphereGeometry(1.1,8,6),std({color:pal.lava,emissive:pal.lava,emissiveIntensity:2.4}));drip.position.set(arcs[i%3][0]+(i-2)*2,6+i,arcs[i%3][1]);root.add(drip);}
  foam(root,96,'214,240,232',seed+3);root.userData.waterline=0;return root;
}

export function buildJelly(pal,phase,seed=3){
  const root=new THREE.Group(),pulse=1+.08*Math.sin(phase);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(18,48,24,0,Math.PI*2,0,Math.PI/2),std({color:pal.dome,emissive:pal.glow,emissiveIntensity:.9,transparent:true,opacity:.78,roughness:.15,metalness:0,side:THREE.DoubleSide}));
  dome.scale.set(pulse,.75/pulse,pulse);dome.position.y=-1;root.add(dome);
  const core=new THREE.Mesh(new THREE.SphereGeometry(7,24,16),std({color:pal.core,emissive:pal.glow,emissiveIntensity:2.2}));core.scale.y=.6;core.position.y=4;root.add(core);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2,lobe=new THREE.Mesh(new THREE.TorusGeometry(4,.9,8,20),std({color:pal.glow,emissive:pal.glow,emissiveIntensity:1.6}));lobe.position.set(Math.cos(a)*5,6,Math.sin(a)*5);lobe.rotation.x=Math.PI/2;root.add(lobe);}
  // Etek
  const rim=new THREE.Mesh(new THREE.TorusGeometry(18*pulse,1.2,8,64),std({color:pal.tentacle,emissive:pal.glow,emissiveIntensity:1.2}));rim.rotation.x=Math.PI/2;rim.position.y=.2;root.add(rim);
  // Su yüzeyinde dalgalanan dokunaçlar
  const tm=std({color:pal.tentacle,emissive:pal.glow,emissiveIntensity:1.4,transparent:true,opacity:.9});
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.13,pts=[];for(let k=0;k<=8;k++){const t=k/8,d=18+t*(26+(i%3)*6),off=Math.sin(phase*1.5+t*5+i)*4*t;pts.push(new THREE.Vector3(Math.cos(a)*d-Math.sin(a)*off,.35+Math.sin(t*Math.PI)*.8,Math.sin(a)*d+Math.cos(a)*off));}root.add(tube(pts,1.3,.3,tm,24,6));}
  foam(root,86,'230,240,255',seed+3);root.userData.waterline=0;return root;
}

export function buildTurtle(pal,phase,seed=4){
  const root=new THREE.Group(),sk=std({color:pal.skin,roughness:.55}),shellMat=skin({...pal,base:pal.shell},seed);
  const shell=new THREE.Mesh(new THREE.SphereGeometry(22,48,24,0,Math.PI*2,0,Math.PI/2),shellMat);shell.scale.set(1,.55,1.25);shell.position.y=1;root.add(shell);
  // Plakalar ve kayalar / kristaller
  const r=T.rng(seed);
  for(let i=0;i<14;i++){const a=r()*Math.PI*2,d=r()*16,x=Math.cos(a)*d,z=Math.sin(a)*d*1.2,y=1+11*Math.sqrt(Math.max(0,1-(d/22)**2));
    const m=pal.crystals?new THREE.Mesh(new THREE.ConeGeometry(1.4+r(),6+r()*6,6),std({color:pal.crystals,emissive:pal.crystals,emissiveIntensity:.5,transparent:true,opacity:.85,roughness:.1})):new THREE.Mesh(new THREE.DodecahedronGeometry(1.8+r()*2,0),std({color:pal.dark,roughness:.9}));
    m.position.set(x,y+1,z);m.rotation.set((r()-.5)*.5,r()*3,(r()-.5)*.5);root.add(m);}
  const rim=new THREE.Mesh(new THREE.TorusGeometry(22,1.6,8,48),std({color:pal.dark,roughness:.6}));rim.rotation.x=Math.PI/2;rim.scale.y=1.25;rim.position.y=1.2;root.add(rim);
  // Baş
  const lift=Math.sin(phase)*1.2,head=new THREE.Mesh(new THREE.SphereGeometry(6,24,16),sk);head.scale.set(.9,.7,1.3);head.position.set(0,4+lift,33);root.add(head);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(2.4,5,8),std({color:pal.dark,roughness:.4}));beak.rotation.x=Math.PI/2;beak.position.set(0,3+lift,41);root.add(beak);
  root.add(tube([new THREE.Vector3(0,1,24),new THREE.Vector3(0,3+lift,29)],4.6,4.2,sk,6,12));
  for(const sx of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(1,5,6),std({color:pal.dark}));horn.position.set(sx*3,8+lift,31);horn.rotation.set(-.6,0,sx*-.4);root.add(horn);}
  eyes(root,pal,[[-3.6,6.2+lift,37],[3.6,6.2+lift,37]],1.3);
  // Yüzgeçler
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const f=new THREE.Mesh(new THREE.SphereGeometry(8,16,8),sk);f.scale.set(1.2,.18,.55);const sw=Math.sin(phase+ph)*.5;f.position.set(sx*24,.6,sz*16);f.rotation.set(0,sx*(.6+sw)*sz,sx*.15);root.add(f);}
  foam(root,80,'214,240,232',seed+3);root.scale.setScalar(1.25);root.userData.waterline=0;return root;
}

export function buildHydra(pal,phase,seed=5){
  const root=new THREE.Group(),sk=skin(pal,seed),horn=std({color:pal.horn,roughness:.3,metalness:.3});
  const body=new THREE.Mesh(new THREE.SphereGeometry(18,40,24),sk);body.scale.set(1.3,.5,1.1);body.position.y=1;root.add(body);
  for(let i=0;i<7;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(1.4,5,6),horn);sp.position.set(-12+i*4,9-Math.abs(i-3)*.8,-6);sp.rotation.x=-.4;root.add(sp);}
  const heads=[[-14,.9],[0,0],[14,-.9]];
  heads.forEach(([bx,lean],i)=>{const w=phase+i*2.1,sway=Math.sin(w)*4,rise=Math.cos(w)*2;
    const top=i===1?58:48,neck=[new THREE.Vector3(bx*.6,4,4),new THREE.Vector3(bx*1.1+lean*6,20,6),new THREE.Vector3(bx*1.3+sway,top*.7+rise,10),new THREE.Vector3(bx*1.4+sway*1.3+lean*4,top+rise,16)];
    root.add(tube(neck,5.4,3.8,sk,28,12));
    const h=new THREE.Group();h.position.copy(neck[3]);h.rotation.set(.45,lean*.3,0);
    const skull=new THREE.Mesh(new THREE.SphereGeometry(6.2,20,14),sk);skull.scale.set(.95,.8,1.6);h.add(skull);
    const jaw=new THREE.Mesh(new THREE.SphereGeometry(5,16,10),sk);jaw.scale.set(.85,.4,1.4);jaw.position.set(0,-2.6-Math.max(0,Math.sin(w*2))*1.2,1.8);h.add(jaw);
    for(const sx of [-1,1]){const hr=new THREE.Mesh(new THREE.ConeGeometry(.9,6,6),horn);hr.position.set(sx*2.6,3.4,-3.4);hr.rotation.set(-1,0,sx*-.3);h.add(hr);}
    root.add(h);eyes(root,pal,[[neck[3].x-3.4,neck[3].y+3.2,neck[3].z+4.6],[neck[3].x+3.4,neck[3].y+3.2,neck[3].z+4.6]],1.4);});
  foam(root,90,'214,240,232',seed+3);root.userData.waterline=0;return root;
}

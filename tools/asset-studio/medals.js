// Başarım madalyaları (3B): tırtıklı kenarlı dövme madalyon (bronz/gümüş/altın), parlak mine zemin,
// kabartma amblem ve arkada dokulu kurdele. Ortam haritasıyla gerçek metal yansımaları alır.
import * as THREE from 'three';
import * as T from './textures.js';

const METALS=[{color:'#c07a45',rough:.34},{color:'#dfe4ea',rough:.26},{color:'#f0bf4c',rough:.24}];
const ENAMEL=['#7a1616','#16306e','#4a1670'];
const RIBBON=[['#8a1a1a','#e8c47a'],['#1a3a8a','#e8e8f0'],['#5a1a8a','#f1c662']];

function hammer(seed){const W=256,[c,x]=T.canvas(W,W),r=T.rng(seed);x.fillStyle='#808080';x.fillRect(0,0,W,W);
  for(let i=0;i<900;i++){const px=r()*W,py=r()*W,rad=2+r()*6,g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,r()<.5?'#9a9a9a':'#6a6a6a');g.addColorStop(1,'#80808000');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,7);x.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function ribbonTexture(base,stripe){const W=64,H=256,[c,x]=T.canvas(W,H);x.fillStyle=base;x.fillRect(0,0,W,H);x.fillStyle=stripe;x.fillRect(W*.42,0,W*.16,H);x.fillRect(W*.08,0,W*.06,H);x.fillRect(W*.86,0,W*.06,H);
  x.globalAlpha=.18;for(let y=0;y<H;y+=2){x.fillStyle=y%4?'#000':'#fff';x.fillRect(0,y,W,1);}return T.toTexture(c);}
const metal=(m,seed)=>new THREE.MeshStandardMaterial({color:m.color,metalness:1,roughness:m.rough,bumpMap:hammer(seed),bumpScale:.6});
const polished=(m)=>new THREE.MeshStandardMaterial({color:m.color,metalness:1,roughness:m.rough*.6});
const ext=(shape,depth,bevel=.1)=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:24});
const rect=(w,h,x=0,y=0)=>{const s=new THREE.Shape();s.moveTo(x-w/2,y-h/2);s.lineTo(x+w/2,y-h/2);s.lineTo(x+w/2,y+h/2);s.lineTo(x-w/2,y+h/2);s.closePath();return s;};
const circle=(r,x=0,y=0)=>{const s=new THREE.Shape();s.absarc(x,y,r,0,Math.PI*2,false);return s;};
const hole=(r,x,y)=>{const p=new THREE.Path();p.absarc(x,y,r,0,Math.PI*2,true);return p;};

// Amblemler: {shapes:[[shape,rotZ,x,y]], extra:(group,mat)=>void}
function emblem(name,mat,accent){
  const g=new THREE.Group(),add=(shape,rz=0,x=0,y=0,d=.35)=>{const m=new THREE.Mesh(ext(shape,d,.1),mat);m.rotation.z=rz;m.position.set(x,y,0);g.add(m);return m;};
  switch(name){
    case 'skull':{const h=circle(1.35,0,.55);h.holes.push(hole(.36,-.5,.5),hole(.36,.5,.5));add(h);add(rect(1.2,.8,0,-.55));
      const bone=()=>{const s=rect(3.8,.34);return s;};add(bone(),.6,0,-1.05,.25);add(bone(),-.6,0,-1.05,.25);
      for(const [x,y] of [[-1.55,-2.1],[1.55,-2.1],[-1.55,0],[1.55,0]]){const m=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),mat);m.position.set(x,y,.12);g.add(m);}break;}
    case 'anchor':{add(rect(.42,4.2,0,.1));add(rect(2.4,.36,0,1.2));const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.14,12,24),mat);ring.position.set(0,2.5,.15);g.add(ring);
      const arc=new THREE.Mesh(new THREE.TorusGeometry(1.7,.22,12,40,Math.PI*.9),mat);arc.rotation.z=Math.PI*1.05;arc.position.set(0,-.2,.15);g.add(arc);
      for(const s of [-1,1]){const tip=new THREE.Mesh(new THREE.ConeGeometry(.3,.7,12),mat);tip.position.set(s*1.62,-.05,.15);tip.rotation.z=s*.6;g.add(tip);}break;}
    case 'trident':{add(rect(.36,4.6,0,-.3));const fork=new THREE.Shape();fork.moveTo(-1.5,1.9);fork.lineTo(-1.5,.6);fork.quadraticCurveTo(0,-.4,1.5,.6);fork.lineTo(1.5,1.9);fork.lineTo(1.18,1.9);fork.lineTo(1.18,.8);fork.quadraticCurveTo(0,.1,-1.18,.8);fork.lineTo(-1.18,1.9);fork.closePath();add(fork);
      for(const x of [-1.34,0,1.34]){const c=new THREE.Mesh(new THREE.ConeGeometry(.3,.8,12),mat);c.position.set(x,x?2.25:2.2,.16);g.add(c);}break;}
    case 'crown':{const s=new THREE.Shape();s.moveTo(-2.3,-1.2);s.lineTo(-2.3,1.1);s.lineTo(-1.2,.1);s.lineTo(0,1.7);s.lineTo(1.2,.1);s.lineTo(2.3,1.1);s.lineTo(2.3,-1.2);s.closePath();add(s);add(rect(4.8,.55,0,-1.55));
      for(const [x,y] of [[-2.3,1.25],[0,1.85],[2.3,1.25]]){const b=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),mat);b.position.set(x,y,.2);g.add(b);}
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.42),new THREE.MeshPhysicalMaterial({color:accent,metalness:0,roughness:.05,clearcoat:1,transmission:.2}));gem.position.set(0,-.3,.45);g.add(gem);break;}
    case 'coin':{for(const [x,y,z] of [[-1,-.6,0],[1,-.6,0],[0,.6,.3]]){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,.3,40),mat);c.rotation.x=Math.PI/2;c.position.set(x,y,z+.15);g.add(c);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(1.05,.07,8,32),mat);rim.position.set(x,y,z+.32);g.add(rim);}break;}
    case 'xmap':{const pm=new THREE.Mesh(ext(rect(3.8,3),.15,.08),new THREE.MeshStandardMaterial({color:'#e9d3a0',roughness:.9,metalness:0}));g.add(pm);
      for(const x of [-1.9,1.9]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,3.3,16),mat);r.position.set(x,0,.2);g.add(r);}
      const red=new THREE.MeshStandardMaterial({color:'#b0261a',roughness:.4});for(const a of [.78,-.78]){const b=new THREE.Mesh(ext(rect(2.2,.36),.12,.06),red);b.rotation.z=a;b.position.z=.2;g.add(b);}break;}
    case 'scroll':{const pm=new THREE.Mesh(ext(rect(2.8,3.4),.12,.06),new THREE.MeshStandardMaterial({color:'#efdcb0',roughness:.9}));g.add(pm);
      for(const y of [1.8,-1.8]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,3.4,20),mat);r.rotation.z=Math.PI/2;r.position.set(0,y,.2);g.add(r);}
      const ink=new THREE.MeshStandardMaterial({color:'#4a2e14',roughness:.8});for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(1.9-(i%2)*.5,.12,.05),ink);l.position.set(0,.9-i*.6,.22);g.add(l);}break;}
    case 'flame':{const s=new THREE.Shape();s.moveTo(0,2.6);s.bezierCurveTo(2.1,.6,1.8,-2.2,0,-2.3);s.bezierCurveTo(-1.8,-2.2,-2.1,0,-.6,1.1);s.bezierCurveTo(-.4,0,.2,-.2,.2,.5);s.bezierCurveTo(.2,1.4,-.2,2,0,2.6);add(s,0,0,0,.45);
      const core=new THREE.Mesh(ext(circle(.55,0,-1.1),.2,.08),new THREE.MeshStandardMaterial({color:'#ffcf6a',emissive:'#ff8a2a',emissiveIntensity:1.2}));core.position.z=.45;g.add(core);break;}
    case 'star':{const s=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?1.05:2.5,a=Math.PI/2+i*Math.PI/5;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();add(s,0,0,0,.5);break;}
    case 'sun':{add(circle(1.15),0,0,0,.4);for(let i=0;i<12;i++){const s=new THREE.Shape();s.moveTo(-.3,1.35);s.lineTo(0,2.5);s.lineTo(.3,1.35);s.closePath();add(s,i*Math.PI/6,0,0,.25);}break;}
  }
  return g;
}

export function buildMedal(name,tier){
  const root=new THREE.Group(),M=METALS[tier],body=metal(M,40+tier),shiny=polished(M);
  // tırtıklı kenar
  const rim=new THREE.Shape();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=5+.22*Math.cos(a*32);i?rim.lineTo(Math.cos(a)*r,Math.sin(a)*r):rim.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
  const disc=new THREE.Mesh(ext(rim,.7,.22),body);disc.position.z=-.7;root.add(disc);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(4.15,.24,16,96),shiny);ring.position.z=.42;root.add(ring);
  const dots=24;for(let i=0;i<dots;i++){const a=i/dots*Math.PI*2,b=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),shiny);b.position.set(Math.cos(a)*4.65,Math.sin(a)*4.65,.3);root.add(b);}
  const field=new THREE.Mesh(new THREE.CylinderGeometry(3.9,3.9,.12,64),new THREE.MeshPhysicalMaterial({color:ENAMEL[tier],roughness:.18,metalness:.1,clearcoat:1,clearcoatRoughness:.05}));field.rotation.x=Math.PI/2;field.position.z=.3;root.add(field);
  const em=emblem(name,shiny,['#e0302a','#3f8aff','#c04aff'][tier]);em.position.z=.36;em.scale.setScalar(1.05);root.add(em);
  // kurdele kuyrukları (arkada, aşağı doğru)
  const [rb,rs]=RIBBON[tier],rmat=new THREE.MeshStandardMaterial({map:ribbonTexture(rb,rs),roughness:.75,metalness:0,side:THREE.DoubleSide});
  for(const s of [-1,1]){const tail=new THREE.Shape();tail.moveTo(-1,2);tail.lineTo(1,2);tail.lineTo(1,-4.2);tail.lineTo(0,-3.4);tail.lineTo(-1,-4.2);tail.closePath();
    const geo=new THREE.ShapeGeometry(tail);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,(geo.attributes.position.getX(i)+1)/2,(geo.attributes.position.getY(i)+4.2)/6.2);}
    const m=new THREE.Mesh(geo,rmat);m.position.set(s*1.7,-3.6,-1.05);m.rotation.z=s*.32;m.rotation.y=s*.25;root.add(m);}
  root.userData.cam={pos:[0,2.2,14],look:[0,-.6,0]};
  return root;
}

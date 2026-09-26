// Yedi Deniz — profesyonel 3B raster ada üreticisi.
// Her tema 6 farklı siluet üretir; deniz rengi modele gömülmez, çıktı şeffaftır.
import * as THREE from 'three';
const mat=(o={})=>new THREE.MeshStandardMaterial({roughness:.86,metalness:0,...o});
const rock=(color,scale,pos,rot=0)=>{const m=new THREE.Mesh(new THREE.DodecahedronGeometry(1,1),mat({color}));m.scale.set(...scale);m.position.set(...pos);m.rotation.y=rot;return m;};
const box=(g,s,p,m)=>{const x=new THREE.Mesh(new THREE.BoxGeometry(...s),m);x.position.set(...p);g.add(x);return x;};
const cyl=(g,r,h,p,m,seg=10)=>{const x=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,h,seg),m);x.position.set(...p);g.add(x);return x;};
const palettes={
 verdant:{rock:'#5a5140',top:'#66834d',sand:'#c8ad73',accent:'#365b3b',glow:'#9fd36a'},
 misty:{rock:'#53585a',top:'#66726c',sand:'#9b9b88',accent:'#39484a',glow:'#a9d8cf'},
 coral:{rock:'#78604d',top:'#6d8c59',sand:'#d9ba78',accent:'#d16c55',glow:'#6bd6ca'},
 haven:{rock:'#665746',top:'#708956',sand:'#d9bf82',accent:'#4d6d47',glow:'#b8df82'},
 crimson:{rock:'#4a3738',top:'#674348',sand:'#8d6859',accent:'#8b2e32',glow:'#e64a45'},
 storm:{rock:'#343b45',top:'#45535a',sand:'#667079',accent:'#283544',glow:'#73c8e8'},
 ice:{rock:'#657988',top:'#a9d4dc',sand:'#c7e8e9',accent:'#6ab9ce',glow:'#b8f4ff'},
 toxic:{rock:'#495343',top:'#617a45',sand:'#87905a',accent:'#607f31',glow:'#a8ef54'},
 lava:{rock:'#332b2b',top:'#493534',sand:'#65453a',accent:'#201a1a',glow:'#ff6b24'},
 abyss:{rock:'#302a42',top:'#44355e',sand:'#65507b',accent:'#20182f',glow:'#a56cff'}
};
function tree(g,x,z,s,m){const trunk=mat({color:'#4b3826'}),leaf=mat({color:m});cyl(g,.22*s,2.2*s,[x,1.4*s,z],trunk,7);const c=new THREE.Mesh(new THREE.ConeGeometry(1.1*s,2.6*s,7),leaf);c.position.set(x,3.1*s,z);g.add(c);}
function crystal(g,x,z,s,color){const m=new THREE.Mesh(new THREE.ConeGeometry(.55*s,2.8*s,6),mat({color,emissive:color,emissiveIntensity:.45,roughness:.28}));m.position.set(x,1.3*s,z);m.rotation.z=.12;g.add(m);}
function tower(g,x,z,s,p){const stone=mat({color:p.rock}),trim=mat({color:p.sand});cyl(g,1.2*s,4.4*s,[x,2.2*s,z],stone,10);cyl(g,1.5*s,.5*s,[x,4.45*s,z],trim,10);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;box(g,[.45*s,.7*s,.55*s],[x+Math.cos(a)*1.15*s,4.85*s,z+Math.sin(a)*1.15*s],stone);}}
function lighthouse(g,x,z,s,p){const stone=mat({color:'#d6d0bd'}),roof=mat({color:p.accent});cyl(g,.75*s,5.5*s,[x,2.75*s,z],stone,12);const r=new THREE.Mesh(new THREE.ConeGeometry(1.15*s,1.5*s,10),roof);r.position.set(x,6.2*s,z);g.add(r);const l=new THREE.PointLight(p.glow,2.4,18*s);l.position.set(x,5.7*s,z);g.add(l);}
export function buildIsland(theme='verdant',variant=0){
 const p=palettes[theme]||palettes.verdant,g=new THREE.Group(),R=18+(variant%3)*2.5,rockM=mat({color:p.rock}),topM=mat({color:p.top}),sandM=mat({color:p.sand});
 // Tabanı tek bir daire değil, 7 parçalı asimetrik kıyı yapar.
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2+(variant*.31),rr=R*(.38+(i%3)*.08),h=4+(i+variant)%4*1.2;g.add(rock(p.rock,[rr*.72,h,rr*.58],[Math.cos(a)*R*.42,-1+((i+variant)%2),Math.sin(a)*R*.34],a));}
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(R*.72,R*.92,2.2,11),variant===2||variant===5?rockM:topM);cap.position.y=2.1;cap.rotation.y=variant*.37;g.add(cap);
 if(variant===0){for(const [x,z,s] of [[-5,-2,1.2],[4,2,1],[0,6,.9],[-1,-7,.8]])tree(g,x,z,s,p.accent);}
 if(variant===1){lighthouse(g,-2,0,1.25,p);for(const [x,z,s] of [[6,3,.8],[-7,-4,.7]])tree(g,x,z,s,p.accent);}
 if(variant===2){tower(g,0,0,1.45,p);box(g,[7,1.2,1.3],[0,1.5,-4],rockM);box(g,[1.3,2.4,6],[-3.1,2,-4],rockM);}
 if(variant===3){ // hilal/resif: merkez boşluğu görsel olarak kum ve iki uçurumla açılır
   const lagoon=new THREE.Mesh(new THREE.TorusGeometry(8,2.1,8,28,Math.PI*1.45),sandM);lagoon.rotation.x=Math.PI/2;lagoon.rotation.z=.6;lagoon.position.y=3.35;g.add(lagoon);
   for(const [x,z,s] of [[-8,2,1],[7,-1,1.1],[2,7,.75]])tree(g,x,z,s,p.accent);
 }
 if(variant===4){for(let i=0;i<5;i++)crystal(g,-6+i*3,(i%2?3:-2),.75+(i%3)*.18,p.glow);}
 if(variant===5){ // yüksek sivri uçurum
   for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const sp=new THREE.Mesh(new THREE.ConeGeometry(3.2-i*.25,9+i*1.7,7),rockM);sp.position.set(Math.cos(a)*5,6+i*.5,Math.sin(a)*4);g.add(sp);}tower(g,0,0,1.05,p);
 }
 // Tema katmanları: lav/ice/abyss/toxic gerçekten modelin parçası.
 if(theme==='lava')for(let i=0;i<5;i++)crystal(g,-7+i*3.5,(i%2?5:-5),.55,p.glow);
 if(theme==='ice')for(let i=0;i<7;i++)crystal(g,-9+i*3,(i%3-1)*5,.65+(i%2)*.2,p.glow);
 if(theme==='abyss')for(let i=0;i<6;i++)crystal(g,-8+i*3.2,(i%2?6:-4),.7,p.glow);
 if(theme==='toxic')for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(1.2+(i%2)*.5,12,8),mat({color:p.glow,emissive:p.glow,emissiveIntensity:.25}));b.scale.y=.35;b.position.set(-7+i*3.5,3.5,(i%2?5:-4));g.add(b);}
 g.userData.waterline=0;g.userData.cam={span:64,lookY:4};return g;
}
export function buildFleetFortress(theme='verdant'){
 const p=palettes[theme]||palettes.verdant,g=buildIsland(theme,5),stone=mat({color:p.rock}),trim=mat({color:p.sand}),metal=mat({color:p.accent,metalness:.45,roughness:.5});
 // Merkez deniz kalesi
 box(g,[15,6,12],[0,6,0],stone);box(g,[12,2,9],[0,10,0],trim);tower(g,-7,-5,1.15,p);tower(g,7,-5,1.15,p);tower(g,-7,5,1.15,p);tower(g,7,5,1.15,p);
 const keep=box(g,[7,8,6],[0,14,0],stone);keep.rotation.y=.08;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(5.2,4,4),metal);roof.position.y=20;roof.rotation.y=Math.PI/4;g.add(roof);
 // Tema imzası: kale biyomları yalnız renkle değil gerçek 3B geometriyle ayrılır.
 if(theme==='lava'){
   const lava=mat({color:'#ff6a1c',emissive:'#ff3b0b',emissiveIntensity:1.9,roughness:.25});
   for(const x of [-5,0,5])crystal(g,x,9,1.2,p.glow);
   // Kalenin ön yamacından denize inen üç fiziksel lav kanalı.
   for(const x of [-6,0,6]){const stream=box(g,[2.1,.38,15],[x,3.4,13],lava);stream.rotation.x=-.16;}
   const crater=new THREE.Mesh(new THREE.TorusGeometry(7.2,1.15,8,28),lava);crater.rotation.x=Math.PI/2;crater.position.set(0,20.4,0);g.add(crater);
 }
 if(theme==='ice'){
   const ice=mat({color:'#c7f5ff',emissive:'#77d9f1',emissiveIntensity:.55,transparent:true,opacity:.88,roughness:.18});
   for(const x of [-7,-3,2,6])crystal(g,x,8+(x%2)*2,1.15,p.glow);
   for(const [x,z,s] of [[-11,-2,1.4],[11,1,1.25],[-8,10,1],[9,9,1.1]]){const sp=new THREE.Mesh(new THREE.ConeGeometry(1.5*s,7*s,6),ice);sp.position.set(x,5*s,z);g.add(sp);}
 }
 if(theme==='abyss'){
   const voidM=mat({color:'#21142f',emissive:'#7d3cff',emissiveIntensity:.72,roughness:.35});
   for(const x of [-6,0,6])crystal(g,x,8,1.5,p.glow);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(8.5,.55,8,30),voidM);ring.rotation.x=Math.PI/2;ring.position.set(0,11.2,0);g.add(ring);
 }
 if(theme==='storm'){
   for(const x of [-6,6]){const rod=box(g,[.38,9,.38],[x,19,0],metal);rod.rotation.z=.08*x;const tip=new THREE.Mesh(new THREE.ConeGeometry(.75,2.8,6),mat({color:'#bdefff',emissive:'#70cfff',emissiveIntensity:1.1}));tip.position.set(x,24,0);g.add(tip);}
 }
 if(theme==='coral'){
   const coralM=mat({color:'#d96f63',roughness:.7}),pearl=mat({color:'#dff9f5',emissive:'#7de5d6',emissiveIntensity:.45,roughness:.22});
   for(const sx of [-1,1])for(let k=0;k<3;k++){const x=sx*(10+k*2),z=-7+k*7;cyl(g,.45,4.5,[x,4.5,z],coralM,7);const branch=box(g,[2.8,.45,.45],[x+sx*1.1,5.4,z],coralM);branch.rotation.z=sx*.55;}
   for(const x of [-5,0,5]){const q=new THREE.Mesh(new THREE.SphereGeometry(.7,12,9),pearl);q.position.set(x,12,7);g.add(q);}
 }
 if(theme==='misty'){
   const ruin=mat({color:'#747b77',roughness:.98});
   for(const x of [-10,10]){box(g,[2.2,8,2.2],[x,7,5],ruin);box(g,[5,.8,2.4],[x,11,5],ruin);}
   for(const x of [-4,4]){const arch=new THREE.Mesh(new THREE.TorusGeometry(2.5,.5,7,16,Math.PI),ruin);arch.position.set(x,8,8);arch.rotation.z=Math.PI;g.add(arch);}
 }
 if(theme==='crimson'){
   const red=mat({color:'#641d24',metalness:.5,roughness:.42}),gold=mat({color:'#c59b4a',metalness:.72,roughness:.28});
   for(const sx of [-1,1]){const blade=new THREE.Mesh(new THREE.ConeGeometry(1.1,7,4),red);blade.position.set(sx*9,13,7);blade.rotation.z=sx*.22;g.add(blade);}
   const crest=new THREE.Mesh(new THREE.TorusGeometry(4,.42,7,20),gold);crest.position.set(0,15,6.2);crest.rotation.x=Math.PI/2;g.add(crest);
 }
 if(theme==='toxic'){
   const toxic=mat({color:'#8fd33f',emissive:'#79e82e',emissiveIntensity:.85,transparent:true,opacity:.82,roughness:.3});
   for(const [x,z,s] of [[-10,-5,1.2],[9,-7,1],[12,5,.9],[-11,7,1]]){const pod=new THREE.Mesh(new THREE.SphereGeometry(1.8*s,12,8),toxic);pod.scale.y=.55;pod.position.set(x,5,z);g.add(pod);}
 }
 if(theme==='verdant'||theme==='haven'){
   for(const [x,z,s] of [[-11,-7,.9],[11,-5,.8],[-12,7,.75],[12,8,.85]])tree(g,x,z,s,p.accent);
 }
 g.userData.waterline=0;g.userData.cam={span:82,lookY:7};return g;
}

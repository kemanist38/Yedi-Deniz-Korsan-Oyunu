// Kara Yelken — filo adaları: içine girilebilen, surlu halka ada + merkez burç.
// Birimler oyun dünyası birimidir. Giriş (sur açıklığı) güneye (+Z, ekranın altı) bakar.
// Saldırılabilir kuleler ayrı sprite'tır (buildFleetTower); konumları FLEET_TOWERS ile oyuna aktarılır.
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.85,metalness:0,...o});
export const FLEET_ELEVATION=50;
export const RING_R=400,RING_W=92,GAP=.62,CORE_R=150;
// Oyun koordinatında (x sağ, y aşağı) kule konumları: surda 6, merkez adada 2.
export const FLEET_TOWERS=[...Array.from({length:6},(_,k)=>{const a=Math.PI/2+GAP/2+(Math.PI*2-GAP)*(k+.5)/6;return[Math.round(Math.cos(a)*RING_R),Math.round(Math.sin(a)*RING_R)];}),[-100,30],[100,30]];

export const FLEET_THEMES={
  verdant:{stone:'#8a8574',stoneDark:'#5a5648',moss:'#4f6a3a',land:'#4a7a3c',land2:'#6a9a4a',sand:'#d9c48a',roof:'#6e2a22',water:['#6fd6c4','#1f6f77'],trees:'#3f7a34'},
  coral:{stone:'#e0c8b8',stoneDark:'#b09080',moss:'#e08a7a',land:'#6a9a4a',land2:'#8ab45a',sand:'#f0dcae',roof:'#2f8a8a',water:['#8ff0dc','#2a8a8c'],trees:'#4f8a3a',coral:true},
  misty:{stone:'#6e726c',stoneDark:'#44474a',moss:'#56705a',land:'#3f5d4a',land2:'#56705a',sand:'#a9a58f',roof:'#3a4a48',water:['#6fb8b8','#1d5a63'],trees:'#2f4a36',ruined:true,fog:true},
  crimson:{stone:'#9a4a38',stoneDark:'#6a2a1e',moss:'#7a5a36',land:'#7a5a36',land2:'#94703f',sand:'#caa27a',roof:'#1a1010',water:['#d69a7e','#5b2a2a'],trees:'#5a4a2a',banners:'#a01f1c'},
  ice:{stone:'#c8dcea',stoneDark:'#8aa4b8',moss:'#ffffff',land:'#e8f0f4',land2:'#d4e2ec',sand:'#dfe8ee',roof:'#4a7aa8',water:['#9fdcf0','#2a5a78'],trees:'#dfe8ee',ice:true},
  toxic:{stone:'#4a4a38',stoneDark:'#2a2a1e',moss:'#8adf5a',land:'#3a4a1e',land2:'#56662a',sand:'#6a6a3a',roof:'#2a3a12',water:['#8adf5a','#1f3a1a'],trees:'#4a6a22',pools:'#8aff4a'},
  lava:{stone:'#2a2220',stoneDark:'#141010',moss:'#3a2a22',land:'#2a1e1a',land2:'#3a2a22',sand:'#3a2a24',roof:'#1a0a06',water:['#ff8a3a','#3a1208'],trees:null,lava:'#ff5a10'},
  storm:{stone:'#3a3e48',stoneDark:'#22252c',moss:'#2e3530',land:'#2e3530',land2:'#3d4640',sand:'#6e6a66',roof:'#1a2030',water:['#6f86a8','#1c2740'],trees:'#2f4a36',storm:'#9ab8ff'},
  abyss:{stone:'#2e2440',stoneDark:'#18122a',moss:'#4a2a78',land:'#241c34',land2:'#302644',sand:'#3a3048',roof:'#0e0818',water:['#9a6aff','#1a0e30'],trees:null,crystal:'#b070ff'},
};

function ringLand(th,n){
  // Açı × yarıçap ızgarası; açıklık (GAP) dışında kalan halka
  const A=180,Rn=10,pos=[],col=[],idx=[],c=new THREE.Color();
  const start=Math.PI/2+GAP/2,len=Math.PI*2-GAP;
  for(let i=0;i<=A;i++){const a=start+len*i/A,endFade=Math.min(1,Math.min(i,A-i)/6);
    for(let j=0;j<=Rn;j++){const t=j/Rn,r=RING_R-RING_W/2+RING_W*t+n(Math.cos(a)*3,Math.sin(a)*3,3)*10*(t===0||t===1?1:0);
      const hump=Math.sin(t*Math.PI),h=(hump*10+n(Math.cos(a)*6+t,Math.sin(a)*6,3)*4*hump)*endFade-1.5*(1-hump);
      pos.push(Math.cos(a)*r,h,Math.sin(a)*r);
      if(h<2)c.set(th.sand);else c.set(th.land).lerp(new THREE.Color(th.land2),(n(a*4,t*3,2)+1)/2);col.push(c.r,c.g,c.b);}}
  for(let i=0;i<A;i++)for(let j=0;j<Rn;j++){const p=i*(Rn+1)+j,q=p+Rn+1;idx.push(p,p+1,q,q,p+1,q+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  return new THREE.Mesh(g,std({vertexColors:true,roughness:.95,side:THREE.DoubleSide}));
}
function crenellatedWall(root,th,stone,dark,r){
  const start=Math.PI/2+GAP/2,len=Math.PI*2-GAP,segs=64,rng=T.rng(9);
  for(let i=0;i<segs;i++){if(th.ruined&&rng()<.18)continue;const a0=start+len*i/segs,a1=start+len*(i+1)/segs,am=(a0+a1)/2,chord=2*r*Math.sin((a1-a0)/2)+1;
    const w=new THREE.Mesh(new THREE.BoxGeometry(chord,34,22),stone);w.position.set(Math.cos(am)*r,19,Math.sin(am)*r);w.rotation.y=-am+Math.PI/2;root.add(w);
    for(const off of [-.3,.3]){const m=new THREE.Mesh(new THREE.BoxGeometry(chord*.28,6,23),dark);m.position.set(Math.cos(am)*r,39,Math.sin(am)*r);m.rotation.y=-am+Math.PI/2;m.translateX(off*chord);root.add(m);}
    if(th.ice&&i%2===0){const ic=new THREE.Mesh(new THREE.ConeGeometry(1.4,7,5),std({color:'#e8f6ff',emissive:'#9fdcff',emissiveIntensity:.4,roughness:.1}));ic.rotation.x=Math.PI;ic.position.set(Math.cos(am)*(r+11.6),28,Math.sin(am)*(r+11.6));root.add(ic);}
    if(th.lava&&i%4===0){for(const side of [-1,1]){const fl=new THREE.Mesh(new THREE.BoxGeometry(3.4,32,1),std({color:'#ff4a0a',emissive:'#ff3a00',emissiveIntensity:1.8}));fl.position.set(Math.cos(am)*(r+side*11.6),18,Math.sin(am)*(r+side*11.6));fl.rotation.y=-am+Math.PI/2;root.add(fl);}}
    if(th.banners&&i%6===0){const b=new THREE.Mesh(new THREE.PlaneGeometry(6,12),std({color:th.banners,side:THREE.DoubleSide}));b.position.set(Math.cos(am)*(r+11.6),24,Math.sin(am)*(r+11.6));b.rotation.y=-am+Math.PI/2;root.add(b);}}
  // Kapı kuleleri (açıklığın iki ucu)
  for(const a of [start,start+len]){const g=new THREE.Mesh(new THREE.BoxGeometry(36,52,36),stone);g.position.set(Math.cos(a)*r,26,Math.sin(a)*r);g.rotation.y=-a;root.add(g);
    const rf=new THREE.Mesh(new THREE.ConeGeometry(24,16,4),std({color:th.roof,roughness:.6}));rf.position.set(Math.cos(a)*r,60,Math.sin(a)*r);rf.rotation.y=Math.PI/4-a;root.add(rf);
    const fire=new THREE.Mesh(new THREE.SphereGeometry(3,10,8),std({color:'#ffcf6a',emissive:th.lava||th.crystal||th.storm||'#ffb040',emissiveIntensity:2.4}));fire.position.set(Math.cos(a)*(r+20),40,Math.sin(a)*(r+20));root.add(fire);}
}
function keep(root,th,stone,dark){
  // Katmanlı burç (üst üste binen çatılar)
  const tiers=[[104,26,92],[78,22,70],[54,18,50]];let y=12;
  tiers.forEach(([w,h,rw],i)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),i===0?stone:dark);b.position.y=y+h/2;root.add(b);
    const win=std({color:'#ffcf6a',emissive:th.lava||th.crystal||'#ffb040',emissiveIntensity:1.6});for(const [dx,dz,ry] of [[0,w/2+.1,0],[w/2+.1,0,Math.PI/2]])for(let k=-1;k<=1;k++){const p=new THREE.Mesh(new THREE.PlaneGeometry(4,6),win);p.position.set(dx+(dz?k*w*.25:0),y+h*.55,dz+(dx?k*w*.25:0));p.rotation.y=ry;root.add(p);}
    y+=h;const roof=new THREE.Mesh(new THREE.ConeGeometry(rw*.95,12,4),std({color:th.roof,roughness:.55,metalness:.2}));roof.rotation.y=Math.PI/4;roof.scale.y=.8;roof.position.y=y+4;root.add(roof);y+=6;});
  const spire=new THREE.Mesh(new THREE.ConeGeometry(4,22,8),std({color:th.crystal||th.storm||'#d4a64c',metalness:.6,roughness:.3,emissive:th.crystal||th.storm||'#000',emissiveIntensity:th.crystal||th.storm?1.4:0}));spire.position.y=y+16;root.add(spire);
}
export function buildFleetBase(themeId){
  const th=FLEET_THEMES[themeId],root=new THREE.Group(),n=T.noise2(themeId.length*97),r=T.rng(themeId.length*13);
  const stone=std({map:T.stoneTexture({seed:701,base:th.stone,dark:th.stoneDark,moss:th.moss})}),dark=std({map:T.stoneTexture({seed:702,base:th.stoneDark,dark:th.stoneDark,moss:th.moss})});
  // Lagün ve dış sığlık
  const lagoon=new THREE.Mesh(new THREE.CircleGeometry(RING_R-40,96),new THREE.MeshBasicMaterial({color:th.water[0],transparent:true,opacity:.08,depthWrite:false}));lagoon.rotation.x=-Math.PI/2;lagoon.position.y=.05;lagoon.userData.float=true;root.add(lagoon);
  const shore=new THREE.Mesh(new THREE.PlaneGeometry((RING_R+120)*2,(RING_R+120)*2),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:5,color:'225,245,240',strength:.2,inner:.42}),transparent:true,depthWrite:false}));shore.rotation.x=-Math.PI/2;shore.position.y=.04;shore.userData.float=true;root.add(shore);
  root.add(ringLand(th,n));
  crenellatedWall(root,th,stone,dark,RING_R);
  // Merkez ada
  const core=new THREE.Mesh(new THREE.CylinderGeometry(CORE_R*.82,CORE_R,12,48),std({color:th.land,roughness:.95}));core.position.y=4;root.add(core);
  const beach=new THREE.Mesh(new THREE.CylinderGeometry(CORE_R,CORE_R+10,3,48),std({color:th.sand,roughness:1}));beach.position.y=0;root.add(beach);
  const wallRing=new THREE.Mesh(new THREE.TorusGeometry(CORE_R*.8,4,6,64),stone);wallRing.rotation.x=Math.PI/2;wallRing.position.y=12;root.add(wallRing);
  keep(root,th,stone,dark);
  if(th.lava)for(let i=0;i<7;i++){const a=i/7*Math.PI*2,c=new THREE.Mesh(new THREE.BoxGeometry(2.2,.6,60),std({color:'#ff4a0a',emissive:'#ff3a00',emissiveIntensity:1.8}));c.position.set(Math.cos(a)*85,10.4,Math.sin(a)*85);c.rotation.y=-a;root.add(c);}
  // Küçük evler, ağaçlar, tema süsleri
  for(let i=0;i<10;i++){const a=r()*Math.PI*2,d=60+r()*50,h=new THREE.Mesh(new THREE.BoxGeometry(12,8,10),stone);h.position.set(Math.cos(a)*d,14,Math.sin(a)*d);h.rotation.y=r()*3;root.add(h);const rf=new THREE.Mesh(new THREE.ConeGeometry(9,6,4),std({color:th.roof}));rf.position.set(h.position.x,21,h.position.z);rf.rotation.y=h.rotation.y+Math.PI/4;root.add(rf);}
  const ringPoint=(k)=>{const a=Math.PI/2+GAP/2+(Math.PI*2-GAP)*r(),rr=RING_R+(r()-.5)*RING_W*.7;return[Math.cos(a)*rr,Math.sin(a)*rr];};
  if(th.trees)for(let i=0;i<60;i++){const [x,z]=ringPoint(i);if(Math.abs(Math.hypot(x,z)-RING_R)<12)continue;const t=new THREE.Mesh(new THREE.ConeGeometry(4,11,7),std({color:th.trees}));t.position.set(x,12,z);root.add(t);}
  if(th.coral)for(let i=0;i<50;i++){const a=r()*Math.PI*2,d=RING_R+50+r()*30,m=new THREE.Mesh(new THREE.IcosahedronGeometry(3+r()*4,1),std({color:['#ff8a7a','#ffb86a','#d97ad8'][i%3],roughness:.6}));m.scale.y=.5;m.position.set(Math.cos(a)*d,.5,Math.sin(a)*d);m.userData.float=true;root.add(m);}
  if(th.pools)for(let i=0;i<14;i++){const [x,z]=ringPoint(i),p=new THREE.Mesh(new THREE.CircleGeometry(5+r()*6,20),std({color:th.pools,emissive:th.pools,emissiveIntensity:1.2}));p.rotation.x=-Math.PI/2;p.position.set(x,13.5,z);root.add(p);}
  if(th.lava){for(let i=0;i<8;i++){const a0=Math.PI/2+GAP/2+(Math.PI*2-GAP)*(i+.3)/8,pts=[];for(let k=0;k<=6;k++){const a=a0+k*.05,rr=RING_R-30+k*9;pts.push(new THREE.Vector3(Math.cos(a)*rr,13-k*1.8,Math.sin(a)*rr));}root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,2.2,6),std({color:th.lava,emissive:th.lava,emissiveIntensity:2.4})));}}
  if(th.crystal)for(let i=0;i<30;i++){const [x,z]=ringPoint(i),c=new THREE.Mesh(new THREE.ConeGeometry(2+r()*3,10+r()*14,6),std({color:th.crystal,emissive:th.crystal,emissiveIntensity:1.3,roughness:.2,transparent:true,opacity:.9}));c.position.set(x,16,z);c.rotation.set((r()-.5)*.6,0,(r()-.5)*.6);root.add(c);}
  if(th.ice)for(let i=0;i<24;i++){const [x,z]=ringPoint(i),c=new THREE.Mesh(new THREE.ConeGeometry(3+r()*3,12+r()*10,6),std({color:'#dff4ff',emissive:'#9fdcff',emissiveIntensity:.3,roughness:.1,transparent:true,opacity:.9}));c.position.set(x,16,z);root.add(c);}
  if(th.storm)for(let i=0;i<6;i++){const a=i/6*Math.PI*2,rod=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,26,6),std({color:'#6a6e78',metalness:.8}));rod.position.set(Math.cos(a)*40,58,Math.sin(a)*40);root.add(rod);const orb=new THREE.Mesh(new THREE.SphereGeometry(2.4,10,8),std({color:'#dfe8ff',emissive:th.storm,emissiveIntensity:2.6}));orb.position.set(Math.cos(a)*40,72,Math.sin(a)*40);root.add(orb);}
  root.scale.z=1/Math.sin(FLEET_ELEVATION*Math.PI/180);root.userData.waterline=0;return root;
}

export function buildFleetTower(themeId,owner){
  const th=FLEET_THEMES[themeId],root=new THREE.Group(),stone=std({map:T.stoneTexture({seed:711,base:th.stone,dark:th.stoneDark,moss:th.moss})});
  const flagColor=owner==='player'?'#2fb8a8':'#a01f1c',mark=owner==='player'?'#f0c766':'#1a1010';
  const rock=new THREE.Mesh(new THREE.CylinderGeometry(15,18,6,16),std({color:th.land}));rock.position.y=1;root.add(rock);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(10,12,40,20),stone);body.position.y=22;root.add(body);
  const top=new THREE.Mesh(new THREE.CylinderGeometry(13,11,5,20),stone);top.position.y=44;root.add(top);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(4,5,4),stone);m.position.set(Math.cos(a)*11,49,Math.sin(a)*11);m.rotation.y=-a;root.add(m);}
  const gun=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.2,12,10),std({color:'#1b1c1e',metalness:.7,roughness:.4}));gun.rotation.x=Math.PI/2;gun.position.set(0,46,12);root.add(gun);
  const win=std({color:'#ffcf6a',emissive:th.lava||th.crystal||'#ffb040',emissiveIntensity:1.6});for(const y of [18,30]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3,5),win);p.position.set(0,y,11.3);root.add(p);}
  if(th.lava){for(let k=0;k<5;k++){const a=k/5*Math.PI*2+.3,f=new THREE.Mesh(new THREE.BoxGeometry(2.6,36,1.2),std({color:'#ff4a0a',emissive:'#ff3a00',emissiveIntensity:1.8}));f.position.set(Math.sin(a)*11.2,24,Math.cos(a)*11.2);f.rotation.y=a;root.add(f);}
    const brazier=new THREE.Mesh(new THREE.SphereGeometry(6,14,10),std({color:'#ff9a3a',emissive:'#ff5a10',emissiveIntensity:1.6}));brazier.scale.y=.7;brazier.position.y=50;root.add(brazier);
    }
  else if(th.ice){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(8,0),std({color:'#dff4ff',emissive:'#7fd0ff',emissiveIntensity:.9,transparent:true,opacity:.9,roughness:.05}));cr.scale.y=1.8;cr.position.y=62;root.add(cr);}
  else if(th.crystal){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(7,0),std({color:th.crystal,emissive:th.crystal,emissiveIntensity:2}));cr.scale.y=1.8;cr.position.y=64;root.add(cr);}
  else if(th.storm){const rod=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,20,6),std({color:'#8a8e98',metalness:.8}));rod.position.y=58;root.add(rod);const orb=new THREE.Mesh(new THREE.SphereGeometry(3.4,12,10),std({color:'#e8f0ff',emissive:th.storm,emissiveIntensity:3}));orb.position.y=69;root.add(orb);}
  else if(th.pools){const c=new THREE.Mesh(new THREE.CylinderGeometry(7,5,6,14),std({color:'#2a2a1e',metalness:.5}));c.position.y=50;root.add(c);const g=new THREE.Mesh(new THREE.CircleGeometry(6.4,16),std({color:th.pools,emissive:th.pools,emissiveIntensity:2.4}));g.rotation.x=-Math.PI/2;g.position.y=53.2;root.add(g);}
  else{const rf=new THREE.Mesh(new THREE.ConeGeometry(14,16,20),std({color:th.roof,roughness:.6}));rf.position.y=56;root.add(rf);}
  if(th.coral)for(let k=0;k<7;k++){const a=k/7*Math.PI*2,m=new THREE.Mesh(new THREE.IcosahedronGeometry(3,1),std({color:['#ff8a7a','#ffb86a','#d97ad8'][k%3]}));m.position.set(Math.cos(a)*14,4,Math.sin(a)*14);root.add(m);}
  // Sancak
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,20,6),std({color:'#3a2a1a'}));pole.position.set(-9,60,-4);root.add(pole);
  const fm=std({map:T.flagTexture({seed:owner==='player'?19:18,base:flagColor,mark:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W*.36,H/2,11,0,7);x.fill();},markColor:mark}),side:THREE.DoubleSide});
  const fgeo=new THREE.PlaneGeometry(14,8,10,2),fp=fgeo.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i)+7;fp.setX(i,x);fp.setZ(i,Math.sin(x/14*Math.PI*2)*1.4*x/14);}fgeo.computeVertexNormals();
  const flag=new THREE.Mesh(fgeo,fm);flag.position.set(-9,67,-4);flag.rotation.y=.5;root.add(flag);
  root.userData.waterline=0;return root;
}

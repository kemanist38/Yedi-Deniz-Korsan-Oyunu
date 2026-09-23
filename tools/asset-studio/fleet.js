// Kara Yelken — filo adaları: düzensiz kumsallı, ormanlık yuvarlak ada; koyu mazgallı sur halkası,
// güneyden denize açılan kanal ve iskeleli turkuaz lagün, ortada piramit ahşap çatılı taş burç.
// Birimler oyun dünyası birimidir (x sağ, +Z = oyunda y aşağı). Saldırılabilir kuleler ayrı sprite'tır
// (buildFleetTower); sur üzerindeki burç kaideleri FLEET_TOWERS konumlarıyla aynıdır.
// Geometri src/campaign.ts içindeki FLEET ile birebir aynı tutulmalıdır.
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.85,metalness:0,...o});
export const FLEET_ELEVATION=50;
export const ISLAND_R=440,WALL_R=340,GAP=.56,LAGOON={x:0,y:95,r:150},CHANNEL_W=60,KEEP={x:0,y:-165};
// Surda 8 kule: açıklığın iki yanında kapı kuleleri ve halka boyunca eşit aralıklı 6 kule.
export const FLEET_TOWERS=Array.from({length:8},(_,k)=>{const a=Math.PI/2+GAP/2+(Math.PI*2-GAP)*k/7;return[Math.round(Math.cos(a)*WALL_R),Math.round(Math.sin(a)*WALL_R)];});

export const FLEET_THEMES={
  verdant:{stone:'#5d5f5e',stoneDark:'#34373a',moss:'#44573a',land:'#3f6f30',land2:'#5f8f3a',sand:'#dcc58c',roof:'#6a4128',cone:'#3a3c42',water:['#6fe0cc','#1f7f86'],trees:'palm',canopy:['#2f5e26','#46782f','#3a6a2a']},
  coral:{stone:'#7a6a64',stoneDark:'#4a3e3a',moss:'#b0706a',land:'#5a8f40',land2:'#86b252',sand:'#f2ddb0',roof:'#7a4a2a',cone:'#2f6f70',water:['#8ff4de','#2a8f90'],trees:'palm',canopy:['#3f7a2f','#5a9a3a','#4f8a36'],coral:true},
  misty:{stone:'#595e5c',stoneDark:'#303436',moss:'#56705a',land:'#3a5646',land2:'#50685a',sand:'#aaa590',roof:'#4a3a2e',cone:'#2e3a3a',water:['#7ec4c0','#1d5a63'],trees:'pine',canopy:['#2a4232','#35503c','#2f4838'],ruined:true},
  crimson:{stone:'#6a3e34',stoneDark:'#3a1e18',moss:'#7a5a36',land:'#6f5a30',land2:'#8a7038',sand:'#d0a878',roof:'#4a2418',cone:'#6e1a16',water:['#e0a080','#5b2a2a'],trees:'palm',canopy:['#5a5a26','#6e6a2e','#4e4a22'],banners:'#a01f1c'},
  ice:{stone:'#8aa0b0',stoneDark:'#51667a',moss:'#e8f4ff',land:'#e4eef4',land2:'#c8d8e4',sand:'#dde8ee',roof:'#5a6a7a',cone:'#3a6a98',water:['#a8e4f6','#2a5a78'],trees:'pine',canopy:['#e8f2f8','#d0e2ee','#f4faff'],ice:true},
  toxic:{stone:'#44463a',stoneDark:'#24261c',moss:'#8adf5a',land:'#3a4a1e',land2:'#56662a',sand:'#7a7a48',roof:'#3a3a1e',cone:'#2a3a12',water:['#9ae66a','#1f3a1a'],trees:'dead',canopy:['#3a5a1a','#4a6a22','#5a7a26'],pools:'#8aff4a'},
  lava:{stone:'#2e2624',stoneDark:'#161010',moss:'#3a2a22',land:'#2a1e1a',land2:'#3a2a22',sand:'#4a342a',roof:'#2a1410',cone:'#1a0a06',water:['#e0703a','#3a1208'],trees:'dead',canopy:null,lava:'#ff5a10'},
  storm:{stone:'#3e434e',stoneDark:'#22252c',moss:'#2e3530',land:'#2e3a32',land2:'#3d4a40',sand:'#76726c',roof:'#2a2a30',cone:'#1a2030',water:['#7f96b8','#1c2740'],trees:'pine',canopy:['#26382c','#2f4436','#223228'],storm:'#9ab8ff'},
  abyss:{stone:'#342a46',stoneDark:'#18122a',moss:'#4a2a78',land:'#241c34',land2:'#302644',sand:'#3e3450',roof:'#1e1430',cone:'#0e0818',water:['#a47aff','#1a0e30'],trees:null,canopy:null,crystal:'#b070ff'},
};

// Kara/su alanları (oyun koordinatı, merkeze göre). w>0 → lagün veya kanal içi.
function waterInside(x,y,n){
  const lr=LAGOON.r+n(x*.02+7,y*.02+3,2)*22,dl=lr-Math.hypot(x-LAGOON.x,y-LAGOON.y);
  const dc=y>LAGOON.y?CHANNEL_W+n(y*.03+11,1,2)*6-Math.abs(x):-999;
  return Math.max(dl,dc);
}
const coastR=(a,n)=>ISLAND_R-14+n(Math.cos(a)*1.6+3,Math.sin(a)*1.6+3,4)*52+n(Math.cos(a)*6+9,Math.sin(a)*6+9,2)*12;

function terrain(th,n){
  const S=200,size=ISLAND_R*2+80,geo=new THREE.PlaneGeometry(size,size,S,S);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,col=[],c=new THREE.Color(),sand=new THREE.Color(th.sand),land=new THREE.Color(th.land),land2=new THREE.Color(th.land2),wet=new THREE.Color(th.sand).multiplyScalar(.78);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getZ(i),d=Math.hypot(x,y),a=Math.atan2(y,x);
    const out=coastR(a,n)-d,inW=waterInside(x,y,n),edge=Math.min(out,-inW);
    let h=edge<0?edge*.4:Math.min(16,edge*.34)+(edge>40?n(x*.03,y*.03,3)*5:0);
    p.setY(i,h);
    const beach=out<-inW?26+n(a*3,1,3)*16:10;
    if(h<1)c.copy(wet);else if(edge<beach)c.copy(sand).lerp(land,Math.max(0,(edge-beach+6)/6));else c.copy(land).lerp(land2,(n(x*.05+9,y*.05,3)+1)/2);
    col.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  return new THREE.Mesh(geo,std({vertexColors:true,roughness:.97}));
}
function groundAt(x,y,n){const d=Math.hypot(x,y),edge=Math.min(coastR(Math.atan2(y,x),n)-d,-waterInside(x,y,n));return edge<0?edge*.4:Math.min(16,edge*.34)+(edge>40?n(x*.03,y*.03,3)*5:0);}

function wall(root,th,stone,dark){
  const start=Math.PI/2+GAP/2,len=Math.PI*2-GAP,segs=96,rng=T.rng(9),H=30,Wd=18;
  for(let i=0;i<segs;i++){if(th.ruined&&rng()<.12)continue;
    const a0=start+len*i/segs,a1=start+len*(i+1)/segs,am=(a0+a1)/2,chord=2*WALL_R*Math.sin((a1-a0)/2)+.8,cx=Math.cos(am)*WALL_R,cz=Math.sin(am)*WALL_R;
    const w=new THREE.Mesh(new THREE.BoxGeometry(chord,H,Wd),stone);w.position.set(cx,8+H/2,cz);w.rotation.y=-am+Math.PI/2;root.add(w);
    const walk=new THREE.Mesh(new THREE.BoxGeometry(chord,1.2,Wd-6),dark);walk.position.set(cx,8+H+.3,cz);walk.rotation.y=w.rotation.y;root.add(walk);
    for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(chord*.5,6,3.4),dark);m.position.set(cx,8+H+3,cz);m.rotation.y=w.rotation.y;m.translateZ(side*(Wd/2-1.7));m.translateX((i%2?.22:-.22)*chord);root.add(m);}
    if(th.ice&&i%2===0){const ic=new THREE.Mesh(new THREE.ConeGeometry(1.6,8,5),std({color:'#e8f6ff',emissive:'#9fdcff',emissiveIntensity:.4,roughness:.1}));ic.rotation.x=Math.PI;ic.position.set(Math.cos(am)*(WALL_R+Wd/2+1),8+H-4,Math.sin(am)*(WALL_R+Wd/2+1));root.add(ic);}
    if(th.lava&&i%5===0){const fl=new THREE.Mesh(new THREE.BoxGeometry(3.4,H-2,1),std({color:'#ff4a0a',emissive:'#ff3a00',emissiveIntensity:1.8}));fl.position.set(Math.cos(am)*(WALL_R+Wd/2+.6),8+H/2,Math.sin(am)*(WALL_R+Wd/2+.6));fl.rotation.y=w.rotation.y;root.add(fl);}
    if(th.banners&&i%8===4){const b=new THREE.Mesh(new THREE.PlaneGeometry(7,14),std({color:th.banners,side:THREE.DoubleSide}));b.position.set(Math.cos(am)*(WALL_R+Wd/2+.6),8+H-9,Math.sin(am)*(WALL_R+Wd/2+.6));b.rotation.y=w.rotation.y;root.add(b);}
  }
  // Kule kaideleri (kuleler sprite olarak bunların üstüne çizilir)
  for(const [x,z] of FLEET_TOWERS){const b=new THREE.Mesh(new THREE.CylinderGeometry(22,25,8+H*.55,8),stone);b.position.set(x,(8+H*.55)/2,z);b.rotation.y=Math.PI/8;root.add(b);}
}

function keep(root,th,stone,dark,wood){
  const g=new THREE.Group();g.position.set(KEEP.x,0,KEEP.y);root.add(g);
  // Avlu duvarı, taş gövde, ahşap piramit çatı
  const yard=new THREE.Mesh(new THREE.BoxGeometry(150,10,130),dark);yard.position.y=17;g.add(yard);
  const base=new THREE.Mesh(new THREE.BoxGeometry(104,34,96),stone);base.position.y=35;g.add(base);
  const upper=new THREE.Mesh(new THREE.BoxGeometry(78,22,72),stone);upper.position.y=63;g.add(upper);
  for(const [w,d,y] of [[104,96,52],[78,72,74]])for(let k=0;k<4;k++){const side=k<2?w:d,cnt=Math.round(side/14);for(let j=0;j<cnt;j++){const t=(j+.5)/cnt-.5,m=new THREE.Mesh(new THREE.BoxGeometry(6,5,6),dark);
    if(k===0)m.position.set(t*w,y+2.5,d/2-3);else if(k===1)m.position.set(t*w,y+2.5,-d/2+3);else if(k===2)m.position.set(w/2-3,y+2.5,t*d);else m.position.set(-w/2+3,y+2.5,t*d);if(j%2===0)g.add(m);}}
  const roof=new THREE.Mesh(new THREE.ConeGeometry(56,58,4),wood);roof.rotation.y=Math.PI/4;roof.scale.z=.93;roof.position.y=103;g.add(roof);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(6,10,4),std({color:th.crystal||th.storm||'#c89a45',metalness:.6,roughness:.3,emissive:th.crystal||th.storm||'#000',emissiveIntensity:th.crystal||th.storm?1.6:0}));cap.rotation.y=Math.PI/4;cap.position.y=136;g.add(cap);
  const win=std({color:'#ffcf6a',emissive:th.lava||th.crystal||'#ffb040',emissiveIntensity:1.5});
  for(let j=-1;j<=1;j++){for(const y of [40,64]){const p=new THREE.Mesh(new THREE.PlaneGeometry(5,8),win);p.position.set(j*(y>50?22:30),y,(y>50?36:48)+.2);g.add(p);}}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(14,18),std({color:'#1a120c'}));door.position.set(0,27,48.2);g.add(door);
  // Burçtan lagüne inen taş yol
  const path=new THREE.Mesh(new THREE.BoxGeometry(20,1,60),std({color:th.sand,roughness:1}));path.position.set(0,17,78);g.add(path);
}

function hut(th,dark,roof){
  const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(16,10,13),dark);b.position.y=5;g.add(b);
  const r=new THREE.Mesh(new THREE.ConeGeometry(13,9,4),roof);r.rotation.y=Math.PI/4;r.scale.z=.85;r.position.y=14.5;g.add(r);return g;
}
function palm(trunk,leaf,r,h){
  const g=new THREE.Group(),bend=(r()*2-1)*.4,pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push(new THREE.Vector3(Math.sin(bend)*t*t*h*.4,t*h,Math.cos(bend)*t*t*h*.1));}
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),6,1,5),trunk));
  const top=pts[5];for(let k=0;k<7;k++){const a=k/7*Math.PI*2+r(),fr=new THREE.Mesh(new THREE.ConeGeometry(2.6,15,4),leaf);fr.scale.set(1,1,.25);fr.position.set(top.x+Math.cos(a)*6,top.y-1.4,top.z+Math.sin(a)*6);fr.rotation.set(Math.sin(a)*1.25,0,-Math.cos(a)*1.25);g.add(fr);}
  return g;
}
function pine(trunk,leaf,h){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.2,h*.4,6),trunk);t.position.y=h*.2;g.add(t);for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(7-k*1.8,h*.45,7),leaf);c.position.y=h*(.42+k*.2);g.add(c);}return g;}
function deadTree(trunk,r,h){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.4,h,5),trunk);t.position.y=h/2;t.rotation.z=(r()-.5)*.3;g.add(t);for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.6,h*.45,4),trunk);b.position.set((r()-.5)*3,h*(.55+k*.13),(r()-.5)*3);b.rotation.set((r()-.5)*1.8,0,(r()-.5)*1.8);g.add(b);}return g;}

export function buildFleetBase(themeId){
  const th=FLEET_THEMES[themeId],root=new THREE.Group(),n=T.noise2(17+themeId.length*97),r=T.rng(31+themeId.length*13);
  const stone=std({map:T.stoneTexture({seed:701,base:th.stone,dark:th.stoneDark,moss:th.moss})}),dark=std({map:T.stoneTexture({seed:702,base:th.stoneDark,dark:th.stoneDark,moss:th.moss})});
  const wood=std({map:T.chestWoodTexture({seed:703,wood:th.roof,dark:'#1e120a'}),roughness:.8}),plank=std({map:T.chestWoodTexture({seed:704,wood:'#7a5634',dark:'#3a2414'})});
  // Kıyı köpüğü ve lagün suyu (deniz rengi altından görünür)
  const shore=new THREE.Mesh(new THREE.PlaneGeometry((ISLAND_R+70)*2,(ISLAND_R+70)*2),new THREE.MeshBasicMaterial({map:T.foamTexture({seed:5,color:'230,248,240',strength:.55,inner:.4}),transparent:true,depthWrite:false}));shore.rotation.x=-Math.PI/2;shore.position.y=.04;shore.userData.float=true;root.add(shore);
  const shallow=new THREE.Mesh(new THREE.CircleGeometry(ISLAND_R+46,96),new THREE.MeshBasicMaterial({color:th.lava?'#5a2a14':th.water[0],transparent:true,opacity:th.lava?.3:.2,depthWrite:false}));shallow.rotation.x=-Math.PI/2;shallow.position.y=.03;root.add(shallow);
  const lagoonMat=new THREE.MeshBasicMaterial({map:T.shallowTexture({seed:12,inner:th.water[0],outer:th.water[1],alpha:.75}),transparent:true,depthWrite:false});
  const lagoon=new THREE.Mesh(new THREE.CircleGeometry(LAGOON.r+26,72),lagoonMat);lagoon.rotation.x=-Math.PI/2;lagoon.position.set(LAGOON.x,.3,LAGOON.y);root.add(lagoon);
  const c0=LAGOON.y+LAGOON.r-4,c1=ISLAND_R+20,[fc,fx]=T.canvas(8,128),fg=fx.createLinearGradient(0,0,0,128);fg.addColorStop(0,th.water[0]);fg.addColorStop(.62,th.water[0]);fg.addColorStop(1,th.water[0]+'00');fx.fillStyle=fg;fx.fillRect(0,0,8,128);
  const chan=new THREE.Mesh(new THREE.PlaneGeometry(CHANNEL_W*2+14,c1-c0),new THREE.MeshBasicMaterial({map:T.toTexture(fc),transparent:true,opacity:.42,depthWrite:false}));chan.rotation.x=-Math.PI/2;chan.position.set(0,.25,(c0+c1)/2);root.add(chan);
  root.add(terrain(th,n));
  wall(root,th,stone,dark);
  keep(root,th,stone,dark,wood);
  // İskeleler: lagünün batı kıyısından ve kanal ağzından
  const pier=(x,z,len,rot)=>{const g=new THREE.Group();const deck=new THREE.Mesh(new THREE.BoxGeometry(len,1.6,12),plank);deck.position.set(len/2,4,0);g.add(deck);
    for(let k=0;k<=len;k+=14)for(const s of [-5,5]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,7,6),plank);post.position.set(k,1.5,s);g.add(post);}
    g.position.set(x,0,z);g.rotation.y=rot;root.add(g);};
  pier(-LAGOON.r+8,LAGOON.y+10,70,0);pier(CHANNEL_W+4,ISLAND_R-40,54,-.15);
  const boat=new THREE.Mesh(new THREE.BoxGeometry(22,4,8),plank);boat.position.set(-LAGOON.r+60,1.8,LAGOON.y+26);boat.rotation.y=.1;root.add(boat);
  // Kumsal kulübeleri (surun dışında)
  const hutRoof=std({color:th.cone,roughness:.7}),hutWall=std({map:T.chestWoodTexture({seed:705,wood:'#4a3222',dark:'#20140c'})});
  for(let i=0;i<11;i++){const a=Math.PI/2+.5+(Math.PI*2-1)*(i+.5)/11+(r()-.5)*.12,d=WALL_R+40+r()*26,x=Math.cos(a)*d,z=Math.sin(a)*d;const h=hut(th,hutWall,hutRoof);h.position.set(x,Math.max(0,groundAt(x,z,n))-.5,z);h.rotation.y=-a+(r()-.5)*.6;root.add(h);}
  // Orman: sur içi yoğun taç, kıyı şeridinde palmiye / çam
  const trunk=std({color:'#5a3f28'}),leafs=(th.canopy||['#3a5a2a']).map(c=>std({color:c,roughness:.9}));
  const clearOf=(x,z)=>Math.hypot(x-KEEP.x,z-KEEP.y)>92&&Math.abs(Math.hypot(x,z)-WALL_R)>18&&waterInside(x,z,n)<-10&&!FLEET_TOWERS.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<34);
  if(th.canopy&&th.trees!=='dead'){const blob=new THREE.IcosahedronGeometry(1,1);
    for(let i=0;i<900;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(WALL_R-14),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const gy=groundAt(x,z,n);if(gy<6)continue;
      if(th.trees==='pine'&&r()<.6){const t=pine(trunk,leafs[i%leafs.length],18+r()*10);t.position.set(x,gy-.5,z);root.add(t);continue;}
      const s=8+r()*7,m=new THREE.Mesh(blob,leafs[i%leafs.length]);m.scale.set(s,s*.7,s);m.position.set(x,gy+s*.5,z);root.add(m);}}
  for(let i=0;i<150;i++){const a=r()*Math.PI*2,d=WALL_R+24+r()*(ISLAND_R-WALL_R-40),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const gy=groundAt(x,z,n);if(gy<3.5)continue;
    const kind=th.trees,s=.8+r()*.5,t=kind==='palm'?palm(trunk,leafs[i%leafs.length],r,20*s):kind==='pine'?pine(trunk,leafs[i%leafs.length],22*s):kind==='dead'?deadTree(std({color:'#3a2e24'}),r,14*s):null;
    if(t){t.position.set(x,gy-.5,z);t.rotation.y=r()*6;root.add(t);}}
  // Tema süsleri
  if(th.trees==='dead'&&th.canopy)for(let i=0;i<260;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(WALL_R-14),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const gy=groundAt(x,z,n);if(gy<6)continue;const t=deadTree(std({color:'#3a3a24'}),r,14+r()*8);t.position.set(x,gy-.5,z);root.add(t);}
  if(th.coral)for(let i=0;i<70;i++){const a=r()*Math.PI*2,d=ISLAND_R+14+r()*40,m=new THREE.Mesh(new THREE.IcosahedronGeometry(4+r()*5,1),std({color:['#ff8a7a','#ffb86a','#d97ad8'][i%3],roughness:.6}));m.scale.y=.5;m.position.set(Math.cos(a)*d,.6,Math.sin(a)*d);m.userData.float=true;root.add(m);}
  if(th.pools)for(let i=0;i<30;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(WALL_R-20),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const p=new THREE.Mesh(new THREE.CircleGeometry(7+r()*9,20),std({color:th.pools,emissive:th.pools,emissiveIntensity:1.2}));p.rotation.x=-Math.PI/2;p.position.set(x,groundAt(x,z,n)+.4,z);root.add(p);}
  if(th.lava){for(let i=0;i<6;i++){const a0=r()*Math.PI*2,pts=[];for(let k=0;k<=8;k++){const a=a0+k*.08+Math.sin(k)*.03,rr=WALL_R-24-k*22;if(waterInside(Math.cos(a)*rr,Math.sin(a)*rr,n)>-16)break;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;pts.push(new THREE.Vector3(x,groundAt(x,z,n)+.6,z));}if(pts.length>2)root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,4.5,6),std({color:th.lava,emissive:th.lava,emissiveIntensity:2.4})));}
    for(let i=0;i<120;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(ISLAND_R-30),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const gy=groundAt(x,z,n);if(gy<3)continue;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(5+r()*8,0),std({color:'#1a1412',roughness:1}));m.scale.y=.6+r()*.6;m.position.set(x,gy+2,z);m.rotation.set(r()*3,r()*3,0);root.add(m);}}
  if(th.crystal)for(let i=0;i<200;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(ISLAND_R-30),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!clearOf(x,z))continue;const gy=groundAt(x,z,n);if(gy<4)continue;const c=new THREE.Mesh(new THREE.ConeGeometry(3+r()*4,14+r()*20,6),std({color:i%3?'#3a2a58':th.crystal,emissive:th.crystal,emissiveIntensity:i%3?.3:1.3,roughness:.2}));c.position.set(x,gy+6,z);c.rotation.set((r()-.5)*.6,0,(r()-.5)*.6);root.add(c);}
  if(th.storm)for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,x=KEEP.x+Math.cos(a)*62,z=KEEP.y+Math.sin(a)*56,rod=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,40,6),std({color:'#6a6e78',metalness:.8}));rod.position.set(x,38,z);root.add(rod);const orb=new THREE.Mesh(new THREE.SphereGeometry(3.4,10,8),std({color:'#dfe8ff',emissive:th.storm,emissiveIntensity:2.6}));orb.position.set(x,60,z);root.add(orb);}
  root.scale.z=1/Math.sin(FLEET_ELEVATION*Math.PI/180);root.userData.waterline=0;return root;
}

// Kule: koyu sekizgen taş gövde, mazgallı taç, konik çatı, sahip sancağı ve tema süsü.
export function buildFleetTower(themeId,owner){
  const th=FLEET_THEMES[themeId],root=new THREE.Group(),stone=std({map:T.stoneTexture({seed:711,base:th.stoneDark,dark:th.stoneDark,moss:th.moss})}),trim=std({map:T.stoneTexture({seed:712,base:th.stone,dark:th.stoneDark,moss:th.moss})});
  const flagColor=owner==='player'?'#2fb8a8':'#a01f1c',mark=owner==='player'?'#f0c766':'#1a1010';
  const body=new THREE.Mesh(new THREE.CylinderGeometry(11,13.5,34,8),stone);body.position.y=17;body.rotation.y=Math.PI/8;root.add(body);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(13.8,13.8,2.4,8),trim);band.position.y=12;band.rotation.y=Math.PI/8;root.add(band);
  const top=new THREE.Mesh(new THREE.CylinderGeometry(14,11,4,8),trim);top.position.y=36;top.rotation.y=Math.PI/8;root.add(top);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(4.4,4,3),trim);m.position.set(Math.cos(a)*12.6,40,Math.sin(a)*12.6);m.rotation.y=-a+Math.PI/2;root.add(m);}
  const cone=new THREE.Mesh(new THREE.ConeGeometry(12.5,22,16),std({color:th.cone,roughness:.55,metalness:.15}));cone.position.y=49;root.add(cone);
  const gun=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2,10,10),std({color:'#1b1c1e',metalness:.7,roughness:.4}));gun.rotation.x=Math.PI/2;gun.position.set(0,28,13);root.add(gun);
  const win=std({color:'#ffcf6a',emissive:th.lava||th.crystal||'#ffb040',emissiveIntensity:1.6});for(const [y,x] of [[20,-5],[20,5]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.5),win);p.position.set(x,y,12.9);root.add(p);}
  if(th.lava){for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4,f=new THREE.Mesh(new THREE.BoxGeometry(2.4,30,1),std({color:'#ff4a0a',emissive:'#ff3a00',emissiveIntensity:1.8}));f.position.set(Math.sin(a)*12,17,Math.cos(a)*12);f.rotation.y=a;root.add(f);}}
  const tipY=60;
  if(th.ice){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(4,0),std({color:'#dff4ff',emissive:'#7fd0ff',emissiveIntensity:.9,transparent:true,opacity:.9,roughness:.05}));cr.scale.y=1.8;cr.position.y=tipY+3;root.add(cr);}
  else if(th.crystal){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(4,0),std({color:th.crystal,emissive:th.crystal,emissiveIntensity:2}));cr.scale.y=1.8;cr.position.y=tipY+3;root.add(cr);}
  else if(th.storm){const orb=new THREE.Mesh(new THREE.SphereGeometry(2.6,12,10),std({color:'#e8f0ff',emissive:th.storm,emissiveIntensity:3}));orb.position.y=tipY+1;root.add(orb);}
  else if(th.pools||th.lava){const orb=new THREE.Mesh(new THREE.SphereGeometry(2.6,12,10),std({color:th.pools||'#ff9a3a',emissive:th.pools||'#ff5a10',emissiveIntensity:2.2}));orb.position.y=tipY+1;root.add(orb);}
  else{const k=new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),std({color:'#c89a45',metalness:.7,roughness:.3}));k.position.y=tipY;root.add(k);}
  if(th.coral)for(let k=0;k<7;k++){const a=k/7*Math.PI*2,m=new THREE.Mesh(new THREE.IcosahedronGeometry(3,1),std({color:['#ff8a7a','#ffb86a','#d97ad8'][k%3]}));m.position.set(Math.cos(a)*15,3,Math.sin(a)*15);root.add(m);}
  // Sancak (çatı tepesinden)
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,16,6),std({color:'#3a2a1a'}));pole.position.set(0,tipY+6,0);root.add(pole);
  const fm=std({map:T.flagTexture({seed:owner==='player'?19:18,base:flagColor,mark:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W*.36,H/2,11,0,7);x.fill();},markColor:mark}),side:THREE.DoubleSide});
  const fgeo=new THREE.PlaneGeometry(14,8,10,2),fp=fgeo.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i)+7;fp.setX(i,x);fp.setZ(i,Math.sin(x/14*Math.PI*2)*1.4*x/14);}fgeo.computeVertexNormals();
  const flag=new THREE.Mesh(fgeo,fm);flag.position.set(0,tipY+10,0);flag.rotation.y=.5;root.add(flag);
  root.userData.waterline=0;return root;
}

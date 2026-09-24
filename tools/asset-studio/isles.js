// Kara Yelken — deniz adacıkları (Seafight üslubu): kireç taşı kayalık tepeler, yeşil yamaçlar, kırmızı çatılı köyler,
// beyaz duvarlı limanlar, kanca biçimli koylar ve tek kaya sivrileri. 7 biçim × 8 deniz teması.
// Birimler oyun dünyası birimidir; model merkezi = ada merkezi (çarpışma dairesinin merkezi). Kamera 55°.
import * as THREE from 'three';
import * as T from './textures.js';

export const ISLE_ELEVATION=55;
const std=(o)=>new THREE.MeshStandardMaterial({roughness:.9,metalness:0,...o});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

// ---------------------------------------------------------------- biçimler
// land: c=[x,z,r] daire, cap=[x1,z1,x2,z2,r] kapsül, arc=[cx,cz,R,a0,a1,w] yay şerit; hole: [x,z,r] koy
// peaks: [x,z,yükseklik,yarıçap]; villages: [x,z,yarıçap,ev]; walls: liman duvarı çoklu çizgisi; piers: [x1,z1,x2,z2]
export const SHAPES=[
  {id:'hook',name:'Kanca Koy',r:190,span:520,
    land:[{arc:[0,0,135,Math.PI*.95,Math.PI*2.45,62]},{c:[-130,40,88]}],hole:[[18,6,70]],
    peaks:[[-138,30,105,105],[40,-120,40,70]],villages:[[60,-105,70,9],[118,20,50,5]],piers:[[30,40,62,72]],light:null},
  {id:'town',name:'Liman Kasabası',r:260,span:700,
    land:[{c:[-10,-50,190]},{cap:[-200,30,150,40,92]},{cap:[150,40,230,150,24]},{cap:[230,150,90,225,16]}],hole:[],
    peaks:[[-50,-110,150,165],[80,-80,95,115],[-170,0,60,90]],villages:[[0,40,170,26],[150,-20,70,6]],
    walls:[[-130,95],[-130,175],[110,175],[110,135]],piers:[[-40,100,-40,160],[40,100,40,150]],light:[225,150]},
  {id:'twin',name:'İkiz Tepe Limanı',r:215,span:600,
    land:[{c:[-70,-30,140]},{c:[90,-25,125]},{cap:[-165,40,175,45,68]}],hole:[],
    peaks:[[-70,-60,120,115],[85,-55,105,105]],villages:[[0,60,150,18]],walls:[[-105,95],[-105,160],[120,160],[120,110]],piers:[[10,100,10,150]],light:null},
  {id:'ring',name:'Atol',r:115,span:340,
    land:[{arc:[0,0,78,Math.PI*.2,Math.PI*1.85,42]}],hole:[[0,0,40]],peaks:[[-60,-35,55,48]],villages:[[40,-50,40,5]],piers:[],light:null},
  {id:'spire',name:'Kaya Sivrisi',r:80,span:300,
    land:[{c:[0,0,62]}],hole:[],peaks:[[0,0,165,64]],villages:[],piers:[],light:null,spiral:true},
  {id:'curl',name:'Kıvrık Kaya',r:100,span:320,
    land:[{arc:[0,0,62,Math.PI*.7,Math.PI*2.1,46]}],hole:[],peaks:[[-45,-30,85,60],[40,-40,55,50]],villages:[],piers:[],light:null,spiral:true},
  {id:'hill',name:'Fener Tepesi',r:140,span:400,
    land:[{c:[0,0,108]},{cap:[60,40,130,90,34]}],hole:[],peaks:[[-15,-25,72,100]],villages:[[0,10,80,7]],piers:[],light:[128,92]},
];

// ---------------------------------------------------------------- temalar (deniz başına)
export const ISLE_THEMES={
  haven:{rock:'#c4beb2',rockDark:'#7a756a',grass:'#4f7f2f',grass2:'#7aa33f',sand:'#e3d3a0',roof:'#b8442c',wall:'#efe6d2',shallow:'#5fd0c4',trees:'broad',snow:0},
  pearl:{rock:'#d2ccbe',rockDark:'#857f72',grass:'#3f8f3f',grass2:'#78b84a',sand:'#f4ecd2',roof:'#2f8f96',wall:'#fbf6ea',shallow:'#6ff0dc',trees:'palm',snow:0},
  azure:{rock:'#c8c6be',rockDark:'#77787c',grass:'#4d7f3c',grass2:'#6f9f4a',sand:'#e0d6b0',roof:'#2d5fb0',wall:'#f2eee4',shallow:'#58b8e8',trees:'broad',snow:0,domes:true,ruins:true},
  ghost:{rock:'#7d8580',rockDark:'#3a403c',grass:'#4b5a3e',grass2:'#65705a',sand:'#a8a28a',roof:'#3a3a40',wall:'#8e8c84',shallow:'#6aa8a0',trees:'dead',snow:0,ruined:true},
  frost:{rock:'#9fb2c2',rockDark:'#56697c',grass:'#e8f2f8',grass2:'#cfe0ec',sand:'#d8e6ee',roof:'#2f4a70',wall:'#e8eef2',shallow:'#9ee4f6',trees:'pine',snow:1},
  storm:{rock:'#6c7280',rockDark:'#30343c',grass:'#35502f',grass2:'#4d6440',sand:'#9a9688',roof:'#3a4052',wall:'#b8bcc2',shallow:'#5f8aa8',trees:'pine',snow:0,rods:true},
  abyss:{rock:'#4a4058',rockDark:'#1c1624',grass:'#3a2c52',grass2:'#523c6e',sand:'#5a5068',roof:'#241a34',wall:'#6a6278',shallow:'#7a5ac8',trees:'crystal',snow:0,glow:'#b070ff'},
  flame:{rock:'#3c302a',rockDark:'#161010',grass:'#5a4a3e',grass2:'#6e5a48',sand:'#6a5446',roof:'#7a1e14',wall:'#8a7a6c',shallow:'#c86a3a',trees:'none',snow:0,lava:'#ff5a10'},
};

// ---------------------------------------------------------------- mesafe alanı
function makeSdf(shape,n){
  const prims=shape.land.map(p=>{
    if(p.c){const [x,z,r]=p.c;return(px,pz)=>Math.hypot(px-x,pz-z)-r;}
    if(p.cap){const [x1,z1,x2,z2,r]=p.cap,dx=x2-x1,dz=z2-z1,l2=dx*dx+dz*dz;return(px,pz)=>{const t=clamp(((px-x1)*dx+(pz-z1)*dz)/l2);return Math.hypot(px-x1-dx*t,pz-z1-dz*t)-r;};}
    const [cx,cz,R,a0,a1,w]=p.arc;return(px,pz)=>{let a=Math.atan2(pz-cz,px-cx);while(a<a0)a+=Math.PI*2;while(a>a0+Math.PI*2)a-=Math.PI*2;
      if(a<=a1)return Math.abs(Math.hypot(px-cx,pz-cz)-R)-w/2;const e0=[cx+Math.cos(a0)*R,cz+Math.sin(a0)*R],e1=[cx+Math.cos(a1)*R,cz+Math.sin(a1)*R];return Math.min(Math.hypot(px-e0[0],pz-e0[1]),Math.hypot(px-e1[0],pz-e1[1]))-w/2;};});
  return(x,z)=>{let d=Infinity;for(const f of prims)d=Math.min(d,f(x,z));for(const [hx,hz,hr] of shape.hole)d=Math.max(d,hr-Math.hypot(x-hx,z-hz));return d+n(x*.02+3,z*.02,3)*9+n(x*.07,z*.07,2)*3;};
}
function makeHeight(shape,sdf,n,th){
  return(x,z)=>{const d=sdf(x,z);if(d>0)return-4-Math.min(10,d*.3);const depth=-d;let h=Math.min(9,depth*.22)+smooth(10,40,depth)*n(x*.018,z*.018,3)*5;
    for(const [px,pz,ph,pr] of shape.peaks){const q=Math.hypot(x-px,z-pz)/pr;if(q<1){const ridge=1-Math.abs(n(x*.035+px,z*.035+pz,4));h+=ph*1.35*Math.pow(1-q,1.35)*(.8+ridge*.35)*smooth(0,18,depth);}}
    // kayalık doku: tepelerde yüksek frekanslı sırtlar
    h+=Math.max(0,h-18)*.035*n(x*.06,z*.06,2);return h;};
}

// ---------------------------------------------------------------- yapı parçaları
function house(th,r,wallM,roofM,winM){const g=new THREE.Group(),w=10+r()*8,d=9+r()*6,h=7+r()*5;
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallM);body.position.y=h/2;g.add(body);
  if(th.domes&&r()<.5){const dome=new THREE.Mesh(new THREE.SphereGeometry(Math.min(w,d)*.48,14,8,0,Math.PI*2,0,Math.PI/2),roofM);dome.position.y=h;g.add(dome);}
  else if(r()<.55){const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w,d)*.56,h*.7,4),roofM);roof.rotation.y=Math.PI/4;roof.scale.set(w/Math.hypot(w,d)*1.41,1,d/Math.hypot(w,d)*1.41);roof.position.y=h+h*.35;g.add(roof);}
  else{const sh=new THREE.Shape();sh.moveTo(-w/2-1,0);sh.lineTo(w/2+1,0);sh.lineTo(0,h*.62);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:d+1.5,bevelEnabled:false});geo.translate(0,0,-(d+1.5)/2);const roof=new THREE.Mesh(geo,roofM);roof.position.y=h;g.add(roof);}
  if(th.snow){const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.9,1.2,d*.9),std({color:'#f4f8fb'}));cap.position.y=h+h*.5;g.add(cap);}
  for(let k=0;k<2;k++){const win=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.4),winM);win.position.set((k-.5)*w*.45,h*.55,d/2+.05);g.add(win);}
  g.rotation.y=r()*Math.PI*2;return g;}
function tree(th,r,mats){const g=new THREE.Group();
  if(th.trees==='palm'){const h=16+r()*8,t=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.1,h,6),mats.trunk);t.position.y=h/2;t.rotation.z=(r()-.5)*.3;g.add(t);for(let k=0;k<6;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(1.8,11,4),mats.leaf[k%mats.leaf.length]);f.scale.z=.25;const a=k/6*Math.PI*2;f.position.set(Math.cos(a)*4,h-1,Math.sin(a)*4);f.rotation.set(Math.sin(a)*1.2,0,-Math.cos(a)*1.2);g.add(f);}return g;}
  if(th.trees==='pine'){const h=14+r()*10;const t=new THREE.Mesh(new THREE.CylinderGeometry(.6,.9,h*.35,6),mats.trunk);t.position.y=h*.17;g.add(t);for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(6-k*1.6,h*.45,8),mats.leaf[k%mats.leaf.length]);c.position.y=h*(.42+k*.18);g.add(c);}return g;}
  if(th.trees==='dead'){const h=10+r()*8,t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.9,h,5),mats.trunk);t.position.y=h/2;g.add(t);for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.4,h*.45,4),mats.trunk);b.position.set((r()-.5)*2,h*(.55+k*.12),(r()-.5)*2);b.rotation.set((r()-.5)*1.8,0,(r()-.5)*1.8);g.add(b);}return g;}
  if(th.trees==='crystal'){const c=new THREE.Mesh(new THREE.ConeGeometry(2+r()*2.5,10+r()*16,6),mats.crystal);c.position.y=5;c.rotation.set((r()-.5)*.5,r()*3,(r()-.5)*.5);g.add(c);return g;}
  const s=3.5+r()*5.5,m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),mats.leaf[Math.floor(r()*mats.leaf.length)]);m.scale.y=.85;m.position.y=s*.75;g.add(m);return g;}

// ---------------------------------------------------------------- ada kurucu
export function buildIsle(shapeIndex,themeId){
  const shape=SHAPES[shapeIndex],th=ISLE_THEMES[themeId],seed=shapeIndex*97+Object.keys(ISLE_THEMES).indexOf(themeId)*13+5,r=T.rng(seed),n=T.noise2(seed+11);
  const sdf=makeSdf(shape,T.noise2(shapeIndex*7+3)),hAt=makeHeight(shape,sdf,T.noise2(shapeIndex*5+1),th),root=new THREE.Group(),S=shape.span;
  // arazi
  const R=240,geo=new THREE.PlaneGeometry(S,S,R,R);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,hAt(p.getX(i),p.getZ(i)));geo.computeVertexNormals();
  const nm=geo.attributes.normal,col=[],c=new THREE.Color(),C=k=>new THREE.Color(th[k]),rock=C('rock'),rockD=C('rockDark'),grass=C('grass'),grass2=C('grass2'),sand=C('sand'),snow=new THREE.Color('#f4f8fb');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),ny=nm.getY(i),v=n(x*.05,z*.05,3),fine=n(x*.2,z*.2,2);
    if(y<2.4)c.copy(sand).lerp(rockD,smooth(1.6,2.4,y)*.2);
    else{const steep=smooth(.86,.66,ny+(shape.spiral?Math.sin(Math.atan2(z,x)*2+y*.09)*.12:0)),high=smooth(70,120,y);
      c.copy(grass).lerp(grass2,clamp(.5+v));const streak=n(x*.09,y*.02+z*.01,2),rk=rock.clone().lerp(rockD,clamp(.35-fine*.6+(1-ny)*.45+streak*.35));c.lerp(rk,Math.max(steep,high*.85));
      if(th.snow)c.lerp(snow,smooth(.6,.9,ny)*.85);else if(themeId==='haven'||themeId==='pearl'||themeId==='azure')c.lerp(rock.clone().multiplyScalar(1.08),high*smooth(.5,.9,ny)*.5);}
    c.multiplyScalar(.9+fine*.12);col.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  root.add(new THREE.Mesh(geo,std({vertexColors:true,roughness:.96})));
  // sığlık halkası ve köpük (tuval dokusu)
  {const W=512,[cv,x]=T.canvas(W,W),img=x.createImageData(W,W),d=img.data,sh=new THREE.Color(th.shallow);
    for(let j=0;j<W;j++)for(let i=0;i<W;i++){const wx=(i+.5)/W*S-S/2,wz=(j+.5)/W*S-S/2,dd=sdf(wx,wz),o=(j*W+i)*4;if(dd<=-1){d[o+3]=0;continue;}
      const a=clamp(1-dd/30)**1.8*.6,foam=smooth(7,0,dd)*(.7+n(wx*.2,wz*.2,2)*.4);const cc=sh.clone().lerp(new THREE.Color('#eafaf6'),clamp(foam));
      d[o]=cc.r*255;d[o+1]=cc.g*255;d[o+2]=cc.b*255;d[o+3]=255*clamp(Math.max(a,foam*.9));}
    x.putImageData(img,0,0);const water=new THREE.Mesh(new THREE.PlaneGeometry(S,S),new THREE.MeshBasicMaterial({map:T.toTexture(cv),transparent:true,depthWrite:false}));water.rotation.x=-Math.PI/2;water.position.y=.15;root.add(water);}
  // gölge yakalayıcı: adanın denize düşen gölgesi
  const catcher=new THREE.Mesh(new THREE.PlaneGeometry(S,S),new THREE.ShadowMaterial({opacity:.38}));catcher.rotation.x=-Math.PI/2;catcher.position.y=.2;catcher.receiveShadow=true;catcher.userData.noClip=true;root.add(catcher);
  const wallM=std({color:th.wall,roughness:.85}),roofM=std({color:th.roof,roughness:.7}),winM=std({color:th.glow||'#2a1a10',emissive:th.glow||'#000',emissiveIntensity:th.glow?1.6:0});
  const mats={trunk:std({color:th.trees==='dead'?'#3a342c':'#5a3e26'}),leaf:th.snow?[std({color:'#e6f0f4'}),std({color:'#cfdde6'}),std({color:'#3f5a48'})]:[std({color:th.grass}),std({color:th.grass2}),std({color:new THREE.Color(th.grass).multiplyScalar(.8)})],crystal:std({color:th.glow||'#b070ff',emissive:th.glow||'#b070ff',emissiveIntensity:1.2,roughness:.25})};
  const slope=(x,z)=>{const e=3;return Math.hypot(hAt(x+e,z)-hAt(x-e,z),hAt(x,z+e)-hAt(x,z-e))/(2*e);};
  // köyler
  const placed=[];const free=(x,z,s)=>placed.every(q=>Math.hypot(q[0]-x,q[1]-z)>q[2]+s);
  for(const [vx,vz,vr,count] of shape.villages){let k=0;for(let t=0;t<count*40&&k<count;t++){const a=r()*Math.PI*2,d=Math.sqrt(r())*vr,x=vx+Math.cos(a)*d,z=vz+Math.sin(a)*d,y=hAt(x,z);
      if(y<3||y>55||slope(x,z)>.55||!free(x,z,15))continue;const hs=house(th,r,wallM,roofM,winM);if(th.ruined&&r()<.4)hs.children.slice(1).forEach(ch=>ch.visible=r()<.5);hs.position.set(x,y-1,z);root.add(hs);placed.push([x,z,9]);k++;}}
  // ağaçlar
  if(th.trees!=='none'){const target=Math.round(shape.r*.28);const grove=T.noise2(seed+77);let k=0;for(let t=0;t<target*30&&k<target;t++){const x=(r()-.5)*S*.8,z=(r()-.5)*S*.8,y=hAt(x,z);if(y<3||y>80||slope(x,z)>(th.trees==='crystal'?1.2:.7)||grove(x*.012,z*.012,2)<-.05||!free(x,z,6))continue;const tr=tree(th,r,mats);tr.position.set(x,y-.5,z);tr.rotation.y=r()*6;root.add(tr);placed.push([x,z,5]);k++;}}
  // liman duvarı ve iskeleler
  if(shape.walls){const w=shape.walls;for(let i=0;i<w.length-1;i++){const [x1,z1]=w[i],[x2,z2]=w[i+1],len=Math.hypot(x2-x1,z2-z1),seg=new THREE.Mesh(new THREE.BoxGeometry(len+8,11,9),wallM);seg.position.set((x1+x2)/2,1,(z1+z2)/2);seg.rotation.y=-Math.atan2(z2-z1,x2-x1);root.add(seg);
      const top=new THREE.Mesh(new THREE.BoxGeometry(len+6,1,8),std({color:new THREE.Color(th.wall).multiplyScalar(.8)}));top.position.set(seg.position.x,6.5,seg.position.z);top.rotation.y=seg.rotation.y;root.add(top);}}
  const plank=std({color:'#8a6038'});for(const [x1,z1,x2,z2] of shape.piers){const len=Math.hypot(x2-x1,z2-z1),pr=new THREE.Mesh(new THREE.BoxGeometry(7,1.4,len),plank);pr.position.set((x1+x2)/2,2.2,(z1+z2)/2);pr.rotation.y=Math.atan2(x2-x1,z2-z1);root.add(pr);}
  // deniz feneri
  if(shape.light){const [lx,lz]=shape.light,y=Math.max(0,hAt(lx,lz)),g=new THREE.Group();g.position.set(lx,y,lz);root.add(g);
    for(let k=0;k<4;k++){const s=new THREE.Mesh(new THREE.CylinderGeometry(4.2-k*.3,4.5-k*.3,7,16),std({color:k%2?th.roof:th.wall}));s.position.y=3.5+k*7;g.add(s);}
    const lamp=new THREE.Mesh(new THREE.CylinderGeometry(3,3,4,12),std({color:'#ffe9a8',emissive:'#ffcc55',emissiveIntensity:1.6}));lamp.position.y=30;g.add(lamp);const cap=new THREE.Mesh(new THREE.ConeGeometry(3.8,4,12),std({color:'#2a2a2a'}));cap.position.y=34;g.add(cap);}
  // tema süsleri
  if(th.ruins){for(let k=0;k<6;k++){const x=(r()-.5)*shape.r,z=(r()-.5)*shape.r,y=hAt(x,z);if(y<4||slope(x,z)>.5)continue;const col=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,10+r()*8,10),wallM);col.position.set(x,y+5,z);root.add(col);}}
  if(th.rods){for(let k=0;k<2;k++){const x=(r()-.5)*shape.r*.6,z=(r()-.5)*shape.r*.6,y=hAt(x,z);if(y<4)continue;const rod=new THREE.Mesh(new THREE.CylinderGeometry(.6,.9,26,6),std({color:'#6a6e78',metalness:.8}));rod.position.set(x,y+13,z);root.add(rod);const orb=new THREE.Mesh(new THREE.SphereGeometry(2,10,8),std({color:'#dfe8ff',emissive:'#9ab8ff',emissiveIntensity:2.4}));orb.position.set(x,y+27,z);root.add(orb);}}
  if(th.lava){const lm=std({color:th.lava,emissive:th.lava,emissiveIntensity:2});for(const [px,pz,ph,pr] of shape.peaks){const pts=[];for(let k=0;k<=10;k++){const a=r()*.3+k*.12,d=pr*.1+k*pr*.085,x=px+Math.cos(a+1.4)*d,z=pz+Math.sin(a+1.4)*d;const y=hAt(x,z);if(y<2)break;pts.push(new THREE.Vector3(x,y+.8,z));}if(pts.length>2)root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),30,2.2,6),lm));
      const crater=new THREE.Mesh(new THREE.CircleGeometry(pr*.12,16),lm);crater.rotation.x=-Math.PI/2;crater.position.set(px,hAt(px,pz)+.5,pz);root.add(crater);}}
  root.userData.waterline=0;return root;
}

// Çarpışma daireleri: kara parçalarının üzerine dizilmiş daireler, ekran düzleminde (y = z · sin 55°). [x, y, r]
export function collisionCircles(shape){const k=Math.sin(ISLE_ELEVATION*Math.PI/180),out=[],push=(x,z,r)=>out.push([Math.round(x),Math.round(z*k),Math.round(r*.92)]);
  for(const p of shape.land){
    if(p.c)push(p.c[0],p.c[1],p.c[2]);
    else if(p.cap){const [x1,z1,x2,z2,r]=p.cap,l=Math.hypot(x2-x1,z2-z1),n=Math.max(2,Math.ceil(l/(r*.9))+1);for(let i=0;i<n;i++){const t=i/(n-1);push(x1+(x2-x1)*t,z1+(z2-z1)*t,r);}}
    else{const [cx,cz,R,a0,a1,w]=p.arc,n=Math.max(3,Math.ceil(R*(a1-a0)/(w*.45)));for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;push(cx+Math.cos(a)*R,cz+Math.sin(a)*R,w/2);}}}
  return out;}

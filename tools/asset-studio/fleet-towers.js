// Kara Yelken — filonun dikebildiği tam kuleler. Ada görselinin (fleet-base-v3) boyalı üslubuna uyması için
// taş, ahşap ve kumaş dokuları görselden örneklenen paletle elle boyanır. Model merkezi = kaide (dikme yeri)
// merkezi, +Y yukarı, +Z güney (ekranın altı). Birimler oyun dünyası birimidir; kaide ~41 birim yarıçaplıdır.
// Sıra src/guild.ts TOWER_TYPES ile aynıdır: cannon, mortar, chain, beacon.
import * as THREE from 'three';
import * as T from './textures.js';

// Görselden örneklenen palet (fleet-bastions-v1 piksellerinin parlaklık kümeleri)
const PAL={shadow:'#1e1c18',dark:'#3d3a34',mid:'#5f5b53',light:'#8c867a',high:'#b8b09e',moss:'#3d4917',moss2:'#547a47',warm:'#7d583a',gold:'#d4ae83',teal:'#1f6f76',teal2:'#2f9aa0'};
const hex=(h)=>new THREE.Color(h);
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.lerp(B,t).getHexString();}

// Boyalı taş: sıra sıra düzensiz bloklar, üst kenar ışığı, alt kenar gölgesi, harç, yosun ve kir izleri
function paintedStone({seed,W=512,H=256,rows=4,cols=9,moss=.5}){
  const [c,x]=T.canvas(W,H),r=T.rng(seed);x.fillStyle='#24211c';x.fillRect(0,0,W,H);
  const rh=H/rows;
  for(let j=0;j<rows;j++){let px=-(r()*W/cols);while(px<W){const bw=W/cols*(.6+r()*.8),y0=j*rh+2.5,h=rh-5,x0=px+2.5,w=bw-5,t=r();
      const g=x.createLinearGradient(0,y0,0,y0+h);const dk=r()<.3;g.addColorStop(0,mix(PAL.mid,PAL.light,.55+t*.3));g.addColorStop(.2,mix(dk?PAL.dark:PAL.mid,PAL.light,.1+t*.3));g.addColorStop(1,mix(PAL.shadow,PAL.dark,.55+t*.4));
      x.fillStyle=g;x.beginPath();x.roundRect(x0,y0,w,h,6);x.fill();
      x.fillStyle='rgba(0,0,0,.28)';x.fillRect(x0,y0+h-3,w,3);x.fillStyle='rgba(255,240,210,.1)';x.fillRect(x0+1,y0,w-2,1.5);
      for(let k=0;k<6;k++){x.fillStyle=`rgba(${r()<.5?'20,16,10':'190,175,150'},${.06+r()*.1})`;x.beginPath();x.ellipse(x0+r()*w,y0+r()*h,2+r()*5,1+r()*3,0,0,7);x.fill();}
      if(r()<.15){x.strokeStyle='rgba(15,12,8,.55)';x.lineWidth=1;x.beginPath();x.moveTo(x0+r()*w,y0);x.lineTo(x0+r()*w,y0+h*r());x.stroke();}
      px+=bw;}}
  // yosun alt sıralarda yoğun, kir akıntıları dikey
  for(let k=0;k<90*moss;k++){const yy=H*(.55+r()*.45),xx=r()*W;x.fillStyle=`rgba(${r()<.5?'61,73,23':'84,122,71'},${.25+r()*.35})`;x.beginPath();x.ellipse(xx,yy,3+r()*10,2+r()*5,0,0,7);x.fill();}
  for(let k=0;k<26;k++){const xx=r()*W,y0=r()*H*.5;const g=x.createLinearGradient(0,y0,0,y0+60);g.addColorStop(0,'rgba(20,16,10,.25)');g.addColorStop(1,'rgba(20,16,10,0)');x.fillStyle=g;x.fillRect(xx,y0,2+r()*3,60);}
  T.grain(x,W,H,r,{alpha:.1,count:1400,light:'#d8c8a8',dark:'#0e0b06'});
  const tex=T.toTexture(c,{repeat:true});return tex;
}
function paintedPlanks({seed,W=256,H=256}){
  const [c,x]=T.canvas(W,H),r=T.rng(seed);x.fillStyle='#3a2414';x.fillRect(0,0,W,H);
  for(let i=0;i<10;i++){const y0=i*H/10;x.fillStyle=mix('#5a3a20','#8a6038',r());x.fillRect(0,y0+1,W,H/10-2);x.fillStyle='rgba(255,220,170,.12)';x.fillRect(0,y0+1,W,2);for(let k=0;k<30;k++){x.fillStyle=`rgba(30,18,8,${r()*.3})`;x.fillRect(r()*W,y0+2+r()*(H/10-4),10+r()*30,1);}}
  T.grain(x,W,H,r,{alpha:.12,count:800});return T.toTexture(c,{repeat:true});
}
// Filo sancağı: turkuaz kumaş, altın kenar ve pusula-çapa arması
function fleetBannerTex(seed){
  const W=128,H=256,[c,x]=T.canvas(W,H),r=T.rng(seed);
  const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#123f44');g.addColorStop(.5,PAL.teal2);g.addColorStop(1,'#123f44');x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*.84);x.lineTo(W/2,H);x.lineTo(0,H*.84);x.closePath();x.fill();
  x.strokeStyle=PAL.gold;x.lineWidth=7;x.beginPath();x.moveTo(6,4);x.lineTo(6,H*.82);x.lineTo(W/2,H-10);x.lineTo(W-6,H*.82);x.lineTo(W-6,4);x.stroke();
  x.save();x.translate(W/2,H*.42);x.strokeStyle=PAL.gold;x.fillStyle=PAL.gold;x.lineWidth=5;x.beginPath();x.arc(0,0,30,0,7);x.stroke();
  for(let k=0;k<8;k++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,-36);x.lineTo(5,-8);x.lineTo(-5,-8);x.closePath();x.fill();}
  x.lineWidth=6;x.beginPath();x.moveTo(0,-18);x.lineTo(0,20);x.moveTo(-12,-8);x.lineTo(12,-8);x.stroke();x.beginPath();x.arc(0,8,14,.15*Math.PI,.85*Math.PI);x.stroke();x.restore();
  T.grain(x,W,H,r,{alpha:.14,count:500});blotchCloth(x,W,H,r);return T.toTexture(c);
}
function blotchCloth(x,W,H,r){for(let k=0;k<30;k++){x.fillStyle=`rgba(0,0,0,${r()*.12})`;x.fillRect(r()*W,r()*H,2,10+r()*30);}}

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.85,metalness:0,...o});
const glow=(c,i=2.4)=>std({color:c,emissive:c,emissiveIntensity:i,roughness:.4});
const ironM=()=>std({color:'#1e2023',metalness:.7,roughness:.42});
const bronzeM=()=>std({color:'#a8742f',metalness:.8,roughness:.32});
const cyl=(r0,r1,h,m,s=24,open=false)=>new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,s,1,open),m);
const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
function put(o,x,y,z,p){o.position.set(x,y,z);p.add(o);return o;}

// Ortak gövde: kaide, gövde, kuşak, mazgal atış delikleri, parapet ve dişler, meşaleler, sancak
function body(root,{h=46,r0=36,r1=34,seed=3,torches=true}={}){
  const st=paintedStone({seed,moss:.7});st.repeat.set(2,Math.max(1,h/40));
  const stoneM=std({map:st,color:'#c4bfb4',roughness:.9}),darkM=std({map:paintedStone({seed:seed+5,moss:.2}),color:'#9a948a',roughness:.95});
  put(cyl(r0+3,r0+4,6,darkM,28),0,3,0,root);
  const b=put(cyl(r1,r0,h,stoneM,32),0,6+h/2,0,root);
  const band=put(cyl(r1+1.8+(r0-r1)*.5,r1+1.8+(r0-r1)*.5,2.6,darkM,32),0,6+h*.55,0,root);
  // atış delikleri (dikey yarıklar) ön yüzde
  const slit=std({color:'#0b0906',roughness:1});for(const a of [-.7,0,.7]){const s=box(2.2,8,1,slit),rr=r1+(r0-r1)*.35+.3;s.position.set(Math.sin(a)*rr,6+h*.32,Math.cos(a)*rr);s.rotation.y=a;root.add(s);}
  // parapet ve mazgal dişleri
  const top=6+h;put(cyl(r1+2.5,r1+1.5,4,darkM,32),0,top+2,0,root);
  const fl=paintedStone({seed:seed+9,moss:.1});fl.repeat.set(2,2);const floor=new THREE.Mesh(new THREE.CircleGeometry(r1-1,32),std({map:fl,color:'#8a8276',roughness:.95}));floor.rotation.x=-Math.PI/2;put(floor,0,top+4.1,0,root);
  const n=14;for(let k=0;k<n;k++){const a=k/n*Math.PI*2,m=box(7.5,7,5.5,stoneM);m.position.set(Math.sin(a)*(r1+.5),top+7.5,Math.cos(a)*(r1+.5));m.rotation.y=a;root.add(m);}
  if(torches)for(const a of [-.55,.55]){const bx=Math.sin(a)*(r1+3.5),bz=Math.cos(a)*(r1+3.5);put(cyl(1.8,1.2,3,ironM(),10),bx,top+12,bz,root);
    put(new THREE.Mesh(new THREE.ConeGeometry(2,5,8),glow('#ffb040',3.2)),bx,top+15.5,bz,root);put(new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),glow('#fff0b0',4)),bx,top+14.4,bz,root);}
  // sancak: gövdenin önünde, parapet altından sarkar (hafif kıvrımlı)
  const bg=new THREE.PlaneGeometry(18,38,4,10),bp=bg.attributes.position;for(let i=0;i<bp.count;i++){const yy=bp.getY(i);bp.setZ(i,Math.sin(bp.getX(i)*.3)*.6+(19-yy)*.03);}bg.computeVertexNormals();
  const ban=new THREE.Mesh(bg,std({map:fleetBannerTex(seed+2),side:THREE.DoubleSide,roughness:.9}));put(ban,0,top-21,(r1+(r0-r1)*.25)+1.2,root);
  return{top,stoneM,darkM};
}
function flagPole(root,x,z,y0,h=30){
  put(cyl(.8,.9,h,std({color:'#3a2616'}),8),x,y0+h/2,z,root);put(new THREE.Mesh(new THREE.SphereGeometry(1.4,8,6),bronzeM()),x,y0+h+.8,z,root);
  const g=new THREE.PlaneGeometry(18,10,10,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x0=p.getX(i)+9;p.setX(i,x0);p.setZ(i,Math.sin(x0/18*Math.PI*2)*2*x0/18);}g.computeVertexNormals();
  const tex=T.flagTexture({seed:31,base:PAL.teal2,mark:(c,W,H,col)=>{c.fillStyle=col;c.beginPath();c.arc(W*.34,H/2,11,0,7);c.fill();c.fillStyle=PAL.teal2;c.beginPath();c.arc(W*.34,H/2,5,0,7);c.fill();},markColor:PAL.gold});
  const f=new THREE.Mesh(g,std({map:tex,side:THREE.DoubleSide}));f.rotation.y=.5;put(f,x,y0+h-6,z,root);
}
function cannonPiece(len=24,r=3){const g=new THREE.Group(),iron=ironM(),br=bronzeM();
  const barrel=cyl(r*.72,r,len,iron,18);barrel.rotation.x=Math.PI/2;put(barrel,0,0,len/2-4,g);
  for(const z of [-2,len*.4,len-4.5]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*(z<0?1.05:.85),.7,6,16),br);put(ring,0,0,z,g);}
  const cas=new THREE.Mesh(new THREE.SphereGeometry(r*.95,12,10),iron);put(cas,0,0,-4,g);
  const carr=box(r*3,r*1.6,len*.5,std({map:paintedPlanks({seed:41}),roughness:.9}));put(carr,0,-r*1.4,0,g);
  for(const sx of [-1,1])for(const z of [-3,5]){const w=cyl(r*.9,r*.9,1.6,std({color:'#3a2616'}),12);w.rotation.z=Math.PI/2;put(w,sx*r*1.6,-r*1.9,z,g);}
  return g;}

// 1) Top Kulesi: parapet boşluklarından dışarı bakan üç top ve ortada ağır döner top
function cannon(root){
  const {top}=body(root,{h:46,seed:3});
  for(const a of [-.62,0,.62]){const c=cannonPiece(22,2.8);c.position.set(Math.sin(a)*24,top+9,Math.cos(a)*24);c.rotation.y=a;root.add(c);}
  const center=cannonPiece(30,3.8);center.position.set(0,top+11,-6);center.rotation.y=-.35;root.add(center);
  put(cyl(9,10,3,std({color:'#4a3a2a'}),16),0,top+5.6,-6,root);
  const keg=std({map:paintedPlanks({seed:44}),roughness:.9});for(const [x,z] of [[-20,-14],[-15,-20]]){put(cyl(3.6,3.6,7,keg,12),x,top+7.6,z,root);}
  const ball=new THREE.SphereGeometry(2.1,10,8),bm=ironM();[[17,-14],[20.5,-14],[18.8,-17],[18.8,-15]].forEach(([x,z],i)=>put(new THREE.Mesh(ball,bm),x,top+(i===3?8.8:6.2),z,root));
  flagPole(root,-22,4,top+4,34);
}
// 2) Havan Kulesi: alçak, geniş gövde; kum torbası çemberi içinde tunç havan, bomba yığını ve duman
function mortar(root){
  const {top}=body(root,{h:38,r0:38,r1:36,seed:7});
  const bag=std({color:'#a8926a',roughness:1});for(let k=0;k<16;k++){const a=k/16*Math.PI*2,s=new THREE.Mesh(new THREE.CapsuleGeometry(2.8,6,4,8),bag);s.rotation.z=Math.PI/2;s.rotation.y=-a+Math.PI/2;put(s,Math.cos(a)*19,top+7,Math.sin(a)*19,root);if(k%2===0){const s2=s.clone();s2.rotation.y+=.2;put(s2,Math.cos(a+.2)*19,top+11.2,Math.sin(a+.2)*19,root);}}
  const m=new THREE.Group();m.rotation.x=-.8;m.rotation.y=.5;put(m,0,top+10,2,root);
  put(cyl(10,7.4,18,bronzeM(),24),0,7,0,m);const lip=new THREE.Mesh(new THREE.TorusGeometry(9.8,1.8,10,24),bronzeM());lip.rotation.x=Math.PI/2;put(lip,0,16,0,m);
  const bore=new THREE.Mesh(new THREE.CircleGeometry(8,24),std({color:'#060504'}));bore.rotation.x=-Math.PI/2;put(bore,0,16.4,0,m);
  for(const sx of [-1,1]){const tr=cyl(2.4,2.4,5,bronzeM(),12);tr.rotation.z=Math.PI/2;put(tr,sx*10.5,3,0,m);}
  put(box(18,6,14,std({map:paintedPlanks({seed:47})})),0,top+7,2,root);
  const bomb=new THREE.SphereGeometry(3.2,14,10),bm=std({color:'#17181a',metalness:.5,roughness:.45});
  [[-18,-8],[-14.5,-10],[-16.4,-5],[-16.3,-7.8]].forEach(([x,z],i)=>{const b=put(new THREE.Mesh(bomb,bm),x,top+(i===3?11:7.4),z,root);put(new THREE.Mesh(new THREE.SphereGeometry(.8,6,5),glow('#ffb040',3)),x,b.position.y+3.4,z,root);});
  const smoke=std({color:'#6e6a64',transparent:true,opacity:.22,roughness:1,depthWrite:false});[[6,32,4,5],[10,40,0,7]].forEach(([x,y,z,s])=>put(new THREE.Mesh(new THREE.SphereGeometry(s,12,10),smoke),x,top+y-10,z-14,root));
  flagPole(root,20,-14,top+4,30);
}
// 3) Zincir Kulesi: tepede büyük ahşap ırgat ve zincirli zıpkın mancınığı; gövdeden aşağı sarkan ağır zincir
function chain(root){
  const {top}=body(root,{h:46,seed:11});
  const wood=std({map:paintedPlanks({seed:51}),roughness:.9}),iron=ironM();
  const cap=put(cyl(8,9,12,wood,16),-10,top+10,-8,root);for(let k=0;k<6;k++){const a=k/6*Math.PI*2,bar=box(1.6,1.6,22,wood);bar.rotation.y=a;put(bar,-10,top+15,-8,root);}
  const link=new THREE.TorusGeometry(1.7,.6,6,12);
  for(let k=0;k<22;k++){const a=k/22*Math.PI*2,l=new THREE.Mesh(link,iron);l.rotation.set(Math.PI/2,a,k%2?Math.PI/2:0);put(l,-10+Math.cos(a)*9.2,top+6+(k%3)*2.6,-8+Math.sin(a)*9.2,root);}
  // gövde önünden aşağı sarkan zincir
  for(let k=0;k<16;k++){const t=k/15,l=new THREE.Mesh(link,iron);l.rotation.set(0,0,k%2?Math.PI/2:0);put(l,8+Math.sin(t*3)*1.2,top+4-t*44,35+t*6,root);}
  const b=new THREE.Group();b.rotation.y=-.45;put(b,8,top+9,6,root);
  put(box(4.4,4.4,32,wood),0,2,0,b);
  for(const sx of [-1,1]){const arm=box(24,2.6,3.2,wood);arm.rotation.y=sx*.32;put(arm,sx*10,4.6,10,b);const s=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,22,4),std({color:'#d8ccaa'}));s.rotation.z=Math.PI/2;s.rotation.y=sx*.55;put(s,sx*9,4.6,4,b);}
  const bolt=cyl(1,1,32,iron,8);bolt.rotation.x=Math.PI/2;put(bolt,0,6,8,b);const tip=new THREE.Mesh(new THREE.ConeGeometry(2.6,7,4),iron);tip.rotation.x=Math.PI/2;put(tip,0,6,27,b);
  for(const sx of [-1,1]){const barb=new THREE.Mesh(new THREE.ConeGeometry(1.1,5,4),iron);barb.rotation.x=-Math.PI/2;barb.rotation.z=sx*.55;put(barb,sx*1.9,6,22,b);}
  flagPole(root,-22,12,top+4,32);
}
// 4) Fener Kulesi: ince uzun gövde, altın çerçeveli cam fener odası, içinde parlayan ateş ve turkuaz kubbe
function beacon(root){
  const {top}=body(root,{h:58,r0:32,r1:28,seed:13});
  const glass=std({color:'#ffe9b0',transparent:true,opacity:.28,emissive:'#ffb040',emissiveIntensity:.9,roughness:.08});
  put(cyl(17,19,5,std({map:paintedStone({seed:61,moss:.1})}),20),0,top+6.5,0,root);
  put(cyl(14,14,18,glass,12),0,top+18,0,root);
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;put(cyl(.9,.9,18,bronzeM(),6),Math.cos(a)*14,top+18,Math.sin(a)*14,root);}
  put(cyl(15.5,15.5,1.8,bronzeM(),20),0,top+9.4,0,root);put(cyl(15.5,15.5,1.8,bronzeM(),20),0,top+27,0,root);
  put(new THREE.Mesh(new THREE.SphereGeometry(8,18,14),glow('#ffb040',3)),0,top+18,0,root);
  put(new THREE.Mesh(new THREE.SphereGeometry(4.5,14,10),glow('#fff4d0',4.5)),0,top+18,0,root);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(16,24,12,0,Math.PI*2,0,Math.PI/2),std({color:PAL.teal,metalness:.45,roughness:.35}));put(dome,0,top+27.5,0,root);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,rib=new THREE.Mesh(new THREE.TorusGeometry(16.1,.5,6,24,Math.PI/2),bronzeM());rib.rotation.set(0,a,0);put(rib,0,top+27.5,0,root);}
  put(cyl(.8,1.6,8,bronzeM(),8),0,top+47,0,root);put(new THREE.Mesh(new THREE.SphereGeometry(2,12,10),bronzeM()),0,top+52,0,root);
  flagPole(root,16,-10,top+4,20);
}
export const BUILT_TOWER_TYPES=['cannon','mortar','chain','beacon'];
const BUILDERS={cannon,mortar,chain,beacon};
export function buildBuiltTower(type){const root=new THREE.Group();BUILDERS[type](root);root.userData.waterline=-1;return root;}

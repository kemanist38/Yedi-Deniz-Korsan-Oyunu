// Kara Yelken — dikilebilir kule tipleri: sur burcunun düz taş tepesine oturan üst yapılar.
// Birimler oyun dünyası birimidir; burç tepesi (disk) ~74 birim çaplıdır. Model merkezi = disk merkezi, +Z güney (ekranın altı).
// Sıra src/guild.ts içindeki TOWER_TYPES ile aynıdır: cannon, mortar, chain, beacon.
import * as THREE from 'three';
import * as T from './textures.js';

const std=(o)=>new THREE.MeshStandardMaterial({roughness:.75,metalness:0,...o});
const glow=(c,i=2)=>std({color:c,emissive:c,emissiveIntensity:i,roughness:.4});
const iron=()=>std({color:'#23262a',metalness:.75,roughness:.38});
const bronze=()=>std({color:'#b07a36',metalness:.85,roughness:.3});
const wood=(seed=5)=>std({map:T.chestWoodTexture({seed,wood:'#6a4a2c',dark:'#3a2414'}),roughness:.85});
const stone=(seed=7)=>std({map:T.stoneTexture({seed,base:'#6a655c',dark:'#3a3732',moss:'#4a5a3a'})});
const cyl=(r0,r1,h,m,s=16)=>new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,s),m);
const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
function place(o,x,y,z,parent){o.position.set(x,y,z);parent.add(o);return o;}

// Ortak: gölge diski ve sancak direği (filo rengi)
// Burcun boyalı taş tepesi (pusula deseni) görünür kalsın diye döşeme yok; yalnızca yapıların altına gölge diski.
function deck(root){
  const sh=new THREE.Mesh(new THREE.CircleGeometry(20,24),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.28,depthWrite:false}));sh.rotation.x=-Math.PI/2;place(sh,0,.2,0,root);
}
function banner(root,x,z,h=38){
  place(cyl(.7,.8,h,wood(9),8),x,h/2,z,root);
  const fm=std({map:T.flagTexture({seed:23,base:'#1f7f86',mark:(c,W,H,col)=>{c.fillStyle=col;c.beginPath();c.arc(W*.34,H/2,10,0,7);c.fill();c.fillStyle='#1f7f86';c.beginPath();c.arc(W*.34,H/2,5,0,7);c.fill();},markColor:'#ffd24a'}),side:THREE.DoubleSide});
  const g=new THREE.PlaneGeometry(16,9,10,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x0=p.getX(i)+8;p.setX(i,x0);p.setZ(i,Math.sin(x0/16*Math.PI*2)*1.6*x0/16);}g.computeVertexNormals();
  const f=new THREE.Mesh(g,fm);f.rotation.y=.6;place(f,x,h-5,z,root);
}

// 1) Top Kulesi: döner kundak üstünde çift namlulu ağır top, barut fıçıları ve gülle yığını
function cannon(root){
  deck(root);
  const turn=cyl(14,16,4,stone(11),20);place(turn,0,4.6,0,root);
  const carriage=new THREE.Group();carriage.rotation.y=-.55;place(carriage,0,6.6,0,root);
  const bed=box(16,4,22,wood(4));place(bed,0,2,0,carriage);
  for(const sx of [-1,1]){const cheek=box(2.4,9,18,wood(6));place(cheek,sx*7,6,0,carriage);const wheel=cyl(4.2,4.2,2.2,wood(8),14);wheel.rotation.z=Math.PI/2;place(wheel,sx*9,2.4,6,carriage);place(wheel.clone(),sx*9,2.4,-6,carriage);}
  for(const sx of [-3.4,3.4]){const barrel=cyl(2.6,3.6,30,iron(),18);barrel.rotation.x=Math.PI/2;place(barrel,sx,9.5,8,carriage);const ring=new THREE.Mesh(new THREE.TorusGeometry(3.8,.7,6,16),bronze());place(ring,sx,9.5,-3,carriage);const muz=new THREE.Mesh(new THREE.TorusGeometry(2.9,.8,6,16),bronze());place(muz,sx,9.5,23,carriage);}
  for(const [x,z] of [[-20,-10],[-16,-18]]){const k=cyl(4,4,9,wood(12),12);place(k,x,7,z,root);place(new THREE.Mesh(new THREE.TorusGeometry(4.1,.4,4,14),iron()),x,9,z,root).rotation.x=Math.PI/2;}
  const ball=new THREE.SphereGeometry(2.1,10,8),bm=iron();[[16,-12],[20,-12],[18,-15.4],[18,-13]].forEach(([x,z],i)=>place(new THREE.Mesh(ball,bm),x,i===3?8.6:5.6,z,root));
  banner(root,-18,14);
}
// 2) Havan Kulesi: kum torbası halkası içinde kalın bronz havan, yanında bomba yığını
function mortar(root){
  deck(root);
  const bag=std({color:'#b8a078',roughness:1});for(let k=0;k<14;k++){const a=k/14*Math.PI*2,s=new THREE.Mesh(new THREE.CapsuleGeometry(2.6,5,4,8),bag);s.rotation.z=Math.PI/2;s.rotation.y=-a;place(s,Math.cos(a)*17,5,Math.sin(a)*17,root);if(k%2===0){const s2=s.clone();place(s2,Math.cos(a+.2)*17,9.2,Math.sin(a+.2)*17,root);}}
  const base=cyl(9,11,5,stone(13),16);place(base,0,5,0,root);
  const m=new THREE.Group();m.rotation.x=-.75;m.rotation.y=.4;place(m,0,9,0,root);
  const body=cyl(8.4,6.2,16,bronze(),20);place(body,0,6,0,m);const lip=new THREE.Mesh(new THREE.TorusGeometry(8.2,1.4,8,20),bronze());lip.rotation.x=Math.PI/2;place(lip,0,14,0,m);
  const bore=new THREE.Mesh(new THREE.CircleGeometry(6.6,20),std({color:'#050505'}));bore.rotation.x=-Math.PI/2;place(bore,0,14.2,0,m);
  for(const sx of [-1,1]){const tr=cyl(2,2,4,bronze(),10);tr.rotation.z=Math.PI/2;place(tr,sx*9.5,3,0,m);}
  const bomb=new THREE.SphereGeometry(3,12,10),bmat=std({color:'#1a1a1c',metalness:.5,roughness:.5});[[20,6],[23.5,8],[21.5,10.4],[22,8]].forEach(([x,z],i)=>{const b=place(new THREE.Mesh(bomb,bmat),x-2,i===3?9.6:5,z-24,root);if(i<3){const fuse=glow('#ffb040',2.5);place(new THREE.Mesh(new THREE.SphereGeometry(.7,6,5),fuse),b.position.x,b.position.y+3.2,b.position.z,root);}});
  banner(root,-20,12);
}
// 3) Zincir Kulesi: zincir makarası ve zıpkınlı mancınık (ballista); düşman gemilerini yavaşlatır
function chain(root){
  deck(root);
  const base=cyl(10,12,5,stone(17),16);place(base,0,5,0,root);
  const b=new THREE.Group();b.rotation.y=-.5;place(b,0,8,0,root);
  const stock=box(4,4,30,wood(14));place(stock,0,4,2,b);
  for(const sx of [-1,1]){const arm=box(22,2.4,3,wood(15));arm.rotation.y=sx*.35;place(arm,sx*9,6,12,b);const str=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,20,4),std({color:'#e0d4b0'}));str.rotation.z=Math.PI/2;str.rotation.y=sx*.6;place(str,sx*8,6,6,b);}
  const bolt=cyl(.9,.9,30,iron(),8);bolt.rotation.x=Math.PI/2;place(bolt,0,7,8,b);const tip=new THREE.Mesh(new THREE.ConeGeometry(2.2,6,4),iron());tip.rotation.x=Math.PI/2;place(tip,0,7,25,b);
  for(const sx of [-1,1]){const barb=new THREE.Mesh(new THREE.ConeGeometry(1,5,4),iron());barb.rotation.x=-Math.PI/2;barb.rotation.z=sx*.5;place(barb,sx*1.6,7,21,b);}
  const spool=cyl(7,7,12,wood(16),18);spool.rotation.z=Math.PI/2;place(spool,-16,10,-12,root);
  const link=new THREE.TorusGeometry(1.5,.5,6,10),lm=iron();for(let k=0;k<18;k++){const a=k/18*Math.PI*2,l=new THREE.Mesh(link,lm);l.rotation.set(a,k%2?Math.PI/2:0,0);place(l,-16+((k%6)-2.5)*1.6,10+Math.cos(a)*7.4,-12+Math.sin(a)*7.4,root);}
  for(let k=0;k<10;k++){const l=new THREE.Mesh(link,lm);l.rotation.y=k%2?Math.PI/2:0;place(l,-10+k*2.2,6+Math.sin(k*.5)*1.5,-8+k*1.8,root);}
  banner(root,18,-14);
}
// 4) Fener Kulesi: taş fener gövdesi, cam fener odası ve parlayan ateş; yakındaki dost gemileri onarır
function beacon(root){
  deck(root);
  const body=cyl(11,14,26,stone(19),12);place(body,0,15,0,root);
  const band=cyl(14.5,14.5,2.4,bronze(),12);place(band,0,4.6,0,root);place(band.clone(),0,27,0,root);
  const room=cyl(10,10,14,std({color:'#ffe9b0',transparent:true,opacity:.35,emissive:'#ffb040',emissiveIntensity:.8,roughness:.1}),10);place(room,0,35,0,root);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,p=cyl(.7,.7,14,iron(),6);place(p,Math.cos(a)*10,35,Math.sin(a)*10,root);}
  place(new THREE.Mesh(new THREE.SphereGeometry(6,16,12),glow('#ffcf6a',3.2)),0,35,0,root);
  place(new THREE.Mesh(new THREE.SphereGeometry(3.4,12,10),glow('#fff4d0',4)),0,35,0,root);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(12.5,11,12),std({color:'#1f5a5e',metalness:.4,roughness:.4}));place(roof,0,47.5,0,root);
  place(new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),bronze()),0,53.5,0,root);
  for(const [x,z] of [[-20,12],[20,12]]){const w=cyl(3.4,3.8,6,wood(20),10);place(w,x,5,z,root);}
  const win=glow('#ffcf6a',1.8);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3,5),win);p.position.set(Math.sin(a)*11.2,16,Math.cos(a)*11.2);p.rotation.y=a;root.add(p);}
  banner(root,-18,-12,44);
}
export const TOWER_TOP_TYPES=['cannon','mortar','chain','beacon'];
const BUILDERS={cannon,mortar,chain,beacon};
export function buildTowerTop(type){const root=new THREE.Group(),inner=new THREE.Group();inner.scale.setScalar(1.18);BUILDERS[type](inner);root.add(inner);root.userData.waterline=-1;return root;}

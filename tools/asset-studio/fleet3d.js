// Kara Yelken — filo adasının 3B modeli (deneme). Yerleşim boyalı ada görselinden (fleet-base-v3) okunur:
// kıyı çizgisi, lagün/kanal, kumsal, orman ve kayalık bölgeler görseldeki yerlerinde 3B olarak yeniden kurulur;
// böylece src/fleetMask.ts seyir maskesi ve src/campaign.ts FLEET.towers kaide konumları geçerli kalır.
// Sur, kaideler ve kale yordamsal olarak kurulur. Kamera 50°; model z ekseninde 1/sin(50°) uzatılır, böylece
// zemindeki (x,z) noktası ekranda (x,z)'ye düşer (1024 px = 1000 dünya birimi).
import * as THREE from 'three';
import * as T from './textures.js';
import {paintedStone,paintedPlanks} from './fleet-towers.js';

export const ISLAND3D_ELEVATION=50;
const COS_E=Math.cos(ISLAND3D_ELEVATION*Math.PI/180);
const N=512,U=1000/N,PAD_TOP=32,PAD_R=42;
const std=(o)=>new THREE.MeshStandardMaterial({roughness:.88,metalness:0,...o});
const glow=(c,i=2.6)=>std({color:c,emissive:c,emissiveIntensity:i,roughness:.4});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

// ---------------------------------------------------------------- ızgara yardımcıları
function blur(src,r,passes=2){let a=Float32Array.from(src),b=new Float32Array(N*N);
  for(let p=0;p<passes;p++){
    for(let y=0;y<N;y++){let s=0;for(let x=-r;x<=r;x++)s+=a[y*N+clamp(x,0,N-1)];for(let x=0;x<N;x++){b[y*N+x]=s/(2*r+1);s+=a[y*N+clamp(x+r+1,0,N-1)]-a[y*N+clamp(x-r,0,N-1)];}}
    for(let x=0;x<N;x++){let s=0;for(let y=-r;y<=r;y++)s+=b[clamp(y,0,N-1)*N+x];for(let y=0;y<N;y++){a[y*N+x]=s/(2*r+1);s+=b[clamp(y+r+1,0,N-1)*N+x]-b[clamp(y-r,0,N-1)*N+x];}}}
  return a;}
// Chamfer uzaklık dönüşümü: inside[k] olan piksellerin dışarıya (inside=0) uzaklığı, dünya biriminde
function distance(inside){const D=new Float32Array(N*N),INF=1e9,a=1,b=Math.SQRT2;for(let k=0;k<N*N;k++)D[k]=inside[k]?INF:0;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=y*N+x;if(!D[k])continue;let d=D[k];
    if(x>0)d=Math.min(d,D[k-1]+a);if(y>0){d=Math.min(d,D[k-N]+a);if(x>0)d=Math.min(d,D[k-N-1]+b);if(x<N-1)d=Math.min(d,D[k-N+1]+b);}D[k]=d;}
  for(let y=N-1;y>=0;y--)for(let x=N-1;x>=0;x--){const k=y*N+x;if(!D[k])continue;let d=D[k];
    if(x<N-1)d=Math.min(d,D[k+1]+a);if(y<N-1){d=Math.min(d,D[k+N]+a);if(x<N-1)d=Math.min(d,D[k+N+1]+b);if(x>0)d=Math.min(d,D[k+N-1]+b);}D[k]=d;}
  for(let k=0;k<N*N;k++)D[k]=Math.min(D[k],4000)*U;return D;}
const gi=(x)=>clamp(Math.floor((x+500)/U),0,N-1);
function sample(G,x,z){const fx=clamp((x+500)/U-.5,0,N-1.001),fz=clamp((z+500)/U-.5,0,N-1.001),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,k=j*N+i;
  return G[k]*(1-u)*(1-v)+G[k+1]*u*(1-v)+G[k+N]*(1-u)*v+G[k+N+1]*u*v;}

// ---------------------------------------------------------------- görselden bölge haritası
export async function readMap(src,mask){
  const im=new Image();im.src=src;await im.decode();const [c,x]=T.canvas(N,N);x.imageSmoothingQuality='high';x.drawImage(im,0,0,N,N);const px=x.getImageData(0,0,N,N).data;
  const grid=new Uint8Array(mask.n*mask.n);{let k=0;for(const part of mask.rle.split(',')){const v=+part[0],n=parseInt(part.slice(1),36);grid.fill(v,k,k+n);k+=n;}}
  const cellOf=(k)=>{const i=k%N,j=(k-i)/N;return grid[clamp(Math.floor((j+.5)*U/mask.cell),0,mask.n-1)*mask.n+clamp(Math.floor((i+.5)*U/mask.cell),0,mask.n-1)];};
  const water=new Uint8Array(N*N);for(let k=0;k<N*N;k++)water[k]=cellOf(k)?1:0;
  const land=new Float32Array(N*N),sand=new Float32Array(N*N),veg=new Float32Array(N*N),rock=new Float32Array(N*N);
  for(let k=0;k<N*N;k++){const R=px[k*4],G=px[k*4+1],B=px[k*4+2],A=px[k*4+3];
    if(A<70||(B-R>12&&G-R>8)||water[k])continue;land[k]=1;const l=(R+G+B)/3,sat=Math.max(R,G,B)-Math.min(R,G,B);
    if(R>150&&G>125&&R-B>35)sand[k]=1;else if(G>R+2&&G>B+12&&l>34)veg[k]=1;else rock[k]=1;}
  const landS=blur(land,1),sandS=blur(sand,2),vegS=blur(veg,2),rockS=blur(rock,2);
  const isLand=new Uint8Array(N*N);for(let k=0;k<N*N;k++)isLand[k]=landS[k]>.5?1:0;
  const dL=distance(isLand),dW=distance(isLand.map(v=>1-v));
  // Lagün/kanal: seyir maskesindeki 2 değerli hücreler, yumuşatılmış
  const lag=new Float32Array(N*N);for(let k=0;k<N*N;k++)lag[k]=cellOf(k)===2?1:0;
  const lagS=blur(lag,6,3).map(v=>clamp(v*2.4));
  const notOuter=new Uint8Array(N*N),notLag=new Uint8Array(N*N);for(let k=0;k<N*N;k++){notOuter[k]=isLand[k]||lagS[k]>.5?1:0;notLag[k]=isLand[k]||lagS[k]<=.5?1:0;}
  const dO=distance(notOuter),dLg=distance(notLag),sandB=blur(sand,5,2),rockB=blur(rock,5,2);
  // Seyre kapalı ama görselde su olan yerler: kıyı önü kayalıkları buraya dikilir
  const reef=new Uint8Array(N*N);for(let k=0;k<N*N;k++)reef[k]=!isLand[k]&&!water[k]&&land[k]===0?1:0;
  return{isLand,landS,sandS,vegS,rockS,dL,dW,lagS,dO,dLg,sandB,rockB,reef};
}

// ---------------------------------------------------------------- yapı yerleşimi
function layout(pads){
  // Kaide zemin çapası: kaide tepesi ekranda kule konumu + (px,py) noktasına düşsün diye zemin noktası PAD_TOP·cos(e) kadar güneye kayar
  const P=pads.map(([tx,ty,px,py])=>({x:tx+px,z:ty+py+PAD_TOP*COS_E}));
  const KEEP={x:0,z:-296},KL={x:-78,z:-300},KR={x:84,z:-300};
  const walls=[[KL,P[0],P[1],P[2],P[3]],[P[4],P[5],P[6],P[7],KR]];
  const segs=[];for(const line of walls)for(let i=0;i<line.length-1;i++)segs.push([line[i],line[i+1]]);
  const distSeg=(x,z)=>{let best=1e9;for(const [a,b] of segs){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz));best=Math.min(best,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return best;};
  // İskele: lagündeki uç noktası ve karaya doğru yön; kıyı noktası kurulumda bulunur
  const PIERS=[{x:-150,z:-96,dx:-1,dz:-.12},{x:24,z:-118,dx:.55,dz:-1},{x:-120,z:62,dx:-1,dz:.35}];
  const STAIRS={x:0,z0:-248,z1:-200};
  const blocked=(x,z,pad=0)=>distSeg(x,z)<16+pad||P.some(p=>Math.hypot(x-p.x,z-p.z)<PAD_R+10+pad)||(Math.abs(x-KEEP.x)<110+pad&&z<KEEP.z+70+pad&&z>KEEP.z-80)||(Math.abs(x)<22+pad&&z>STAIRS.z0-20&&z<STAIRS.z1+10)||PIERS.some(q=>q.len&&(()=>{const t=clamp((x-q.x)*q.ux+(z-q.z)*q.uz,0,q.len);return Math.hypot(x-q.x-q.ux*t,z-q.z-q.uz*t)<12+pad;})());
  return{P,KEEP,KL,KR,walls,distSeg,PIERS,STAIRS,blocked};
}

// ---------------------------------------------------------------- bölgeler
// Kumsal: lagün kıyısı ve görseldeki geniş kum alanları; kayalık: dış kıyı şeridi ve kale tepesi; geri kalanı orman.
function zones(M,L,n){const sand=new Float32Array(N*N),rock=new Float32Array(N*N),veg=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=(i+.5)*U-500,z=(j+.5)*U-500;if(!M.isLand[k])continue;
    const nn=n(x*.018+3,z*.018,3),rim=smooth(26+nn*14,8,M.dO[k]),keepHill=Math.exp(-((x-L.KEEP.x)**2/(190*190)+(z-L.KEEP.z+30)**2/(80*80)));
    const brk=smooth(-.05,.25,n(x*.011+70,z*.011,2)+M.rockB[k]*.25-.12);let rk=clamp(Math.max(rim*brk*(.45+M.rockB[k]*1.2),keepHill*1.1*smooth(-.2,.25,nn)));
    let sd=clamp(Math.max(smooth(.2,.42,M.sandB[k]),rim*(1-brk)*.95,smooth(34+nn*10,8,M.dLg[k]),smooth(22,8,M.dO[k])*smooth(.1,.3,M.sandB[k])));sd*=1-rk*.8;rk*=1-sd*.4;
    const vg=clamp(1-sd-rk);sand[k]=sd;rock[k]=rk;veg[k]=vg;}
  return{sand,rock,veg};}

// ---------------------------------------------------------------- yükseklik ve dokular
function heights(M,Z,L,n){
  const H=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=(i+.5)*U-500,z=(j+.5)*U-500;
    if(M.isLand[k]){let h=1.2+Math.min(4,M.dL[k]*.12);h+=Z.veg[k]*(2.5+(n(x*.02,z*.02,3)+1)*2.5)+Z.rock[k]*4;
      // Kalenin oturduğu tepe
      const kh=Math.exp(-((x-L.KEEP.x)**2/(150*150)+(z-L.KEEP.z+18)**2/(95*95)));h+=26*kh*smooth(0,20,M.dL[k]);H[k]=h;}
    else H[k]=-2.5-Math.min(8,M.dW[k]*.2);}
  return blur(H,1,1);
}
function mixHex(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
const RGB=(h)=>{const c=new THREE.Color(h);return[c.r*255,c.g*255,c.b*255];};
function groundTexture(M,Z,n,r){
  const S=1024,[c,x]=T.canvas(S,S),img=x.createImageData(S,S),d=img.data;
  const SAND=RGB('#efe4c4'),SAND2=RGB('#e0d2aa'),WET=RGB('#b8a47a'),VEG=RGB('#46562a'),VEG2=RGB('#65743a'),ROCK=RGB('#7c7a5a'),DIRT=RGB('#8e8a66');
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const x0=(i+.5)*1000/S-500,z0=(j+.5)*1000/S-500,o=(j*S+i)*4;
    const s=sample(Z.sand,x0,z0),v=sample(Z.veg,x0,z0),rk=sample(Z.rock,x0,z0),dl=sample(M.dL,x0,z0),t=s+v+rk+1e-4,nn=n(x0*.06,z0*.06,3),fine=n(x0*.35,z0*.35,2);
    let col=mixHex(SAND,SAND2,clamp(.5+nn*.8));col=mixHex(col,WET,smooth(7,1,dl));
    const vc=mixHex(VEG,VEG2,clamp(.5+nn)),rc=mixHex(ROCK,DIRT,clamp(.5+nn));
    col=[(col[0]*s+vc[0]*v+rc[0]*rk)/t,(col[1]*s+vc[1]*v+rc[1]*rk)/t,(col[2]*s+vc[2]*v+rc[2]*rk)/t];
    const g=1+fine*.08;d[o]=col[0]*g;d[o+1]=col[1]*g;d[o+2]=col[2]*g;d[o+3]=255;}
  x.putImageData(img,0,0);
  // kumda dalga izleri ve çakıllar; ormanda ot tutamları
  for(let k=0;k<5000;k++){const px=r()*S,py=r()*S,x0=px*1000/S-500,z0=py*1000/S-500,sd=sample(Z.sand,x0,z0),vg=sample(Z.veg,x0,z0);
    if(sd>.6){x.strokeStyle=`rgba(150,120,70,${.12+r()*.12})`;x.lineWidth=1;x.beginPath();x.arc(px,py+8,8+r()*8,-2.2,-1,false);x.stroke();}
    else if(vg>.5){x.strokeStyle=`rgba(${r()<.5?'40,60,20':'120,140,60'},${.3+r()*.3})`;x.lineWidth=1.2;for(let q=0;q<4;q++){x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*6,py-3-r()*5);x.stroke();}}}
  for(let k=0;k<2600;k++){const px=r()*S,py=r()*S;x.fillStyle=`rgba(${r()<.5?'60,45,25':'255,240,205'},${.05+r()*.08})`;x.beginPath();x.ellipse(px,py,1+r()*2.5,.6+r()*1.2,r()*3,0,7);x.fill();}
  const tex=T.toTexture(c);tex.anisotropy=8;return tex;
}
function waterTexture(M,n,reefs=[]){
  const S=1024,[c,x]=T.canvas(S,S),img=x.createImageData(S,S),d=img.data;
  const C=[[0,RGB('#9ef2dc')],[12,RGB('#4fd6c8')],[34,RGB('#27b4b6')],[70,RGB('#1a98a4')],[140,RGB('#157f90')]];
  const at=(w)=>{for(let k=1;k<C.length;k++)if(w<C[k][0]){const t=(w-C[k-1][0])/(C[k][0]-C[k-1][0]);return mixHex(C[k-1][1],C[k][1],t*t*(3-2*t));}return C[C.length-1][1];};
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const x0=(i+.5)*1000/S-500,z0=(j+.5)*1000/S-500,o=(j*S+i)*4,w=sample(M.dW,x0,z0),lg=sample(M.lagS,x0,z0);
    if(w<=0){d[o+3]=0;continue;}
    const caust=Math.min(Math.abs(n(x0*.045,z0*.045,3)),Math.abs(n(x0*.11+5,z0*.11,2))*1.4),cn=n(x0*.012+40,z0*.012,3);let col=at(w*(1+cn*.35));
    const lit=1+Math.max(0,.1-caust)*2.2*smooth(0,1,lg+.2)-Math.max(0,cn)*.14+n(x0*.3,z0*.3,2)*.04;col=col.map(v=>v*lit);
    // kıyı köpüğü: kıyıya yapışık şerit + kırık ikinci dalga çizgisi
    const f1=smooth(5,0,w)*(.75+n(x0*.2,z0*.2,2)*.4),f2=smooth(2.2,0,Math.abs(w-8-n(x0*.05,z0*.05,2)*3))*clamp(n(x0*.08+9,z0*.08,2)*1.6+.3)*.55;
    const f=clamp(Math.max(f1,f2)*(1-lg*.35));col=mixHex(col,[236,250,244],f);
    const outer=clamp(1-(w-2)/24)*.8,a=Math.max(outer*outer*outer,lg);
    d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255*Math.max(a,f);}
  x.putImageData(img,0,0);
  // kaya adacıklarının çevresinde köpük
  const k=S/1000;for(const c of reefs){const cx=(c.x+500)*k,cy=(c.z+500)*k,R=c.s*1.9*k,g=x.createRadialGradient(cx,cy,c.s*.7*k,cx,cy,R);g.addColorStop(0,'rgba(236,250,244,.85)');g.addColorStop(.45,'rgba(200,245,235,.35)');g.addColorStop(1,'rgba(160,235,225,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R,0,7);x.fill();}
  return T.toTexture(c);
}

// ---------------------------------------------------------------- kaya ve bitki geometrileri
function rockGeometry(seed,n){
  // Sivri, çatlaklı kaya: ayrıntılı küre + sırt gürültüsü; yumuşak normaller, yüksekliğe göre gölge, üstte yosun
  const g=new THREE.IcosahedronGeometry(1,4),p=g.attributes.position,v=new THREE.Vector3(),r=T.rng(seed),tall=.75+r()*.7,lean=(r()-.5)*.5,peaks=1+Math.floor(r()*3),px=[];
  for(let k=0;k<peaks;k++)px.push([(r()-.5)*.9,(r()-.5)*.9,.25+r()*.45]);
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const ridge=1-Math.abs(n(v.x*2.2+seed,v.y*2.2+v.z*1.7,4)),k=.72+ridge*.5+n(v.x*5+seed,v.z*5+v.y*3,2)*.12;v.multiplyScalar(k);
    if(v.y<0)v.y*=.3;else{let bump=0;for(const [ax,az,h] of px)bump+=h*Math.exp(-((v.x-ax)**2+(v.z-az)**2)*5);v.y=v.y*tall*(.85+bump);v.x+=lean*v.y*.4;}
    p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();
  const nm=g.attributes.normal,col=[],c=new THREE.Color(),base=new THREE.Color(),moss=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i),ny=nm.getY(i),t=n(p.getX(i)*3+seed,p.getZ(i)*3,2);
    base.set(t>.1?'#8f9294':t<-.15?'#6a6d70':'#7d8083');moss.set(t>0?'#62733a':'#4d5f2e');
    c.copy(base).lerp(moss,smooth(.7,.92,ny)*smooth(.2,.6,y/tall)*clamp(.3+t));c.multiplyScalar(.5+clamp(y/(tall*1.2))*.6);col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;
}
function crackTexture(){const S=256,[c,x]=T.canvas(S,S),r=T.rng(21);x.fillStyle='#bdb6a6';x.fillRect(0,0,S,S);
  for(let k=0;k<70;k++){x.strokeStyle=`rgba(30,24,16,${.25+r()*.4})`;x.lineWidth=.8+r()*1.6;let px=r()*S,py=r()*S;x.beginPath();x.moveTo(px,py);for(let s=0;s<5;s++){px+=(r()-.5)*40;py+=r()*30;x.lineTo(px,py);}x.stroke();}
  for(let k=0;k<400;k++){x.fillStyle=`rgba(${r()<.5?'40,32,22':'255,245,225'},${.08+r()*.12})`;x.beginPath();x.ellipse(r()*S,r()*S,2+r()*6,1+r()*3,r()*3,0,7);x.fill();}
  T.grain(x,S,S,r,{alpha:.12,count:1500});const t=T.toTexture(c,{repeat:true});t.repeat.set(3,3);return t;}
function leafTexture(seed){const [c,x]=T.canvas(256,64),r=T.rng(seed);
  for(let k=0;k<46;k++){const t=k/46,px=10+t*236,w=26*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.1)),.7);
    for(const s of [-1,1]){x.strokeStyle=`rgb(${38+t*40+r()*20},${62+t*60+r()*30},${22+t*14+r()*14})`;x.lineWidth=3.2-t*1.6;x.beginPath();x.moveTo(px,32);x.quadraticCurveTo(px+6,32+s*w*.5,px+12,32+s*w);x.stroke();}}
  x.strokeStyle='#6d7a33';x.lineWidth=2.5;x.beginPath();x.moveTo(6,32);x.lineTo(250,32);x.stroke();return T.toTexture(c);}
function frondGeometry(){
  const g=new THREE.PlaneGeometry(1,1,12,2),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const t=p.getX(i)+.5,s=p.getY(i)*2;const w=.32*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05)),.6);
    p.setXYZ(i,t,-.55*t*t+Math.abs(s)*w*.35,s*w);}
  g.computeVertexNormals();return g;
}
function trunkTexture(){const [c,x]=T.canvas(256,32);x.fillStyle='#6a4a2c';x.fillRect(0,0,256,32);for(let i=0;i<256;i+=9){x.fillStyle='#3e2a18';x.fillRect(i,0,3,32);x.fillStyle='rgba(255,220,160,.18)';x.fillRect(i+3,0,2,32);}return T.toTexture(c,{repeat:true});}

// Poisson benzeri seçim: aday pikseller karıştırılır, yarıçapa göre çakışmayanlar alınır
function scatter(cands,r,radius,cell=24){const hash=new Map(),out=[];for(let i=cands.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[cands[i],cands[j]]=[cands[j],cands[i]];}
  for(const c of cands){const s=radius(c),cx=Math.floor(c.x/cell),cz=Math.floor(c.z/cell);let ok=true;
    for(let a=-2;a<=2&&ok;a++)for(let b=-2;b<=2&&ok;b++){for(const o of hash.get((cx+a)+','+(cz+b))||[])if(Math.hypot(o.x-c.x,o.z-c.z)<(o.s+s)*.62){ok=false;break;}}
    if(!ok)continue;const e={...c,s};out.push(e);const key=cx+','+cz;if(!hash.has(key))hash.set(key,[]);hash.get(key).push(e);}
  return out;}

// ---------------------------------------------------------------- yapılar
function wallLine(root,line,hAt,L,stoneM,darkM,topM){
  for(let i=0;i<line.length-1;i++){const a=line[i],b=line[i+1],len=Math.hypot(b.x-a.x,b.z-a.z),ang=Math.atan2(b.z-a.z,b.x-a.x),cnt=Math.max(1,Math.round(len/18)),cl=len/cnt;
    for(let k=0;k<cnt;k++){const t=(k+.5)/cnt,cx=a.x+(b.x-a.x)*t,cz=a.z+(b.z-a.z)*t;
      // uç kısımlar kaidenin içine girer; zemin yükseldikçe sur kademelenir
      let gmax=-1;for(const u of [-.5,0,.5])gmax=Math.max(gmax,hAt(cx+Math.cos(ang)*cl*u,cz+Math.sin(ang)*cl*u));
      const top=Math.max(27,gmax+20),bot=-3,h=top-bot,g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=-ang;root.add(g);
      const st=stoneM.clone();st.map=stoneM.map.clone();st.map.repeat.set(cl/40,h/28);st.map.needsUpdate=true;
      const w=new THREE.Mesh(new THREE.BoxGeometry(cl+1.2,h,19),[st,st,topM,topM,st,st]);w.position.y=bot+h/2;g.add(w);
      // dış yüz: dışa doğru hafif şev (payanda)
      const out=Math.sign(cx*Math.sin(ang)*-1+cz*Math.cos(ang))||1;
      const but=new THREE.Mesh(new THREE.BoxGeometry(cl+1.2,h*.55,6),darkM);but.position.set(0,bot+h*.27,out*11.5);but.rotation.x=out*.18;g.add(but);
      // dış kenarda mazgal dişleri, iç kenarda alçak korkuluk
      const nearPad=L.P.some(q=>Math.hypot(cx-q.x,cz-q.z)<PAD_R+cl/2);
      if(!nearPad)for(let m=0;m<Math.max(1,Math.round(cl/9));m++){const mx=-cl/2+(m+.5)*cl/Math.max(1,Math.round(cl/9));const tooth=new THREE.Mesh(new THREE.BoxGeometry(5.5,6.5,4.5),stoneM);tooth.position.set(mx,top+3.2,out*7.4);g.add(tooth);}
      if(!nearPad){const rail=new THREE.Mesh(new THREE.BoxGeometry(cl+1.2,2,2.5),darkM);rail.position.set(0,top+1.2,-out*8.2);g.add(rail);}}}
}
function padTopTexture(){const S=512,[c,x]=T.canvas(S,S),r=T.rng(77);x.fillStyle='#4a463e';x.fillRect(0,0,S,S);
  // taş döşeme: merkez daire + iki halka radyal levha; harç çizgileri koyu, levha kenarları hafif ışıklı
  x.translate(S/2,S/2);const R=[0,70,150,256],CNT=[1,9,16];
  for(let ring=0;ring<3;ring++)for(let k=0;k<CNT[ring];k++){const a0=k/CNT[ring]*Math.PI*2+ring*.2,a1=(k+1)/CNT[ring]*Math.PI*2+ring*.2,t=r(),g=x.createRadialGradient(0,0,R[ring],0,0,R[ring+1]);
    g.addColorStop(0,`rgb(${128+t*30},${122+t*28},${110+t*24})`);g.addColorStop(1,`rgb(${104+t*26},${99+t*24},${88+t*20})`);x.fillStyle=g;
    x.beginPath();x.arc(0,0,R[ring+1]-4,a0+.012,a1-.012);if(R[ring])x.arc(0,0,R[ring]+4,a1-.012,a0+.012,true);else x.lineTo(0,0);x.closePath();x.fill();
    for(let q=0;q<5;q++){const aa=a0+(a1-a0)*r(),rr=R[ring]+(R[ring+1]-R[ring])*r();x.fillStyle=`rgba(${r()<.5?'30,26,20':'230,220,200'},${.08+r()*.1})`;x.beginPath();x.ellipse(Math.cos(aa)*rr,Math.sin(aa)*rr,3+r()*9,2+r()*5,aa,0,7);x.fill();}}
  x.setTransform(1,0,0,1,0,0);T.grain(x,S,S,r,{alpha:.1,count:2600});return T.toTexture(c);}
function pad(root,p,hAt,stoneM,darkM,topTex){
  const g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(PAD_R-1,PAD_R+3,PAD_TOP+4,32),stoneM);body.position.y=PAD_TOP/2-2;g.add(body);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(PAD_R+4,PAD_R+7,10,32),darkM);foot.position.y=Math.max(2,hAt(p.x,p.z)+2);g.add(foot);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(PAD_R+1.5,PAD_R+.5,3,40),darkM);rim.position.y=PAD_TOP-.5;g.add(rim);
  const top=new THREE.Mesh(new THREE.CircleGeometry(PAD_R-1,40),std({map:topTex,color:'#a39e95',roughness:.95}));top.rotation.x=-Math.PI/2;top.position.y=PAD_TOP+1.05;g.add(top);
}
function redBanner(){const W=128,H=256,[c,x]=T.canvas(W,H),r=T.rng(5);const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#5a1210');g.addColorStop(.5,'#a3231c');g.addColorStop(1,'#5a1210');
  x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*.85);x.lineTo(W/2,H);x.lineTo(0,H*.85);x.closePath();x.fill();
  x.strokeStyle='#d4ae83';x.lineWidth=6;x.strokeRect(8,8,W-16,H*.72);x.fillStyle='#e8d7b0';x.beginPath();x.arc(W/2,H*.38,22,0,7);x.fill();x.fillStyle='#5a1210';x.beginPath();x.arc(W/2-7,H*.36,5,0,7);x.arc(W/2+7,H*.36,5,0,7);x.fill();x.fillRect(W/2-9,H*.44,18,5);
  T.grain(x,W,H,r,{alpha:.14,count:400});return T.toTexture(c);}
function brazier(g,x,y,z){const bowl=new THREE.Mesh(new THREE.CylinderGeometry(3.2,1.8,3,10),std({color:'#2a2622',metalness:.5,roughness:.5}));bowl.position.set(x,y+1.5,z);g.add(bowl);
  const f=new THREE.Mesh(new THREE.ConeGeometry(2.8,7,8),glow('#ffa030',3.6));f.position.set(x,y+6,z);g.add(f);const c=new THREE.Mesh(new THREE.SphereGeometry(1.8,8,6),glow('#fff0b0',4));c.position.set(x,y+4,z);g.add(c);}
function crown(g,x,y,z,r,m,cnt=10){for(let k=0;k<cnt;k++){const a=k/cnt*Math.PI*2,t=new THREE.Mesh(new THREE.BoxGeometry(r*.42,5,3.5),m);t.position.set(x+Math.sin(a)*r,y+2.5,z+Math.cos(a)*r);t.rotation.y=a;g.add(t);}}
function roundTower(g,x,z,y0,h,r,stoneM,darkM,fire=true){const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r+2,h,24),stoneM);t.position.set(x,y0+h/2,z);g.add(t);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(r+1.6,r+1.6,3,24),darkM);band.position.set(x,y0+h-1,z);g.add(band);crown(g,x,y0+h,z,r+.8,stoneM,12);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(r,20),darkM);fl.rotation.x=-Math.PI/2;fl.position.set(x,y0+h+.6,z);g.add(fl);if(fire)brazier(g,x,y0+h+.6,z);}
function gableRoof(w,d,h,m){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,h);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);return new THREE.Mesh(geo,m);}
function keep(root,L,hAt,stoneM,darkM,roofM,plankM){
  const K=L.KEEP,g0=Math.max(hAt(K.x,K.z),hAt(K.x,K.z+40)),g=new THREE.Group();g.position.set(K.x,0,K.z);root.add(g);
  const plat=g0+6;
  const yard=new THREE.Mesh(new THREE.BoxGeometry(128,plat+6,96),darkM);yard.position.set(0,(plat-6)/2,0);g.add(yard);
  // ana burç: yüksek taş gövde, mazgallı tepe, üstünde ahşap beşik çatılı köşk
  const kh=64,body=new THREE.Mesh(new THREE.BoxGeometry(56,kh,40),stoneM);body.position.set(0,plat+kh/2,-8);g.add(body);
  const band=new THREE.Mesh(new THREE.BoxGeometry(60,3,44),darkM);band.position.set(0,plat+kh-1,-8);g.add(band);
  for(let k=0;k<9;k++){const t=(k+.5)/9-.5;for(const zz of [12.5,-28.5]){const m=new THREE.Mesh(new THREE.BoxGeometry(4.5,5,3.5),stoneM);m.position.set(t*58,plat+kh+2.5,zz);g.add(m);}}
  for(let k=0;k<6;k++){const t=(k+.5)/6-.5;for(const xx of [-28.5,28.5]){const m=new THREE.Mesh(new THREE.BoxGeometry(3.5,5,4.5),stoneM);m.position.set(xx,plat+kh+2.5,-8+t*40);g.add(m);}}
  const house=new THREE.Mesh(new THREE.BoxGeometry(28,14,20),plankM);house.position.set(0,plat+kh+7,-10);g.add(house);
  const roof=gableRoof(34,26,14,roofM);roof.position.set(0,plat+kh+14,-10);g.add(roof);
  const win=new THREE.Mesh(new THREE.PlaneGeometry(6,6),glow('#ffc060',2.2));win.position.set(0,plat+kh+7,.2);g.add(win);
  // ön yüz: kemerli kapı, büyük kırmızı sancak, pencereler
  const door=new THREE.Mesh(new THREE.PlaneGeometry(16,22),std({color:'#140d08'}));door.position.set(0,plat+11,12.2);g.add(door);
  const arch=new THREE.Mesh(new THREE.TorusGeometry(9,2.2,6,14,Math.PI),darkM);arch.position.set(0,plat+22,12.6);g.add(arch);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(12,8),glow('#ff9a30',1.2));gl.position.set(0,plat+4,12.3);g.add(gl);
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(22,38),std({map:redBanner(),side:THREE.DoubleSide,transparent:true,alphaTest:.3}));ban.position.set(0,plat+kh-24,12.4);g.add(ban);
  for(const sx of [-19,19]){const w=new THREE.Mesh(new THREE.PlaneGeometry(4,9),glow('#ffb850',1.8));w.position.set(sx,plat+42,12.2);g.add(w);}
  // kuleler ve aralarındaki perdeler
  const T=[[-44,22,50,13],[44,22,50,13],[-46,-34,58,12],[46,-34,58,12]];
  for(const [x,z,h,r] of T)roundTower(g,x,z,plat-4,h,r,stoneM,darkM);
  const curtain=(a,b,h)=>{const len=Math.hypot(b[0]-a[0],b[1]-a[1]),w=new THREE.Mesh(new THREE.BoxGeometry(len,h,10),stoneM);w.position.set((a[0]+b[0])/2,plat-4+h/2,(a[1]+b[1])/2);w.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);g.add(w);
    const cnt=Math.round(len/8);for(let k=0;k<cnt;k++){const t=(k+.5)/cnt,m=new THREE.Mesh(new THREE.BoxGeometry(4,4.5,3),stoneM);m.position.set(a[0]+(b[0]-a[0])*t,plat-4+h+2.2,a[1]+(b[1]-a[1])*t+4);g.add(m);}};
  curtain([-44,22],[-46,-34],34);curtain([44,22],[46,-34],34);curtain([-46,-34],[46,-34],34);curtain([-44,22],[-24,22],26);curtain([24,22],[44,22],26);
  // merdiven başında meşaleli iki küçük kule
  for(const sx of [-17,17])roundTower(g,sx,44,plat-6,18,6,stoneM,darkM);
  // lagüne inen merdiven
  const S=L.STAIRS,steps=14;for(let k=0;k<steps;k++){const t=k/(steps-1),z=S.z0+(S.z1-S.z0)*t-K.z,ground=hAt(0,z+K.z),y=plat*(1-t)+Math.max(1,ground)*t;
    const st=new THREE.Mesh(new THREE.BoxGeometry(22,Math.max(2,y+3),4.2),darkM);st.position.set(0,(y-3)/2,z);g.add(st);}
  for(const sx of [-13,13]){const y1=Math.max(1,hAt(0,S.z1)),rail=new THREE.Mesh(new THREE.BoxGeometry(3,4,Math.hypot(S.z1-S.z0,plat-y1)+4),stoneM);rail.position.set(sx,(plat+y1)/2+2,(S.z0+S.z1)/2-K.z);rail.rotation.x=Math.atan2(plat-y1,S.z1-S.z0);g.add(rail);}
}
function pier(root,a,b,plankM,postM){const len=Math.hypot(b.x-a.x,b.z-a.z),ang=Math.atan2(b.z-a.z,b.x-a.x),g=new THREE.Group();g.position.set(a.x,0,a.z);g.rotation.y=-ang;root.add(g);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(len,1.4,12),plankM);deck.position.set(len/2,3.4,0);g.add(deck);
  for(let k=0;k<=len;k+=13)for(const s of [-5.4,5.4]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.9,1,7,6),postM);p.position.set(k,1.8,s);g.add(p);}
  for(let k=0;k<3;k++){const box=new THREE.Mesh(new THREE.BoxGeometry(4,4,4),plankM);box.position.set(len*.3+k*4.6,6,(k%2?-2:2));box.rotation.y=k*.4;g.add(box);}}

// ---------------------------------------------------------------- ana kurucu
export async function buildFleetIsland3D({src,mask,pads}){
  const M=await readMap(src,mask),L=layout(pads),n=T.noise2(4242),r=T.rng(99),root=new THREE.Group();
  for(const pr of L.PIERS){const len=Math.hypot(pr.dx,pr.dz),dx=pr.dx/len,dz=pr.dz/len;const land=(t)=>M.isLand[gi(pr.z+dz*t)*N+gi(pr.x+dx*t)];let b=0;while(b>-200&&(land(b)||M.dW[gi(pr.z+dz*b)*N+gi(pr.x+dx*b)]<10))b-=2;pr.x+=dx*(b-26);pr.z+=dz*(b-26);let t=0;while(t<300&&!land(t))t+=2;pr.len=t+10;pr.ux=dx;pr.uz=dz;}
  const reefC=[];for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){const k=j*N+i;if(M.reef[k]&&M.dW[k]>5&&M.dW[k]<34&&r()<(M.lagS[k]>.3?.04:.35))reefC.push({x:(i+.5)*U-500,z:(j+.5)*U-500,k});}
  const reefs=scatter(reefC,r,()=>5+r()*6).filter(c=>!L.blocked(c.x,c.z,c.s));
  const Z=zones(M,L,n),H=heights(M,Z,L,n),hAt=(x,z)=>sample(H,x,z);
  // zemin
  const geo=new THREE.PlaneGeometry(1000,1000,320,320);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,hAt(p.getX(i),p.getZ(i)));geo.computeVertexNormals();
  root.add(new THREE.Mesh(geo,std({map:groundTexture(M,Z,n,r),roughness:.97})));
  const water=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),std({map:waterTexture(M,n,reefs),transparent:true,depthWrite:false,roughness:.3,metalness:.05}));water.rotation.x=-Math.PI/2;water.position.y=.25;root.add(water);
  // malzemeler
  const st=paintedStone({seed:41,moss:.6});const stoneM=std({map:st,color:'#fff8ec',roughness:.92});const dk=paintedStone({seed:47,moss:.3});dk.repeat.set(3,1);const darkM=std({map:dk,color:'#d6cfc2',roughness:.95});
  const topTex=paintedStone({seed:53,moss:.1,rows:6,cols:14});topTex.repeat.set(2,.2);const topM=std({map:topTex,color:'#c9c1b2'});
  const plank=paintedPlanks({seed:61});const plankM=std({map:plank,roughness:.85}),postM=std({color:'#3a2616'});
  const roofTex=paintedPlanks({seed:67});roofTex.repeat.set(4,4);const roofM=std({map:roofTex,color:'#9a6a48',roughness:.8});
  for(const line of L.walls)wallLine(root,line,hAt,L,stoneM,darkM,topM);
  const pt=padTopTexture();for(const pp of L.P)pad(root,pp,hAt,stoneM,darkM,pt);
  keep(root,L,hAt,stoneM,darkM,roofM,plankM);
  for(const pr of L.PIERS)pier(root,{x:pr.x+pr.ux*pr.len,z:pr.z+pr.uz*pr.len},{x:pr.x,z:pr.z},plankM,postM);
  // kayalar
  const rockCands=[],vegCands=[],palmCands=[];
  for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){const k=j*N+i,x=(i+.5)*U-500,z=(j+.5)*U-500;if(!M.isLand[k])continue;
    if(L.blocked(x,z))continue;const rz=Z.rock[k],vz=Z.veg[k],sz=Z.sand[k];
    if(rz>.55&&r()<rz)rockCands.push({x,z,k});else if(vz>.5)(sz>.08||r()<.35?palmCands:vegCands).push({x,z,k});else if(sz>.5&&vz>.12&&r()<.3)palmCands.push({x,z,k});}
  const rocks=scatter(rockCands,r,c=>9+r()*10+(M.dO[c.k]>60?8:0)).filter(c=>!L.blocked(c.x,c.z,c.s*.9));
  const VAR=10,rockGeos=Array.from({length:VAR},(_,i)=>rockGeometry(i*37+5,n)),rockM=std({vertexColors:true,map:crackTexture(),roughness:.96});
  const buckets=Array.from({length:VAR},()=>[]);rocks.forEach((c,i)=>buckets[i%VAR].push(c));
  const o=new THREE.Object3D(),tint=new THREE.Color();
  buckets.forEach((list,v)=>{const im=new THREE.InstancedMesh(rockGeos[v],rockM,list.length);list.forEach((c,i)=>{const s=c.s,h=s*(.8+r()*.8);o.position.set(c.x,hAt(c.x,c.z)-1.5,c.z);o.rotation.set(0,r()*6.28,0);o.scale.set(s,h,s*(.8+r()*.4));o.updateMatrix();im.setMatrixAt(i,o.matrix);tint.setHSL(.58,.03,.5+r()*.1).multiplyScalar(1.75);im.setColorAt(i,tint);});root.add(im);});
  // kale tepesinin ardındaki sarp kayalık ve kıyı önü kaya adacıkları
  const crag=(x,z,s,h,v)=>{const m=new THREE.Mesh(rockGeos[v%VAR],rockM);m.position.set(x,hAt(x,z)-2,z);m.rotation.y=r()*6;m.scale.set(s,h,s*.9);root.add(m);return m;};
  for(const [x,z,s,h] of [[-70,-372,34,62],[-20,-392,40,84],[38,-386,36,74],[88,-366,30,56],[-110,-350,26,40],[125,-345,24,38],[0,-410,30,50]])crag(L.KEEP.x+x,z,s,h,Math.floor(r()*VAR));
  for(const c of reefs){const m=crag(c.x,c.z,c.s,c.s*(1+r()*1.1),Math.floor(r()*VAR));m.position.y=-2;}
  // kanal kapısı: iki kapı kaidesinin kanala bakan yüzünde açık ahşap kanatlar
  for(const [pi,side] of [[3,1],[4,-1]]){const q=L.P[pi],gx=q.x+side*(PAD_R-4),door=new THREE.Mesh(new THREE.BoxGeometry(3,26,26),plankM);door.position.set(gx+side*8,13,q.z-18);door.rotation.y=side*.5;root.add(door);
    for(const yy of [6,20]){const band=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.6,26),std({color:'#23201c',metalness:.6,roughness:.5}));band.position.set(gx+side*8,yy,q.z-18);band.rotation.y=side*.5;root.add(band);}}
  // iskele başlarında fıçı ve sandıklar
  const barrelM=std({map:paintedPlanks({seed:71}),color:'#c89868'});
  for(const pr of L.PIERS){const bx=pr.x+pr.ux*(pr.len-4),bz=pr.z+pr.uz*(pr.len-4);for(let k=0;k<4;k++){const ox=(r()-.5)*16,oz=(r()-.5)*16,y=hAt(bx+ox,bz+oz);if(y<1)continue;
    const b=k%2?new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,6,10),barrelM):new THREE.Mesh(new THREE.BoxGeometry(5,5,5),plankM);b.position.set(bx+ox,y+2.8,bz+oz);b.rotation.y=r()*3;root.add(b);}}
  // orman: yuvarlak taçlar
  const bushes=scatter(vegCands.concat(palmCands).filter(c=>n(c.x*.03+50,c.z*.03,2)<.22),r,()=>5+r()*4).filter(c=>!L.blocked(c.x,c.z,c.s*.6));const bushGeo=new THREE.IcosahedronGeometry(1,2);{const bp=bushGeo.attributes.position,v=new THREE.Vector3();for(let i=0;i<bp.count;i++){v.fromBufferAttribute(bp,i);v.multiplyScalar(1+n(v.x*2.4,v.y*2.4+v.z*1.7,2)*.3);bp.setXYZ(i,v.x,v.y,v.z);}bushGeo.computeVertexNormals();}
  const leafSpeck=(()=>{const [c,x]=T.canvas(128,128),rr=T.rng(3);x.fillStyle='#8a9a78';x.fillRect(0,0,128,128);for(let k=0;k<420;k++){x.fillStyle=`rgba(${rr()<.5?'20,40,10':'230,250,190'},${.15+rr()*.3})`;x.beginPath();x.ellipse(rr()*128,rr()*128,2+rr()*4,1+rr()*2,rr()*3,0,7);x.fill();}return T.toTexture(c,{repeat:true});})();
  const bushM=std({map:leafSpeck,roughness:.9}),bim=new THREE.InstancedMesh(bushGeo,bushM,bushes.length),PAL=['#4a552b','#566233','#636e38','#3e4726','#6c733c','#5a5e30'];
  bushes.forEach((c,i)=>{const s=c.s;o.position.set(c.x,hAt(c.x,c.z)+s*.35,c.z);o.rotation.set(0,r()*6,0);o.scale.set(s,s*.8,s);o.updateMatrix();bim.setMatrixAt(i,o.matrix);bim.setColorAt(i,tint.set(PAL[Math.floor(r()*PAL.length)]));});root.add(bim);
  // palmiyeler
  const palms=scatter(palmCands.concat(vegCands.filter(()=>r()<.3)),r,()=>11+r()*6);
  const trunks=Array.from({length:6},(_,v)=>{const rr=T.rng(v+11),bend=.25+rr()*.35,pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(new THREE.Vector3(bend*t*t,t,0));}return{geo:new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,.045,6),top:pts[6]};});
  const trunkM=std({map:trunkTexture(),roughness:.9}),frond=frondGeometry(),frondM=std({map:leafTexture(8),side:THREE.DoubleSide,alphaTest:.45,transparent:false,roughness:.85});
  const FR=8,fim=new THREE.InstancedMesh(frond,frondM,palms.length*FR),tb=trunks.map(()=>[]);palms.forEach((c,i)=>tb[i%6].push(c));
  let fi=0;const q=new THREE.Quaternion(),e=new THREE.Euler(),m4=new THREE.Matrix4(),top=new THREE.Vector3();
  tb.forEach((list,v)=>{const im=new THREE.InstancedMesh(trunks[v].geo,trunkM,list.length);list.forEach((c,i)=>{const h=16+r()*12,ry=r()*6.28;o.position.set(c.x,hAt(c.x,c.z)-.5,c.z);o.rotation.set(0,ry,0);o.scale.set(h,h,h);o.updateMatrix();im.setMatrixAt(i,o.matrix);
      top.copy(trunks[v].top).applyMatrix4(o.matrix);const fl=7+r()*3;
      for(let k=0;k<FR;k++){e.set(0,ry+k/FR*Math.PI*2+r()*.3,(r()-.3)*.5,'YXZ');q.setFromEuler(e);m4.compose(top,q,new THREE.Vector3(fl*1.6,fl,fl*1.3));fim.setMatrixAt(fi,m4);fim.setColorAt(fi,tint.setHSL(.16+r()*.06,.16+r()*.1,.4+r()*.14).multiplyScalar(1.45));fi++;}});root.add(im);});
  fim.count=fi;root.add(fim);
  root.scale.z=1/Math.sin(ISLAND3D_ELEVATION*Math.PI/180);root.userData.waterline=0;
  root.userData.stats={rocks:rocks.length,bushes:bushes.length,palms:palms.length};
  return root;
}

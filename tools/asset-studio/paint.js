// Yedi Deniz Korsan Oyunu — 2B raster boyamalar: tekrarlanan deniz dokusu.
import {canvas,rng,grain,blotches,noise2} from './textures.js';

// 512 px, dört kenarı kesintisiz birleşen deniz ışıltısı. Oyunda deniz renginin üstüne biner.
export function paintSeaTile(){
  const W=512,[c,x]=canvas(W,W),img=x.createImageData(W,W),d=img.data,TAU=Math.PI*2;
  const waves=[[3,1,.2],[-2,3,1.4],[5,-2,2.2],[1,4,.7],[-4,-3,3.1],[6,5,4.2],[-7,2,5.1]];
  for(let py=0;py<W;py++)for(let px=0;px<W;px++){
    const u=px/W,v=py/W;let s=0;for(const [kx,ky,ph] of waves)s+=Math.sin(TAU*(kx*u+ky*v)+ph);
    let s2=0;for(const [kx,ky,ph] of waves)s2+=Math.sin(TAU*(ky*u-kx*v)*2+ph*1.7);
    const caustic=Math.pow(1-Math.min(1,Math.abs(s)/1.4),6)*.55+Math.pow(1-Math.min(1,Math.abs(s2)/1.6),8)*.3;
    const i=(py*W+px)*4;d[i]=215;d[i+1]=250;d[i+2]=245;d[i+3]=Math.round(Math.min(1,caustic)*120);
  }
  x.putImageData(img,0,0);
  // Tekrarlı köpük çizgileri (kenarlardan taşanlar karşı kenara sarılır)
  const r=rng(4242);
  for(let i=0;i<46;i++){const cx=r()*W,cy=r()*W,rad=18+r()*46,a0=r()*TAU,len=.6+r()*1.2;
    for(const ox of [-W,0,W])for(const oy of [-W,0,W]){x.strokeStyle=`rgba(225,250,245,${.08+r()*.1})`;x.lineWidth=1.2+r()*1.3;x.beginPath();x.arc(cx+ox,cy+oy,rad,a0,a0+len);x.stroke();}}
  return c;
}

// Deniz pırıltısı: su yüzeyinde parlayan inci ve dönen yıldız ışıltıları. 8 kare (4 × 2), 128 px.
export function paintSeaSparkle({frames=8,size=128}={}){
  const cols=4,[sheet,sx]=canvas(size*cols,size*Math.ceil(frames/cols)),TAU=Math.PI*2;
  for(let f=0;f<frames;f++){
    const t=f/frames,[c,x]=canvas(size,size),C=size/2,r=rng(40+f),pulse=.5+.5*Math.sin(t*TAU);
    // Su halkası ve yumuşak ışık
    const glow=x.createRadialGradient(C,C+6,2,C,C+6,C*.95);glow.addColorStop(0,`rgba(210,255,248,${.55+pulse*.2})`);glow.addColorStop(.35,'rgba(120,230,230,.28)');glow.addColorStop(1,'rgba(60,160,170,0)');x.fillStyle=glow;x.fillRect(0,0,size,size);
    for(let k=0;k<2;k++){const rr=(t+k*.5)%1;x.strokeStyle=`rgba(225,255,250,${(1-rr)*.55})`;x.lineWidth=2;x.beginPath();x.ellipse(C,C+10,10+rr*40,(10+rr*40)*.42,0,0,TAU);x.stroke();}
    // İnci: gölge, küre, iç yansıma
    x.fillStyle='rgba(10,40,48,.35)';x.beginPath();x.ellipse(C+2,C+12,14,5,0,0,TAU);x.fill();
    const pearl=x.createRadialGradient(C-5,C-4,1,C,C+2,14);pearl.addColorStop(0,'#ffffff');pearl.addColorStop(.35,'#f4ecf4');pearl.addColorStop(.75,'#cdbfd6');pearl.addColorStop(1,'#8f86a6');x.fillStyle=pearl;x.beginPath();x.arc(C,C+2,13,0,TAU);x.fill();
    const irid=x.createLinearGradient(C-13,C-10,C+13,C+14);irid.addColorStop(0,'rgba(255,190,230,.0)');irid.addColorStop(.5,'rgba(170,230,255,.35)');irid.addColorStop(1,'rgba(255,230,170,.25)');x.fillStyle=irid;x.beginPath();x.arc(C,C+2,13,0,TAU);x.fill();
    x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.ellipse(C-5,C-4,4,2.6,-.6,0,TAU);x.fill();
    // Dönen dört köşeli yıldız ışıltıları
    const star=(px,py,len,rot,a)=>{x.save();x.translate(px,py);x.rotate(rot);x.globalAlpha=a;const g=x.createRadialGradient(0,0,0,0,0,len);g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#e8fffc');g.addColorStop(1,'rgba(200,255,250,0)');x.fillStyle=g;
      for(let k=0;k<4;k++){x.rotate(TAU/4);x.beginPath();x.moveTo(0,-len);x.quadraticCurveTo(1.6,-1.6,len*.16,0);x.quadraticCurveTo(1.6,1.6,0,len);x.quadraticCurveTo(-1.6,1.6,-len*.16,0);x.quadraticCurveTo(-1.6,-1.6,0,-len);x.fill();}x.restore();};
    star(C+6,C-8,26+pulse*14,t*Math.PI/2,.95);
    for(let k=0;k<3;k++){const ph=(t+k/3)%1,a=Math.sin(ph*Math.PI);star(C+Math.cos(k*2.1+1)*30,C+Math.sin(k*2.1+1)*20-4,6+a*10,ph*2,a*.9);}
    for(let k=0;k<10;k++){x.fillStyle=`rgba(255,255,255,${r()*.8*pulse+.1})`;x.beginPath();x.arc(C+(r()-.5)*70,C+(r()-.5)*40+6,.8+r()*1.4,0,TAU);x.fill();}
    sx.drawImage(c,(f%cols)*size,Math.floor(f/cols)*size);
  }
  return sheet;
}

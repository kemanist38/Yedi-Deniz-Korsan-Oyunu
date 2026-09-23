// Kara Yelken — 2B raster boyamalar: tekrarlanan deniz dokusu ve parşömen dünya haritası.
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

// Dünya haritası: 1200×760 parşömen. Düğüm konumları src/world.ts içindeki chart değerleriyle aynıdır.
export const CHART_NODES={haven:[.17,.68],shadows:[.4,.4],crimson:[.64,.64],storm:[.84,.3]};
const CHART_ROUTES=[['haven','shadows'],['shadows','crimson'],['crimson','storm']];
const WASH={haven:'#3f8f7a',shadows:'#2c5f6a',crimson:'#9a3a2a',storm:'#4a4468'};
export function paintWorldChart(){
  const W=1200,H=760,[c,x]=canvas(W,H),r=rng(777),n=noise2(99);
  // Parşömen
  const img=x.createImageData(W,H),d=img.data;
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const t=n(px*.006,py*.006,5),t2=n(px*.03+9,py*.03,3);const k=.88+t*.12+t2*.05;const i=(py*W+px)*4;d[i]=228*k;d[i+1]=208*k;d[i+2]=165*k;d[i+3]=255;}
  x.putImageData(img,0,0);
  grain(x,W,H,r,{alpha:.08,count:5000,light:'#fff5dc',dark:'#6b4c2a'});
  blotches(x,W,H,r,{alpha:.08,count:90,colors:['#8a6a3e','#6b4c2a']});
  // Bölge boyaları
  for(const [id,[u,v]] of Object.entries(CHART_NODES)){const g=x.createRadialGradient(u*W,v*H,10,u*W,v*H,190);g.addColorStop(0,WASH[id]+'88');g.addColorStop(1,WASH[id]+'00');x.fillStyle=g;x.fillRect(0,0,W,H);}
  // Enlem boylam
  x.strokeStyle='#6b4c2a33';x.lineWidth=1;for(let gx=60;gx<W;gx+=120){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,H);x.stroke();}for(let gy=40;gy<H;gy+=120){x.beginPath();x.moveTo(0,gy);x.lineTo(W,gy);x.stroke();}
  // Dalga işaretleri
  x.strokeStyle='#5b4a3a55';x.lineWidth=1.6;for(let i=0;i<70;i++){const px=r()*W,py=r()*H;x.beginPath();x.arc(px,py,7,Math.PI*1.1,Math.PI*1.9);x.arc(px+13,py,7,Math.PI*1.1,Math.PI*1.9);x.stroke();}
  // Ada kıyı çizimleri
  for(const [,[u,v]] of Object.entries(CHART_NODES)){for(let k=0;k<4;k++){const a=r()*Math.PI*2,dd=90+r()*60,cx=u*W+Math.cos(a)*dd,cy=v*H+Math.sin(a)*dd*.7,rad=12+r()*22;
    x.fillStyle='#b99b64aa';x.strokeStyle='#4a3522aa';x.lineWidth=1.5;x.beginPath();for(let s=0;s<=24;s++){const b=s/24*Math.PI*2,rr=rad*(1+.25*n(Math.cos(b)*2+cx,Math.sin(b)*2+cy,2));const X=cx+Math.cos(b)*rr,Y=cy+Math.sin(b)*rr*.75;s?x.lineTo(X,Y):x.moveTo(X,Y);}x.closePath();x.fill();x.stroke();}}
  // Rotalar
  x.setLineDash([10,9]);x.lineWidth=3;x.strokeStyle='#7a2a1ecc';
  for(const [a,b] of CHART_ROUTES){const [u1,v1]=CHART_NODES[a],[u2,v2]=CHART_NODES[b];const mx=(u1+u2)/2*W,my=(v1+v2)/2*H-50;x.beginPath();x.moveTo(u1*W,v1*H);x.quadraticCurveTo(mx,my,u2*W,v2*H);x.stroke();}
  x.setLineDash([]);
  // Pusula gülü
  const cx=W*.1,cy=H*.2;x.save();x.translate(cx,cy);x.strokeStyle='#4a3522';x.lineWidth=2;x.beginPath();x.arc(0,0,58,0,7);x.stroke();x.beginPath();x.arc(0,0,48,0,7);x.stroke();
  for(let i=0;i<16;i++){const a=i*Math.PI/8,len=i%4===0?70:i%2===0?46:34,w=i%4===0?10:6;x.save();x.rotate(a);x.fillStyle=i%2?'#c9a35e':'#7a2a1e';x.beginPath();x.moveTo(0,-len);x.lineTo(w,0);x.lineTo(0,w*.4);x.lineTo(-w,0);x.closePath();x.fill();x.stroke();x.restore();}
  x.fillStyle='#4a3522';x.font='700 18px serif';x.textAlign='center';x.fillText('K',0,-76);x.restore();
  // Deniz canavarı süsü (fırtına bölgesinin yanında)
  x.save();x.translate(W*.9,H*.62);x.strokeStyle='#4a3522cc';x.fillStyle='#6a5a7a55';x.lineWidth=2.5;
  for(let k=0;k<3;k++){x.beginPath();x.arc(k*34-34,0,15,Math.PI,0);x.fill();x.stroke();}x.beginPath();x.moveTo(-64,0);x.quadraticCurveTo(-84,-26,-70,-36);x.stroke();x.restore();
  // Yanık kenarlar
  const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.62);v.addColorStop(0,'#0000');v.addColorStop(.75,'#5a3a1a55');v.addColorStop(1,'#2a1606ee');x.fillStyle=v;x.fillRect(0,0,W,H);
  x.globalCompositeOperation='destination-out';for(let i=0;i<260;i++){const t=r(),side=Math.floor(r()*4),p=side%2?t*H:t*W,rad=4+r()*12;const X=side===0?p:side===1?W:side===2?p:0,Y=side===0?0:side===1?p:side===2?H:p;x.beginPath();x.arc(X,Y,rad,0,7);x.fill();}
  x.globalCompositeOperation='source-over';
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

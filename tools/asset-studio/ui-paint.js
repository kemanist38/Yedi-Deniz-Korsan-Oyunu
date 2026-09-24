// Kara Yelken — arayüz raster boyamaları: dünya paftası parşömen tomarı (Seafight tarzı).
import {canvas,rng,grain,noise2} from './textures.js';

// 480 × 640: üstte ve altta kıvrık parşömen rulosu, iki yanda kırmızı-beyaz çizgili direk, ortada lekeli parşömen
export function paintWorldScroll(){
  const W=480,H=640,[c,x]=canvas(W,H),r=rng(314),n=noise2(27);
  // parşömen gövdesi
  const bx=34,by=52,bw=W-68,bh=H-104,img=x.createImageData(bw,bh),d=img.data;
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const t=n(i*.012,j*.012,5),t2=n(i*.05+7,j*.05,3),edge=Math.min(i,bw-1-i,j,bh-1-j),k=.86+t*.12+t2*.04-Math.max(0,1-edge/26)*.22,o=(j*bw+i)*4;
    d[o]=222*k;d[o+1]=196*k;d[o+2]=146*k;d[o+3]=255;}
  x.putImageData(img,bx,by);
  for(let k=0;k<40;k++){const px=bx+r()*bw,py=by+r()*bh,rr=6+r()*30,g=x.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,`rgba(120,80,30,${.05+r()*.08})`);g.addColorStop(1,'rgba(120,80,30,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,7);x.fill();}
  x.save();x.beginPath();x.rect(bx,by,bw,bh);x.clip();grain(x,W,H,r,{alpha:.06,count:5000,light:'#fff2d0',dark:'#3a2410'});x.restore();
  // yan direkler: kırmızı-beyaz çapraz çizgi, silindir gölgesi
  for(const px of [bx-8,bx+bw-6]){x.save();x.beginPath();x.rect(px,by-6,14,bh+12);x.clip();
    for(let y=by-40;y<by+bh+40;y+=16){x.fillStyle='#b3261e';x.beginPath();x.moveTo(px,y);x.lineTo(px+14,y-8);x.lineTo(px+14,y);x.lineTo(px,y+8);x.closePath();x.fill();x.fillStyle='#f3ead6';x.beginPath();x.moveTo(px,y+8);x.lineTo(px+14,y);x.lineTo(px+14,y+8);x.lineTo(px,y+16);x.closePath();x.fill();}
    const g=x.createLinearGradient(px,0,px+14,0);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(.4,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(0,0,0,.5)');x.fillStyle=g;x.fillRect(px,by-6,14,bh+12);x.restore();}
  // üst ve alt rulolar: kıvrık parşömen silindiri, uçlarda sarmal
  const roll=(y,flip)=>{const x0=14,x1=W-14,h=44;const g=x.createLinearGradient(0,y,0,y+h);
    const stops=flip?[[0,'#6a4a22'],[.25,'#b8955e'],[.55,'#ecd7a6'],[.8,'#c9a56c'],[1,'#7a5628']]:[[0,'#7a5628'],[.2,'#c9a56c'],[.45,'#ecd7a6'],[.75,'#b8955e'],[1,'#6a4a22']];
    stops.forEach(([o,cl])=>g.addColorStop(o,cl));x.fillStyle=g;x.beginPath();x.roundRect(x0,y,x1-x0,h,h/2);x.fill();
    for(let k=0;k<3;k++){x.strokeStyle=`rgba(90,60,25,${.35-k*.08})`;x.lineWidth=1.2;x.beginPath();x.moveTo(x0+20,y+h*(.3+k*.18));x.lineTo(x1-20,y+h*(.3+k*.18));x.stroke();}
    for(const cx of [x0+h/2,x1-h/2]){const s=x.createRadialGradient(cx-4,y+h/2-4,2,cx,y+h/2,h/2);s.addColorStop(0,'#f4e2b8');s.addColorStop(.6,'#c49a5a');s.addColorStop(1,'#5a3a18');x.fillStyle=s;x.beginPath();x.arc(cx,y+h/2,h/2,0,7);x.fill();
      x.strokeStyle='rgba(80,50,20,.7)';x.lineWidth=1.5;x.beginPath();for(let a=0;a<Math.PI*5;a+=.15){const rr=2+a*1.25;x.lineTo(cx+Math.cos(a)*rr,y+h/2+Math.sin(a)*rr);}x.stroke();}
    x.fillStyle='rgba(0,0,0,.25)';x.fillRect(x0+22,flip?y-4:y+h,x1-x0-44,4);};
  roll(10,false);roll(H-54,true);
  return c;
}

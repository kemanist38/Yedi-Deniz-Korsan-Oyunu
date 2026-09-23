// Filo adası görselinden (fleet-base-v3) 8 sur burcunu keser ve adayı kulesiz hale getirir:
//  - public/assets/fleet-bastions-v1.webp : 8 burç sprite'ı (görseldeki kulelerin birebir aynısı, saydam arka plan)
//  - public/assets/fleet-base-v4.webp     : burçların yeri çevre dokusuyla doldurulmuş, taş dikme kaideli ada
//  - src/fleetBastions.ts                 : sprite kareleri ve kuleye göre çizim ofsetleri (dünya birimi)
// Kullanım: node fleet-bastions.mjs
import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const src='data:image/webp;base64,'+fs.readFileSync(path.join(root,'public/assets/fleet-base-v3.b64'),'utf8').trim();
// Kule konumu (src/campaign.ts FLEET.towers) ve görsel ölçüleri: disk merkezi ofseti (dx,dy) ve gövde tabanı (base), 1024 px ölçeğinde.
const TOWERS=[[-244,-247,2,-21,46],[-367,-113,0,-21,40],[-322,42,3,-18,58],[-100,164,3,-23,68],[100,164,-3,-20,66],[322,42,0,-12,56],[367,-113,2,-18,50],[244,-247,3,-20,44]];
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'});const p=await b.newPage();
const out=await p.evaluate(async([src,TOWERS])=>{
  const im=new Image();im.src=src;await im.decode();const W=im.width,K=W/1000,cv=document.createElement('canvas');cv.width=cv.height=W;const cx0=cv.getContext('2d');cx0.drawImage(im,0,0);
  const img=cx0.getImageData(0,0,W,W),D=img.data,orig=new Uint8ClampedArray(D);
  const RX=42,RY=38,HW=41,CELL_W=104,CELL_H=150;
  // Kule maskesi (yumuşak kenarlı): üst disk elipsi + gövde + taban elipsi
  const maskAt=(t,x,y)=>{const [wx,wy,dx,dy,base]=t,cx=(wx+500)*K+dx,cy=(wy+500)*K+dy,by=(wy+500)*K+base;
    const e1=((x-cx)/RX)**2+((y-cy)/RY)**2,inBody=Math.abs(x-cx)<=HW&&y>=cy&&y<=by,e2=((x-cx)/HW)**2+((y-by)/(HW*.42))**2;
    const d=Math.min(e1,inBody?0:9,e2);return d<=1?1:d<1.18?(1.18-d)/.18:0;};
  // Kenar bölgesinde (disk halkası ve gövde yanları) su, kum ve yaprak renklerini ayıkla
  const edgeAt=(t,x,y)=>{const [wx,wy,dx,dy]=t,cx=(wx+500)*K+dx,cy=(wy+500)*K+dy,e=((x-cx)/RX)**2+((y-cy)/RY)**2;return y<cy?e>.62:Math.abs(x-cx)>HW*.8;};
  const background=(r,g,bl)=>(g>r+12&&g>bl+4)||(bl-r>25&&g-r>15)||(r>165&&g>145&&bl>105);
  // 1) Burç sprite'ları
  const atlas=document.createElement('canvas');atlas.width=CELL_W*4;atlas.height=CELL_H*2;const ax=atlas.getContext('2d'),meta=[];
  TOWERS.forEach((t,k)=>{const [wx,wy,dx,dy]=t,cx=(wx+500)*K+dx,cy=(wy+500)*K+dy,x0=Math.round(cx-CELL_W/2),y0=Math.round(cy-RY-6),cell=ax.createImageData(CELL_W,CELL_H);
    for(let y=0;y<CELL_H;y++)for(let x=0;x<CELL_W;x++){const sx=x0+x,sy=y0+y;if(sx<0||sy<0||sx>=W||sy>=W)continue;const m=maskAt(t,sx+.5,sy+.5);if(!m)continue;const i=(sy*W+sx)*4,o=(y*CELL_W+x)*4;if(edgeAt(t,sx+.5,sy+.5)&&background(orig[i],orig[i+1],orig[i+2]))continue;cell.data[o]=orig[i];cell.data[o+1]=orig[i+1];cell.data[o+2]=orig[i+2];cell.data[o+3]=Math.round(orig[i+3]*m);}
    ax.putImageData(cell,(k%4)*CELL_W,Math.floor(k/4)*CELL_H);
    // Kuleye göre çizim ofseti (dünya birimi): karenin sol-üst köşesi − kule konumu
    meta.push({ox:+(x0/K-500-wx).toFixed(2),oy:+(y0/K-500-wy).toFixed(2)});});
  // 2) Delik (tüm kulelerin maskesi, 3 px genişletilmiş)
  const hole=new Uint8Array(W*W);TOWERS.forEach(t=>{const [wx,wy,dx,dy,base]=t,cx=(wx+500)*K+dx,cy=(wy+500)*K+dy;for(let y=Math.floor(cy-RY-8);y<cy+base+HW;y++)for(let x=Math.floor(cx-RX-8);x<cx+RX+8;x++){if(x<0||y<0||x>=W||y>=W)continue;let m=0;for(const [ox,oy] of [[0,0],[3,0],[-3,0],[0,3],[0,-3]])m=Math.max(m,maskAt(t,x+ox+.5,y+oy+.5));if(m>0)hole[y*W+x]=1;}});
  const forbidden=new Uint8Array(W*W);for(let y=0;y<W;y++)for(let x=0;x<W;x++){if(!hole[y*W+x])continue;for(let dy=-10;dy<=10;dy+=2)for(let dx=-10;dx<=10;dx+=2){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<W&&ny<W)forbidden[ny*W+nx]=1;}}
  // 3) Doku yamama: kenardan içe doğru 8 px bloklar, 4 px örtüşme; kaynak blok komşu bölgeden en iyi eşleşme
  const B=8,O=4,S=B+2*O;
  TOWERS.forEach((t,k)=>{const [wx,wy,dx,dy,base]=t,cx=Math.round((wx+500)*K+dx),cy=Math.round((wy+500)*K+dy);
    const bx0=cx-RX-12,by0=cy-RY-12,bx1=cx+RX+12,by1=cy+base+HW*.5+6;let guard=0;
    for(;;){if(++guard>4000)break;let best=null,bestKnown=-1;
      for(let by=by0;by<by1;by+=B)for(let bx=bx0;bx<bx1;bx+=B){let unk=0,known=0;for(let y=by-O;y<by+B+O;y++)for(let x=bx-O;x<bx+B+O;x++){if(x<0||y<0||x>=W||y>=W)continue;const h=hole[y*W+x];if(h&&x>=bx&&x<bx+B&&y>=by&&y<by+B)unk++;else if(!h)known++;}
        if(unk>0&&known>bestKnown){bestKnown=known;best=[bx,by];}}
      if(!best)break;const [bx,by]=best;let bestCost=Infinity,bs=null;
      for(let sy=by-150;sy<=by+150;sy+=3)for(let sx=bx-170;sx<=bx+170;sx+=3){if(sx-O<0||sy-O<0||sx+B+O>=W||sy+B+O>=W)continue;
        if(forbidden[(sy+B/2)*W+sx+B/2]||forbidden[(sy-O)*W+sx-O]||forbidden[(sy+B+O-1)*W+sx+B+O-1]||forbidden[(sy-O)*W+sx+B+O-1]||forbidden[(sy+B+O-1)*W+sx-O])continue;
        if(D[((sy+B/2)*W+sx+B/2)*4+3]<200)continue;
        let cost=0,n=0;for(let y=-O;y<B+O&&cost<bestCost*1.02*Math.max(n,1)/Math.max(n,1)+1e12;y+=1)for(let x=-O;x<B+O;x+=1){const tx=bx+x,ty=by+y;if(tx<0||ty<0||tx>=W||ty>=W||hole[ty*W+tx])continue;const i=(ty*W+tx)*4,j=((sy+y)*W+sx+x)*4;const r=D[i]-D[j],g=D[i+1]-D[j+1],bb=D[i+2]-D[j+2];cost+=r*r+g*g+bb*bb;n++;}
        cost=n?cost/n:Infinity;cost+=Math.abs(sy-by)*.6;if(cost<bestCost){bestCost=cost;bs=[sx,sy];}}
      if(!bs){for(let y=by;y<by+B;y++)for(let x=bx;x<bx+B;x++)if(x>=0&&y>=0&&x<W&&y<W)hole[y*W+x]=0;continue;}
      for(let y=0;y<B;y++)for(let x=0;x<B;x++){const tx=bx+x,ty=by+y;if(tx<0||ty<0||tx>=W||ty>=W||!hole[ty*W+tx])continue;const i=(ty*W+tx)*4,j=((bs[1]+y)*W+bs[0]+x)*4;D[i]=D[j];D[i+1]=D[j+1];D[i+2]=D[j+2];D[i+3]=D[j+3];hole[ty*W+tx]=0;}}
  });
  cx0.putImageData(img,0,0);
  // 4) Taş dikme kaidesi: burcun tabanında yuvarlak temel, taş halka ve harç izleri
  TOWERS.forEach((t,k)=>{const [wx,wy,dx,dy,base]=t,cx=(wx+500)*K+dx,cy=(wy+500)*K+dy,gy=cy+Math.min(base,48)*.62;
    const x=cx0;x.save();
    x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(cx+3,gy+6,RX+4,RX*.52,0,0,7);x.fill();
    const side=x.createLinearGradient(0,gy,0,gy+6);side.addColorStop(0,'#5e574e');side.addColorStop(1,'#34302b');x.fillStyle=side;x.beginPath();x.ellipse(cx,gy+5,RX,RX*.48,0,0,Math.PI);x.lineTo(cx-RX,gy);x.ellipse(cx,gy,RX,RX*.48,0,Math.PI,0,true);x.fill();
    const top=x.createRadialGradient(cx-8,gy-6,4,cx,gy,RX);top.addColorStop(0,'#a39a8c');top.addColorStop(.7,'#857c70');top.addColorStop(1,'#625a50');x.fillStyle=top;x.beginPath();x.ellipse(cx,gy,RX,RX*.48,0,0,7);x.fill();
    for(let n=0;n<160;n++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random());x.fillStyle=`rgba(${Math.random()<.5?'40,36,30':'200,190,170'},${.12+Math.random()*.15})`;x.fillRect(cx+Math.cos(a)*RX*r,gy+Math.sin(a)*RX*.48*r,1.6,1.2);}
    x.strokeStyle='rgba(40,34,28,.5)';x.lineWidth=1;for(let r=.35;r<1;r+=.3){x.beginPath();x.ellipse(cx,gy,RX*r,RX*.48*r,0,0,7);x.stroke();}
    for(let a=0;a<12;a++){const an=a/12*Math.PI*2;x.beginPath();x.moveTo(cx+Math.cos(an)*RX*.35,gy+Math.sin(an)*RX*.48*.35);x.lineTo(cx+Math.cos(an)*RX,gy+Math.sin(an)*RX*.48);x.stroke();}
    x.strokeStyle='rgba(216,178,104,.8)';x.setLineDash([4,3]);x.lineWidth=1.6;x.beginPath();x.ellipse(cx,gy,RX*.62,RX*.48*.62,0,0,7);x.stroke();x.setLineDash([]);
    for(let s=0;s<6;s++){const an=s/6*Math.PI*2+.3,px=cx+Math.cos(an)*(RX+2),py=gy+Math.sin(an)*(RX*.48+2);x.fillStyle=['#6a625a','#4c4640','#7a7068'][s%3];x.beginPath();x.ellipse(px,py,3.2,2.2,an,0,7);x.fill();}
    x.restore();});
  const base=cv.toDataURL('image/webp',.92),bast=atlas.toDataURL('image/webp',.95),preview=cv.toDataURL('image/png');
  return{base,bast,preview,meta,cell:[CELL_W,CELL_H],K};
},[src,TOWERS]);
await b.close();
const wr=(f,d)=>fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
wr(path.join(root,'public/assets/fleet-base-v4.webp'),out.base);wr(path.join(root,'public/assets/fleet-bastions-v1.webp'),out.bast);
fs.mkdirSync(path.join(here,'preview'),{recursive:true});wr(path.join(here,'preview/fleet-base-v4.png'),out.preview);
fs.writeFileSync(path.join(root,'src/fleetBastions.ts'),`// Otomatik üretildi: tools/asset-studio/fleet-bastions.mjs — elle düzenlemeyin.
// Filo adası burç (kule) sprite'ları: fleet-bastions-v1.webp, 4 × 2 kare, kare ${out.cell[0]} × ${out.cell[1]} px (1024 px ada ölçeği).
// ofset: karenin sol-üst köşesinin kule konumuna göre dünya birimi farkı; çizim ölçeği ${(1000/1024).toFixed(4)} birim/px.
export const FLEET_BASTIONS={url:'/assets/fleet-bastions-v1.webp',cellW:${out.cell[0]},cellH:${out.cell[1]},scale:${1000/1024},offsets:${JSON.stringify(out.meta)}};
`);
console.log('ok',JSON.stringify(out.meta));

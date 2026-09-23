// Tersane atlasındaki (elite-ships-atlas-v1.b64, 5 × 3) her elit gemiyi komşu parçalar olmadan ayrı, ortalanmış
// 384 px rastere keser: public/assets/elite-<id>-art-v2.webp. Kullanım: node extract-elite-art.mjs
import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),assets=path.resolve(here,'../../public/assets'),outDir=assets;
const ids='phantom,magma,glacial,kraken,ironclad,crimson,atlantean,bone,tempest,plague,sovereign,shadow,jade,ragnarok,void';
const atlas=Buffer.from(fs.readFileSync(path.join(assets,'elite-ships-atlas-v1.b64'),'utf8').trim(),'base64');const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'});const p=await b.newPage();
const res=await p.evaluate(async([d,ids])=>{
  const im=new Image();im.src=d;await im.decode();const W=im.width,H=im.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);
  const px=x.getImageData(0,0,W,H).data,lab=new Int32Array(W*H).fill(-1),comps=[];const cw=W/5,ch=H/3;
  for(let i=0;i<W*H;i++){if(lab[i]>=0||px[i*4+3]<14)continue;const id=comps.length,q=[i];lab[i]=id;let n=0,sx=0,sy=0,x0=W,y0=H,x1=0,y1=0;
    while(q.length){const k=q.pop(),X=k%W,Y=(k-X)/W;n++;sx+=X;sy+=Y;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=X+dx,ny=Y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(lab[j]<0&&px[j*4+3]>=14){lab[j]=id;q.push(j);}}}
    comps.push({n,cx:sx/n,cy:sy/n,x0,y0,x1,y1,cell:Math.min(4,Math.floor(sx/n/cw))+5*Math.min(2,Math.floor(sy/n/ch))});}
  const out=[];const S=384,pad=14;
  for(let cell=0;cell<15;cell++){const cs=comps.map((k,i)=>({...k,i})).filter(k=>k.cell===cell&&k.n>=25);if(!cs.length){out.push(null);continue;}
    const keep=new Set(cs.map(k=>k.i));let x0=W,y0=H,x1=0,y1=0;for(const k of cs){x0=Math.min(x0,k.x0);y0=Math.min(y0,k.y0);x1=Math.max(x1,k.x1);y1=Math.max(y1,k.y1);}
    const bw=x1-x0+1,bh=y1-y0+1,tmp=document.createElement('canvas');tmp.width=bw;tmp.height=bh;const tx=tmp.getContext('2d'),id=tx.createImageData(bw,bh);
    for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++){const j=(y0+yy)*W+x0+xx;if(!keep.has(lab[j]))continue;const o=(yy*bw+xx)*4;for(let t=0;t<4;t++)id.data[o+t]=px[j*4+t];}
    tx.putImageData(id,0,0);const k=Math.min((S-pad*2)/bw,(S-pad*2)/bh),o=document.createElement('canvas');o.width=o.height=S;const ox=o.getContext('2d');ox.imageSmoothingQuality='high';
    ox.drawImage(tmp,(S-bw*k)/2,(S-bh*k)/2,bw*k,bh*k);out.push({webp:o.toDataURL('image/webp',.92),png:o.toDataURL('image/png'),bbox:[x0,y0,bw,bh],parts:cs.length});}
  return out;},['data:image/webp;base64,'+atlas.toString('base64'),ids]);
const names=ids.split(',');res.forEach((r,i)=>{if(!r){console.log(names[i],'EMPTY');return;}fs.writeFileSync(`${outDir}/elite-${names[i]}-art-v2.webp`,Buffer.from(r.webp.split(',')[1],'base64'));console.log(names[i],JSON.stringify(r.bbox),r.parts);});
await b.close();

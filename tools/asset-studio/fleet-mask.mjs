// Filo adası görselinden (public/assets/fleet-base-v3.b64, 1024 px = 1000 dünya birimi) seyir maskesi üretir.
// Deniz (saydam) ve lagün/kanal suyu dışarıdan taşma dolgusuyla işaretlenir; kıyıdan 1 hücre (8 birim) pay bırakılır.
// Çıktı: src/fleetMask.ts (125 × 125 hücre, 8 birim; RLE). Kullanım: node fleet-mask.mjs
import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const d='data:image/webp;base64,'+fs.readFileSync(path.join(root,'public/assets/fleet-base-v3.b64'),'utf8').trim();
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'});const p=await b.newPage();
const N=125,ERODE=1;
const cls=await p.evaluate(async([d,N])=>{const im=new Image();im.src=d;await im.decode();const W=im.width,c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');x.drawImage(im,0,0);const px=x.getImageData(0,0,W,W).data,cell=W/N,out=[];
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let sea=0,water=0;for(let sy=0;sy<3;sy++)for(let sx=0;sx<3;sx++){const X=Math.floor((i+.2+sx*.3)*cell),Y=Math.floor((j+.2+sy*.3)*cell),k=(Y*W+X)*4,R=px[k],G=px[k+1],B=px[k+2],A=px[k+3];if(A<40)sea++;else if(B-R>25&&G-R>15)water++;}
    out.push(sea>=5?0:water>=5?1:2);}return out;},[d,N]);
await b.close();
// Dışarıdan erişilebilen su
const open=new Uint8Array(N*N),q=[];for(let i=0;i<N;i++)for(const k of [i,(N-1)*N+i,i*N,i*N+N-1])if(cls[k]<2&&!open[k]){open[k]=1;q.push(k);}
while(q.length){const k=q.pop(),x=k%N,y=(k-x)/N;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;const j=ny*N+nx;if(!open[j]&&cls[j]<2){open[j]=1;q.push(j);}}}
// Su içindeki 1-4 hücrelik kaya kırıntılarını yok say
const seen=new Uint8Array(N*N);for(let k=0;k<N*N;k++){if(open[k]||seen[k])continue;const comp=[k],st=[k];seen[k]=1;let edge=false;while(st.length){const c=st.pop(),x=c%N,y=(c-x)/N;if(x===0||y===0||x===N-1||y===N-1)edge=true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;const j=ny*N+nx;if(!open[j]&&!seen[j]){seen[j]=1;st.push(j);comp.push(j);}}}if(!edge&&comp.length<=4)comp.forEach(c=>open[c]=1);}
// Kıyı payı
const nav=new Uint8Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let ok=open[y*N+x];for(let dy=-ERODE;dy<=ERODE&&ok;dy++)for(let dx=-ERODE;dx<=ERODE&&ok;dx++){if(dx*dx+dy*dy>ERODE*ERODE+1)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;if(!open[ny*N+nx])ok=0;}nav[y*N+x]=ok;}
// Dış deniz her zaman açık (erozyon kıyı dışını kapatmasın): hücre saydam denizse ve kıyıdan 2 hücre uzaktaysa zaten açık kalır.
// Değerler: 0 kara, 1 açık deniz, 2 lagün/kanal suyu (filo adasının içi)
const val=k=>nav[k]?(cls[k]===1?2:1):0;
let rle='',cur=val(0),run=0;for(let k=0;k<N*N;k++){const v=val(k);if(v===cur)run++;else{rle+=cur+run.toString(36)+',';cur=v;run=1;}}rle+=cur+run.toString(36);
const inside=[...nav].filter((v,k)=>v&&cls[k]===1).length;
fs.writeFileSync(path.join(root,'src/fleetMask.ts'),`// Otomatik üretildi: tools/asset-studio/fleet-mask.mjs — elle düzenlemeyin.
// Filo adası seyir maskesi: ${N} × ${N} hücre, hücre ${1000/N} dünya birimi, ada merkezine göre (-500,-500) köşeden başlar.
// RLE: her parça <değer><36 tabanlı uzunluk>; değer 0 kara, 1 açık deniz, 2 lagün/kanal suyu.
export const FLEET_MASK={n:${N},cell:${1000/N},rle:'${rle}'};
`);
console.log('ok, lagün/kanal seyir hücresi:',inside);

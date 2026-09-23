import {FLEET_BASTIONS} from './fleetBastions';
// Raster sprite sayfaları: NPC gemileri, canavarlar, adalar, filo adaları, sandıklar, mayınlar.
// Görseller tools/asset-studio içindeki 3B modellerden üretilir (npm run render).
export type ChestKind='wood'|'gilded';

const cache=new Map<string,HTMLImageElement>();
function load(src:string){let image=cache.get(src);if(!image){image=new Image();image.decoding='async';image.src=src;cache.set(src,image);}return image;}
const ready=(image:HTMLImageElement)=>image.complete&&image.naturalWidth>0;
export function preload(srcs:string[]){srcs.forEach(load);}
let fleetBaseV3='';
fetch('/assets/fleet-base-v3.b64').then(r=>r.text()).then(data=>{fleetBaseV3=`data:image/webp;base64,${data.trim()}`;load(fleetBaseV3);}).catch(()=>{});

// NPC gemileri: 16 yön, 8 sütun × 2 satır, 192 px kare; kare 0 = kuzey, saat yönünde 22,5°.
// span: karenin kapsadığı dünya birimi. Oyunda 1 birim ≈ 1,23 px.
const SHIP={frame:192,dirs:16,cols:8,anchorX:96,anchorY:108.35,pxPerUnit:1.23};
export const shipDrawSize=(span:number)=>span*SHIP.pxPerUnit;
export const shipLabelOffset=(span:number)=>-Math.round(shipDrawSize(span)*.46);
export function drawNpcShip(ctx:CanvasRenderingContext2D,sprite:string,span:number,x:number,y:number,angle:number,time:number){
  const sheet=load(sprite);if(!ready(sheet))return false;
  const step=Math.PI*2/SHIP.dirs,index=((Math.round(angle/step)%SHIP.dirs)+SHIP.dirs)%SHIP.dirs;
  const size=shipDrawSize(span),k=size/SHIP.frame,bob=Math.sin(time/460+x*.013)*1.4;
  ctx.save();ctx.shadowColor='#000a';ctx.shadowBlur=11;ctx.shadowOffsetY=3;
  ctx.drawImage(sheet,(index%SHIP.cols)*SHIP.frame,Math.floor(index/SHIP.cols)*SHIP.frame,SHIP.frame,SHIP.frame,x-SHIP.anchorX*k,y+bob-SHIP.anchorY*k,size,size);
  ctx.restore();return true;
}

// Canavarlar: 8 karelik döngü, 4 × 2, 256 px kare; geçişli çizilir.
export function drawMonsterSheet(ctx:CanvasRenderingContext2D,def:{sprite:string;span:number;anchorY:number;radius:number},x:number,y:number,phase:number){
  const sheet=load(def.sprite);if(!ready(sheet))return false;
  const F=256,fps=5,t=phase*fps,a=Math.floor(t)%8,b=(a+1)%8,blend=t-Math.floor(t);
  const size=def.span*def.radius/55,k=size/F,dx=x-128*k,dy=y-def.anchorY*k+Math.sin(phase*1.3)*1.5;
  ctx.save();
  ctx.drawImage(sheet,(a%4)*F,Math.floor(a/4)*F,F,F,dx,dy,size,size);
  ctx.globalAlpha=blend;ctx.drawImage(sheet,(b%4)*F,Math.floor(b/4)*F,F,F,dx,dy,size,size);
  ctx.restore();return true;
}

// Hayalet Amiral: 16 yön, 240 px kare.
const BOSS_SHIP={frame:240,dirs:16,cols:8,anchorX:120,anchorY:135.1,size:170};
export const BOSS_LABEL_OFFSET=-76;
export function drawBossSprite(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,time:number){
  const sheet=load('/assets/enemy-ghost-v1.webp');if(!ready(sheet))return false;
  const step=Math.PI*2/BOSS_SHIP.dirs,index=((Math.round(angle/step)%BOSS_SHIP.dirs)+BOSS_SHIP.dirs)%BOSS_SHIP.dirs,k=BOSS_SHIP.size/BOSS_SHIP.frame,bob=Math.sin(time/520)*1.8;
  ctx.save();ctx.shadowColor='#6dffc4';ctx.shadowBlur=18+Math.sin(time/300)*6;
  ctx.drawImage(sheet,(index%BOSS_SHIP.cols)*BOSS_SHIP.frame,Math.floor(index/BOSS_SHIP.cols)*BOSS_SHIP.frame,BOSS_SHIP.frame,BOSS_SHIP.frame,x-BOSS_SHIP.anchorX*k,y+bob-BOSS_SHIP.anchorY*k,BOSS_SHIP.size,BOSS_SHIP.size);
  ctx.restore();return true;
}

// Adalar: görünüm başına 2 varyantlı sayfa (512 px). Çizim boyu = 2.36 × ada yarıçapı.
export function islandSheetUrl(look:string){return`/assets/islands-${look}-v1.webp`;}
export function drawIslandSprite(ctx:CanvasRenderingContext2D,island:{look:string;variant:number;r:number;flip?:boolean},x:number,y:number){
  const sheet=load(islandSheetUrl(island.look));if(!ready(sheet))return false;
  const size=island.r*2.36;ctx.save();ctx.translate(x,y);if(island.flip)ctx.scale(-1,1);
  ctx.drawImage(sheet,island.variant*512,0,512,512,-size/2,-size/2,size,size);ctx.restore();return true;
}

// Filo adası: temaya özgü surlu halka (1024 px = 1000 birim) ve iki sancaklı kule sayfası (256 px = 120 birim).
export const fleetBaseUrl=(theme:string)=>`/assets/fleet-base-${theme}-v2.webp`;
export const fleetTowerUrl=(theme:string)=>`/assets/fleet-towers-${theme}-v2.webp`;
export function drawFleetBase(ctx:CanvasRenderingContext2D,theme:string,x:number,y:number){
  // v4: kuleleri boşaltılmış, taş dikme kaideli ada (tools/asset-studio/fleet-bastions.mjs)
  let sheet=load(FLEET_BASE_V4);if(!ready(sheet))sheet=load(fleetBaseV3||fleetBaseUrl(theme));if(!ready(sheet))return false;
  ctx.drawImage(sheet,x-500,y-500,1000,1000);return true;
}
const FLEET_BASE_V4='/assets/fleet-base-v4.webp';
// Burç kuleleri: ada görselindeki kulelerin birebir aynısı, her kaide için kendi karesi (FLEET_BASTIONS).
export function drawBastion(ctx:CanvasRenderingContext2D,slot:number,x:number,y:number,alpha=1){
  const B=FLEET_BASTIONS,sheet=load(B.url),o=B.offsets[slot];if(!o||!ready(sheet))return false;
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(sheet,(slot%4)*B.cellW,Math.floor(slot/4)*B.cellH,B.cellW,B.cellH,x+o.ox,y+o.oy,B.cellW*B.scale,B.cellH*B.scale);ctx.restore();return true;
}
// Kule üst yapısı (top, havan, zincir, fener): burcun disk merkezine oturur. 256 px çizim 112 birim (model 96 birimde render edilir, oyunda %17 büyütülür), çapa (128,148.6).
export function drawTowerTop(ctx:CanvasRenderingContext2D,frame:number,slot:number,x:number,y:number,alpha=1){
  const sheet=load('/assets/fleet-tower-tops-v1.webp'),o=FLEET_BASTIONS.offsets[slot];if(!o||!ready(sheet))return false;const size=112;
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(sheet,frame*256,0,256,256,x+o.dx-128*size/256,y+o.dy-148.6*size/256,size,size);ctx.restore();return true;
}
// Kuleler adanın görselinden bağımsızdır: surdaki yuvarlak kaidelerin üstüne dikilir (200 px çizim).
export const TOWER_LABEL_OFFSET=-72;
export function drawFleetTower(ctx:CanvasRenderingContext2D,theme:string,owner:'npc'|'player',x:number,y:number,alpha=1){
  const sheet=load(fleetTowerUrl(theme));if(!ready(sheet))return false;const size=200,k=size/256;
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(sheet,owner==='player'?256:0,0,256,256,x-128*k,y-152.7*k,size,size);ctx.restore();return true;
}

// Ganimet sandıkları: 2 kare (tahta, yaldızlı), 128 px.
const CHEST={frame:128,anchorX:64,anchorY:70.8,size:46};
export function drawChestSprite(ctx:CanvasRenderingContext2D,kind:ChestKind,x:number,y:number,time:number,alpha=1){
  const sheet=load('/assets/loot-chests-v1.webp'),bob=Math.sin(time/380+x*.02)*1.8,k=CHEST.size/CHEST.frame;
  ctx.save();ctx.globalAlpha=alpha;
  if(kind==='gilded'){const glow=ctx.createRadialGradient(x,y,4,x,y,34);glow.addColorStop(0,'#ffd97a55');glow.addColorStop(1,'#ffd97a00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();}
  if(ready(sheet))ctx.drawImage(sheet,kind==='gilded'?CHEST.frame:0,0,CHEST.frame,CHEST.frame,x-CHEST.anchorX*k,y+bob-CHEST.anchorY*k,CHEST.size,CHEST.size);
  else{ctx.fillStyle=kind==='gilded'?'#b8862f':'#6a4128';ctx.fillRect(x-9,y-7+bob,18,13);}
  ctx.restore();
}

// Deniz pırıltısı: su yüzünde parlayan inci, 8 karelik döngü (4 × 2, 128 px).
export function drawSeaSparkle(ctx:CanvasRenderingContext2D,x:number,y:number,time:number,seed:number,alpha=1){
  const sheet=load('/assets/sea-sparkle-v1.webp'),size=58,frame=Math.floor(time/110+seed*8)%8;
  ctx.save();ctx.globalAlpha=alpha;
  if(ready(sheet))ctx.drawImage(sheet,(frame%4)*128,Math.floor(frame/4)*128,128,128,x-size/2,y-size/2,size,size);
  else{ctx.fillStyle='#f4ecf4';ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill();}
  ctx.restore();
}

// Deniz mayını: 128 px, yarısı suya gömülü.
export function drawMineSprite(ctx:CanvasRenderingContext2D,x:number,y:number,time:number,arming:boolean,expiring:boolean){
  const sheet=load('/assets/sea-mine-v1.webp'),size=40,k=size/128,bob=Math.sin(time/300+x)*1.2;
  ctx.save();if(expiring)ctx.globalAlpha=Math.floor(time/180)%2?.4:.9;
  if(ready(sheet))ctx.drawImage(sheet,x-64*k,y+bob-68.8*k,size,size);else{ctx.fillStyle='#1d1f22';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();}
  if(!arming){ctx.fillStyle=Math.floor(time/400)%2?'#ff5a3a':'#ff5a3a55';ctx.beginPath();ctx.arc(x,y-11+bob,2.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

// Deniz: harita renginin üstüne binen, kesintisiz tekrarlanan raster ışıltı dokusu.
let seaPattern:CanvasPattern|null=null;
export function seaTilePattern(ctx:CanvasRenderingContext2D){const tile=load('/assets/sea-tile-v1.webp');if(!seaPattern&&ready(tile))seaPattern=ctx.createPattern(tile,'repeat');return seaPattern;}

// Portre atlası: hücre indeksinden CSS arka plan konumu.
export function portraitStyle(atlas:string,index:number,count:number,cols:number){
  const rows=Math.ceil(count/cols),c=index%cols,r=Math.floor(index/cols);
  return`background-image:url(${atlas});background-size:${cols*100}% ${rows*100}%;background-position:${cols>1?c/(cols-1)*100:0}% ${rows>1?r/(rows-1)*100:0}%`;
}
export const WORLD_CHART='/assets/world-chart-v1.webp';

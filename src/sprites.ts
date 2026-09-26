// Raster sprite sayfaları: NPC gemileri, canavarlar, adalar, filo adaları, sandıklar, mayınlar.
// Görseller tools/asset-studio içindeki 3B modellerden üretilir (npm run render).
export type ChestKind='wood'|'gilded';

const cache=new Map<string,HTMLImageElement>();
function load(src:string){let image=cache.get(src);if(!image){image=new Image();image.decoding='async';image.src=src;cache.set(src,image);}return image;}
const ready=(image:HTMLImageElement)=>image.complete&&image.naturalWidth>0;
export function preload(srcs:string[]){srcs.forEach(load);}

// NPC gemileri: 16 yön, 8 sütun × 2 satır, 192 px kare; kare 0 = kuzey, saat yönünde 22,5°.
// span: karenin kapsadığı dünya birimi. Oyunda 1 birim ≈ 1,23 px.
const SHIP={frame:192,dirs:16,cols:8,anchorX:96,anchorY:108.35,pxPerUnit:1.23};
export const shipDrawSize=(span:number)=>span*SHIP.pxPerUnit;
export const shipLabelOffset=(span:number)=>-Math.round(shipDrawSize(span)*.46);
export function drawNpcShip(ctx:CanvasRenderingContext2D,sprite:string,span:number,x:number,y:number,angle:number,time:number){
  const sheet=load(sprite);if(!ready(sheet))return false;
  const step=Math.PI*2/SHIP.dirs,index=((Math.round(angle/step)%SHIP.dirs)+SHIP.dirs)%SHIP.dirs;
  // Kare boyu sayfadan okunur (NPC 192 px, boss 224 px); çapa karenin aynı oranındadır.
  const F=sheet.naturalWidth/SHIP.cols,size=shipDrawSize(span),k=size/F;void time;
  ctx.save();ctx.shadowColor='#000a';ctx.shadowBlur=11;ctx.shadowOffsetY=3;
  ctx.drawImage(sheet,(index%SHIP.cols)*F,Math.floor(index/SHIP.cols)*F,F,F,x-F*SHIP.anchorX/SHIP.frame*k,y-F*SHIP.anchorY/SHIP.frame*k,size,size);
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

// Adalar: görünüm başına 2 varyantlı sayfa (512 px). Çizim boyu = 2.36 × ada yarıçapı.
export function islandSheetUrl(_look:string){return'/assets/islands-seven-seas-v1.webp';}
export function drawIslandSprite(ctx:CanvasRenderingContext2D,island:{look:string;variant:number;r:number;flip?:boolean},x:number,y:number){
  const sheet=load(islandSheetUrl(island.look));if(!ready(sheet))return false;
  const size=island.r*2.36;ctx.save();ctx.translate(x,y);if(island.flip)ctx.scale(-1,1);
  const themes=['haven','coral','verdant','misty','ice','storm','abyss','lava'];
  const frame=Math.max(0,themes.indexOf(island.look))*2+island.variant,cw=sheet.naturalWidth/4,ch=sheet.naturalHeight/4;
  ctx.drawImage(sheet,(frame%4)*cw,Math.floor(frame/4)*ch,cw,ch,-size/2,-size/2,size,size);ctx.restore();return true;
}

// Onaylı raster ada (1000 dünya birimi) ve bağımsız dört kule türü.
export const fleetBaseUrl=(_theme:string)=>'/assets/fleet-base-approved-v1.webp';
export const fleetTowerUrl=(_theme:string)=>'/assets/fleet-towers-approved-v1.webp';
export function drawFleetBase(ctx:CanvasRenderingContext2D,theme:string,x:number,y:number){
  // Approved raster base: transparent sea/lagoon and eight empty foundations.
  const sheet=load(fleetBaseUrl(theme));if(!ready(sheet))return false;
  ctx.drawImage(sheet,x-500,y-500,1000,1000);return true;
}
// Rakip adanın varsayılan top kuleleri; oyuncu kuleleriyle aynı yerleşim.
export function drawBastion(ctx:CanvasRenderingContext2D,slot:number,x:number,y:number,alpha=1){
  return drawBuiltTower(ctx,0,slot,x,y,alpha);
}
// Filonun diktiği tam kuleler (top, havan, zincir, fener): taş dikme kaidesinin merkezine oturur.
// Dört eşit sütunlu sayfa; ayak çapası her sütunun ortasında, yüksekliğin %92'sinde.
export function drawBuiltTower(ctx:CanvasRenderingContext2D,frame:number,slot:number,x:number,y:number,alpha=1){
  const sheet=load(fleetTowerUrl(''));if(slot<0||slot>=8||!ready(sheet))return false;
  const cellW=sheet.naturalWidth/4,cellH=sheet.naturalHeight,width=110,height=width*cellH/cellW;
  ctx.save();ctx.globalAlpha=alpha;
  ctx.drawImage(sheet,frame*cellW,0,cellW,cellH,x-width/2,y-height*.92+8,width,height);
  ctx.restore();return true;
}
// Kuleler adanın görselinden bağımsızdır: surdaki yuvarlak kaidelerin üstüne dikilir (200 px çizim).
export const TOWER_LABEL_OFFSET=-135;

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

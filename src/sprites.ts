// Düşman filosu, Derinlik Leviathanı ve ganimet sandıkları için raster sprite sayfaları.
// Görseller tools/asset-studio içindeki 3B modellerden üretilir (npm run render).
export type EnemySpriteRole='scout'|'raider'|'warship';
export type ChestKind='wood'|'gilded';

function load(src:string){const image=new Image();image.decoding='async';image.src=src;return image;}
const ready=(image:HTMLImageElement)=>image.complete&&image.naturalWidth>0;

// Gemi sayfaları: 16 yön, 8 sütun × 2 satır, 192 px kare; kare 0 = kuzey, saat yönünde 22,5°.
const SHIP={frame:192,dirs:16,cols:8,anchorX:96,anchorY:108.3,size:128};
const shipSheets:Record<EnemySpriteRole,HTMLImageElement>={
  scout:load('/assets/enemy-scout-v1.webp'),
  raider:load('/assets/enemy-raider-v1.webp'),
  warship:load('/assets/enemy-warship-v1.webp')
};
// Can barı ve isim etiketinin gemi merkezine göre dikey konumu (direk tepesinin hemen üstü).
export const SHIP_LABEL_OFFSET:Record<EnemySpriteRole,number>={scout:-41,raider:-59,warship:-59};

export function drawEnemyShipSprite(ctx:CanvasRenderingContext2D,role:EnemySpriteRole,x:number,y:number,angle:number,time:number){
  const sheet=shipSheets[role];if(!ready(sheet))return false;
  const step=Math.PI*2/SHIP.dirs,index=((Math.round(angle/step)%SHIP.dirs)+SHIP.dirs)%SHIP.dirs;
  const k=SHIP.size/SHIP.frame,bob=Math.sin(time/460+x*.013)*1.4;
  ctx.save();ctx.shadowColor='#000a';ctx.shadowBlur=11;ctx.shadowOffsetY=3;
  ctx.drawImage(sheet,(index%SHIP.cols)*SHIP.frame,Math.floor(index/SHIP.cols)*SHIP.frame,SHIP.frame,SHIP.frame,x-SHIP.anchorX*k,y+bob-SHIP.anchorY*k,SHIP.size,SHIP.size);
  ctx.restore();return true;
}

// Leviathan: 8 karelik dokunaç döngüsü, 4 sütun × 2 satır, 256 px kare.
const LEVIATHAN={frame:256,count:8,cols:4,anchorX:128,anchorY:130.9,size:132,fps:5,radius:52};
const leviathanSheets={deep:load('/assets/leviathan-v1.webp'),storm:load('/assets/leviathan-storm-v1.webp')};
export function drawLeviathanSprite(ctx:CanvasRenderingContext2D,x:number,y:number,phase:number,look:'deep'|'storm'='deep',radius=LEVIATHAN.radius){
  const leviathanSheet=leviathanSheets[look];if(!ready(leviathanSheet))return false;
  const t=phase*LEVIATHAN.fps,a=Math.floor(t)%LEVIATHAN.count,b=(a+1)%LEVIATHAN.count,blend=t-Math.floor(t);
  const size=LEVIATHAN.size*radius/LEVIATHAN.radius,k=size/LEVIATHAN.frame,dx=x-LEVIATHAN.anchorX*k,dy=y-LEVIATHAN.anchorY*k+Math.sin(phase*1.3)*1.5;
  const frame=(n:number)=>[(n%LEVIATHAN.cols)*LEVIATHAN.frame,Math.floor(n/LEVIATHAN.cols)*LEVIATHAN.frame] as const;
  ctx.save();
  const [ax,ay]=frame(a),[bx,by]=frame(b);
  ctx.drawImage(leviathanSheet,ax,ay,LEVIATHAN.frame,LEVIATHAN.frame,dx,dy,size,size);
  ctx.globalAlpha=blend;ctx.drawImage(leviathanSheet,bx,by,LEVIATHAN.frame,LEVIATHAN.frame,dx,dy,size,size);
  ctx.restore();return true;
}

// Ganimet sandıkları: 2 kare (tahta, yaldızlı), 128 px.
const CHEST={frame:128,anchorX:64,anchorY:70.8,size:46};
const chestSheet=load('/assets/loot-chests-v1.webp');
export function drawChestSprite(ctx:CanvasRenderingContext2D,kind:ChestKind,x:number,y:number,time:number,alpha=1){
  const bob=Math.sin(time/380+x*.02)*1.8,k=CHEST.size/CHEST.frame;
  ctx.save();ctx.globalAlpha=alpha;
  if(kind==='gilded'){const glow=ctx.createRadialGradient(x,y,4,x,y,34);glow.addColorStop(0,'#ffd97a55');glow.addColorStop(1,'#ffd97a00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();}
  if(ready(chestSheet))ctx.drawImage(chestSheet,kind==='gilded'?CHEST.frame:0,0,CHEST.frame,CHEST.frame,x-CHEST.anchorX*k,y+bob-CHEST.anchorY*k,CHEST.size,CHEST.size);
  else{ctx.fillStyle=kind==='gilded'?'#b8862f':'#6a4128';ctx.fillRect(x-9,y-7+bob,18,13);}
  ctx.restore();
}

// Hedef kartı portreleri: 4 hücre (gözcü, yağmacı, savaş gemisi, canavar).
export const PORTRAIT_SHEET='/assets/npc-portraits-v1.webp';
export const PORTRAIT_INDEX={scout:0,raider:1,warship:2,monster:3,boss:4,fort:5} as const;
export const PORTRAIT_COUNT=6;

// Adalar: her görünüm için 2 varyantlı sayfa (512 px), 65° yukarıdan. Çizim boyu = 2.36 × ada yarıçapı.
type IslandLookName='verdant'|'misty'|'coral'|'haven'|'crimson'|'storm';
const ISLAND={frame:512,scale:2.36};
const islandSheets:Partial<Record<IslandLookName,HTMLImageElement>>={};
function islandSheet(look:IslandLookName){return islandSheets[look]??=load(`/assets/islands-${look}-v1.webp`);}
export function islandSheetUrl(look:IslandLookName){return`/assets/islands-${look}-v1.webp`;}
export function drawIslandSprite(ctx:CanvasRenderingContext2D,island:{look:IslandLookName;variant:number;r:number;flip?:boolean},x:number,y:number){
  const sheet=islandSheet(island.look);if(!ready(sheet))return false;
  const size=island.r*ISLAND.scale;ctx.save();ctx.translate(x,y);if(island.flip)ctx.scale(-1,1);
  ctx.drawImage(sheet,island.variant*ISLAND.frame,0,ISLAND.frame,ISLAND.frame,-size/2,-size/2,size,size);ctx.restore();return true;
}

// Geçit: 8 karelik girdap döngüsü, 4 × 2, 256 px.
const PORTAL={frame:256,count:8,cols:4,anchorX:128,anchorY:135.6,size:150,fps:7};
const portalSheet=load('/assets/portal-v1.webp');
export function drawPortalSprite(ctx:CanvasRenderingContext2D,x:number,y:number,time:number,locked:boolean){
  if(!ready(portalSheet))return false;
  const n=Math.floor(time/1000*PORTAL.fps)%PORTAL.count,k=PORTAL.size/PORTAL.frame;
  ctx.save();if(locked)ctx.filter='grayscale(.85) brightness(.7)';
  ctx.drawImage(portalSheet,(n%PORTAL.cols)*PORTAL.frame,Math.floor(n/PORTAL.cols)*PORTAL.frame,PORTAL.frame,PORTAL.frame,x-PORTAL.anchorX*k,y-PORTAL.anchorY*k,PORTAL.size,PORTAL.size);
  ctx.restore();return true;
}

// Deniz: harita renginin üstüne binen, kesintisiz tekrarlanan raster ışıltı dokusu.
const seaTile=load('/assets/sea-tile-v1.webp');let seaPattern:CanvasPattern|null=null;
export function seaTilePattern(ctx:CanvasRenderingContext2D){if(!seaPattern&&ready(seaTile))seaPattern=ctx.createPattern(seaTile,'repeat');return seaPattern;}

export const WORLD_CHART='/assets/world-chart-v1.webp';

// Deniz mayını: 128 px, yarısı suya gömülü.
const MINE_SPRITE={frame:128,anchorX:64,anchorY:68.8,size:40};
const mineSprite=load('/assets/sea-mine-v1.webp');
export function drawMineSprite(ctx:CanvasRenderingContext2D,x:number,y:number,time:number,arming:boolean,expiring:boolean){
  const bob=Math.sin(time/300+x)*1.2,k=MINE_SPRITE.size/MINE_SPRITE.frame;
  ctx.save();if(expiring)ctx.globalAlpha=Math.floor(time/180)%2?.4:.9;
  if(ready(mineSprite))ctx.drawImage(mineSprite,x-MINE_SPRITE.anchorX*k,y+bob-MINE_SPRITE.anchorY*k,MINE_SPRITE.size,MINE_SPRITE.size);
  else{ctx.fillStyle='#1d1f22';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();}
  if(!arming){ctx.fillStyle=Math.floor(time/400)%2?'#ff5a3a':'#ff5a3a55';ctx.beginPath();ctx.arc(x,y-11+bob,2.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

// Hayalet Amiral: 16 yön, 240 px kare.
const BOSS_SHIP={frame:240,dirs:16,cols:8,anchorX:120,anchorY:135.1,size:170};
const bossSheet=load('/assets/enemy-ghost-v1.webp');
export const BOSS_LABEL_OFFSET=-76;
export function drawBossSprite(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,time:number){
  if(!ready(bossSheet))return false;
  const step=Math.PI*2/BOSS_SHIP.dirs,index=((Math.round(angle/step)%BOSS_SHIP.dirs)+BOSS_SHIP.dirs)%BOSS_SHIP.dirs,k=BOSS_SHIP.size/BOSS_SHIP.frame,bob=Math.sin(time/520)*1.8;
  ctx.save();ctx.shadowColor='#6dffc4';ctx.shadowBlur=18+Math.sin(time/300)*6;
  ctx.drawImage(bossSheet,(index%BOSS_SHIP.cols)*BOSS_SHIP.frame,Math.floor(index/BOSS_SHIP.cols)*BOSS_SHIP.frame,BOSS_SHIP.frame,BOSS_SHIP.frame,x-BOSS_SHIP.anchorX*k,y+bob-BOSS_SHIP.anchorY*k,BOSS_SHIP.size,BOSS_SHIP.size);
  ctx.restore();return true;
}

// Kale: 2 kare (NPC kızıl sancak, oyuncu turkuaz sancak), 320 px.
const FORT={frame:320,anchorX:160,anchorY:175.9,size:210};
const fortSheet=load('/assets/fort-v1.webp');
export const FORT_LABEL_OFFSET=-92;
export const FORT_ART='/assets/fort-v1.webp';
export function drawFortSprite(ctx:CanvasRenderingContext2D,owner:'npc'|'player',x:number,y:number){
  if(!ready(fortSheet))return false;const k=FORT.size/FORT.frame;
  ctx.drawImage(fortSheet,owner==='player'?FORT.frame:0,0,FORT.frame,FORT.frame,x-FORT.anchorX*k,y-FORT.anchorY*k,FORT.size,FORT.size);return true;
}

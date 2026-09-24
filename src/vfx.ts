// Atış ve savaş efektleri: tools/asset-studio/vfx.js ile boyanan raster atlas (8 × 5 kare, kare 128 px).
const atlas=new Image();atlas.src='/assets/vfx-atlas-v1.webp';
const CELL=128;
export const VFX={
  iron:[0,0],fire:[1,0],pellet:[2,0],chain:[3,0],enemy:[4,0],shadow:[5,0],target:[6,0],flash:[7,0],
  smoke:[0,3],splinter:[4,3],ember:[7,3],foam:[0,4],bubble:[2,4],firePuff:[3,4],spit:[4,4],plank:[5,4],star:[6,4],poison:[7,4],
} as const;
export type VfxName=keyof typeof VFX;
// Sayısı birden fazla olan kareler (aynı satırda yan yana)
export const VFX_VARIANTS:Partial<Record<VfxName,number>>={smoke:4,splinter:3,foam:2};
export const EXPLOSION_ROW=1,SPLASH_ROW=2,ANIM_FRAMES=8;
export const vfxReady=()=>atlas.complete&&atlas.naturalWidth>0;
// size: ekranda karenin kenar uzunluğu (px); kare merkezi (x,y) noktasına oturur
export function drawVfx(ctx:CanvasRenderingContext2D,name:VfxName,x:number,y:number,size:number,{rot=0,alpha=1,variant=0}:{rot?:number;alpha?:number;variant?:number}={}){
  if(!vfxReady())return false;const [c,r]=VFX[name];drawCell(ctx,c+variant,r,x,y,size,rot,alpha);return true;
}
// t: 0..1 animasyon ilerlemesi
export function drawVfxAnim(ctx:CanvasRenderingContext2D,row:number,t:number,x:number,y:number,size:number,alpha=1){
  if(!vfxReady())return false;drawCell(ctx,Math.min(ANIM_FRAMES-1,Math.floor(t*ANIM_FRAMES)),row,x,y,size,0,alpha);return true;
}
function drawCell(ctx:CanvasRenderingContext2D,c:number,r:number,x:number,y:number,size:number,rot:number,alpha:number){
  const prev=ctx.globalAlpha;ctx.globalAlpha=prev*alpha;
  if(rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(atlas,c*CELL,r*CELL,CELL,CELL,-size/2,-size/2,size,size);ctx.restore();}
  else ctx.drawImage(atlas,c*CELL,r*CELL,CELL,CELL,x-size/2,y-size/2,size,size);
  ctx.globalAlpha=prev;
}

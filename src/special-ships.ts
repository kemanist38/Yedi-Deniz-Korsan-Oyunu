// Özel gemiler: yalnızca görünüm (başlangıç gemisi gücünde), inciyle bir kez satın alınır. Tersanenin 2. sayfasında listelenir.
// Kart görseli tek açılı raster (384 px, pruva sol-aşağı). Yön sayfası olmayan gemi sağa giderken yatay aynalanır.
// dir: 8 yönlü sayfa (4 × 2, 256 px kare; elitlerle aynı sıra G, GB, B, KD, K, GD, D, KB). Yoksa tek görsel aynalanır.
export type SpecialShip={id:string;name:string;english:string;price:number;art:string;description:string;dir?:string};
export const SPECIAL_SHIPS:SpecialShip[]=[
  {id:'ak-kadirga',name:'Ak Kadırga',english:'White Galley',price:500,art:'/assets/special-galley-v1.webp',dir:'/assets/special-galley-dir-v1.webp',description:'Pruvasında ikiz top taşıyan, kürekli beyaz savaş kadırgası; kemik haçlı yelkenleriyle tanınır.'},
  {id:'sovalye-kalyonu',name:'Şövalye Kalyonu',english:'Knight Galleon',price:800,art:'/assets/special-galleon-v1.webp',dir:'/assets/special-galleon-dir-v1.webp',description:'Altın yaldızlı küpeşteleri ve haç işlemeli yelkenleriyle üç direkli heybetli kalyon.'},
];
export const specialById=(id:string|null|undefined)=>SPECIAL_SHIPS.find(s=>s.id===id);
// Yön: gemi sağa gidiyorsa aynala; neredeyse dikey gidişte son bakış korunur
export function specialFacing(angle:number,previous:1|-1):1|-1{const dx=Math.sin(angle);return Math.abs(dx)>.2?(dx>0?1:-1):previous;}

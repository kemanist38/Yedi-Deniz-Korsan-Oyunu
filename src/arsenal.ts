// Özel yetenekler ve yeni mühimmatlar. Hesap kaydına dokunmamak için ayrı anahtarda saklanır.
export type AbilityId='speed'|'mine';
export type ArsenalStock={fire:number;grape:number;mine:number;powder:number;shield:number;explosive:number;breaker:number;leech:number;seeded:boolean;seededV2:boolean};

export const ABILITIES:Record<AbilityId,{name:string;key:string;duration:number;cooldown:number;description:string;icon:string}>={
  speed:{name:'Rüzgâr Hamlesi',key:'Z',duration:7,cooldown:28,description:'7 saniye boyunca azami hız %55 artar.',icon:'/assets/icon-speed-v1.webp'},
  mine:{name:'Deniz Mayını',key:'C',duration:40,cooldown:4,description:'Kıç tarafına mayın bırakır; yaklaşan düşmanlara alan hasarı verir.',icon:'/assets/icon-mine-v1.webp'}
};
export const SPEED_BOOST=1.55;
// Sarf malzemeleri (açık/kapalı): Kara Barut her salvoda 1 adet harcar ve hasarı %10 artırır;
// Kalkan her alınan isabette 1 adet harcar ve gelen hasarı %10 düşürür.
export const CONSUMABLES={
  powder:{name:'Kara Barut',factor:1.1,icon:'/assets/icon-powder-v1.webp',description:'Açıkken her salvoda 1 adet harcar; top hasarı %10 artar.'},
  shield:{name:'Kalkan',factor:.9,icon:'/assets/icon-shield-v1.webp',description:'Açıkken her isabette 1 adet harcar; gelen hasar %10 azalır.'}
} as const;
export type ConsumableId=keyof typeof CONSUMABLES;

// Tek gülle hasarı (Seafight: ateş topu 50, patlayıcı 75). Salvo hasarı = gemideki top sayısı × gülle hasarı × top çarpanı.
export const BALL_DAMAGE=20;
export const CHAIN_FACTOR=1.25;
// Özel gülleler: damage, demir gülleye (20) göre çarpandır.
export const SPECIAL_AMMO={
  fire:{name:'Ateş Güllesi',damage:2.5,reload:1.1,rangeFactor:1,burnSeconds:4,burnDps:250,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-fire-v1.webp',description:'Hedefi 4 saniye yakar; saniyede ek hasar verir.'},
  grape:{name:'Saçma',damage:1.75,reload:1,rangeFactor:.65,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-grape-v1.webp',description:'Kısa menzilde çok yüksek hasar; menzil %35 azalır.'},
  // Seafight'taki patlayıcı / Shellshock / Soul Eater güllelerinden uyarlandı
  explosive:{name:'Patlayıcı Gülle',damage:3.75,reload:1.2,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:120,blastFactor:.5,towerFactor:1,leech:0,icon:'/assets/ammo-explosive-v1.webp',description:'Çarptığı yerde patlar; 120 birim içindeki diğer düşmanlara %50 hasar verir.'},
  breaker:{name:'Kule Kırıcı',damage:2.25,reload:1.15,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:2.6,leech:0,icon:'/assets/ammo-breaker-v1.webp',description:'Kulelere ve ada tahkimatına 2,6 kat hasar; gemilere biraz daha az işler.'},
  leech:{name:'Can Emici',damage:3,reload:1.1,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:.25,icon:'/assets/ammo-leech-v1.webp',description:'Verdiği hasarın %25\'i kadar gemini onarır.'}
} as const;
export type SpecialAmmo=keyof typeof SPECIAL_AMMO;

export const MINE={armSeconds:1,triggerRadius:46,blastRadius:95,baseDamage:4000,damagePerLevel:400,maxActive:5,icon:'/assets/icon-mine-v1.webp'};

// Dükkân birim fiyatları (altın). Oyuncu istediği adedi yazar; toplam = adet × birim fiyat.
// Temel gülle (zincir) altınla, güçlü gülleler inciyle alınır; inci fiyatı sırasıyla artar.
export type Price={amount:number;currency:'gold'|'pearls'};
export const AMMO_PRICES={chain:{amount:3,currency:'gold'},grape:{amount:1,currency:'pearls'},fire:{amount:2,currency:'pearls'},breaker:{amount:3,currency:'pearls'},explosive:{amount:4,currency:'pearls'},leech:{amount:5,currency:'pearls'}} as const satisfies Record<string,Price>;
export const SUPPLY_PRICES={powder:{amount:3,currency:'gold'},shield:{amount:3,currency:'gold'},mine:{amount:5,currency:'pearls'}} as const satisfies Record<string,Price>;
export type SupplyId=keyof typeof SUPPLY_PRICES;

const STORAGE='yedi-deniz-arsenal-v1';
export function loadArsenal():ArsenalStock{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');const n=(v:unknown,d:number)=>v===undefined?d:Math.max(0,+(v as number)||0);if(raw)return{fire:n(raw.fire,0),grape:n(raw.grape,0),mine:n(raw.mine,0),powder:n(raw.powder,30),shield:n(raw.shield,30),explosive:n(raw.explosive,10),breaker:n(raw.breaker,10),leech:n(raw.leech,10),seeded:!!raw.seeded,seededV2:!!raw.seededV2};}catch{}
  // İlk açılışta tanıtım stoğu
  return{fire:15,grape:15,mine:3,powder:30,shield:30,explosive:10,breaker:10,leech:10,seeded:false,seededV2:false};
}
export function saveArsenal(stock:ArsenalStock){try{localStorage.setItem(STORAGE,JSON.stringify(stock));}catch{}}

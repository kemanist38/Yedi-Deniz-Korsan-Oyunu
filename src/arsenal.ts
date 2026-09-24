// Özel yetenekler ve yeni mühimmatlar. Hesap kaydına dokunmamak için ayrı anahtarda saklanır.
export type AbilityId='speed'|'shield'|'mine';
export type ArsenalStock={fire:number;grape:number;mine:number;explosive:number;breaker:number;leech:number;seeded:boolean;seededV2:boolean};

export const ABILITIES:Record<AbilityId,{name:string;key:string;duration:number;cooldown:number;description:string;icon:string}>={
  speed:{name:'Rüzgâr Hamlesi',key:'Z',duration:7,cooldown:28,description:'7 saniye boyunca azami hız %55 artar.',icon:'/assets/icon-speed-v1.webp'},
  shield:{name:'Demir Kalkan',key:'X',duration:6,cooldown:40,description:'6 saniye boyunca alınan hasar %65 azalır.',icon:'/assets/icon-shield-v1.webp'},
  mine:{name:'Deniz Mayını',key:'C',duration:40,cooldown:4,description:'Kıç tarafına mayın bırakır; yaklaşan düşmanlara alan hasarı verir.',icon:'/assets/icon-mine-v1.webp'}
};
export const SPEED_BOOST=1.55;
export const SHIELD_FACTOR=.35;

// Yeni gülle türleri: çarpanlar mevcut demir/zincir hesabının üzerine uygulanır.
export const SPECIAL_AMMO={
  fire:{name:'Ateş Güllesi',damage:1.2,reload:1.1,rangeFactor:1,burnSeconds:4,burnDps:6,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-fire-v1.webp',description:'Hedefi 4 saniye yakar; saniyede ek hasar verir.'},
  grape:{name:'Saçma',damage:1.6,reload:1,rangeFactor:.65,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-grape-v1.webp',description:'Kısa menzilde çok yüksek hasar; menzil %35 azalır.'},
  // Seafight'taki patlayıcı / Shellshock / Soul Eater güllelerinden uyarlandı
  explosive:{name:'Patlayıcı Gülle',damage:.9,reload:1.2,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:120,blastFactor:.5,towerFactor:1,leech:0,icon:'/assets/ammo-explosive-v1.webp',description:'Çarptığı yerde patlar; 120 birim içindeki diğer düşmanlara %50 hasar verir.'},
  breaker:{name:'Kule Kırıcı',damage:.85,reload:1.15,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:2.6,leech:0,icon:'/assets/ammo-breaker-v1.webp',description:'Kulelere ve ada tahkimatına 2,6 kat hasar; gemilere biraz daha az işler.'},
  leech:{name:'Can Emici',damage:.9,reload:1.1,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:.25,icon:'/assets/ammo-leech-v1.webp',description:'Verdiği hasarın %25\'i kadar gemini onarır.'}
} as const;
export type SpecialAmmo=keyof typeof SPECIAL_AMMO;

export const MINE={armSeconds:1,triggerRadius:46,blastRadius:95,baseDamage:90,damagePerLevel:8,maxActive:5,icon:'/assets/icon-mine-v1.webp'};

export const ARSENAL_MARKET=[
  {kind:'fire' as const,name:'Ateş Güllesi Kesesi',amount:20,price:95,description:'Hedefi tutuşturan 20 ateş güllesi.'},
  {kind:'grape' as const,name:'Saçma Torbası',amount:25,price:80,description:'Yakın dövüş için 25 saçma atışı.'},
  {kind:'mine' as const,name:'Deniz Mayını Sandığı',amount:5,price:120,description:'Kıçtan bırakılan 5 deniz mayını.'},
  {kind:'explosive' as const,name:'Patlayıcı Gülle Sandığı',amount:15,price:130,description:'Sürülere karşı alan hasarı veren 15 fitilli bomba.'},
  {kind:'breaker' as const,name:'Kule Kırıcı Kasası',amount:15,price:150,description:'Kule ve ada kuşatması için 15 çelik uçlu mermi.'},
  {kind:'leech' as const,name:'Can Emici Kesesi',amount:15,price:140,description:'Vurdukça gemini onaran 15 ruh güllesi.'}
];

const STORAGE='yedi-deniz-arsenal-v1';
export function loadArsenal():ArsenalStock{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');const n=(v:unknown,d:number)=>v===undefined?d:Math.max(0,+(v as number)||0);if(raw)return{fire:n(raw.fire,0),grape:n(raw.grape,0),mine:n(raw.mine,0),explosive:n(raw.explosive,10),breaker:n(raw.breaker,10),leech:n(raw.leech,10),seeded:!!raw.seeded,seededV2:!!raw.seededV2};}catch{}
  // İlk açılışta tanıtım stoğu
  return{fire:15,grape:15,mine:3,explosive:10,breaker:10,leech:10,seeded:false,seededV2:false};
}
export function saveArsenal(stock:ArsenalStock){try{localStorage.setItem(STORAGE,JSON.stringify(stock));}catch{}}

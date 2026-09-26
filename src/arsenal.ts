// Özel yetenekler ve yeni mühimmatlar. Hesap kaydına dokunmamak için ayrı anahtarda saklanır.
export type AbilityId='speed'|'mine';
export type ArsenalStock={fire:number;grape:number;mine:number;powder:number;shield:number;explosive:number;breaker:number;leech:number;seeded:boolean;seededV2:boolean;ballsV1:boolean};

export const ABILITIES:Record<AbilityId,{name:string;key:string;duration:number;cooldown:number;description:string;icon:string}>={
  speed:{name:'Rüzgâr Hamlesi',key:'Z',duration:7,cooldown:28,description:'7 saniye boyunca azami hız %55 artar.',icon:'/assets/icon-speed-v1.webp'},
  mine:{name:'Deniz Mayını',key:'C',duration:40,cooldown:4,description:'Kıç tarafına mayın bırakır; yaklaşan düşmanlara alan hasarı verir.',icon:'/assets/icon-mine-v1.webp'}
};
export const SPEED_BOOST=1.55;
// Sarf malzemeleri (açık/kapalı): Kara Barut her salvoda 1 adet harcar ve hasarı %10 artırır;
// Kalkan her alınan isabette 1 adet harcar ve gelen hasarı %10 düşürür.
export const CONSUMABLES={
  powder:{name:'Kara Barut',factor:1.1,icon:'/assets/icon-powder-v2.webp',description:'Açıkken her salvoda 1 adet harcar; top hasarı %10 artar.'},
  shield:{name:'Kalkan',factor:.9,icon:'/assets/icon-shield-v1.webp',description:'Açıkken her isabette 1 adet harcar; gelen hasar %10 azalır.'}
} as const;
export type ConsumableId=keyof typeof CONSUMABLES;

// Tek gülle hasarı (Seafight: ateş topu 50, patlayıcı 75). Salvo hasarı = gemideki top sayısı × gülle hasarı × top çarpanı.
export const BALL_DAMAGE=20;
export const CHAIN_FACTOR=1.25;
// Özel gülleler: damage, demir gülleye (20) göre çarpandır.
export const SPECIAL_AMMO={
  fire:{name:'Ateş Güllesi',damage:2.5,reload:1.1,rangeFactor:1,burnSeconds:12,burnDps:250,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-fire-v1.webp',description:'Gülle başı 50 hasar; hedef 12 saniye yanar ve isabetin %80\'i kadar ek hasar alır.'},
  grape:{name:'Saçma',damage:2,reload:1,rangeFactor:.65,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:0,icon:'/assets/ammo-grape-v1.webp',description:'Kısa menzilde çok yüksek hasar; menzil %35 azalır.'},
  // Seafight'taki patlayıcı / Shellshock / Soul Eater güllelerinden uyarlandı
  explosive:{name:'Patlayıcı Gülle',damage:3.75,reload:1.2,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:120,blastFactor:.5,towerFactor:1,leech:0,icon:'/assets/ammo-explosive-v1.webp',description:'Çarptığı yerde patlar; 120 birim içindeki diğer düşmanlara %50 hasar verir.'},
  breaker:{name:'Kule Kırıcı',damage:2.25,reload:1.15,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:2.6,leech:0,icon:'/assets/ammo-breaker-v1.webp',description:'Kulelere ve ada tahkimatına 2,6 kat hasar; gemilere biraz daha az işler.'},
  leech:{name:'Can Emici',damage:3,reload:1.1,rangeFactor:1,burnSeconds:0,burnDps:0,blastRadius:0,blastFactor:0,towerFactor:1,leech:.25,icon:'/assets/ammo-leech-v1.webp',description:'Verdiği hasarın %25\'i kadar gemini onarır.'}
} as const;
export type SpecialAmmo=keyof typeof SPECIAL_AMMO;

// Ateş güllesi yanması (Seafight Pyreball: 50 hasar + 12 sn boyunca 3 sn'de bir 10 = gülle başına %80 ek hasar)
export const FIRE_DOT_SHARE=.8;
// Elit puan: yalnızca inciyle alınan (elit) güllelerle ateş edilince kazanılır; gülle başına, gülle değeriyle orantılı
// (≈ harcanan her inci için 10 elit puan). Seafight'ta da elit puan elit/inci güllesiyle yapılan atışlardan gelir.
export const ELITE_POINTS_PER_BALL={grape:.1,fire:.2,breaker:.3,explosive:.4,leech:.5} as const;
// Elit seviye eşiği (toplam elit puan): Elit 1 = 0, Elit 2 = 1.000, Elit 5 = 8.000, Elit 10 = 27.000, Elit 15 ≈ 52.400
export const ELITE_MAX_LEVEL=15;
export const eliteLevelEp=(level:number)=>Math.round(1000*Math.pow(Math.max(0,level-1),1.5));
export const eliteLevelFromEp=(ep:number)=>{let l=1;while(l<ELITE_MAX_LEVEL&&ep>=eliteLevelEp(l+1))l++;return l;};
export const MINE={armSeconds:1,triggerRadius:46,blastRadius:95,baseDamage:4000,damagePerLevel:400,maxActive:5,icon:'/assets/icon-mine-v1.webp'};

// Dükkân birim fiyatları (altın). Oyuncu istediği adedi yazar; toplam = adet × birim fiyat.
// Temel gülle (zincir) altınla, güçlü gülleler inciyle alınır; inci fiyatı sırasıyla artar.
// Seafight'taki gibi her top her salvoda 1 gülle harcar, bu yüzden gülleler 100'lük birim fiyatla satılır (per=100).
export type Price={amount:number;currency:'gold'|'pearls';per?:number};
export const priceOf=(p:Price,qty:number)=>Math.ceil(qty*p.amount/(p.per??1));
export const AMMO_PRICES={chain:{amount:10,currency:'gold',per:100},grape:{amount:1,currency:'pearls',per:100},fire:{amount:2,currency:'pearls',per:100},breaker:{amount:3,currency:'pearls',per:100},explosive:{amount:4,currency:'pearls',per:100},leech:{amount:5,currency:'pearls',per:100}} as const satisfies Record<string,Price>;
export const SUPPLY_PRICES={powder:{amount:3,currency:'gold'},shield:{amount:3,currency:'gold'},mine:{amount:5,currency:'pearls'}} as const satisfies Record<string,Price>;
export type SupplyId=keyof typeof SUPPLY_PRICES;

const STORAGE='yedi-deniz-arsenal-v1';
export function loadArsenal():ArsenalStock{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');const n=(v:unknown,d:number)=>v===undefined?d:Math.max(0,+(v as number)||0);if(raw)return{fire:n(raw.fire,0),grape:n(raw.grape,0),mine:n(raw.mine,0),powder:n(raw.powder,30),shield:n(raw.shield,30),explosive:n(raw.explosive,10),breaker:n(raw.breaker,10),leech:n(raw.leech,10),seeded:!!raw.seeded,seededV2:!!raw.seededV2,ballsV1:!!raw.ballsV1};}catch{}
  // İlk açılışta tanıtım stoğu
  return{fire:750,grape:750,mine:3,powder:30,shield:30,explosive:500,breaker:500,leech:500,seeded:false,seededV2:false,ballsV1:true};
}
export function saveArsenal(stock:ArsenalStock){try{localStorage.setItem(STORAGE,JSON.stringify(stock));}catch{}}

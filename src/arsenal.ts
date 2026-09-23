// Özel yetenekler ve yeni mühimmatlar. Hesap kaydına dokunmamak için ayrı anahtarda saklanır.
export type AbilityId='speed'|'shield'|'mine';
export type ArsenalStock={fire:number;grape:number;mine:number;seeded:boolean};

export const ABILITIES:Record<AbilityId,{name:string;key:string;duration:number;cooldown:number;description:string;icon:string}>={
  speed:{name:'Rüzgâr Hamlesi',key:'Z',duration:7,cooldown:28,description:'7 saniye boyunca azami hız %55 artar.',icon:'/assets/icon-speed-v1.webp'},
  shield:{name:'Demir Kalkan',key:'X',duration:6,cooldown:40,description:'6 saniye boyunca alınan hasar %65 azalır.',icon:'/assets/icon-shield-v1.webp'},
  mine:{name:'Deniz Mayını',key:'C',duration:40,cooldown:4,description:'Kıç tarafına mayın bırakır; yaklaşan düşmanlara alan hasarı verir.',icon:'/assets/icon-mine-v1.webp'}
};
export const SPEED_BOOST=1.55;
export const SHIELD_FACTOR=.35;

// Yeni gülle türleri: çarpanlar mevcut demir/zincir hesabının üzerine uygulanır.
export const SPECIAL_AMMO={
  fire:{name:'Ateş Güllesi',damage:1.2,reload:1.1,rangeFactor:1,burnSeconds:4,burnDps:6,icon:'/assets/ammo-fire-v1.webp',description:'Hedefi 4 saniye yakar; saniyede ek hasar verir.'},
  grape:{name:'Saçma',damage:1.6,reload:1,rangeFactor:.65,burnSeconds:0,burnDps:0,icon:'/assets/ammo-grape-v1.webp',description:'Kısa menzilde çok yüksek hasar; menzil %35 azalır.'}
} as const;

export const MINE={armSeconds:1,triggerRadius:46,blastRadius:95,baseDamage:90,damagePerLevel:8,maxActive:5,icon:'/assets/icon-mine-v1.webp'};

export const ARSENAL_MARKET=[
  {kind:'fire' as const,name:'Ateş Güllesi Kesesi',amount:20,price:95,description:'Hedefi tutuşturan 20 ateş güllesi.'},
  {kind:'grape' as const,name:'Saçma Torbası',amount:25,price:80,description:'Yakın dövüş için 25 saçma atışı.'},
  {kind:'mine' as const,name:'Deniz Mayını Sandığı',amount:5,price:120,description:'Kıçtan bırakılan 5 deniz mayını.'}
];

const STORAGE='kara-yelken-arsenal-v1';
export function loadArsenal():ArsenalStock{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw)return{fire:Math.max(0,+raw.fire||0),grape:Math.max(0,+raw.grape||0),mine:Math.max(0,+raw.mine||0),seeded:!!raw.seeded};}catch{}
  // İlk açılışta tanıtım stoğu
  return{fire:15,grape:15,mine:3,seeded:false};
}
export function saveArsenal(stock:ArsenalStock){try{localStorage.setItem(STORAGE,JSON.stringify(stock));}catch{}}

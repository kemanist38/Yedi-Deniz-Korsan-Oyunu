export type EliteShipId=
  'phantom'|'magma'|'glacial'|'kraken'|'ironclad'|'crimson'|'atlantean'|'bone'|'tempest'|'sovereign'|'jade'|'ragnarok'|'void'|'coral'|'sand';

export type EliteShip={
  id:EliteShipId;level:number;name:string;english:string;asset:string;
  role:string;passive:string;ability:string;abilityDescription:string;
  // Yetenek bir hedef gerektiriyor mu (seçili düşman)
  needsTarget:boolean;
};

// Elit gemiler: her gemi bir rol, sürekli pasif ve 45 sn bekleme süreli animasyonlu özel yetenek taşır (main.ts: eliteAbility).
export const ELITE_SHIPS:EliteShip[]=[
{id:'phantom',level:1,name:'Hayalet Kadırga',english:'The Phantom Galleon',asset:'/assets/elite-phantom-art-v2.webp',role:'Kaçış',passive:'%10 ihtimalle gülleden kaçar',ability:'Hayalet Geçiş',abilityDescription:'5 sn hasar almaz, adacıklardan ve gemilerin içinden geçer; bu sürede ateş edemez.',needsTarget:false},
{id:'magma',level:2,name:'Volkanik Dreadnought',english:'Volcanic Dreadnought',asset:'/assets/elite-magma-art-v2.webp',role:'Alan hasarı',passive:'Vuruşların %15\'i hedefi 3 sn yakar',ability:'Lav Yağmuru',abilityDescription:'Hedefin çevresine 5 lav topu düşer ve 4 sn yanan bir lav gölü bırakır.',needsTarget:true},
{id:'glacial',level:3,name:'Buzul Tiranı',english:'Glacial Tyrant',asset:'/assets/elite-glacial-art-v2.webp',role:'Kontrol',passive:'Vurduğu hedef 2 sn yavaşlar',ability:'Dondurma',abilityDescription:'Hedef 4 sn donar; hareket edemez, ateş edemez.',needsTarget:true},
{id:'kraken',level:4,name:"Kraken'in Gazabı",english:"Kraken's Embrace",asset:'/assets/elite-kraken-art-v2.webp',role:'Yakalama',passive:'Yakın mesafede (200 birim) +%10 hasar',ability:'Dokunaç Kıskacı',abilityDescription:'Dokunaçlar hedefi sarar, gemine doğru çeker ve 3 sn tutar.',needsTarget:true},
{id:'ironclad',level:5,name:'Buharlı Zırhlı',english:'Steampunk Ironclad',asset:'/assets/elite-ironclad-art-v2.webp',role:'Tank',passive:'Alınan hasar −%10',ability:'Buhar Kazanı',abilityDescription:'6 sn top dolum süresi yarıya iner, alınan hasar −%20.',needsTarget:false},
{id:'crimson',level:6,name:'Kanlı Ay Korveti',english:'Crimson Moon Corsair',asset:'/assets/elite-crimson-art-v2.webp',role:'Can emme',passive:'Verdiği hasarın %3\'ü kadar can kazanır',ability:'Kanlı Ay',abilityDescription:'8 sn verdiği hasarın %25\'i kadar can kazanır.',needsTarget:false},
{id:'atlantean',level:7,name:'Kadim Atlantis Muhafızı',english:'Atlantean Sentry',asset:'/assets/elite-atlantean-art-v2.webp',role:'Koruma',passive:'Kalkan etkisi +%10',ability:'Su Kubbesi',abilityDescription:'5 sn hiç hasar almaz.',needsTarget:false},
{id:'bone',level:8,name:'Kemik Biçici',english:'Bone Harvester',asset:'/assets/elite-bone-art-v2.webp',role:'İnfaz',passive:'Canı %25\'in altındaki hedeflere +%20 hasar',ability:'Ruh Biçme',abilityDescription:'Canı %20\'nin altındaki hedef anında batar; daha canlı hedefe büyük hasar verir.',needsTarget:true},
{id:'tempest',level:9,name:'Fırtına Habercisi',english:'Tempest Harbinger',asset:'/assets/elite-tempest-art-v2.webp',role:'Zincir hasar',passive:'+%5 hız',ability:'Zincir Yıldırım',abilityDescription:'Yıldırım hedefe çarpar, sonra yakındaki 2 düşmana sıçrar.',needsTarget:true},
{id:'sovereign',level:10,name:'Kraliyet Sancaktarı',english:'Royal Standard-Bearer',asset:'/assets/elite-sovereign-art-v2.webp',role:'Destek / ganimet',passive:'+%10 altın',ability:'Aslan Sancağı',abilityDescription:'10 sn +%20 hasar; batırılan gemilerden çift ganimet.',needsTarget:false},
{id:'jade',level:11,name:'Yeşim Ejderha',english:'Jade Dragon',asset:'/assets/elite-jade-art-v2.webp',role:'Menzil',passive:'+20 menzil',ability:'Ejder Nefesi',abilityDescription:'Pruvadaki ejderhadan çıkan alev hattı önündeki bütün düşmanları yakar.',needsTarget:true},
{id:'ragnarok',level:12,name:'Ragnarok Yıkıcısı',english:'Ragnarok Destroyer',asset:'/assets/elite-ragnarok-art-v2.webp',role:'Öfke',passive:'Canı her %10 düştükçe +%3 hasar',ability:'Valhalla Öfkesi',abilityDescription:'4 sn batmaz ve +%30 hasar verir.',needsTarget:false},
{id:'void',level:13,name:'Hiçlik Hükümdarı',english:'Void Monarch',asset:'/assets/elite-void-art-v2.webp',role:'Kaos',passive:'%5 kritik vuruş (2 kat hasar)',ability:'Kara Delik',abilityDescription:'Hedefte girdap açılır; 400 birim içindeki düşmanları merkeze çeker ve ezer.',needsTarget:true},
{id:'coral',level:14,name:'Mercan Koruyucusu',english:'Coral Guardian',asset:'/assets/elite-coral-art-v2.webp',role:'İyileştirme',passive:'Savaş dışında 2 kat hızlı tamir',ability:'Mercan Resifi',abilityDescription:'6 sn içinde canının %30\'unu yeniler; çevredeki düşmanlar yavaşlar.',needsTarget:false},
{id:'sand',level:15,name:'Kum Gezgini',english:'Sand Wanderer',asset:'/assets/elite-sand-art-v2.webp',role:'Hız / gizlilik',passive:'+%10 hız',ability:'Güneş Fırtınası',abilityDescription:'5 sn görünmez olur, düşmanlar hedef alamaz, +%30 hız; yakındaki düşmanlar 2 sn kör kalır.',needsTarget:false}
];
export const eliteById=(id:string)=>ELITE_SHIPS.find(ship=>ship.id===id)??ELITE_SHIPS[0];
// Yön sayfaları (elite-dir-<id>-v1.webp, 4 × 2 kare): her karenin gerçekte gösterdiği pusula yönü. Varsayılan düzen
// G, GB, B, KD, K, GD, D, KB; bazı sayfalarda kareler yanlış yöne bakar (ör. kuzeybatı karesi güneydoğuyu gösterir).
// Bir yönün karesi yoksa karşı yönün (D↔B, KD↔KB, GD↔GB) karesi yatay aynalanır.
export const COMPASS=['N','NE','E','SE','S','SW','W','NW'] as const;
export type Compass=typeof COMPASS[number];
const DEFAULT_SHOWS='S SW W NE N SE E NW';
export const ELITE_DIR_SHOWS:Partial<Record<EliteShipId,string>>={
};
// Pusula dizini (0 = kuzey, saat yönünde 45°) için {kare, ayna}
export function eliteDirFrame(id:EliteShipId,compass:number):{frame:number;mirror:boolean}{
  const shows=(ELITE_DIR_SHOWS[id]??DEFAULT_SHOWS).split(' '),want=COMPASS[compass],opposite=COMPASS[(8-compass)%8];
  const pick=(dir:string)=>{const preferred=DEFAULT_SHOWS.split(' ').indexOf(dir);return shows[preferred]===dir?preferred:shows.indexOf(dir);};
  const direct=pick(want);if(direct>=0)return{frame:direct,mirror:false};
  const mirrored=pick(opposite);return mirrored>=0?{frame:mirrored,mirror:true}:{frame:DEFAULT_SHOWS.split(' ').indexOf(want),mirror:false};
}

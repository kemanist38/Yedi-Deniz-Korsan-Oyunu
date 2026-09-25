export type EliteShipId=
  'phantom'|'magma'|'glacial'|'kraken'|'ironclad'|'crimson'|'atlantean'|'bone'|'tempest'|'sovereign'|'jade'|'ragnarok'|'void'|'coral'|'sand';

export type EliteShip={
  id:EliteShipId;level:number;name:string;english:string;asset:string;
};

// Elit gemiler: şimdilik yalnızca seviye, ad ve görünüm. Rol, pasif ve özel yetenekler yeniden tasarlanıyor (onay bekliyor).
export const ELITE_SHIPS:EliteShip[]=[
{id:'phantom',level:1,name:'Hayalet Kadırga',english:'The Phantom Galleon',asset:'/assets/elite-phantom-art-v2.webp'},
{id:'magma',level:2,name:'Volkanik Dreadnought',english:'Volcanic Dreadnought',asset:'/assets/elite-magma-art-v2.webp'},
{id:'glacial',level:3,name:'Buzul Tiranı',english:'Glacial Tyrant',asset:'/assets/elite-glacial-art-v2.webp'},
{id:'kraken',level:4,name:"Kraken'in Gazabı",english:"Kraken's Embrace",asset:'/assets/elite-kraken-art-v2.webp'},
{id:'ironclad',level:5,name:'Buharlı Zırhlı',english:'Steampunk Ironclad',asset:'/assets/elite-ironclad-art-v2.webp'},
{id:'crimson',level:6,name:'Kanlı Ay Korveti',english:'Crimson Moon Corsair',asset:'/assets/elite-crimson-art-v2.webp'},
{id:'atlantean',level:7,name:'Kadim Atlantis Muhafızı',english:'Atlantean Sentry',asset:'/assets/elite-atlantean-art-v2.webp'},
{id:'bone',level:8,name:'Kemik Biçici',english:'Bone Harvester',asset:'/assets/elite-bone-art-v2.webp'},
{id:'tempest',level:9,name:'Fırtına Habercisi',english:'Tempest Harbinger',asset:'/assets/elite-tempest-art-v2.webp'},
{id:'sovereign',level:10,name:'Kraliyet Sancaktarı',english:'Royal Standard-Bearer',asset:'/assets/elite-sovereign-art-v2.webp'},
{id:'jade',level:11,name:'Yeşim Ejderha',english:'Jade Dragon',asset:'/assets/elite-jade-art-v2.webp'},
{id:'ragnarok',level:12,name:'Ragnarok Yıkıcısı',english:'Ragnarok Destroyer',asset:'/assets/elite-ragnarok-art-v2.webp'},
{id:'void',level:13,name:'Hiçlik Hükümdarı',english:'Void Monarch',asset:'/assets/elite-void-art-v2.webp'},
{id:'coral',level:14,name:'Mercan Koruyucusu',english:'Coral Guardian',asset:'/assets/elite-coral-art-v2.webp'},
{id:'sand',level:15,name:'Kum Gezgini',english:'Sand Wanderer',asset:'/assets/elite-sand-art-v2.webp'}
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

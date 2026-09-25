export type EliteShipId=
  'phantom'|'magma'|'glacial'|'kraken'|'ironclad'|'crimson'|'atlantean'|'bone'|'tempest'|'plague'|'sovereign'|'shadow'|'jade'|'ragnarok'|'void';

export type EliteShip={
  id:EliteShipId;level:number;name:string;english:string;role:string;passive:string;ability:string;abilityDescription:string;asset:string;
};

export const ELITE_SHIPS:EliteShip[]=[
{id:'phantom',level:1,name:'Hayalet Kadırga',english:'The Phantom Galleon',role:'Kaçınma ve Hız (PvP)',passive:'%15 darbe almaktan kaçınma',ability:'Hayalet Formu',abilityDescription:'5 saniye boyunca gemilerin içinden geçer ve hasar almaz; bu sırada ateş edemez.',asset:'/assets/elite-phantom-v1.webp'},
{id:'magma',level:2,name:'Volkanik Dreadnought',english:'Volcanic Dreadnought',role:'Yüksek Hasar / DoT',passive:'%10 top hasarı; vuruşlarda %20 ihtimalle 3 saniye yakma',ability:'Lav Püskürtme',abilityDescription:'360 derece ateş dalgasıyla çevredeki düşmanları yakar.',asset:'/assets/elite-magma-v1.webp'},
{id:'glacial',level:3,name:'Buzul Tiranı',english:'Glacial Tyrant',role:'Tank / Kontrol',passive:'%20 ekstra Can ve Kalkan Puanı',ability:'Donma Dalgası',abilityDescription:'Hedef hızını 4 saniyeliğine %50 azaltır.',asset:'/assets/elite-glacial-v1.webp'},
{id:'kraken',level:4,name:"Kraken'in Gazabı",english:"Kraken's Embrace",role:'Bordalama / Yakın Dövüş',passive:'%30 bordalama gücü ve %10 kritik ihtimali',ability:'Dokunaç Tuzağı',abilityDescription:'Yakındaki hedefi 3 saniye durdurur ve bordalamayı garantiler.',asset:'/assets/elite-kraken-v1.webp'},
{id:'ironclad',level:5,name:'Buharlı Zırhlı',english:'Steampunk Ironclad',role:'Kuşatma / Kale Yıkıcı',passive:'Kulelere %40 hasar; %25 zırh; %10 yavaş dolum',ability:'Gülle Yağmuru',abilityDescription:'5 saniye boyunca top dolum süresini sıfırlar.',asset:'/assets/elite-ironclad-v1.webp'},
{id:'crimson',level:6,name:'Kanlı Ay Korveti',english:'Crimson Moon Corsair',role:'Can Çalma / Düello',passive:'Verilen hasarın %7’si kadar Can yeniler',ability:'Kan Hırsı',abilityDescription:'Hedef %30 Can altındayken hız ve kritik hasarı iki katına çıkar.',asset:'/assets/elite-crimson-v1.webp'},
{id:'atlantean',level:7,name:'Kadim Atlantis Muhafızı',english:'Atlantean Sentry',role:'Kalkan / Koruma',passive:'Kalkan sarf malzemesi iki kat etkili (%20 hasar azaltma)',ability:'Koruma Kubbesi',abilityDescription:'6 saniye kendisini ve filo arkadaşlarını menzilli hasardan korur.',asset:'/assets/elite-atlantean-v1.webp'},
{id:'bone',level:8,name:'Kemik Biçici',english:'Bone Harvester',role:'Kritik Hasar Uzmanı',passive:'%25 kritik vuruş hasarı',ability:'Ruh Hasadı',abilityDescription:'Her batırmada 30 saniye %5 hasar kazanır; 3 defa birikir.',asset:'/assets/elite-bone-v1.webp'},
{id:'tempest',level:9,name:'Fırtına Habercisi',english:'Tempest Harbinger',role:'Hızlı Vur-Kaç',passive:'En yüksek temel hız ve %10 zıpkın hasarı',ability:'Yıldırım Zinciri',abilityDescription:'Atış ana hedeften yakındaki iki düşmana sıçrar.',asset:'/assets/elite-tempest-v1.webp'},
{id:'plague',level:10,name:'Kraliyet Sancaktarı',english:'Royal Standard-Bearer',role:'Zayıflatıcı',passive:'Hedefin tamir ve iyileştirmesini %50 azaltır',ability:'Zehirli Sis',abilityDescription:'10 saniyelik zehir bulutu düşmanları yavaşlatır ve sürekli hasar verir.',asset:'/assets/elite-plague-v1.webp'},
{id:'sovereign',level:11,name:'Yeşim Ejderha',english:'Jade Dragon',role:'Filo Lideri',passive:'%20 daha fazla Altın, İnci ve ganimet',ability:"Kralın Emri",abilityDescription:'Yakındaki filo üyelerine 10 saniye %15 top hasarı verir.',asset:'/assets/elite-sovereign-v1.webp'},
{id:'shadow',level:12,name:'Ragnarok Yıkıcısı',english:'Ragnarok Destroyer',role:'Suikastçı',passive:'Yaklaşılana kadar düşman mini haritasında görünmez',ability:'Gölgeden Vuruş',abilityDescription:'Görünmezlikten veya sisten ilk saldırı %100 kritik vurur.',asset:'/assets/elite-shadow-v1.webp'},
{id:'jade',level:13,name:'Hiçlik Hükümdarı',english:'Void Monarch',role:'Seri Atış / Çeviklik',passive:'%15 hızlı dolum ve üstün manevra',ability:'Havai Fişek Yağmuru',abilityDescription:'Özel roketler hedefin isabetini 4 saniyeliğine bozar.',asset:'/assets/elite-jade-v1.webp'},
{id:'ragnarok',level:14,name:'Mercan Koruyucusu',english:'Coral Guardian',role:'Berserker',passive:'Kaybedilen her %10 Can için %4 hasar',ability:'Valhalla Çağrısı',abilityDescription:'Son %1 Canda 4 saniye batmaz ve azami ateş gücüne ulaşır.',asset:'/assets/elite-ragnarok-v1.webp'},
{id:'void',level:15,name:'Kum Gezgini',english:'Sand Wanderer',role:'Hibrit / Hükmedici',passive:'%15 hasar, %15 Can, %10 isabet ve %10 hız',ability:'Tekillik',abilityDescription:'3 saniye boyunca düşmanları merkeze çeken ve hasar veren kara delik açar.',asset:'/assets/elite-void-v1.webp'}
];
export const eliteById=(id:string)=>ELITE_SHIPS.find(ship=>ship.id===id)??ELITE_SHIPS[0];
// Yön sayfaları (elite-dir-<id>-v1.webp, 4 × 2 kare): her karenin gerçekte gösterdiği pusula yönü. Varsayılan düzen
// G, GB, B, KD, K, GD, D, KB; bazı sayfalarda kareler yanlış yöne bakar (ör. kuzeybatı karesi güneydoğuyu gösterir).
// Bir yönün karesi yoksa karşı yönün (D↔B, KD↔KB, GD↔GB) karesi yatay aynalanır.
export const COMPASS=['N','NE','E','SE','S','SW','W','NW'] as const;
export type Compass=typeof COMPASS[number];
const DEFAULT_SHOWS='S SW W NE N SE E NW';
// Kemik Biçici (bone) ve Kadim Atlantis Muhafızı (atlantean) sayfalarında kuzey açısı çizimde yoktu; K karesinde geçici
// olarak KB görünümü durur (kemikte D, B'nin aynasıdır). Gerçek K görünümü gelince aynı kareye konur.
export const ELITE_DIR_SHOWS:Partial<Record<EliteShipId,string>>={
  void:'S SW W NE N SE E SE',
  ragnarok:'S NE W NE N SE E NW',
};
// Pusula dizini (0 = kuzey, saat yönünde 45°) için {kare, ayna}
export function eliteDirFrame(id:EliteShipId,compass:number):{frame:number;mirror:boolean}{
  const shows=(ELITE_DIR_SHOWS[id]??DEFAULT_SHOWS).split(' '),want=COMPASS[compass],opposite=COMPASS[(8-compass)%8];
  const pick=(dir:string)=>{const preferred=DEFAULT_SHOWS.split(' ').indexOf(dir);return shows[preferred]===dir?preferred:shows.indexOf(dir);};
  const direct=pick(want);if(direct>=0)return{frame:direct,mirror:false};
  const mirrored=pick(opposite);return mirrored>=0?{frame:mirrored,mirror:true}:{frame:DEFAULT_SHOWS.split(' ').indexOf(want),mirror:false};
}

// Dünya haritaları: güvenli başlangıç denizi ve geçitlerle bağlı, zorluğu artan bölgeler.
// "Gölgeler Denizi" oyunun ilk haritasıdır; adaları, canavarı ve düşman oranları değiştirilmeden buraya taşındı.
export type MapId='haven'|'shadows'|'crimson'|'storm';
export type IslandLook='verdant'|'misty'|'coral'|'haven'|'crimson'|'storm';
export type WorldIsland={x:number;y:number;r:number;name:string;look:IslandLook;variant:0|1;flip?:boolean};
export type WorldPortal={x:number;y:number;to:MapId};
export type WorldMonster={x:number;y:number;radius:number;name:string;hp:number;look:'deep'|'storm'};
export type WorldMap={
  id:MapId;name:string;subtitle:string;description:string;minLevel:number;safe:boolean;
  danger:number;sea:[string,string];tint:string;labels:{text:string;x:number;y:number}[];
  islands:WorldIsland[];portals:WorldPortal[];monsters:WorldMonster[];
  enemies:{count:number;scoutUntil:number;raiderUntil:number;tierBonus:number}|null;
  driftChests:number;weather?:'storm';chart:[number,number];spawn:{x:number;y:number};
};

export const MAPS:Record<MapId,WorldMap>={
  haven:{id:'haven',name:'Sığınak Koyu',subtitle:'GÜVENLİ SULAR',minLevel:1,safe:true,danger:0,
    description:'Fener Adası’nın koruduğu sakin koy. Burada top ateşlenmez, düşman yoktur ve gövde kendiliğinden onarılır. Batan kaptanlar buraya döner.',
    sea:['#12505a','#0a2f38'],tint:'#6fd6c4',labels:[{text:'SAKİN SULAR',x:1400,y:620}],
    islands:[{x:1400,y:1150,r:230,name:'Fener Adası',look:'haven',variant:0},{x:560,y:2080,r:160,name:'Martı Kayası',look:'verdant',variant:1},{x:2260,y:1980,r:175,name:'Sakin Resif',look:'coral',variant:0},{x:520,y:640,r:140,name:'Yosunlu Kaya',look:'misty',variant:1,flip:true}],
    portals:[{x:2440,y:760,to:'shadows'}],monsters:[],enemies:null,driftChests:0,chart:[.17,.68],spawn:{x:1400,y:1640}},
  shadows:{id:'shadows',name:'Gölgeler Denizi',subtitle:'1. SEVİYE ÜSTÜ',minLevel:1,safe:false,danger:1,
    description:'Kaçakçıların ve Yağmacıların cirit attığı ilk açık deniz. Derinlik Leviathanı güneydoğu sularında dolaşır.',
    sea:['#0e3b48','#071f2a'],tint:'#87c8ca',labels:[{text:'KIZIL SULAR',x:1500,y:1040},{text:'SİS DENİZİ',x:610,y:1800}],
    islands:[{x:760,y:610,r:150,name:'Fırtına Burnu',look:'misty',variant:0},{x:2180,y:710,r:210,name:'Ölü Adam Adası',look:'verdant',variant:0},{x:2250,y:2050,r:170,name:'Mercan Geçidi',look:'coral',variant:1},{x:650,y:2110,r:230,name:'Sis Kayalıkları',look:'misty',variant:1}],
    portals:[{x:1400,y:240,to:'haven'},{x:2600,y:1400,to:'crimson'}],
    monsters:[{x:1980,y:1530,radius:52,name:'Derinlik Leviathanı',hp:180,look:'deep'}],
    enemies:{count:7,scoutUntil:.38,raiderUntil:.82,tierBonus:0},driftChests:4,chart:[.4,.4],spawn:{x:1400,y:1400}},
  crimson:{id:'crimson',name:'Kızıl Resifler',subtitle:'4. SEVİYE ÜSTÜ',minLevel:4,safe:false,danger:2,
    description:'Kızıl kayalıklar arasında Yağmacı filoları ve savaş gemileri devriye gezer. Düşmanlar daha dayanıklı, ganimet daha bol.',
    sea:['#2a3a44','#140f16'],tint:'#e0a58c',labels:[{text:'KAN KÖRFEZİ',x:1350,y:900},{text:'PASLI SIĞLIK',x:1900,y:2150}],
    islands:[{x:820,y:760,r:190,name:'Kan Kayası',look:'crimson',variant:0},{x:2060,y:900,r:160,name:'Paslı Çapa Adası',look:'crimson',variant:1},{x:1250,y:2060,r:210,name:'Kırık Sütunlar',look:'crimson',variant:0,flip:true},{x:2300,y:2230,r:130,name:'Kızıl Diş',look:'crimson',variant:1,flip:true}],
    portals:[{x:200,y:1400,to:'shadows'},{x:1400,y:2600,to:'storm'}],monsters:[],
    enemies:{count:9,scoutUntil:.15,raiderUntil:.62,tierBonus:1},driftChests:4,chart:[.64,.64],spawn:{x:1400,y:1400}},
  storm:{id:'storm',name:'Fırtına Kuşağı',subtitle:'8. SEVİYE ÜSTÜ',minLevel:8,safe:false,danger:3,
    description:'Şimşeklerin hiç dinmediği kara sular. Ağır savaş gemileri ve Fırtına Leviathanı yalnızca en deneyimli kaptanları bekler.',
    sea:['#1d2a3c','#070b14'],tint:'#9fb4e0',labels:[{text:'ŞİMŞEK DENİZİ',x:1400,y:1100}],
    islands:[{x:700,y:800,r:210,name:'Kül Dağı',look:'storm',variant:0},{x:2150,y:1050,r:170,name:'Şimşek Kayalıkları',look:'storm',variant:1},{x:900,y:2150,r:160,name:'Kara Diş',look:'misty',variant:0,flip:true},{x:2250,y:2250,r:150,name:'Sessiz Mezar',look:'storm',variant:1,flip:true}],
    portals:[{x:1400,y:200,to:'crimson'}],
    monsters:[{x:1500,y:1750,radius:62,name:'Fırtına Leviathanı',hp:420,look:'storm'}],
    enemies:{count:10,scoutUntil:.1,raiderUntil:.45,tierBonus:3},driftChests:3,weather:'storm',chart:[.84,.3],spawn:{x:1400,y:1400}},
};
export const MAP_ORDER:MapId[]=['haven','shadows','crimson','storm'];
export const PORTAL_RADIUS=58;
export const WORLD_STORAGE='kara-yelken-world-v1';

// Geçitten çıkınca varış noktası: hedef haritada geldiğimiz yere açılan geçidin önü.
export function arrivalPoint(from:MapId,to:MapId){
  const map=MAPS[to],gate=map.portals.find(p=>p.to===from);
  if(!gate)return{...map.spawn};
  const a=Math.atan2(1400-gate.y,1400-gate.x);
  return{x:gate.x+Math.cos(a)*120,y:gate.y+Math.sin(a)*120};
}
export function loadMapId():MapId{
  try{const id=localStorage.getItem(WORLD_STORAGE);if(id&&id in MAPS)return id as MapId;}catch{}
  return'haven';
}
export function saveMapId(id:MapId){try{localStorage.setItem(WORLD_STORAGE,id);}catch{}}

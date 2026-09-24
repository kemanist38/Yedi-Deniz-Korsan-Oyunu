// Kara Yelken kampanyası: 8 seviye, 16 deniz. Her denizin kendi NPC gemileri, canavarı ve filo adası vardır.
// Güç ve ödüller denizin seviyesiyle birlikte artar.
export type MapKey='1/1'|'1/2'|'2/1'|'2/2'|'3/1'|'3/2'|'4/1'|'4/2'|'5/1'|'5/2'|'6/1'|'6/2'|'7/1'|'7/2'|'8/1'|'8/2';
export type IslandLook='verdant'|'misty'|'coral'|'haven'|'crimson'|'storm'|'ice'|'toxic'|'lava'|'abyss';
export type FleetTheme='verdant'|'coral'|'misty'|'crimson'|'ice'|'toxic'|'lava'|'storm'|'abyss';
export type Weather='fog'|'snow'|'embers'|'spores'|'storm'|'motes'|'sparkle'|'dust'|null;
export type WorldIsland={x:number;y:number;r:number;name:string;look:IslandLook;variant:0|1;flip?:boolean};

export const WORLD_WIDTH=6000,WORLD_HEIGHT=4000;
export const MAX_LEVEL=8;
// Dünya haritası düzeni (üst sıradan alta): 4 × 4, her seviyenin iki denizi yan yana
export const GRID:MapKey[][]=[
  ['7/1','7/2','8/1','8/2'],
  ['5/1','5/2','6/1','6/2'],
  ['3/1','3/2','4/1','4/2'],
  ['1/1','1/2','2/1','2/2'],
];
// Kenar geçişleri sarmaldır: paftanın bir kenarından çıkan karşı kenardan girer (ör. 3/1 batısı ↔ 4/2, 2/1 güneyi ↔ 8/1).
// Bu kural kalıcıdır; değiştirilmemelidir.
export type Dir='north'|'south'|'east'|'west';
export function neighbor(key:MapKey,dir:Dir):MapKey|null{
  const R=GRID.length;
  for(let row=0;row<R;row++){const col=GRID[row].indexOf(key);if(col<0)continue;const C=GRID[row].length;
    const r=(row+(dir==='north'?-1:dir==='south'?1:0)+R)%R,c=(col+(dir==='west'?-1:dir==='east'?1:0)+C)%C;
    return GRID[r][c]??null;}
  return null;
}
export const tierOf=(key:MapKey)=>Number(key.split('/')[0]);

// Seviye atlamak için gereken tecrübe (TP). Hızlı değil ama emekle ulaşılabilir.
export const LEVEL_XP=[0,2000,5000,10000,18000,30000,48000,72000,105000];
export const xpNeed=(level:number)=>level>=MAX_LEVEL?Infinity:LEVEL_XP[level];

type Theme={name:string;sea:[string,string];tint:string;look:IslandLook;fleet:FleetTheme;weather:Weather;label:string};
export const THEMES:Record<number,Theme>={
  1:{name:'Güvenli Harita',sea:['#12505a','#0a2f38'],tint:'#6fd6c4',look:'haven',fleet:'verdant',weather:null,label:'#b7d9d1'},
  2:{name:'İnciyolu Denizi',sea:['#0f6068','#063a44'],tint:'#8ff0dc',look:'coral',fleet:'coral',weather:'sparkle',label:'#c8f4ea'},
  3:{name:'Azurya Denizi',sea:['#14566e','#083343'],tint:'#82cbdc',look:'verdant',fleet:'misty',weather:'sparkle',label:'#c8eaf0'},
  4:{name:'Hayalet Denizi',sea:['#24443f','#0a2225'],tint:'#9fb8b4',look:'misty',fleet:'crimson',weather:'fog',label:'#c8d4ce'},
  5:{name:'Buzmahzen Denizi',sea:['#3e6d86','#17304a'],tint:'#bfe6ff',look:'ice',fleet:'ice',weather:'snow',label:'#e8f6ff'},
  6:{name:'Fırtına Denizi',sea:['#1d3546','#0a1c2b'],tint:'#9fb4e0',look:'storm',fleet:'toxic',weather:'storm',label:'#c8d4f0'},
  7:{name:'Karanlık Uçurum Denizi',sea:['#202737','#090f1e'],tint:'#a79bdb',look:'abyss',fleet:'lava',weather:'motes',label:'#d8c0ff'},
  8:{name:'Alev Denizi',sea:['#343d3e','#121e24'],tint:'#ff8a3a',look:'lava',fleet:'storm',weather:'embers',label:'#ffc090'},
  9:{name:'Karanlık Derinlikler',sea:['#1f1633','#06030e'],tint:'#b070ff',look:'abyss',fleet:'abyss',weather:'motes',label:'#d8c0ff'},
};

// ---------------------------------------------------------------- NPC gemileri
export type NpcDef={id:string;name:string;sprite:string;span:number;role:'light'|'heavy';tier:number;hp:number;damage:number;reload:number;speed:number;gold:number;wood:number;xp:number;portrait:number};
const npc=(id:string,name:string,role:'light'|'heavy',tier:number,sprite=`/assets/ship-${id}.webp`,span=role==='light'?104:112):Omit<NpcDef,'portrait'>=>{
  const hp=role==='light'?42:95,dmg=role==='light'?5:11,t=tier-1;
  return{id,name,sprite,span,role,tier,hp:Math.round(hp*(1+.55*t)),damage:Math.round(dmg*(1+.35*t)),reload:role==='light'?2.6:2.7,speed:(role==='light'?50:34)+t*1.5,
    gold:Math.round((role==='light'?14:32)*(1+.6*t)),wood:Math.round((role==='light'?3:8)*(1+.35*t)),xp:Math.round((role==='light'?22:46)*Math.pow(tier,1.25))};
};
const NPC_LIST:Omit<NpcDef,'portrait'>[]=[
  npc('n1-1-light','Kaçak Balıkçı','light',1),npc('n1-1-heavy','Kıyı Yağmacısı','heavy',1,undefined,104),
  npc('n1-2-light','Kaçakçı Gözcü','light',1,'/assets/enemy-scout-v1.webp'),npc('n1-2-heavy','Yağmacılar','heavy',1,'/assets/enemy-raider-v1.webp',104),
  npc('n2-1-light','Mercan Avcısı','light',2),npc('n2-1-heavy','Kızıl Savaş Gemisi','heavy',2,'/assets/enemy-warship-v1.webp',104),
  npc('n2-2-light','İnci Dalgıcı','light',2),npc('n2-2-heavy','Resif Fırkateyni','heavy',2),
  npc('n3-1-light','Sis Hayaleti','light',3),npc('n3-1-heavy','Sisli Brik','heavy',3,undefined,104),
  npc('n3-2-light','Kemik Kayığı','light',3),npc('n3-2-heavy','Batık Kalyon','heavy',3,undefined,124),
  npc('n4-1-light','Kan Korsanı','light',4,undefined,104),npc('n4-1-heavy','Kanlı Fırkateyn','heavy',4),
  npc('n4-2-light','Pas Yağmacısı','light',4),npc('n4-2-heavy','Demir Ejder','heavy',4),
  npc('n5-1-light','Ayaz Avcısı','light',5),npc('n5-1-heavy','Buz Kırıcı','heavy',5,undefined,104),
  npc('n5-2-light','Kristal Kayık','light',5),npc('n5-2-heavy','Kutup Kalyonu','heavy',5,undefined,124),
  npc('n6-1-light','Bataklık Kaçakçısı','light',6),npc('n6-1-heavy','Zehir Brigi','heavy',6,undefined,104),
  npc('n6-2-light','Çürük Kürekçi','light',6),npc('n6-2-heavy','Veba Kalyonu','heavy',6,undefined,124),
  npc('n7-1-light','Kül Korsanı','light',7,undefined,104),npc('n7-1-heavy','Alev Fırkateyni','heavy',7),
  npc('n7-2-light','Ateş Kayığı','light',7),npc('n7-2-heavy','Lav Ejderi','heavy',7),
  npc('n8-1-light','Fırtına Avcısı','light',8),npc('n8-1-heavy','Şimşek Fırkateyni','heavy',8),
  npc('n8-2-light','Kasırga Brigi','light',8,undefined,104),npc('n8-2-heavy','Gök Gürültüsü Kalyonu','heavy',8,undefined,124),
  npc('n9-1-light','Gölge Kayığı','light',9),npc('n9-1-heavy','Uçurum Ejderi','heavy',9),
  npc('n9-2-light','Kara Muhafız','light',9,undefined,112),npc('n9-2-heavy','Karanlık Kalyon','heavy',9,undefined,124),
];
export const NPCS:Record<string,NpcDef>=Object.fromEntries(NPC_LIST.map((n,i)=>[n.id,{...n,portrait:i}]));

// ---------------------------------------------------------------- Canavarlar
export type MonsterDef={id:string;name:string;sprite:string;span:number;frame:number;anchorY:number;radius:number;tier:number;hp:number;damage:number;reload:number;gold:number;wood:number;pearls:number;xp:number;portrait:number};
const mon=(id:string,name:string,tier:number,radius=54,sprite=`/assets/monster-${id}.webp`,span=140,anchorY=133.4):Omit<MonsterDef,'portrait'>=>{const t=tier-1;
  return{id,name,sprite,span,frame:256,anchorY,radius,tier,hp:Math.round(320*(1+.7*t)),damage:Math.round(10*(1+.35*t)),reload:2.8-t*.08,gold:Math.round(110*(1+.6*t)),wood:Math.round(15*(1+.4*t)),pearls:2+Math.floor(tier/2),xp:Math.round(240*Math.pow(tier,1.25))};};
const MONSTER_LIST:Omit<MonsterDef,'portrait'>[]=[
  mon('m1-1','Yosun Yengeci',1,50),mon('m1-2','Kıyı Yılanı',1,56),
  mon('m2-1','Derinlik Leviathanı',2,54,'/assets/leviathan-v1.webp',132,130.9),mon('m2-2','İnci Denizanası',2,50),
  mon('m3-1','Sis Yılanı',3,58),mon('m3-2','Kemik Hidrası',3,56),
  mon('m4-1','Kızıl Yengeç',4,54),mon('m4-2','Pas Kaplumbağası',4,58),
  mon('m5-1','Buz Yılanı',5,60),mon('m5-2','Buzul Kaplumbağası',5,60),
  mon('m6-1','Zehir Denizanası',6,54),mon('m6-2','Bataklık Hidrası',6,60),
  mon('m7-1','Magma Yengeci',7,58),mon('m7-2','Alev Yılanı',7,62),
  mon('m8-1','Fırtına Leviathanı',8,62,'/assets/leviathan-storm-v1.webp',132,130.9),mon('m8-2','Kasırga Denizanası',8,58),
  mon('m9-1','Uçurum Krakeni',9,64),mon('m9-2','Kadim Hidra',9,66),
];
export const MONSTERS:Record<string,MonsterDef>=Object.fromEntries(MONSTER_LIST.map((m,i)=>[m.id,{...m,portrait:NPC_LIST.length+i}]));
export const BOSS_PORTRAIT=NPC_LIST.length+MONSTER_LIST.length;
export const PORTRAIT_COUNT=BOSS_PORTRAIT+1;
export const PORTRAIT_COLS=10;
export const PORTRAIT_ATLAS='/assets/portraits-v2.webp';

// ---------------------------------------------------------------- Koordinat ızgarası
// Seafight tarzı: üstte soldan sağa 00–60 sütun, solda yukarıdan aşağı AA–CZ satır. Konum "35AJ" gibi yazılır.
export const GRID_COLS=61,GRID_ROWS=78,CELL_W=WORLD_WIDTH/GRID_COLS,CELL_H=WORLD_HEIGHT/GRID_ROWS;
export const colName=(c:number)=>String(c).padStart(2,'0');
export const rowName=(r:number)=>String.fromCharCode(65+Math.floor(r/26))+String.fromCharCode(65+r%26);
export const gridCell=(p:{x:number;y:number})=>({c:Math.max(0,Math.min(GRID_COLS-1,Math.floor(p.x/CELL_W))),r:Math.max(0,Math.min(GRID_ROWS-1,Math.floor(p.y/CELL_H)))});
export function coordLabel(p:{x:number;y:number}){const g=gridCell(p);return`${colName(g.c)}${rowName(g.r)}`;}

// ---------------------------------------------------------------- Filo adası
// Seafight tarzı: düzensiz kumsallı ada (islandR), koyu sur halkası (wallR, açıklık güneyde),
// sur içinde lagün (lagoon) ve lagünü denize bağlayan kanal (|x|<channelW). Burç lagünün kuzeyinde.
// tools/asset-studio/fleet-raster-mask.py ile seyir maskesi yeniden üretilir.
// Filo adası görseli (fleet-base-approved-v1, 1000 birim): güneyden kanalla girilen lagün kalesi. Seyir alanı src/fleetMask.ts
// maskesinden gelir; kuleler görseldeki 8 sur kulesinin üzerindedir. lagoon: lagünün ortası (rota hedefi).
export const FLEET={islandR:500,wallR:370,gap:.56,lagoon:{x:0,y:60,r:150},channelW:70,keep:{x:0,y:-280},
  // Approved v1 base, 1000 world units. Preserve slot order for saved guild towers.
  towers:[[-230,-360],[-364,-189],[-328,70],[-121,214],[146,214],[337,70],[361,-193],[242,-360]] as [number,number][],
  base:{frame:1024,span:1000},tower:{frame:256,span:120,anchorY:0}};
// Kuleler filo savaşı ölçeğinde: tek gemi yıkamaz, saldırı kesilince hızla onarılır.
export const fleetTower=(tier:number)=>{const t=tier-1;return{hp:Math.round(40000*(1+.6*t)),damage:Math.round(7*(1+.35*t)),reload:2.2,range:460,ownDamage:Math.round(24*(1+.5*t))};};
export const fleetReward=(tier:number)=>({gold:300*tier,pearls:3+tier,xp:Math.round(500*Math.pow(tier,1.2))});

// ---------------------------------------------------------------- Denizler
export type MapDef={key:MapKey;tier:number;name:string;description:string;safe:boolean;npcs:[string,string];monster:string;npcCount:number;heavyShare:number;islands:WorldIsland[];fleet:{x:number;y:number;name:string};labels:{text:string;x:number;y:number}[];spawn:{x:number;y:number}};
const I=(x:number,y:number,r:number,name:string,look:IslandLook,variant:0|1,flip=false):WorldIsland=>({x,y,r,name,look,variant,flip});
function sea(key:MapKey,name:string,description:string,opts:{islands:[number,number,number,string,0|1,boolean?][];fleet:[number,number,string];labels?:[string,number,number][];safe?:boolean;look?:IslandLook;count?:number;heavy?:number}):MapDef{
  const tier=tierOf(key),look=opts.look??THEMES[tier].look,sub=key.split('/')[1];
  return{key,tier,name,description,safe:!!opts.safe,npcs:[`n${tier}-${sub}-light`,`n${tier}-${sub}-heavy`],monster:`m${tier}-${sub}`,npcCount:opts.count??(7+Math.min(4,tier-1)),heavyShare:opts.heavy??(.3+tier*.03),
    islands:opts.islands.map(([x,y,r,n,v,f])=>I(x,y,r,n,look,v,!!f)),fleet:{x:opts.fleet[0],y:opts.fleet[1],name:opts.fleet[2]},labels:(opts.labels??[]).map(([text,x,y])=>({text,x,y})),spawn:{x:opts.fleet[0],y:opts.fleet[1]+530}};
}
export const MAPS:Record<MapKey,MapDef>={
  '1/1':{...sea('1/1','Sığınak Koyu','Savaşa kapalı başlangıç denizi. Filo adanın lagününde gövde kendiliğinden onarılır; buradaki gemiler sen saldırmadıkça ateş açmaz.',
    {islands:[[640,700,170,'Martı Kayası',1],[2520,820,190,'Yosunlu Burun',0,true],[2560,2560,160,'Sakin Resif',1]],fleet:[1500,1900,'Sığınak Filo Adası'],labels:[['SAKİN SULAR',1600,700]],safe:true,count:6,heavy:.25}),islands:[I(640,700,170,'Martı Kayası','haven',1),I(2520,820,190,'Yosunlu Burun','verdant',0,true),I(2560,2560,160,'Sakin Resif','coral',1)]},
  '1/2':sea('1/2','Martı Kıyıları','Kaçakçıların ve Yağmacıların ilk av sahası. Kıyı Yılanı sığlıklarda dolaşır.',{safe:true,islands:[[700,650,180,'Fırtına Burnu',0],[2500,700,210,'Ölü Adam Adası',1],[650,2500,200,'Sis Kayalıkları',0,true]],fleet:[2150,2150,'Martı Filo Adası'],labels:[['KIYI SULARI',1400,1000]]}),
  '2/1':sea('2/1','Mercan Geçidi','Mercan resifleri arasında savaş gemileri devriye gezer. Derinlik Leviathanı buradadır.',{islands:[[650,700,190,'Mercan Kalesi',0],[2550,600,160,'Pembe Resif',1],[600,2550,170,'Deniz Kabuğu',1,true]],fleet:[2050,2100,'Mercan Filo Adası'],labels:[['MERCAN GEÇİDİ',1300,900]]}),
  '2/2':sea('2/2','İnci Resifleri','İnci dalgıçlarının ve resif fırkateynlerinin sığ, parlak suları.',{islands:[[2550,700,180,'İnci Adası',1],[700,650,200,'Lagün Adası',0,true],[2600,2550,150,'Midye Kayası',0]],fleet:[1150,2100,'İnci Filo Adası'],labels:[['İNCİ SIĞLIĞI',1900,1000]]}),
  '3/1':sea('3/1','Sis Kayalıkları','Görüşün kısaldığı gri sular. Sis Yılanı dalgaların arasından çıkar.',{islands:[[650,650,200,'Sis Burnu',0],[2550,650,180,'Kayıp Fener',1],[2550,2550,190,'Yankı Kayası',0,true]],fleet:[1200,2150,'Sis Filo Adası'],labels:[['SİS DENİZİ',2000,1300]]}),
  '3/2':sea('3/2','Hayalet Boğazı','Batık gemilerin dirildiği boğaz. Kemik Hidrası derinlerden yükselir.',{islands:[[700,2550,210,'Mezar Adası',1],[2500,2550,170,'Kemik Kıyısı',0],[2550,650,190,'Batıklar Burnu',1,true]],fleet:[1200,1100,'Hayalet Filo Adası'],labels:[['HAYALET BOĞAZI',2000,1800]]}),
  '4/1':sea('4/1','Kan Körfezi','Kan korsanlarının ve kanlı fırkateynlerin kızıl körfezi.',{islands:[[650,650,190,'Kan Kayası',0],[2550,700,160,'Kızıl Diş',1],[650,2550,200,'Kırık Sütunlar',0,true]],fleet:[2050,2100,'Kızıl Filo Adası'],labels:[['KAN KÖRFEZİ',1300,1000]]}),
  '4/2':sea('4/2','Paslı Sığlık','Paslı çapaların ve demir ejderlerin sığ, bulanık suları.',{islands:[[2550,650,190,'Paslı Çapa Adası',1],[650,700,170,'Hurda Kıyısı',0,true],[2500,2550,200,'Demir Kayalık',0]],fleet:[1150,2100,'Pas Filo Adası'],labels:[['PASLI SIĞLIK',1900,1000]]}),
  '5/1':sea('5/1','Ayaz Boğazı','Buz kütleleri arasında Ayaz Avcıları ve Buz Kırıcılar dolaşır.',{islands:[[650,650,200,'Ayaz Tepesi',0],[2550,650,180,'Donmuş Fener',1],[650,2550,180,'Kar Kayası',1,true]],fleet:[2050,2100,'Ayaz Filo Adası'],labels:[['AYAZ BOĞAZI',1300,1000]]}),
  '5/2':sea('5/2','Kristal Buzullar','Kristal buzulların parıldadığı soğuk derinlikler.',{islands:[[2550,650,210,'Kristal Buzul',0],[650,700,170,'Işıltı Kayası',1,true],[2550,2550,180,'Kutup Kapısı',1]],fleet:[1150,2100,'Kristal Filo Adası'],labels:[['KRİSTAL BUZULLAR',1900,1000]]}),
  '6/1':sea('6/1','Zehirli Mangrov','Zehir sisinin çöktüğü mangrov bataklıkları.',{islands:[[650,650,200,'Mangrov Kökü',0],[2550,650,170,'Çamur Kıyısı',1],[650,2550,190,'Sarmaşık Adası',1,true]],fleet:[2050,2100,'Mangrov Filo Adası'],labels:[['ZEHİRLİ MANGROV',1300,1000]]}),
  '6/2':sea('6/2','Çürük Lagün','Veba kalyonlarının demir attığı çürümüş lagün.',{islands:[[2550,650,190,'Çürük Ada',0],[650,700,180,'Balçık Kayası',1,true],[2500,2550,200,'Veba Kıyısı',1]],fleet:[1150,2100,'Lagün Filo Adası'],labels:[['ÇÜRÜK LAGÜN',1900,1000]]}),
  '7/1':sea('7/1','Kül Adaları','Kül yağan volkanik adalar. Magma Yengeci lav gölcüklerinde gezinir.',{islands:[[650,650,210,'Kül Dağı',0],[2550,650,180,'Duman Kayası',1],[650,2550,170,'Kor Adası',1,true]],fleet:[2050,2100,'Alev Filo Adası'],labels:[['KÜL ADALARI',1300,1000]]}),
  '7/2':sea('7/2','Magma Boğazı','Lav nehirlerinin denize döküldüğü kaynayan boğaz.',{islands:[[2550,650,200,'Magma Kapısı',1],[650,700,180,'Yanık Kıyı',0,true],[2550,2550,190,'Ateş Çukuru',0]],fleet:[1150,2100,'Magma Filo Adası'],labels:[['MAGMA BOĞAZI',1900,1000]]}),
  '8/1':sea('8/1','Şimşek Denizi','Şimşeklerin hiç dinmediği kara sular. Fırtına Leviathanı burada hüküm sürer.',{islands:[[650,650,200,'Şimşek Kayalıkları',0],[2550,650,170,'Gök Kulesi',1],[650,2550,190,'Sessiz Mezar',1,true]],fleet:[2050,2100,'Fırtına Filo Adası'],labels:[['ŞİMŞEK DENİZİ',1300,1000]]}),
  '8/2':sea('8/2','Kasırga Gözü','Kasırganın ortasında sakin ama ölümcül bir göz.',{islands:[[2550,650,190,'Kasırga Burnu',1],[650,700,180,'Rüzgâr Kayası',0,true],[2550,2550,200,'Gürültü Adası',0]],fleet:[1150,2100,'Kasırga Filo Adası'],labels:[['KASIRGA GÖZÜ',1900,1000]]}),
};
export const MAP_KEYS=Object.keys(MAPS) as MapKey[];

// User's world chart is authoritative for names; keys and wrap connections stay stable.
const SEA_LORE:Record<number,string>={
  1:'Kaptanların dinlendiği korunaklı kıyılar.',
  2:'İnci gibi parlayan adalar, sakin meltemler ve denizkızlarının ezgileri.',
  3:'Gökyüzünü yansıtan mavi sularda kadim uygarlıkların izleri saklıdır.',
  4:'Gölgegeçit efsanesinin suları: sis içindeki görünmez kapılar ve kayıp gemiler.',
  5:'Sonsuz kışın hüküm sürdüğü, buz altında kadim hazinelerin saklandığı deniz.',
  6:'Fırtına Tahtı efsanesinin denizi; rüzgârların ve cesur kaptanların sınavı.',
  7:'Karanlık derinliklerde unutulmuş güçlerin ve kayıp sırların denizi.',
  8:'Alev Suları efsanesi: volkanların kızgın lavlarıyla çevrili kayalıklar.',
};
export function islandLayout(key:MapKey,fleet:{x:number;y:number}):WorldIsland[]{
  let seed=2166136261;for(const c of `seven-seas-v1:${key}`)seed=Math.imul(seed^c.charCodeAt(0),16777619);
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const result:WorldIsland[]=[],tier=tierOf(key),count=8+Math.floor(random()*4);
  for(let attempt=0;attempt<1000&&result.length<count;attempt++){
    const r=90+Math.floor(random()*65),x=Math.round(300+random()*(WORLD_WIDTH-600)),y=Math.round(300+random()*(WORLD_HEIGHT-600));
    if(tier>=5&&Math.hypot(x-fleet.x,y-fleet.y)<FLEET.islandR+r+400)continue;
    if(result.some(i=>Math.hypot(x-i.x,y-i.y)<i.r+r+230))continue;
    result.push(I(x,y,r,`${THEMES[tier].name} · Adacık ${result.length+1}`,THEMES[tier].look,random()<.5?0:1,random()<.5));
  }
  return result;
}
for(const key of MAP_KEYS){
  const map=MAPS[key];map.name=THEMES[map.tier].name;map.description=SEA_LORE[map.tier];
  map.fleet.x=Math.round(map.fleet.x*WORLD_WIDTH/3200);map.fleet.y=Math.round(map.fleet.y*WORLD_HEIGHT/3200);
  map.islands=islandLayout(key,map.fleet);
  map.labels=[{text:map.name.toLocaleUpperCase('tr'),x:WORLD_WIDTH/2,y:WORLD_HEIGHT/2}];
  map.spawn={x:map.fleet.x,y:Math.min(WORLD_HEIGHT-200,map.fleet.y+900)};
}

// ---------------------------------------------------------------- Görevler (seviyeye göre)
export type QuestDef={id:string;tier:number;title:string;description:string;kind:'npc'|'monster'|'chest';ids:string[];required:number;gold:number;wood:number;xp:number;pearls:number};
const tierMaps=(t:number)=>MAP_KEYS.filter(k=>tierOf(k)===t).map(k=>MAPS[k]);
export const QUESTS:QuestDef[]=[1,2,3,4,5,6,7,8,9].flatMap(t=>{
  const maps=tierMaps(t),light=maps.map(m=>m.npcs[0]),heavy=maps.map(m=>m.npcs[1]),monsters=maps.map(m=>m.monster),theme=THEMES[t].name,scale=(v:number)=>Math.round(v*Math.pow(t,1.3));
  const names=(ids:string[],src:Record<string,{name:string}>)=>ids.map(id=>src[id].name).join(' ve ');
  return[
    {id:`q${t}-light`,tier:t,title:`${theme}: Devriye Avı`,description:`${names(light,NPCS)} gemilerinden ${10+t*2} tanesini batır.`,kind:'npc',ids:light,required:10+t*2,gold:scale(90),wood:scale(18),xp:scale(260),pearls:1+Math.ceil(t/2)},
    {id:`q${t}-heavy`,tier:t,title:`${theme}: Ağır Filo`,description:`${names(heavy,NPCS)} gemilerinden ${6+t} tanesini denizin dibine gönder.`,kind:'npc',ids:heavy,required:6+t,gold:scale(160),wood:scale(30),xp:scale(420),pearls:2+t},
    {id:`q${t}-monster`,tier:t,title:`${theme}: Canavar Avı`,description:`${names(monsters,MONSTERS)} canavarlarından ${t<5?1:2} tanesini yen.`,kind:'monster',ids:monsters,required:t<5?1:2,gold:scale(220),wood:scale(40),xp:scale(600),pearls:3+t},
    {id:`q${t}-chest`,tier:t,title:`${theme}: Ganimet Avı`,description:`Denizlerde sürüklenen ya da batan gemilerden kalan ${6+t} ganimet sandığını topla.`,kind:'chest',ids:['any'],required:6+t,gold:scale(260),wood:scale(50),xp:scale(700),pearls:4+t},
  ];
});
export const QUEST_COOLDOWN_MS=2*60*60*1000;

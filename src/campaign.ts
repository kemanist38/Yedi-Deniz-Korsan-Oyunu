// Kara Yelken kampanyası: 8 seviye, 16 deniz (her seviyenin iki haritası aynı denizdedir). Her denizin kendi NPC gemileri, canavarı ve filo adası vardır.
// Güç ve ödüller denizin seviyesiyle birlikte artar.
export type MapKey='1/1'|'1/2'|'2/1'|'2/2'|'3/1'|'3/2'|'4/1'|'4/2'|'5/1'|'5/2'|'6/1'|'6/2'|'7/1'|'7/2'|'8/1'|'8/2';
// Ada teması: public/assets/isles-<tema>-v1.webp (tools/asset-studio/isles.js)
export type IslandLook='haven'|'pearl'|'azure'|'ghost'|'frost'|'storm'|'abyss'|'flame';
export type FleetTheme='verdant'|'coral'|'misty'|'crimson'|'ice'|'toxic'|'lava'|'storm'|'abyss';
export type Weather='fog'|'snow'|'embers'|'spores'|'storm'|'motes'|'sparkle'|'dust'|null;
// variant: ada biçimi (src/islesMeta.ts ISLE_SHAPES sırası); r: çarpışma yarıçapı
export type WorldIsland={x:number;y:number;r:number;name:string;look:IslandLook;variant:number;flip?:boolean};

// Harita boyutu Seafight'taki gibi 6000 × 4000
export const WORLD_W=6000,WORLD_H=4000;
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
  2:{name:'İnciyolu Denizi',sea:['#0f6a70','#064048'],tint:'#8ff0dc',look:'pearl',fleet:'coral',weather:'sparkle',label:'#c8f4ea'},
  3:{name:'Azurya Denizi',sea:['#15507e','#0a2a4a'],tint:'#8fc8ff',look:'azure',fleet:'coral',weather:null,label:'#c8e0ff'},
  4:{name:'Hayalet Denizi',sea:['#2f4a52','#122229'],tint:'#9fb8b4',look:'ghost',fleet:'misty',weather:'fog',label:'#c8d4ce'},
  5:{name:'Buzmahzen Denizi',sea:['#3e6d86','#17304a'],tint:'#bfe6ff',look:'frost',fleet:'ice',weather:'snow',label:'#e8f6ff'},
  6:{name:'Fırtına Denizi',sea:['#1d2a3c','#070b14'],tint:'#9fb4e0',look:'storm',fleet:'storm',weather:'storm',label:'#c8d4f0'},
  7:{name:'Karanlık Uçurum Denizi',sea:['#1f1633','#06030e'],tint:'#b070ff',look:'abyss',fleet:'abyss',weather:'motes',label:'#d8c0ff'},
  8:{name:'Alev Denizi',sea:['#3a1c14','#120605'],tint:'#ff8a3a',look:'flame',fleet:'lava',weather:'embers',label:'#ffc090'},
};

// ---------------------------------------------------------------- NPC gemileri
export type NpcDef={id:string;name:string;sprite:string;span:number;role:'light'|'heavy';tier:number;hp:number;damage:number;reload:number;speed:number;gold:number;wood:number;xp:number;portrait:number};
const npc=(id:string,name:string,role:'light'|'heavy',tier:number,sprite=`/assets/ship-${id}.webp`,span=role==='light'?104:112):Omit<NpcDef,'portrait'>=>{
  const hp=role==='light'?42:95,dmg=role==='light'?5:11,t=tier-1;
  return{id,name,sprite,span,role,tier,hp:Math.round(hp*(1+.55*t)),damage:Math.round(dmg*(1+.35*t)),reload:role==='light'?2.6:2.7,speed:(role==='light'?50:34)+t*1.5,
    gold:Math.round((role==='light'?14:32)*(1+.6*t)),wood:Math.round((role==='light'?3:8)*(1+.35*t)),xp:Math.round((role==='light'?22:46)*Math.pow(tier,1.25))};
};
// Kimlikteki rakam gemi görselinin ilk temasıdır; 4. alan (tier) geminin kullanıldığı denizin seviyesi ve güç ölçeğidir.
// Deniz → görsel eşlemesi: ART_TIER. Sıra portre atlasıyla (portraits-v2) aynı kalmalıdır.
const NPC_LIST:Omit<NpcDef,'portrait'>[]=[
  npc('n1-1-light','Kaçak Balıkçı','light',1),npc('n1-1-heavy','Kıyı Yağmacısı','heavy',1,undefined,104),
  npc('n1-2-light','Kaçakçı Gözcü','light',1,'/assets/enemy-scout-v1.webp'),npc('n1-2-heavy','Yağmacılar','heavy',1,'/assets/enemy-raider-v1.webp',104),
  npc('n2-1-light','Mercan Avcısı','light',2),npc('n2-1-heavy','Kızıl Savaş Gemisi','heavy',2,'/assets/enemy-warship-v1.webp',104),
  npc('n2-2-light','İnci Dalgıcı','light',2),npc('n2-2-heavy','Resif Fırkateyni','heavy',2),
  npc('n3-1-light','Sis Hayaleti','light',4),npc('n3-1-heavy','Sisli Brik','heavy',4,undefined,104),
  npc('n3-2-light','Kemik Kayığı','light',4),npc('n3-2-heavy','Batık Kalyon','heavy',4,undefined,124),
  npc('n4-1-light','Kan Korsanı','light',3,undefined,104),npc('n4-1-heavy','Kanlı Fırkateyn','heavy',3),
  npc('n4-2-light','Pas Yağmacısı','light',3),npc('n4-2-heavy','Demir Ejder','heavy',3),
  npc('n5-1-light','Ayaz Avcısı','light',5),npc('n5-1-heavy','Buz Kırıcı','heavy',5,undefined,104),
  npc('n5-2-light','Kristal Kayık','light',5),npc('n5-2-heavy','Kutup Kalyonu','heavy',5,undefined,124),
  npc('n6-1-light','Bataklık Kaçakçısı','light',9),npc('n6-1-heavy','Zehir Brigi','heavy',9,undefined,104),
  npc('n6-2-light','Çürük Kürekçi','light',9),npc('n6-2-heavy','Veba Kalyonu','heavy',9,undefined,124),
  npc('n7-1-light','Kül Korsanı','light',8,undefined,104),npc('n7-1-heavy','Alev Fırkateyni','heavy',8),
  npc('n7-2-light','Ateş Kayığı','light',8),npc('n7-2-heavy','Lav Ejderi','heavy',8),
  npc('n8-1-light','Fırtına Avcısı','light',6),npc('n8-1-heavy','Şimşek Fırkateyni','heavy',6),
  npc('n8-2-light','Kasırga Brigi','light',6,undefined,104),npc('n8-2-heavy','Gök Gürültüsü Kalyonu','heavy',6,undefined,124),
  npc('n9-1-light','Gölge Kayığı','light',7),npc('n9-1-heavy','Uçurum Ejderi','heavy',7),
  npc('n9-2-light','Kara Muhafız','light',7,undefined,112),npc('n9-2-heavy','Karanlık Kalyon','heavy',7,undefined,124),
];
export const NPCS:Record<string,NpcDef>=Object.fromEntries(NPC_LIST.map((n,i)=>[n.id,{...n,portrait:i}]));

// ---------------------------------------------------------------- Canavarlar
export type MonsterDef={id:string;name:string;sprite:string;span:number;frame:number;anchorY:number;radius:number;tier:number;hp:number;damage:number;reload:number;gold:number;wood:number;pearls:number;xp:number;portrait:number};
const mon=(id:string,name:string,tier:number,radius=54,sprite=`/assets/monster-${id}.webp`,span=140,anchorY=133.4):Omit<MonsterDef,'portrait'>=>{const t=tier-1;
  return{id,name,sprite,span,frame:256,anchorY,radius,tier,hp:Math.round(320*(1+.7*t)),damage:Math.round(10*(1+.35*t)),reload:2.8-t*.08,gold:Math.round(110*(1+.6*t)),wood:Math.round(15*(1+.4*t)),pearls:2+Math.floor(tier/2),xp:Math.round(240*Math.pow(tier,1.25))};};
const MONSTER_LIST:Omit<MonsterDef,'portrait'>[]=[
  mon('m1-1','Yosun Yengeci',1,50),mon('m1-2','Kıyı Yılanı',1,56),
  mon('m2-1','Derinlik Leviathanı',2,54,'/assets/leviathan-v1.webp',132,130.9),mon('m2-2','İnci Denizanası',2,50),
  mon('m3-1','Sis Yılanı',4,58),mon('m3-2','Kemik Hidrası',4,56),
  mon('m4-1','Kızıl Yengeç',3,54),mon('m4-2','Pas Kaplumbağası',3,58),
  mon('m5-1','Buz Yılanı',5,60),mon('m5-2','Buzul Kaplumbağası',5,60),
  mon('m6-1','Zehir Denizanası',9,54),mon('m6-2','Bataklık Hidrası',9,60),
  mon('m7-1','Magma Yengeci',8,58),mon('m7-2','Alev Yılanı',8,62),
  mon('m8-1','Fırtına Leviathanı',6,62,'/assets/leviathan-storm-v1.webp',132,130.9),mon('m8-2','Kasırga Denizanası',6,58),
  mon('m9-1','Uçurum Krakeni',7,64),mon('m9-2','Kadim Hidra',7,66),
];
export const MONSTERS:Record<string,MonsterDef>=Object.fromEntries(MONSTER_LIST.map((m,i)=>[m.id,{...m,portrait:NPC_LIST.length+i}]));
export const BOSS_PORTRAIT=NPC_LIST.length+MONSTER_LIST.length;
export const PORTRAIT_COUNT=BOSS_PORTRAIT+1;
export const PORTRAIT_COLS=10;
export const PORTRAIT_ATLAS='/assets/portraits-v2.webp';

// ---------------------------------------------------------------- Koordinat ızgarası
// Seafight tarzı: üstte soldan sağa 00–60 sütun, solda yukarıdan aşağı AA–CZ satır. Konum "35AJ" gibi yazılır.
export const GRID_COLS=60,GRID_ROWS=40,CELL_W=WORLD_W/GRID_COLS,CELL_H=WORLD_H/GRID_ROWS;
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
// Denizlerin öyküleri ("7 Deniz Efsanesi")
const SEA_LORE:Record<number,string>={
  1:'Korunaklı başlangıç suları. Filo adanın lagününde gövde kendiliğinden onarılır; buradaki gemiler sen saldırmadıkça ateş açmaz.',
  2:'İnci gibi parlayan adalarıyla ünlüdür. Rüzgârı bile meltemdir bu denizde. Denizkızlarının şarkıları, yolculara huzur ve şans getirir.',
  3:'Gökyüzünün mavisini yansıtan bu deniz, kadim uygarlıkların bilgeliğini saklar. Dalgalarının arasında kaybolanlar, geçmişin sırlarını duyarmış.',
  4:'Görünmeyen kapılar bu denizde açılır. Bir an burada, bir an başka diyarlardasın. Kaybolan gemiler bazen başka zamanlarda yeniden görülür.',
  5:'Sonsuz kışın hüküm sürdüğü bu deniz, eski kralların lanetli hazinelerini korur. Buzlar arasında yürüyenler bir daha geri dönmez.',
  6:'Rüzgârların efendilerinin savaştığı deniz. Fırtınalar bir anda doğar, bir anda diner. Cesur kaptanlar için zafer, korkaklar için mezardır.',
  7:'Bu deniz yıldız ışığını bile yutar. Efsaneye göre derinliklerinde eski tanrıların zincire vurulmuş öfkesi uyanmaya mahkûmdur.',
  8:'Volkanların kükreyişiyle ısınan bu deniz, öfkeli ruhların diyarıdır. Gemiler burada ya kül olur ya da efsaneye dönüşür.',
};
const ISLE_NAMES:Record<IslandLook,string[]>={
  haven:['Martı Kayası','Liman Tepesi','Sakin Koy','Yosunlu Burun','Balıkçı Adası','Çınar Tepe','Kumlu Kıyı','Fener Burnu','Güvercin Adası','Zeytin Koyu','Söğüt Adası','Tuzla Kayası'],
  pearl:['İnci Koyu','Sedef Adası','Mercan Tepe','Denizkızı Kayası','Şans Burnu','Meltem Adası','Istakoz Koyu','Parıltı Kayası','Sedefli Kıyı','Midye Adası','Şarkı Koyu','Gümüş Kum'],
  azure:['Kadim Tapınak','Mavi Kubbe','Bilge Tepesi','Sütunlu Ada','Kayıp Kitaplık','Gök Kayası','Mermer Koy','Kâhin Burnu','Mavi Liman','Yıldız Rasathanesi','Sır Adası','Lacivert Kaya'],
  ghost:['Sis Kapısı','Kayıp Zaman Adası','Hayalet Koy','Solgun Kaya','Unutulmuş Liman','Gölge Tepesi','Fısıltı Burnu','Kemik Adası','Yitik Fener','Ölü Rüzgâr Koyu','Silik Kıyı','Ara Kapı'],
  frost:['Buz Mahzeni','Ayaz Tepesi','Donmuş Taç','Kar Burnu','Lanetli Hazine Adası','Kristal Koy','Soğuk Liman','Kral Kayası','Kırağı Adası','Buzul Kapısı','Beyaz Sessizlik','Donuk Fener'],
  storm:['Şimşek Tepesi','Rüzgâr Burnu','Kasırga Kayası','Gök Gürültüsü Adası','Yıldırım Koyu','Fırtına Limanı','Dalgakıran','Rüzgâr Efendisi','Kara Bulut Adası','Uğultu Kayası','Dönen Koy','Yağmur Tepesi'],
  abyss:['Kara Uçurum','Zincirli Tanrı Kayası','Yıldızsız Ada','Karanlık Taç','Mor Kristal','Derin Kapı','Suskun Tepe','Gece Koyu','Boşluk Burnu','Yutan Kaya','Eski Tanrı Adası','Sonsuz Gölge'],
  flame:['Kül Tepesi','Lav Koyu','Kor Adası','Ateş Tacı','Duman Burnu','Kızıl Kaya','Volkan Limanı','Öfke Adası','Magma Kıyısı','Yanık Burun','Kükreyen Tepe','Alev Kapısı'],
};
// Ada biçimleri (sıra src/islesMeta.ts ile aynı): r çarpışma yarıçapı, w dağıtımdaki ağırlık
const ISLE_KINDS=[{r:190,w:2},{r:260,w:1},{r:215,w:1},{r:115,w:2},{r:80,w:2},{r:100,w:2},{r:140,w:2}];
function seeded(key:string){let h=2166136261;for(const ch of key)h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296;};}
// Adalar her deniz için tohumlu rastgele dağıtılır: filo adasından, doğuş noktasından, kenarlardan ve birbirlerinden uzak
function scatterIslands(key:MapKey,look:IslandLook,fleet:{x:number;y:number},spawn:{x:number;y:number}):WorldIsland[]{
  // Titreşimli ızgara: harita 4 × 3 bölgeye ayrılır, her bölgeye bir ada (filo adası bölgesi hariç) → dengeli ama rastgele dağılım
  const r=seeded(key),out:WorldIsland[]=[],names=[...ISLE_NAMES[look]].sort(()=>r()-.5),total=ISLE_KINDS.reduce((a,k)=>a+k.w,0),COLS=4,ROWS=3,cw=WORLD_W/COLS,ch=WORLD_H/ROWS;
  const cells=[...Array(COLS*ROWS).keys()].sort(()=>r()-.5);
  for(const cell of cells){const cx=cell%COLS,cy=Math.floor(cell/COLS);
    for(let tries=0;tries<40;tries++){
      let pick=r()*total,variant=0;for(;variant<ISLE_KINDS.length-1;variant++){pick-=ISLE_KINDS[variant].w;if(pick<0)break;}
      const rad=ISLE_KINDS[variant].r,m=rad+150,x=Math.max(rad+300,Math.min(WORLD_W-rad-300,cx*cw+m+r()*(cw-2*m))),y=Math.max(rad+300,Math.min(WORLD_H-rad-300,cy*ch+m+r()*(ch-2*m)));
      if(Math.hypot(x-fleet.x,y-fleet.y)<FLEET.islandR+rad+300||Math.hypot(x-spawn.x,y-spawn.y)<rad+380)continue;
      if(out.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+rad+240))continue;
      out.push({x:Math.round(x),y:Math.round(y),r:rad,name:names[out.length%names.length],look,variant,flip:r()<.5});break;}}
  return out;
}
// Deniz seviyesi → NPC/canavar görsel teması (Azurya: kızıl korsanlar, Hayalet: sis gemileri, Fırtına: şimşek, Uçurum: gölge, Alev: kül)
const ART_TIER:Record<number,number>={1:1,2:2,3:4,4:3,5:5,6:8,7:9,8:7};
function sea(key:MapKey,fleetName:string,opts:{fleet:[number,number];safe?:boolean;count?:number;heavy?:number}):MapDef{
  const tier=tierOf(key),th=THEMES[tier],sub=key.split('/')[1];
  // Eski 3200'lük haritadaki filo adası konumu yeni boyuta ölçeklenir
  const fleet={x:Math.round(opts.fleet[0]*WORLD_W/3200),y:Math.round(opts.fleet[1]*WORLD_H/3200),name:fleetName},spawn={x:fleet.x,y:fleet.y+530};
  return{key,tier,name:th.name,description:SEA_LORE[tier],safe:!!opts.safe,npcs:[`n${ART_TIER[tier]}-${sub}-light`,`n${ART_TIER[tier]}-${sub}-heavy`],monster:`m${ART_TIER[tier]}-${sub}`,npcCount:opts.count??(10+Math.min(5,tier-1)),heavyShare:opts.heavy??(.3+tier*.03),
    islands:scatterIslands(key,th.look,fleet,spawn),fleet,labels:[],spawn};
}
export const MAPS:Record<MapKey,MapDef>={
  '1/1':sea('1/1','Sığınak Filo Adası',{fleet:[1500,1900],safe:true,count:8,heavy:.25}),
  '1/2':sea('1/2','Martı Filo Adası',{fleet:[2150,2150],safe:true}),
  '2/1':sea('2/1','Mercan Filo Adası',{fleet:[2050,2100]}),
  '2/2':sea('2/2','İnci Filo Adası',{fleet:[1150,2100]}),
  '3/1':sea('3/1','Azurya Filo Adası',{fleet:[1200,2150]}),
  '3/2':sea('3/2','Mavi Kubbe Filo Adası',{fleet:[1200,1100]}),
  '4/1':sea('4/1','Hayalet Filo Adası',{fleet:[2050,2100]}),
  '4/2':sea('4/2','Sis Kapısı Filo Adası',{fleet:[1150,2100]}),
  '5/1':sea('5/1','Ayaz Filo Adası',{fleet:[2050,2100]}),
  '5/2':sea('5/2','Buz Mahzeni Filo Adası',{fleet:[1150,2100]}),
  '6/1':sea('6/1','Şimşek Filo Adası',{fleet:[2050,2100]}),
  '6/2':sea('6/2','Kasırga Filo Adası',{fleet:[1150,2100]}),
  '7/1':sea('7/1','Uçurum Filo Adası',{fleet:[2050,2100]}),
  '7/2':sea('7/2','Kara Taç Filo Adası',{fleet:[1150,2100]}),
  '8/1':sea('8/1','Kül Filo Adası',{fleet:[2050,2100]}),
  '8/2':sea('8/2','Magma Filo Adası',{fleet:[1150,2100]}),
};
export const MAP_KEYS=Object.keys(MAPS) as MapKey[];

// ---------------------------------------------------------------- Görevler (seviyeye göre)
export type QuestDef={id:string;tier:number;title:string;description:string;kind:'npc'|'monster'|'chest';ids:string[];required:number;gold:number;wood:number;xp:number;pearls:number};
const tierMaps=(t:number)=>MAP_KEYS.filter(k=>tierOf(k)===t).map(k=>MAPS[k]);
export const QUESTS:QuestDef[]=[1,2,3,4,5,6,7,8].flatMap(t=>{
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

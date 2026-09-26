// Donanım yuvaları: yelken (hız), pruva heykeli (hasar), gövde zırhı (can), top kundağı (dolum, destansıda menzil).
// Her yuva için sıradan (altın), nadir ve destansı (inci) üç parça. Parçalar DONANIM sekmesinden alınır, depoya gider;
// ENVANTER → DONANIM bölümünden gemideki yuvaya takılır. Atlas: public/assets/equip-atlas-v4.webp (4 sütun × 3 satır).
import type {Price} from './arsenal';
export type EquipSlot='sail'|'figure'|'armor'|'carriage';
export type EquipStats={speed?:number;damage?:number;hp?:number;reload?:number;range?:number};
export type EquipDef={id:string;slot:EquipSlot;rarity:0|1|2;name:string;price:Price;stats:EquipStats};
export const EQUIP_ATLAS='/assets/equip-atlas-v4.webp';
export const EQUIP_SLOTS:{id:EquipSlot;name:string}[]=[{id:'sail',name:'Yelken'},{id:'figure',name:'Pruva Heykeli'},{id:'armor',name:'Gövde Zırhı'},{id:'carriage',name:'Top Kundağı'}];
export const RARITY_NAMES=['Sıradan','Nadir','Destansı'] as const;
const g=(amount:number):Price=>({amount,currency:'gold'}),p=(amount:number):Price=>({amount,currency:'pearls'});
export const EQUIPMENT:EquipDef[]=[
  {id:'sail-0',slot:'sail',rarity:0,name:'Kanvas Yelken',price:g(5000),stats:{speed:.05}},
  {id:'sail-1',slot:'sail',rarity:1,name:'İpek Yelken',price:p(150),stats:{speed:.10}},
  {id:'sail-2',slot:'sail',rarity:2,name:'Fırtına Yelkeni',price:p(600),stats:{speed:.16}},
  {id:'figure-0',slot:'figure',rarity:0,name:'Ahşap Deniz Kızı',price:g(8000),stats:{damage:.04}},
  {id:'figure-1',slot:'figure',rarity:1,name:'Tunç Aslan',price:p(200),stats:{damage:.08}},
  {id:'figure-2',slot:'figure',rarity:2,name:'Altın Kraken',price:p(800),stats:{damage:.13}},
  {id:'armor-0',slot:'armor',rarity:0,name:'Meşe Kaplama',price:g(6000),stats:{hp:.06}},
  {id:'armor-1',slot:'armor',rarity:1,name:'Bakır Kaplama',price:p(180),stats:{hp:.12}},
  {id:'armor-2',slot:'armor',rarity:2,name:'Ejder Pulu Zırh',price:p(700),stats:{hp:.20}},
  {id:'carriage-0',slot:'carriage',rarity:0,name:'Demir Kundak',price:g(7000),stats:{reload:.05}},
  {id:'carriage-1',slot:'carriage',rarity:1,name:'Çelik Kundak',price:p(200),stats:{reload:.09}},
  {id:'carriage-2',slot:'carriage',rarity:2,name:'Döner Kundak',price:p(800),stats:{reload:.14,range:40}},
];
export const equipById=(id:string)=>EQUIPMENT.find(e=>e.id===id);
export const equipCell=(e:EquipDef)=>({col:EQUIP_SLOTS.findIndex(s=>s.id===e.slot),row:e.rarity});
export function equipStatText(s:EquipStats){return[s.speed&&`+%${Math.round(s.speed*100)} hız`,s.damage&&`+%${Math.round(s.damage*100)} top hasarı`,s.hp&&`+%${Math.round(s.hp*100)} can`,s.reload&&`−%${Math.round(s.reload*100)} dolum süresi`,s.range&&`+${s.range} menzil`].filter(Boolean).join(' · ');}
export function equipTotals(equipped:Partial<Record<EquipSlot,string|null>>){const t={speed:0,damage:0,hp:0,reload:0,range:0};
  for(const id of Object.values(equipped)){const e=id?equipById(id):undefined;if(!e)continue;for(const k of Object.keys(t) as (keyof typeof t)[])t[k]+=e.stats[k]??0;}return t;}
// Atlastan bir ikonu arka plan olarak gösteren stil (4×3 hücre)
export function equipIconStyle(e:EquipDef){const {col,row}=equipCell(e);return`background-image:url(${EQUIP_ATLAS});background-size:400% 300%;background-position:${col/3*100}% ${row/2*100}%`;}

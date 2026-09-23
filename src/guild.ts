// Filo (lonca): hazine, bağışlar ve filo adalarındaki kule kaideleri. Kuleler adanın parçası değildir;
// filo başkanı hazinedeki inciyle boş kaidelere kule diker. Çok oyunculu mod gelene kadar başkan oyuncunun kendisidir.
import type {MapKey} from './campaign';

export type TowerSlot={hp:number;maxHp:number};
export type Guild={name:string;treasury:number;donated:number;created:number;towers:Partial<Record<MapKey,(TowerSlot|null)[]>>};
export const TOWER_SLOTS=8;
export const towerCost=(tier:number)=>20+10*tier;
export const GUILD_NAME_MAX=24;
const STORAGE='kara-yelken-guild-v1';

export function loadGuild():Guild|null{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw.name==='string')return{name:raw.name,treasury:Math.max(0,raw.treasury|0),donated:Math.max(0,raw.donated|0),created:raw.created||Date.now(),towers:raw.towers&&typeof raw.towers==='object'?raw.towers:{}};}catch{}
  return null;
}
export function saveGuild(g:Guild|null){try{if(g)localStorage.setItem(STORAGE,JSON.stringify(g));else localStorage.removeItem(STORAGE);}catch{}}
export function islandSlots(g:Guild,key:MapKey){let s=g.towers[key];if(!s||s.length!==TOWER_SLOTS){s=Array(TOWER_SLOTS).fill(null);g.towers[key]=s;}return s;}

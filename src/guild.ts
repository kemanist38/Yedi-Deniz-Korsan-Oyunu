// Filo (lonca): hazine, bağışlar ve filo adalarındaki kule kaideleri. Kuleler adanın parçası değildir;
// filo başkanı hazinedeki inciyle boş kaidelere kule diker. Çok oyunculu mod gelene kadar başkan oyuncunun kendisidir.
import type {MapKey} from './campaign';

export type TowerType='cannon'|'mortar'|'chain'|'beacon';
export type TowerSlot={hp:number;maxHp:number;type:TowerType};
export type GuildRole='leader'|'deputy'|'member';
export const ROLE_NAMES:Record<GuildRole,string>={leader:'Filo Başkanı',deputy:'Başkan Yardımcısı',member:'Üye'};
// Kule dikme yetkisi: başkan ve yardımcısı
export const canBuild=(r:GuildRole)=>r==='leader'||r==='deputy';
// Dikilebilir kule tipleri: taş kaideye oturan tam kule (fleet-towers-built-v1, bu sırayla; tools/asset-studio/fleet-towers.js) ve savaş etkisi.
export const TOWER_TYPES:Record<TowerType,{name:string;desc:string;cost:number;damage:number;range:number;reload:number;frame:number}>={
  cannon:{name:'Top Kulesi',desc:'Çift namlulu ağır top. Dengeli hasar ve menzil.',cost:1,damage:1,range:1,reload:1,frame:0},
  mortar:{name:'Havan Kulesi',desc:'Uzun menzil; isabet ettiği yerde 90 birimlik alan hasarı. Yavaş dolum.',cost:1.5,damage:1.5,range:1.35,reload:1.9,frame:1},
  chain:{name:'Zincir Kulesi',desc:'Zincirli zıpkın atar: az hasar, vurduğu gemiyi 3 sn %45 yavaşlatır.',cost:1.2,damage:.5,range:1.1,reload:1.2,frame:2},
  beacon:{name:'Fener Kulesi',desc:'Ateş etmez. 520 birim içindeki dost gemileri saniyede %3 onarır.',cost:1.3,damage:0,range:1.13,reload:1,frame:3},
};
export const towerTypeCost=(tier:number,t:TowerType)=>Math.round(towerCost(tier)*TOWER_TYPES[t].cost);
export type Guild={name:string;tag:string;role:GuildRole;treasury:number;donated:number;created:number;towers:Partial<Record<MapKey,(TowerSlot|null)[]>>};
export const TOWER_SLOTS=8;
export const towerCost=(tier:number)=>20+10*tier;
export const GUILD_NAME_MAX=24,GUILD_TAG_MIN=2,GUILD_TAG_MAX=4;
// Filo kısaltması (tag): 2–4 büyük harf, rakam ya da ★; eski kayıtlarda filo adının baş harflerinden türetilir.
export const tagError=(t:string)=>t.length<GUILD_TAG_MIN||t.length>GUILD_TAG_MAX?`Kısaltma ${GUILD_TAG_MIN}–${GUILD_TAG_MAX} karakter olmalı`:!/^[\p{Lu}\p{N}★]+$/u.test(t)?'Kısaltma büyük harf, rakam ya da ★ olabilir':'';
const initials=(n:string)=>n.split(/\s+/).map(w=>w[0]||'').join('').toLocaleUpperCase('tr').slice(0,GUILD_TAG_MAX)||'KY';
const STORAGE='kara-yelken-guild-v1';

export function loadGuild():Guild|null{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw.name==='string')return{name:raw.name,tag:typeof raw.tag==='string'&&raw.tag?raw.tag:initials(raw.name).padEnd(GUILD_TAG_MIN,'★'),role:raw.role==='deputy'||raw.role==='member'?raw.role:'leader',treasury:Math.max(0,raw.treasury|0),donated:Math.max(0,raw.donated|0),created:raw.created||Date.now(),towers:normalizeTowers(raw.towers)};}catch{}
  return null;
}
// Eski kayıtlarda tip yoksa Top Kulesi sayılır
function normalizeTowers(t:unknown):Guild['towers']{if(!t||typeof t!=='object')return{};const out:Guild['towers']={};for(const [k,v] of Object.entries(t as Record<string,unknown>))if(Array.isArray(v))(out as Record<string,(TowerSlot|null)[]>)[k]=v.map(x=>x&&typeof x==='object'?{hp:(x as TowerSlot).hp,maxHp:(x as TowerSlot).maxHp,type:((x as TowerSlot).type in TOWER_TYPES?(x as TowerSlot).type:'cannon') as TowerType}:null);return out;}
export function saveGuild(g:Guild|null){try{if(g)localStorage.setItem(STORAGE,JSON.stringify(g));else localStorage.removeItem(STORAGE);}catch{}}
export function islandSlots(g:Guild,key:MapKey){let s=g.towers[key];if(!s||s.length!==TOWER_SLOTS){s=Array(TOWER_SLOTS).fill(null);g.towers[key]=s;}return s;}

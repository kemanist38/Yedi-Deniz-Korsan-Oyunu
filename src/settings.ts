// Oyuncu ayarları: ses ve değiştirilebilir tuş atamaları.
export type ActionId='forward'|'back'|'left'|'right'|'attack'|'repair'|'recenter'|'jump'|'speed'|'shield'|'mine'|'map'|'zoomIn'|'zoomOut'
  |'ammo1'|'ammo2'|'ammo3'|'ammo4'|'ammo5'|'ammo6'|'item1'|'item2'|'item3'|'item4'|'item5'|'item6';

export const ACTIONS:{id:ActionId;label:string;group:string}[]=[
  {id:'forward',label:'İleri',group:'Hareket'},{id:'back',label:'Yavaşla / dur',group:'Hareket'},{id:'left',label:'Sola dön',group:'Hareket'},{id:'right',label:'Sağa dön',group:'Hareket'},
  {id:'attack',label:'Saldır / saldırıyı bırak',group:'Savaş'},{id:'repair',label:'Tamir et',group:'Savaş'},
  {id:'speed',label:'Rüzgâr Hamlesi',group:'Savaş'},{id:'shield',label:'Kalkan (aç/kapat)',group:'Savaş'},{id:'mine',label:'Deniz Mayını',group:'Savaş'},
  {id:'recenter',label:'Gemiyi ortala',group:'Kamera ve harita'},{id:'zoomIn',label:'Yakınlaştır',group:'Kamera ve harita'},{id:'zoomOut',label:'Uzaklaştır',group:'Kamera ve harita'},
  {id:'map',label:'Dünya haritası',group:'Kamera ve harita'},{id:'jump',label:'Harita atla',group:'Kamera ve harita'},
  {id:'ammo1',label:'Gülle yuvası 1',group:'Gülleler'},{id:'ammo2',label:'Gülle yuvası 2',group:'Gülleler'},{id:'ammo3',label:'Gülle yuvası 3',group:'Gülleler'},{id:'ammo4',label:'Gülle yuvası 4',group:'Gülleler'},{id:'ammo5',label:'Gülle yuvası 5',group:'Gülleler'},{id:'ammo6',label:'Gülle yuvası 6',group:'Gülleler'},
  {id:'item1',label:'Sarf yuvası 1',group:'Sarf malzemeleri'},{id:'item2',label:'Sarf yuvası 2',group:'Sarf malzemeleri'},{id:'item3',label:'Sarf yuvası 3',group:'Sarf malzemeleri'},{id:'item4',label:'Sarf yuvası 4',group:'Sarf malzemeleri'},{id:'item5',label:'Sarf yuvası 5',group:'Sarf malzemeleri'},{id:'item6',label:'Sarf yuvası 6',group:'Sarf malzemeleri'},
];
export const DEFAULT_BINDS:Record<ActionId,string>={
  forward:'w',back:'s',left:'a',right:'d',attack:'r',repair:'f',recenter:'v',jump:'j',speed:'z',shield:'x',mine:'c',map:'m',zoomIn:'+',zoomOut:'-',
  ammo1:'1',ammo2:'2',ammo3:'3',ammo4:'4',ammo5:'5',ammo6:'6',item1:'7',item2:'8',item3:'9',item4:'0',item5:'',item6:'',
};
export type Settings={sound:boolean;volume:number;binds:Record<ActionId,string>};
const STORAGE='yedi-deniz-settings-v1';
export function loadSettings():Settings{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw)return{sound:raw.sound!==false,volume:typeof raw.volume==='number'?Math.min(1,Math.max(0,raw.volume)):.7,binds:{...DEFAULT_BINDS,...raw.binds}};}catch{}
  return{sound:true,volume:.7,binds:{...DEFAULT_BINDS}};
}
export function saveSettings(s:Settings){try{localStorage.setItem(STORAGE,JSON.stringify(s));}catch{}}
// Klavye tuşu → okunur ad
export function keyLabel(key:string){
  if(!key)return'—';
  const names:Record<string,string>={' ':'BOŞLUK',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',enter:'ENTER',tab:'TAB',shift:'SHIFT',control:'CTRL',alt:'ALT',escape:'ESC',backspace:'SİL'};
  return names[key]??key.toLocaleUpperCase('tr');
}
export function normalizeKey(e:KeyboardEvent){return e.key.length===1?e.key.toLocaleLowerCase('tr'):e.key.toLowerCase();}

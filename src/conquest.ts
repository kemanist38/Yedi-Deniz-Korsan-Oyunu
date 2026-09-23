// Boss etkinlikleri ve kale savaşları. Kale durumları ayrı anahtarda saklanır.
import type {MapId} from './world';

export type FortDef={name:string;x:number;y:number;hp:number;damage:number;reload:number;range:number;reward:{gold:number;pearls:number;fame:number}};
export const FORTS:Partial<Record<MapId,FortDef>>={
  shadows:{name:'Fırtına Kalesi',x:1300,y:2250,hp:1400,damage:12,reload:1.7,range:430,reward:{gold:400,pearls:5,fame:200}},
  crimson:{name:'Kan Kalesi',x:2350,y:1500,hp:2600,damage:18,reload:1.6,range:440,reward:{gold:750,pearls:8,fame:360}},
  storm:{name:'Kül Kalesi',x:420,y:1500,hp:4200,damage:26,reload:1.5,range:450,reward:{gold:1200,pearls:12,fame:600}},
};
export const FORT_HIT_RADIUS=62;
export const FORT_OBSTACLE_R=78; // oyundaki ada yarıçapı karşılığı (kıyı = r*.72+28)
export const FORT_MAX_LEVEL=3;
export const fortIncome=(level:number)=>({gold:12*level,wood:3*level}); // dakika başına
export const FORT_INCOME_CAP_MINUTES=8*60;
export const fortUpgradeCost=(level:number)=>level===1?{gold:600,wood:80}:{gold:1400,wood:180};
export const fortTower=(level:number)=>({range:380,damage:18*level,reload:2.4-.3*(level-1)});
export const fortGarrisonHp=(def:FortDef,level:number)=>Math.round(def.hp*.6*(1+.4*(level-1)));
export const SIEGE_INTERVAL_MS=10*60*1000;
export const SIEGE_SHIPS=3;

export type FortSave={owner:'npc'|'player';level:number;lastCollect:number;nextSiege:number};
const STORAGE='kara-yelken-forts-v1';
export function loadForts():Partial<Record<MapId,FortSave>>{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw==='object')return raw;}catch{}
  return{};
}
export function saveForts(forts:Partial<Record<MapId,FortSave>>){try{localStorage.setItem(STORAGE,JSON.stringify(forts));}catch{}}

export const BOSS={name:'Hayalet Amiral',hp:(level:number)=>900+level*80,damage:16,reload:1.9,speed:30,firstDelaySeconds:90,intervalSeconds:480,escortAt:.5,
  reward:{gold:320,pearls:5,fame:260,elite:15,battle:40},chests:3,hitRadius:40};

// Boss etkinliği ve filo adası sahipliği. Filo adası durumu ayrı anahtarda saklanır.
import type {MapKey} from './campaign';

export const BOSS={name:'Hayalet Amiral',hp:(tier:number)=>900*(1+.7*(tier-1)),damage:(tier:number)=>Math.round(16*(1+.35*(tier-1))),reload:1.9,speed:30,firstDelaySeconds:120,intervalSeconds:480,escortAt:.5,
  reward:(tier:number)=>({gold:Math.round(320*(1+.6*(tier-1))),pearls:5+tier,xp:Math.round(900*Math.pow(tier,1.2)),elite:15,battle:40}),chests:3,hitRadius:40};

export type FleetOwner='npc'|'player';
const STORAGE='kara-yelken-fleet-v1';
// Sığınak Koyu'nun filo adası başlangıçta oyuncunundur.
export function loadFleetOwners():Partial<Record<MapKey,FleetOwner>>{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw==='object')return{'1/1':'player',...raw};}catch{}
  return{'1/1':'player'};
}
export function saveFleetOwners(o:Partial<Record<MapKey,FleetOwner>>){try{localStorage.setItem(STORAGE,JSON.stringify(o));}catch{}}

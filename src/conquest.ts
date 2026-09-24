// Filo adası sahipliği. Filo adası durumu ayrı anahtarda saklanır.
import type {MapKey} from './campaign';


export type FleetOwner='npc'|'player';
const STORAGE='yedi-deniz-fleet-v1';
// Sığınak Koyu'nun filo adası başlangıçta oyuncunundur.
export function loadFleetOwners():Partial<Record<MapKey,FleetOwner>>{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw==='object')return{'1/1':'player',...raw};}catch{}
  return{'1/1':'player'};
}
export function saveFleetOwners(o:Partial<Record<MapKey,FleetOwner>>){try{localStorage.setItem(STORAGE,JSON.stringify(o));}catch{}}

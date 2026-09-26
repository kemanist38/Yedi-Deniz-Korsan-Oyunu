import type {TowerType} from './guild';

// Filo adası görselinden bağımsız kule geometrisi.
// (x,y) her zaman kaide merkezidir; kule sonradan bu noktaya dikilir.
type Point={x:number;y:number};
export function towerContains(point:Point,tower:Point,built=true){
  const x=point.x-tower.x,y=point.y-tower.y;
  return built?Math.abs(x)<=40&&y>=-120&&y<=12:Math.abs(x)<=46&&Math.abs(y)<=28;
}
export function towerMuzzle(tower:Point,type:TowerType='cannon'):Point{
  const offset={cannon:{x:26,y:-76},mortar:{x:17,y:-96},chain:{x:24,y:-76},beacon:{x:0,y:-104}}[type];
  return{x:tower.x+offset.x,y:tower.y+offset.y};
}

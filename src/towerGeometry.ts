import type {TowerType} from './guild';

// Approved tower art: 110 world units wide, feet anchored at the foundation.
// Keep picking and firing aligned with the rendered tower, not its ground point.
type Point={x:number;y:number};
export function towerContains(point:Point,tower:Point,built=true){
  const x=point.x-tower.x,y=point.y-tower.y;
  return built?Math.abs(x)<=52&&y>=-132&&y<=18:Math.abs(x)<=46&&Math.abs(y)<=28;
}
export function towerMuzzle(tower:Point,type:TowerType='cannon'):Point{
  const offset={cannon:{x:0,y:-82},mortar:{x:0,y:-106},chain:{x:16,y:-105},beacon:{x:0,y:-118}}[type];
  return{x:tower.x+offset.x,y:tower.y+offset.y};
}

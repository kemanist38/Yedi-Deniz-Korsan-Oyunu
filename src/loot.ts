// Ganimet sandıkları: açık denizde sürüklenen sandıklar.
// NPC ve canavar sandık düşürmez; onlar yalnızca tecrübe puanı ve altın verir.
import type {ChestKind} from './sprites';

export type LootSource='drift';
export type LootChest={x:number;y:number;kind:ChestKind;source:LootSource;life:number;maxLife:number;gold:number;wood:number;chain:number;pearls:number};

type Range=readonly [number,number];
type LootTable={gildedChance:number;gold:Range;wood:Range;chain:{chance:number;amount:Range};pearls:{chance:number;amount:Range};life:number};

export const LOOT_TABLES:Record<LootSource,LootTable>={
  drift:  {gildedChance:.06,gold:[4,10], wood:[1,3],chain:{chance:.25,amount:[1,1]},pearls:{chance:.03,amount:[1,1]},life:Infinity}
};
export const CHEST_PICKUP_RADIUS=46;
export const CHEST_CLICK_RADIUS=32;
export const MAX_DRIFT_CHESTS=4;
export const DRIFT_RESPAWN_SECONDS=22;

const roll=([min,max]:Range)=>min+Math.floor(Math.random()*(max-min+1));

export function createChest(source:LootSource,x:number,y:number,gildedBonus=0,scale=1):LootChest{
  const table=LOOT_TABLES[source],gilded=Math.random()<table.gildedChance+gildedBonus,boost=(gilded?1.6:1)*scale;
  return{x,y,source,kind:gilded?'gilded':'wood',life:table.life,maxLife:table.life,
    gold:Math.round(roll(table.gold)*boost),wood:Math.round(roll(table.wood)*boost),
    chain:Math.random()<table.chain.chance?roll(table.chain.amount):0,
    pearls:gilded||Math.random()<table.pearls.chance?Math.max(1,roll(table.pearls.amount)):0};
}

export function chestRewardText(chest:LootChest){
  return[`+${chest.gold} Altın`,`+${chest.wood} Kereste`,chest.chain?`+${chest.chain} Zincir Güllesi`:'',chest.pearls?`+${chest.pearls} İnci`:''].filter(Boolean).join('   ');
}

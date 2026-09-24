// Başarımlar: oyun içi sayaçlar hedefe ulaşınca madalya açılır, bir kez inci verir ve küçük kalıcı bir bonus ekler
// (altın, tecrübe, top hasarı ya da can yüzdesi). Madalya atlası: public/assets/badge-atlas-v1.webp (6 × 3, sıra aynı).
export type AchStat='npc'|'heavy'|'monster'|'boss'|'chest'|'treasure'|'quest'|'eliteBalls'|'level'|'daily';
export type AchBonus={gold?:number;xp?:number;damage?:number;hp?:number};
export type AchievementDef={id:string;name:string;desc:string;stat:AchStat;goal:number;pearls:number;bonus:AchBonus};
export const BADGE_ATLAS='/assets/badge-atlas-v1.webp',BADGE_COLS=6,BADGE_ROWS=3;
export const ACHIEVEMENTS:AchievementDef[]=[
  {id:'npc-100',name:'Kıyı Belası',desc:'100 NPC gemisi batır',stat:'npc',goal:100,pearls:10,bonus:{gold:.01}},
  {id:'npc-1000',name:'Deniz Kurdu',desc:'1.000 NPC gemisi batır',stat:'npc',goal:1000,pearls:50,bonus:{gold:.02}},
  {id:'npc-10000',name:'Yedi Denizin Korkusu',desc:'10.000 NPC gemisi batır',stat:'npc',goal:10000,pearls:200,bonus:{damage:.03}},
  {id:'heavy-200',name:'Filo Avcısı',desc:'200 ağır gemi batır',stat:'heavy',goal:200,pearls:20,bonus:{damage:.01}},
  {id:'monster-50',name:'Canavar Avcısı',desc:'50 deniz canavarı yen',stat:'monster',goal:50,pearls:20,bonus:{xp:.01}},
  {id:'monster-500',name:'Leviathan Katili',desc:'500 deniz canavarı yen',stat:'monster',goal:500,pearls:100,bonus:{xp:.02}},
  {id:'boss-1',name:'İlk Amiral',desc:'Bir harita bossunu batır',stat:'boss',goal:1,pearls:20,bonus:{hp:.01}},
  {id:'boss-16',name:'Yedi Denizin Efendisi',desc:'16 harita bossu batır',stat:'boss',goal:16,pearls:300,bonus:{damage:.03,hp:.03}},
  {id:'chest-100',name:'Ganimetçi',desc:'100 ganimet sandığı topla',stat:'chest',goal:100,pearls:15,bonus:{gold:.01}},
  {id:'treasure-1',name:'Define Avcısı',desc:'İlk hazineyi kaz',stat:'treasure',goal:1,pearls:10,bonus:{gold:.01}},
  {id:'treasure-25',name:'Define Ustası',desc:'25 hazine kaz',stat:'treasure',goal:25,pearls:100,bonus:{gold:.02}},
  {id:'quest-10',name:'Görev Adamı',desc:'10 görev tamamla',stat:'quest',goal:10,pearls:15,bonus:{xp:.01}},
  {id:'quest-100',name:'Efsanevi Kaptan',desc:'100 görev tamamla',stat:'quest',goal:100,pearls:150,bonus:{xp:.02}},
  {id:'elite-10000',name:'Elit Topçu',desc:'10.000 elit gülle ateşle',stat:'eliteBalls',goal:10000,pearls:50,bonus:{damage:.01}},
  {id:'level-5',name:'Tecrübeli Kaptan',desc:'5. seviyeye ulaş',stat:'level',goal:5,pearls:30,bonus:{hp:.02}},
  {id:'level-8',name:'Amiral',desc:'8. seviyeye ulaş',stat:'level',goal:8,pearls:100,bonus:{hp:.03}},
  {id:'daily-7',name:'Sadık Denizci',desc:'Günlük ödülü 7 gün art arda topla',stat:'daily',goal:7,pearls:30,bonus:{gold:.01}},
];
export type AchState={stats:Record<AchStat,number>;unlocked:string[]};
const STORAGE='yedi-deniz-achievements-v1';
const ZERO:Record<AchStat,number>={npc:0,heavy:0,monster:0,boss:0,chest:0,treasure:0,quest:0,eliteBalls:0,level:0,daily:0};
export function loadAchievements():AchState{try{const r=JSON.parse(localStorage.getItem(STORAGE)||'null');if(r)return{stats:{...ZERO,...r.stats},unlocked:Array.isArray(r.unlocked)?r.unlocked:[]};}catch{}return{stats:{...ZERO},unlocked:[]};}
export function saveAchievements(a:AchState){try{localStorage.setItem(STORAGE,JSON.stringify(a));}catch{}}
// Hedefine ulaşmış ama henüz açılmamış başarımları açar ve döndürür
export function unlockReached(a:AchState){const fresh=ACHIEVEMENTS.filter(d=>!a.unlocked.includes(d.id)&&a.stats[d.stat]>=d.goal);for(const d of fresh)a.unlocked.push(d.id);return fresh;}
export function achievementBonus(a:AchState){const t={gold:0,xp:0,damage:0,hp:0};for(const id of a.unlocked){const d=ACHIEVEMENTS.find(x=>x.id===id);if(!d)continue;for(const k of Object.keys(t) as (keyof typeof t)[])t[k]+=d.bonus[k]??0;}return t;}
export function bonusText(b:AchBonus){return[b.gold&&`+%${Math.round(b.gold*100)} altın`,b.xp&&`+%${Math.round(b.xp*100)} TP`,b.damage&&`+%${Math.round(b.damage*100)} top hasarı`,b.hp&&`+%${Math.round(b.hp*100)} can`].filter(Boolean).join(' · ');}
export function badgeStyle(i:number){const c=i%BADGE_COLS,r=Math.floor(i/BADGE_COLS);return`background-image:url(${BADGE_ATLAS});background-size:${BADGE_COLS*100}% ${BADGE_ROWS*100}%;background-position:${c/(BADGE_COLS-1)*100}% ${r/(BADGE_ROWS-1)*100}%`;}

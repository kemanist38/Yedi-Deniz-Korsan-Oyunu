// Kaptan yetenek ağacı ve tayfa (subaylar). Hesap kaydına dokunmaz; ayrı anahtarda saklanır.
// Tüm etkiler mevcut değerlerin üzerine çarpan / ek olarak uygulanır.
export type TalentId='firemaster'|'sapper'|'tough'|'windcaller'|'plunder'|'scavenger'|'bounty';
export type OfficerId='gunner'|'helmsman'|'carpenter'|'lookout'|'quartermaster'|'surgeon';
export type Bonus={damage:number;reload:number;range:number;speed:number;taken:number;repair:number;cooldown:number;burn:number;chestGold:number;gilded:number;mine:number;bounty:number};

// Yetenek puanı ile açılan özel yetenekler. Hasar, dolum, menzil, hız, gövde ve tamir
// geliştirmedeki İnci yükseltmelerinde kaldığı için burada tekrar edilmez.
export const TALENTS:Record<TalentId,{name:string;max:number;per:string;icon:string;apply:(b:Bonus,rank:number)=>void}>={
  firemaster:{name:'Ateş Ustası',max:3,per:'+%25 yanma hasarı',icon:'/assets/ammo-fire-v2.webp',apply:(b,r)=>{b.burn*=1+.25*r;}},
  sapper:{name:'Mayın Uzmanı',max:4,per:'+%15 mayın hasarı',icon:'/assets/icon-mine-v2.webp',apply:(b,r)=>{b.mine*=1+.15*r;}},
  tough:{name:'Sağlam Omurga',max:5,per:'-%3 alınan hasar',icon:'/assets/icon-shield-v3.webp',apply:(b,r)=>{b.taken*=1-.03*r;}},
  windcaller:{name:'Fırtına Bilgesi',max:3,per:'-%10 yetenek bekleme',icon:'/assets/icon-speed-v2.webp',apply:(b,r)=>{b.cooldown*=1-.1*r;}},
  plunder:{name:'Yağma Ustası',max:5,per:'+%10 sandık altını',icon:'/assets/officer-quartermaster-v1.webp',apply:(b,r)=>{b.chestGold*=1+.1*r;}},
  scavenger:{name:'Enkaz Avcısı',max:3,per:'+%8 yaldızlı sandık şansı',icon:'/assets/icon-chest-v2.webp',apply:(b,r)=>{b.gilded+=.08*r;}},
  bounty:{name:'Ödül Avcısı',max:5,per:'+%5 batırma altını',icon:'/assets/icon-attack-v2.webp',apply:(b,r)=>{b.bounty+=.05*r;}},
};
const isTalent=(id:string):id is TalentId=>id in TALENTS;

export const OFFICERS:Record<OfficerId,{name:string;title:string;icon:string;per:string;apply:(b:Bonus,rank:number)=>void}>={
  gunner:{name:'Topçu Başı',title:'Barut ve gülle ustası',icon:'/assets/gunner-vignette-v1.webp',per:'+%5 top hasarı',apply:(b,r)=>{b.damage*=1+.05*r;}},
  helmsman:{name:'Serdümen',title:'Dümenin efendisi',icon:'/assets/officer-helmsman-v1.webp',per:'+%4 hız',apply:(b,r)=>{b.speed*=1+.04*r;}},
  carpenter:{name:'Marangoz',title:'Gövdenin bekçisi',icon:'/assets/officer-carpenter-v1.webp',per:'+%20 tamir hızı',apply:(b,r)=>{b.repair*=1+.2*r;}},
  lookout:{name:'Gözcü',title:'Ufku okuyan göz',icon:'/assets/officer-lookout-v1.webp',per:'+12 menzil',apply:(b,r)=>{b.range+=12*r;}},
  quartermaster:{name:'Levazımcı',title:'Ganimet defteri',icon:'/assets/officer-quartermaster-v1.webp',per:'+%12 sandık altını',apply:(b,r)=>{b.chestGold*=1+.12*r;}},
  surgeon:{name:'Cerrah',title:'Yaraları saran el',icon:'/assets/officer-surgeon-v1.webp',per:'-%4 alınan hasar',apply:(b,r)=>{b.taken*=1-.04*r;}},
};
export const OFFICER_MAX_RANK=5;
export const officerCost=(rank:number)=>rank===0?150:Math.round(150*Math.pow(1.75,rank));
export const officerSlots=(level:number)=>level>=6?3:level>=3?2:1;
export const talentPoints=(level:number)=>Math.max(0,level-1);

export type CrewState={talents:Partial<Record<TalentId,number>>;officers:Partial<Record<OfficerId,number>>;active:OfficerId[]};
const STORAGE='yedi-deniz-crew-v1';
export function loadCrew():CrewState{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw)return{talents:raw.talents||{},officers:raw.officers||{},active:Array.isArray(raw.active)?raw.active.filter((id:string)=>id in OFFICERS):[]};}catch{}
  return{talents:{},officers:{},active:[]};
}
export function saveCrew(crew:CrewState){try{localStorage.setItem(STORAGE,JSON.stringify(crew));}catch{}}
export function spentPoints(crew:CrewState){return Object.entries(crew.talents).reduce((s,[id,r])=>s+(isTalent(id)?r||0:0),0);}

export function computeBonus(crew:CrewState):Bonus{
  const b:Bonus={damage:1,reload:1,range:0,speed:1,taken:1,repair:1,cooldown:1,burn:1,chestGold:1,gilded:0,mine:1,bounty:0};
  for(const [id,rank] of Object.entries(crew.talents))if(rank&&isTalent(id))TALENTS[id].apply(b,rank);
  for(const id of crew.active){const rank=crew.officers[id]||0;if(rank)OFFICERS[id].apply(b,rank);}
  return b;
}

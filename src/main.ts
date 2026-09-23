import './style.css';

type Vec = { x: number; y: number };
type AmmoKind = 'iron'|'chain';
type CannonKind = 'cast'|'long'|'rapid'|'heavy';
type Shot = Vec & { vx:number; vy:number; life:number; owner:'player'|'enemy'; damage:number; hit:boolean; ammo:AmmoKind; target?:Target };
type SalvoRound = { delay:number; target:Target; side:number; slot:number; damage:number; ammo:AmmoKind };
type Enemy = Vec & { kind:'ship'; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; name:string; tier:number; aggro:boolean; wander:number; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:'foam'|'smoke'|'spark'|'damage'; text?:string };
type Monster = Vec & { kind:'monster'; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Target = Enemy|Monster;
type Quest = { title:string; description:string; target:'ship'|'monster'; required:number; gold:number; wood:number; fame:number; pearls:number };
type UpgradeKind = 'hull'|'damage'|'range'|'reload'|'speed'|'repair';
const CANNONS:Record<CannonKind,{name:string;damage:number;range:number;reload:number}>={
  cast:{name:'Döküm',damage:1,range:390,reload:1.65},
  long:{name:'Uzun',damage:.82,range:470,reload:2.05},
  rapid:{name:'Seri',damage:.68,range:340,reload:1.05},
  heavy:{name:'Ağır',damage:1.38,range:365,reload:2.65}
};
const QUESTS:Quest[]=[
  {title:'Kızıl Sular',description:'Yağmacı filonun devriyelerini batır ve bölgeyi güvenli hâle getir.',target:'ship',required:5,gold:100,wood:20,fame:40,pearls:3},
  {title:'Kaçakçı Avı',description:'Ticaret rotalarına saldıran sekiz korsan gemisini denizin dibine gönder.',target:'ship',required:8,gold:180,wood:35,fame:70,pearls:5},
  {title:'Derinliğin Gölgesi',description:'Derinlik Leviathanı’nı bul ve canavarı yenerek seferi tamamla.',target:'monster',required:1,gold:350,wood:60,fame:140,pearls:10}
];
const UPGRADES:Record<UpgradeKind,{name:string;description:string;effect:string;pearls:number}>={
  hull:{name:'Güçlendirilmiş Gövde',description:'Geminin azami gövde dayanıklılığını artırır.',effect:'+20 gövde',pearls:8},
  damage:{name:'Top Güvertesi',description:'Her borda atışının verdiği hasarı artırır.',effect:'+%11 hasar',pearls:10},
  range:{name:'Uzun Namlular',description:'Tüm top türlerinin etkili menzilini artırır.',effect:'+18 menzil',pearls:9},
  reload:{name:'Tecrübeli Topçular',description:'Topların yeniden dolma süresini azaltır.',effect:'-%4 dolum',pearls:12},
  speed:{name:'Yeni Yelken Takımı',description:'Geminin ulaşabileceği azami hızı artırır.',effect:'+5 hız',pearls:9},
  repair:{name:'Usta Marangozlar',description:'Açık denizde yapılan tamirin hızını artırır.',effect:'+%0,8/sn',pearls:7}
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="brand">KARA YELKEN<small>GÖLGELER DENİZİ</small></div>
      <div class="resources"><div class="resource pearl">İNCİ<b id="pearls">000</b></div><div class="resource">ALTIN<b id="gold">000</b></div><div class="resource">KERESTE<b id="wood">000</b></div><div class="resource">ŞÖHRET<b id="fame">000</b></div></div>
      <div class="panel quest"><span class="eyebrow">Aktif görev</span><h3 id="questTitle">Görev seçilmedi</h3><p id="questDescription">Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.</p><div class="progress" id="quest">Hazır olduğunda bir görev başlat</div><button class="quest-open" id="openQuests">GÖREVLERİ AÇ</button></div>
      <div class="panel captain"><div class="name-row"><strong>Kaptan Yasin</strong><span class="level" id="level">SEVİYE 1</span></div><div class="bar-label"><span>GÖVDE</span><span id="hpText">100 / 100</span></div><div class="bar hp"><i id="hpBar" style="width:100%"></i></div><div class="bar-label"><span>ŞÖHRET</span><span id="xpText">0 / 100</span></div><div class="bar xp"><i id="xpBar" style="width:0%"></i></div></div>
      <div class="panel target-card" id="targetCard"><span class="eyebrow">HEDEF YOK</span><h3 id="targetName">Denizde bir gemi seç</h3><div class="bar hp"><i id="targetHp" style="width:0%"></i></div><div class="target-meta"><span id="targetRange">— menzil</span><span id="targetTier">—</span></div></div>
      <div class="panel actionbar"><button class="action" id="cannonType"><b>♜</b><span id="cannonName">Döküm</span><small>TOP</small></button><button class="action active" data-ammo="iron"><b>●</b><span>Demir</span><small id="ironAmmo">∞</small></button><button class="action" data-ammo="chain"><b>⛓</b><span>Zincir</span><small id="chainAmmo">40</small></button><button class="action fire" id="attack"><b>⚔</b><span>SALDIR</span><small id="reloadText">HAZIR</small></button><button class="action" id="repair"><b>✚</b><span>TAMİR</span><small>F</small></button></div>
      <div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div>
      <button class="ship-menu-button" id="openShip">⚓ GEMİ</button>
      <canvas id="minimap" width="170" height="125"></canvas>
      <div class="reward-toast" id="rewardToast"></div>
      <div class="toast" id="toast"></div>
      <div class="quest-overlay" id="questOverlay"><section class="quest-log"><header><div><span class="eyebrow">Kaptanın görev defteri</span><h2>DENİZ GÖREVLERİ</h2></div><button id="closeQuests" aria-label="Görevleri kapat">×</button></header><p class="quest-intro">Aynı anda yalnızca bir görev yürütülebilir. İptal edilen veya tamamlanan görev 8 saat sonra yeniden açılır.</p><div class="quest-list" id="questList"></div></section></div>
      <div class="ship-overlay" id="shipOverlay"><section class="ship-menu"><header><div><span class="eyebrow">Kaptanın amiral gemisi</span><h2>KARA YELKEN</h2></div><button id="closeShip" aria-label="Gemi menüsünü kapat">×</button></header><div class="ship-summary" id="shipSummary"></div><div class="upgrade-list" id="upgradeList"></div><div class="upgrade-confirm" id="upgradeConfirm"></div></section></div>
    </section>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>('#sea')!;
const ctx = canvas.getContext('2d')!;
const minimap = document.querySelector<HTMLCanvasElement>('#minimap')!;
const mini = minimap.getContext('2d')!;
const playerShipImage=new Image();
const shipChunks=['aa','ab','ac','ad','ae','af','ag','ah','ai'];
Promise.all(shipChunks.map(part=>fetch(`/assets/player-flagship-game-v1.b64.${part}`).then(r=>r.text())))
  .then(parts=>{playerShipImage.src=`data:image/png;base64,${parts.join('')}`;})
  .catch(()=>{playerShipImage.src='/assets/player-flagship-game-v1.png';});
const directionalShipImage=new Image();
const directionalChunks=['aa','ab','ac','ad'];
Promise.all(directionalChunks.map(part=>fetch(`/assets/player-flagship-directions-v1.b64.${part}`).then(r=>r.text())))
  .then(parts=>{directionalShipImage.src=`data:image/webp;base64,${parts.join('')}`;})
  .catch(()=>{directionalShipImage.src='/assets/player-flagship-directions-v1.webp';});
const ui = (id:string) => document.getElementById(id)!;
const WORLD = 2800;
const keys = new Set<string>();
const QUEST_STORAGE='kara-yelken-quests-v1';
const ACCOUNT_STORAGE='kara-yelken-account-v1';
let storedQuests:{activeQuest:number|null;progress:number[];cooldowns:number[]}|null=null;
let storedAccount:{pearls?:number;gold:number;wood:number;fame:number;level:number;maxHp:number;hp:number;chainAmmo:number;upgrades:Record<UpgradeKind,number>}|null=null;
try{storedQuests=JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null');}catch{storedQuests=null;}
try{storedAccount=JSON.parse(localStorage.getItem(ACCOUNT_STORAGE)||'null');}catch{storedAccount=null;}
const storedActive=storedQuests?.activeQuest;
const upgrades:Record<UpgradeKind,number>={hull:storedAccount?.upgrades?.hull||0,damage:storedAccount?.upgrades?.damage||0,range:storedAccount?.upgrades?.range||0,reload:storedAccount?.upgrades?.reload||0,speed:storedAccount?.upgrades?.speed||0,repair:storedAccount?.upgrades?.repair||0};
const state = { pearls:storedAccount?.pearls??30, gold:storedAccount?.gold??40, wood:storedAccount?.wood??10, fame:storedAccount?.fame??0, level:storedAccount?.level??1, hp:storedAccount?.hp??100, maxHp:storedAccount?.maxHp??100, cannon:18, cannonType:'cast' as CannonKind, activeQuest:Number.isInteger(storedActive)&&storedActive!>=0&&storedActive!<QUESTS.length?storedActive!:null as number|null, ammo:'iron' as AmmoKind, chainAmmo:storedAccount?.chainAmmo??40, attacking:false, repairing:false, invulnerable:0 };
const questProgress=QUESTS.map((_,index)=>Math.max(0,Number(storedQuests?.progress?.[index])||0));
const questCooldownUntil=QUESTS.map((_,index)=>Math.max(0,Number(storedQuests?.cooldowns?.[index])||0));
if(state.activeQuest!==null&&questCooldownUntil[state.activeQuest]>Date.now())state.activeQuest=null;
const player = { x:WORLD/2, y:WORLD/2, angle:-Math.PI/2, speed:0, cooldown:0 };
let destination:Vec|null=null;
let selected:Target|null=null;
const camera = { x:player.x, y:player.y, zoom:.7, targetZoom:.7 };
const shots:Shot[]=[]; const enemies:Enemy[]=[];
const salvoQueue:SalvoRound[]=[];
const particles:Particle[]=[];
const monsters:Monster[]=[{kind:'monster',x:1980,y:1530,phase:0,radius:52,name:'Derinlik Leviathanı',hp:180,maxHp:180,cooldown:0,aggro:false,slowTimer:0,homeX:1980,homeY:1530,combatTimer:0}];
let wakeClock=0;
let collisionNotice=0;
const islands = [
  {x:760,y:610,r:150,name:'Fırtına Burnu'},
  {x:2180,y:710,r:210,name:'Ölü Adam Adası'}, {x:2250,y:2050,r:170,name:'Mercan Geçidi'}, {x:650,y:2110,r:230,name:'Sis Kayalıkları'}
];

function resize(){ const d=Math.min(devicePixelRatio,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize',resize); resize();
addEventListener('keydown',e=>{ keys.add(e.key.toLowerCase()); if(['q','e',' '].includes(e.key.toLowerCase())) fire(e.key.toLowerCase()); if(e.key.toLowerCase()==='r') toggleAttack(); if(e.key.toLowerCase()==='f')toggleRepair();if(e.key==='Escape'){closeQuestLog();closeShipMenu();} });
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('beforeunload',saveAccount);
canvas.addEventListener('pointerdown',e=>{
  const world={x:(e.clientX-innerWidth/2)/camera.zoom+camera.x,y:(e.clientY-innerHeight/2)/camera.zoom+camera.y};
  const hit=[...enemies,...monsters].filter(n=>dist(n,world)<Math.max(42,n.kind==='monster'?n.radius:0)).sort((a,b)=>dist(a,world)-dist(b,world))[0];
  if(hit){selected=hit;state.attacking=false;ui('attack').classList.remove('active');toast(`${hit.name} hedef seçildi`);}
  else{destination=navigablePoint(world);state.attacking=false;ui('attack').classList.remove('active');}
});
ui('attack').onclick=toggleAttack;
ui('repair').onclick=toggleRepair;
ui('cannonType').onclick=()=>{const types=Object.keys(CANNONS) as CannonKind[];state.cannonType=types[(types.indexOf(state.cannonType)+1)%types.length];toast(`${CANNONS[state.cannonType].name} topları hazır`);};
ui('zoomOut').onclick=()=>setZoom(camera.targetZoom-.1);
ui('zoomIn').onclick=()=>setZoom(camera.targetZoom+.1);
ui('openQuests').onclick=openQuestLog;
ui('closeQuests').onclick=closeQuestLog;
ui('questOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('questOverlay'))closeQuestLog();});
ui('openShip').onclick=openShipMenu;
ui('closeShip').onclick=closeShipMenu;
ui('shipOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('shipOverlay'))closeShipMenu();});
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.targetZoom+(e.deltaY<0?.1:-.1));},{passive:false});
document.querySelectorAll<HTMLButtonElement>('[data-ammo]').forEach(b=>b.onclick=()=>{state.ammo=b.dataset.ammo as AmmoKind;document.querySelectorAll('[data-ammo]').forEach(x=>x.classList.toggle('active',x===b));});

function spawnEnemy(){
  const a=Math.random()*Math.PI*2,d=500+Math.random()*650,tier=1+Math.floor(state.level/3);
  const x=clamp(player.x+Math.cos(a)*d,80,WORLD-80),y=clamp(player.y+Math.sin(a)*d,80,WORLD-80);
  enemies.push({kind:'ship',x,y,angle:a+Math.PI,hp:42+tier*12,maxHp:42+tier*12,cooldown:Math.random()*2,speed:35+Math.random()*15,name:['Yağmacı','Kaçakçı','Kızıl Korsan'][Math.floor(Math.random()*3)],tier,aggro:false,wander:Math.random()*6,slowTimer:0,homeX:x,homeY:y,combatTimer:0});
}
for(let i=0;i<7;i++) spawnEnemy();
function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n));}
function dist(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y);}
function navigablePoint(point:Vec){
  for(const island of islands){const shore=island.r*.72+38,d=dist(point,island);if(d<shore){const a=Math.atan2(point.y-island.y,point.x-island.x);return{x:island.x+Math.cos(a)*shore,y:island.y+Math.sin(a)*shore};}}
  return{x:clamp(point.x,25,WORLD-25),y:clamp(point.y,25,WORLD-25)};
}
function resolveIslandCollision(){
  for(const island of islands){const shore=island.r*.72+28,d=dist(player,island);if(d<shore){const a=d>.01?Math.atan2(player.y-island.y,player.x-island.x):player.angle-Math.PI/2;player.x=island.x+Math.cos(a)*shore;player.y=island.y+Math.sin(a)*shore;player.speed*=.28;destination=null;if(collisionNotice<=0){toast(`${island.name} kıyısına daha fazla yaklaşamazsın`);collisionNotice=2;}}}
}
function setZoom(value:number){camera.targetZoom=clamp(value,.5,1.15);ui('zoomValue').textContent=`${Math.round(camera.targetZoom*100)}%`;}
function targetExists(t:Target){return t.kind==='ship'?enemies.includes(t):monsters.includes(t);}
function angleDelta(target:number,current:number){return Math.atan2(Math.sin(target-current),Math.cos(target-current));}
function broadsideCourse(target:Target){
  const bearing=Math.atan2(target.y-player.y,target.x-player.x),right=bearing,left=bearing+Math.PI;
  return Math.abs(angleDelta(right,player.angle))<=Math.abs(angleDelta(left,player.angle))?right:left;
}

function fire(side:string){
  if(player.cooldown>0)return;
  state.repairing=false;
  player.cooldown=.72;
  const sides=side===' '?[-1,1]:[side==='q'?-1:1];
  for(const s of sides) for(let i=-1;i<=1;i++){
    const a=player.angle+s*Math.PI/2+i*.07, speed=430;
    shots.push({x:player.x+Math.cos(a)*24,y:player.y+Math.sin(a)*24,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:1.1,owner:'player',damage:state.cannon/3,hit:false,ammo:state.ammo});
  }
}
function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;if(state.attacking)state.repairing=false;ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
function toggleRepair(){
  if(state.hp>=state.maxHp){toast('Gövde zaten tamamen sağlam');return;}
  const danger=enemies.some(e=>e.aggro&&dist(e,player)<520)||monsters.some(m=>m.aggro&&dist(m,player)<520);
  if(danger||state.attacking){toast('Savaş durumundayken tamir yapılamaz');return;}
  state.repairing=!state.repairing;toast(state.repairing?'Açık deniz tamiri başladı':'Tamir durduruldu');
}
function fireAtTarget(){
  const cannon=CANNONS[state.cannonType];
  if(!selected||player.cooldown>0||dist(player,selected)>effectiveRange())return;
  if(state.ammo==='chain'&&state.chainAmmo<=0){state.ammo='iron';toast('Zincir güllesi tükendi');}
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),tx=selected.x-player.x,ty=selected.y-player.y;
  const side=fx*ty-fy*tx>0?-1:1,damage=state.cannon*5*(1+upgrades.damage*.11)*cannon.damage*(state.ammo==='chain'?1.45:1);
  salvoQueue.push({delay:0,target:selected,side,slot:0,damage,ammo:state.ammo});
  if(state.ammo==='chain'){state.chainAmmo-=5;saveAccount();}
  player.cooldown=cannon.reload*Math.max(.6,1-upgrades.reload*.04)*(state.ammo==='chain'?1.18:1);
}
function releaseSalvo(round:SalvoRound){
  if(!targetExists(round.target))return;
  const d=dist(player,round.target);
  const a=Math.atan2(round.target.y-player.y,round.target.x-player.x);
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),rx=Math.cos(player.angle),ry=Math.sin(player.angle),speed=510;
  const x=player.x+rx*round.side*(17+Math.abs(round.slot)*1.5)+fx*round.slot*11,y=player.y+ry*round.side*(17+Math.abs(round.slot)*1.5)+fy*round.slot*11;
  shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:Math.max(1.1,d/speed+.5),owner:'player',damage:round.damage,hit:false,ammo:round.ammo,target:round.target});
  particles.push({x,y,vx:rx*round.side*12,vy:ry*round.side*12,life:.38,maxLife:.38,kind:'smoke'});
}
function enemyFire(e:Enemy){
  const a=Math.atan2(player.y-e.y,player.x-e.x);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy',damage:8,hit:false,ammo:'iron'}); e.cooldown=2.2+Math.random();
}
function monsterFire(m:Monster){const a=Math.atan2(player.y-m.y,player.x-m.x);shots.push({x:m.x,y:m.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:2.4,owner:'enemy',damage:10,hit:false,ammo:'iron'});m.cooldown=2.8;}
function respawn(){
  let spot={x:WORLD/2,y:WORLD/2};
  for(let tries=0;tries<40;tries++){const candidate={x:160+Math.random()*(WORLD-320),y:160+Math.random()*(WORLD-320)};if(islands.every(i=>dist(candidate,i)>i.r+170)&&monsters.every(m=>dist(candidate,m)>260)){spot=candidate;break;}}
  player.x=spot.x;player.y=spot.y;player.speed=18;destination=null;state.hp=Math.max(18,Math.round(state.maxHp*.2));state.repairing=true;state.invulnerable=4;state.attacking=false;selected=null;shots.length=0;enemies.forEach(e=>{e.aggro=false;e.combatTimer=0;});monsters.forEach(m=>{m.aggro=false;m.combatTimer=0;});ui('attack').classList.remove('active');toast('Açık denizde yeniden doğdun — gövde onarılıyor');
}
function burst(x:number,y:number,large=false){for(let n=0;n<(large?18:7);n++){const a=Math.random()*Math.PI*2,s=15+Math.random()*(large?75:35);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.7,maxLife:1,kind:n%3?'smoke':'spark'});}}
function damageText(x:number,y:number,value:number){particles.push({x,y,vx:0,vy:-24,life:1,maxLife:1,kind:'damage',text:`-${Math.round(value)}`});}
let toastTimer=0;
function toast(msg:string){ui('toast').textContent=msg;ui('toast').classList.add('show');toastTimer=2.2;}
let rewardTimer=0;
const rewardQueue:string[]=[];
function showReward(msg:string){ui('rewardToast').textContent=msg;ui('rewardToast').classList.remove('show');void ui('rewardToast').offsetWidth;ui('rewardToast').classList.add('show');rewardTimer=2.6;}
function rewardNotice(msg:string){if(rewardTimer>0){rewardQueue.push(msg);return;}showReward(msg);}
function saveQuestState(){localStorage.setItem(QUEST_STORAGE,JSON.stringify({activeQuest:state.activeQuest,progress:questProgress,cooldowns:questCooldownUntil}));}
function saveAccount(){localStorage.setItem(ACCOUNT_STORAGE,JSON.stringify({pearls:state.pearls,gold:state.gold,wood:state.wood,fame:state.fame,level:state.level,maxHp:state.maxHp,hp:state.hp,chainAmmo:state.chainAmmo,upgrades}));}
function effectiveRange(){return CANNONS[state.cannonType].range+upgrades.range*18;}
function effectiveSpeed(){return 104+upgrades.speed*5;}
function cooldownText(until:number){const minutes=Math.max(1,Math.ceil((until-Date.now())/60000)),hours=Math.floor(minutes/60),mins=minutes%60;return hours>0?`${hours} sa ${mins} dk`:`${mins} dk`;}
let pendingUpgrade:UpgradeKind|null=null;
function upgradeCost(kind:UpgradeKind){return Math.round(UPGRADES[kind].pearls*(1+upgrades[kind]*.55));}
function upgradeIcon(kind:UpgradeKind){const art:Record<UpgradeKind,string>={
  hull:'<path d="M32 6 52 14v15c0 14-8 23-20 29C20 52 12 43 12 29V14Z"/><path d="M18 22h28M17 31h30M21 40h22"/>',
  damage:'<path d="M9 39h31l11-9-3-7-14 5H13Z"/><circle cx="18" cy="46" r="7"/><circle cx="39" cy="46" r="7"/><path d="m48 15 3-7m3 11 6-3"/>',
  range:'<path d="M7 39h37l12-8-4-8-17 6H11Z"/><path d="M39 14h18M48 7v14"/><circle cx="18" cy="47" r="6"/>',
  reload:'<circle cx="23" cy="25" r="9"/><circle cx="42" cy="39" r="10"/><path d="M23 10v6m0 18v6M8 25h6m18 0h6M42 23v7m0 18v7M26 39h7m18 0h7"/>',
  speed:'<path d="M31 5v51M32 9C48 15 52 29 49 38L32 34ZM29 14C17 20 12 34 16 43l13-6Z"/><path d="M9 55h46"/>',
  repair:'<path d="m12 48 28-28 8 8-28 28Z"/><path d="m35 17 8-8 12 12-8 8M9 13l13 13m-9-17 13 13"/>'};return `<svg viewBox="0 0 64 64" aria-hidden="true">${art[kind]}</svg>`;}
function openShipMenu(){pendingUpgrade=null;renderShipMenu();ui('shipOverlay').classList.add('open');}
function closeShipMenu(){pendingUpgrade=null;ui('shipOverlay').classList.remove('open');}
function renderShipMenu(){
  ui('shipSummary').innerHTML=`<div><span>GÖVDE</span><b>${state.maxHp}</b></div><div><span>TOP HASARI</span><b>${Math.round(state.cannon*(1+upgrades.damage*.11))}</b></div><div><span>MENZİL</span><b>${effectiveRange()}</b></div><div><span>HIZ</span><b>${effectiveSpeed()}</b></div>`;
  ui('upgradeList').innerHTML=(Object.keys(UPGRADES) as UpgradeKind[]).map(kind=>{const item=UPGRADES[kind],level=upgrades[kind],cost=upgradeCost(kind),maxed=level>=10;return `<article class="upgrade-card"><div class="upgrade-icon">${upgradeIcon(kind)}</div><div><span>SEVİYE ${level} / 10</span><h3>${item.name}</h3><p>${item.description}</p><small>${item.effect}</small></div><button data-upgrade="${kind}" ${maxed?'disabled':''}>${maxed?'AZAMİ':`◈ ${cost} İNCİ`}</button></article>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach(button=>button.onclick=()=>requestUpgrade(button.dataset.upgrade as UpgradeKind));
  if(!pendingUpgrade){ui('upgradeConfirm').classList.remove('visible');ui('upgradeConfirm').innerHTML='';return;}
  const item=UPGRADES[pendingUpgrade],cost=upgradeCost(pendingUpgrade);ui('upgradeConfirm').classList.add('visible');ui('upgradeConfirm').innerHTML=`<div><strong>${item.name} yükseltmesini onaylıyor musun?</strong><span>${cost} İnci harcanacak.</span></div><button id="confirmUpgrade">SATIN AL</button><button id="cancelUpgrade">VAZGEÇ</button>`;
  ui('confirmUpgrade').onclick=buyUpgrade;ui('cancelUpgrade').onclick=()=>{pendingUpgrade=null;renderShipMenu();};
}
function requestUpgrade(kind:UpgradeKind){pendingUpgrade=kind;renderShipMenu();}
function buyUpgrade(){
  if(!pendingUpgrade)return;const kind=pendingUpgrade,cost=upgradeCost(kind);
  if(state.pearls<cost){toast('Bu geliştirme için yeterli İncin yok');return;}
  state.pearls-=cost;upgrades[kind]++;
  if(kind==='hull'){state.maxHp+=20;state.hp+=20;}
  pendingUpgrade=null;saveAccount();renderShipMenu();updateUI();rewardNotice(`${UPGRADES[kind].name}   SEVİYE ${upgrades[kind]}`);
}
let pendingCancel:number|null=null;
function openQuestLog(){renderQuestLog();ui('questOverlay').classList.add('open');}
function closeQuestLog(){pendingCancel=null;ui('questOverlay').classList.remove('open');}
function renderQuestLog(){
  ui('questList').innerHTML=QUESTS.map((quest,index)=>{
    const cooling=questCooldownUntil[index]>Date.now(),active=state.activeQuest===index,progress=questProgress[index];
    const status=cooling?cooldownText(questCooldownUntil[index]):active?'GÖREVİ İPTAL ET':progress>0?'DEVAM ET':'GÖREVİ BAŞLAT';
    const action=pendingCancel===index?`<div class="cancel-confirm"><strong>Emin misin?</strong><button data-confirm-cancel="${index}">İPTALİ ONAYLA</button><button data-keep-quest="${index}">VAZGEÇ</button></div>`:`<button data-quest="${index}" ${cooling?'disabled':''}>${status}</button>`;
    return `<article class="quest-entry ${active?'active':''} ${cooling?'completed':''}"><div class="quest-number">${String(index+1).padStart(2,'0')}</div><div class="quest-copy"><span>${cooling?'8 SAAT BEKLEME':quest.target==='ship'?'GEMİ AVI':'DENİZ CANAVARI'}</span><h3>${quest.title}</h3><p>${quest.description}</p><div class="quest-rewards"><b>${quest.gold} ALTIN</b><b>${quest.wood} KERESTE</b><b>${quest.fame} ŞÖHRET</b><b>◈ ${quest.pearls} İNCİ</b></div><small>${cooling?'Yeniden açılmasına: '+cooldownText(questCooldownUntil[index]):`${Math.min(progress,quest.required)} / ${quest.required} ${quest.target==='ship'?'Düşman':'Canavar'}`}</small></div>${action}</article>`;
  }).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-quest]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.quest);state.activeQuest===index?requestQuestCancel(index):startQuest(index);});
  document.querySelectorAll<HTMLButtonElement>('[data-confirm-cancel]').forEach(button=>button.onclick=()=>cancelQuest(Number(button.dataset.confirmCancel)));
  document.querySelectorAll<HTMLButtonElement>('[data-keep-quest]').forEach(button=>button.onclick=()=>{pendingCancel=null;renderQuestLog();});
}
function startQuest(index:number){
  if(questCooldownUntil[index]>Date.now())return;
  if(state.activeQuest!==null){toast(`Önce ${QUESTS[state.activeQuest].title} görevini iptal et`);return;}
  state.activeQuest=index;saveQuestState();closeQuestLog();toast(`${QUESTS[index].title} görevi başladı`);updateUI();
}
function requestQuestCancel(index:number){if(state.activeQuest!==index)return;pendingCancel=index;renderQuestLog();}
function cancelQuest(index:number){
  if(state.activeQuest!==index)return;
  state.activeQuest=null;questProgress[index]=0;questCooldownUntil[index]=Date.now()+8*60*60*1000;pendingCancel=null;saveQuestState();renderQuestLog();toast(`${QUESTS[index].title} iptal edildi — 8 saat sonra yeniden açılacak`);updateUI();
}
function recordQuestProgress(target:'ship'|'monster'){
  if(state.activeQuest===null)return;
  const index=state.activeQuest,quest=QUESTS[index];
  if(!quest||quest.target!==target)return;
  questProgress[index]++;saveQuestState();
  if(questProgress[index]<quest.required)return;
  state.gold+=quest.gold;state.wood+=quest.wood;state.fame+=quest.fame;state.pearls+=quest.pearls;
  rewardNotice(`GÖREV TAMAMLANDI   +${quest.gold} Altın   +${quest.pearls} İnci   +${quest.fame} Şöhret`);
  toast(`${quest.title} tamamlandı`);questProgress[index]=0;questCooldownUntil[index]=Date.now()+8*60*60*1000;state.activeQuest=null;saveQuestState();saveAccount();
}
function updateUI(){
  ui('pearls').textContent=String(state.pearls).padStart(3,'0');ui('gold').textContent=String(state.gold).padStart(3,'0');ui('wood').textContent=String(state.wood).padStart(3,'0');ui('fame').textContent=String(state.fame).padStart(3,'0');
  ui('hpText').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/state.maxHp*100}%`;
  const need=state.level*100;ui('xpText').textContent=`${state.fame} / ${need}`;(ui('xpBar') as HTMLElement).style.width=`${Math.min(100,state.fame/need*100)}%`;ui('level').textContent=`SEVİYE ${state.level}`;ui('chainAmmo').textContent=String(state.chainAmmo);
  const quest=state.activeQuest===null?null:QUESTS[state.activeQuest];ui('questTitle').textContent=quest?.title||'Görev seçilmedi';ui('questDescription').textContent=quest?.description||'Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.';ui('quest').textContent=quest?`${questProgress[state.activeQuest!]} / ${quest.required} ${quest.target==='ship'?'Düşman':'Canavar'}`:'Hazır olduğunda bir görev başlat';
  ui('reloadText').textContent=player.cooldown>0?`${player.cooldown.toFixed(1)} sn`:'HAZIR';ui('attack').classList.toggle('reloading',player.cooldown>0);
  ui('repair').classList.toggle('active',state.repairing);
  ui('cannonName').textContent=CANNONS[state.cannonType].name;
  const valid=selected&&targetExists(selected);ui('targetCard').classList.toggle('visible',!!valid);
  if(valid&&selected){const range=Math.round(dist(player,selected)),liningUp=state.attacking&&range<=effectiveRange()-45&&Math.abs(angleDelta(broadsideCourse(selected),player.angle))>=.16;ui('targetName').textContent=selected.name;ui('targetRange').textContent=liningUp?'Borda alınıyor…':`${range} menzil`;ui('targetTier').textContent=selected.kind==='ship'?`Sınıf ${selected.tier}`:'Deniz Canavarı';(ui('targetHp') as HTMLElement).style.width=`${selected.hp/selected.maxHp*100}%`;}
}

function update(dt:number){
    const turn=(keys.has('a')||keys.has('arrowleft')?-1:0)+(keys.has('d')||keys.has('arrowright')?1:0);
    const thrust=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    if(destination&&!thrust&&!turn){
      const d=dist(player,destination),desired=Math.atan2(destination.y-player.y,destination.x-player.x)+Math.PI/2;
      const delta=Math.atan2(Math.sin(desired-player.angle),Math.cos(desired-player.angle));
      player.angle+=clamp(delta,-3.4*dt,3.4*dt);
      const alignment=clamp(1-Math.abs(delta)/Math.PI,.28,1),arrival=clamp(d/135,0,1);
      const targetSpeed=effectiveSpeed()*alignment*arrival;
      player.speed+=(targetSpeed-player.speed)*Math.min(1,dt*(targetSpeed<player.speed?4.8:2.4));
      if(d<7){destination=null;player.speed=0;}
    }
    else {
      player.angle+=turn*2.45*dt;
      const targetSpeed=thrust>0?effectiveSpeed():thrust<0?0:0;
      player.speed+=(targetSpeed-player.speed)*Math.min(1,dt*(thrust>0?2.2:3.8));
    }
    player.speed=clamp(player.speed,0,effectiveSpeed()+4);
    player.x=clamp(player.x+Math.sin(player.angle)*player.speed*dt,25,WORLD-25);player.y=clamp(player.y-Math.cos(player.angle)*player.speed*dt,25,WORLD-25);resolveIslandCollision();
  player.cooldown=Math.max(0,player.cooldown-dt);state.invulnerable=Math.max(0,state.invulnerable-dt);collisionNotice=Math.max(0,collisionNotice-dt);camera.x+=(player.x-camera.x)*Math.min(1,dt*3);camera.y+=(player.y-camera.y)*Math.min(1,dt*3);camera.zoom+=(camera.targetZoom-camera.zoom)*Math.min(1,dt*7);
  for(let i=salvoQueue.length-1;i>=0;i--){salvoQueue[i].delay-=dt;if(salvoQueue[i].delay<=0){releaseSalvo(salvoQueue[i]);salvoQueue.splice(i,1);}}
  if(state.repairing){state.hp=Math.min(state.maxHp,state.hp+state.maxHp*(.035+upgrades.repair*.008)*dt);if(state.hp>=state.maxHp){state.repairing=false;saveAccount();ui('repair').classList.remove('active');toast('Gövde tamamen onarıldı');}}
  wakeClock-=dt;if(Math.abs(player.speed)>8&&wakeClock<=0){wakeClock=.1;particles.push({x:player.x-Math.sin(player.angle)*22,y:player.y+Math.cos(player.angle)*22,vx:-Math.sin(player.angle)*8,vy:Math.cos(player.angle)*8,life:.75,maxLife:.75,kind:'foam'});}
  monsters.forEach(m=>{m.phase+=dt;m.cooldown-=dt;m.slowTimer=Math.max(0,m.slowTimer-dt);if(m.aggro){m.combatTimer-=dt;if(m.combatTimer<=0||Math.hypot(m.x-m.homeX,m.y-m.homeY)>720)m.aggro=false;}if(m.aggro&&dist(m,player)<430&&m.cooldown<=0)monsterFire(m);});
  if(state.attacking&&selected){
    const d=dist(player,selected),cannonRange=effectiveRange();
    if(d>cannonRange-45){
      const away=Math.atan2(player.y-selected.y,player.x-selected.x);
      destination=navigablePoint({x:selected.x+Math.cos(away)*(cannonRange-85),y:selected.y+Math.sin(away)*(cannonRange-85)});
    }else{
      destination=null;player.speed+=(0-player.speed)*Math.min(1,dt*5);
      const course=broadsideCourse(selected),delta=angleDelta(course,player.angle);
      player.angle+=clamp(delta,-2.6*dt,2.6*dt);
      if(Math.abs(delta)<.16&&player.speed<9)fireAtTarget();
    }
  }
  for(const e of enemies){
    const d=dist(e,player);e.wander+=dt;e.slowTimer=Math.max(0,e.slowTimer-dt);if(e.aggro){e.combatTimer-=dt;if(e.combatTimer<=0||Math.hypot(e.x-e.homeX,e.y-e.homeY)>680)e.aggro=false;}
    const homeDistance=Math.hypot(e.x-e.homeX,e.y-e.homeY);
    const target=e.aggro?Math.atan2(player.y-e.y,player.x-e.x)+Math.PI/2:homeDistance>90?Math.atan2(e.homeY-e.y,e.homeX-e.x)+Math.PI/2:e.angle+Math.sin(e.wander*.35)*.008;
    e.angle+=Math.atan2(Math.sin(target-e.angle),Math.cos(target-e.angle))*dt*(e.aggro?.8:.25);
    if(!e.aggro||d>240){const slow=e.slowTimer>0?.55:1;e.x=clamp(e.x+Math.sin(e.angle)*e.speed*(e.aggro?1:.45)*slow*dt,40,WORLD-40);e.y=clamp(e.y-Math.cos(e.angle)*e.speed*(e.aggro?1:.45)*slow*dt,40,WORLD-40);if(Math.random()<dt*3)particles.push({x:e.x-Math.sin(e.angle)*18,y:e.y+Math.cos(e.angle)*18,vx:0,vy:0,life:.55,maxLife:.55,kind:'foam'});} if(e.aggro&&d<440&&e.cooldown<=0)enemyFire(e);e.cooldown-=dt;
  }
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.owner==='player'&&s.target&&targetExists(s.target)){const a=Math.atan2(s.target.y-s.y,s.target.x-s.x),speed=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;s.life=Math.max(s.life,.12);}
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(s.owner==='player'){
      for(let j=enemies.length-1;j>=0&&s.life>0;j--){
        const e=enemies[j];
        if(dist(s,e)<25){const hit=s.damage;s.hit=true;e.aggro=true;e.combatTimer=12;if(s.ammo==='chain')e.slowTimer=3;e.hp-=hit;damageText(e.x,e.y,hit);burst(e.x,e.y);s.life=0;
          if(e.hp<=0){const gold=12+e.tier*5,wood=4+e.tier;burst(e.x,e.y,true);enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}state.gold+=gold;state.wood+=wood;state.fame+=20;saveAccount();rewardNotice(`+${gold} Altın   +${wood} Kereste   +20 Şöhret`);toast(`${e.name} batırıldı`);recordQuestProgress('ship');setTimeout(spawnEnemy,1400);}
        }
      }
      for(let j=monsters.length-1;j>=0&&s.life>0;j--){
        const m=monsters[j];
        if(dist(s,m)<m.radius){const hit=s.damage;s.hit=true;m.aggro=true;m.combatTimer=12;if(s.ammo==='chain')m.slowTimer=3;m.hp-=hit;damageText(m.x,m.y,hit);burst(m.x,m.y);s.life=0;
          if(m.hp<=0){state.gold+=100;state.wood+=15;state.fame+=80;state.pearls+=2;saveAccount();rewardNotice('+100 Altın   +2 İnci   +80 Şöhret');recordQuestProgress('monster');m.hp=m.maxHp;m.aggro=false;m.x=160+Math.random()*(WORLD-320);m.y=160+Math.random()*(WORLD-320);m.homeX=m.x;m.homeY=m.y;m.combatTimer=0;selected=null;state.attacking=false;toast(`${m.name} yenildi`);}
        }
      }
    }else if(state.invulnerable<=0&&dist(s,player)<22){s.hit=true;state.repairing=false;state.hp-=s.damage;damageText(player.x,player.y,s.damage);burst(player.x,player.y);s.life=0;if(state.hp<=0)respawn();}
    if(s.life<=0)shots.splice(i,1);
  }
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  let need=state.level*100;while(state.fame>=need){state.fame-=need;state.level++;state.maxHp+=15;state.hp=state.maxHp;state.pearls+=5;saveAccount();rewardNotice(`SEVİYE ${state.level}   +15 Azami Gövde   +5 İnci`);toast(`Seviye ${state.level}!`);need=state.level*100;}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui('toast').classList.remove('show');}if(rewardTimer>0){rewardTimer-=dt;if(rewardTimer<=0){ui('rewardToast').classList.remove('show');const next=rewardQueue.shift();if(next)setTimeout(()=>showReward(next),220);}} updateUI();
}

function worldToScreen(v:Vec){return{x:v.x-camera.x+innerWidth/2,y:v.y-camera.y+innerHeight/2};}
function drawShip(p:Vec,angle:number,color:string,scale=1){
  const s=worldToScreen(p);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(angle);ctx.scale(scale,scale);
  ctx.shadowColor='#000b';ctx.shadowBlur=13;ctx.fillStyle='#2a1c18';ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(21,-22,17,22);ctx.quadraticCurveTo(10,36,0,40);ctx.quadraticCurveTo(-10,36,-17,22);ctx.quadraticCurveTo(-21,-22,0,-34);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#765039';ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(12,-17);ctx.lineTo(12,23);ctx.lineTo(0,33);ctx.lineTo(-12,23);ctx.lineTo(-12,-17);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#301d17';ctx.lineWidth=2;for(let y=-15;y<25;y+=9){ctx.beginPath();ctx.moveTo(-11,y);ctx.lineTo(11,y);ctx.stroke();}
  ctx.fillStyle=color;ctx.fillRect(-12,15,24,9);ctx.strokeStyle='#d5bd8b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,25);ctx.stroke();
  ctx.fillStyle='#e5d4ad';ctx.beginPath();ctx.moveTo(-2,-25);ctx.quadraticCurveTo(-29,-15,-2,-2);ctx.closePath();ctx.fill();ctx.fillStyle='#cdb889';ctx.beginPath();ctx.moveTo(2,-17);ctx.quadraticCurveTo(29,-7,2,7);ctx.closePath();ctx.fill();
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(1,-29);ctx.lineTo(14,-24);ctx.lineTo(1,-19);ctx.closePath();ctx.fill();
  ctx.fillStyle='#171817';for(const x of [-15,15])for(const y of [-8,3,14]){ctx.beginPath();ctx.arc(x,y,2.2,0,7);ctx.fill();}ctx.restore();
}
function drawPlayerShip(){
  const s=worldToScreen(player);
  if(!directionalShipImage.complete||!directionalShipImage.naturalWidth){
    if(!playerShipImage.complete||!playerShipImage.naturalWidth){drawShip(player,player.angle,'#173f48',1.1);return;}
  }
  const bob=Math.sin(performance.now()/420)*1.8;
  ctx.save();ctx.translate(s.x,s.y+bob);ctx.shadowColor='#000b';ctx.shadowBlur=13;ctx.globalAlpha=state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1;
  if(directionalShipImage.complete&&directionalShipImage.naturalWidth){
    const heading=Math.atan2(-Math.cos(player.angle),Math.sin(player.angle));
    const compass=(Math.round((heading+Math.PI/2)/(Math.PI/4))+8)%8;
    // Üretilen sprite sayfasındaki gerçek pruva yönlerini pusula yönleriyle eşleştir.
    // Sıra: K, KD, D, GD, G, GB, B, KB.
    const frames=[4,3,6,5,0,1,2,3];
    const frame=frames[compass],mirror=compass===7;
    const sx=(frame%4)*256,sy=Math.floor(frame/4)*256;
    if(mirror)ctx.scale(-1,1);
    ctx.drawImage(directionalShipImage,sx,sy,256,256,-58,-58,116,116);
  }else ctx.drawImage(playerShipImage,-49,-49,98,98);
  ctx.restore();
}
function drawIsland(i:typeof islands[number]){const s=worldToScreen(i);const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,i.r);g.addColorStop(0,'#617c4e');g.addColorStop(.5,'#3c593e');g.addColorStop(.66,'#b9a16b');g.addColorStop(.72,'#17434a');g.addColorStop(1,'#0b2b35');ctx.fillStyle=g;ctx.beginPath();for(let n=0;n<18;n++){const a=n/18*Math.PI*2,r=i.r*(.78+Math.sin(n*4.7)*.09);const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();for(let n=0;n<7;n++){const a=n*2.1,r=i.r*.38;ctx.fillStyle='#213c2d';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,7+n%3*2,0,7);ctx.fill();}ctx.fillStyle='#d7c697';ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.76);}
function drawMonster(m:Monster){const s=worldToScreen(m);ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#477f72';ctx.lineWidth=9;ctx.lineCap='round';for(let n=0;n<6;n++){const a=n/6*Math.PI*2+m.phase*.12;ctx.beginPath();ctx.moveTo(Math.cos(a)*12,Math.sin(a)*12);ctx.quadraticCurveTo(Math.cos(a+.5)*50,Math.sin(a+.5)*50,Math.cos(a+Math.sin(m.phase+n)*.35)*m.radius,Math.sin(a+Math.sin(m.phase+n)*.35)*m.radius);ctx.stroke();}ctx.fillStyle='#38675f';ctx.beginPath();ctx.arc(0,0,25,0,7);ctx.fill();ctx.fillStyle='#d5cc71';ctx.beginPath();ctx.arc(-8,-5,4,0,7);ctx.arc(8,-5,4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#89b0a8';ctx.font='600 10px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-66);}
function draw(){
  const w=innerWidth,h=innerHeight;const sea=ctx.createLinearGradient(0,0,0,h);sea.addColorStop(0,'#0e3b48');sea.addColorStop(1,'#071f2a');ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-w/2,-h/2);
  ctx.strokeStyle='#74b3b40b';ctx.lineWidth=1;const grid=80,ox=(-camera.x+innerWidth/2)%grid,oy=(-camera.y+innerHeight/2)%grid;for(let x=ox;x<w;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=oy;y<h;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='#87c8ca22';for(let n=0;n<30;n++){const x=(n*193-camera.x*.12)%(w+120)-60,y=(n*97-camera.y*.1)%(h+100);ctx.beginPath();ctx.arc(x,y,28+n%4*8,.2,2.8);ctx.stroke();}
  ctx.globalAlpha=.12;ctx.fillStyle='#b7d9d1';ctx.font='700 42px Cinzel';ctx.textAlign='center';ctx.fillText('KIZIL SULAR',worldToScreen({x:1500,y:1040}).x,worldToScreen({x:1500,y:1040}).y);ctx.fillText('SİS DENİZİ',worldToScreen({x:610,y:1800}).x,worldToScreen({x:610,y:1800}).y);ctx.globalAlpha=1;
  islands.forEach(drawIsland);monsters.forEach(drawMonster);
  particles.forEach(p=>{const s=worldToScreen(p),a=Math.max(0,p.life/p.maxLife);ctx.globalAlpha=a;if(p.kind==='damage'){ctx.fillStyle='#ffd878';ctx.font='700 14px Inter';ctx.textAlign='center';ctx.fillText(p.text||'',s.x,s.y);}else{ctx.fillStyle=p.kind==='foam'?'#b9e2df':p.kind==='spark'?'#ffb340':'#3f4545';ctx.beginPath();ctx.arc(s.x,s.y,p.kind==='smoke'?7*(1-a)+3:p.kind==='foam'?4:2,0,7);ctx.fill();}ctx.globalAlpha=1;});
  shots.forEach(s=>{const p=worldToScreen(s);ctx.fillStyle=s.owner==='player'?'#ffd889':'#ff7450';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();ctx.shadowBlur=0;});
  enemies.forEach(e=>{drawShip(e,e.angle,'#732f2b');const s=worldToScreen(e);ctx.fillStyle='#07161c';ctx.fillRect(s.x-25,s.y-42,50,5);ctx.fillStyle='#c64f3d';ctx.fillRect(s.x-25,s.y-42,50*e.hp/e.maxHp,5);ctx.fillStyle='#d7cbb5';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(e.name,s.x,s.y-49);});
  if(selected&&targetExists(selected)){const t=worldToScreen(selected);ctx.strokeStyle='#f1c662';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,selected.kind==='monster'?selected.radius+10:34,0,7);ctx.stroke();}
  drawPlayerShip();
  if(destination){const d=worldToScreen(destination),p=worldToScreen(player);ctx.strokeStyle='#e7cf8d55';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(d.x,d.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e7cf8d';ctx.beginPath();ctx.arc(d.x,d.y,9,0,7);ctx.stroke();}
  const ps=worldToScreen(player);ctx.strokeStyle=selected?'#e8cf934d':'#e8cf9328';ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(ps.x,ps.y,selected?effectiveRange():115,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();drawMinimap();
}
function drawMinimap(){mini.fillStyle='#061820';mini.fillRect(0,0,170,125);mini.strokeStyle='#9fc2bd22';mini.strokeRect(.5,.5,169,124);for(const i of islands){mini.fillStyle='#536d4b';mini.beginPath();mini.arc(i.x/WORLD*170,i.y/WORLD*125,Math.max(3,i.r/WORLD*170),0,7);mini.fill();}for(const e of enemies){mini.fillStyle='#c34e3d';mini.fillRect(e.x/WORLD*170-1,e.y/WORLD*125-1,3,3);}mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(player.x/WORLD*170,player.y/WORLD*125,3,0,7);mini.fill();}
let last=performance.now();function loop(now:number){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}updateUI();requestAnimationFrame(loop);

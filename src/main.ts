import './style.css';

type Vec = { x: number; y: number };
type AmmoKind = 'iron'|'chain';
type CannonKind = 'cast'|'long'|'rapid'|'heavy';
type Shot = Vec & { vx:number; vy:number; life:number; owner:'player'|'enemy'; damage:number; hit:boolean; ammo:AmmoKind; target?:Target };
type SalvoRound = { delay:number; target:Target; side:number; slot:number; damage:number; ammo:AmmoKind };
type EnemyRole='scout'|'raider'|'warship';
type Enemy = Vec & { kind:'ship'; role:EnemyRole; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; damage:number; reload:number; rewardGold:number; rewardWood:number; rewardFame:number; color:string; name:string; tier:number; aggro:boolean; wander:number; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:'foam'|'smoke'|'spark'|'damage'; text?:string };
type Monster = Vec & { kind:'monster'; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Target = Enemy|Monster;
type Quest = { title:string; description:string; target:'ship'|'monster'; required:number; gold:number; wood:number; fame:number; pearls:number };
type UpgradeKind = 'hull'|'damage'|'range'|'reload'|'speed'|'repair';
type QuickItemId = 'iron'|'chain'|'repairkit'|'speed'|'hull'|'damage'|'range'|'reload'|'gold'|'wood'|'pearl'|'quest';
const CANNONS:Record<CannonKind,{name:string;damage:number;range:number;reload:number}>={
  cast:{name:'Döküm',damage:1,range:390,reload:1.65},
  long:{name:'Uzun',damage:.82,range:470,reload:2.05},
  rapid:{name:'Seri',damage:.68,range:340,reload:1.05},
  heavy:{name:'Ağır',damage:1.38,range:365,reload:2.65}
};
const ENEMY_CLASSES:Record<EnemyRole,{name:string;hp:number;speed:number;damage:number;reload:number;gold:number;wood:number;fame:number;color:string}>={
  scout:{name:'Kaçakçı Gözcü',hp:38,speed:52,damage:5,reload:2.8,gold:13,wood:3,fame:14,color:'#4d6c75'},
  raider:{name:'Yağmacı',hp:58,speed:42,damage:8,reload:2.35,gold:20,wood:5,fame:22,color:'#79372f'},
  warship:{name:'Kızıl Savaş Gemisi',hp:92,speed:32,damage:12,reload:2.8,gold:34,wood:9,fame:38,color:'#8b2925'}
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
const QUICK_ITEMS:Record<QuickItemId,{name:string;icon:string;category:'ammo'|'consumable'|'material';description:string}>={
  iron:{name:'Demir Gülle',icon:'iron',category:'ammo',description:'Standart ve sınırsız top güllesi.'},chain:{name:'Zincir Güllesi',icon:'chain',category:'ammo',description:'Hedefi 3 saniye yavaşlatır.'},
  repairkit:{name:'Tamir Sandığı',icon:'repairkit',category:'consumable',description:'Açık deniz tamirini başlatır.'},speed:{name:'Rüzgâr İksiri',icon:'speed',category:'consumable',description:'Ekstra hız özelliği yakında.'},
  hull:{name:'Gövde Plakası',icon:'hull',category:'material',description:'Gövde geliştirmelerinde kullanılır.'},damage:{name:'Top Parçası',icon:'damage',category:'material',description:'Top güvertesi geliştirme malzemesi.'},
  range:{name:'Uzun Namlu',icon:'range',category:'material',description:'Menzil geliştirme malzemesi.'},reload:{name:'Mekanik Dişli',icon:'reload',category:'material',description:'Dolum geliştirme malzemesi.'},
  gold:{name:'Altın',icon:'gold',category:'material',description:'Genel oyun para birimi.'},wood:{name:'Kereste',icon:'wood',category:'material',description:'Gemi yapım malzemesi.'},
  pearl:{name:'İnci',icon:'pearl',category:'material',description:'Premium geliştirme para birimi.'},quest:{name:'Görev Mührü',icon:'hull',category:'material',description:'Özel görev malzemesi; yakında.'}
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="brand">KARA YELKEN<small>GÖLGELER DENİZİ</small></div>
      <nav class="top-shortcuts"><button id="openQuestTop"><i class="shortcut-mark">✦</i><span>GÖREVLER</span></button><button id="openShip"><i class="sprite icon-hull"></i><span>GEMİ</span></button><button class="market-main" id="openMarket"><i class="sprite icon-gold"></i><span>MARKET</span></button><button class="captain-shortcut" id="openCaptain"><i class="captain-face">☠</i><span>KAPTAN</span><b id="level">1</b></button><button disabled><i class="shortcut-mark">♜</i><span>FİLO</span></button><button disabled><i class="shortcut-mark">⚙</i><span>AYARLAR</span></button></nav>
      <div class="resources"><div class="resource compact"><i class="sprite icon-gold"></i><span>ALTIN</span><b id="gold">000</b></div><div class="resource compact pearl"><i class="sprite icon-pearl"></i><span>İNCİ</span><b id="pearls">000</b></div></div>
      <div class="panel quest"><span class="eyebrow">Aktif görev</span><h3 id="questTitle">Görev seçilmedi</h3><p id="questDescription">Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.</p><div class="progress" id="quest">Hazır olduğunda bir görev başlat</div><button class="quest-open" id="openQuests">GÖREVLERİ AÇ</button></div>
      <section class="combat-targets" id="combatTargets" aria-live="polite"></section>
      <div class="bottom-command"><div class="status-bars"><div class="status-pair"><div class="status-line xp-line"><span>TP</span><i><em id="xpHudBar"></em></i><b id="xpHudText">0 / 100</b></div><div class="status-line elite-line"><span>EP</span><i><em id="eliteBar"></em></i><b id="eliteText">0 / 100</b></div></div><button class="recenter" id="recenterShip" aria-label="Gemiyi haritada ortala">✥</button><div class="status-pair"><div class="status-line hp-line"><span>CP</span><i><em id="hpHudBar"></em></i><b id="hpHudText">100 / 100</b></div><div class="status-line battle-line"><span>SP</span><i><em id="battleBar"></em></i><b id="battleText">0 / 100</b></div></div></div><div class="quick-inventory" id="quickInventory"></div></div>
      <div class="combat-controls"><button class="combat-action attack" id="attack"><b>⚔</b><span id="attackLabel">SALDIR</span><small id="reloadText">HAZIR</small></button><button class="combat-action repair" id="repair"><b>✚</b><span>TAMİR ET</span><small>F</small></button><button class="combat-action speed" id="speedBoost"><b>➤</b><span>HIZLANDIR</span><small>YAKINDA</small></button></div>
      <div class="map-cluster"><canvas id="minimap" width="170" height="125"></canvas><button class="world-map-button" id="openWorldMap" aria-label="Dünya haritalarını görüntüle">◎<span>DÜNYA</span></button><div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div></div>
      <div class="reward-toast" id="rewardToast"></div>
      <div class="toast" id="toast"></div>
      <div class="quest-overlay" id="questOverlay"><section class="quest-log"><header><div><span class="eyebrow">Kaptanın görev defteri</span><h2>DENİZ GÖREVLERİ</h2></div><button id="closeQuests" aria-label="Görevleri kapat">×</button></header><p class="quest-intro">Aynı anda yalnızca bir görev yürütülebilir. İptal edilen veya tamamlanan görev 8 saat sonra yeniden açılır.</p><div class="quest-list" id="questList"></div></section></div>
      <div class="captain-overlay" id="captainOverlay"><section class="captain-profile"><header><div><span class="eyebrow">Oyuncu profili</span><h2>KAPTAN YASİN</h2></div><button id="closeCaptain" aria-label="Kaptan profilini kapat">×</button></header><div class="captain-identity"><div class="captain-portrait">☠<b id="captainLevel">1</b></div><div><span>AMİRAL GEMİSİ</span><strong>Kara Yelken</strong><small>Gölgeler Denizi Kaptanı</small></div></div><div class="captain-stat-grid"><article><span>TECRÜBE PUANI</span><b id="xpText">0 / 100</b><i class="xp"><em id="xpBar"></em></i></article><article><span>CAN PUANI</span><b id="hpText">100 / 100</b><i class="hp"><em id="hpBar" style="width:100%"></em></i></article><article><span>ELİT PUAN</span><b id="profileElite">0 / 100</b><i class="elite"><em id="profileEliteBar"></em></i></article><article><span>SAVAŞ PUANI</span><b id="profileBattle">0 / 500</b><i class="battle"><em id="profileBattleBar"></em></i></article></div></section></div>
      <div class="ship-overlay" id="shipOverlay"><section class="ship-menu"><header><div><span class="eyebrow">Kaptanın amiral gemisi</span><h2>KARA YELKEN</h2></div><button id="closeShip" aria-label="Gemi menüsünü kapat">×</button></header><div class="ship-summary" id="shipSummary"></div><h3 class="ship-section-title">TOP DONANIMI</h3><div class="cannon-rack" id="cannonRack"></div><h3 class="ship-section-title">GEMİ GELİŞTİRMELERİ</h3><div class="upgrade-list" id="upgradeList"></div><div class="upgrade-confirm" id="upgradeConfirm"></div></section></div>
      <div class="market-overlay" id="marketOverlay"><section class="market-menu"><header><div><span class="eyebrow">Tüccar loncası</span><h2>DENİZ MARKETİ</h2></div><button id="closeMarket" aria-label="Marketi kapat">×</button></header><div class="inventory-strip" id="inventoryStrip"></div><h3 class="market-heading">MÜHİMMAT</h3><div class="market-list" id="marketList"></div><h3 class="market-heading">İNCİ PAKETLERİ</h3><div class="pearl-shop"><div><b>◈ İnci Sandıkları</b><span>Gerçek ödeme sistemi kullanıcı hesaplarıyla birlikte açılacak.</span></div><button disabled>YAKINDA</button></div><div class="market-confirm" id="marketConfirm"></div></section></div>
      <div class="loadout-overlay" id="loadoutOverlay"><section class="loadout-menu"><header><div><span class="eyebrow">Hızlı kullanım düzeni</span><h2>MALZEMELER</h2></div><button id="closeLoadout">×</button></header><div class="loadout-tabs"><button data-tab="ammo" class="active">GÜLLELER</button><button data-tab="consumable">SARF</button><button data-tab="material">MALZEMELER</button></div><p>Malzemeyi sürükleyip alt kısımdaki 12 yuvadan birine bırak. Telefonda önce malzemeye, sonra hedef yuvaya dokun.</p><div class="loadout-items" id="loadoutItems"></div><div class="loadout-slots" id="loadoutSlots"></div></section></div>
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
Promise.all(['00','01','02','03'].map(part=>fetch(`/assets/pirate-ui-icons-v1.b64.${part}`).then(r=>r.text())))
  .then(parts=>document.documentElement.style.setProperty('--pirate-icons',`url("data:image/webp;base64,${parts.join('')}")`));
const ui = (id:string) => document.getElementById(id)!;
const WORLD = 2800;
const keys = new Set<string>();
const QUEST_STORAGE='kara-yelken-quests-v1';
const ACCOUNT_STORAGE='kara-yelken-account-v1';
let storedQuests:{activeQuest:number|null;progress:number[];cooldowns:number[]}|null=null;
let storedAccount:{pearls?:number;gold:number;wood:number;fame:number;level:number;maxHp:number;hp:number;chainAmmo:number;elitePoints?:number;battlePoints?:number;cannonType?:CannonKind;quickSlots?:Array<QuickItemId|null>;upgrades:Record<UpgradeKind,number>}|null=null;
try{storedQuests=JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null');}catch{storedQuests=null;}
try{storedAccount=JSON.parse(localStorage.getItem(ACCOUNT_STORAGE)||'null');}catch{storedAccount=null;}
const storedActive=storedQuests?.activeQuest;
const upgrades:Record<UpgradeKind,number>={hull:storedAccount?.upgrades?.hull||0,damage:storedAccount?.upgrades?.damage||0,range:storedAccount?.upgrades?.range||0,reload:storedAccount?.upgrades?.reload||0,speed:storedAccount?.upgrades?.speed||0,repair:storedAccount?.upgrades?.repair||0};
const state = { pearls:storedAccount?.pearls??30, gold:storedAccount?.gold??40, wood:storedAccount?.wood??10, fame:storedAccount?.fame??0, level:storedAccount?.level??1, hp:storedAccount?.hp??100, maxHp:storedAccount?.maxHp??100, elitePoints:storedAccount?.elitePoints??0,battlePoints:storedAccount?.battlePoints??0,cannon:18, cannonType:storedAccount?.cannonType&&CANNONS[storedAccount.cannonType]?storedAccount.cannonType:'cast' as CannonKind, activeQuest:Number.isInteger(storedActive)&&storedActive!>=0&&storedActive!<QUESTS.length?storedActive!:null as number|null, ammo:'iron' as AmmoKind, chainAmmo:storedAccount?.chainAmmo??40, attacking:false, repairing:false, invulnerable:0 };
const quickSlots:Array<QuickItemId|null>=Array.from({length:12},(_,index)=>storedAccount?.quickSlots?.[index]??(['iron','chain','repairkit','speed'][index] as QuickItemId|undefined)??null);
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
addEventListener('keydown',e=>{ keys.add(e.key.toLowerCase()); if(['q','e',' '].includes(e.key.toLowerCase())) fire(e.key.toLowerCase()); if(e.key.toLowerCase()==='r') toggleAttack(); if(e.key.toLowerCase()==='f')toggleRepair();if(e.key==='Escape'){closeQuestLog();closeShipMenu();closeMarket();closeCaptainProfile();} });
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
ui('speedBoost').onclick=()=>toast('Ekstra hız özelliği sonraki aşamada açılacak');
ui('recenterShip').onclick=()=>{camera.x=player.x;camera.y=player.y;destination=null;toast('Kamera gemiye ortalandı');};
ui('openWorldMap').onclick=()=>toast('Dünya haritaları ilerleyen aşamada burada açılacak');
ui('openCaptain').onclick=openCaptainProfile;
ui('closeCaptain').onclick=closeCaptainProfile;
ui('captainOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('captainOverlay'))closeCaptainProfile();});
ui('zoomOut').onclick=()=>setZoom(camera.targetZoom-.1);
ui('zoomIn').onclick=()=>setZoom(camera.targetZoom+.1);
ui('openQuests').onclick=openQuestLog;
ui('openQuestTop').onclick=openQuestLog;
ui('closeQuests').onclick=closeQuestLog;
ui('questOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('questOverlay'))closeQuestLog();});
ui('openShip').onclick=openShipMenu;
ui('closeShip').onclick=closeShipMenu;
ui('shipOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('shipOverlay'))closeShipMenu();});
ui('openMarket').onclick=openMarket;
ui('closeMarket').onclick=closeMarket;
ui('marketOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('marketOverlay'))closeMarket();});
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.targetZoom+(e.deltaY<0?.1:-.1));},{passive:false});
ui('closeLoadout').onclick=closeLoadout;
ui('loadoutOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('loadoutOverlay'))closeLoadout();});
document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>button.onclick=()=>{loadoutTab=button.dataset.tab as typeof loadoutTab;renderLoadout();});

function spawnEnemy(){
  const a=Math.random()*Math.PI*2,d=500+Math.random()*650,tier=1+Math.floor(state.level/3);
  const x=clamp(player.x+Math.cos(a)*d,80,WORLD-80),y=clamp(player.y+Math.sin(a)*d,80,WORLD-80);
  const roll=Math.random(),role:EnemyRole=roll<.38?'scout':roll<.82?'raider':'warship',enemyClass=ENEMY_CLASSES[role],maxHp=enemyClass.hp+tier*12;
  enemies.push({kind:'ship',role,x,y,angle:a+Math.PI,hp:maxHp,maxHp,cooldown:Math.random()*2,speed:enemyClass.speed+Math.random()*4,damage:enemyClass.damage+tier,reload:enemyClass.reload,rewardGold:enemyClass.gold+tier*5,rewardWood:enemyClass.wood+tier,rewardFame:enemyClass.fame+tier*2,color:enemyClass.color,name:enemyClass.name,tier,aggro:false,wander:Math.random()*6,slowTimer:0,homeX:x,homeY:y,combatTimer:0});
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
function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;if(state.attacking){state.repairing=false;fireAtTarget();}ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
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
  if(state.ammo==='chain'){state.chainAmmo-=1;saveAccount();}
  player.cooldown=cannon.reload*Math.max(.6,1-upgrades.reload*.04)*(state.ammo==='chain'?1.18:1);
}
function releaseSalvo(round:SalvoRound){
  if(!targetExists(round.target))return;
  const d=dist(player,round.target);
  const a=Math.atan2(round.target.y-player.y,round.target.x-player.x);
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),rx=Math.cos(player.angle),ry=Math.sin(player.angle),speed=510;
  const tx=(round.target.x-player.x)/Math.max(1,d),ty=(round.target.y-player.y)/Math.max(1,d),forwardDot=fx*tx+fy*ty;
  const muzzle=forwardDot>.55?{x:fx*24,y:fy*24}:forwardDot<-.55?{x:-fx*20,y:-fy*20}:{x:rx*round.side*18,y:ry*round.side*18};
  const x=player.x+muzzle.x,y=player.y+muzzle.y;
  shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:Math.max(1.1,d/speed+.5),owner:'player',damage:round.damage,hit:false,ammo:round.ammo,target:round.target});
  particles.push({x,y,vx:rx*round.side*12,vy:ry*round.side*12,life:.38,maxLife:.38,kind:'smoke'});
}
function enemyFire(e:Enemy){
  const a=Math.atan2(player.y-e.y,player.x-e.x);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy',damage:e.damage,hit:false,ammo:'iron'}); e.cooldown=e.reload+Math.random()*.55;
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
function saveAccount(){localStorage.setItem(ACCOUNT_STORAGE,JSON.stringify({pearls:state.pearls,gold:state.gold,wood:state.wood,fame:state.fame,level:state.level,maxHp:state.maxHp,hp:state.hp,chainAmmo:state.chainAmmo,elitePoints:state.elitePoints,battlePoints:state.battlePoints,cannonType:state.cannonType,quickSlots,upgrades}));}
function effectiveRange(){return CANNONS[state.cannonType].range+upgrades.range*18;}
function effectiveSpeed(){return 104+upgrades.speed*5;}
function cooldownText(until:number){const minutes=Math.max(1,Math.ceil((until-Date.now())/60000)),hours=Math.floor(minutes/60),mins=minutes%60;return hours>0?`${hours} sa ${mins} dk`:`${mins} dk`;}
let pendingUpgrade:UpgradeKind|null=null;
function upgradeCost(kind:UpgradeKind){return Math.round(UPGRADES[kind].pearls*(1+upgrades[kind]*.55));}
function upgradeIcon(kind:UpgradeKind){return `<i class="sprite icon-${kind}"></i>`;}
function openShipMenu(){pendingUpgrade=null;renderShipMenu();ui('shipOverlay').classList.add('open');}
function closeShipMenu(){pendingUpgrade=null;ui('shipOverlay').classList.remove('open');}
function renderShipMenu(){
  const activeCannon=CANNONS[state.cannonType];
  ui('shipSummary').innerHTML=`<div><span>GÖVDE</span><b>${state.maxHp}</b></div><div><span>SALVO HASARI</span><b>${Math.round(state.cannon*5*(1+upgrades.damage*.11)*activeCannon.damage)}</b></div><div><span>MENZİL</span><b>${effectiveRange()}</b></div><div><span>HIZ</span><b>${effectiveSpeed()}</b></div>`;
  const unlockLevel:Record<CannonKind,number>={cast:1,long:2,rapid:3,heavy:4};
  ui('cannonRack').innerHTML=(Object.keys(CANNONS) as CannonKind[]).map(kind=>{const cannon=CANNONS[kind],locked=state.level<unlockLevel[kind],active=state.cannonType===kind;return `<button class="cannon-card ${active?'active':''}" data-cannon="${kind}" ${locked?'disabled':''}><i class="cannon-barrel">${kind==='rapid'?'≋':kind==='heavy'?'●':kind==='long'?'━':'◆'}</i><span>${locked?`SEVİYE ${unlockLevel[kind]} GEREKİR`:active?'KUŞANILDI':'KULLAN'}</span><strong>${cannon.name} Top</strong><small>Hasar ×${cannon.damage.toFixed(2)} · Menzil ${cannon.range} · Dolum ${cannon.reload.toFixed(2)} sn</small></button>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-cannon]').forEach(button=>button.onclick=()=>equipCannon(button.dataset.cannon as CannonKind));
  ui('upgradeList').innerHTML=(Object.keys(UPGRADES) as UpgradeKind[]).map(kind=>{const item=UPGRADES[kind],level=upgrades[kind],cost=upgradeCost(kind),maxed=level>=10;return `<article class="upgrade-card"><div class="upgrade-icon">${upgradeIcon(kind)}</div><div><span>SEVİYE ${level} / 10</span><h3>${item.name}</h3><p>${item.description}</p><small>${item.effect}</small></div><button data-upgrade="${kind}" ${maxed?'disabled':''}>${maxed?'AZAMİ':`◈ ${cost} İNCİ`}</button></article>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach(button=>button.onclick=()=>requestUpgrade(button.dataset.upgrade as UpgradeKind));
  if(!pendingUpgrade){ui('upgradeConfirm').classList.remove('visible');ui('upgradeConfirm').innerHTML='';return;}
  const item=UPGRADES[pendingUpgrade],cost=upgradeCost(pendingUpgrade);ui('upgradeConfirm').classList.add('visible');ui('upgradeConfirm').innerHTML=`<div><strong>${item.name} yükseltmesini onaylıyor musun?</strong><span>${cost} İnci harcanacak.</span></div><button id="confirmUpgrade">SATIN AL</button><button id="cancelUpgrade">VAZGEÇ</button>`;
  ui('confirmUpgrade').onclick=buyUpgrade;ui('cancelUpgrade').onclick=()=>{pendingUpgrade=null;renderShipMenu();};
}
function equipCannon(kind:CannonKind){
  const unlockLevel:Record<CannonKind,number>={cast:1,long:2,rapid:3,heavy:4};
  if(state.level<unlockLevel[kind]){toast(`Bu top için seviye ${unlockLevel[kind]} gerekli`);return;}
  state.cannonType=kind;player.cooldown=0;saveAccount();renderShipMenu();updateUI();toast(`${CANNONS[kind].name} Top kuşanıldı`);
}
function requestUpgrade(kind:UpgradeKind){pendingUpgrade=kind;renderShipMenu();}
function buyUpgrade(){
  if(!pendingUpgrade)return;const kind=pendingUpgrade,cost=upgradeCost(kind);
  if(state.pearls<cost){toast('Bu geliştirme için yeterli İncin yok');return;}
  state.pearls-=cost;upgrades[kind]++;
  if(kind==='hull'){state.maxHp+=20;state.hp+=20;}
  pendingUpgrade=null;saveAccount();renderShipMenu();updateUI();rewardNotice(`${UPGRADES[kind].name}   SEVİYE ${upgrades[kind]}`);
}
const MARKET_ITEMS=[
  {name:'Zincir Güllesi Kesesi',amount:20,price:70,description:'Düşman gemisini 3 saniye boyunca yavaşlatan 20 atış.'},
  {name:'Zincir Güllesi Sandığı',amount:50,price:155,description:'Uzun seferler için indirimli 50 zincir güllesi.'},
  {name:'Filo Mühimmat Kasası',amount:120,price:330,description:'Yoğun çatışmalar için büyük mühimmat stoğu.'}
];
let pendingMarket:number|null=null;
function openMarket(){pendingMarket=null;renderMarket();ui('marketOverlay').classList.add('open');}
function closeMarket(){pendingMarket=null;ui('marketOverlay').classList.remove('open');}
function renderMarket(){
  ui('inventoryStrip').innerHTML=`<div><span>DEMİR GÜLLE</span><b>∞</b><small>Sınırsız standart mühimmat</small></div><div><span>ZİNCİR GÜLLESİ</span><b>${state.chainAmmo}</b><small>Her atış 1 gülle tüketir</small></div><div><span>ALTIN BAKİYESİ</span><b>${state.gold}</b><small>Market alışverişlerinde kullanılır</small></div>`;
  ui('marketList').innerHTML=MARKET_ITEMS.map((item,index)=>`<article class="market-item"><div class="ammo-icon"><i class="sprite icon-chain"></i><b>${item.amount}</b></div><div><h4>${item.name}</h4><p>${item.description}</p></div><button data-market="${index}">${item.price} ALTIN</button></article>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-market]').forEach(button=>button.onclick=()=>{pendingMarket=Number(button.dataset.market);renderMarket();});
  if(pendingMarket===null){ui('marketConfirm').classList.remove('visible');ui('marketConfirm').innerHTML='';return;}
  const item=MARKET_ITEMS[pendingMarket];ui('marketConfirm').classList.add('visible');ui('marketConfirm').innerHTML=`<div><strong>${item.amount} zincir güllesi alınsın mı?</strong><span>${item.price} Altın hesabından düşülecek.</span></div><button id="confirmMarket">SATIN AL</button><button id="cancelMarket">VAZGEÇ</button>`;
  ui('confirmMarket').onclick=buyMarketItem;ui('cancelMarket').onclick=()=>{pendingMarket=null;renderMarket();};
}
function buyMarketItem(){
  if(pendingMarket===null)return;const item=MARKET_ITEMS[pendingMarket];
  if(state.gold<item.price){toast('Bu mühimmat için yeterli altının yok');return;}
  state.gold-=item.price;state.chainAmmo+=item.amount;pendingMarket=null;saveAccount();renderMarket();updateUI();rewardNotice(`+${item.amount} Zincir Güllesi`);
}
let loadoutTab:'ammo'|'consumable'|'material'='ammo';
let pendingQuickItem:QuickItemId|null=null;
function quickCount(item:QuickItemId){if(item==='iron')return'∞';if(item==='chain')return String(state.chainAmmo);if(item==='gold')return String(state.gold);if(item==='wood')return String(state.wood);if(item==='pearl')return String(state.pearls);if(item==='repairkit')return'F';if(item==='speed')return'—';if(item in upgrades)return String(upgrades[item as UpgradeKind]);return'0';}
function renderQuickSlots(){
  ui('quickInventory').innerHTML=quickSlots.map((item,index)=>item?`<button class="quick-slot ${item===state.ammo?'active':''}" data-quick-slot="${index}" data-quick-item="${item}"><i class="sprite icon-${QUICK_ITEMS[item].icon}"></i><span>${QUICK_ITEMS[item].name}</span><b>${quickCount(item)}</b></button>`:`<button class="quick-slot empty" data-quick-slot="${index}"><span>+</span><small>${index+1}</small></button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('#quickInventory [data-quick-slot]').forEach(slot=>{const index=Number(slot.dataset.quickSlot);slot.onclick=()=>useQuickSlot(index);slot.ondragover=e=>e.preventDefault();slot.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
function useQuickSlot(index:number){
  if(pendingQuickItem){assignQuickSlot(index,pendingQuickItem);return;}
  const item=quickSlots[index];if(!item){openLoadout('ammo');return;}
  if(item==='iron'||item==='chain'){state.ammo=item;openLoadout('ammo');toast(`${QUICK_ITEMS[item].name} seçildi`);}
  else if(item==='repairkit')toggleRepair();else if(item==='speed')toast('Ekstra hız özelliği yakında açılacak');else openLoadout(QUICK_ITEMS[item].category);
  renderQuickSlots();
}
function assignQuickSlot(index:number,item:QuickItemId){quickSlots[index]=item;pendingQuickItem=null;saveAccount();renderQuickSlots();if(ui('loadoutOverlay').classList.contains('open'))renderLoadout();toast(`${QUICK_ITEMS[item].name} ${index+1}. yuvaya yerleştirildi`);}
function openLoadout(tab:typeof loadoutTab='ammo'){loadoutTab=tab;pendingQuickItem=null;renderLoadout();ui('loadoutOverlay').classList.add('open');}
function closeLoadout(){pendingQuickItem=null;ui('loadoutOverlay').classList.remove('open');}
function renderLoadout(){
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>button.classList.toggle('active',button.dataset.tab===loadoutTab));
  const items=(Object.keys(QUICK_ITEMS) as QuickItemId[]).filter(id=>QUICK_ITEMS[id].category===loadoutTab);
  ui('loadoutItems').innerHTML=items.map(id=>`<button draggable="true" data-loadout-item="${id}" class="${pendingQuickItem===id?'selected':''}"><i class="sprite icon-${QUICK_ITEMS[id].icon}"></i><span>${QUICK_ITEMS[id].name}</span><small>${QUICK_ITEMS[id].description}</small><b>${quickCount(id)}</b></button>`).join('');
  ui('loadoutSlots').innerHTML=quickSlots.map((item,index)=>`<button data-editor-slot="${index}" class="${pendingQuickItem?'ready':''}">${item?`<i class="sprite icon-${QUICK_ITEMS[item].icon}"></i><span>${index+1}</span>`:`<b>+</b><span>${index+1}</span>`}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-loadout-item]').forEach(button=>{const item=button.dataset.loadoutItem as QuickItemId;button.onclick=()=>{pendingQuickItem=item;renderLoadout();};button.ondragstart=e=>e.dataTransfer?.setData('text/quick-item',item);});
  document.querySelectorAll<HTMLButtonElement>('[data-editor-slot]').forEach(button=>{const index=Number(button.dataset.editorSlot);button.onclick=()=>{if(pendingQuickItem)assignQuickSlot(index,pendingQuickItem);};button.ondragover=e=>e.preventDefault();button.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
let pendingCancel:number|null=null;
function openQuestLog(){renderQuestLog();ui('questOverlay').classList.add('open');}
function closeQuestLog(){pendingCancel=null;ui('questOverlay').classList.remove('open');}
function openCaptainProfile(){updateUI();ui('captainOverlay').classList.add('open');}
function closeCaptainProfile(){ui('captainOverlay').classList.remove('open');}
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
  ui('pearls').textContent=String(state.pearls).padStart(3,'0');ui('gold').textContent=String(state.gold).padStart(3,'0');
  document.querySelectorAll<HTMLElement>('#quickInventory [data-quick-item]').forEach(slot=>{const item=slot.dataset.quickItem as QuickItemId;const count=slot.querySelector('b');if(count)count.textContent=quickCount(item);slot.classList.toggle('active',item===state.ammo);});
  ui('hpText').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/state.maxHp*100}%`;
  const need=state.level*100;ui('xpText').textContent=`${state.fame} / ${need}`;(ui('xpBar') as HTMLElement).style.width=`${Math.min(100,state.fame/need*100)}%`;ui('level').textContent=String(state.level);ui('captainLevel').textContent=String(state.level);ui('profileElite').textContent=`${state.elitePoints} / 100`;ui('profileBattle').textContent=`${state.battlePoints} / 500`;(ui('profileEliteBar') as HTMLElement).style.width=`${Math.min(100,state.elitePoints)}%`;(ui('profileBattleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;
  (ui('xpHudBar') as HTMLElement).style.width=`${Math.min(100,state.fame/need*100)}%`;ui('xpHudText').textContent=`${state.fame} / ${need}`;(ui('hpHudBar') as HTMLElement).style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`;ui('hpHudText').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`;(ui('eliteBar') as HTMLElement).style.width=`${Math.min(100,state.elitePoints)}%`;ui('eliteText').textContent=`${state.elitePoints} / 100`;(ui('battleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;ui('battleText').textContent=`${state.battlePoints} / 500`;
  const quest=state.activeQuest===null?null:QUESTS[state.activeQuest];ui('questTitle').textContent=quest?.title||'Görev seçilmedi';ui('questDescription').textContent=quest?.description||'Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.';ui('quest').textContent=quest?`${questProgress[state.activeQuest!]} / ${quest.required} ${quest.target==='ship'?'Düşman':'Canavar'}`:'Hazır olduğunda bir görev başlat';
  ui('reloadText').textContent=player.cooldown>0?`${player.cooldown.toFixed(1)} sn`:'HAZIR';ui('attack').classList.toggle('reloading',player.cooldown>0);
  ui('attackLabel').textContent=state.attacking?'SALDIRIYI İPTAL ET':'SALDIR';ui('attack').classList.toggle('active',state.attacking);
  ui('repair').classList.toggle('active',state.repairing);
  renderCombatTargets();
}

let visibleCombatTargets:Target[]=[];
function renderCombatTargets(){
  const targets:Target[]=[];
  const add=(target:Target|null)=>{if(target&&targetExists(target)&&!targets.includes(target))targets.push(target);};
  add(selected);enemies.forEach(enemy=>{if(enemy.aggro)add(enemy);});monsters.forEach(monster=>{if(monster.aggro)add(monster);});
  visibleCombatTargets=targets.slice(0,5);
  const root=ui('combatTargets');root.classList.toggle('visible',visibleCombatTargets.length>0);
  root.innerHTML=visibleCombatTargets.map((target,index)=>{const range=Math.round(dist(player,target));const active=target===selected;const fighting=target.aggro||(active&&state.attacking);const role=target.kind==='monster'?'DENİZ CANAVARI':target.role==='scout'?'GÖZCÜ':target.role==='warship'?'SAVAŞ GEMİSİ':'YAĞMACI';return `<button class="combat-target ${active?'selected':''}" data-combat-target="${index}"><span class="target-portrait ${target.kind} ${target.kind==='ship'?target.role:''}">${target.kind==='monster'?'☠':target.kind==='ship'&&target.role==='warship'?'⚔':'⚓'}</span><span class="target-info"><small>${target.kind==='monster'?role:target.tier+'. SINIF '+role} · ${range}m</small><strong>${target.name}</strong><i><em style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></em></i><b>${Math.ceil(target.hp)} / ${target.maxHp}</b></span><span class="target-state">${fighting?'SAVAŞ':'HEDEF'}</span></button>`;}).join('');
  root.querySelectorAll<HTMLButtonElement>('[data-combat-target]').forEach(button=>button.onclick=()=>{const target=visibleCombatTargets[Number(button.dataset.combatTarget)];if(target){selected=target;updateUI();}});
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
    if(d>cannonRange){
      const away=Math.atan2(player.y-selected.y,player.x-selected.x);
      destination=navigablePoint({x:selected.x+Math.cos(away)*(cannonRange-35),y:selected.y+Math.sin(away)*(cannonRange-35)});
    }else{
      destination=null;player.speed+=(effectiveSpeed()*.42-player.speed)*Math.min(1,dt*1.4);
      const course=broadsideCourse(selected),delta=angleDelta(course,player.angle);
      player.angle+=clamp(delta,-2.6*dt,2.6*dt);
      fireAtTarget();
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
          if(e.hp<=0){const battle=e.role==='warship'?10:e.role==='raider'?6:4;burst(e.x,e.y,true);enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}state.gold+=e.rewardGold;state.wood+=e.rewardWood;state.fame+=e.rewardFame;state.battlePoints=Math.min(500,state.battlePoints+battle);saveAccount();rewardNotice(`+${e.rewardGold} Altın   +${e.rewardWood} Kereste   +${e.rewardFame} Şöhret   +${battle} Savaş Puanı`);toast(`${e.name} batırıldı`);recordQuestProgress('ship');setTimeout(spawnEnemy,1400);}
        }
      }
      for(let j=monsters.length-1;j>=0&&s.life>0;j--){
        const m=monsters[j];
        if(dist(s,m)<m.radius){const hit=s.damage;s.hit=true;m.aggro=true;m.combatTimer=12;if(s.ammo==='chain')m.slowTimer=3;m.hp-=hit;damageText(m.x,m.y,hit);burst(m.x,m.y);s.life=0;
          if(m.hp<=0){state.gold+=100;state.wood+=15;state.fame+=80;state.pearls+=2;state.elitePoints=Math.min(100,state.elitePoints+10);state.battlePoints=Math.min(500,state.battlePoints+20);saveAccount();rewardNotice('+100 Altın   +2 İnci   +80 Şöhret   +10 Elit Puan');recordQuestProgress('monster');m.hp=m.maxHp;m.aggro=false;m.x=160+Math.random()*(WORLD-320);m.y=160+Math.random()*(WORLD-320);m.homeX=m.x;m.homeY=m.y;m.combatTimer=0;selected=null;state.attacking=false;toast(`${m.name} yenildi`);}
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
  enemies.forEach(e=>{drawShip(e,e.angle,e.color);const s=worldToScreen(e);ctx.fillStyle='#07161c';ctx.fillRect(s.x-25,s.y-42,50,5);ctx.fillStyle=e.role==='warship'?'#e04b3f':e.role==='scout'?'#50a8b4':'#c96a42';ctx.fillRect(s.x-25,s.y-42,50*e.hp/e.maxHp,5);ctx.fillStyle='#d7cbb5';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(e.name,s.x,s.y-49);});
  if(selected&&targetExists(selected)){const t=worldToScreen(selected);ctx.strokeStyle='#f1c662';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,selected.kind==='monster'?selected.radius+10:34,0,7);ctx.stroke();}
  drawPlayerShip();
  if(destination){const d=worldToScreen(destination),p=worldToScreen(player);ctx.strokeStyle='#e7cf8d55';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(d.x,d.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e7cf8d';ctx.beginPath();ctx.arc(d.x,d.y,9,0,7);ctx.stroke();}
  const ps=worldToScreen(player);ctx.strokeStyle=selected?'#e8cf934d':'#e8cf9328';ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(ps.x,ps.y,selected?effectiveRange():115,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();drawMinimap();
}
function drawMinimap(){mini.fillStyle='#061820';mini.fillRect(0,0,170,125);mini.strokeStyle='#9fc2bd22';mini.strokeRect(.5,.5,169,124);for(const i of islands){mini.fillStyle='#536d4b';mini.beginPath();mini.arc(i.x/WORLD*170,i.y/WORLD*125,Math.max(3,i.r/WORLD*170),0,7);mini.fill();}for(const e of enemies){mini.fillStyle='#c34e3d';mini.fillRect(e.x/WORLD*170-1,e.y/WORLD*125-1,3,3);}mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(player.x/WORLD*170,player.y/WORLD*125,3,0,7);mini.fill();}
let last=performance.now();function loop(now:number){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}renderQuickSlots();updateUI();requestAnimationFrame(loop);

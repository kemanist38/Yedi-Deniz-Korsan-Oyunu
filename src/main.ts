import './style.css';
import {ACTIONS,loadSettings,saveSettings,keyLabel,normalizeKey,DEFAULT_BINDS,type ActionId} from './settings';
import {setAudio,unlockAudio,playCannon,playEnemyCannon,playHit,playExplosion,playCoins,playWind,playShield,playSplash,playLevelUp,playMapJump,playClick} from './audio';
import {drawNpcShip,drawMonsterSheet,drawBossSprite,drawChestSprite,drawIslandSprite,drawFleetBase,drawFleetTower,drawMineSprite,seaTilePattern,islandSheetUrl,shipLabelOffset,portraitStyle,preload,fleetBaseUrl,fleetTowerUrl,BOSS_LABEL_OFFSET,TOWER_LABEL_OFFSET,WORLD_CHART} from './sprites';
import {MAPS,GRID,THEMES,NPCS,MONSTERS,QUESTS,QUEST_COOLDOWN_MS,FLEET,WORLD,MAX_LEVEL,xpNeed,neighbor,tierOf,fleetTower,fleetReward,BOSS_PORTRAIT,PORTRAIT_COUNT,PORTRAIT_COLS,PORTRAIT_ATLAS,GRID_COLS,GRID_ROWS,CELL_W,CELL_H,colName,rowName,gridCell,coordLabel,type MapKey,type WorldIsland,type NpcDef,type MonsterDef,type Dir,type QuestDef} from './campaign';
import {ABILITIES,SPECIAL_AMMO,MINE,SPEED_BOOST,SHIELD_FACTOR,ARSENAL_MARKET,loadArsenal,saveArsenal,type AbilityId} from './arsenal';
import {BOSS,loadFleetOwners,saveFleetOwners} from './conquest';
import {TALENTS,OFFICERS,OFFICER_MAX_RANK,officerCost,officerSlots,talentPoints,loadCrew,saveCrew,spentPoints,computeBonus,type TalentId,type OfficerId} from './crew';
import {createChest,chestRewardText,CHEST_PICKUP_RADIUS,CHEST_CLICK_RADIUS,DRIFT_RESPAWN_SECONDS,type LootChest} from './loot';
import {ELITE_SHIPS,eliteById,type EliteShipId} from './elite-ships';

type Vec = { x: number; y: number };
type AmmoKind = 'iron'|'chain'|'fire'|'grape';
type CannonKind = 'cast'|'long'|'rapid'|'heavy';
type CannonStock=Record<CannonKind,number>;
type Shot = Vec & { vx:number; vy:number; life:number; owner:'player'|'enemy'; damage:number; hit:boolean; ammo:AmmoKind; target?:Target };
type SalvoRound = { delay:number; target:Target; side:number; slot:number; damage:number; ammo:AmmoKind };
type EnemyRole='light'|'heavy';
type Enemy = Vec & { kind:'ship'; def?:NpcDef; burnTimer?:number; tower?:boolean; towerIndex?:number; boss?:boolean; summoned?:boolean; hitRadius?:number; fireRange?:number; rewardXp?:number; role:EnemyRole; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; damage:number; reload:number; rewardGold:number; rewardWood:number; rewardFame:number; color:string; name:string; tier:number; aggro:boolean; wander:number; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:'foam'|'smoke'|'spark'|'damage'; text?:string };
type Monster = Vec & { kind:'monster'; def:MonsterDef; burnTimer?:number; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Target = Enemy|Monster;
type UpgradeKind = 'hull'|'damage'|'range'|'reload'|'speed'|'repair';
type QuickItemId = 'iron'|'chain'|'fire'|'grape'|'mine'|'shield'|'repairkit'|'speed';
const CANNONS:Record<CannonKind,{name:string;damage:number;range:number;reload:number}>={
  cast:{name:'Döküm',damage:1,range:390,reload:1.65},
  long:{name:'Uzun',damage:.82,range:470,reload:2.05},
  rapid:{name:'Seri',damage:.68,range:340,reload:1.05},
  heavy:{name:'Ağır',damage:1.38,range:365,reload:2.65}
};
const UPGRADES:Record<UpgradeKind,{name:string;description:string;effect:string;pearls:number}>={
  hull:{name:'Güçlendirilmiş Gövde',description:'Geminin azami gövde dayanıklılığını artırır.',effect:'+20 gövde',pearls:8},
  damage:{name:'Top Güvertesi',description:'Her borda atışının verdiği hasarı artırır.',effect:'+%11 hasar',pearls:10},
  range:{name:'Uzun Namlular',description:'Tüm top türlerinin etkili menzilini artırır.',effect:'+18 menzil',pearls:9},
  reload:{name:'Tecrübeli Topçular',description:'Topların yeniden dolma süresini azaltır.',effect:'-%4 dolum',pearls:12},
  speed:{name:'Yeni Yelken Takımı',description:'Geminin ulaşabileceği azami hızı artırır.',effect:'+5 hız',pearls:9},
  repair:{name:'Usta Marangozlar',description:'Açık denizde yapılan tamirin hızını artırır.',effect:'+%0,8/sn',pearls:7}
};
const QUICK_ITEMS:Record<QuickItemId,{name:string;icon:string;category:'ammo'|'consumable';description:string}>={
  iron:{name:'Demir Gülle',icon:'iron',category:'ammo',description:'Standart ve sınırsız top güllesi.'},chain:{name:'Zincir Güllesi',icon:'chain',category:'ammo',description:'Hedefi 3 saniye yavaşlatır.'},
  fire:{name:'Ateş Güllesi',icon:'damage',category:'ammo',description:'Hedefi 4 saniye yakar.'},grape:{name:'Saçma',icon:'iron',category:'ammo',description:'Kısa menzil, çok yüksek hasar.'},
  repairkit:{name:'Tamir Sandığı',icon:'repairkit',category:'consumable',description:'Açık deniz tamirini başlatır.'},speed:{name:'Rüzgâr İksiri',icon:'speed',category:'consumable',description:'Rüzgâr Hamlesi: 7 sn boyunca %55 hız.'},
  shield:{name:'Demir Kalkan',icon:'hull',category:'consumable',description:'6 sn boyunca %65 hasar azaltma.'},mine:{name:'Deniz Mayını',icon:'hull',category:'consumable',description:'Kıçtan mayın bırakır.'}
};
const AMMO_ROW=6;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="brand">KARA YELKEN<small>GÖLGELER DENİZİ</small></div>
      <nav class="top-shortcuts"><button id="openQuestTop"><img class="nav-img" src="/assets/icon-scroll-v1.webp" alt="" draggable="false"/><span>GÖREVLER</span></button><button id="openEliteShips"><i class="sprite icon-hull"></i><span>GEMİ</span></button><button id="openShip"><i class="sprite icon-hull"></i><span>ENVANTER</span></button><button class="market-main" id="openMarket"><i class="sprite icon-gold"></i><span>MARKET</span></button><button id="openDevelopment"><img class="nav-img" src="/assets/icon-anvil-v1.webp" alt="" draggable="false"/><span>GELİŞTİRME</span></button><button id="openCrew"><img class="nav-img" src="/assets/officer-helmsman-v1.webp" alt="" draggable="false"/><span>TAYFA</span></button><button class="captain-shortcut" id="openCaptain"><i class="captain-face"><img src="/assets/icon-hat-v1.webp" alt="" draggable="false"/></i><span>KAPTAN</span><b id="level">1</b></button><button id="openSettings"><img class="nav-img" src="/assets/icon-gear-v1.webp" alt="" draggable="false"/><span>AYARLAR</span></button></nav>
      <div class="resources"><div class="resource compact"><i class="sprite icon-gold"></i><span>ALTIN</span><b id="gold">000</b></div><div class="resource compact pearl"><i class="sprite icon-pearl"></i><span>İNCİ</span><b id="pearls">000</b></div></div>
      <div class="panel quest"><span class="eyebrow">Aktif görev</span><h3 id="questTitle">Görev seçilmedi</h3><p id="questDescription">Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.</p><div class="progress" id="quest">Hazır olduğunda bir görev başlat</div><button class="quest-open" id="openQuests">GÖREVLERİ AÇ</button></div>
      <section class="combat-targets" id="combatTargets" aria-live="polite"></section>
      <div class="bottom-command"><div class="status-bars"><div class="status-pair"><div class="status-line xp-line"><span>TP</span><i><em id="xpHudBar"></em></i><b id="xpHudText">0 / 100</b></div><div class="status-line elite-line"><span>EP</span><i><em id="eliteBar"></em></i><b id="eliteText">0 / 100</b></div></div><button class="recenter" id="recenterShip" aria-label="Gemiyi haritada ortala">✥</button><div class="status-pair"><div class="status-line hp-line"><span>CP</span><i><em id="hpHudBar"></em></i><b id="hpHudText">100 / 100</b></div><div class="status-line battle-line"><span>SP</span><i><em id="battleBar"></em></i><b id="battleText">0 / 100</b></div></div></div><div class="quick-inventory" id="quickInventory"></div></div>
      <div class="combat-controls" id="combatControls"><button class="combat-action attack" id="attack" title="Saldır"><b><img src="/assets/icon-attack-v1.webp" alt="" draggable="false"/></b><span id="attackLabel">SALDIR</span><small id="reloadText">HAZIR</small></button><button class="combat-action repair" id="repair" title="Tamir et"><b><img src="/assets/icon-repair-v1.webp" alt="" draggable="false"/></b><span>TAMİR</span><small data-bind="repair"></small></button><button class="combat-action speed ability" id="ability-speed" title="Rüzgâr Hamlesi"><b><img src="/assets/icon-speed-v1.webp" alt="" draggable="false"/></b><span>HIZ</span><small data-bind="speed"></small></button><button class="combat-action shield ability" id="ability-shield" title="Demir Kalkan"><b><img src="/assets/icon-shield-v1.webp" alt="" draggable="false"/></b><span>KALKAN</span><small data-bind="shield"></small></button><button class="combat-action mine ability" id="ability-mine" title="Deniz Mayını"><b><img src="/assets/icon-mine-v1.webp" alt="" draggable="false"/></b><span>MAYIN</span><small data-bind="mine"></small></button><button class="combat-action elite ability" id="ability-elite" title="Elit gemi yeteneği"><b><span class="elite-ability-icon" id="eliteAbilityIcon"></span></b><span id="eliteAbilityName">ELİT</span><small id="eliteAbilityTime">HAZIR</small></button></div>
      <div class="map-cluster"><div class="map-badge" id="mapBadge"><strong id="mapName"></strong><small id="mapSubtitle"></small><b class="map-coord" id="mapCoord" title="Konum koordinatı">1/1 - 00AA</b></div><canvas id="minimap" width="170" height="125"></canvas><button class="world-map-button" id="openWorldMap" aria-label="Dünya haritalarını görüntüle">◎<span>DÜNYA</span></button><div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div></div>
      <div class="reward-toast" id="rewardToast"></div>
      <div class="toast" id="toast"></div>
      <div class="portal-prompt" id="portalPrompt"></div><div class="event-panel" id="eventPanel"></div><div class="quest-overlay world-overlay" id="worldMapOverlay"><section class="quest-log world-log"><header><div><span class="eyebrow">Kaptanın deniz haritası</span><h2>DÜNYA HARİTASI</h2></div><button id="closeWorldMap" aria-label="Dünya haritasını kapat">×</button></header><div class="world-chart" id="worldChart"></div><div class="world-info" id="worldInfo"></div></section></div><div class="quest-overlay" id="questOverlay"><section class="quest-log"><header><div><span class="eyebrow">Kaptanın görev defteri</span><h2>DENİZ GÖREVLERİ</h2></div><button id="closeQuests" aria-label="Görevleri kapat">×</button></header><p class="quest-intro">Aynı anda yalnızca bir görev yürütülebilir. İptal edilen veya tamamlanan görev 8 saat sonra yeniden açılır.</p><div class="quest-list" id="questList"></div></section></div>
      <div class="captain-overlay" id="captainOverlay"><section class="captain-profile"><header><div><span class="eyebrow">Oyuncu profili</span><h2>KAPTAN YASİN</h2></div><button id="closeCaptain" aria-label="Kaptan profilini kapat">×</button></header><div class="captain-tab" id="captainTab-profile"><div class="captain-identity"><div class="captain-portrait"><img src="/assets/icon-hat-v1.webp" alt="" draggable="false"/><b id="captainLevel">1</b></div><div><span>AMİRAL GEMİSİ</span><strong>Kara Yelken</strong><small>Gölgeler Denizi Kaptanı</small></div></div><div class="captain-stat-grid"><article><span>TECRÜBE PUANI</span><b id="xpText">0 / 100</b><i class="xp"><em id="xpBar"></em></i></article><article><span>CAN PUANI</span><b id="hpText">100 / 100</b><i class="hp"><em id="hpBar" style="width:100%"></em></i></article><article><span>ELİT PUAN</span><b id="profileElite">0 / 100</b><i class="elite"><em id="profileEliteBar"></em></i></article><article><span>SAVAŞ PUANI</span><b id="profileBattle">0 / 500</b><i class="battle"><em id="profileBattleBar"></em></i></article></div><div class="bonus-summary" id="bonusSummary"></div></div></section></div><div class="captain-overlay" id="crewOverlay"><section class="captain-profile crew-window"><header><div><span class="eyebrow">Geminin subayları</span><h2>TAYFA</h2></div><button id="closeCrew" aria-label="Tayfayı kapat">×</button></header><div id="crewPanel"></div></section></div><div class="quest-overlay" id="settingsOverlay"><section class="quest-log settings-log"><header><div><span class="eyebrow">Oyun tercihleri</span><h2>AYARLAR</h2></div><button id="closeSettings" aria-label="Ayarları kapat">×</button></header><div id="settingsPanel"></div></section></div>
      <div class="ship-overlay" id="eliteShipOverlay"><section class="ship-menu elite-ship-window"><header><div><span class="eyebrow">Elit filo tersanesi</span><h2>ELİT GEMİLER</h2><p>Elit puanınla açılan gemiyi incele ve amiral gemin olarak seç.</p></div><button id="closeEliteShips" aria-label="Elit gemileri kapat">×</button></header><div class="elite-ship-layout"><div class="elite-ship-grid" id="eliteShipGrid"></div><aside class="elite-ship-detail" id="eliteShipDetail"></aside></div></section></div><div class="ship-overlay" id="shipOverlay"><section class="ship-menu cannon-window"><header><img class="cannon-window-art" src="/assets/gunner-vignette-v1.webp" alt="" draggable="false"/><div><span class="eyebrow">Topçubaşının silah deposu</span><h2>TOP YERLEŞTİRME</h2><div class="inventory-capacity" id="shipSummary"></div></div><button id="closeShip" aria-label="Envanteri kapat">×</button></header><div class="cannon-rows" id="cannonRows"></div></section></div>
      <div class="development-overlay" id="developmentOverlay"><section class="development-menu"><header><div><span class="eyebrow">Kaptanın gelişim planı</span><h2>GELİŞTİRME</h2></div><button id="closeDevelopment" aria-label="Geliştirmeyi kapat">×</button></header><div id="talentPanel"><div class="dev-tree" id="upgradeList"></div><div class="upgrade-confirm" id="upgradeConfirm"></div></div></section></div>
      <div class="market-overlay" id="marketOverlay"><section class="market-menu"><header><div><span class="eyebrow">Tüccar loncası</span><h2>DENİZ MARKETİ</h2></div><button id="closeMarket" aria-label="Marketi kapat">×</button></header><div class="inventory-strip" id="inventoryStrip"></div><h3 class="market-heading">MÜHİMMAT</h3><div class="market-list" id="marketList"></div><h3 class="market-heading">İNCİ PAKETLERİ</h3><div class="pearl-shop"><div><b>◈ İnci Sandıkları</b><span>Gerçek ödeme sistemi kullanıcı hesaplarıyla birlikte açılacak.</span></div><button disabled>YAKINDA</button></div><div class="market-confirm" id="marketConfirm"></div></section></div>
      <div class="loadout-overlay" id="loadoutOverlay"><section class="loadout-menu"><header><div><span class="eyebrow">Hızlı kullanım düzeni</span><h2>MALZEMELER</h2></div><button id="closeLoadout">×</button></header><div class="loadout-tabs"><button data-tab="ammo" class="active">GÜLLELER</button><button data-tab="consumable">SARF MALZEMELERİ</button></div><p>Gülleler yalnızca üst sıraya, sarf malzemeleri yalnızca alt sıraya yerleşir. Sürükleyip bırak ya da önce eşyaya, sonra yuvaya dokun.</p><div class="loadout-items" id="loadoutItems"></div><div class="loadout-slots" id="loadoutSlots"></div></section></div>
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
const cannonAssetSources:Record<CannonKind,string>={cast:'',long:'',rapid:'',heavy:''};
(Object.keys(cannonAssetSources) as CannonKind[]).forEach(kind=>fetch(`/assets/cannon-${kind}-v1.b64`).then(r=>r.text()).then(data=>{cannonAssetSources[kind]=`data:image/webp;base64,${data}`;if(document.getElementById('shipOverlay')?.classList.contains('open'))renderShipMenu();}));
const rasterItemAssets:Partial<Record<QuickItemId,string>>={};
rasterItemAssets.fire=SPECIAL_AMMO.fire.icon;rasterItemAssets.grape=SPECIAL_AMMO.grape.icon;rasterItemAssets.mine=ABILITIES.mine.icon;rasterItemAssets.shield=ABILITIES.shield.icon;rasterItemAssets.speed=ABILITIES.speed.icon;rasterItemAssets.repairkit='/assets/icon-repair-v1.webp';
(['iron','chain'] as QuickItemId[]).forEach(id=>fetch(`/assets/ammo-${id}-v1.b64`).then(r=>r.text()).then(data=>{rasterItemAssets[id]=`data:image/webp;base64,${data}`;renderQuickSlots();}));
let eliteAtlasUrl='';const eliteAtlasImage=new Image();eliteAtlasImage.decoding='async';fetch('/assets/elite-ships-atlas-v1.b64').then(r=>r.text()).then(data=>{eliteAtlasUrl=`data:image/webp;base64,${data.trim()}`;eliteAtlasImage.src=eliteAtlasUrl;ui('eliteShipOverlay')?.style.setProperty('--elite-atlas',`url("${eliteAtlasUrl}")`);}).catch(()=>{});
const ui = (id:string) => document.getElementById(id)!;
const keys = new Set<string>();
const QUEST_STORAGE='kara-yelken-quests-v2';
const ACCOUNT_STORAGE='kara-yelken-account-v1';
let storedQuests:{active:string|null;progress:Record<string,number>;cooldowns:Record<string,number>}|null=null;
let storedAccount:{pearls?:number;gold:number;wood:number;fame:number;level:number;maxHp:number;hp:number;chainAmmo:number;elitePoints?:number;battlePoints?:number;cannonType?:CannonKind;cannonInventory?:CannonStock;mountedCannons?:CannonStock;quickSlots?:Array<QuickItemId|null>;upgrades:Record<UpgradeKind,number>;eliteShip?:EliteShipId;currentMap?:MapKey}|null=null;
try{storedQuests=JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null');}catch{storedQuests=null;}
try{storedAccount=JSON.parse(localStorage.getItem(ACCOUNT_STORAGE)||'null');}catch{storedAccount=null;}
const storedActive=storedQuests?.active&&QUESTS.some(q=>q.id===storedQuests!.active)?storedQuests.active:null;
const upgrades:Record<UpgradeKind,number>={hull:storedAccount?.upgrades?.hull||0,damage:storedAccount?.upgrades?.damage||0,range:storedAccount?.upgrades?.range||0,reload:storedAccount?.upgrades?.reload||0,speed:storedAccount?.upgrades?.speed||0,repair:storedAccount?.upgrades?.repair||0};
const defaultCannonStock:CannonStock={cast:12,long:6,rapid:4,heavy:2};
const defaultMountedCannons:CannonStock={cast:18,long:0,rapid:0,heavy:0};
const cannonInventory:CannonStock={...defaultCannonStock,...storedAccount?.cannonInventory};
const mountedCannons:CannonStock={...defaultMountedCannons,...storedAccount?.mountedCannons};
const state = { pearls:storedAccount?.pearls??30, gold:storedAccount?.gold??40, wood:storedAccount?.wood??10, fame:storedAccount?.fame??0, level:Math.min(MAX_LEVEL,storedAccount?.level??1), hp:storedAccount?.hp??100, maxHp:storedAccount?.maxHp??100, elitePoints:storedAccount?.elitePoints??0,battlePoints:storedAccount?.battlePoints??0,cannon:18, cannonType:storedAccount?.cannonType&&CANNONS[storedAccount.cannonType]?storedAccount.cannonType:'cast' as CannonKind, activeQuest:storedActive as string|null, ammo:'iron' as AmmoKind, chainAmmo:storedAccount?.chainAmmo??40, attacking:false, repairing:false, invulnerable:0 };
state.cannon=(Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);
let activeEliteShip:EliteShipId=storedAccount?.eliteShip&&ELITE_SHIPS.some(s=>s.id===storedAccount!.eliteShip)?storedAccount.eliteShip:'phantom';
let previewEliteShip:EliteShipId=activeEliteShip;
const quickSlots:Array<QuickItemId|null>=Array(12).fill(null);
{const stored=(storedAccount?.quickSlots??['iron','chain','fire','grape','repairkit','speed','shield','mine']).filter((id):id is QuickItemId=>!!id&&id in QUICK_ITEMS);
  const place=(id:QuickItemId)=>{if(quickSlots.includes(id))return;const row=QUICK_ITEMS[id].category==='ammo'?0:AMMO_ROW;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=id;return;}};
  stored.forEach(place);(['iron','chain','fire','grape','repairkit','speed','shield','mine'] as QuickItemId[]).forEach(id=>{if(!storedAccount?.quickSlots)place(id);});}
const arsenal=loadArsenal();
const crew=loadCrew();
let bonus=computeBonus(crew);
if(!arsenal.seeded){for(const item of ['fire','grape','shield','mine'] as QuickItemId[]){const row=QUICK_ITEMS[item].category==='ammo'?0:AMMO_ROW;if(quickSlots.includes(item))continue;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=item;break;}}arsenal.seeded=true;saveArsenal(arsenal);}
const questProgress:Record<string,number>={...storedQuests?.progress};
const questCooldownUntil:Record<string,number>={...storedQuests?.cooldowns};
if(state.activeQuest!==null&&(questCooldownUntil[state.activeQuest]??0)>Date.now())state.activeQuest=null;
const player = { x:WORLD/2, y:WORLD/2, angle:-Math.PI/2, speed:0, cooldown:0 };
let destination:Vec|null=null;
let routeTarget:Vec|null=null;
let selected:Target|null=null;
const camera = { x:player.x, y:player.y, zoom:.7, targetZoom:.7 };
const shots:Shot[]=[]; const enemies:Enemy[]=[];
const salvoQueue:SalvoRound[]=[];
const particles:Particle[]=[];
const WORLD_STORAGE='kara-yelken-world-v2';
let currentMap:MapKey=(()=>{try{const k=(storedAccount?.currentMap||localStorage.getItem(WORLD_STORAGE)) as MapKey|null;if(k&&k in MAPS&&tierOf(k)<=state.level)return k;}catch{}return'1/1';})();
const mapDef=()=>MAPS[currentMap];
const theme=()=>THEMES[mapDef().tier];
const monsters:Monster[]=[];
function createMonsters(){monsters.length=0;const def=MONSTERS[mapDef().monster];for(let k=0;k<(mapDef().safe?1:2);k++){const p=randomSeaPoint(700);monsters.push({kind:'monster',def,x:p.x,y:p.y,phase:Math.random()*6,radius:def.radius,name:def.name,hp:def.hp,maxHp:def.hp,cooldown:0,aggro:false,slowTimer:0,homeX:p.x,homeY:p.y,combatTimer:0});}}
const lootChests:LootChest[]=[];
const abilityTimers:Record<AbilityId,{active:number;cooldown:number}>={speed:{active:0,cooldown:0},shield:{active:0,cooldown:0},mine:{active:0,cooldown:0}};
const mines:{x:number;y:number;life:number;arm:number}[]=[];
const abilityActive=(id:AbilityId)=>abilityTimers[id].active>0;
const eliteAbility={active:0,cooldown:0};
let soulStacks=0,soulTimer=0,shadowReady=true,valhallaTimer=0;
const eliteShip=()=>eliteById(activeEliteShip);
const eliteMaxHpFactor=()=>activeEliteShip==='glacial'?1.2:activeEliteShip==='void'?1.15:1;
const effectiveMaxHp=()=>Math.round(state.maxHp*eliteMaxHpFactor());
const eliteIncomingFactor=()=>activeEliteShip==='ironclad'?.75:activeEliteShip==='void'?.87:1;
function eliteSpeedFactor(){
  if(activeEliteShip==='tempest')return 1.22;
  if(activeEliteShip==='void')return 1.1;
  if(activeEliteShip==='jade')return 1.08;
  if(activeEliteShip==='crimson'&&selected&&selected.hp/selected.maxHp<.3)return 2;
  return 1;
}
function eliteDamageFactor(target:Target){
  let n=1;
  if(activeEliteShip==='magma')n*=1.1;
  if(activeEliteShip==='void')n*=1.15;
  if(activeEliteShip==='ironclad'&&target.kind==='ship'&&target.tower)n*=1.4;
  if(activeEliteShip==='ragnarok')n*=1+Math.floor((1-state.hp/effectiveMaxHp())*10)*.04;
  if(activeEliteShip==='bone')n*=1+soulStacks*.05;
  if(activeEliteShip==='sovereign'&&eliteAbility.active>0)n*=1.15;
  return n;
}
function eliteReloadFactor(){return activeEliteShip==='jade'?.85:activeEliteShip==='ironclad'?1.1:1;}
function eliteCritFactor(){
  let chance=activeEliteShip==='kraken'?.1:activeEliteShip==='void'?.1:activeEliteShip==='bone'?.15:0;
  if(activeEliteShip==='shadow'&&shadowReady){shadowReady=false;return 2;}
  if(Math.random()<chance)return activeEliteShip==='bone'?2.25:2;
  return 1;
}
let driftClock=0;
let wakeClock=0;
let collisionNotice=0;
const islands:WorldIsland[]=[];
let jumpPrompt:{dir:Dir;to:MapKey}|null=null;
const fleetOwners=loadFleetOwners();
const fleetOwner=(key:MapKey=currentMap)=>fleetOwners[key]??'npc';
const ownTowers:{x:number;y:number;cooldown:number}[]=[];
let bossNextAt=performance.now()+BOSS.firstDelaySeconds*1000;
let eventPanelClock=0,towersDestroyedHere=0;
let mapFade=0;
const weatherParticles:{x:number;y:number;vx:number;vy:number;r:number;a:number;life:number}[]=[];
let lightning=0;

function resize(){ const d=Math.min(devicePixelRatio,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize',resize); resize();
const settings=loadSettings();setAudio(settings.sound,settings.volume);
let rebinding:ActionId|null=null;
const held=(action:ActionId,...extra:string[])=>keys.has(settings.binds[action])||extra.some(k=>keys.has(k));
function closeAllOverlays(){closeWorldMap();closeQuestLog();closeShipMenu();closeMarket();closeCaptainProfile();closeDevelopment();closeCrew();closeSettings();closeLoadout();}
function runAction(action:ActionId){
  if(action==='attack')toggleAttack();else if(action==='repair')toggleRepair();else if(action==='recenter')recenterShip();
  else if(action==='jump')useJump();else if(action==='speed'||action==='shield')activateAbility(action);else if(action==='mine')dropMine();
  else if(action==='map'){ui('worldMapOverlay').classList.contains('open')?closeWorldMap():openWorldMap();}
  else if(action==='zoomIn')setZoom(camera.targetZoom+.1);else if(action==='zoomOut')setZoom(camera.targetZoom-.1);
  else if(action.startsWith('ammo'))useQuickSlot(Number(action.slice(4))-1);else if(action.startsWith('item'))useQuickSlot(AMMO_ROW+Number(action.slice(4))-1);
}
addEventListener('keydown',e=>{
  unlockAudio();const key=normalizeKey(e);
  if(rebinding){e.preventDefault();if(key!=='escape'){for(const a of ACTIONS)if(settings.binds[a.id]===key)settings.binds[a.id]='';settings.binds[rebinding]=key;saveSettings(settings);renderQuickSlots();refreshBindHints();}rebinding=null;renderSettings();return;}
  if(e.target instanceof HTMLInputElement)return;
  keys.add(key);
  if(key==='escape'){closeAllOverlays();return;}
  if(e.repeat)return;
  const action=(Object.keys(settings.binds) as ActionId[]).find(a=>settings.binds[a]===key)??(key==='='?'zoomIn':undefined);
  if(action&&!['forward','back','left','right'].includes(action)){e.preventDefault();runAction(action);}
});
addEventListener('keyup',e=>{keys.delete(normalizeKey(e));keys.delete(e.key.toLowerCase());});
addEventListener('pointerdown',e=>{unlockAudio();if((e.target as HTMLElement).closest?.('button'))playClick();},{capture:true});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('beforeunload',saveAccount);
canvas.addEventListener('pointerdown',e=>{
  const world={x:(e.clientX-innerWidth/2)/camera.zoom+camera.x,y:(e.clientY-innerHeight/2)/camera.zoom+camera.y};
  const hit=[...enemies,...monsters].filter(n=>dist(n,world)<Math.max(42,n.kind==='monster'?n.radius:(n.hitRadius??0))).sort((a,b)=>dist(a,world)-dist(b,world))[0];
  if(hit){selected=hit;state.attacking=false;ui('attack').classList.remove('active');toast(`${hit.name} hedef seçildi`);}
  else{const chest=lootChests.find(c=>dist(c,world)<CHEST_CLICK_RADIUS);routeTarget=chest?{x:chest.x,y:chest.y}:navigablePoint(world);destination=routeVia(routeTarget);state.attacking=false;ui('attack').classList.remove('active');if(chest)toast('Rota ganimet sandığına çizildi');}
});
ui('attack').onclick=toggleAttack;
ui('repair').onclick=toggleRepair;
ui('ability-speed').onclick=()=>activateAbility('speed');ui('ability-shield').onclick=()=>activateAbility('shield');ui('ability-mine').onclick=dropMine;ui('ability-elite').onclick=activateEliteAbility;
function recenterShip(){camera.x=player.x;camera.y=player.y;destination=null;toast('Kamera gemiye ortalandı');}
ui('recenterShip').onclick=recenterShip;
ui('openWorldMap').onclick=openWorldMap;ui('closeWorldMap').onclick=closeWorldMap;
ui('worldMapOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('worldMapOverlay'))closeWorldMap();});
ui('openCaptain').onclick=openCaptainProfile;
ui('closeCaptain').onclick=closeCaptainProfile;
ui('openCrew').onclick=openCrew;ui('closeCrew').onclick=closeCrew;ui('crewOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('crewOverlay'))closeCrew();});
ui('openSettings').onclick=openSettings;ui('closeSettings').onclick=closeSettings;ui('settingsOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('settingsOverlay'))closeSettings();});
ui('captainOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('captainOverlay'))closeCaptainProfile();});
ui('zoomOut').onclick=()=>setZoom(camera.targetZoom-.1);
ui('zoomIn').onclick=()=>setZoom(camera.targetZoom+.1);
ui('openQuests').onclick=openQuestLog;
ui('openQuestTop').onclick=openQuestLog;
ui('closeQuests').onclick=closeQuestLog;
ui('questOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('questOverlay'))closeQuestLog();});
ui('openEliteShips').onclick=openEliteShips;ui('closeEliteShips').onclick=closeEliteShips;ui('openShip').onclick=openShipMenu;
ui('closeShip').onclick=closeShipMenu;
ui('shipOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('shipOverlay'))closeShipMenu();});
ui('openDevelopment').onclick=openDevelopment;
ui('closeDevelopment').onclick=closeDevelopment;
ui('developmentOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('developmentOverlay'))closeDevelopment();});
ui('openMarket').onclick=openMarket;
ui('closeMarket').onclick=closeMarket;
ui('marketOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('marketOverlay'))closeMarket();});
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.targetZoom+(e.deltaY<0?.1:-.1));},{passive:false});
ui('closeLoadout').onclick=closeLoadout;
ui('loadoutOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('loadoutOverlay'))closeLoadout();});
document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>button.onclick=()=>{loadoutTab=button.dataset.tab as typeof loadoutTab;renderLoadout();});

function spawnEnemy(){
  const map=mapDef();if(regularEnemyCount()>=map.npcCount)return;
  const heavy=Math.random()<map.heavyShare,def=NPCS[map.npcs[heavy?1:0]],p=randomSeaPoint(520);
  enemies.push(makeShip(def,p.x,p.y,Math.random()*Math.PI*2));
}
function makeShip(def:NpcDef,x:number,y:number,angle:number):Enemy{
  return{kind:'ship',def,role:def.role,x,y,angle,hp:def.hp,maxHp:def.hp,cooldown:Math.random()*2,speed:def.speed+Math.random()*4,damage:def.damage,reload:def.reload,rewardGold:def.gold,rewardWood:def.wood,rewardFame:def.xp,color:'#79372f',name:def.name,tier:def.tier,aggro:false,wander:Math.random()*6,slowTimer:0,homeX:x,homeY:y,combatTimer:0};
}
const regularEnemyCount=()=>enemies.filter(e=>!e.tower&&!e.boss).length;
// Adalardan, filo adasından ve oyuncudan uzak rastgele deniz noktası
function randomSeaPoint(minPlayerDist:number){
  for(let tries=0;tries<60;tries++){const p={x:160+Math.random()*(WORLD-320),y:160+Math.random()*(WORLD-320)};const f=mapDef().fleet;
    if(dist(p,f)<FLEET.islandR+100)continue;if(islands.some(i=>dist(p,i)<i.r+60))continue;if(dist(p,player)<minPlayerDist)continue;return p;}
  return{x:160+Math.random()*(WORLD-320),y:160+Math.random()*(WORLD-320)};
}
function setupFleetIsland(){
  const map=mapDef(),f=map.fleet,t=fleetTower(map.tier);ownTowers.length=0;towersDestroyedHere=0;
  if(fleetOwner()==='player'){for(const [dx,dy] of FLEET.towers)ownTowers.push({x:f.x+dx,y:f.y+dy,cooldown:Math.random()*2});return;}
  FLEET.towers.forEach(([dx,dy],i)=>{const tower:Enemy={kind:'ship',role:'heavy',tower:true,towerIndex:i,x:f.x+dx,y:f.y+dy,angle:0,hp:t.hp,maxHp:t.hp,cooldown:Math.random()*2,speed:0,damage:t.damage,reload:t.reload,rewardGold:0,rewardWood:0,rewardFame:0,color:'#555',name:`${f.name} Kulesi`,tier:map.tier,aggro:false,wander:0,slowTimer:0,homeX:f.x+dx,homeY:f.y+dy,combatTimer:0,hitRadius:34,fireRange:t.range};enemies.push(tower);});
}
function populateMap(){
  const map=mapDef();islands.splice(0,islands.length,...map.islands.map(i=>({...i})));
  enemies.length=0;shots.length=0;salvoQueue.length=0;particles.length=0;lootChests.length=0;mines.length=0;driftClock=DRIFT_RESPAWN_SECONDS;weatherParticles.length=0;
  preload([fleetBaseUrl(theme().fleet),fleetTowerUrl(theme().fleet),...map.npcs.map(id=>NPCS[id].sprite),MONSTERS[map.monster].sprite,...new Set(map.islands.map(i=>islandSheetUrl(i.look)))]);
  createMonsters();setupFleetIsland();
  for(let i=0;i<map.npcCount;i++)spawnEnemy();
  if(bossNextAt<performance.now()+BOSS.firstDelaySeconds*1000)bossNextAt=performance.now()+BOSS.firstDelaySeconds*1000;
  for(let i=0;i<3;i++){const p=randomSeaPoint(0);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(map.tier-1)));}
  ui('mapName').textContent=`${map.key} · ${map.name}`;ui('mapSubtitle').textContent=map.safe?'SAVAŞA KAPALI':`${theme().name.toLocaleUpperCase('tr')} · SEVİYE ${map.tier}`;ui('mapBadge').className=`map-badge ${map.safe?'safe':'danger-'+Math.min(3,Math.ceil(map.tier/3))}`;
  document.querySelector('.brand small')!.textContent=map.name.toLocaleUpperCase('tr');
}
function enterMap(key:MapKey,at:Vec){
  currentMap=key;try{localStorage.setItem(WORLD_STORAGE,key);}catch{}populateMap();
  player.x=at.x;player.y=at.y;player.speed=0;destination=null;selected=null;state.attacking=false;ui('attack').classList.remove('active');
  camera.x=player.x;camera.y=player.y;jumpPrompt=null;mapFade=1;updateJumpPrompt();playMapJump();
  rewardNotice(`${mapDef().key}  ${mapDef().name.toLocaleUpperCase('tr')}   ${mapDef().safe?'SAVAŞA KAPALI':'SEVİYE '+mapDef().tier}`);
}
function inCombat(){return enemies.some(e=>e.aggro&&!e.tower&&dist(e,player)<520)||monsters.some(m=>m.aggro&&dist(m,player)<520);}
// Harita kenarına yanaşınca komşu denize atlama
const EDGE=110;
function edgeDir():Dir|null{if(player.y<EDGE)return'north';if(player.y>WORLD-EDGE)return'south';if(player.x<EDGE)return'west';if(player.x>WORLD-EDGE)return'east';return null;}
function useJump(){
  if(!jumpPrompt){toast('Harita atlamak için denizin kenarına yanaş');return;}const target=MAPS[jumpPrompt.to];
  if(state.level<target.tier){toast(`${target.key} ${target.name} için Seviye ${target.tier} gerekli`);return;}
  if(inCombat()){toast('Savaş sırasında harita atlanamaz');return;}
  const dir=jumpPrompt.dir,inset=EDGE+110,at={x:dir==='west'?WORLD-inset:dir==='east'?inset:player.x,y:dir==='north'?WORLD-inset:dir==='south'?inset:player.y};
  enterMap(target.key,at);
}
function updateJumpPrompt(){
  const dir=edgeDir(),to=dir?neighbor(currentMap,dir):null,next=dir&&to?{dir,to}:null,el=ui('portalPrompt');
  if(!next){jumpPrompt=null;el.classList.remove('visible');el.innerHTML='';return;}
  if(next.to===jumpPrompt?.to&&next.dir===jumpPrompt?.dir)return;jumpPrompt=next;
  const target=MAPS[next.to],locked=state.level<target.tier,arrow={north:'↑',south:'↓',east:'→',west:'←'}[next.dir];
  el.innerHTML=`<span>HARİTA ATLA ${arrow}</span><strong>${target.key} · ${target.name}</strong><small>${locked?`Seviye ${target.tier} gerekli`:target.safe?'Savaşa kapalı deniz':`${THEMES[target.tier].name} · Seviye ${target.tier}`}</small><button ${locked?'disabled':''}>HARİTA ATLA <kbd>${keyLabel(settings.binds.jump)}</kbd></button>`;
  el.classList.add('visible');el.querySelector('button')!.onclick=()=>useJump();
}
populateMap();
if(!storedAccount||currentMap==='1/1'){player.x=mapDef().spawn.x;player.y=mapDef().spawn.y;camera.x=player.x;camera.y=player.y;}
function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n));}
function dist(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y);}
// Filo adası: ada diski kara; kendi adanda yalnızca lagün ve güneydeki kanal suyu seyredilebilir.
const FLEET_MARGIN=20;
function fleetCollision(p:Vec):{x:number;y:number;name:string}|null{
  const f=mapDef().fleet,dx=p.x-f.x,dy=p.y-f.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),outR=FLEET.islandR+14;
  if(d>=outR)return null;
  const out={x:f.x+Math.cos(a)*outR,y:f.y+Math.sin(a)*outR,name:f.name};if(fleetOwner()!=='player')return out;
  const L=FLEET.lagoon,lx=dx-L.x,ly=dy-L.y,ld=Math.hypot(lx,ly),lr=L.r-FLEET_MARGIN,cw=FLEET.channelW-FLEET_MARGIN;
  if(ld<lr||(Math.abs(dx)<cw&&dy>L.y))return null;
  const options=[out,{x:f.x+L.x+(ld>.01?lx/ld:0)*lr,y:f.y+L.y+(ld>.01?ly/ld:1)*lr,name:f.name},{x:f.x+clamp(dx,-cw+1,cw-1),y:f.y+Math.max(dy,L.y+1),name:f.name}];
  return options.reduce((best,o)=>dist(o,p)<dist(best,p)?o:best);
}
function insideIsland(p:Vec){return dist(p,mapDef().fleet)<FLEET.islandR;}
// Kendi adanın lagününe kanal ağzından gir/çık; adayı dolaşırken çember üzerinde ara noktalar kullan.
function routeVia(target:Vec):Vec{
  const f=mapDef().fleet;if(fleetOwner()!=='player')return target;
  const pin=insideIsland(player),tin=insideIsland(target);if(pin===tin)return target;
  const L=FLEET.lagoon,mouth={x:f.x,y:f.y+FLEET.islandR+80},lagoon={x:f.x+L.x,y:f.y+L.y},inCol=Math.abs(player.x-f.x)<FLEET.channelW-15&&player.y>f.y+L.y-10;
  if(pin)return inCol?mouth:lagoon;
  if(inCol)return lagoon;
  const a=Math.atan2(player.y-f.y,player.x-f.x),rest=angleDelta(Math.PI/2,a);if(Math.abs(rest)<.3)return mouth;
  const na=a+Math.sign(rest)*Math.min(.6,Math.abs(rest)),R=FLEET.islandR+150;return{x:f.x+Math.cos(na)*R,y:f.y+Math.sin(na)*R};
}
function insideOwnLagoon(p:Vec){
  if(fleetOwner()!=='player')return false;const f=mapDef().fleet,L=FLEET.lagoon,dx=p.x-f.x,dy=p.y-f.y;
  return Math.hypot(dx-L.x,dy-L.y)<L.r||(Math.abs(dx)<FLEET.channelW&&dy>L.y&&Math.hypot(dx,dy)<FLEET.islandR);
}
function navigablePoint(point:Vec){
  const fc=fleetCollision(point);if(fc)return{x:fc.x,y:fc.y};
  for(const island of islands){const shore=island.r*.72+38,d=dist(point,island);if(d<shore){const a=Math.atan2(point.y-island.y,point.x-island.x);return{x:island.x+Math.cos(a)*shore,y:island.y+Math.sin(a)*shore};}}
  return{x:clamp(point.x,25,WORLD-25),y:clamp(point.y,25,WORLD-25)};
}
function resolveIslandCollision(){
  const fc=fleetCollision(player);if(fc){player.x=fc.x;player.y=fc.y;player.speed*=.28;destination=null;routeTarget=null;if(collisionNotice<=0){toast(fleetOwner()==='player'?`${fc.name} karasına çıkılamaz — lagün girişi güneydeki kanalda`:`${fc.name} rakip filonun adası — içeri girilemez`);collisionNotice=2;}}
  for(const island of islands){const shore=island.r*.72+28,d=dist(player,island);if(d<shore){const a=d>.01?Math.atan2(player.y-island.y,player.x-island.x):player.angle-Math.PI/2;player.x=island.x+Math.cos(a)*shore;player.y=island.y+Math.sin(a)*shore;player.speed*=.28;destination=null;if(collisionNotice<=0){toast(`${island.name} kıyısına daha fazla yaklaşamazsın`);collisionNotice=2;}}}
}
function setZoom(value:number){camera.targetZoom=clamp(value,.5,1.15);ui('zoomValue').textContent=`${Math.round(camera.targetZoom*100)}%`;}
function targetExists(t:Target){return t.kind==='ship'?enemies.includes(t):monsters.includes(t);}
function angleDelta(target:number,current:number){return Math.atan2(Math.sin(target-current),Math.cos(target-current));}
function broadsideCourse(target:Target){
  const bearing=Math.atan2(target.y-player.y,target.x-player.x),right=bearing,left=bearing+Math.PI;
  return Math.abs(angleDelta(right,player.angle))<=Math.abs(angleDelta(left,player.angle))?right:left;
}

function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;if(state.attacking){state.repairing=false;fireAtTarget();}ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
function toggleRepair(){
  if(state.hp>=effectiveMaxHp()){toast('Gövde zaten tamamen sağlam');return;}
  const danger=enemies.some(e=>e.aggro&&dist(e,player)<520)||monsters.some(m=>m.aggro&&dist(m,player)<520);
  if(danger||state.attacking){toast('Savaş durumundayken tamir yapılamaz');return;}
  state.repairing=!state.repairing;toast(state.repairing?'Açık deniz tamiri başladı':'Tamir durduruldu');
}
function fireAtTarget(){
  const cannon=CANNONS[state.cannonType];
  if(!selected||player.cooldown>0||dist(player,selected)>effectiveRange()||(activeEliteShip==='phantom'&&eliteAbility.active>0))return;
  if(state.ammo==='chain'&&state.chainAmmo<=0){state.ammo='iron';toast('Zincir güllesi tükendi');}
  if((state.ammo==='fire'||state.ammo==='grape')&&arsenal[state.ammo]<=0){toast(`${SPECIAL_AMMO[state.ammo].name} tükendi`);state.ammo='iron';renderQuickSlots();}
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),tx=selected.x-player.x,ty=selected.y-player.y;
  const side=fx*ty-fy*tx>0?-1:1,damage=state.cannon*5*(1+upgrades.damage*.11)*cannon.damage*bonus.damage*eliteDamageFactor(selected)*eliteCritFactor()*(state.ammo==='chain'?1.45:1)*(state.ammo==='fire'||state.ammo==='grape'?SPECIAL_AMMO[state.ammo].damage:1);
  salvoQueue.push({delay:0,target:selected,side,slot:0,damage,ammo:state.ammo});
  if(state.ammo==='chain'){state.chainAmmo-=1;saveAccount();}
  else if(state.ammo==='fire'||state.ammo==='grape'){arsenal[state.ammo]-=1;saveArsenal(arsenal);renderQuickSlots();}
  player.cooldown=eliteAbility.active>0&&activeEliteShip==='ironclad'?0:cannon.reload*Math.max(.6,1-upgrades.reload*.04)*bonus.reload*eliteReloadFactor()*(state.ammo==='chain'?1.18:1)*(state.ammo==='fire'||state.ammo==='grape'?SPECIAL_AMMO[state.ammo].reload:1);
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
  playCannon(state.cannonType,round.ammo);
  particles.push({x,y,vx:rx*round.side*12,vy:ry*round.side*12,life:.38,maxLife:.38,kind:'smoke'});
}
function enemyFire(e:Enemy){
  if(e.boss){bossFire(e);return;}
  const a=Math.atan2(player.y-e.y,player.x-e.x);playEnemyCannon(dist(e,player),(e.x-player.x)/600);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy',damage:e.damage,hit:false,ammo:'iron'}); e.cooldown=e.reload+Math.random()*.55;
}
function monsterFire(m:Monster){const a=Math.atan2(player.y-m.y,player.x-m.x);playSplash();for(const off of m.def.tier>=5?[-.12,0,.12]:[0])shots.push({x:m.x,y:m.y,vx:Math.cos(a+off)*210,vy:Math.sin(a+off)*210,life:2.4,owner:'enemy',damage:m.def.damage,hit:false,ammo:'iron'});m.cooldown=m.def.reload;}
// Batınca bulunduğun denizde, düşmanlardan uzak rastgele bir noktada %10 gövdeyle yeniden doğ.
function respawn(){
  const deathMap=currentMap;
  currentMap=deathMap;
  try{localStorage.setItem(WORLD_STORAGE,deathMap);}catch{}
  let spot=randomSeaPoint(0);
  for(let tries=0;tries<40;tries++){const p=randomSeaPoint(0);if(!enemies.some(e=>!e.tower&&dist(e,p)<650)&&!monsters.some(m=>dist(m,p)<650)){spot=p;break;}}
  player.x=spot.x;player.y=spot.y;player.speed=0;destination=null;routeTarget=null;camera.x=player.x;camera.y=player.y;
  state.hp=Math.max(1,Math.round(effectiveMaxHp()*.1));state.repairing=true;state.invulnerable=4;state.attacking=false;selected=null;shots.length=0;salvoQueue.length=0;
  enemies.forEach(e=>{e.aggro=false;e.combatTimer=0;});monsters.forEach(m=>{m.aggro=false;m.combatTimer=0;});ui('attack').classList.remove('active');
  mapFade=1;playSplash();saveAccount();toast(`Gemin battı — ${mapDef().key} ${coordLabel(player)} konumunda %10 gövdeyle yeniden doğdun`);
}
function burst(x:number,y:number,large=false){for(let n=0;n<(large?18:7);n++){const a=Math.random()*Math.PI*2,s=15+Math.random()*(large?75:35);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.7,maxLife:1,kind:n%3?'smoke':'spark'});}}
function damageText(x:number,y:number,value:number){particles.push({x,y,vx:0,vy:-24,life:1,maxLife:1,kind:'damage',text:`-${Math.round(value)}`});}
let toastTimer=0;
function toast(msg:string){ui('toast').textContent=msg;ui('toast').classList.add('show');toastTimer=2.2;}
let rewardTimer=0;
const rewardQueue:string[]=[];
function showReward(msg:string){ui('rewardToast').textContent=msg;ui('rewardToast').classList.remove('show');void ui('rewardToast').offsetWidth;ui('rewardToast').classList.add('show');rewardTimer=2.6;}
function rewardNotice(msg:string){if(rewardTimer>0){rewardQueue.push(msg);return;}showReward(msg);}
function saveQuestState(){localStorage.setItem(QUEST_STORAGE,JSON.stringify({active:state.activeQuest,progress:questProgress,cooldowns:questCooldownUntil}));}
function saveAccount(){localStorage.setItem(ACCOUNT_STORAGE,JSON.stringify({pearls:state.pearls,gold:state.gold,wood:state.wood,fame:state.fame,level:state.level,maxHp:state.maxHp,hp:state.hp,chainAmmo:state.chainAmmo,elitePoints:state.elitePoints,battlePoints:state.battlePoints,cannonType:state.cannonType,cannonInventory,mountedCannons,quickSlots,upgrades,eliteShip:activeEliteShip,currentMap}));try{localStorage.setItem(WORLD_STORAGE,currentMap);}catch{}}
function effectiveRange(){return(CANNONS[state.cannonType].range+upgrades.range*18+bonus.range)*(state.ammo==='grape'?SPECIAL_AMMO.grape.rangeFactor:1);}
function effectiveSpeed(){return(104+upgrades.speed*5)*bonus.speed*eliteSpeedFactor()*(abilityActive('speed')?SPEED_BOOST:1);}
function cannonCapacity(){return 30+upgrades.hull*2;}
function mountedCannonCount(){return (Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);}
function cannonAsset(kind:CannonKind){
  return cannonAssetSources[kind]?`<img src="${cannonAssetSources[kind]}" alt="${CANNONS[kind].name} Top" draggable="false"/>`:'<span class="asset-loading"></span>';
}
function cooldownText(until:number){const minutes=Math.max(1,Math.ceil((until-Date.now())/60000)),hours=Math.floor(minutes/60),mins=minutes%60;return hours>0?`${hours} sa ${mins} dk`:`${mins} dk`;}
let pendingUpgrade:UpgradeKind|null=null;
function upgradeCost(kind:UpgradeKind){return Math.round(UPGRADES[kind].pearls*(1+upgrades[kind]*.55));}
function upgradeIcon(kind:UpgradeKind){return `<i class="sprite icon-${kind}"></i>`;}
function openShipMenu(){pendingUpgrade=null;renderShipMenu();ui('shipOverlay').classList.add('open');}
function closeShipMenu(){pendingUpgrade=null;ui('shipOverlay').classList.remove('open');}
const CANNON_UNLOCK:Record<CannonKind,number>={cast:1,long:2,rapid:3,heavy:4};
function renderShipMenu(){
  state.cannon=mountedCannonCount();const activeCannon=CANNONS[state.cannonType];
  ui('shipSummary').innerHTML=`<span>GEMİDEKİ TOP <b>${state.cannon} / ${cannonCapacity()}</b></span><span>SALVO HASARI <b>${Math.round(state.cannon*5*(1+upgrades.damage*.11)*activeCannon.damage*bonus.damage)}</b></span>`;
  ui('cannonRows').innerHTML=(Object.keys(CANNONS) as CannonKind[]).map(kind=>{const c=CANNONS[kind],locked=state.level<CANNON_UNLOCK[kind],active=state.cannonType===kind;
    return`<article class="cannon-row ${active?'active':''} ${locked?'locked':''}"><div class="cannon-row-art">${cannonAsset(kind)}</div><div class="cannon-row-info"><h3>${c.name} Top</h3><small>Hasar ×${c.damage.toFixed(2)} · Menzil ${c.range} · Dolum ${c.reload.toFixed(2)} sn</small>${locked?`<em>Seviye ${CANNON_UNLOCK[kind]} gerekli</em>`:''}</div>
      <div class="cannon-row-move"><span>DEPO<b>${cannonInventory[kind]}</b></span><button data-move="${kind}" data-dir="depot-all" title="Hepsini depoya" ${mountedCannons[kind]<=0?'disabled':''}>«</button><button data-move="${kind}" data-dir="depot" title="1 depoya" ${mountedCannons[kind]<=0?'disabled':''}>−</button><button data-move="${kind}" data-dir="ship" title="1 gemiye" ${locked||cannonInventory[kind]<=0?'disabled':''}>+</button><button data-move="${kind}" data-dir="ship-all" title="Sığanı gemiye" ${locked||cannonInventory[kind]<=0?'disabled':''}>»</button><span>GEMİ<b>${mountedCannons[kind]}</b></span></div>
      <button class="cannon-row-equip" data-cannon="${kind}" ${locked||mountedCannons[kind]<=0||active?'disabled':''}>${active?'AKTİF':'AKTİF YAP'}</button></article>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(b=>b.onclick=()=>{const kind=b.dataset.move as CannonKind,dir=b.dataset.dir!;moveCannon(kind,dir.startsWith('ship'),dir.endsWith('all')?999:1);});
  document.querySelectorAll<HTMLButtonElement>('[data-cannon]').forEach(button=>button.onclick=()=>equipCannon(button.dataset.cannon as CannonKind));
}
function moveCannon(kind:CannonKind,toShip:boolean,amount=1){
  const unlockLevel:Record<CannonKind,number>={cast:1,long:2,rapid:3,heavy:4};
  if(toShip){if(state.level<unlockLevel[kind])return;amount=Math.min(amount,cannonInventory[kind],cannonCapacity()-mountedCannonCount());cannonInventory[kind]-=amount;mountedCannons[kind]+=amount;}
  else{amount=Math.min(amount,mountedCannons[kind],mountedCannonCount()-1);mountedCannons[kind]-=amount;cannonInventory[kind]+=amount;if(state.cannonType===kind&&mountedCannons[kind]===0){state.cannonType=(Object.keys(mountedCannons) as CannonKind[]).find(type=>mountedCannons[type]>0)||'cast';}}
  state.cannon=mountedCannonCount();saveAccount();renderShipMenu();updateUI();
}
function openEliteShips(){previewEliteShip=activeEliteShip;renderEliteShips();ui('eliteShipOverlay').classList.add('open');}
function closeEliteShips(){ui('eliteShipOverlay').classList.remove('open');}
function renderEliteShips(){
  const unlocked=Math.max(1,Math.min(15,Math.floor(state.elitePoints/100)+1));
  ui('eliteShipGrid').innerHTML=ELITE_SHIPS.map((ship,index)=>{const col=index%5,row=Math.floor(index/5);return`<button class="elite-card ${ship.id===activeEliteShip?'active':''} ${ship.level>unlocked?'locked':''}" data-elite="${ship.id}"><span class="elite-level">ELİT ${ship.level}</span><span class="elite-art" role="img" aria-label="${ship.name}" style="--elite-x:${col*25}%;--elite-y:${row*50}%"></span><strong>${ship.name}</strong><small>${ship.role}</small>${ship.level>unlocked?`<b>🔒 ${ship.level}. elit seviye</b>`:''}</button>`}).join('');
  ui('eliteShipGrid').querySelectorAll<HTMLElement>('[data-elite]').forEach(el=>el.onclick=()=>{previewEliteShip=el.dataset.elite as EliteShipId;renderEliteShips();});
  const ship=eliteById(previewEliteShip),locked=ship.level>unlocked;
  ui('eliteShipDetail').innerHTML=`<span class="eyebrow">Elit ${ship.level}</span><span class="elite-art elite-preview" role="img" aria-label="${ship.name}" style="--elite-x:${((ship.level-1)%5)*25}%;--elite-y:${Math.floor((ship.level-1)/5)*50}%"></span><h3>${ship.name}</h3><em>${ship.english}</em><b>${ship.role}</b><dl><dt>Pasif</dt><dd>${ship.passive}</dd><dt>${ship.ability}</dt><dd>${ship.abilityDescription}</dd></dl><button id="equipEliteShip" ${locked||ship.id===activeEliteShip?'disabled':''}>${ship.id===activeEliteShip?'AKTİF GEMİ':locked?'KİLİTLİ':'GEMİYİ SEÇ'}</button>`;
  const equip=document.getElementById('equipEliteShip') as HTMLButtonElement|null;if(equip&&!equip.disabled)equip.onclick=()=>{const oldFactor=eliteMaxHpFactor();activeEliteShip=ship.id;const newFactor=eliteMaxHpFactor();state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*newFactor/oldFactor));eliteAbility.active=0;eliteAbility.cooldown=0;shadowReady=true;saveAccount();renderEliteShips();updateUI();toast(`${ship.name} amiral gemisi seçildi`);};
}
function openDevelopment(){pendingUpgrade=null;renderUpgrades();ui('developmentOverlay').classList.add('open');}
function closeDevelopment(){pendingUpgrade=null;ui('developmentOverlay').classList.remove('open');}
const DEV_BRANCHES:{name:string;icon:string;nodes:({kind:'pearl';id:UpgradeKind}|{kind:'point';id:TalentId})[]}[]=[
  {name:'Topçuluk',icon:'/assets/icon-attack-v1.webp',nodes:[{kind:'pearl',id:'damage'},{kind:'pearl',id:'range'},{kind:'pearl',id:'reload'},{kind:'point',id:'firemaster'},{kind:'point',id:'sapper'}]},
  {name:'Denizcilik',icon:'/assets/officer-helmsman-v1.webp',nodes:[{kind:'pearl',id:'hull'},{kind:'pearl',id:'speed'},{kind:'pearl',id:'repair'},{kind:'point',id:'tough'},{kind:'point',id:'windcaller'}]},
  {name:'Yağma',icon:'/assets/icon-chest-v1.webp',nodes:[{kind:'point',id:'plunder'},{kind:'point',id:'scavenger'},{kind:'point',id:'bounty'}]},
];
function renderUpgrades(){
  const free=talentPoints(state.level)-spentPoints(crew);
  ui('upgradeList').innerHTML=`<p class="talent-points">İnci: <b>${state.pearls}</b> · Yetenek puanı: <b>${free}</b> <small>İnci ile temel güçler, seviye başına kazanılan yetenek puanıyla özel yetenekler açılır.</small>${spentPoints(crew)>0?'<button id="resetTalents">PUANLARI SIFIRLA · 5 İNCİ</button>':''}</p><div class="talent-branches">${DEV_BRANCHES.map(branch=>`<section class="talent-branch"><header><img src="${branch.icon}" alt=""/><h3>${branch.name}</h3></header>${branch.nodes.map(node=>{
    if(node.kind==='pearl'){const item=UPGRADES[node.id],level=upgrades[node.id],maxed=level>=10;return`<button class="talent pearl-node ${level?'owned':''} ${maxed?'maxed':''} ${pendingUpgrade===node.id?'selected':''}" data-upgrade="${node.id}" ${maxed?'disabled':''}><span class="talent-icon">${upgradeIcon(node.id)}</span><span><strong>${item.name}</strong><small>${item.effect} / seviye</small></span><b>${level}/10<em>${maxed?'AZAMİ':`◈ ${upgradeCost(node.id)}`}</em></b></button>`;}
    const t=TALENTS[node.id],rank=crew.talents[node.id]||0,maxed=rank>=t.max;return`<button class="talent ${rank?'owned':''} ${maxed?'maxed':''}" data-talent="${node.id}" ${free<=0||maxed?'disabled':''}><img src="${t.icon}" alt=""/><span><strong>${t.name}</strong><small>${t.per} / kademe</small></span><b>${rank}/${t.max}<em>1 PUAN</em></b></button>`;}).join('')}</section>`).join('')}</div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach(button=>button.onclick=()=>requestUpgrade(button.dataset.upgrade as UpgradeKind));
  document.querySelectorAll<HTMLButtonElement>('[data-talent]').forEach(b=>b.onclick=()=>{const id=b.dataset.talent as TalentId;if(talentPoints(state.level)-spentPoints(crew)<=0)return;crew.talents[id]=(crew.talents[id]||0)+1;refreshBonus();renderUpgrades();toast(`${TALENTS[id].name} ${crew.talents[id]}. kademe`);});
  const reset=document.getElementById('resetTalents');if(reset)reset.onclick=()=>{if(state.pearls<5){toast('Sıfırlamak için 5 İnci gerekli');return;}state.pearls-=5;crew.talents={};saveAccount();refreshBonus();renderUpgrades();updateUI();toast('Yetenek puanları iade edildi');};
  if(!pendingUpgrade){ui('upgradeConfirm').classList.remove('visible');ui('upgradeConfirm').innerHTML='';return;}
  const item=UPGRADES[pendingUpgrade],cost=upgradeCost(pendingUpgrade);ui('upgradeConfirm').classList.add('visible');ui('upgradeConfirm').innerHTML=`<div><strong>${item.name} yükseltmesini onaylıyor musun?</strong><span>${cost} İnci harcanacak.</span></div><button id="confirmUpgrade">SATIN AL</button><button id="cancelUpgrade">VAZGEÇ</button>`;
  ui('confirmUpgrade').onclick=buyUpgrade;ui('cancelUpgrade').onclick=()=>{pendingUpgrade=null;renderUpgrades();};
}
function equipCannon(kind:CannonKind){
  const unlockLevel:Record<CannonKind,number>={cast:1,long:2,rapid:3,heavy:4};
  if(state.level<unlockLevel[kind]){toast(`Bu top için seviye ${unlockLevel[kind]} gerekli`);return;}
  state.cannonType=kind;player.cooldown=0;saveAccount();renderShipMenu();updateUI();toast(`${CANNONS[kind].name} Top kuşanıldı`);
}
function requestUpgrade(kind:UpgradeKind){pendingUpgrade=kind;renderUpgrades();}
function buyUpgrade(){
  if(!pendingUpgrade)return;const kind=pendingUpgrade,cost=upgradeCost(kind);
  if(state.pearls<cost){toast('Bu geliştirme için yeterli İncin yok');return;}
  state.pearls-=cost;upgrades[kind]++;
  if(kind==='hull'){state.maxHp+=20;state.hp+=20;}
  pendingUpgrade=null;saveAccount();renderUpgrades();updateUI();rewardNotice(`${UPGRADES[kind].name}   SEVİYE ${upgrades[kind]}`);
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
  ui('inventoryStrip').innerHTML=`<div><span>DEMİR GÜLLE</span><b>∞</b><small>Sınırsız standart mühimmat</small></div><div><span>ZİNCİR GÜLLESİ</span><b>${state.chainAmmo}</b><small>Her atış 1 gülle tüketir</small></div><div><span>ATEŞ / SAÇMA</span><b>${arsenal.fire} / ${arsenal.grape}</b><small>Özel gülleler</small></div><div><span>DENİZ MAYINI</span><b>${arsenal.mine}</b><small>C tuşu ile bırakılır</small></div><div><span>ALTIN BAKİYESİ</span><b>${state.gold}</b><small>Market alışverişlerinde kullanılır</small></div>`;
  ui('marketList').innerHTML=MARKET_ITEMS.map((item,index)=>`<article class="market-item"><div class="ammo-icon">${itemAsset('chain')}<b>${item.amount}</b></div><div><h4>${item.name}</h4><p>${item.description}</p></div><button data-market="${index}">${item.price} ALTIN</button></article>`).join('')+ARSENAL_MARKET.map((item,index)=>`<article class="market-item"><div class="ammo-icon">${itemAsset(item.kind)}<b>${item.amount}</b></div><div><h4>${item.name}</h4><p>${item.description}</p></div><button data-market="${MARKET_ITEMS.length+index}">${item.price} ALTIN</button></article>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-market]').forEach(button=>button.onclick=()=>{pendingMarket=Number(button.dataset.market);renderMarket();});
  if(pendingMarket===null){ui('marketConfirm').classList.remove('visible');ui('marketConfirm').innerHTML='';return;}
  const special=pendingMarket>=MARKET_ITEMS.length?ARSENAL_MARKET[pendingMarket-MARKET_ITEMS.length]:null,item=special??MARKET_ITEMS[pendingMarket];ui('marketConfirm').classList.add('visible');ui('marketConfirm').innerHTML=`<div><strong>${special?`${item.amount} × ${QUICK_ITEMS[special.kind].name}`:`${item.amount} zincir güllesi`} alınsın mı?</strong><span>${item.price} Altın hesabından düşülecek.</span></div><button id="confirmMarket">SATIN AL</button><button id="cancelMarket">VAZGEÇ</button>`;
  ui('confirmMarket').onclick=buyMarketItem;ui('cancelMarket').onclick=()=>{pendingMarket=null;renderMarket();};
}
function buyMarketItem(){
  if(pendingMarket===null)return;
  if(pendingMarket>=MARKET_ITEMS.length){const special=ARSENAL_MARKET[pendingMarket-MARKET_ITEMS.length];if(state.gold<special.price){toast('Bu ürün için yeterli altının yok');return;}state.gold-=special.price;arsenal[special.kind]+=special.amount;saveArsenal(arsenal);saveAccount();pendingMarket=null;renderMarket();renderQuickSlots();updateUI();rewardNotice(`+${special.amount} ${QUICK_ITEMS[special.kind].name}`);return;}
  const item=MARKET_ITEMS[pendingMarket];
  if(state.gold<item.price){toast('Bu mühimmat için yeterli altının yok');return;}
  state.gold-=item.price;state.chainAmmo+=item.amount;pendingMarket=null;saveAccount();renderMarket();updateUI();rewardNotice(`+${item.amount} Zincir Güllesi`);
}
let loadoutTab:'ammo'|'consumable'='ammo';
let pendingQuickItem:QuickItemId|null=null;
function quickCount(item:QuickItemId){if(item==='iron')return'∞';if(item==='chain')return String(state.chainAmmo);if(item==='fire'||item==='grape'||item==='mine')return String(arsenal[item]);return'';}
function slotKey(index:number){return keyLabel(settings.binds[(index<AMMO_ROW?`ammo${index+1}`:`item${index-AMMO_ROW+1}`) as ActionId]);}
function itemAsset(item:QuickItemId){return rasterItemAssets[item]?`<img class="raster-item" src="${rasterItemAssets[item]}" alt="${QUICK_ITEMS[item].name}" draggable="false"/>`:`<i class="sprite icon-${QUICK_ITEMS[item].icon}"></i>`;}
function renderQuickSlots(){
  ui('quickInventory').innerHTML=quickSlots.map((item,index)=>{const row=index<AMMO_ROW?'ammo-row':'item-row',key=slotKey(index);return item?`<button class="quick-slot ${row} ${item===state.ammo?'active':''}" data-quick-slot="${index}" data-quick-item="${item}" title="${QUICK_ITEMS[item].name}">${itemAsset(item)}<b>${quickCount(item)}</b><kbd>${key==='—'?'':key}</kbd></button>`:`<button class="quick-slot ${row} empty" data-quick-slot="${index}" title="${index<AMMO_ROW?'Gülle yuvası':'Sarf yuvası'}"><span>+</span><kbd>${key==='—'?'':key}</kbd></button>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('#quickInventory [data-quick-slot]').forEach(slot=>{const index=Number(slot.dataset.quickSlot);slot.onclick=()=>useQuickSlot(index);slot.ondragover=e=>e.preventDefault();slot.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
function useQuickSlot(index:number){
  if(pendingQuickItem){assignQuickSlot(index,pendingQuickItem);return;}
  const item=quickSlots[index];if(!item){openLoadout(index<AMMO_ROW?'ammo':'consumable');return;}
  if(item==='iron'||item==='chain'){state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}
  else if(item==='fire'||item==='grape'){if(arsenal[item]<=0){toast(`${QUICK_ITEMS[item].name} kalmadı — marketten alabilirsin`);}else{state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}}
  else if(item==='repairkit')toggleRepair();else if(item==='speed'||item==='shield')activateAbility(item);else if(item==='mine')dropMine();
  renderQuickSlots();
}
function assignQuickSlot(index:number,item:QuickItemId){if((index<AMMO_ROW)!==(QUICK_ITEMS[item].category==='ammo')){toast(index<AMMO_ROW?'Üst sıraya yalnızca gülle konabilir':'Alt sıraya yalnızca sarf malzemesi konabilir');return;}const prev=quickSlots.indexOf(item);if(prev>=0&&prev!==index)quickSlots[prev]=null;quickSlots[index]=item;pendingQuickItem=null;saveAccount();renderQuickSlots();if(ui('loadoutOverlay').classList.contains('open'))renderLoadout();toast(`${QUICK_ITEMS[item].name} ${index+1}. yuvaya yerleştirildi`);}
function openLoadout(tab:typeof loadoutTab='ammo'){loadoutTab=tab;pendingQuickItem=null;renderLoadout();ui('loadoutOverlay').classList.add('open');}
function closeLoadout(){pendingQuickItem=null;ui('loadoutOverlay').classList.remove('open');}
function renderLoadout(){
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>button.classList.toggle('active',button.dataset.tab===loadoutTab));
  const items=(Object.keys(QUICK_ITEMS) as QuickItemId[]).filter(id=>QUICK_ITEMS[id].category===loadoutTab);
  ui('loadoutItems').innerHTML=items.map(id=>`<button draggable="true" data-loadout-item="${id}" class="${pendingQuickItem===id?'selected':''}">${itemAsset(id)}<span>${QUICK_ITEMS[id].name}</span><small>${QUICK_ITEMS[id].description}</small><b>${quickCount(id)}</b></button>`).join('');
  ui('loadoutSlots').innerHTML=quickSlots.map((item,index)=>`${index===0?'<h4>GÜLLE SIRASI</h4>':index===AMMO_ROW?'<h4>SARF SIRASI</h4>':''}<button data-editor-slot="${index}" class="${pendingQuickItem&&(index<AMMO_ROW)===(QUICK_ITEMS[pendingQuickItem].category==='ammo')?'ready':''} ${index<AMMO_ROW?'ammo-row':'item-row'}">${item?`${itemAsset(item)}<span>${index+1}</span>`:`<b>+</b><span>${index+1}</span>`}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-loadout-item]').forEach(button=>{const item=button.dataset.loadoutItem as QuickItemId;button.onclick=()=>{pendingQuickItem=item;renderLoadout();};button.ondragstart=e=>e.dataTransfer?.setData('text/quick-item',item);});
  document.querySelectorAll<HTMLButtonElement>('[data-editor-slot]').forEach(button=>{const index=Number(button.dataset.editorSlot);button.onclick=()=>{if(pendingQuickItem)assignQuickSlot(index,pendingQuickItem);};button.ondragover=e=>e.preventDefault();button.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
let pendingCancel:string|null=null;
let chartSelection:MapKey|null=null;
function openWorldMap(){chartSelection=currentMap;renderWorldMap();ui('worldMapOverlay').classList.add('open');}
function closeWorldMap(){ui('worldMapOverlay').classList.remove('open');}
function renderWorldMap(){
  const chart=ui('worldChart');chart.style.backgroundImage=`url(${WORLD_CHART})`;
  chart.innerHTML=`<div class="world-grid">${GRID.flat().map(key=>{const m=MAPS[key],locked=state.level<m.tier,here=key===currentMap,owned=fleetOwner(key)==='player',t=THEMES[m.tier];
    return`<button class="world-tile ${here?'here':''} ${locked?'locked':''} ${m.safe?'safe':''} ${chartSelection===key?'selected':''}" data-chart="${key}" style="--tile:${t.sea[0]};--tile2:${t.sea[1]};--tint:${t.tint}"><i style="background-image:url(${islandSheetUrl(m.islands[0].look)});background-position:${m.islands[0].variant*100}% 0"></i><b>${key}</b><strong>${m.name}</strong><small>${here?'BURADASIN':locked?`SEVİYE ${m.tier}`:m.safe?'SAVAŞA KAPALI':t.name}</small>${owned?'<em title="Filo adası senin">⚑</em>':''}</button>`;}).join('')}</div><div class="world-legend"><span class="lg-here">Buradasın</span><span class="lg-safe">Savaşa kapalı</span><span class="lg-lock">Kilitli</span><span class="lg-own">⚑ Filo adası senin</span></div>`;
  chart.querySelectorAll<HTMLButtonElement>('[data-chart]').forEach(b=>b.onclick=()=>{chartSelection=b.dataset.chart as MapKey;renderWorldMap();});
  const m=MAPS[chartSelection??currentMap],locked=state.level<m.tier,npcs=m.npcs.map(id=>NPCS[id].name).join(', ');
  ui('worldInfo').innerHTML=`<div><span class="eyebrow">${m.key} · ${THEMES[m.tier].name}</span><h3>${m.name}</h3><p>${m.description}</p><dl><div><dt>Seviye</dt><dd>${m.tier}+</dd></div><div><dt>Gemiler</dt><dd>${npcs}</dd></div><div><dt>Canavar</dt><dd>${MONSTERS[m.monster].name}</dd></div><div><dt>Filo adası</dt><dd>${fleetOwner(m.key)==='player'?'<b class="safe">Senin</b>':'<b class="danger">Rakip</b>'}</dd></div></dl></div><button disabled>${m.key===currentMap?'ŞU AN BURADASIN':locked?`SEVİYE ${m.tier} GEREKLİ`:'KENARLARDAN GEÇİŞ'}</button>`;
}
function openQuestLog(){renderQuestLog();ui('questOverlay').classList.add('open');}
function closeQuestLog(){pendingCancel=null;ui('questOverlay').classList.remove('open');}
function openCaptainProfile(){updateUI();renderBonusSummary();ui('captainOverlay').classList.add('open');}
function refreshBonus(){bonus=computeBonus(crew);saveCrew(crew);renderBonusSummary();}
function renderBonusSummary(){
  const pct=(v:number)=>`${v>=1?'+':''}${Math.round((v-1)*100)}%`;
  ui('bonusSummary').innerHTML=`<span class="eyebrow">Geliştirme, yetenek ve tayfa bonusları</span><div><b>Hasar ${pct(bonus.damage*(1+upgrades.damage*.11))}</b><b>Dolum ${pct(Math.max(.6,1-upgrades.reload*.04)*bonus.reload)}</b><b>Menzil +${upgrades.range*18+bonus.range}</b><b>Hız ${pct(bonus.speed*(104+upgrades.speed*5)/104)}</b><b>Alınan hasar ${pct(bonus.taken)}</b><b>Tamir ${pct(bonus.repair)}</b></div>`;
}
function openCrew(){renderCrew();ui('crewOverlay').classList.add('open');}
function closeCrew(){ui('crewOverlay').classList.remove('open');}
function renderCrew(){
  const slots=officerSlots(state.level);
  ui('crewPanel').innerHTML=`<p class="talent-points">Görevdeki subaylar: <b>${crew.active.length} / ${slots}</b> <small>Yuvalar 3. ve 6. seviyede açılır. Yalnızca görevdeki subaylar bonus verir.</small></p><div class="officer-grid">${(Object.keys(OFFICERS) as OfficerId[]).map(id=>{const o=OFFICERS[id],rank=crew.officers[id]||0,active=crew.active.includes(id),cost=officerCost(rank),maxed=rank>=OFFICER_MAX_RANK;
    return`<article class="officer ${active?'active':''} ${rank?'hired':''}"><img src="${o.icon}" alt=""/><div><span>${o.title}</span><h4>${o.name}</h4><small>${o.per} / rütbe</small><i>${'★'.repeat(rank)}${'☆'.repeat(OFFICER_MAX_RANK-rank)}</i></div><footer>${rank?`<button data-officer-toggle="${id}">${active?'GÖREVDEN AL':'GÖREVE AL'}</button>`:''}<button data-officer-rank="${id}" ${maxed?'disabled':''}>${maxed?'AZAMİ RÜTBE':rank?`RÜTBE ↑ ${cost} ALTIN`:`İŞE AL · ${cost} ALTIN`}</button></footer></article>`;}).join('')}</div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-officer-rank]').forEach(b=>b.onclick=()=>{const id=b.dataset.officerRank as OfficerId,rank=crew.officers[id]||0,cost=officerCost(rank);if(rank>=OFFICER_MAX_RANK)return;if(state.gold<cost){toast('Yeterli altının yok');return;}state.gold-=cost;crew.officers[id]=rank+1;if(!rank&&crew.active.length<officerSlots(state.level))crew.active.push(id);saveAccount();refreshBonus();renderCrew();updateUI();rewardNotice(`${OFFICERS[id].name}   ${rank?`${rank+1}. RÜTBE`:'TAYFAYA KATILDI'}`);});
  document.querySelectorAll<HTMLButtonElement>('[data-officer-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.officerToggle as OfficerId,i=crew.active.indexOf(id);if(i>=0)crew.active.splice(i,1);else{if(crew.active.length>=officerSlots(state.level)){toast('Boş subay yuvası yok');return;}crew.active.push(id);}refreshBonus();renderCrew();});
}
function openSettings(){rebinding=null;renderSettings();ui('settingsOverlay').classList.add('open');}
function closeSettings(){rebinding=null;ui('settingsOverlay').classList.remove('open');}
function refreshBindHints(){document.querySelectorAll<HTMLElement>('[data-bind]').forEach(el=>{el.textContent=keyLabel(settings.binds[el.dataset.bind as ActionId]);});}
function renderSettings(){
  const groups=[...new Set(ACTIONS.map(a=>a.group))];
  ui('settingsPanel').innerHTML=`<section class="settings-block"><h3>SES</h3><div class="sound-row"><button id="soundToggle" class="${settings.sound?'on':''}">${settings.sound?'SES AÇIK':'SES KAPALI'}</button><label>Ses düzeyi<input id="soundVolume" type="range" min="0" max="100" value="${Math.round(settings.volume*100)}" ${settings.sound?'':'disabled'}/></label></div></section>
  <section class="settings-block"><h3>KLAVYE KISAYOLLARI <button id="resetBinds">VARSAYILANA DÖN</button></h3><p>Değiştirmek istediğin eyleme tıkla, sonra yeni tuşa bas. ESC iptal eder. Ok tuşları her zaman hareket için de çalışır.</p>${groups.map(g=>`<h4>${g}</h4><div class="bind-grid">${ACTIONS.filter(a=>a.group===g).map(a=>`<button class="bind ${rebinding===a.id?'listening':''}" data-rebind="${a.id}"><span>${a.label}</span><kbd>${rebinding===a.id?'TUŞA BAS…':keyLabel(settings.binds[a.id])}</kbd></button>`).join('')}</div>`).join('')}</section>`;
  ui('soundToggle').onclick=()=>{settings.sound=!settings.sound;setAudio(settings.sound,settings.volume);saveSettings(settings);renderSettings();};
  (ui('soundVolume') as HTMLInputElement).oninput=e=>{settings.volume=Number((e.target as HTMLInputElement).value)/100;setAudio(settings.sound,settings.volume);saveSettings(settings);};
  ui('resetBinds').onclick=()=>{settings.binds={...DEFAULT_BINDS};saveSettings(settings);renderQuickSlots();refreshBindHints();renderSettings();toast('Kısayollar varsayılana döndü');};
  document.querySelectorAll<HTMLButtonElement>('[data-rebind]').forEach(b=>b.onclick=()=>{rebinding=b.dataset.rebind as ActionId;renderSettings();});
}
function closeCaptainProfile(){ui('captainOverlay').classList.remove('open');}
const tierQuests=()=>QUESTS.filter(q=>q.tier===state.level);
const questUnit=(q:QuestDef)=>q.kind==='npc'?'Gemi':q.kind==='monster'?'Canavar':'Sandık';
function renderQuestLog(){
  ui('questList').innerHTML=`<p class="quest-tier">Seviye ${state.level} görevleri · ${THEMES[state.level].name}</p>`+tierQuests().map((quest,index)=>{
    const cooling=(questCooldownUntil[quest.id]??0)>Date.now(),active=state.activeQuest===quest.id,progress=questProgress[quest.id]??0;
    const status=cooling?cooldownText(questCooldownUntil[quest.id]):active?'GÖREVİ İPTAL ET':progress>0?'DEVAM ET':'GÖREVİ BAŞLAT';
    const action=pendingCancel===quest.id?`<div class="cancel-confirm"><strong>Emin misin?</strong><button data-confirm-cancel="${quest.id}">İPTALİ ONAYLA</button><button data-keep-quest="${quest.id}">VAZGEÇ</button></div>`:`<button data-quest="${quest.id}" ${cooling?'disabled':''}>${status}</button>`;
    return `<article class="quest-entry ${active?'active':''} ${cooling?'completed':''}"><div class="quest-number">${String(index+1).padStart(2,'0')}</div><div class="quest-copy"><span>${cooling?'2 SAAT BEKLEME':quest.kind==='npc'?'GEMİ AVI':quest.kind==='monster'?'DENİZ CANAVARI':'GANİMET'}</span><h3>${quest.title}</h3><p>${quest.description}</p><div class="quest-rewards"><b>${quest.gold} ALTIN</b><b>${quest.wood} KERESTE</b><b>${quest.xp} TP</b><b>◈ ${quest.pearls} İNCİ</b></div><small>${cooling?'Yeniden açılmasına: '+cooldownText(questCooldownUntil[quest.id]):`${Math.min(progress,quest.required)} / ${quest.required} ${questUnit(quest)}`}</small></div>${action}</article>`;
  }).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-quest]').forEach(button=>button.onclick=()=>{const id=button.dataset.quest!;state.activeQuest===id?requestQuestCancel(id):startQuest(id);});
  document.querySelectorAll<HTMLButtonElement>('[data-confirm-cancel]').forEach(button=>button.onclick=()=>cancelQuest(button.dataset.confirmCancel!));
  document.querySelectorAll<HTMLButtonElement>('[data-keep-quest]').forEach(button=>button.onclick=()=>{pendingCancel=null;renderQuestLog();});
}
const questById=(id:string)=>QUESTS.find(q=>q.id===id)!;
function startQuest(id:string){
  if((questCooldownUntil[id]??0)>Date.now())return;
  if(state.activeQuest!==null){toast(`Önce ${questById(state.activeQuest).title} görevini iptal et`);return;}
  state.activeQuest=id;saveQuestState();closeQuestLog();toast(`${questById(id).title} görevi başladı`);updateUI();
}
function requestQuestCancel(id:string){if(state.activeQuest!==id)return;pendingCancel=id;renderQuestLog();}
function cancelQuest(id:string){
  if(state.activeQuest!==id)return;
  state.activeQuest=null;questProgress[id]=0;questCooldownUntil[id]=Date.now()+QUEST_COOLDOWN_MS;pendingCancel=null;saveQuestState();renderQuestLog();toast(`${questById(id).title} iptal edildi — 2 saat sonra yeniden açılacak`);updateUI();
}
function recordQuestProgress(kind:QuestDef['kind'],id:string){
  if(state.activeQuest===null)return;
  const quest=questById(state.activeQuest);
  if(!quest||quest.kind!==kind||!quest.ids.includes(id))return;
  questProgress[quest.id]=(questProgress[quest.id]??0)+1;saveQuestState();
  if(questProgress[quest.id]<quest.required)return;
  state.gold+=quest.gold;state.wood+=quest.wood;state.fame+=quest.xp;state.pearls+=quest.pearls;
  rewardNotice(`GÖREV TAMAMLANDI   +${quest.gold} Altın   +${quest.pearls} İnci   +${quest.xp} TP`);
  toast(`${quest.title} tamamlandı`);questProgress[quest.id]=0;questCooldownUntil[quest.id]=Date.now()+QUEST_COOLDOWN_MS;state.activeQuest=null;saveQuestState();saveAccount();
}
function updateUI(){
  ui('pearls').textContent=String(state.pearls).padStart(3,'0');ui('gold').textContent=String(state.gold).padStart(3,'0');
  document.querySelectorAll<HTMLElement>('#quickInventory [data-quick-item]').forEach(slot=>{const item=slot.dataset.quickItem as QuickItemId;const count=slot.querySelector('b');if(count)count.textContent=quickCount(item);slot.classList.toggle('active',item===state.ammo);});
  ui('hpText').textContent=`${Math.ceil(state.hp)} / ${effectiveMaxHp()}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/effectiveMaxHp()*100}%`;
  const need=xpNeed(state.level),needText=Number.isFinite(need)?String(need):'AZAMİ';ui('xpText').textContent=`${state.fame} / ${needText}`;(ui('xpBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('level').textContent=String(state.level);ui('captainLevel').textContent=String(state.level);ui('profileElite').textContent=`${state.elitePoints} / 1500`;ui('profileBattle').textContent=`${state.battlePoints} / 500`;(ui('profileEliteBar') as HTMLElement).style.width=`${Math.min(100,state.elitePoints/15)}%`;(ui('profileBattleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;
  (ui('xpHudBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('xpHudText').textContent=`${state.fame} / ${needText}`;(ui('hpHudBar') as HTMLElement).style.width=`${Math.max(0,state.hp/effectiveMaxHp()*100)}%`;ui('hpHudText').textContent=`${Math.ceil(state.hp)} / ${effectiveMaxHp()}`;(ui('eliteBar') as HTMLElement).style.width=`${Math.min(100,state.elitePoints/15)}%`;ui('eliteText').textContent=`${state.elitePoints} / 1500`;(ui('battleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;ui('battleText').textContent=`${state.battlePoints} / 500`;
  const quest=state.activeQuest===null?null:questById(state.activeQuest);ui('questTitle').textContent=quest?.title||'Görev seçilmedi';ui('questDescription').textContent=quest?.description||'Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.';ui('quest').textContent=quest?`${questProgress[quest.id]??0} / ${quest.required} ${questUnit(quest)}`:'Hazır olduğunda bir görev başlat';
  ui('reloadText').textContent=player.cooldown>0?`${player.cooldown.toFixed(1)} sn`:'HAZIR';ui('attack').classList.toggle('reloading',player.cooldown>0);
  ui('attackLabel').textContent=state.attacking?'SALDIRIYI İPTAL ET':'SALDIR';ui('attack').classList.toggle('active',state.attacking);
  ui('repair').classList.toggle('active',state.repairing);
  const elite=eliteShip(),eliteIndex=elite.level-1,eliteButton=ui('ability-elite');ui('eliteAbilityName').textContent=elite.ability.toLocaleUpperCase('tr');ui('eliteAbilityTime').textContent=eliteAbility.active>0?`${Math.ceil(eliteAbility.active)} SN`:eliteAbility.cooldown>0?`${Math.ceil(eliteAbility.cooldown)}`:'HAZIR';eliteButton.classList.toggle('active',eliteAbility.active>0);eliteButton.style.setProperty('--cd',Math.min(1,eliteAbility.cooldown/45).toFixed(3));const eliteIcon=ui('eliteAbilityIcon') as HTMLElement;eliteIcon.style.setProperty('--elite-x',`${eliteIndex%5*25}%`);eliteIcon.style.setProperty('--elite-y',`${Math.floor(eliteIndex/5)*50}%`);
  renderCombatTargets();
}

let visibleCombatTargets:Target[]=[];
function renderCombatTargets(){
  const targets:Target[]=[];
  const add=(target:Target|null)=>{if(target&&targetExists(target)&&!targets.includes(target))targets.push(target);};
  add(selected);enemies.forEach(enemy=>{if(enemy.aggro)add(enemy);});monsters.forEach(monster=>{if(monster.aggro)add(monster);});
  visibleCombatTargets=targets.slice(0,5);
  const root=ui('combatTargets');root.classList.toggle('visible',visibleCombatTargets.length>0);
  root.innerHTML=visibleCombatTargets.map((target,index)=>{const range=Math.round(dist(player,target));const active=target===selected;const fighting=target.aggro||(active&&state.attacking);const role=target.kind==='ship'&&target.tower?'FİLO KULESİ · FİLO SAVAŞI':target.kind==='ship'&&target.boss?'EFSANEVİ AMİRAL':target.kind==='monster'?'DENİZ CANAVARI':target.role==='heavy'?'AĞIR GEMİ':'HAFİF GEMİ';const portrait=target.kind==='monster'?target.def.portrait:target.boss?BOSS_PORTRAIT:target.def?.portrait??-1;return `<button class="combat-target ${active?'selected':''}" data-combat-target="${index}"><span class="target-portrait ${target.kind} ${target.kind==='ship'?target.role:''}">${portrait>=0?`<i class="portrait-art" style="${portraitStyle(PORTRAIT_ATLAS,portrait,PORTRAIT_COUNT,PORTRAIT_COLS)}"></i>`:`<i class="portrait-art tower-art" style="background-image:url(${fleetTowerUrl(theme().fleet)})"></i>`}</span><span class="target-info"><small>${target.kind==='monster'?role:'SV '+target.tier+' · '+role} · ${range}m</small><strong>${target.name}</strong><i><em style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></em></i><b>${Math.ceil(target.hp)} / ${target.maxHp}</b></span><span class="target-state">${fighting?'SAVAŞ':'HEDEF'}</span></button>`;}).join('');
  root.querySelectorAll<HTMLButtonElement>('[data-combat-target]').forEach(button=>button.onpointerdown=()=>{const target=visibleCombatTargets[Number(button.dataset.combatTarget)];if(target){selected=target;updateUI();}});
}

function update(dt:number){
    const turn=(held('left','arrowleft')?-1:0)+(held('right','arrowright')?1:0);
    const thrust=(held('forward','arrowup')?1:0)-(held('back','arrowdown')?1:0);
    if(thrust||turn)routeTarget=null;
    if(routeTarget){if(dist(player,routeTarget)<14)routeTarget=null;else destination=routeVia(routeTarget);}
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
  player.cooldown=Math.max(0,player.cooldown-dt);eliteAbility.active=Math.max(0,eliteAbility.active-dt);eliteAbility.cooldown=Math.max(0,eliteAbility.cooldown-dt);valhallaTimer=Math.max(0,valhallaTimer-dt);soulTimer=Math.max(0,soulTimer-dt);if(soulTimer<=0)soulStacks=0;if(activeEliteShip==='ironclad'&&eliteAbility.active>0)player.cooldown=0;state.invulnerable=Math.max(0,state.invulnerable-dt);collisionNotice=Math.max(0,collisionNotice-dt);camera.x+=(player.x-camera.x)*Math.min(1,dt*3);camera.y+=(player.y-camera.y)*Math.min(1,dt*3);camera.zoom+=(camera.targetZoom-camera.zoom)*Math.min(1,dt*7);
  for(let i=salvoQueue.length-1;i>=0;i--){salvoQueue[i].delay-=dt;if(salvoQueue[i].delay<=0){releaseSalvo(salvoQueue[i]);salvoQueue.splice(i,1);}}
  if(state.repairing){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*(.035+upgrades.repair*.008)*bonus.repair*dt);if(state.hp>=effectiveMaxHp()){state.repairing=false;saveAccount();ui('repair').classList.remove('active');toast('Gövde tamamen onarıldı');}}
  wakeClock-=dt;if(Math.abs(player.speed)>8&&wakeClock<=0){wakeClock=.1;particles.push({x:player.x-Math.sin(player.angle)*22,y:player.y+Math.cos(player.angle)*22,vx:-Math.sin(player.angle)*8,vy:Math.cos(player.angle)*8,life:.75,maxLife:.75,kind:'foam'});}
  monsters.forEach(m=>{m.phase+=dt;m.cooldown-=dt;m.slowTimer=Math.max(0,m.slowTimer-dt);if(m.aggro){m.combatTimer-=dt;if(m.combatTimer<=0||Math.hypot(m.x-m.homeX,m.y-m.homeY)>720)m.aggro=false;}if(m.aggro&&dist(m,player)<430&&m.cooldown<=0)monsterFire(m);});
  if(state.attacking&&selected){
    const d=dist(player,selected),cannonRange=effectiveRange();
    if(d>cannonRange){
      const away=Math.atan2(player.y-selected.y,player.x-selected.x);
      routeTarget=null;destination=routeVia(navigablePoint({x:selected.x+Math.cos(away)*(cannonRange-35),y:selected.y+Math.sin(away)*(cannonRange-35)}));
    }else{
      destination=null;player.speed+=(effectiveSpeed()*.42-player.speed)*Math.min(1,dt*1.4);
      const course=broadsideCourse(selected),delta=angleDelta(course,player.angle);
      player.angle+=clamp(delta,-2.6*dt,2.6*dt);
      fireAtTarget();
    }
  }
  for(const e of enemies){
    if(e.tower){updateTower(e,dt);continue;}
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
        if(dist(s,e)<(e.hitRadius??25)){const hit=s.damage;s.hit=true;if(activeEliteShip==='crimson')state.hp=Math.min(effectiveMaxHp(),state.hp+hit*.07);if(activeEliteShip==='magma'&&Math.random()<.2)e.burnTimer=3;e.aggro=true;e.combatTimer=12;if(s.ammo==='chain')e.slowTimer=3;if(s.ammo==='fire')e.burnTimer=SPECIAL_AMMO.fire.burnSeconds;e.hp-=hit;damageText(e.x,e.y,hit);burst(e.x,e.y);playHit();s.life=0;
          if(e.hp<=0)sinkEnemy(e);
        }
      }
      for(let j=monsters.length-1;j>=0&&s.life>0;j--){
        const m=monsters[j];
        if(dist(s,m)<m.radius){const hit=s.damage;s.hit=true;if(activeEliteShip==='crimson')state.hp=Math.min(effectiveMaxHp(),state.hp+hit*.07);if(activeEliteShip==='magma'&&Math.random()<.2)m.burnTimer=3;m.aggro=true;m.combatTimer=12;if(s.ammo==='chain')m.slowTimer=3;if(s.ammo==='fire')m.burnTimer=SPECIAL_AMMO.fire.burnSeconds;m.hp-=hit;damageText(m.x,m.y,hit);burst(m.x,m.y);playHit();s.life=0;
          if(m.hp<=0)defeatMonster(m);
        }
      }
    }else if(state.invulnerable<=0&&dist(s,player)<22){s.hit=true;if(activeEliteShip==='phantom'&&Math.random()<.15){damageText(player.x,player.y,0);s.life=0;continue;}state.repairing=false;const taken=s.damage*bonus.taken*eliteIncomingFactor()*(abilityActive('shield')?SHIELD_FACTOR:1);state.hp-=taken;damageText(player.x,player.y,Math.round(taken));playHit(true);burst(player.x,player.y);s.life=0;if(state.hp<=0){if(activeEliteShip==='ragnarok'&&valhallaTimer>0){state.hp=1;}else respawn();}}
    if(s.life<=0)shots.splice(i,1);
  }
  updateLootChests(dt);updateArsenal(dt);updateEvents(dt);
  if(insideOwnLagoon(player)&&state.hp<effectiveMaxHp()){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*.06*dt);if(state.hp>=effectiveMaxHp())saveAccount();}
  updateJumpPrompt();updateCoordBadge();mapFade=Math.max(0,mapFade-dt*1.6);updateWeather(dt);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  let need=xpNeed(state.level);while(state.fame>=need){state.fame-=need;state.level++;state.maxHp+=20;state.hp=state.maxHp;state.pearls+=10;saveAccount();playLevelUp();rewardNotice(`SEVİYE ${state.level}   +20 Azami Gövde   +10 İnci   +1 Yetenek Puanı   ${state.level}/1 AÇILDI`);toast(`Seviye ${state.level}! Yeni denizler açıldı`);need=xpNeed(state.level);}
  if(state.level>=MAX_LEVEL)state.fame=Math.min(state.fame,0);
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui('toast').classList.remove('show');}if(rewardTimer>0){rewardTimer-=dt;if(rewardTimer<=0){ui('rewardToast').classList.remove('show');const next=rewardQueue.shift();if(next)setTimeout(()=>showReward(next),220);}} updateUI();
}

function sinkEnemy(e:Enemy){
  const j=enemies.indexOf(e);if(j<0)return;
  enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}
  burst(e.x,e.y,true);playExplosion();
  if(e.tower){destroyTower();return;}
  if(e.boss){burst(e.x,e.y,true);defeatBoss(e);return;}
  const battle=e.role==='heavy'?8:4,scale=1+.55*(e.tier-1);lootChests.push(createChest(e.role==='heavy'?'warship':'raider',e.x,e.y,bonus.gilded,scale));
  if(activeEliteShip==='bone'){soulStacks=Math.min(3,soulStacks+1);soulTimer=30;}const eliteLoot=activeEliteShip==='sovereign'?1.2:1;const bountyGold=Math.round(e.rewardGold*bonus.bounty);state.gold+=Math.round((e.rewardGold+bountyGold)*eliteLoot);state.wood+=e.rewardWood;state.fame+=e.rewardFame;state.battlePoints=Math.min(500,state.battlePoints+battle);saveAccount();
  rewardNotice(`+${e.rewardGold+bountyGold} Altın   +${e.rewardWood} Kereste   +${e.rewardFame} TP   +${battle} Savaş Puanı`);toast(`${e.name} batırıldı`);if(e.def)recordQuestProgress('npc',e.def.id);setTimeout(spawnEnemy,1800);
}
function defeatMonster(m:Monster){
  playExplosion();const d=m.def;
  if(activeEliteShip==='bone'){soulStacks=Math.min(3,soulStacks+1);soulTimer=30;}const eliteLoot=activeEliteShip==='sovereign'?1.2:1;state.gold+=Math.round(d.gold*eliteLoot);state.wood+=d.wood;state.fame+=d.xp;state.pearls+=Math.round(d.pearls*eliteLoot);state.elitePoints=Math.min(1500,state.elitePoints+10);state.battlePoints=Math.min(500,state.battlePoints+20);saveAccount();
  rewardNotice(`+${d.gold} Altın   +${d.pearls} İnci   +${d.xp} TP   +10 Elit Puan`);recordQuestProgress('monster',d.id);lootChests.push(createChest('monster',m.x,m.y,bonus.gilded,1+.5*(d.tier-1)));
  const p=randomSeaPoint(900);m.hp=m.maxHp;m.aggro=false;m.burnTimer=0;m.x=p.x;m.y=p.y;m.homeX=m.x;m.homeY=m.y;m.combatTimer=0;selected=null;state.attacking=false;toast(`${m.name} yenildi`);
}
function updateTower(e:Enemy,dt:number){
  const d=dist(e,player);e.cooldown-=dt;e.combatTimer=Math.max(0,e.combatTimer-dt);e.slowTimer=0;e.burnTimer=Math.max(0,(e.burnTimer??0));
  e.aggro=!mapDef().safe&&(d<(e.fireRange??460)+30||e.combatTimer>0);
  if(e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*(e.aggro?.004:.02)*(activeEliteShip==='plague'&&e.burnTimer&&e.burnTimer>0?.5:1)*dt);
  if(e.aggro&&d<(e.fireRange??460)&&e.cooldown<=0&&state.invulnerable<=0){const tx=e.x,ty=e.y-30,a=Math.atan2(player.y-ty,player.x-tx);
    for(const off of [-.05,.05])shots.push({x:tx,y:ty,vx:Math.cos(a+off)*320,vy:Math.sin(a+off)*320,life:2.2,owner:'enemy',damage:e.damage,hit:false,ammo:theme().fleet==='lava'?'fire':'iron'});
    playEnemyCannon(d,(e.x-player.x)/600);e.cooldown=e.reload+Math.random()*.4;}
}
function destroyTower(){
  towersDestroyedHere++;const left=enemies.filter(x=>x.tower).length,f=mapDef().fleet;
  toast(left?`${f.name}: ${left} kule kaldı`:`${f.name} düştü!`);
  if(left>0)return;
  fleetOwners[currentMap]='player';saveFleetOwners(fleetOwners);const r=fleetReward(mapDef().tier);state.gold+=r.gold;state.pearls+=r.pearls;state.fame+=r.xp;saveAccount();
  setupFleetIsland();rewardNotice(`${f.name.toLocaleUpperCase('tr')} FİLONA KATILDI   +${r.gold} Altın   +${r.pearls} İnci   +${r.xp} TP`);
}
function updateOwnTowers(dt:number){
  if(fleetOwner()!=='player')return;const t=fleetTower(mapDef().tier);
  for(const tw of ownTowers){tw.cooldown-=dt;if(tw.cooldown>0)continue;
    const target=enemies.filter(e=>!e.tower&&dist(e,tw)<t.range).sort((a,b)=>dist(a,tw)-dist(b,tw))[0]??monsters.find(m=>dist(m,tw)<t.range);
    if(!target)continue;tw.cooldown=t.reload;const a=Math.atan2(target.y-(tw.y-30),target.x-tw.x);
    shots.push({x:tw.x,y:tw.y-30,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:2.4,owner:'player',damage:t.ownDamage,hit:false,ammo:theme().fleet==='lava'?'fire':'iron',target});}
}
function spawnBoss(){
  const map=mapDef(),p=randomSeaPoint(800),tier=map.tier,hp=Math.round(BOSS.hp(tier));
  enemies.push({kind:'ship',role:'heavy',x:p.x,y:p.y,angle:Math.random()*6,boss:true,name:BOSS.name,hp,maxHp:hp,cooldown:1,damage:BOSS.damage(tier),reload:BOSS.reload,speed:BOSS.speed,hitRadius:BOSS.hitRadius,rewardGold:0,rewardWood:0,rewardFame:0,color:'#2f5a4a',tier,aggro:false,wander:0,slowTimer:0,homeX:p.x,homeY:p.y,combatTimer:0});
  toast(`${BOSS.name} ${map.name} sularında belirdi!`);rewardNotice(`ETKİNLİK   ${BOSS.name.toLocaleUpperCase('tr')} BELİRDİ`);
}
function bossFire(e:Enemy){
  const base=Math.atan2(player.y-e.y,player.x-e.x),enraged=e.hp<e.maxHp*BOSS.escortAt;playEnemyCannon(dist(e,player)*.6,(e.x-player.x)/600);
  for(const off of enraged?[-.24,-.12,0,.12,.24]:[-.15,0,.15])shots.push({x:e.x,y:e.y,vx:Math.cos(base+off)*280,vy:Math.sin(base+off)*280,life:2.2,owner:'enemy',damage:e.damage*(enraged?.8:1),hit:false,ammo:'iron'});
  e.cooldown=e.reload*(enraged?.8:1);
  if(enraged&&!e.summoned){e.summoned=true;const def=NPCS[mapDef().npcs[1]];for(let k=0;k<2;k++){const ship=makeShip(def,e.x+(k?60:-60),e.y+40,e.angle);ship.aggro=true;ship.combatTimer=20;ship.name='Hayalet Muhafız';enemies.push(ship);}toast('Hayalet Amiral muhafızlarını çağırdı!');}
}
function defeatBoss(e:Enemy){
  const r=BOSS.reward(e.tier);state.gold+=r.gold;state.pearls+=r.pearls;state.fame+=r.xp;state.elitePoints=Math.min(100,state.elitePoints+r.elite);state.battlePoints=Math.min(500,state.battlePoints+r.battle);saveAccount();
  for(let k=0;k<BOSS.chests;k++)lootChests.push(createChest('monster',e.x+(k-1)*40,e.y+(k%2)*30,bonus.gilded,1+.5*(e.tier-1)));
  bossNextAt=performance.now()+BOSS.intervalSeconds*1000;
  rewardNotice(`${BOSS.name.toLocaleUpperCase('tr')} BATIRILDI   +${r.gold} Altın   +${r.pearls} İnci   +${r.xp} TP`);toast(`${BOSS.name} denizin dibine gönderildi!`);
}
function updateEvents(dt:number){
  const map=mapDef(),boss=enemies.find(e=>e.boss);
  if(!map.safe&&!boss&&performance.now()>bossNextAt)spawnBoss();
  updateOwnTowers(dt);
  eventPanelClock-=dt;if(eventPanelClock>0)return;eventPanelClock=.25;
  const panel=ui('eventPanel'),rows:string[]=[],bossArt=`<i class="event-art" style="${portraitStyle(PORTRAIT_ATLAS,BOSS_PORTRAIT,PORTRAIT_COUNT,PORTRAIT_COLS)}"></i>`;
  if(boss)rows.push(`<button class="event-row boss" data-event-route="boss">${bossArt}<span><small>EFSANEVİ BOSS · ${Math.round(dist(boss,player))}m</small><strong>${boss.name}</strong><i><em style="width:${boss.hp/boss.maxHp*100}%"></em></i></span></button>`);
  else if(!map.safe)rows.push(`<div class="event-row">${bossArt}<span><small>YAKLAŞAN ETKİNLİK</small><strong>${BOSS.name}</strong><b>${formatClock(Math.max(0,(bossNextAt-performance.now())/1000))}</b></span></div>`);
  const owned=fleetOwner()==='player',left=enemies.filter(e=>e.tower).length;
  rows.push(`<button class="event-row fort ${owned?'owned':''}" data-event-route="fort"><i class="event-art fleet-art" style="background-image:url(${fleetBaseUrl(theme().fleet)})"></i><span><small>${owned?'FİLO ADAN · İÇERİDE ONARIM':`RAKİP FİLO ADASI · FİLO SAVAŞI GEREKİR`}</small><strong>${map.fleet.name}</strong>${owned?'':`<i class="danger"><em style="width:${left/FLEET.towers.length*100}%"></em></i>`}</span></button>`);
  panel.innerHTML=rows.join('');panel.classList.toggle('visible',rows.length>0);
  panel.querySelectorAll<HTMLButtonElement>('[data-event-route]').forEach(b=>b.onclick=()=>{const f=mapDef().fleet,target=b.dataset.eventRoute==='boss'?enemies.find(e=>e.boss):fleetOwner()==='player'?{x:f.x+FLEET.lagoon.x,y:f.y+FLEET.lagoon.y}:{x:f.x,y:f.y+FLEET.islandR+120};if(!target)return;routeTarget=navigablePoint({x:target.x,y:target.y});destination=routeVia(routeTarget);toast('Rota çizildi');});
}
function formatClock(sec:number){const m=Math.floor(sec/60),s2=Math.floor(sec%60);return`${m}:${String(s2).padStart(2,'0')}`;}
// Tema hava efektleri: ekran uzayında sürüklenen parçacıklar
function updateWeather(dt:number){
  const w=theme().weather,W=innerWidth,H=innerHeight;
  if(w==='storm'){lightning=Math.max(0,lightning-dt*2.5);if(Math.random()<dt*.08)lightning=1;}
  if(!w||w==='storm')return;
  const target=w==='fog'?14:w==='snow'?90:w==='embers'?60:w==='spores'?45:w==='motes'?50:w==='dust'?40:24;
  while(weatherParticles.length<target){const p={x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,r:1,a:1,life:0};
    if(w==='fog'){p.r=160+Math.random()*220;p.vx=8+Math.random()*10;p.a=.05+Math.random()*.05;}
    if(w==='snow'){p.r=1+Math.random()*2.2;p.vx=-14+Math.random()*10;p.vy=30+Math.random()*40;p.a=.5+Math.random()*.4;}
    if(w==='embers'){p.r=1+Math.random()*2;p.vx=-6+Math.random()*12;p.vy=-(18+Math.random()*30);p.a=.5+Math.random()*.5;}
    if(w==='spores'){p.r=1.5+Math.random()*2.5;p.vx=-8+Math.random()*16;p.vy=-4+Math.random()*8;p.a=.3+Math.random()*.4;}
    if(w==='motes'){p.r=1+Math.random()*2;p.vx=-5+Math.random()*10;p.vy=-10+Math.random()*6;p.a=.3+Math.random()*.5;}
    if(w==='dust'){p.r=1+Math.random()*1.5;p.vx=20+Math.random()*20;p.vy=-2+Math.random()*4;p.a=.2+Math.random()*.3;}
    if(w==='sparkle'){p.r=1+Math.random()*1.6;p.a=0;p.life=Math.random()*3;}
    weatherParticles.push(p);}
  for(const p of weatherParticles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life+=dt;
    if(p.x<-400)p.x+=W+800;if(p.x>W+400)p.x-=W+800;if(p.y<-40)p.y+=H+80;if(p.y>H+40)p.y-=H+80;}
}
function drawWeather(){
  const w=theme().weather,W=innerWidth,H=innerHeight,t=performance.now()/1000;
  if(w==='storm'){ctx.strokeStyle='#b9c8ff38';ctx.lineWidth=1.2;ctx.beginPath();for(let n=0;n<90;n++){const x=((n*137.5+t*260)%(W+80))-40,y=((n*71.3+t*820)%(H+60))-30;ctx.moveTo(x,y);ctx.lineTo(x-7,y+20);}ctx.stroke();if(lightning>0){ctx.fillStyle=`rgba(210,225,255,${lightning*.32})`;ctx.fillRect(0,0,W,H);}return;}
  const color={fog:'220,232,228',snow:'245,250,255',embers:'255,150,60',spores:'170,255,110',motes:'200,150,255',dust:'230,170,140',sparkle:'255,255,240'}[w as string];
  if(!color)return;
  for(const p of weatherParticles){
    if(w==='fog'){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(${color},${p.a})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);continue;}
    const a=w==='sparkle'?Math.max(0,Math.sin(p.life*2.2))*.8:p.a;ctx.fillStyle=`rgba(${color},${a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
  const tint={embers:'rgba(255,80,20,.07)',spores:'rgba(80,160,40,.06)',motes:'rgba(60,20,110,.12)',dust:'rgba(140,50,30,.06)',fog:'rgba(200,215,210,.05)'}[w as string];
  if(tint){ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);}
}
function activateEliteAbility(){
  if(eliteAbility.cooldown>0){toast(`${eliteShip().ability} ${Math.ceil(eliteAbility.cooldown)} sn sonra hazır`);return;}
  const needsTarget=['glacial','kraken','crimson','tempest','jade','void'].includes(activeEliteShip);
  if(needsTarget&&(!selected||!targetExists(selected))){toast('Bu yetenek için önce hedef seç');return;}
  eliteAbility.cooldown=45*bonus.cooldown;eliteAbility.active=0;
  const base=Math.max(30,state.cannon*4*(1+state.level*.04));
  if(activeEliteShip==='phantom'){eliteAbility.active=5;state.attacking=false;toast('Hayalet Formu: 5 saniye dokunulmazsın');}
  else if(activeEliteShip==='magma'){for(const t of [...enemies,...monsters])if(dist(t,player)<=360){t.hp-=base;t.burnTimer=3;t.aggro=true;t.combatTimer=12;damageText(t.x,t.y,base);burst(t.x,t.y,true);}toast('Lav Püskürtme!');}
  else if(activeEliteShip==='glacial'&&selected){selected.slowTimer=4;selected.aggro=true;selected.combatTimer=12;toast('Donma Dalgası: hedef %50 yavaşladı');}
  else if(activeEliteShip==='kraken'&&selected){selected.slowTimer=3;selected.aggro=true;selected.combatTimer=12;toast('Dokunaç Tuzağı: hedef durduruldu');}
  else if(activeEliteShip==='ironclad'){eliteAbility.active=5;player.cooldown=0;toast('Gülle Yağmuru: 5 saniye sıfır dolum');}
  else if(activeEliteShip==='crimson'&&selected){if(selected.hp/selected.maxHp>=.3){eliteAbility.cooldown=0;toast('Kan Hırsı için hedefin Canı %30 altında olmalı');return;}eliteAbility.active=10;toast('Kan Hırsı etkin!');}
  else if(activeEliteShip==='atlantean'){eliteAbility.active=6;state.invulnerable=Math.max(state.invulnerable,6);playShield();toast('Koruma Kubbesi: 6 saniye dokunulmazlık');}
  else if(activeEliteShip==='bone'){soulStacks=3;soulTimer=30;eliteAbility.active=30;toast('Ruh Hasadı: 3 hasar yükü');}
  else if(activeEliteShip==='tempest'&&selected){const chain=[selected,...[...enemies,...monsters].filter(t=>t!==selected&&dist(t,selected!)<260).sort((a,b)=>dist(a,selected!)-dist(b,selected!)).slice(0,2)];chain.forEach((t,i)=>{const hit=base*(1-i*.2);t.hp-=hit;t.aggro=true;t.combatTimer=12;damageText(t.x,t.y,hit);burst(t.x,t.y);});toast('Yıldırım Zinciri hedeflere sıçradı');}
  else if(activeEliteShip==='plague'){eliteAbility.active=10;for(const t of [...enemies,...monsters])if(dist(t,player)<330){t.slowTimer=10;t.burnTimer=10;t.aggro=true;t.combatTimer=12;}toast('Zehirli Sis yayıldı');}
  else if(activeEliteShip==='sovereign'){eliteAbility.active=10;toast("Kralın Emri: 10 saniye +%15 hasar");}
  else if(activeEliteShip==='shadow'){shadowReady=true;eliteAbility.active=8;toast('Gölge Formu: sonraki saldırı kesin kritik');}
  else if(activeEliteShip==='jade'&&selected){selected.slowTimer=4;selected.aggro=true;selected.combatTimer=12;toast('Havai Fişek Yağmuru hedefi kör etti');}
  else if(activeEliteShip==='ragnarok'){valhallaTimer=4;eliteAbility.active=4;toast('Valhalla Çağrısı: 4 saniye batmazsın');}
  else if(activeEliteShip==='void'&&selected){eliteAbility.active=3;for(const t of [...enemies,...monsters])if(dist(t,selected)<360){t.x+=(selected.x-t.x)*.55;t.y+=(selected.y-t.y)*.55;t.hp-=base*.8;t.aggro=true;t.combatTimer=12;damageText(t.x,t.y,base*.8);}toast('Tekillik düşmanları merkeze çekti');}
  playShield();
}
function activateAbility(id:'speed'|'shield'){
  const t=abilityTimers[id],a=ABILITIES[id];
  if(t.cooldown>0){toast(`${a.name} ${Math.ceil(t.cooldown)} sn sonra hazır`);return;}
  t.active=a.duration;t.cooldown=a.cooldown*bonus.cooldown*(activeEliteShip==='atlantean'&&id==='shield'?.666:1);toast(`${a.name} etkin`);if(id==='speed')playWind();else playShield();
  if(id==='speed')for(let n=0;n<10;n++)particles.push({x:player.x+(Math.random()-.5)*30,y:player.y+(Math.random()-.5)*30,vx:-Math.sin(player.angle)*60,vy:Math.cos(player.angle)*60,life:.6,maxLife:.6,kind:'foam'});
}
function dropMine(){
  const t=abilityTimers.mine;
  if(mapDef().safe){toast('Güvenli sularda mayın bırakılamaz');return;}
  if(arsenal.mine<=0){toast('Deniz mayını kalmadı — marketten alabilirsin');return;}
  if(t.cooldown>0){toast(`Mayın ${Math.ceil(t.cooldown)} sn sonra hazır`);return;}
  if(mines.length>=MINE.maxActive){toast(`Aynı anda en fazla ${MINE.maxActive} mayın`);return;}
  arsenal.mine-=1;saveArsenal(arsenal);renderQuickSlots();t.cooldown=ABILITIES.mine.cooldown*bonus.cooldown;
  playSplash();mines.push({x:player.x-Math.sin(player.angle)*42,y:player.y+Math.cos(player.angle)*42,life:ABILITIES.mine.duration,arm:MINE.armSeconds});toast('Mayın bırakıldı');
}
function detonateMine(index:number){
  const mine=mines[index];mines.splice(index,1);playExplosion();burst(mine.x,mine.y,true);burst(mine.x,mine.y,true);
  const damage=Math.round((MINE.baseDamage+state.level*MINE.damagePerLevel)*bonus.mine);
  for(const e of [...enemies])if(dist(e,mine)<MINE.blastRadius){e.aggro=true;e.combatTimer=12;e.hp-=damage;damageText(e.x,e.y,damage);if(e.hp<=0)sinkEnemy(e);}
  for(const m of monsters)if(dist(m,mine)<MINE.blastRadius+m.radius*.5){m.aggro=true;m.combatTimer=12;m.hp-=damage;damageText(m.x,m.y,damage);if(m.hp<=0)defeatMonster(m);}
}
function updateArsenal(dt:number){
  for(const t of Object.values(abilityTimers)){t.active=Math.max(0,t.active-dt);t.cooldown=Math.max(0,t.cooldown-dt);}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.life-=dt;m.arm=Math.max(0,m.arm-dt);if(m.life<=0){mines.splice(i,1);continue;}
    if(m.arm<=0&&(enemies.some(e=>dist(e,m)<MINE.triggerRadius)||monsters.some(x=>dist(x,m)<MINE.triggerRadius+x.radius*.6)))detonateMine(i);}
  const burnDps=(SPECIAL_AMMO.fire.burnDps+state.level*.5)*bonus.burn;
  for(const e of [...enemies])if(e.burnTimer&&e.burnTimer>0){e.burnTimer-=dt;e.hp-=burnDps*dt;if(Math.random()<dt*14)particles.push({x:e.x+(Math.random()-.5)*26,y:e.y+(Math.random()-.5)*20,vx:0,vy:-22,life:.5,maxLife:.5,kind:'spark'});if(e.hp<=0)sinkEnemy(e);}
  for(const m of monsters)if(m.burnTimer&&m.burnTimer>0){m.burnTimer-=dt;m.hp-=burnDps*dt;if(Math.random()<dt*14)particles.push({x:m.x+(Math.random()-.5)*40,y:m.y+(Math.random()-.5)*30,vx:0,vy:-22,life:.5,maxLife:.5,kind:'spark'});if(m.hp<=0)defeatMonster(m);}
  for(const id of ['speed','shield','mine'] as AbilityId[]){const t=abilityTimers[id],button=document.getElementById(`ability-${id}`);if(!button)continue;
    const cd=Math.min(1,t.cooldown/(ABILITIES[id].cooldown*bonus.cooldown)),label=t.active>0&&id!=='mine'?`${Math.ceil(t.active)} SN`:t.cooldown>0?`${Math.ceil(t.cooldown)}`:id==='mine'?`${arsenal.mine} · ${ABILITIES.mine.key}`:ABILITIES[id].key;
    button.style.setProperty('--cd',cd.toFixed(3));button.classList.toggle('active',t.active>0&&id!=='mine');const small=button.querySelector('small');if(small&&small.textContent!==label)small.textContent=label;}
}
function updateLootChests(dt:number){
  for(let i=lootChests.length-1;i>=0;i--){const c=lootChests[i];c.life-=dt;
    if(dist(c,player)<CHEST_PICKUP_RADIUS){lootChests.splice(i,1);playCoins();recordQuestProgress('chest','any');c.gold=Math.round(c.gold*bonus.chestGold);state.gold+=c.gold;state.wood+=c.wood;state.chainAmmo+=c.chain;state.pearls+=c.pearls;saveAccount();renderQuickSlots();burst(c.x,c.y);rewardNotice(chestRewardText(c));toast(c.kind==='gilded'?'Yaldızlı sandık toplandı!':'Ganimet sandığı toplandı');if(destination&&Math.hypot(destination.x-c.x,destination.y-c.y)<2)destination=null;continue;}
    if(c.life<=0)lootChests.splice(i,1);}
  driftClock-=dt;
  if(driftClock<=0){driftClock=DRIFT_RESPAWN_SECONDS;if(lootChests.filter(c=>c.source==='drift').length<4){const p=randomSeaPoint(260);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(mapDef().tier-1)));}}
}
function drawLootChest(c:LootChest){const s=worldToScreen(c),fading=c.life<6?(Math.floor(c.life*4)%2?.35:.85):1;drawChestSprite(ctx,c.kind,s.x,s.y,performance.now(),fading);}
// Harita kenarı: komşu deniz varsa parıldayan geçiş şeridi, yoksa sis duvarı
function drawMapEdges(){
  const t=performance.now()/1000;
  for(const dir of ['north','south','east','west'] as Dir[]){const to=neighbor(currentMap,dir),open=!!to&&state.level>=MAPS[to].tier;
    const a=worldToScreen({x:0,y:0}),b=worldToScreen({x:WORLD,y:WORLD});const band=EDGE;
    const x0=dir==='east'?b.x-band:a.x,y0=dir==='south'?b.y-band:a.y,wd=dir==='east'||dir==='west'?band:b.x-a.x,ht=dir==='north'||dir==='south'?band:b.y-a.y;
    const g=dir==='north'?ctx.createLinearGradient(0,y0,0,y0+band):dir==='south'?ctx.createLinearGradient(0,y0+band,0,y0):dir==='west'?ctx.createLinearGradient(x0,0,x0+band,0):ctx.createLinearGradient(x0+band,0,x0,0);
    const c=!to?'8,18,22':open?'111,214,196':'224,122,95',al=!to?.55:.22+Math.sin(t*2)*.06;g.addColorStop(0,`rgba(${c},${al})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(x0,y0,wd,ht);}
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
  if(eliteAtlasImage.complete&&eliteAtlasImage.naturalWidth){const index=eliteShip().level-1,col=index%5,row=Math.floor(index/5),bob=Math.sin(performance.now()/420)*1.8;ctx.save();ctx.translate(s.x,s.y+bob);ctx.rotate(player.angle+Math.PI/4);ctx.globalAlpha=state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1;ctx.shadowColor='#000b';ctx.shadowBlur=13;ctx.drawImage(eliteAtlasImage,col*300,row*300,300,300,-58,-58,116,116);ctx.restore();return;}

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
function drawIsland(i:WorldIsland){const s=worldToScreen(i);if(drawIslandSprite(ctx,i,s.x,s.y)){ctx.fillStyle='#e8dcb8';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='600 12px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.9);ctx.shadowBlur=0;return;}const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,i.r);g.addColorStop(0,'#617c4e');g.addColorStop(.5,'#3c593e');g.addColorStop(.66,'#b9a16b');g.addColorStop(.72,'#17434a');g.addColorStop(1,'#0b2b35');ctx.fillStyle=g;ctx.beginPath();for(let n=0;n<18;n++){const a=n/18*Math.PI*2,r=i.r*(.78+Math.sin(n*4.7)*.09);const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();for(let n=0;n<7;n++){const a=n*2.1,r=i.r*.38;ctx.fillStyle='#213c2d';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,7+n%3*2,0,7);ctx.fill();}ctx.fillStyle='#d7c697';ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.76);}
function drawMonster(m:Monster){const s=worldToScreen(m);if(drawMonsterSheet(ctx,m.def,s.x,s.y,m.phase)){ctx.fillStyle=theme().label;ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-m.radius-18);ctx.shadowBlur=0;if(m.hp<m.maxHp){ctx.fillStyle='#07161c';ctx.fillRect(s.x-30,s.y-m.radius-12,60,5);ctx.fillStyle='#b070ff';ctx.fillRect(s.x-30,s.y-m.radius-12,60*m.hp/m.maxHp,5);}return;}ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#477f72';ctx.lineWidth=9;ctx.lineCap='round';for(let n=0;n<6;n++){const a=n/6*Math.PI*2+m.phase*.12;ctx.beginPath();ctx.moveTo(Math.cos(a)*12,Math.sin(a)*12);ctx.quadraticCurveTo(Math.cos(a+.5)*50,Math.sin(a+.5)*50,Math.cos(a+Math.sin(m.phase+n)*.35)*m.radius,Math.sin(a+Math.sin(m.phase+n)*.35)*m.radius);ctx.stroke();}ctx.fillStyle='#38675f';ctx.beginPath();ctx.arc(0,0,25,0,7);ctx.fill();ctx.fillStyle='#d5cc71';ctx.beginPath();ctx.arc(-8,-5,4,0,7);ctx.arc(8,-5,4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#89b0a8';ctx.font='600 10px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-66);}
function drawFleetIsland(){
  const f=mapDef().fleet,s=worldToScreen(f),th=theme().fleet,owned=fleetOwner()==='player';
  if(!drawFleetBase(ctx,th,s.x,s.y)){ctx.fillStyle='#4a7a3c';ctx.beginPath();ctx.arc(s.x,s.y,FLEET.islandR,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3a3c42';ctx.lineWidth=18;ctx.beginPath();ctx.arc(s.x,s.y,FLEET.wallR,Math.PI/2+FLEET.gap/2,Math.PI/2-FLEET.gap/2+Math.PI*2);ctx.stroke();}
  if(owned)for(const tw of ownTowers){const p=worldToScreen(tw);drawFleetTower(ctx,th,'player',p.x,p.y);}
  ctx.textAlign='center';ctx.font='700 14px Cinzel';ctx.fillStyle=owned?'#9fe8dc':'#f0b8a8';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.name,s.x,s.y-FLEET.islandR-24);ctx.font='700 9px Inter';ctx.fillText(owned?'FİLO ADAN · LAGÜNDE ONARIM':'RAKİP FİLO · GİRİŞ YASAK',s.x,s.y-FLEET.islandR-10);ctx.shadowBlur=0;
}
function draw(){
  const w=innerWidth,h=innerHeight,map=mapDef(),th=theme();const sea=ctx.createLinearGradient(0,0,0,h);sea.addColorStop(0,th.sea[0]);sea.addColorStop(1,th.sea[1]);ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-w/2,-h/2);
  const pattern=seaTilePattern(ctx);if(pattern){const vw=w/camera.zoom,vh=h/camera.zoom;pattern.setTransform(new DOMMatrix().translateSelf(-camera.x+w/2+Math.sin(performance.now()/5200)*14,-camera.y+h/2+performance.now()/260%1024).scaleSelf(2,2));ctx.globalAlpha=.2;ctx.fillStyle=pattern;ctx.fillRect(w/2-vw/2,h/2-vh/2,vw,vh);ctx.globalAlpha=1;}
  ctx.globalAlpha=.12;ctx.fillStyle=th.label;ctx.font='700 42px Cinzel';ctx.textAlign='center';for(const label of map.labels){const p=worldToScreen(label);ctx.fillText(label.text,p.x,p.y);}ctx.globalAlpha=1;
  drawCoordGrid();drawMapEdges();islands.forEach(drawIsland);drawFleetIsland();lootChests.forEach(drawLootChest);mines.forEach(m=>{const p=worldToScreen(m);drawMineSprite(ctx,p.x,p.y,performance.now(),m.arm>0,m.life<5);});monsters.forEach(drawMonster);
  particles.forEach(p=>{const s=worldToScreen(p),a=Math.max(0,p.life/p.maxLife);ctx.globalAlpha=a;if(p.kind==='damage'){ctx.fillStyle='#ffd878';ctx.font='700 14px Inter';ctx.textAlign='center';ctx.fillText(p.text||'',s.x,s.y);}else{ctx.fillStyle=p.kind==='foam'?'#b9e2df':p.kind==='spark'?'#ffb340':'#3f4545';ctx.beginPath();ctx.arc(s.x,s.y,p.kind==='smoke'?7*(1-a)+3:p.kind==='foam'?4:2,0,7);ctx.fill();}ctx.globalAlpha=1;});
  shots.forEach(s=>{const p=worldToScreen(s);ctx.fillStyle=s.owner==='player'?(s.ammo==='fire'?'#ff8a2a':s.ammo==='grape'?'#d8d2c0':'#ffd889'):'#ff7450';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();ctx.shadowBlur=0;});
  [...enemies].sort((a,b)=>a.y-b.y).forEach(e=>{const s=worldToScreen(e),raster=e.tower?drawFleetTower(ctx,th.fleet,'npc',s.x,s.y):e.boss?drawBossSprite(ctx,s.x,s.y,e.angle,performance.now()):e.def?drawNpcShip(ctx,e.def.sprite,e.def.span,s.x,s.y,e.angle,performance.now()):false;if(!raster)drawShip(e,e.angle,e.color);const top=raster?(e.tower?TOWER_LABEL_OFFSET:e.boss?BOSS_LABEL_OFFSET:shipLabelOffset(e.def!.span)):-42;ctx.fillStyle='#07161c';ctx.fillRect(s.x-25,s.y+top,50,5);ctx.fillStyle=e.tower?'#e0823f':e.role==='heavy'?'#e04b3f':'#50a8b4';ctx.fillRect(s.x-25,s.y+top,50*e.hp/e.maxHp,5);ctx.fillStyle='#d7cbb5';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(e.name,s.x,s.y+top-7);});
  if(selected&&targetExists(selected)){const t=worldToScreen(selected);ctx.strokeStyle='#f1c662';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,selected.kind==='monster'?selected.radius+10:34,0,7);ctx.stroke();}
  drawPlayerShip();
  if(abilityActive('shield')){const p=worldToScreen(player),t=performance.now()/1000,g=ctx.createRadialGradient(p.x,p.y,30,p.x,p.y,62);g.addColorStop(0,'#9fe8ff00');g.addColorStop(.75,'#9fe8ff30');g.addColorStop(1,'#d4a64c88');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,62,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(212,166,76,${.55+Math.sin(t*6)*.25})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,62,0,Math.PI*2);ctx.stroke();}
  if(destination){const d=worldToScreen(destination),p=worldToScreen(player);ctx.strokeStyle='#e7cf8d55';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(d.x,d.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e7cf8d';ctx.beginPath();ctx.arc(d.x,d.y,9,0,7);ctx.stroke();}
  const ps=worldToScreen(player);ctx.strokeStyle=selected?'#e8cf934d':'#e8cf9328';ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(ps.x,ps.y,selected?effectiveRange():115,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
  drawWeather();drawCoordRulers();
  if(mapFade>0){ctx.fillStyle=`rgba(2,10,14,${Math.min(1,mapFade)})`;ctx.fillRect(0,0,w,h);}
  drawMinimap();
}
// Koordinat ızgarası: dünya içinde soluk çizgiler, ekran kenarında kamerayı izleyen cetveller.
function drawCoordGrid(){
  const a=worldToScreen({x:0,y:0});ctx.strokeStyle='rgba(210,240,235,.055)';ctx.lineWidth=1;ctx.beginPath();
  for(let c=1;c<GRID_COLS;c++){const x=a.x+c*CELL_W;ctx.moveTo(x,a.y);ctx.lineTo(x,a.y+WORLD);}
  for(let r=1;r<GRID_ROWS;r++){const y=a.y+r*CELL_H;ctx.moveTo(a.x,y);ctx.lineTo(a.x+WORLD,y);}
  ctx.stroke();
}
let rulerTop=0;
function measureRulerTop(){const nav=document.querySelector('.top-shortcuts')?.getBoundingClientRect();rulerTop=nav&&nav.height?Math.round(nav.bottom+4):0;}
addEventListener('resize',measureRulerTop);measureRulerTop();setTimeout(measureRulerTop,600);document.fonts?.ready.then(measureRulerTop);
function drawCoordRulers(){
  const w=innerWidth,h=innerHeight,z=camera.zoom,T=16,L=26,top=rulerTop,here=gridCell(player);
  const sx=(x:number)=>w/2+(x-camera.x)*z,sy=(y:number)=>h/2+(y-camera.y)*z;
  ctx.save();ctx.fillStyle='rgba(4,16,20,.62)';ctx.fillRect(L,top,w-L,T);ctx.fillRect(0,top,L,h-top);
  ctx.fillStyle='rgba(215,190,130,.35)';ctx.fillRect(L,top+T-1,w-L,1);ctx.fillRect(L-1,top+T,1,h-top-T);
  ctx.font='700 9px Inter';ctx.textAlign='center';ctx.textBaseline='middle';
  const c0=Math.max(0,Math.floor((camera.x-w/2/z)/CELL_W)),c1=Math.min(GRID_COLS-1,Math.ceil((camera.x+w/2/z)/CELL_W));
  for(let c=c0;c<=c1;c++){const x=sx((c+.5)*CELL_W);if(x<L+8||x>w-6)continue;const cur=c===here.c;
    if(cur){ctx.fillStyle='rgba(241,198,98,.28)';ctx.fillRect(sx(c*CELL_W),top,CELL_W*z,T-1);}
    ctx.fillStyle=cur?'#ffd98a':'#b9cfc9';ctx.fillText(colName(c),x,top+T/2);
    ctx.fillStyle='rgba(185,207,201,.35)';ctx.fillRect(Math.round(sx(c*CELL_W)),top+T-4,1,3);}
  const r0=Math.max(0,Math.floor((camera.y-h/2/z)/CELL_H)),r1=Math.min(GRID_ROWS-1,Math.ceil((camera.y+h/2/z)/CELL_H));
  for(let r=r0;r<=r1;r++){const y=sy((r+.5)*CELL_H);if(y<top+T+6||y>h-4)continue;const cur=r===here.r;
    if(cur){ctx.fillStyle='rgba(241,198,98,.28)';ctx.fillRect(0,sy(r*CELL_H),L-1,CELL_H*z);}
    ctx.fillStyle=cur?'#ffd98a':'#b9cfc9';ctx.fillText(rowName(r),L/2,y);
    ctx.fillStyle='rgba(185,207,201,.35)';ctx.fillRect(L-4,Math.round(sy(r*CELL_H)),3,1);}
  ctx.fillStyle='rgba(4,16,20,.9)';ctx.fillRect(0,top,L,T);ctx.fillStyle='#d4a64c';ctx.font='700 8px Inter';ctx.fillText('◎',L/2,top+T/2);
  ctx.restore();
}
let lastCoord='';
function updateCoordBadge(){const text=`${currentMap} - ${coordLabel(player)}`;if(text!==lastCoord){lastCoord=text;ui('mapCoord').textContent=text;}}
function drawMinimap(){const W=170,H=125,sx=(x:number)=>x/WORLD*W,sy=(y:number)=>y/WORLD*H,th=theme();
  mini.fillStyle=th.sea[1];mini.fillRect(0,0,W,H);mini.strokeStyle='#9fc2bd22';mini.strokeRect(.5,.5,W-1,H-1);
  for(const dir of ['north','south','east','west'] as Dir[]){const to=neighbor(currentMap,dir);if(!to)continue;mini.fillStyle=state.level>=MAPS[to].tier?'#6fd6c4aa':'#e07a5f88';if(dir==='north')mini.fillRect(W/2-14,0,28,2);if(dir==='south')mini.fillRect(W/2-14,H-2,28,2);if(dir==='west')mini.fillRect(0,H/2-12,2,24);if(dir==='east')mini.fillRect(W-2,H/2-12,2,24);}
  for(const i of islands){mini.fillStyle='#536d4b';mini.beginPath();mini.arc(sx(i.x),sy(i.y),Math.max(3,i.r/WORLD*W),0,7);mini.fill();}
  const f=mapDef().fleet,owned=fleetOwner()==='player';mini.strokeStyle=owned?'#3fd6c0':'#e0523f';mini.lineWidth=2.5;mini.beginPath();mini.arc(sx(f.x),sy(f.y),FLEET.wallR/WORLD*W,Math.PI/2+FLEET.gap/2,Math.PI*2.5-FLEET.gap/2);mini.stroke();mini.globalAlpha=.25;mini.fillStyle=mini.strokeStyle;mini.beginPath();mini.arc(sx(f.x),sy(f.y),FLEET.islandR/WORLD*W,0,7);mini.fill();mini.globalAlpha=1;mini.fillStyle=mini.strokeStyle;mini.beginPath();mini.arc(sx(f.x),sy(f.y),2.5,0,7);mini.fill();
  for(const m of monsters){mini.fillStyle='#b070ff';mini.beginPath();mini.arc(sx(m.x),sy(m.y),2.5,0,7);mini.fill();}
  for(const c of lootChests){mini.fillStyle=c.kind==='gilded'?'#ffd46b':'#d9a95b';mini.fillRect(sx(c.x)-1,sy(c.y)-1,2,2);}
  for(const e of enemies){if(e.tower)continue;mini.fillStyle=e.boss?'#8dffd0':'#c34e3d';mini.fillRect(sx(e.x)-1,sy(e.y)-1,e.boss?4:3,e.boss?4:3);}
  mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(sx(player.x),sy(player.y),3,0,7);mini.fill();}
let last=performance.now();function loop(now:number){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}renderQuickSlots();updateUI();requestAnimationFrame(loop);
// Yalnızca geliştirme sunucusunda: tarayıcı testleri için durum erişimi.
if(import.meta.env.DEV)(window as any).__ky={state,player,camera,enemies,monsters,respawn,enterMap,mapDef,fleetOwner,get destination(){return destination;}};

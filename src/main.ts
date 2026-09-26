import './storageMigration';
import './style.css';
import {ACTIONS,loadSettings,saveSettings,keyLabel,normalizeKey,DEFAULT_BINDS,type ActionId} from './settings';
import {playBossMusic,stopBossMusic,playBossHorn,setAudio,unlockAudio,playCannon,playEnemyCannon,playHit,playExplosion,playCoins,playWind,playShield,playSplash,playLevelUp,playMapJump,playSink,playHeal,playClick} from './audio';
import {drawSeaSparkle,drawNpcShip,drawMonsterSheet,drawChestSprite,drawIslandSprite,drawFleetBase,drawBastion,drawBuiltTower,drawMineSprite,seaTilePattern,islandSheetUrl,shipLabelOffset,portraitStyle,preload,fleetBaseUrl,fleetTowerUrl,TOWER_LABEL_OFFSET} from './sprites';
import {MAPS,GRID,THEMES,NPCS,MONSTERS,QUESTS,QUEST_COOLDOWN_MS,FLEET,WORLD_WIDTH,WORLD_HEIGHT,MAX_LEVEL,xpNeed,neighbor,bossFor,BOSS_KILLS,BOSS_ATLAS,BOSS_ATLAS_COLS,MAP_KEYS,type BossDef,tierOf,fleetTower,fleetReward,PORTRAIT_COUNT,PORTRAIT_COLS,PORTRAIT_ATLAS,GRID_COLS,GRID_ROWS,CELL_W,CELL_H,colName,rowName,gridCell,coordLabel,type MapKey,type WorldIsland,type NpcDef,type MonsterDef,type Dir,type QuestDef} from './campaign';
import {ACHIEVEMENTS,loadAchievements,saveAchievements,unlockReached,achievementBonus,bonusText,badgeStyle,type AchStat} from './achievements';
import {loadDaily,saveDaily,dailyStatus,claimDaily,dailyReward,type DailyReward} from './daily';
import {TREASURE_PARTS,PART_CHANCE,DIG_RADIUS,DIG_SECONDS,TREASURE_ICON,loadTreasure,saveTreasure,treasureReward} from './treasure';
import {EQUIPMENT,EQUIP_SLOTS,RARITY_NAMES,equipById,equipStatText,equipTotals,equipIconStyle,type EquipSlot} from './equipment';
import {BALL_DAMAGE,CHAIN_FACTOR,FIRE_DOT_SHARE,ELITE_POINTS_PER_BALL,ELITE_MAX_LEVEL,eliteLevelEp,eliteLevelFromEp,ABILITIES,SPECIAL_AMMO,MINE,SPEED_BOOST,CONSUMABLES,AMMO_PRICES,SUPPLY_PRICES,loadArsenal,saveArsenal,type AbilityId,type SpecialAmmo,type ConsumableId,type SupplyId,type Price,priceOf} from './arsenal';
import {loadFleetOwners,saveFleetOwners} from './conquest';
import {TALENTS,OFFICERS,OFFICER_MAX_RANK,officerCost,officerSlots,talentPoints,loadCrew,saveCrew,spentPoints,computeBonus,type TalentId,type OfficerId} from './crew';
import {FLEET_MASK} from './fleetMask';
import {drawVfx,drawVfxAnim,EXPLOSION_ROW,SPLASH_ROW} from './vfx';
import {towerContains,towerMuzzle} from './towerGeometry';
import {loadGuild,saveGuild,islandSlots,towerTypeCost,tagError,canBuild,TOWER_TYPES,ROLE_NAMES,TOWER_SLOTS,type TowerType,type GuildRole,GUILD_NAME_MAX,GUILD_TAG_MAX,type Guild} from './guild';
import {loadProfile,saveProfile,nickError,rankOf,NICK_CHANGE_COST,NICK_COOLDOWN_MS,NICK_MAX} from './profile';
import {createChest,chestRewardText,CHEST_PICKUP_RADIUS,CHEST_CLICK_RADIUS,DRIFT_RESPAWN_SECONDS,type LootChest} from './loot';
import {ELITE_SHIPS,eliteById,eliteDirFrame,type EliteShipId} from './elite-ships';
import {SPECIAL_SHIPS,specialById,specialFacing} from './special-ships';
import {spawnLightning,spawnFrost,spawnMeteor,spawnLavaPool,spawnTentacles,spawnSteam,spawnBloodMoon,spawnDome,spawnRipple,spawnScythe,spawnSoul,spawnBanner,spawnCoins,spawnBreath,spawnRage,spawnText,spawnVortex,spawnCoral,spawnSun,spawnBlind,screenTint,updateAbilityFx,drawAbilityFxUnder,drawAbilityFx} from './abilityFx';

type Vec = { x: number; y: number };
type AmmoKind = 'iron'|'chain'|SpecialAmmo;
const isSpecial=(a:string):a is SpecialAmmo=>a in SPECIAL_AMMO;
type CannonKind = 'cast'|'long'|'rapid'|'heavy';
type CannonStock=Record<CannonKind,number>;
type Shot = Vec & { vx:number; vy:number; life:number; owner:'player'|'enemy'; damage:number; hit:boolean; ammo:AmmoKind; target?:Target; slow?:number; splash?:number; visual?:'spit'; age?:number; flight?:number; arc?:number; trail?:number };
type SalvoRound = { delay:number; target:Target; side:number; slot:number; damage:number; ammo:AmmoKind };
type EnemyRole='light'|'heavy';
type Enemy = Vec & { kind:'ship'; frozen?:number; def?:NpcDef; boss?:BossDef; summoned?:boolean; escortsCalled?:boolean; burnTimer?:number; burnDps?:number; tower?:boolean; towerIndex?:number;  hitRadius?:number; fireRange?:number; rewardXp?:number; role:EnemyRole; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; damage:number; reload:number; rewardGold:number; rewardFame:number; color:string; name:string; tier:number; aggro:boolean; wander:number; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type ParticleKind='foam'|'smoke'|'spark'|'damage'|'flash'|'explosion'|'splash'|'splinter'|'bubble'|'plank'|'firePuff'|'target'|'poison'|'soul'|'shock';
// z: su üstünden yükseklik (ekranda yukarı kayar); vz ile savrulan parçalar suya düşer
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:ParticleKind; text?:string; z?:number; vz?:number; rot?:number; vr?:number; size?:number; variant?:number };
type Wreck = Vec & { angle:number; sprite:string; span:number; t:number; bubble:number };
type Monster = Vec & { kind:'monster'; frozen?:number; def:MonsterDef; burnTimer?:number; burnDps?:number; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Target = Enemy|Monster;
type UpgradeKind = 'hull'|'damage'|'range'|'reload'|'speed'|'repair';
type QuickItemId = 'iron'|'chain'|SpecialAmmo|'mine'|'powder'|'shield'|'repairkit'|'speed';
type ShipSelection='starter'|EliteShipId;
const ELITE_ONE_PRICE=250;
const ELITE_TEST_MODE=true;
const CANNONS:Record<CannonKind,{name:string;damage:number;range:number;reload:number}>={
  cast:{name:'Döküm',damage:1,range:390,reload:1.65},
  long:{name:'Uzun',damage:.82,range:470,reload:2.05},
  rapid:{name:'Seri',damage:.68,range:340,reload:1.05},
  heavy:{name:'Ağır',damage:1.38,range:365,reload:2.65}
};
const UPGRADES:Record<UpgradeKind,{name:string;description:string;effect:string;pearls:number}>={
  hull:{name:'Güçlendirilmiş Gövde',description:'Geminin azami gövde dayanıklılığını artırır.',effect:'+2.500 gövde · +5 top yuvası',pearls:8},
  damage:{name:'Top Güvertesi',description:'Her borda atışının verdiği hasarı artırır.',effect:'+%11 hasar',pearls:10},
  range:{name:'Uzun Namlular',description:'Tüm top türlerinin etkili menzilini artırır.',effect:'+18 menzil',pearls:9},
  reload:{name:'Tecrübeli Topçular',description:'Topların yeniden dolma süresini azaltır.',effect:'-%4 dolum',pearls:12},
  speed:{name:'Yeni Yelken Takımı',description:'Geminin ulaşabileceği azami hızı artırır.',effect:'+5 hız',pearls:9},
  repair:{name:'Usta Marangozlar',description:'Açık denizde yapılan tamirin hızını artırır.',effect:'+%0,8/sn',pearls:7}
};
const QUICK_ITEMS:Record<QuickItemId,{name:string;icon:string;category:'ammo'|'consumable';description:string}>={
  iron:{name:'Demir Gülle',icon:'iron',category:'ammo',description:'Standart ve sınırsız top güllesi.'},chain:{name:'Zincir Güllesi',icon:'chain',category:'ammo',description:'Hedefi 3 saniye yavaşlatır.'},
  fire:{name:'Ateş Güllesi',icon:'damage',category:'ammo',description:'Hedefi 4 saniye yakar.'},grape:{name:'Saçma',icon:'iron',category:'ammo',description:'Kısa menzil, çok yüksek hasar.'},
  explosive:{name:'Patlayıcı Gülle',icon:'damage',category:'ammo',description:'Alan hasarı: çevredeki düşmanlara %50.'},breaker:{name:'Kule Kırıcı',icon:'iron',category:'ammo',description:'Kulelere 2,6 kat hasar.'},leech:{name:'Can Emici',icon:'damage',category:'ammo',description:'Hasarın %25\'i kadar onarır.'},
  repairkit:{name:'Tamir Sandığı',icon:'repairkit',category:'consumable',description:'Açık deniz tamirini başlatır.'},speed:{name:'Rüzgâr İksiri',icon:'speed',category:'consumable',description:'Rüzgâr Hamlesi: 7 sn boyunca %55 hız.'},
  powder:{name:'Kara Barut',icon:'damage',category:'consumable',description:CONSUMABLES.powder.description},shield:{name:'Kalkan',icon:'hull',category:'consumable',description:CONSUMABLES.shield.description},mine:{name:'Deniz Mayını',icon:'hull',category:'consumable',description:'Kıçtan mayın bırakır.'}
};
const AMMO_ROW=6;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="corner-buttons"><button class="round-button" id="openShop" aria-label="Market"><img src="/assets/icon-market-v1.webp" alt="" draggable="false"/></button><button class="round-button" id="openMenu" aria-label="Menü"><img src="/assets/icon-menu-v1.webp" alt="" draggable="false"/></button></div>
      <nav class="shop-tabs" id="shopTabs"><button id="openEliteShips" data-shop="eliteShipOverlay"><img class="nav-img" id="shipNavIcon" alt="" draggable="false"/><span>TERSANE</span></button><button id="openEquipShop" data-shop="equipShopOverlay"><i class="nav-img equip-nav"></i><span>DONANIM</span></button><button id="openCannonShop" data-shop="cannonShopOverlay"><img class="nav-img" src="/assets/gunner-vignette-v1.webp" alt="" draggable="false"/><span>TOPLAR</span></button><button id="openShip" data-shop="shipOverlay"><img class="nav-img" src="/assets/icon-inventory-v2.webp" alt="" draggable="false"/><span>ENVANTER</span></button><button id="openMarket" data-shop="marketOverlay"><img class="nav-img" src="/assets/ammo-fire-v2.webp" alt="" draggable="false"/><span>GÜLLELER</span></button><button id="openLoadoutTab" data-shop="supplyOverlay"><img class="nav-img" src="/assets/icon-chest-v1.webp" alt="" draggable="false"/><span>MALZEMELER</span></button><button class="shop-close" id="closeShopTabs" aria-label="Marketi kapat">×</button></nav>
      <div class="captain-overlay menu-overlay" id="menuOverlay"><section class="captain-profile menu-window"><header><div><span class="eyebrow">Kaptan köşkü</span><h2>MENÜ</h2></div><button id="closeMenu" aria-label="Menüyü kapat">×</button></header><div class="menu-grid"><button id="openCaptain"><img src="/assets/captain-bust-v1.webp" alt="" draggable="false"/><span>KAPTAN PROFİLİ</span></button><button id="openGuild"><i class="nav-img guild-nav"></i><span>FİLO</span></button><button id="openDevelopment"><img src="/assets/icon-anvil-v1.webp" alt="" draggable="false"/><span>GELİŞTİRME</span></button><button id="openCrew"><img src="/assets/officer-helmsman-v1.webp" alt="" draggable="false"/><span>TAYFA</span></button><button id="openDaily"><img src="/assets/icon-chest-v1.webp" alt="" draggable="false"/><span>GÜNLÜK ÖDÜL</span></button><button id="openMenuQuests"><img src="/assets/icon-scroll-v1.webp" alt="" draggable="false"/><span>GÖREVLER</span></button><button id="openMenuWorld"><img id="menuWorldIcon" alt="" draggable="false"/><span>DÜNYA HARİTASI</span></button><button id="openSettings"><img src="/assets/icon-gear-v1.webp" alt="" draggable="false"/><span>AYARLAR</span></button></div></section></div>
      <div class="resources"><div class="resource compact"><i class="sprite icon-gold"></i><span>ALTIN</span><b id="gold">000</b></div><div class="resource compact pearl"><i class="sprite icon-pearl"></i><span>İNCİ</span><b id="pearls">000</b></div></div>
      <div class="panel quest" hidden><span class="eyebrow">Aktif görev</span><h3 id="questTitle">Görev seçilmedi</h3><p id="questDescription">Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.</p><div class="progress" id="quest">Hazır olduğunda bir görev başlat</div><button class="quest-open" id="openQuests">GÖREVLERİ AÇ</button></div>
      <section class="combat-targets" id="combatTargets" aria-live="polite"></section>
      <div class="hud-dock"><div class="dock-status"><div class="status-pair"><div class="status-line xp-line"><span>TP</span><i><em id="xpHudBar"></em></i><b id="xpHudText">0 / 100</b></div><div class="status-line elite-line"><span>EP</span><i><em id="eliteBar"></em></i><b id="eliteText">0 / 100</b></div></div><div class="dock-center"><button class="recenter" id="recenterShip" aria-label="Gemiyi haritada ortala">✥</button><b class="dock-level" id="level" title="Kaptan seviyesi">1</b></div><div class="status-pair"><div class="status-line hp-line"><span>CP</span><i><em id="hpHudBar"></em></i><b id="hpHudText">100 / 100</b></div><div class="status-line battle-line"><span>SP</span><i><em id="battleBar"></em></i><b id="battleText">0 / 100</b></div></div></div><div class="bottom-command"><div class="quick-inventory" id="quickInventory"></div></div></div>
      <div class="combat-controls" id="combatControls"><button class="combat-action attack" id="attack" title="Saldır"><b><img src="/assets/icon-attack-v1.webp" alt="" draggable="false"/></b><span id="attackLabel">SALDIR</span><small id="reloadText">HAZIR</small></button><button class="combat-action repair" id="repair" title="Tamir et"><b><img src="/assets/icon-repair-v1.webp" alt="" draggable="false"/></b><span>TAMİR</span><small data-bind="repair"></small></button><button class="combat-action speed ability" id="ability-speed" title="Rüzgâr Hamlesi"><b><img src="/assets/icon-speed-v1.webp" alt="" draggable="false"/></b><span>HIZ</span><small data-bind="speed"></small></button><button class="combat-action mine ability" id="ability-mine" title="Deniz Mayını"><b><img src="/assets/icon-mine-v1.webp" alt="" draggable="false"/></b><span>MAYIN</span><small data-bind="mine"></small></button><button class="combat-action elite ability" id="ability-elite" title="Elit gemi yeteneği"><b><i class="elite-ability-icon" id="eliteAbilityIcon"></i></b><span id="eliteAbilityName">ELİT</span><small id="eliteAbilityTime">HAZIR</small></button></div>
      <div class="map-cluster"><div class="map-badge" id="mapBadge"><strong id="mapName"></strong><small id="mapSubtitle"></small><b class="map-coord" id="mapCoord" title="Konum koordinatı">1/1 - 00AA</b></div><canvas id="minimap" width="170" height="125"></canvas><button class="world-map-button" id="openWorldMap" aria-label="Dünya haritalarını görüntüle"><img id="worldMapIcon" alt="" draggable="false"/><span>DÜNYA</span></button><button class="quest-bust" id="openQuestTop" aria-label="Görevler"><img src="/assets/captain-bust-v1.webp" alt="" draggable="false"/><span>GÖREVLER</span><small id="questBadge"></small></button><div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div></div>
      <div class="reward-toast" id="rewardToast"></div>
      <div class="toast" id="toast"></div>
      <div class="portal-prompt" id="portalPrompt"></div><div class="quest-overlay daily-overlay" id="dailyOverlay"><section class="daily-window"><header><div><span class="eyebrow">Her gün gel, ödül büyüsün</span><h2>GÜNLÜK ÖDÜL</h2></div><button id="closeDaily" aria-label="Kapat">×</button></header><div class="daily-grid" id="dailyGrid"></div><p class="daily-note" id="dailyNote"></p></section></div><button class="dig-prompt" id="digPrompt"><img src="/assets/icon-treasure-map-v2.webp" alt="" draggable="false"/><span>HAZİNEYİ KAZ</span><i><em id="digBar"></em></i></button><div class="event-panel" id="eventPanel"></div><div class="quest-overlay world-overlay" id="worldMapOverlay"><section class="world-scroll" aria-label="Dünya haritası"><button class="scroll-close" id="closeWorldMap" aria-label="Dünya haritasını kapat">×</button><div class="world-chart" id="worldChart"></div><div id="worldInfo" hidden></div></section></div><div class="quest-overlay" id="questOverlay"><section class="quest-log"><header><div><span class="eyebrow">Kaptanın görev defteri</span><h2>DENİZ GÖREVLERİ</h2></div><button id="closeQuests" aria-label="Görevleri kapat">×</button></header><p class="quest-intro">Aynı anda yalnızca bir görev yürütülebilir. İptal edilen veya tamamlanan görev 8 saat sonra yeniden açılır.</p><div class="quest-list" id="questList"></div></section></div>
      <div class="captain-overlay" id="captainOverlay"><section class="captain-profile"><header><div><span class="eyebrow">Oyuncu profili</span><h2 id="captainName">KAPTAN</h2></div><button id="closeCaptain" aria-label="Kaptan profilini kapat">×</button></header><div class="captain-tab" id="captainTab-profile"><div class="captain-identity"><div class="captain-portrait"><img src="/assets/icon-hat-v1.webp" alt="" draggable="false"/><b id="captainLevel">1</b></div><div><span>AMİRAL GEMİSİ</span><strong>Yedi Deniz</strong><small>Gölgeler Denizi Kaptanı</small></div></div><div class="captain-nick" id="captainNick"></div><div class="captain-stat-grid"><article><span>TECRÜBE PUANI</span><b id="xpText">0 / 100</b><i class="xp"><em id="xpBar"></em></i></article><article><span>CAN PUANI</span><b id="hpText">100 / 100</b><i class="hp"><em id="hpBar" style="width:100%"></em></i></article><article><span>ELİT PUAN</span><b id="profileElite">0 / 100</b><i class="elite"><em id="profileEliteBar"></em></i></article><article><span>SAVAŞ PUANI</span><b id="profileBattle">0 / 500</b><i class="battle"><em id="profileBattleBar"></em></i></article></div><div class="bonus-summary" id="bonusSummary"></div><section class="captain-medals"><header><span class="eyebrow">Madalyalar ve kalıcı bonuslar</span><p class="ach-summary" id="achSummary"></p></header><div class="ach-grid" id="achGrid"></div></section></div></section></div><div class="captain-overlay" id="guildOverlay"><section class="captain-profile crew-window guild-window"><header><div><span class="eyebrow">Filo hazinesi ve ada kuleleri</span><h2>FİLO</h2></div><button id="closeGuild" aria-label="Filo penceresini kapat">×</button></header><div id="guildPanel"></div></section></div><div class="captain-overlay" id="crewOverlay"><section class="captain-profile crew-window"><header><div><span class="eyebrow">Geminin subayları</span><h2>TAYFA</h2></div><button id="closeCrew" aria-label="Tayfayı kapat">×</button></header><div id="crewPanel"></div></section></div><div class="quest-overlay" id="settingsOverlay"><section class="quest-log settings-log"><header><div><span class="eyebrow">Oyun tercihleri</span><h2>AYARLAR</h2></div><button id="closeSettings" aria-label="Ayarları kapat">×</button></header><div id="settingsPanel"></div></section></div>
      <div class="ship-overlay" id="eliteShipOverlay"><section class="ship-menu elite-ship-window"><header><div><span class="eyebrow">Elit filo tersanesi</span><h2>ELİT GEMİLER</h2><p>Elit puanınla açılan gemiyi incele ve amiral gemin olarak seç.</p><nav class="ship-pages"><button data-ship-page="elite">1 · ELİT GEMİLER</button><button data-ship-page="special">2 · ÖZEL GEMİLER</button></nav></div><button id="closeEliteShips" aria-label="Elit gemileri kapat">×</button></header><div class="elite-ship-layout"><div class="elite-ship-grid" id="eliteShipGrid"></div><aside class="elite-ship-detail" id="eliteShipDetail"></aside></div></section></div><div class="ship-overlay" id="shipOverlay"><section class="ship-menu inv-window"><header><div class="inv-top"><img src="/assets/gunner-vignette-v1.webp" alt="" draggable="false"/><span id="shipSummary"></span></div><h2>ENVANTER</h2><button id="closeShip" aria-label="Envanteri kapat">×</button></header><div class="inv-modes"><button data-inv-mode="cannon">TOPLAR</button><button data-inv-mode="equip">DONANIM</button></div><div class="inv-body"><aside class="inv-captain"><img src="/assets/captain-bust-v1.webp" alt="" draggable="false"/></aside><section class="inv-panel"><header><span>Depo</span><button class="inv-arrow to-depot" id="invToDepot" title="Seçili topu depoya al">⬅</button></header><div class="inv-grid" id="invDepot" data-side="depot"></div></section><section class="inv-panel"><header><button class="inv-arrow to-ship" id="invToShip" title="Seçili topu gemiye al">➡</button><span>Gemi</span></header><div class="inv-grid" id="invShip" data-side="ship"></div></section><aside class="inv-info"><header>Bilgi</header><div id="cannonRows"></div></aside></div></section></div><div class="market-overlay" id="equipShopOverlay"><section class="market-menu"><header><div><span class="eyebrow">Gemi ustası</span><h2>DONANIM</h2></div><button id="closeEquipShop" aria-label="Kapat">×</button></header><div class="market-list" id="equipShopList"></div></section></div><div class="market-overlay" id="cannonShopOverlay"><section class="market-menu cannon-shop"><header><div><span class="eyebrow">Topçu dökümhanesi</span><h2>TOPLAR</h2></div><button id="closeCannonShop" aria-label="Top dükkânını kapat">×</button></header><div class="market-list" id="cannonShopList"></div></section></div>
      <div class="development-overlay" id="developmentOverlay"><section class="development-menu"><header><div><span class="eyebrow">Kaptanın gelişim planı</span><h2>GELİŞTİRME</h2></div><button id="closeDevelopment" aria-label="Geliştirmeyi kapat">×</button></header><div id="talentPanel"><div class="dev-tree" id="upgradeList"></div><div class="upgrade-confirm" id="upgradeConfirm"></div></div></section></div>
      <div class="market-overlay" id="marketOverlay"><section class="market-menu"><header><div><span class="eyebrow">Tüccar loncası</span><h2>GÜLLELER</h2></div><button id="closeMarket" aria-label="Kapat">×</button></header><div class="market-list" id="marketList"></div></section></div><div class="market-overlay" id="supplyOverlay"><section class="market-menu"><header><div><span class="eyebrow">Sarf malzemeleri</span><h2>MALZEMELER</h2></div><button id="closeSupply" aria-label="Kapat">×</button></header><div class="market-list" id="supplyList"></div></section></div><div class="buy-confirm" id="buyConfirm"></div><div class="loadout-overlay" id="loadoutOverlay"><section class="loadout-menu"><header><div><span class="eyebrow">Sarf malzemeleri</span><h2 id="loadoutTitle">MALZEMELER</h2></div><button id="closeLoadout">×</button></header><p id="loadoutHint">Sarf malzemeleri alt sıraya yerleşir. Sürükleyip bırak ya da önce eşyaya, sonra yuvaya dokun. Kara Barut ve Kalkan yuvaya dokununca açılır/kapanır.</p><div class="loadout-items" id="loadoutItems"></div><div class="loadout-slots" id="loadoutSlots"></div></section></div>
    </section>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>('#sea')!;
const ctx = canvas.getContext('2d')!;
const minimap = document.querySelector<HTMLCanvasElement>('#minimap')!;
const mini = minimap.getContext('2d')!;
const playerShipImage=new Image();playerShipImage.src='/assets/starter-ship-v2.webp';
document.documentElement.style.setProperty('--starter-ship',`url("${playerShipImage.src}")`);
// Başlangıç gemisi "Yedi Deniz": 8 yönlü sayfa (4 × 2, 256 px; elitlerle aynı kare sırası)
const directionalShipImage=new Image();directionalShipImage.src='/assets/starter-ship-dir-v2.webp';
document.documentElement.style.setProperty('--pirate-icons','url("/assets/pirate-ui-icons-v1.webp")');
([['/assets/icon-world-v1.webp','worldMapIcon'],['/assets/icon-world-v1.webp','menuWorldIcon'],['/assets/icon-ship-nav-v1.webp','shipNavIcon']] as const).forEach(([src,id])=>{const img=document.getElementById(id) as HTMLImageElement|null;if(img)img.src=src;});
const cannonAssetSources:Record<CannonKind,string>={cast:'/assets/cannon-cast-v1.webp',long:'/assets/cannon-long-v1.webp',rapid:'/assets/cannon-rapid-v1.webp',heavy:'/assets/cannon-heavy-v1.webp'};
const rasterItemAssets:Partial<Record<QuickItemId,string>>={};
(Object.keys(SPECIAL_AMMO) as SpecialAmmo[]).forEach(k=>{rasterItemAssets[k]=SPECIAL_AMMO[k].icon;});rasterItemAssets.mine=ABILITIES.mine.icon;rasterItemAssets.shield=CONSUMABLES.shield.icon;rasterItemAssets.powder=CONSUMABLES.powder.icon;rasterItemAssets.speed=ABILITIES.speed.icon;rasterItemAssets.repairkit='/assets/icon-repair-v1.webp';
rasterItemAssets.iron='/assets/ammo-iron-v2.webp';rasterItemAssets.chain='/assets/ammo-chain-v2.webp';
// Elit gemiler: tersane kartındaki tasarımın birebir aynısı, gemi başına temiz raster (384 px, pruva sol-aşağı).
// Gemi görselleri aynı dosya adıyla yenilendiğinde tarayıcı önbelleği eskisini göstermesin diye sürüm eki (görsel değişince artır)
const SHIP_ART_REV='9';
const eliteArtUrl=(id:string)=>`/assets/elite-${id}-art-v2.webp?r=${SHIP_ART_REV}`;
const eliteArtImages=new Map<string,HTMLImageElement>();
function eliteArtImage(id:string){let im=eliteArtImages.get(id);if(!im){im=new Image();im.decoding='async';im.src=eliteArtUrl(id);eliteArtImages.set(id,im);}return im;}
let eliteFacing=-1;
const ui = (id:string) => document.getElementById(id)!;
const keys = new Set<string>();
const QUEST_STORAGE='yedi-deniz-quests-v2';
const ACCOUNT_STORAGE='yedi-deniz-account-v1';
let storedQuests:{active:string|null;progress:Record<string,number>;cooldowns:Record<string,number>}|null=null;
let storedAccount:{pearls?:number;gold:number;wood?:number;fame:number;level:number;maxHp:number;hp:number;chainAmmo:number;elitePoints?:number;battlePoints?:number;cannonType?:CannonKind;cannonInventory?:CannonStock;mountedCannons?:CannonStock;equipOwned?:Record<string,number>;equipped?:Partial<Record<EquipSlot,string|null>>;quickSlots?:Array<QuickItemId|null>;upgrades:Record<UpgradeKind,number>;eliteShip?:EliteShipId;activeShip?:ShipSelection;specialOwned?:string[];activeSkin?:string|null;elitePurchased?:boolean;currentMap?:MapKey}|null=null;
try{storedQuests=JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null');}catch{storedQuests=null;}
try{storedAccount=JSON.parse(localStorage.getItem(ACCOUNT_STORAGE)||'null');}catch{storedAccount=null;}
const storedActive=storedQuests?.active&&QUESTS.some(q=>q.id===storedQuests!.active)?storedQuests.active:null;
const BASE_HP=75000,HP_PER_LEVEL=2500,HP_PER_HULL=2500,HP_PER_ELITE=5000,BASE_CANNONS=100,CANNONS_PER_ELITE=25,CANNONS_PER_HULL=5;
const upgrades:Record<UpgradeKind,number>={hull:storedAccount?.upgrades?.hull||0,damage:storedAccount?.upgrades?.damage||0,range:storedAccount?.upgrades?.range||0,reload:storedAccount?.upgrades?.reload||0,speed:storedAccount?.upgrades?.speed||0,repair:storedAccount?.upgrades?.repair||0};
const defaultCannonStock:CannonStock={cast:20,long:6,rapid:4,heavy:2};
const defaultMountedCannons:CannonStock={cast:50,long:0,rapid:0,heavy:0};
const cannonInventory:CannonStock={...defaultCannonStock,...storedAccount?.cannonInventory};
const mountedCannons:CannonStock={...defaultMountedCannons,...storedAccount?.mountedCannons};
// Donanım: depodaki parça sayıları ve gemideki yuvalar
const equipOwned:Record<string,number>={...storedAccount?.equipOwned};
const equipped:Partial<Record<EquipSlot,string|null>>={...storedAccount?.equipped};
const equipBonus=()=>equipTotals(equipped);
// Başarımlar: sayaçlar ve açılan madalyaların kalıcı bonusları (altın, TP, hasar, can)
const ach=loadAchievements();let achBonusCache=achievementBonus(ach);
const achBonus=()=>achBonusCache;
const xpGain=(n:number)=>Math.round(n*(1+achBonus().xp)),goldGainAch=(n:number)=>Math.round(n*(1+achBonus().gold));
const state = { pearls:storedAccount?.pearls??30, gold:storedAccount?.gold??40, fame:storedAccount?.fame??0, level:Math.min(MAX_LEVEL,storedAccount?.level??1), hp:storedAccount?.hp??Infinity, maxHp:storedAccount?.maxHp??100, elitePoints:storedAccount?.elitePoints??0,battlePoints:storedAccount?.battlePoints??0,cannon:18, cannonType:storedAccount?.cannonType&&CANNONS[storedAccount.cannonType]?storedAccount.cannonType:'cast' as CannonKind, activeQuest:storedActive as string|null, ammo:'iron' as AmmoKind, chainAmmo:storedAccount?.chainAmmo??2000, attacking:false, repairing:false, invulnerable:0 };
// Eski ölçekli kayıtlar (100 canlı, 18 toplu gemi) bir kez Seafight ölçeğine taşınır: can formülden hesaplanır,
// gemiye en az 50 döküm top yerleştirilir.
if(storedAccount&&storedAccount.maxHp<5000){const total=(Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);if(total<50)mountedCannons.cast+=50-total;state.hp=Infinity;}
state.maxHp=BASE_HP+(state.level-1)*HP_PER_LEVEL+upgrades.hull*HP_PER_HULL;
state.cannon=(Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);
let elitePurchased=storedAccount?.elitePurchased===true;
let activeEliteShip:EliteShipId=storedAccount?.eliteShip&&ELITE_SHIPS.some(s=>s.id===storedAccount!.eliteShip)?storedAccount.eliteShip:'phantom';
// Test modunda elit satın alınmış sayılmaz; seçilen elit gemi yine de yeniden yüklemede korunur
let activeShip:ShipSelection=(elitePurchased||ELITE_TEST_MODE)&&storedAccount?.activeShip&&ELITE_SHIPS.some(s=>s.id===storedAccount!.activeShip)?storedAccount.activeShip:'starter';
let previewShip:ShipSelection=activeShip;
// Özel gemiler (yalnızca görünüm): sahip olunanlar ve seçili görünüm; seçiliyken güç başlangıç gemisidir
let specialOwned:string[]=Array.isArray(storedAccount?.specialOwned)?storedAccount!.specialOwned.filter(id=>!!specialById(id)):[];
let activeSkin:string|null=activeShip==='starter'&&specialById(storedAccount?.activeSkin)&&(ELITE_TEST_MODE||specialOwned.includes(storedAccount!.activeSkin!))?storedAccount!.activeSkin!:null;
let shipPage:'elite'|'special'=activeSkin?'special':'elite',previewSpecial:string=activeSkin??SPECIAL_SHIPS[0].id,specialFacingDir:1|-1=-1;
const quickSlots:Array<QuickItemId|null>=Array(12).fill(null);
{const stored=(storedAccount?.quickSlots??['iron','chain','fire','grape','repairkit','speed','powder','shield','mine']).filter((id):id is QuickItemId=>!!id&&id in QUICK_ITEMS);
  const place=(id:QuickItemId)=>{if(quickSlots.includes(id))return;const row=QUICK_ITEMS[id].category==='ammo'?0:AMMO_ROW;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=id;return;}};
  stored.forEach(place);(['iron','chain','fire','grape','repairkit','speed','powder','shield','mine'] as QuickItemId[]).forEach(id=>{if(!storedAccount?.quickSlots)place(id);});}
const arsenal=loadArsenal();
// Eski kayıtlarda gülle stoğu salvo sayısıydı; artık her top 1 gülle harcar. Stoklar bir kez 50 topluk salvoya göre çevrilir.
if(!arsenal.ballsV1){for(const k of ['fire','grape','explosive','breaker','leech'] as const)arsenal[k]*=50;state.chainAmmo*=50;arsenal.ballsV1=true;saveArsenal(arsenal);}
// Kara Barut eski kayıtlarda da sarf sırasına bir kez yerleşir
if(!quickSlots.includes('powder')){const free=quickSlots.findIndex((v,k)=>k>=AMMO_ROW&&!v);if(free>=0)quickSlots[free]='powder';}
// Açık/kapalı sarf malzemeleri
const consumableOn:Record<ConsumableId,boolean>={powder:false,shield:false};
const crew=loadCrew();
let bonus=computeBonus(crew);
if(!arsenal.seeded){for(const item of ['fire','grape','shield','mine'] as QuickItemId[]){const row=QUICK_ITEMS[item].category==='ammo'?0:AMMO_ROW;if(quickSlots.includes(item))continue;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=item;break;}}arsenal.seeded=true;saveArsenal(arsenal);}
// Yeni gülleler (patlayıcı, kule kırıcı, can emici) bir kez hızlı yuvalara yerleşir; yer yoksa MALZEMELER'den eklenir
if(!arsenal.seededV2){for(const item of ['explosive','breaker','leech'] as QuickItemId[]){if(quickSlots.includes(item))continue;const free=quickSlots.findIndex((v,k)=>k<AMMO_ROW&&!v);if(free>=0)quickSlots[free]=item;}arsenal.seededV2=true;saveArsenal(arsenal);}
const questProgress:Record<string,number>={...storedQuests?.progress};
const questCooldownUntil:Record<string,number>={...storedQuests?.cooldowns};
if(state.activeQuest!==null&&(questCooldownUntil[state.activeQuest]??0)>Date.now())state.activeQuest=null;
const player = { x:WORLD_WIDTH/2, y:WORLD_HEIGHT/2, angle:-Math.PI/2, speed:0, cooldown:0 };
let destination:Vec|null=null;
let routeTarget:Vec|null=null;
let selected:Target|null=null;
const camera = { x:player.x, y:player.y, zoom:.7, targetZoom:.7 };
const shots:Shot[]=[]; const enemies:Enemy[]=[];
const salvoQueue:SalvoRound[]=[];
const particles:Particle[]=[];
const WORLD_STORAGE='yedi-deniz-world-v2';
let currentMap:MapKey=(()=>{try{const k=(storedAccount?.currentMap||localStorage.getItem(WORLD_STORAGE)) as MapKey|null;if(k&&k in MAPS&&tierOf(k)<=state.level)return k;}catch{}return'1/1';})();
const mapDef=()=>MAPS[currentMap];
const theme=()=>THEMES[mapDef().tier];
const hasFleetIsland=()=>mapDef().tier>=5;
const monsters:Monster[]=[];
function createMonsters(){monsters.length=0;const def=MONSTERS[mapDef().monster];for(let k=0;k<(mapDef().safe?1:2);k++){const p=randomSeaPoint(700);monsters.push({kind:'monster',def,x:p.x,y:p.y,phase:Math.random()*6,radius:def.radius,name:def.name,hp:def.hp,maxHp:def.hp,cooldown:0,aggro:false,slowTimer:0,homeX:p.x,homeY:p.y,combatTimer:0});}}
const lootChests:LootChest[]=[];
const SPARKLE_COUNT=12,SPARKLE_PICKUP=40,SPARKLE_RESPAWN=4;
const sparkles:{x:number;y:number;seed:number;born:number}[]=[];
const sparkleQueue:number[]=[];
const abilityTimers:Record<AbilityId,{active:number;cooldown:number}>={speed:{active:0,cooldown:0},mine:{active:0,cooldown:0}};
const mines:{x:number;y:number;life:number;arm:number}[]=[];
const abilityActive=(id:AbilityId)=>abilityTimers[id].active>0;
const eliteAbility={active:0,cooldown:0};
// Elit yetenek durumları. Hayalet geçişte adacıklardan geçilir; gemi yarı saydam ve arkasında hayalet izi
const ELITE_COOLDOWN=45;
let ghostTimer=0,ghostTrailClock=0;const ghostTrail:Vec[]=[];
let domeTimer=0,steamTimer=0,moonTimer=0,bannerTimer=0,rageTimer=0,coralTimer=0,stealthTimer=0,playerHitClock=99;
const abilityQueue:{t:number;fn:()=>void}[]=[];
const lavaPools:{x:number;y:number;life:number;tick:number;dps:number}[]=[];
let krakenHold:{target:Target;time:number}|null=null,voidHole:{x:number;y:number;time:number;damage:number}|null=null;
const eliteEnabled=()=>activeShip!=='starter';
const eliteShip=()=>eliteById(activeEliteShip);
// Seafight ölçeği: başlangıç gemisi 75.000 can ve 100 top yuvası. Elit seviyesi başına +5.000 can ve +25 yuva
// (Seafight: Elit 1 75.000 can/100 top, Elit 2 80.000/105). Kaptan seviyesi ve Güçlendirilmiş Gövde +2.500 can verir.
const baseMaxHp=()=>BASE_HP+(state.level-1)*HP_PER_LEVEL+upgrades.hull*HP_PER_HULL;
const effectiveMaxHp=()=>Math.round((state.maxHp+(eliteEnabled()?eliteShip().level*HP_PER_ELITE:0))*(1+equipBonus().hp+achBonus().hp));
if(!Number.isFinite(state.hp)||state.hp>effectiveMaxHp())state.hp=effectiveMaxHp();
let driftClock=0;
let wakeClock=0;
let collisionNotice=0;
const islands:WorldIsland[]=[];
let jumpPrompt:{dir:Dir;to:MapKey}|null=null;
const fleetOwners=loadFleetOwners();
const fleetOwner=(key:MapKey=currentMap)=>fleetOwners[key]??'npc';
const ownTowers:{x:number;y:number;cooldown:number;slot:number;type:TowerType}[]=[];
let guild:Guild|null=loadGuild();
let buildType:TowerType='cannon';
let focusedFoundation:string|null=null;
const profile=loadProfile();
function escapeHtml(t:string){return t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
let eventPanelClock=0,towersDestroyedHere=0;
let mapFade=0;
const weatherParticles:{x:number;y:number;vx:number;vy:number;r:number;a:number;life:number}[]=[];
let lightning=0;

function resize(){ const d=Math.min(devicePixelRatio,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize',resize); resize();
const settings=loadSettings();setAudio(settings.sound,settings.volume);
let rebinding:ActionId|null=null;
const held=(action:ActionId,...extra:string[])=>keys.has(settings.binds[action])||extra.some(k=>keys.has(k));
function closeAllOverlays(){ui('menuOverlay').classList.remove('open');closeWorldMap();closeQuestLog();closeEliteShips();closeShipMenu();closeMarket();closeCaptainProfile();closeDevelopment();closeCrew();closeGuild();closeSettings();closeLoadout();}
function runAction(action:ActionId){
  if(action==='attack')toggleAttack();else if(action==='repair')toggleRepair();else if(action==='recenter')recenterShip();
  else if(action==='jump')useJump();else if(action==='speed')activateAbility('speed');else if(action==='shield')toggleConsumable('shield');else if(action==='mine')dropMine();
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
  if(hasFleetIsland()&&fleetOwner()==='player'&&guild){
    const f=mapDef().fleet,slots=islandSlots(guild,currentMap);
    const slot=FLEET.towers.map(([dx,dy],i)=>({x:f.x+dx,y:f.y+dy,i})).sort((a,b)=>b.y-a.y).find(t=>towerContains(world,t,!!slots[t.i]))?.i;
    if(slot!==undefined){focusedFoundation=`${currentMap}:${slot}`;openGuild();document.querySelector(`[data-foundation="${focusedFoundation}"]`)?.scrollIntoView({block:'center'});toast(slots[slot]?`${TOWER_TYPES[slots[slot]!.type].name} · Kaide ${slot+1}`:`Kaide ${slot+1}: kule tipini seçip DİK düğmesine bas`);return;}
  }
  const towerHit=enemies.filter(n=>n.tower&&towerContains(world,n)).sort((a,b)=>b.y-a.y)[0];
  const hit=towerHit??[...enemies,...monsters].filter(n=>dist(n,world)<Math.max(42,n.kind==='monster'?n.radius:(n.hitRadius??0))).sort((a,b)=>dist(a,world)-dist(b,world))[0];
  if(hit){if(hit!==selected){selected=hit;state.attacking=false;attackChase=false;ui('attack').classList.remove('active');toast(`${hit.name} hedef seçildi`);}}
  else{const glint=sparkles.find(g=>dist(g,world)<34);if(glint){routeTarget={x:glint.x,y:glint.y};destination=routeVia(routeTarget);attackChase=false;toast('Rota inci pırıltısına çizildi');return;}const chest=lootChests.find(c=>dist(c,world)<CHEST_CLICK_RADIUS);routeTarget=chest?{x:chest.x,y:chest.y}:navigablePoint(world);destination=routeVia(routeTarget);attackChase=false;if(chest)toast('Rota ganimet sandığına çizildi');}
});
ui('attack').onclick=toggleAttack;
ui('repair').onclick=toggleRepair;
ui('ability-speed').onclick=()=>activateAbility('speed');ui('ability-mine').onclick=dropMine;ui('ability-elite').onclick=activateEliteAbility;
function recenterShip(){camera.x=player.x;camera.y=player.y;destination=null;toast('Kamera gemiye ortalandı');}
ui('recenterShip').onclick=recenterShip;
ui('openWorldMap').onclick=openWorldMap;ui('closeWorldMap').onclick=closeWorldMap;
ui('worldMapOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('worldMapOverlay'))closeWorldMap();});
ui('openCaptain').onclick=openCaptainProfile;
ui('closeCaptain').onclick=closeCaptainProfile;
ui('openGuild').onclick=openGuild;ui('closeGuild').onclick=closeGuild;ui('guildOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('guildOverlay'))closeGuild();});
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
ui('digPrompt').onclick=startDig;ui('openDaily').onclick=openDaily;ui('closeDaily').onclick=closeDaily;ui('dailyOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('dailyOverlay'))closeDaily();});ui('closeCannonShop').onclick=closeCannonShop;ui('closeEquipShop').onclick=closeEquipShop;ui('equipShopOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('equipShopOverlay'))closeEquipShop();});ui('cannonShopOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('cannonShopOverlay'))closeCannonShop();});
ui('shipOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('shipOverlay'))closeShipMenu();});
ui('openDevelopment').onclick=openDevelopment;
ui('closeDevelopment').onclick=closeDevelopment;
ui('developmentOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('developmentOverlay'))closeDevelopment();});
ui('openMarket').onclick=openMarket;
ui('closeMarket').onclick=closeMarket;
ui('marketOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('marketOverlay'))closeMarket();});
ui('closeSupply').onclick=closeSupply;ui('supplyOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('supplyOverlay'))closeSupply();});
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.targetZoom+(e.deltaY<0?.1:-.1));},{passive:false});
ui('closeLoadout').onclick=closeLoadout;
ui('loadoutOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('loadoutOverlay'))closeLoadout();});
// Sağ üst: market (sekmeli gemi/top/mühimmat pencereleri) ve menü (profil, filo, geliştirme, tayfa, ayarlar)
const SHOP_OVERLAYS=['eliteShipOverlay','equipShopOverlay','cannonShopOverlay','shipOverlay','marketOverlay','supplyOverlay'];
const SHOP_OPEN:Record<string,()=>void>={eliteShipOverlay:openEliteShips,equipShopOverlay:openEquipShop,cannonShopOverlay:openCannonShop,shipOverlay:openShipMenu,marketOverlay:openMarket,supplyOverlay:openSupply};
let lastShop='marketOverlay';
function closeShops(){closeEliteShips();closeEquipShop();closeCannonShop();closeShipMenu();closeMarket();closeSupply();closeLoadout();closeBuy();}
function showShop(id:string){closeShops();closeMenu();lastShop=id;SHOP_OPEN[id]();}
function syncShopTabs(){const open=SHOP_OVERLAYS.find(id=>ui(id).classList.contains('open'));ui('shopTabs').classList.toggle('open',!!open);document.body.classList.toggle('shop-open',!!open);
  document.querySelectorAll<HTMLButtonElement>('#shopTabs [data-shop]').forEach(b=>b.classList.toggle('active',b.dataset.shop===open));}
const shopWatch=new MutationObserver(syncShopTabs);SHOP_OVERLAYS.forEach(id=>shopWatch.observe(ui(id),{attributes:true,attributeFilter:['class']}));
document.querySelectorAll<HTMLButtonElement>('#shopTabs [data-shop]').forEach(b=>b.onclick=()=>showShop(b.dataset.shop!));
ui('openShop').onclick=()=>showShop(lastShop);ui('closeShopTabs').onclick=closeShops;
function openMenu(){closeShops();ui('menuOverlay').classList.add('open');}
function closeMenu(){ui('menuOverlay').classList.remove('open');}
ui('openMenu').onclick=openMenu;ui('closeMenu').onclick=closeMenu;ui('menuOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('menuOverlay'))closeMenu();});
ui('openMenuQuests').onclick=openQuestLog;ui('openMenuWorld').onclick=openWorldMap;
// menüdeki bir kutuya tıklanınca hedef pencere açılır, menü kapanır
document.querySelectorAll<HTMLButtonElement>('.menu-grid button').forEach(b=>b.addEventListener('click',closeMenu));

function spawnEnemy(){
  const map=mapDef();if(regularEnemyCount()>=map.npcCount)return;
  const heavy=Math.random()<map.heavyShare,def=NPCS[map.npcs[heavy?1:0]],p=randomSeaPoint(520);
  enemies.push(makeShip(def,p.x,p.y,Math.random()*Math.PI*2));
}
function makeShip(def:NpcDef,x:number,y:number,angle:number):Enemy{
  return{kind:'ship',def,role:def.role,x,y,angle,hp:def.hp,maxHp:def.hp,cooldown:Math.random()*2,speed:def.speed+Math.random()*4,damage:def.damage,reload:def.reload,rewardGold:def.gold,rewardFame:def.xp,color:'#79372f',name:def.name,tier:def.tier,aggro:false,wander:Math.random()*6,slowTimer:0,homeX:x,homeY:y,combatTimer:0};
}
const regularEnemyCount=()=>enemies.filter(e=>!e.tower&&!e.boss).length;
// Adalardan, filo adasından ve oyuncudan uzak rastgele deniz noktası
function randomSeaPoint(minPlayerDist:number){
  for(let tries=0;tries<60;tries++){const p={x:160+Math.random()*(WORLD_WIDTH-320),y:160+Math.random()*(WORLD_HEIGHT-320)};const f=mapDef().fleet;
    if(hasFleetIsland()&&dist(p,f)<FLEET.islandR+100)continue;if(islands.some(i=>dist(p,i)<i.r+60))continue;if(dist(p,player)<minPlayerDist)continue;return p;}
  return{x:160+Math.random()*(WORLD_WIDTH-320),y:160+Math.random()*(WORLD_HEIGHT-320)};
}
function setupFleetIsland(){
  const map=mapDef(),f=map.fleet,t=fleetTower(map.tier);ownTowers.length=0;towersDestroyedHere=0;if(!hasFleetIsland())return;
  // Kendi adanda yalnızca filonun diktiği kuleler vardır; boş kaideler FİLO sekmesinden inciyle doldurulur.
  if(fleetOwner()==='player'){if(guild){const slots=islandSlots(guild,currentMap);FLEET.towers.forEach(([dx,dy],i)=>{const t=slots[i];if(t)ownTowers.push({x:f.x+dx,y:f.y+dy,cooldown:Math.random()*2,slot:i,type:t.type});});}return;}
  FLEET.towers.forEach(([dx,dy],i)=>{const tower:Enemy={kind:'ship',role:'heavy',tower:true,towerIndex:i,x:f.x+dx,y:f.y+dy,angle:0,hp:t.hp,maxHp:t.hp,cooldown:Math.random()*2,speed:0,damage:t.damage,reload:t.reload,rewardGold:0,rewardFame:0,color:'#555',name:`${f.name} Kulesi`,tier:map.tier,aggro:false,wander:0,slowTimer:0,homeX:f.x+dx,homeY:f.y+dy,combatTimer:0,hitRadius:34,fireRange:t.range};enemies.push(tower);});
}
// ---------------------------------------------------------------- Harita bossları
// Sayaç haritaya özeldir ve kalıcıdır; yalnızca o haritanın en güçlü NPC'si (ağır gemi) sayılır.
// Boss çıkıp yenilmeden haritadan çıkılırsa, haritaya dönünce yeniden belirir.
const BOSS_STORAGE='yedi-deniz-bosses-v1';
type BossProgress={kills:number;pending:boolean};
const bossProgress:Record<string,BossProgress>=(()=>{try{return JSON.parse(localStorage.getItem(BOSS_STORAGE)||'{}')||{};}catch{return{};}})();
const bossOf=(key:MapKey)=>bossProgress[key]??(bossProgress[key]={kills:0,pending:false});
const saveBosses=()=>{try{localStorage.setItem(BOSS_STORAGE,JSON.stringify(bossProgress));}catch{}};
const activeBoss=()=>enemies.find(e=>e.boss);
function spawnBoss(){
  if(activeBoss())return;const b=bossFor(currentMap),p=randomSeaPoint(700);
  const e=makeShip(b as unknown as NpcDef,p.x,p.y,Math.random()*6);e.boss=b;e.hitRadius=64;e.speed=b.speed;e.color='#2f5a4a';enemies.push(e);
  toast(`${b.name} ${mapDef().name} sularında belirdi!`);rewardNotice(`BOSS   ${b.name.toLocaleUpperCase('tr')} BELİRDİ`);playBossHorn();playBossMusic(mapDef().tier);
}
function countBossKill(e:Enemy){
  const b=bossFor(currentMap);if(e.def?.id!==b.trigger||e.summoned)return;const st=bossOf(currentMap);if(st.pending)return;
  st.kills++;if(st.kills>=BOSS_KILLS){st.kills=0;st.pending=true;spawnBoss();}saveBosses();
}
function bossFire(e:Enemy){
  const base=Math.atan2(player.y-e.y,player.x-e.x),enraged=e.hp<e.maxHp*.5;playEnemyCannon(dist(e,player)*.6,(e.x-player.x)/600);
  muzzleFlash(e.x+Math.cos(base)*30,e.y+Math.sin(base)*30,base,84);
  for(const off of enraged?[-.24,-.12,0,.12,.24]:[-.15,0,.15])shots.push({x:e.x,y:e.y,vx:Math.cos(base+off)*280,vy:Math.sin(base+off)*280,life:2.2,owner:'enemy',damage:e.damage*(.85+Math.random()*.3)*(enraged?.8:1),hit:false,ammo:'iron'});
  e.cooldown=e.reload*(enraged?.8:1);
  if(enraged&&!e.escortsCalled){e.escortsCalled=true;const def=NPCS[mapDef().npcs[1]];for(let k=0;k<2;k++){const ship=makeShip(def,e.x+(k?70:-70),e.y+50,e.angle);ship.aggro=true;ship.combatTimer=20;ship.summoned=true;ship.name=`${e.name} Muhafızı`;enemies.push(ship);}toast(`${e.name} muhafızlarını çağırdı!`);}
}
function defeatBoss(e:Enemy){
  const b=e.boss!;stopBossMusic();state.fame+=xpGain(b.xp);bumpAch('boss');state.pearls+=b.pearls;bossOf(currentMap).pending=false;saveBosses();saveAccount();
  for(let n=0;n<3;n++)setTimeout(()=>{burst(e.x+(Math.random()-.5)*80,e.y+(Math.random()-.5)*50,true);playExplosion();},n*260);
  rewardNotice(`${b.name.toLocaleUpperCase('tr')} BATIRILDI   +${b.xp.toLocaleString('tr-TR')} TP   +${b.pearls} İnci`);toast(`${b.name} denizin dibine gönderildi!`);
}
function populateMap(){
  stopBossMusic();lavaPools.length=0;abilityQueue.length=0;krakenHold=null;voidHole=null;
  const map=mapDef();islands.splice(0,islands.length,...map.islands.map(i=>({...i})));
  enemies.length=0;shots.length=0;salvoQueue.length=0;particles.length=0;lootChests.length=0;sparkles.length=0;sparkleQueue.length=0;mines.length=0;driftClock=DRIFT_RESPAWN_SECONDS;weatherParticles.length=0;
  preload([...(hasFleetIsland()?[fleetBaseUrl(theme().fleet),fleetTowerUrl(theme().fleet)]:[]),...map.npcs.map(id=>NPCS[id].sprite),MONSTERS[map.monster].sprite,...new Set(map.islands.map(i=>islandSheetUrl(i.look)))]);
  createMonsters();setupFleetIsland();
  for(let i=0;i<map.npcCount;i++)spawnEnemy();
  if(bossOf(currentMap).pending)spawnBoss();
  for(let i=0;i<3;i++){const p=randomSeaPoint(0);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(map.tier-1)));}
  for(let i=0;i<SPARKLE_COUNT;i++)spawnSparkle();
  ui('mapName').textContent=`${map.key} · ${map.name}`;ui('mapSubtitle').textContent=map.safe?'SAVAŞA KAPALI':`${theme().name.toLocaleUpperCase('tr')} · SEVİYE ${map.tier}`;ui('mapBadge').className=`map-badge ${map.safe?'safe':'danger-'+Math.min(3,Math.ceil(map.tier/3))}`;
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
function edgeDir():Dir|null{if(player.y<EDGE)return'north';if(player.y>WORLD_HEIGHT-EDGE)return'south';if(player.x<EDGE)return'west';if(player.x>WORLD_WIDTH-EDGE)return'east';return null;}
function useJump(){
  if(!jumpPrompt){toast('Harita atlamak için denizin kenarına yanaş');return;}const target=MAPS[jumpPrompt.to];
  if(state.level<target.tier){toast(`${target.key} ${target.name} için Seviye ${target.tier} gerekli`);return;}
  if(inCombat()){toast('Savaş sırasında harita atlanamaz');return;}
  const dir=jumpPrompt.dir,inset=EDGE+110,at={x:dir==='west'?WORLD_WIDTH-inset:dir==='east'?inset:player.x,y:dir==='north'?WORLD_HEIGHT-inset:dir==='south'?inset:player.y};
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
function randomSafePlayerPoint(){
  for(let tries=0;tries<140;tries++){
    const p=randomSeaPoint(0);
    const fleetSafe=!hasFleetIsland()||dist(p,mapDef().fleet)>FLEET.islandR+760;
    const hostileSafe=!enemies.some(e=>dist(e,p)<760)&&!monsters.some(m=>dist(m,p)<760);
    if(fleetSafe&&hostileSafe)return p;
  }
  return{x:WORLD_WIDTH*.18,y:WORLD_HEIGHT*.18};
}
{const loginSpot=randomSafePlayerPoint();player.x=loginSpot.x;player.y=loginSpot.y;camera.x=player.x;camera.y=player.y;}
function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n));}
function dist(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y);}
// Filo adası: görselden üretilen seyir maskesi (src/fleetMask.ts). Kara hücreleri geçilmez; açık deniz, kanal ve
// lagün suyu seyredilebilir. Test süresince tüm filo adalarına girilebilir (FLEET_TEST_ENTRY).
const FLEET_TEST_ENTRY=true;
const FM_N=FLEET_MASK.n,FM_CELL=FLEET_MASK.cell,FM_HALF=FM_N*FM_CELL/2;
const fleetGrid=(()=>{const g=new Uint8Array(FM_N*FM_N);let k=0;for(const part of FLEET_MASK.rle.split(',')){const v=+part[0],n=parseInt(part.slice(1),36);g.fill(v,k,k+n);k+=n;}return g;})();
const fleetEnterable=()=>hasFleetIsland()&&(fleetOwner()==='player'||FLEET_TEST_ENTRY);
function fleetCellOf(p:Vec){const f=mapDef().fleet;return{i:Math.floor((p.x-f.x+FM_HALF)/FM_CELL),j:Math.floor((p.y-f.y+FM_HALF)/FM_CELL)};}
function fleetCellValue(i:number,j:number){return i<0||j<0||i>=FM_N||j>=FM_N?1:fleetGrid[j*FM_N+i];}
// 0 kara, 1 açık deniz, 2 lagün/kanal (adanın içi)
function fleetNav(p:Vec){if(!hasFleetIsland())return 1;const c=fleetCellOf(p);return fleetCellValue(c.i,c.j);}
function fleetCellCenter(i:number,j:number):Vec{const f=mapDef().fleet;return{x:f.x-FM_HALF+(i+.5)*FM_CELL,y:f.y-FM_HALF+(j+.5)*FM_CELL};}
function nearestFleetWater(p:Vec){const c=fleetCellOf(p);for(let r=1;r<=30;r++){let best:Vec|null=null,bd=Infinity;for(let j=c.j-r;j<=c.j+r;j++)for(let i=c.i-r;i<=c.i+r;i++){if(Math.max(Math.abs(i-c.i),Math.abs(j-c.j))!==r||!fleetCellValue(i,j))continue;const q=fleetCellCenter(i,j),d=dist(q,p);if(d<bd){bd=d;best=q;}}if(best)return best;}return null;}
let fleetSafe:Vec|null=null;
function fleetCollision(p:Vec):{x:number;y:number;name:string}|null{
  if(!hasFleetIsland())return null;const f=mapDef().fleet;
  if(!fleetEnterable()){const dx=p.x-f.x,dy=p.y-f.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),outR=FLEET.islandR+14;return d<outR?{x:f.x+Math.cos(a)*outR,y:f.y+Math.sin(a)*outR,name:f.name}:null;}
  if(fleetNav(p))return null;
  // Oyuncu için kıyı boyunca kayma: son güvenli konumdan yalnızca x ya da y hareketi denenir.
  if(p===player&&fleetSafe&&dist(fleetSafe,p)<40){for(const c of [{x:p.x,y:fleetSafe.y},{x:fleetSafe.x,y:p.y},fleetSafe])if(fleetNav(c))return{...c,name:f.name};}
  const w=nearestFleetWater(p);return w?{...w,name:f.name}:null;
}
// Geminin gövde genişliği kadar kalın çizgi: merkez ve iki yandaki paralel çizgiler açık olmalı.
function fleetWideLine(a:Vec,b:Vec){const d=dist(a,b)||1,nx=-(b.y-a.y)/d*10,ny=(b.x-a.x)/d*10;return fleetClearLine(a,b)&&fleetClearLine({x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny})&&fleetClearLine({x:a.x-nx,y:a.y-ny},{x:b.x-nx,y:b.y-ny});}
function fleetClearLine(a:Vec,b:Vec){const d=dist(a,b),n=Math.ceil(d/6);for(let k=1;k<=n;k++){const t=k/n;if(!fleetNav({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}))return false;}return true;}
// Maske üzerinde yol bulma: ızgara çevresine deniz payı eklenir (PAD); maliyet kıyıya yakın hücrelerde artar, böylece
// rota kıyıdan uzak ve dar geçitlerin ortasından geçer. Hedef değişmedikçe mesafe alanı önbellekte tutulur.
const FM_PAD=16,PN=FM_N+FM_PAD*2;
const padGrid=(()=>{const g=new Uint8Array(PN*PN).fill(1);for(let j=0;j<FM_N;j++)for(let i=0;i<FM_N;i++)g[(j+FM_PAD)*PN+i+FM_PAD]=fleetGrid[j*FM_N+i];return g;})();
const padClear=(()=>{const c=new Uint8Array(PN*PN);for(let j=0;j<PN;j++)for(let i=0;i<PN;i++){if(!padGrid[j*PN+i])continue;let r=1;search:for(;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=i+dx,y=j+dy;if(x>=0&&y>=0&&x<PN&&y<PN&&!padGrid[y*PN+x])break search;}c[j*PN+i]=r;}return c;})();
function padCellOf(p:Vec){const c=fleetCellOf(p);return{i:clamp(c.i+FM_PAD,0,PN-1),j:clamp(c.j+FM_PAD,0,PN-1)};}
function padCenter(i:number,j:number){return fleetCellCenter(i-FM_PAD,j-FM_PAD);}
function padNearestOpen(c:{i:number;j:number}){if(padGrid[c.j*PN+c.i])return c;for(let r=1;r<30;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const i=c.i+dx,j=c.j+dy;if(i>=0&&j>=0&&i<PN&&j<PN&&padGrid[j*PN+i])return{i,j};}return c;}
let fleetField:{key:string;dist:Float32Array}|null=null;
function buildFleetField(t:{i:number;j:number}){
  const D=new Float32Array(PN*PN).fill(Infinity),heap:number[]=[],push=(k:number)=>{heap.push(k);let n=heap.length-1;while(n>0){const p=(n-1)>>1;if(D[heap[p]]<=D[heap[n]])break;[heap[p],heap[n]]=[heap[n],heap[p]];n=p;}},
    pop=()=>{const top=heap[0],last=heap.pop()!;if(heap.length){heap[0]=last;let n=0;for(;;){const l=n*2+1,r=l+1;let m=n;if(l<heap.length&&D[heap[l]]<D[heap[m]])m=l;if(r<heap.length&&D[heap[r]]<D[heap[m]])m=r;if(m===n)break;[heap[m],heap[n]]=[heap[n],heap[m]];n=m;}}return top;};
  const s0=t.j*PN+t.i;D[s0]=0;push(s0);
  while(heap.length){const k=pop(),x=k%PN,y=(k-x)/PN;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=PN||ny>=PN)continue;const j=ny*PN+nx;if(!padGrid[j])continue;if(dx&&dy&&(!padGrid[y*PN+nx]||!padGrid[ny*PN+x]))continue;
    const cl=padClear[j],cost=(dx&&dy?1.414:1)*(cl>=3?1:cl===2?1.8:3.5),nd=D[k]+cost;if(nd<D[j]){D[j]=nd;push(j);}}}
  return D;
}
function routeVia(target:Vec):Vec{
  if(!fleetEnterable()||fleetWideLine(player,target))return target;
  const t=padNearestOpen(padCellOf(target)),key=`${currentMap}:${t.i},${t.j}`;
  if(fleetField?.key!==key)fleetField={key,dist:buildFleetField(t)};
  const D=fleetField.dist;let c=padNearestOpen(padCellOf(player));if(!Number.isFinite(D[c.j*PN+c.i]))return target;
  // Yol boyunca kalın çizgiyle görülebilen en uzak hücre; kıyıya çok yakınken ince çizgiye, o da olmazsa sıradaki hücreye düşülür.
  let way:Vec|null=null,first:Vec|null=null;
  for(let step=0;step<80;step++){const here=D[c.j*PN+c.i];if(here<=0){if(fleetWideLine(player,target)||(!way&&fleetClearLine(player,target)))return target;break;}let next=c,nd=here;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=c.i+dx,j=c.j+dy;if(i<0||j<0||i>=PN||j>=PN)continue;const v=D[j*PN+i];if(v<nd){nd=v;next={i,j};}}
    if(next===c)break;c=next;const cand=padCenter(c.i,c.j);if(!first)first=cand;
    if(fleetWideLine(player,cand))way=cand;else if(!way&&step<3&&fleetClearLine(player,cand))way=cand;else if(way||step>=3)break;}
  return way??first??target;
}
function insideOwnLagoon(p:Vec){return hasFleetIsland()&&fleetOwner()==='player'&&fleetNav(p)===2;}
function navigablePoint(point:Vec){
  const fc=fleetCollision(point);if(fc)return{x:fc.x,y:fc.y};
  for(const island of islands){const shore=island.r*.72+38,d=dist(point,island);if(d<shore){const a=Math.atan2(point.y-island.y,point.x-island.x);return{x:island.x+Math.cos(a)*shore,y:island.y+Math.sin(a)*shore};}}
  return{x:clamp(point.x,25,WORLD_WIDTH-25),y:clamp(point.y,25,WORLD_HEIGHT-25)};
}
function resolveIslandCollision(){
  if(ghostTimer>0)return;
  const fc=fleetCollision(player);if(!fc&&hasFleetIsland())fleetSafe={x:player.x,y:player.y};if(fc){const hard=!fleetSafe||(fc.x!==player.x&&fc.y!==player.y);player.x=fc.x;player.y=fc.y;player.speed*=hard?.5:.9;if(!routeTarget)destination=null;if(collisionNotice<=0){toast(fleetEnterable()?`${fc.name} karasına çıkılamaz — lagüne güneydeki kanaldan girilir`:`${fc.name} rakip filonun adası — içeri girilemez`);collisionNotice=2;}}
  for(const island of islands){const shore=island.r*.72+28,d=dist(player,island);if(d<shore){const a=d>.01?Math.atan2(player.y-island.y,player.x-island.x):player.angle-Math.PI/2;player.x=island.x+Math.cos(a)*shore;player.y=island.y+Math.sin(a)*shore;player.speed*=.28;destination=null;if(collisionNotice<=0){toast(`${island.name} kıyısına daha fazla yaklaşamazsın`);collisionNotice=2;}}}
}
function setZoom(value:number){camera.targetZoom=clamp(value,.5,1.15);ui('zoomValue').textContent=`${Math.round(camera.targetZoom*100)}%`;}
function targetExists(t:Target){return t.kind==='ship'?enemies.includes(t):monsters.includes(t);}
function angleDelta(target:number,current:number){return Math.atan2(Math.sin(target-current),Math.cos(target-current));}
function broadsideCourse(target:Target){
  const bearing=Math.atan2(target.y-player.y,target.x-player.x),right=bearing,left=bearing+Math.PI;
  return Math.abs(angleDelta(right,player.angle))<=Math.abs(angleDelta(left,player.angle))?right:left;
}

// Saldırı menzil dışından başlatılırsa gemi hedefe yaklaşır; kaptan rota verirse yaklaşma biter.
let attackChase=false;
function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;attackChase=state.attacking&&dist(player,selected)>effectiveRange();if(state.attacking){state.repairing=false;fireAtTarget();}ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
function toggleRepair(){
  if(state.hp>=effectiveMaxHp()){toast('Gövde zaten tamamen sağlam');return;}
  const danger=enemies.some(e=>e.aggro&&dist(e,player)<520)||monsters.some(m=>m.aggro&&dist(m,player)<520);
  if(danger||state.attacking){toast('Savaş durumundayken tamir yapılamaz');return;}
  state.repairing=!state.repairing;toast(state.repairing?'Açık deniz tamiri başladı':'Tamir durduruldu');
}
function fireAtTarget(){
  const cannon=CANNONS[state.cannonType];
  if(!selected||ghostTimer>0||player.cooldown>0||dist(player,selected)>effectiveRange())return;
  if(state.ammo==='chain'&&state.chainAmmo<=0){state.ammo='iron';toast('Zincir güllesi tükendi');}
  if(isSpecial(state.ammo)&&arsenal[state.ammo]<=0){toast(`${SPECIAL_AMMO[state.ammo].name} tükendi`);state.ammo='iron';renderQuickSlots();}
  // Seafight mantığı: her top 1 gülle harcar. Stok top sayısından azsa kalan toplar demir gülle atar.
  const stock=state.ammo==='chain'?state.chainAmmo:isSpecial(state.ammo)?arsenal[state.ammo]:Infinity,loaded=Math.min(state.cannon,stock);
  const ammoMult=state.ammo==='chain'?CHAIN_FACTOR:isSpecial(state.ammo)?SPECIAL_AMMO[state.ammo].damage:1,mix=state.cannon>0?(loaded*ammoMult+(state.cannon-loaded))/state.cannon:1;
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),tx=selected.x-player.x,ty=selected.y-player.y;
  const side=fx*ty-fy*tx>0?-1:1,damage=state.cannon*BALL_DAMAGE*(1+upgrades.damage*.11)*cannon.damage*bonus.damage*mix*(1+equipBonus().damage+achBonus().damage)*eliteDamageMult(selected)*useConsumable('powder');
  salvoQueue.push({delay:0,target:selected,side,slot:0,damage,ammo:state.ammo});
  if(state.ammo==='chain'){state.chainAmmo-=loaded;saveAccount();}
  else if(isSpecial(state.ammo)){arsenal[state.ammo]-=loaded;saveArsenal(arsenal);renderQuickSlots();gainElitePoints(loaded*ELITE_POINTS_PER_BALL[state.ammo]);bumpAch('eliteBalls',loaded);}
  player.cooldown=(1-equipBonus().reload)*cannon.reload*Math.max(.6,1-upgrades.reload*.04)*bonus.reload*(state.ammo==='chain'?1.18:1)*(isSpecial(state.ammo)?SPECIAL_AMMO[state.ammo].reload:1);
}
function gainElitePoints(ep:number){
  if(ep<=0)return;const before=eliteLevelFromEp(state.elitePoints);state.elitePoints+=ep;const after=eliteLevelFromEp(state.elitePoints);saveAccount();
  if(after>before&&elitePurchased){const ship=ELITE_SHIPS.find(x=>x.level===after);rewardNotice(`ELİT ${after} AÇILDI${ship?`   ${ship.name.toLocaleUpperCase('tr')}`:''}`);toast('Yeni elit gemi TERSANE\'de açıldı');}
}
// Elit puan çubuğu: mevcut elit seviyesinden bir sonrakine ilerleme
function eliteProgress(){const lvl=eliteLevelFromEp(state.elitePoints),lo=eliteLevelEp(lvl),hi=lvl>=ELITE_MAX_LEVEL?lo:eliteLevelEp(lvl+1);
  return{text:lvl>=ELITE_MAX_LEVEL?`${Math.floor(state.elitePoints).toLocaleString('tr-TR')} · AZAMİ`:`${Math.floor(state.elitePoints).toLocaleString('tr-TR')} / ${hi.toLocaleString('tr-TR')}`,pct:lvl>=ELITE_MAX_LEVEL?100:Math.min(100,(state.elitePoints-lo)/(hi-lo)*100)};}
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
  muzzleFlash(x,y,Math.atan2(muzzle.y,muzzle.x));
}
function enemyFire(e:Enemy){
  if(stealthTimer>0){e.cooldown=Math.max(e.cooldown,.4);return;}
  if(e.boss){bossFire(e);return;}
  const a=Math.atan2(player.y-e.y,player.x-e.x);playEnemyCannon(dist(e,player),(e.x-player.x)/600);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy',damage:e.damage*(.85+Math.random()*.3),hit:false,ammo:'iron'}); e.cooldown=e.reload+Math.random()*.55;muzzleFlash(e.x+Math.cos(a)*16,e.y+Math.sin(a)*16,a,54);
}
function monsterFire(m:Monster){if(stealthTimer>0){m.cooldown=Math.max(m.cooldown,.4);return;}const a=Math.atan2(player.y-m.y,player.x-m.x);playSplash();for(const off of m.def.tier>=5?[-.12,0,.12]:[0])shots.push({x:m.x,y:m.y,vx:Math.cos(a+off)*210,vy:Math.sin(a+off)*210,life:2.4,owner:'enemy',damage:m.def.damage*(.85+Math.random()*.3),hit:false,ammo:'iron',visual:'spit'});m.cooldown=m.def.reload;}
// Batınca bulunduğun denizde, düşmanlardan uzak rastgele bir noktada %10 gövdeyle yeniden doğ.
function respawn(){
  const deathMap=currentMap;
  currentMap=deathMap;
  try{localStorage.setItem(WORLD_STORAGE,deathMap);}catch{}
  const spot=randomSafePlayerPoint();
  player.x=spot.x;player.y=spot.y;player.speed=0;destination=null;routeTarget=null;camera.x=player.x;camera.y=player.y;
  fleetSafe={x:spot.x,y:spot.y};collisionNotice=0;
  state.hp=Math.max(1,Math.round(effectiveMaxHp()*.1));state.repairing=true;state.invulnerable=4;state.attacking=false;selected=null;shots.length=0;salvoQueue.length=0;
  enemies.forEach(e=>{e.aggro=false;e.combatTimer=0;});monsters.forEach(m=>{m.aggro=false;m.combatTimer=0;});ui('attack').classList.remove('active');
  mapFade=1;playSplash();saveAccount();toast(`Gemin battı — ${mapDef().key} ${coordLabel(player)} konumunda %10 gövdeyle yeniden doğdun`);
}
// Vuruş: patlama animasyonu, savrulup suya düşen tahta kıymıkları, korlar ve yükselen duman
function burst(x:number,y:number,large=false){
  const R=Math.random,TAU=Math.PI*2;particles.push({x,y,vx:0,vy:0,life:large?.95:.6,maxLife:large?.95:.6,kind:'explosion',size:large?250:150});
  for(let n=0;n<(large?10:4);n++){const a=R()*TAU,sp=40+R()*(large?130:70);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,life:1+R()*.8,maxLife:1.8,kind:'splinter',z:8,vz:90+R()*(large?170:110),rot:R()*6,vr:(R()-.5)*16,size:32+R()*16,variant:n%3});}
  for(let n=0;n<(large?12:5);n++){const a=R()*TAU,sp=50+R()*(large?150:90);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,life:.4+R()*.5,maxLife:.9,kind:'spark',z:10,vz:60+R()*140,size:20});}
  for(let n=0;n<(large?4:2);n++)particles.push({x:x+(R()-.5)*20,y:y+(R()-.5)*14,vx:(R()-.5)*14,vy:-10-R()*10,life:1.2+R()*.8,maxLife:2,kind:'smoke',z:14,size:large?80:52,variant:n%4,rot:R()*6});
  if(large)for(let n=0;n<4;n++){const a=R()*TAU,sp=20+R()*40;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,life:3+R()*2,maxLife:5,kind:'plank',rot:R()*6,vr:(R()-.5)*1.2,size:52+R()*16});}
}
// Iska: suya düşen güllenin su sütunu ve köpük halkası
// Oyuncuya uzaklığa göre ses seviyesi (0..1)
function earGain(p:Vec){return Math.max(0,Math.min(1,1.15-dist(p,player)/900));}
function splashAt(x:number,y:number,size=110){const eg=earGain({x,y});if(eg>.05)playSplash(eg*.8);particles.push({x,y,vx:0,vy:0,life:.75,maxLife:.75,kind:'splash',size});for(let n=0;n<3;n++)particles.push({x:x+(Math.random()-.5)*18,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*16,vy:(Math.random()-.5)*10,life:.9,maxLife:.9,kind:'foam',size:34,variant:n%2});}
// Özel güllelerin isabet etkisi: patlayıcı çevreye alan hasarı, can emici oyuncuyu onarır
function ammoImpact(s:Shot,target:Target,hit:number){
  if(s.owner!=='player')return;
  if(s.ammo==='explosive'){const def=SPECIAL_AMMO.explosive,R=def.blastRadius;particles.push({x:target.x,y:target.y,vx:0,vy:0,life:.5,maxLife:.5,kind:'shock',size:R*2});burst(target.x,target.y,true);playExplosion(false);
    const victims=([...enemies,...monsters] as Target[]).filter(o=>o!==target&&dist(o,target)<R);
    for(const o of victims){const dmg=Math.round(hit*def.blastFactor);o.hp-=dmg;o.aggro=true;damageText(o.x,o.y,dmg);if(o.hp<=0){if(o.kind==='ship')sinkEnemy(o);else defeatMonster(o);}}}
  if(s.ammo==='leech'){const heal=hit*SPECIAL_AMMO.leech.leech;playHeal();state.hp=Math.min(effectiveMaxHp(),state.hp+heal);
    for(let n=0;n<4;n++){const a=Math.atan2(player.y-target.y,player.x-target.x)+(Math.random()-.5)*.8,sp=dist(player,target)/.7;particles.push({x:target.x,y:target.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.7,maxLife:.7,kind:'soul',z:18,size:26});}}
}
// Namlu alevi ve top dumanı
function muzzleFlash(x:number,y:number,angle:number,size=64){particles.push({x,y,vx:0,vy:0,life:.13,maxLife:.13,kind:'flash',rot:angle,size,z:6});for(let n=0;n<2;n++)particles.push({x,y,vx:Math.cos(angle)*(30+n*25)+(Math.random()-.5)*10,vy:Math.sin(angle)*(30+n*25)+(Math.random()-.5)*10,life:.9+Math.random()*.4,maxLife:1.3,kind:'smoke',z:6,size:36+n*10,variant:(n+Math.floor(Math.random()*4))%4,rot:Math.random()*6});}
const wrecks:Wreck[]=[];
const WRECK_TIME=1.8;
function damageText(x:number,y:number,value:number){particles.push({x,y,vx:0,vy:-24,life:1,maxLife:1,kind:'damage',text:`-${Math.round(value).toLocaleString('tr-TR')}`});}
let toastTimer=0;
function toast(msg:string){ui('toast').textContent=msg;ui('toast').classList.add('show');toastTimer=2.2;}
let rewardTimer=0;
const rewardQueue:string[]=[];
function showReward(msg:string){ui('rewardToast').textContent=msg;ui('rewardToast').classList.remove('show');void ui('rewardToast').offsetWidth;ui('rewardToast').classList.add('show');rewardTimer=2.6;}
function rewardNotice(msg:string){if(rewardTimer>0){rewardQueue.push(msg);return;}showReward(msg);}
function saveQuestState(){localStorage.setItem(QUEST_STORAGE,JSON.stringify({active:state.activeQuest,progress:questProgress,cooldowns:questCooldownUntil}));}
function saveAccount(){localStorage.setItem(ACCOUNT_STORAGE,JSON.stringify({pearls:state.pearls,gold:state.gold,fame:state.fame,level:state.level,maxHp:state.maxHp,hp:state.hp,chainAmmo:state.chainAmmo,elitePoints:state.elitePoints,battlePoints:state.battlePoints,cannonType:state.cannonType,cannonInventory,mountedCannons,equipOwned,equipped,quickSlots,upgrades,eliteShip:activeEliteShip,specialOwned,activeSkin,activeShip,elitePurchased,currentMap}));try{localStorage.setItem(WORLD_STORAGE,currentMap);}catch{}}
function effectiveRange(){return(CANNONS[state.cannonType].range+upgrades.range*18+bonus.range+equipBonus().range+(elitePassive('jade')?20:0))*(state.ammo==='grape'?SPECIAL_AMMO.grape.rangeFactor:1);}
function effectiveSpeed(){return(128+upgrades.speed*5)*bonus.speed*(1+equipBonus().speed)*(abilityActive('speed')?SPEED_BOOST:1)*(elitePassive('tempest')?1.05:1)*(elitePassive('sand')?1.1:1)*(stealthTimer>0?1.3:1);}
function cannonCapacity(){return BASE_CANNONS+upgrades.hull*CANNONS_PER_HULL+(eliteEnabled()?eliteShip().level*CANNONS_PER_ELITE:0);}
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
// Envanter (Seafight tarzı): solda depo, sağda gemi ızgarası; küçük top simgeleri adetleriyle durur.
// Simgeye dokunup adet yazılır, oklarla taşınır; ya da simge öteki tarafa sürüklenir (sağa: gemiye, sola: depoya).
let invSelected:CannonKind='cast',invMode:'cannon'|'equip'='cannon',invEquipSel:string|null=null;
const INV_CELLS=9;
function renderShipMenu(){
  document.querySelectorAll<HTMLButtonElement>('[data-inv-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.invMode===invMode);b.onclick=()=>{invMode=b.dataset.invMode as typeof invMode;renderShipMenu();};});
  if(invMode==='equip'){renderEquipInventory();return;}
  state.cannon=mountedCannonCount();const activeCannon=CANNONS[state.cannonType],kinds=Object.keys(CANNONS) as CannonKind[];
  ui('shipSummary').innerHTML=`<b>${state.cannon} / ${cannonCapacity()}</b><small>SALVO HASARI ${Math.round(state.cannon*BALL_DAMAGE*(1+equipBonus().damage)*(1+upgrades.damage*.11)*activeCannon.damage*bonus.damage)}</small>`;
  const tiles=(side:'depot'|'ship')=>{const list=kinds.filter(k=>(side==='ship'?mountedCannons[k]:cannonInventory[k])>0);
    return list.map(k=>`<button class="inv-tile ${invSelected===k?'selected':''} ${side==='ship'&&state.cannonType===k?'active':''}" data-inv="${k}" data-side="${side}" title="${CANNONS[k].name} Top">${cannonAsset(k)}<b>${side==='ship'?mountedCannons[k]:cannonInventory[k]}</b>${side==='ship'&&state.cannonType===k?'<i>AKTİF</i>':''}</button>`).join('')+'<span class="inv-empty"></span>'.repeat(Math.max(0,INV_CELLS-list.length));};
  ui('invDepot').innerHTML=tiles('depot');ui('invShip').innerHTML=tiles('ship');
  const c=CANNONS[invSelected],active=state.cannonType===invSelected,prev=(document.getElementById('invAmount') as HTMLInputElement|null)?.value??'1';
  ui('cannonRows').innerHTML=`<div class="inv-info-art">${cannonAsset(invSelected)}</div><h3>${c.name} Top</h3>
    <dl><dt>Hasar</dt><dd>×${c.damage.toFixed(2)}</dd><dt>Menzil</dt><dd>${c.range}</dd><dt>Dolum</dt><dd>${c.reload.toFixed(2)} sn</dd><dt>Depoda</dt><dd>${cannonInventory[invSelected]}</dd><dt>Gemide</dt><dd>${mountedCannons[invSelected]}</dd></dl>
    <label class="inv-amount"><span>Adet</span><input type="number" min="1" value="${prev}" id="invAmount"/><button type="button" id="invAll" title="Hepsini seç">HEPSİ</button></label>
    <button class="inv-equip" id="invEquip" ${mountedCannons[invSelected]<=0||active?'disabled':''}>${active?'AKTİF TOP':'AKTİF YAP'}</button>`;
  const amount=()=>Math.max(1,Math.floor(Number((ui('invAmount') as HTMLInputElement).value)||1));
  ui('invAll').onclick=()=>{(ui('invAmount') as HTMLInputElement).value=String(Math.max(cannonInventory[invSelected],mountedCannons[invSelected],1));};
  ui('invToShip').onclick=()=>{if(cannonInventory[invSelected]<=0){toast('Depoda bu toptan yok');return;}moveCannon(invSelected,true,amount());};
  ui('invToDepot').onclick=()=>{if(mountedCannons[invSelected]<=0){toast('Gemide bu toptan yok');return;}moveCannon(invSelected,false,amount());};
  ui('invEquip').onclick=()=>equipCannon(invSelected);
  bindCannonDrag();
}
// Donanım bölümü: depoda sahip olunan parçalar, gemide 4 yuva (yelken, pruva heykeli, gövde zırhı, top kundağı)
function renderEquipInventory(){
  const b=equipBonus();ui('shipSummary').innerHTML=`<b>${EQUIP_SLOTS.filter(s=>equipped[s.id]).length} / ${EQUIP_SLOTS.length}</b><small>TAKILI DONANIM</small>`;
  const owned=EQUIPMENT.filter(e=>(equipOwned[e.id]??0)>0);
  ui('invDepot').innerHTML=owned.map(e=>`<button class="inv-tile equip-tile rarity-${e.rarity} ${invEquipSel===e.id?'selected':''}" data-inv="${e.id}" data-side="depot" title="${e.name}">${equipIcon(e.id)}<b>${equipOwned[e.id]}</b></button>`).join('')+'<span class="inv-empty"></span>'.repeat(Math.max(0,INV_CELLS-owned.length));
  ui('invShip').innerHTML=EQUIP_SLOTS.map(sl=>{const id=equipped[sl.id],e=id?equipById(id):undefined;
    return e?`<button class="inv-tile equip-tile rarity-${e.rarity} ${invEquipSel===e.id?'selected':''}" data-inv="${e.id}" data-side="ship" title="${e.name}">${equipIcon(e.id)}<small class="slot-name">${sl.name}</small></button>`:`<span class="inv-empty equip-slot"><small>${sl.name}</small></span>`;}).join('');
  const e=invEquipSel?equipById(invEquipSel):undefined;
  ui('cannonRows').innerHTML=e?`<div class="inv-info-art">${equipIcon(e.id,'equip-icon big')}</div><h3>${e.name}</h3><dl><dt>Yuva</dt><dd>${EQUIP_SLOTS.find(s=>s.id===e.slot)!.name}</dd><dt>Nadirlik</dt><dd class="rarity-text-${e.rarity}">${RARITY_NAMES[e.rarity]}</dd><dt>Etki</dt><dd>${equipStatText(e.stats)}</dd><dt>Depoda</dt><dd>${equipOwned[e.id]??0}</dd><dt>Gemide</dt><dd>${equipped[e.slot]===e.id?'Takılı':'—'}</dd></dl>
    <button class="inv-equip" id="invEquipToggle">${equipped[e.slot]===e.id?'YUVADAN ÇIKAR':'GEMİYE TAK'}</button>`
    :`<h3>Donanım</h3><p class="inv-hint">Bir parçaya dokun. Sağa sürükle ya da ➡ ile gemiye tak; ⬅ ile depoya al.</p><dl><dt>Hız</dt><dd>+%${Math.round(b.speed*100)}</dd><dt>Top hasarı</dt><dd>+%${Math.round(b.damage*100)}</dd><dt>Can</dt><dd>+%${Math.round(b.hp*100)}</dd><dt>Dolum</dt><dd>−%${Math.round(b.reload*100)}</dd><dt>Menzil</dt><dd>+${b.range}</dd></dl>`;
  const toggle=document.getElementById('invEquipToggle');if(toggle&&e)toggle.onclick=()=>equipped[e.slot]===e.id?unequipSlot(e.slot):equipItem(e.id);
  ui('invToShip').onclick=()=>{if(!e)return;equipItem(e.id);};ui('invToDepot').onclick=()=>{if(!e)return;if(equipped[e.slot]===e.id)unequipSlot(e.slot);else toast('Bu parça gemide takılı değil');};
  bindCannonDrag();
}
function equipItem(id:string){
  const e=equipById(id);if(!e)return;if((equipOwned[id]??0)<=0){toast('Depoda bu parçadan yok — DONANIM sekmesinden alabilirsin');return;}
  const prev=equipped[e.slot];if(prev===id)return;const oldMax=effectiveMaxHp();if(prev)equipOwned[prev]=(equipOwned[prev]??0)+1;equipOwned[id]-=1;equipped[e.slot]=id;
  state.hp=Math.min(effectiveMaxHp(),state.hp*effectiveMaxHp()/oldMax);saveAccount();renderShipMenu();updateUI();toast(`${e.name} takıldı`);
}
function unequipSlot(slot:EquipSlot){
  const id=equipped[slot];if(!id)return;const oldMax=effectiveMaxHp();equipped[slot]=null;equipOwned[id]=(equipOwned[id]??0)+1;
  state.hp=Math.min(effectiveMaxHp(),state.hp*effectiveMaxHp()/oldMax);saveAccount();renderShipMenu();updateUI();toast(`${equipById(id)?.name} depoya alındı`);
}
function bindCannonDrag(){
  document.querySelectorAll<HTMLElement>('.inv-tile').forEach(tile=>tile.onpointerdown=ev=>{
    if(ev.button>0)return;const kind=tile.dataset.inv as CannonKind,fromShip=tile.dataset.side==='ship',equipMode=invMode==='equip';ev.preventDefault();
    if(equipMode){if(invEquipSel!==tile.dataset.inv){invEquipSel=tile.dataset.inv!;renderShipMenu();}}else if(invSelected!==kind){invSelected=kind;renderShipMenu();}
    const target=ui(fromShip?'invDepot':'invShip'),ghost=document.createElement('div');let moved=false;ghost.className='cannon-drag-ghost';ghost.innerHTML=equipMode?equipIcon(tile.dataset.inv!):cannonAsset(kind);
    const over=(e:PointerEvent)=>{const r=target.getBoundingClientRect(),dx=e.clientX-ev.clientX;return(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)||(fromShip?dx<-70:dx>70);};
    const move=(e:PointerEvent)=>{if(!moved&&Math.hypot(e.clientX-ev.clientX,e.clientY-ev.clientY)>6){moved=true;document.body.append(ghost);}if(!moved)return;ghost.style.transform=`translate(${e.clientX-32}px,${e.clientY-28}px)`;target.classList.toggle('drop-target',over(e));};
    const up=(e:PointerEvent)=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);ghost.remove();target.classList.remove('drop-target');
      if(moved&&e.type!=='pointercancel'&&over(e)){if(equipMode){const it=equipById(tile.dataset.inv!);if(it){if(fromShip)unequipSlot(it.slot);else equipItem(it.id);}return;}const input=document.getElementById('invAmount') as HTMLInputElement|null;moveCannon(kind,!fromShip,Math.max(1,Math.floor(Number(input?.value)||1)));}};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  });
}
// Top dükkânı: toplar altınla alınır ve depoya gider.
// Döküm top altınla; uzun, seri ve ağır toplar inciyle alınır (inci fiyatı sırasıyla artar).
const CANNON_PRICES:Record<CannonKind,Price>={cast:{amount:40,currency:'gold'},long:{amount:1,currency:'pearls'},rapid:{amount:2,currency:'pearls'},heavy:{amount:3,currency:'pearls'}};
function equipIcon(id:string,cls='equip-icon'){const e=equipById(id);return e?`<i class="${cls} rarity-${e.rarity}" style="${equipIconStyle(e)}"></i>`:'';}
function openEquipShop(){renderEquipShop();ui('equipShopOverlay').classList.add('open');}
function closeEquipShop(){ui('equipShopOverlay').classList.remove('open');}
function renderEquipShop(){
  renderBuyRows('equipShopList',EQUIPMENT.map(e=>({id:e.id,name:e.name,art:`<div class="ammo-icon equip-shop-art rarity-${e.rarity}">${equipIcon(e.id)}<b>${equipOwned[e.id]??0}</b></div>`,
    desc:`${EQUIP_SLOTS.find(s=>s.id===e.slot)!.name} · ${RARITY_NAMES[e.rarity]} · ${equipStatText(e.stats)}`,note:`Depoda ${equipOwned[e.id]??0}${equipped[e.slot]===e.id?' · Gemide takılı':''} · ENVANTER → DONANIM'dan gemiye tak`,unit:e.price,
    give:(n:number)=>{equipOwned[e.id]=(equipOwned[e.id]??0)+n;},after:renderEquipShop})));
}
function openCannonShop(){renderCannonShop();ui('cannonShopOverlay').classList.add('open');}
function closeCannonShop(){ui('cannonShopOverlay').classList.remove('open');}
function renderCannonShop(){
  renderBuyRows('cannonShopList',(Object.keys(CANNONS) as CannonKind[]).map(kind=>{const c=CANNONS[kind];return{id:kind,name:`${c.name} Top`,art:`<div class="ammo-icon cannon-shop-art">${cannonAsset(kind)}</div>`,
    desc:`Hasar ×${c.damage.toFixed(2)} · Menzil ${c.range} · Dolum ${c.reload.toFixed(2)} sn`,note:`Depoda ${cannonInventory[kind]} · Gemide ${mountedCannons[kind]} · Toplar depoya gider`,unit:CANNON_PRICES[kind],
    give:(n:number)=>{cannonInventory[kind]+=n;},after:renderCannonShop};}));
}
// Gemi değişince (ör. elitten başlangıç gemisine) yuva sayısı düşebilir; taşan toplar depoya iner.
function fitCannonsToCapacity(){
  let over=mountedCannonCount()-cannonCapacity();if(over<=0)return;
  for(const kind of ['cast','long','rapid','heavy'] as CannonKind[]){if(kind===state.cannonType)continue;const n=Math.min(over,mountedCannons[kind]);mountedCannons[kind]-=n;cannonInventory[kind]+=n;over-=n;if(over<=0)break;}
  if(over>0){const n=Math.min(over,mountedCannons[state.cannonType]-1);mountedCannons[state.cannonType]-=n;cannonInventory[state.cannonType]+=n;}
  state.cannon=mountedCannonCount();toast('Yeni geminin top yuvası daha az — fazla toplar depoya indirildi');
}
function moveCannon(kind:CannonKind,toShip:boolean,amount=1){
  if(toShip){amount=Math.min(amount,cannonInventory[kind],cannonCapacity()-mountedCannonCount());if(amount<=0){toast(`Gemide yer yok (${cannonCapacity()} top sınırı)`);return;}cannonInventory[kind]-=amount;mountedCannons[kind]+=amount;}
  else{amount=Math.min(amount,mountedCannons[kind],mountedCannonCount()-1);if(amount<=0){toast('Gemide en az 1 top kalmalı');return;}mountedCannons[kind]-=amount;cannonInventory[kind]+=amount;if(state.cannonType===kind&&mountedCannons[kind]===0){state.cannonType=(Object.keys(mountedCannons) as CannonKind[]).find(type=>mountedCannons[type]>0)||'cast';}}
  state.cannon=mountedCannonCount();saveAccount();renderShipMenu();updateUI();
}
function openEliteShips(){previewShip=activeShip;renderEliteShips();ui('eliteShipOverlay').classList.add('open');}
function closeEliteShips(){ui('eliteShipOverlay').classList.remove('open');}
function equipStarterShip(){
  const oldMax=effectiveMaxHp();activeShip='starter';activeSkin=null;state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*effectiveMaxHp()/oldMax));fitCannonsToCapacity();eliteAbility.active=0;eliteAbility.cooldown=0;saveAccount();renderEliteShips();updateUI();toast('Başlangıç gemisi seçildi');
}
function purchaseEliteOne(){
  if(elitePurchased)return;
  if(state.pearls<ELITE_ONE_PRICE){toast(`Elit 1 için ${ELITE_ONE_PRICE} İnci gerekli`);return;}
  state.pearls-=ELITE_ONE_PRICE;elitePurchased=true;activeEliteShip='phantom';activeShip='phantom';activeSkin=null;previewShip='phantom';eliteAbility.active=0;eliteAbility.cooldown=0;saveAccount();renderEliteShips();updateUI();rewardNotice('ELİT 1 AÇILDI   HAYALET KADIRGA');toast('Hayalet Kadırga satın alındı');
}
function renderSpecialShips(){
  ui('eliteShipGrid').innerHTML=SPECIAL_SHIPS.map(sp=>{const owned=specialOwned.includes(sp.id);return`<button class="elite-card special-card ${activeSkin===sp.id?'active':''} ${previewSpecial===sp.id?'previewed':''}" data-special="${sp.id}"><span class="elite-level">ÖZEL</span><img class="elite-art" src="${sp.art}?r=${SHIP_ART_REV}" alt="${sp.name}" draggable="false"/><strong>${sp.name}</strong><small>Özel görünüm</small>${owned?'':`<b>${sp.price.toLocaleString('tr-TR')} İnci</b>`}</button>`;}).join('');
  ui('eliteShipGrid').querySelectorAll<HTMLElement>('[data-special]').forEach(el=>el.onclick=()=>{previewSpecial=el.dataset.special!;renderEliteShips();});
  const sp=specialById(previewSpecial)??SPECIAL_SHIPS[0],owned=specialOwned.includes(sp.id),active=activeSkin===sp.id;
  const label=active?'AKTİF GEMİ':owned?'GEMİYİ SEÇ':ELITE_TEST_MODE?'TEST ET':`SATIN AL · ${sp.price.toLocaleString('tr-TR')} İNCİ`;
  ui('eliteShipDetail').innerHTML=`<span class="eyebrow">Özel gemi</span><img class="elite-art elite-preview" src="${sp.art}?r=${SHIP_ART_REV}" alt="${sp.name}" draggable="false"/><h3>${sp.name}</h3><em>${sp.english}</em><b>Yalnızca görünüm</b><dl><dt>Gemi</dt><dd>Başlangıç gemisi gücünde: ${BASE_HP.toLocaleString('tr-TR')} temel can · ${BASE_CANNONS} top yuvası</dd><dt>Açıklama</dt><dd>${sp.description}</dd><dt>Fiyat</dt><dd>${owned?'Satın alındı':`${sp.price.toLocaleString('tr-TR')} İnci (bir kez)`}</dd></dl><button id="equipSpecialShip" ${active?'disabled':''}>${label}</button>`;
  const button=document.getElementById('equipSpecialShip') as HTMLButtonElement|null;if(button&&!button.disabled)button.onclick=()=>equipSpecialShip(sp.id);
}
function equipSpecialShip(id:string){
  const sp=specialById(id);if(!sp)return;
  if(!specialOwned.includes(id)&&!ELITE_TEST_MODE){if(state.pearls<sp.price){toast(`${sp.name} için ${sp.price.toLocaleString('tr-TR')} İnci gerekli`);return;}state.pearls-=sp.price;specialOwned.push(id);rewardNotice(`ÖZEL GEMİ   ${sp.name.toLocaleUpperCase('tr')}`);}
  const oldMax=effectiveMaxHp();activeShip='starter';activeSkin=id;state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*effectiveMaxHp()/oldMax));fitCannonsToCapacity();eliteAbility.active=0;eliteAbility.cooldown=0;
  saveAccount();renderEliteShips();updateUI();toast(`${sp.name} seçildi`);
}
function renderEliteShips(){
  document.querySelectorAll<HTMLButtonElement>('[data-ship-page]').forEach(b=>{b.classList.toggle('active',b.dataset.shipPage===shipPage);b.onclick=()=>{shipPage=b.dataset.shipPage as 'elite'|'special';renderEliteShips();};});
  if(shipPage==='special'){renderSpecialShips();return;}
  const unlocked=ELITE_TEST_MODE?ELITE_MAX_LEVEL:elitePurchased?eliteLevelFromEp(state.elitePoints):0;
  const starter=`<button class="elite-card starter-card ${activeShip==='starter'&&!activeSkin?'active':''}" data-starter><span class="elite-level">BAŞLANGIÇ</span><span class="starter-ship-art" role="img" aria-label="Yedi Deniz başlangıç gemisi"></span><strong>Yedi Deniz</strong><small>Başlangıç gemisi · Özel güç yok</small></button>`;
  const eliteCards=ELITE_SHIPS.map(ship=>{const locked=ship.level>unlocked;return`<button class="elite-card ${activeShip===ship.id?'active':''} ${locked?'locked':''}" data-elite="${ship.id}"><span class="elite-level">ELİT ${ship.level}</span><img class="elite-art" src="${eliteArtUrl(ship.id)}" alt="${ship.name}" draggable="false"/><strong>${ship.name}</strong><small>${ship.english}</small>${locked?`<b>🔒 ${ship.level===1?`${ELITE_ONE_PRICE} İnci ile açılır`:`${eliteLevelEp(ship.level).toLocaleString('tr-TR')} Elit Puan gerekli`}</b>`:''}</button>`}).join('');
  ui('eliteShipGrid').innerHTML=starter+eliteCards;
  ui('eliteShipGrid').querySelector<HTMLElement>('[data-starter]')!.onclick=()=>{previewShip='starter';renderEliteShips();};
  ui('eliteShipGrid').querySelectorAll<HTMLElement>('[data-elite]').forEach(el=>el.onclick=()=>{previewShip=el.dataset.elite as EliteShipId;renderEliteShips();});
  if(previewShip==='starter'){
    ui('eliteShipDetail').innerHTML=`<span class="eyebrow">Başlangıç gemisi</span><div class="starter-preview" role="img" aria-label="Yedi Deniz başlangıç gemisi"></div><h3>Yedi Deniz</h3><em>Kaptanın ilk gemisi</em><b>Dengeli başlangıç sınıfı</b><dl><dt>Gemi</dt><dd>${BASE_HP.toLocaleString('tr-TR')} temel can · ${BASE_CANNONS} top yuvası</dd><dt>Özellik</dt><dd>Elit pasifi veya özel yeteneği yoktur. Oyuna başlayan her kaptanda ücretsiz bulunur.</dd></dl><button id="equipStarter" ${activeShip==='starter'&&!activeSkin?'disabled':''}>${activeShip==='starter'&&!activeSkin?'AKTİF GEMİ':'GEMİYİ SEÇ'}</button>`;
    const button=document.getElementById('equipStarter') as HTMLButtonElement|null;if(button&&!button.disabled)button.onclick=equipStarterShip;return;
  }
  const ship=eliteById(previewShip),locked=ship.level>unlocked;
  ui('eliteShipDetail').innerHTML=`<span class="eyebrow">Elit ${ship.level}</span><img class="elite-art elite-preview" src="${eliteArtUrl(ship.id)}" alt="${ship.name}" draggable="false"/><h3>${ship.name}</h3><em>${ship.english}</em><dl><dt>Gemi</dt><dd>${(BASE_HP+ship.level*HP_PER_ELITE).toLocaleString('tr-TR')} temel can · ${BASE_CANNONS+ship.level*CANNONS_PER_ELITE} top yuvası</dd><dt>Rol</dt><dd>${ship.role}</dd><dt>Pasif</dt><dd>${ship.passive}</dd><dt>Özel yetenek</dt><dd><b>${ship.ability}</b> — ${ship.abilityDescription} <small>(${ELITE_COOLDOWN} sn bekleme)</small></dd></dl><button id="equipEliteShip" ${ship.level>1&&locked||activeShip===ship.id?'disabled':''}>${activeShip===ship.id?'AKTİF GEMİ':ELITE_TEST_MODE?'TEST ET':ship.level===1&&!elitePurchased?`SATIN AL · ${ELITE_ONE_PRICE} İNCİ`:locked?'KİLİTLİ':'GEMİYİ SEÇ'}</button>`;
  const equip=document.getElementById('equipEliteShip') as HTMLButtonElement|null;if(equip&&!equip.disabled)equip.onclick=()=>{if(ship.level===1&&!elitePurchased&&!ELITE_TEST_MODE){purchaseEliteOne();return;}const oldMax=effectiveMaxHp();activeEliteShip=ship.id;activeShip=ship.id;activeSkin=null;state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*effectiveMaxHp()/oldMax));fitCannonsToCapacity();eliteAbility.active=0;eliteAbility.cooldown=0;saveAccount();renderEliteShips();updateUI();toast(`${ship.name} amiral gemisi seçildi`);};
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
  if(mountedCannons[kind]<=0){toast('Önce bu topu gemiye yerleştir');return;}
  state.cannonType=kind;player.cooldown=0;saveAccount();renderShipMenu();updateUI();toast(`${CANNONS[kind].name} Top kuşanıldı`);
}
function requestUpgrade(kind:UpgradeKind){pendingUpgrade=kind;renderUpgrades();}
function buyUpgrade(){
  if(!pendingUpgrade)return;const kind=pendingUpgrade,cost=upgradeCost(kind);
  if(state.pearls<cost){toast('Bu geliştirme için yeterli İncin yok');return;}
  state.pearls-=cost;upgrades[kind]++;
  if(kind==='hull'){state.maxHp=baseMaxHp();state.hp=Math.min(effectiveMaxHp(),state.hp+HP_PER_HULL);}
  pendingUpgrade=null;saveAccount();renderUpgrades();updateUI();rewardNotice(`${UPGRADES[kind].name}   SEVİYE ${upgrades[kind]}`);
}
// Ortak satın alma satırı: adet kutusu + anlık toplam; SATIN AL onay penceresi açar, onaylanınca alınır.
type BuyRow={id:string;name:string;art:string;desc:string;note?:string;unit:Price;give:(n:number)=>void;after:()=>void};
const CURRENCY_NAME={gold:'altın',pearls:'inci'} as const;
const wallet=(c:Price['currency'])=>c==='gold'?state.gold:state.pearls;
const BUY_MAX=100000;
const fmt=(n:number)=>n.toLocaleString('tr-TR');
let pendingBuy:{row:BuyRow;qty:number}|null=null;
function renderBuyRows(listId:string,rows:BuyRow[]){
  const list=ui(listId);
  list.innerHTML=rows.map(r=>`<article class="market-item buy-row" data-row="${r.id}">${r.art}<div><h4>${r.name}</h4><p>${r.desc}</p>${r.note?`<small>${r.note}</small>`:''}<em class="${r.unit.currency}">Birim fiyat: ${r.unit.per&&r.unit.per>1?`${fmt(r.unit.per)} adet = `:''}${fmt(r.unit.amount)} ${CURRENCY_NAME[r.unit.currency]}</em></div><div class="buy-box"><input type="number" inputmode="numeric" min="1" max="${BUY_MAX}" placeholder="Adet" aria-label="${r.name} adedi"/><span class="buy-total">Toplam: —</span><button disabled>SATIN AL</button></div></article>`).join('');
  list.querySelectorAll<HTMLElement>('.buy-row').forEach((el,i)=>{const r=rows[i],input=el.querySelector('input')!,total=el.querySelector<HTMLElement>('.buy-total')!,btn=el.querySelector('button')!;
    const qty=()=>{const n=Math.floor(Number(input.value));return Number.isFinite(n)&&n>0?Math.min(BUY_MAX,n):0;};
    const sync=()=>{const n=qty(),cost=priceOf(r.unit,n);total.textContent=n?`Toplam: ${fmt(cost)} ${CURRENCY_NAME[r.unit.currency]}`:'Toplam: —';total.classList.toggle('short',cost>wallet(r.unit.currency));btn.disabled=!n;};
    input.oninput=sync;input.onkeydown=e=>{if(e.key==='Enter'&&qty())askBuy(r,qty());};btn.onclick=()=>askBuy(r,qty());});
}
function askBuy(row:BuyRow,qty:number){
  if(!qty)return;const cur=row.unit.currency,cn=CURRENCY_NAME[cur],have=wallet(cur),cost=priceOf(row.unit,qty),box=ui('buyConfirm'),enough=have>=cost;pendingBuy={row,qty};
  box.innerHTML=`<section><h3>SATIN ALMAYI ONAYLA</h3><p><b>${fmt(qty)} × ${row.name}</b></p><dl><dt>Birim fiyat</dt><dd>${row.unit.per&&row.unit.per>1?`${fmt(row.unit.per)} adet = `:''}${fmt(row.unit.amount)} ${cn}</dd><dt>Toplam</dt><dd class="total ${cur}">${fmt(cost)} ${cn}</dd><dt>Bakiyen</dt><dd>${fmt(have)} ${cn}</dd><dt>Kalan</dt><dd class="${enough?'':'short'}">${enough?`${fmt(have-cost)} ${cn}`:`Yetersiz ${cn}`}</dd></dl><div><button id="buyOk" ${enough?'':'disabled'}>ONAYLA</button><button id="buyCancel">VAZGEÇ</button></div></section>`;
  box.classList.add('open');ui('buyOk').onclick=confirmBuy;ui('buyCancel').onclick=closeBuy;
}
function closeBuy(){pendingBuy=null;ui('buyConfirm').classList.remove('open');}
function confirmBuy(){
  if(!pendingBuy)return;const {row,qty}=pendingBuy,cur=row.unit.currency,cost=priceOf(row.unit,qty);
  if(wallet(cur)<cost){toast(`Yeterli ${CURRENCY_NAME[cur]} yok`);closeBuy();return;}
  if(cur==='gold')state.gold-=cost;else state.pearls-=cost;row.give(qty);saveArsenal(arsenal);saveAccount();closeBuy();playCoins();renderQuickSlots();updateUI();row.after();rewardNotice(`+${fmt(qty)} ${row.name}   −${fmt(cost)} ${cur==='gold'?'Altın':'İnci'}`);
}
function openMarket(){renderMarket();ui('marketOverlay').classList.add('open');}
function closeMarket(){ui('marketOverlay').classList.remove('open');}
function renderMarket(){
  renderBuyRows('marketList',(Object.keys(AMMO_PRICES) as (keyof typeof AMMO_PRICES)[]).map(id=>({id,name:QUICK_ITEMS[id].name,art:`<div class="ammo-icon">${itemAsset(id)}<b>${quickCount(id)}</b></div>`,
    desc:id==='chain'?QUICK_ITEMS.chain.description:SPECIAL_AMMO[id].description,unit:AMMO_PRICES[id],give:(n:number)=>{if(id==='chain')state.chainAmmo+=n;else arsenal[id]+=n;},after:renderMarket})));
}
function openSupply(){renderSupply();ui('supplyOverlay').classList.add('open');}
function closeSupply(){ui('supplyOverlay').classList.remove('open');}
function renderSupply(){
  renderBuyRows('supplyList',(Object.keys(SUPPLY_PRICES) as SupplyId[]).map(id=>({id,name:QUICK_ITEMS[id].name,art:`<div class="ammo-icon">${itemAsset(id)}<b>${arsenal[id]}</b></div>`,
    desc:QUICK_ITEMS[id].description,unit:SUPPLY_PRICES[id],give:(n:number)=>{arsenal[id]+=n;},after:renderSupply})));
}
let loadoutTab:'ammo'|'consumable'='ammo';
let pendingQuickItem:QuickItemId|null=null;
function quickCount(item:QuickItemId){if(item==='iron')return'∞';if(item==='chain')return String(state.chainAmmo);if(isSpecial(item)||item==='mine'||item==='powder'||item==='shield')return String(arsenal[item]);return'';}
function slotKey(index:number){return keyLabel(settings.binds[(index<AMMO_ROW?`ammo${index+1}`:`item${index-AMMO_ROW+1}`) as ActionId]);}
function itemAsset(item:QuickItemId){return rasterItemAssets[item]?`<img class="raster-item" src="${rasterItemAssets[item]}" alt="${QUICK_ITEMS[item].name}" draggable="false"/>`:`<i class="sprite icon-${QUICK_ITEMS[item].icon}"></i>`;}
function renderQuickSlots(){
  ui('quickInventory').innerHTML=quickSlots.map((item,index)=>{const row=index<AMMO_ROW?'ammo-row':'item-row',key=slotKey(index);return item?`<button class="quick-slot ${row} ${item===state.ammo||((item==='powder'||item==='shield')&&consumableOn[item])?'active':''}" data-quick-slot="${index}" data-quick-item="${item}" title="${QUICK_ITEMS[item].name}">${itemAsset(item)}<b>${quickCount(item)}</b><kbd>${key==='—'?'':key}</kbd></button>`:`<button class="quick-slot ${row} empty" data-quick-slot="${index}" title="${index<AMMO_ROW?'Gülle yuvası':'Sarf yuvası'}"><span>+</span><kbd>${key==='—'?'':key}</kbd></button>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('#quickInventory [data-quick-slot]').forEach(slot=>{const index=Number(slot.dataset.quickSlot);slot.onclick=()=>useQuickSlot(index);slot.ondragover=e=>e.preventDefault();slot.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
function useQuickSlot(index:number){
  if(pendingQuickItem){assignQuickSlot(index,pendingQuickItem);return;}
  const item=quickSlots[index];if(!item){openLoadout(index<AMMO_ROW?'ammo':'consumable');return;}
  if(item==='iron'||item==='chain'){state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}
  else if(isSpecial(item)){if(arsenal[item]<=0){toast(`${QUICK_ITEMS[item].name} kalmadı — marketten alabilirsin`);}else{state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}}
  else if(item==='repairkit')toggleRepair();else if(item==='speed')activateAbility('speed');else if(item==='powder'||item==='shield')toggleConsumable(item);else if(item==='mine')dropMine();
  renderQuickSlots();
}
function assignQuickSlot(index:number,item:QuickItemId){if((index<AMMO_ROW)!==(QUICK_ITEMS[item].category==='ammo')){toast(index<AMMO_ROW?'Üst sıraya yalnızca gülle konabilir':'Alt sıraya yalnızca sarf malzemesi konabilir');return;}const prev=quickSlots.indexOf(item);if(prev>=0&&prev!==index)quickSlots[prev]=null;quickSlots[index]=item;pendingQuickItem=null;saveAccount();renderQuickSlots();if(ui('loadoutOverlay').classList.contains('open'))renderLoadout();toast(`${QUICK_ITEMS[item].name} ${index+1}. yuvaya yerleştirildi`);}
function openLoadout(tab:typeof loadoutTab='ammo'){loadoutTab=tab;pendingQuickItem=null;renderLoadout();ui('loadoutOverlay').classList.add('open');}
function closeLoadout(){pendingQuickItem=null;ui('loadoutOverlay').classList.remove('open');}
function renderLoadout(){
  // Boş gülle yuvasına dokununca aynı pencere gülle yerleşimi için açılır; MALZEMELER sekmesi yalnızca sarf gösterir
  const ammoMode=loadoutTab==='ammo';ui('loadoutTitle').textContent=ammoMode?'GÜLLE YUVALARI':'SARF YUVALARI';
  ui('loadoutHint').textContent=ammoMode?'Gülleler üst sıraya yerleşir. Sürükleyip bırak ya da önce gülleye, sonra yuvaya dokun.':'Sarf malzemeleri alt sıraya yerleşir. Sürükleyip bırak ya da önce eşyaya, sonra yuvaya dokun. Kara Barut ve Kalkan yuvaya dokununca açılır/kapanır.';
  const items=(Object.keys(QUICK_ITEMS) as QuickItemId[]).filter(id=>QUICK_ITEMS[id].category===loadoutTab);
  ui('loadoutItems').innerHTML=items.map(id=>`<button draggable="true" data-loadout-item="${id}" class="${pendingQuickItem===id?'selected':''}">${itemAsset(id)}<span>${QUICK_ITEMS[id].name}</span><small>${QUICK_ITEMS[id].description}</small><b>${quickCount(id)}</b></button>`).join('');
  ui('loadoutSlots').innerHTML=quickSlots.map((item,index)=>(index<AMMO_ROW)!==ammoMode?'':`${index===0?'<h4>GÜLLE SIRASI</h4>':index===AMMO_ROW?'<h4>SARF SIRASI</h4>':''}<button data-editor-slot="${index}" class="${pendingQuickItem&&(index<AMMO_ROW)===(QUICK_ITEMS[pendingQuickItem].category==='ammo')?'ready':''} ${index<AMMO_ROW?'ammo-row':'item-row'}">${item?`${itemAsset(item)}<span>${index+1}</span>`:`<b>+</b><span>${index+1}</span>`}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-loadout-item]').forEach(button=>{const item=button.dataset.loadoutItem as QuickItemId;button.onclick=()=>{pendingQuickItem=item;renderLoadout();};button.ondragstart=e=>e.dataTransfer?.setData('text/quick-item',item);});
  document.querySelectorAll<HTMLButtonElement>('[data-editor-slot]').forEach(button=>{const index=Number(button.dataset.editorSlot);button.onclick=()=>{if(pendingQuickItem)assignQuickSlot(index,pendingQuickItem);};button.ondragover=e=>e.preventDefault();button.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
let pendingCancel:string|null=null;
let chartSelection:MapKey|null=null;
function openWorldMap(){chartSelection=currentMap;renderWorldMap();ui('worldMapOverlay').classList.add('open');}
function closeWorldMap(){ui('worldMapOverlay').classList.remove('open');}
function renderWorldMap(){
  const chart=ui('worldChart');
  // Seafight tarzı küçük pafta: sol üstte adaya sahip filonun kısaltması, sağ üstte bulunduğun denizin sancağı, ortada deniz kodu, altta adı
  chart.innerHTML=`<div class="world-grid">${GRID.flat().map(key=>{const m=MAPS[key],locked=state.level<m.tier,here=key===currentMap,owned=fleetOwner(key)==='player',t=THEMES[m.tier];
    const tag=owned?(guild?`[${escapeHtml(guild.tag)}]`:'SEN'):'';
    return`<button class="world-tile ${here?'here':''} ${locked?'locked':''} ${m.safe?'safe':''} ${chartSelection===key?'selected':''}" data-chart="${key}" style="--tile:${t.sea[0]};--tile2:${t.sea[1]};--tint:${t.tint}"><span class="wt-tag">${tag}</span>${here?'<img class="wt-flag" src="/assets/icon-flag-v1.webp" alt="Buradasın" draggable="false"/>':''}<b>${key}</b><strong>${m.name}</strong></button>`;}).join('')}</div>`;
  chart.querySelectorAll<HTMLButtonElement>('[data-chart]').forEach(b=>b.onclick=()=>{chartSelection=b.dataset.chart as MapKey;renderWorldMap();});
  const m=MAPS[chartSelection??currentMap],locked=state.level<m.tier,npcs=m.npcs.map(id=>NPCS[id].name).join(', ');
  ui('worldInfo').innerHTML=`<div><span class="eyebrow">${m.key} · ${THEMES[m.tier].name}</span><h3>${m.name}</h3><p>${m.description}</p><dl><div><dt>Seviye</dt><dd>${m.tier}+</dd></div><div><dt>Gemiler</dt><dd>${npcs}</dd></div><div><dt>Canavar</dt><dd>${MONSTERS[m.monster].name}</dd></div><div><dt>Filo adası</dt><dd>${fleetOwner(m.key)==='player'?'<b class="safe">Senin</b>':'<b class="danger">Rakip</b>'}</dd></div></dl></div><button disabled>${m.key===currentMap?'ŞU AN BURADASIN':locked?`SEVİYE ${m.tier} GEREKLİ`:'KENARLARDAN GEÇİŞ'}</button>`;
}
function openQuestLog(){renderQuestLog();ui('questOverlay').classList.add('open');}
function closeQuestLog(){pendingCancel=null;ui('questOverlay').classList.remove('open');}
function openCaptainProfile(){renderNick();updateUI();renderBonusSummary();renderAchievements();saveAchievements(ach);ui('captainOverlay').classList.add('open');}
function refreshBonus(){bonus=computeBonus(crew);saveCrew(crew);renderBonusSummary();}
function renderBonusSummary(){
  const pct=(v:number)=>`${v>=1?'+':''}${Math.round((v-1)*100)}%`;
  ui('bonusSummary').innerHTML=`<span class="eyebrow">Geliştirme, yetenek ve tayfa bonusları</span><div><b>Hasar ${pct(bonus.damage*(1+upgrades.damage*.11))}</b><b>Dolum ${pct(Math.max(.6,1-upgrades.reload*.04)*bonus.reload)}</b><b>Menzil +${upgrades.range*18+bonus.range}</b><b>Hız ${pct(bonus.speed*(104+upgrades.speed*5)/104)}</b><b>Alınan hasar ${pct(bonus.taken)}</b><b>Tamir ${pct(bonus.repair)}</b></div>`;
}
// ---------------------------------------------------------------- Kaptan adı (nick): ilk ad ücretsiz, sonra inciyle ve 1 gün arayla
function renderNick(){
  ui('captainName').textContent=profile.nick.toLocaleUpperCase('tr');
  const wait=profile.named?profile.changedAt+NICK_COOLDOWN_MS-Date.now():0,cost=profile.named?NICK_CHANGE_COST:0,h=Math.ceil(wait/3600000);
  ui('captainNick').innerHTML=`<div><span>KAPTAN ADI</span><strong>${guild?`<em class="guild-tag">[${escapeHtml(guild.tag)}]</em>`:''}${escapeHtml(profile.nick)}</strong><small>${rankOf(state.level)} · ${profile.named?`Değiştirme ücreti ${NICK_CHANGE_COST} İnci · iki değişiklik arası 1 gün`:'İlk adını ücretsiz belirleyebilirsin'}</small></div>
    <div class="nick-form"><input id="nickInput" maxlength="${NICK_MAX}" placeholder="Yeni kaptan adı" ${wait>0?'disabled':''}/><button id="nickSave" ${wait>0?'disabled':''}>${wait>0?`${h} SAAT SONRA`:cost?`DEĞİŞTİR · ${cost} İNCİ`:'ADI KAYDET'}</button></div>`;
  const btn=document.getElementById('nickSave') as HTMLButtonElement|null;if(!btn||wait>0)return;
  btn.onclick=()=>{const n=(ui('nickInput') as HTMLInputElement).value.trim(),err=nickError(n);if(err){toast(err);return;}if(n===profile.nick){toast('Bu zaten senin adın');return;}
    if(cost&&state.pearls<cost){toast(`Ad değiştirmek için ${cost} inci gerekli`);return;}state.pearls-=cost;profile.nick=n;profile.changedAt=Date.now();profile.named=true;saveProfile(profile);saveAccount();updateUI();renderNick();rewardNotice(`KAPTAN ADI: ${n}${cost?`   −${cost} İNCİ`:''}`);};
}
// Gemi altındaki ad: [FİLO TAG] nick, altında rütbe
function drawPlayerLabel(){
  const p=worldToScreen(player),y=p.y+58,tag=guild?`[${guild.tag}]`:'',nick=profile.nick;
  ctx.save();ctx.font='700 14px Inter';ctx.textBaseline='middle';const tw=tag?ctx.measureText(tag).width+3:0,nw=ctx.measureText(nick).width,x0=p.x-(tw+nw)/2;
  ctx.shadowColor='#000';ctx.shadowBlur=4;if(tag){ctx.fillStyle='#ffd24a';ctx.textAlign='left';ctx.fillText(tag,x0,y);}ctx.fillStyle='#f4f1ea';ctx.textAlign='left';ctx.fillText(nick,x0+tw,y);
  ctx.restore();
}
// ---------------------------------------------------------------- Filo: hazine, bağış ve kule dikme
function openGuild(){renderGuild();ui('guildOverlay').classList.add('open');}
function closeGuild(){ui('guildOverlay').classList.remove('open');focusedFoundation=null;}
function ownedFleetIslands(){return(Object.keys(MAPS) as MapKey[]).filter(k=>MAPS[k].tier>=5&&fleetOwner(k)==='player');}
function renderGuild(){
  const panel=ui('guildPanel');
  if(!guild){panel.innerHTML=`<div class="guild-create"><p>Henüz bir filon yok. Filo kurduğunda <b>filo başkanı</b> sen olursun. Filo üyeleri hazineye <b>inci bağışlar</b>. Başkan da bu hazineyle filo adalarındaki boş kaidelere kule diker.</p><div class="guild-create-row"><label>Kısaltma (tag)<input id="guildTag" maxlength="${GUILD_TAG_MAX}" placeholder="Ör. TC★"/></label><label>Filo adı<input id="guildName" maxlength="${GUILD_NAME_MAX}" placeholder="Ör. Türk Korsanları"/></label></div><small class="guild-hint">Kısaltma gemi adının önünde görünür: <b>[TC★]${escapeHtml(profile.nick)}</b></small><button id="guildCreate">FİLO KUR</button></div>`;
    const tagInput=ui('guildTag') as HTMLInputElement;tagInput.oninput=()=>{tagInput.value=tagInput.value.toLocaleUpperCase('tr').replace(/\*/g,'★');};
    ui('guildCreate').onclick=()=>{const name=(ui('guildName') as HTMLInputElement).value.trim(),tag=tagInput.value.trim(),te=tagError(tag);if(te){toast(te);return;}if(name.length<3){toast('Filo adı en az 3 harf olmalı');return;}const g:Guild={name,tag,role:'leader',treasury:0,donated:0,created:Date.now(),towers:{}};guild=g;for(const k of ownedFleetIslands())islandSlots(g,k);saveGuild(g);setupFleetIsland();rewardNotice(`[${tag}] ${name.toLocaleUpperCase('tr')} FİLOSU KURULDU`);renderGuild();};return;}
  const g=guild,islands=ownedFleetIslands(),map=mapDef(),here=hasFleetIsland()?map.fleet.name:'',allowed=canBuild(g.role);
  // Kule resmi: 4 karelik sayfada ilgili kareye yakınlaştırılmış (560% × 140%) kırpma
  const art=(_slot:number,type:TowerType,ghost=false)=>`<i class="tower-art ${ghost?'ghost':''}" style="background-position:${TOWER_TYPES[type].frame/3*100}% 50%"></i>`;
  const typeCards=(Object.keys(TOWER_TYPES) as TowerType[]).map(t=>{const d=TOWER_TYPES[t];return`<button class="tower-type ${buildType===t?'active':''}" data-type="${t}">${art(3,t)}<div><b>${d.name}</b><small>${d.desc}</small><em>Maliyet ×${d.cost} · Hasar ×${d.damage} · Menzil ×${d.range}</em></div></button>`;}).join('');
  const islandHtml=islands.length?islands.map(k=>{const m=MAPS[k],slots=islandSlots(g,k),cost=towerTypeCost(m.tier,buildType),built=slots.filter(Boolean).length;
    return`<article class="guild-island"><header><div><span class="eyebrow">${m.key} · Seviye ${m.tier}</span><h4>${m.fleet.name}</h4></div><b>${built} / ${TOWER_SLOTS} kule</b></header><div class="tower-slots">${slots.map((t,i)=>t?`<div class="tower-slot built">${art(i,t.type)}<small>${TOWER_TYPES[t.type].name}</small><em><span style="width:${Math.round(t.hp/t.maxHp*100)}%"></span></em></div>`:`<button class="tower-slot empty" data-build="${k}:${i}" ${!allowed||g.treasury<cost?'disabled':''}>${art(i,buildType,true)}<small>Kaide ${i+1}</small><b>${allowed?`DİK · ${cost} İnci`:'YETKİ YOK'}</b></button>`).join('')}</div></article>`;}).join('')
    :`<p class="guild-empty">Filonun henüz bir adası yok. Adalar 5. seviye ve üstü denizlerdedir. Bir adanın bütün kulelerini yıkınca ada filona katılır ve kaideleri boşalır.</p>`;
  const testClaim=FLEET_TEST_ENTRY&&hasFleetIsland()&&fleetOwner()!=='player'?`<button class="guild-test" id="guildClaim">TEST: ${here} adasını filona kat</button>`:'';
  const testRole=FLEET_TEST_ENTRY?`<label class="guild-test-role">TEST · rolün <select id="guildRole">${(Object.keys(ROLE_NAMES) as GuildRole[]).map(r=>`<option value="${r}" ${g.role===r?'selected':''}>${ROLE_NAMES[r]}</option>`).join('')}</select></label>`:'';
  panel.innerHTML=`<div class="guild-head"><div><span class="eyebrow">Filo</span><h3><em class="guild-tag">[${escapeHtml(g.tag)}]</em> ${escapeHtml(g.name)}</h3><small>${ROLE_NAMES[g.role]}: ${escapeHtml(profile.nick)} (sen) · Üye: 1</small></div><div class="guild-treasury"><span>FİLO HAZİNESİ</span><strong><i class="sprite icon-pearl"></i>${g.treasury} İnci</strong><small>Senin bağışın: ${g.donated} İnci</small></div></div>
    <div class="guild-members"><span class="eyebrow">Filo üyeleri ve yetkiler</span><div class="member-row"><b>[${escapeHtml(g.tag)}]${escapeHtml(profile.nick)}</b><em class="role ${g.role}">${ROLE_NAMES[g.role]}</em><small>Bağış: ${g.donated} İnci</small></div><p>Kule dikme yetkisi yalnızca <b>Filo Başkanı</b> ve <b>Başkan Yardımcısı</b>ndadır. Başkan, üyelerden birini yardımcı atar. Diğer üyeler hazineye inci bağışlar.</p>${testRole}</div>
    <div class="guild-donate"><span>İnci bağışla <small>(elindeki: ${state.pearls})</small></span>${[10,50,100].map(n=>`<button data-donate="${n}" ${state.pearls<n?'disabled':''}>+${n}</button>`).join('')}<input id="donateAmount" type="number" min="1" max="${state.pearls}" placeholder="Miktar"/><button id="donateCustom">BAĞIŞLA</button></div>
    <div class="guild-types"><span class="eyebrow">Dikilecek kule tipi</span><div class="tower-types">${typeCards}</div></div>
    ${testClaim}<div class="guild-islands">${islandHtml}</div>`;
  const donate=(n:number)=>{n=Math.floor(n);if(!(n>0)){toast('Geçerli bir miktar gir');return;}if(state.pearls<n){toast('Yeterli incin yok');return;}state.pearls-=n;g.treasury+=n;g.donated+=n;saveGuild(g);saveAccount();updateUI();playCoins();rewardNotice(`FİLO HAZİNESİNE +${n} İNCİ BAĞIŞLANDI`);renderGuild();};
  // Restore the selected foundation after type changes, donations and construction.
  panel.querySelectorAll<HTMLElement>('.guild-island').forEach((article,index)=>{
    article.querySelectorAll<HTMLElement>('.tower-slot').forEach((slot,i)=>{
      const key=`${islands[index]}:${i}`;slot.dataset.foundation=key;
      slot.classList.toggle('chosen-foundation',key===focusedFoundation);
    });
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-donate]').forEach(b=>b.onclick=()=>donate(Number(b.dataset.donate)));
  ui('donateCustom').onclick=()=>donate(Number((ui('donateAmount') as HTMLInputElement).value));
  panel.querySelectorAll<HTMLButtonElement>('[data-type]').forEach(b=>b.onclick=()=>{buildType=b.dataset.type as TowerType;renderGuild();});
  panel.querySelectorAll<HTMLButtonElement>('[data-build]').forEach(b=>b.onclick=()=>{if(!canBuild(g.role)){toast('Kule dikme yetkisi yalnızca başkan ve yardımcısında');return;}
    const [k,i]=b.dataset.build!.split(':') as [MapKey,string],m=MAPS[k],type=buildType,cost=towerTypeCost(m.tier,type),slots=islandSlots(g,k);
    if(slots[+i]){toast('Bu kaidede zaten bir kule var');renderGuild();return;}
    if(g.treasury<cost){toast(`Filo hazinesinde ${cost} inci gerekli`);return;}g.treasury-=cost;const hp=fleetTower(m.tier).hp;slots[+i]={hp,maxHp:hp,type};saveGuild(g);if(k===currentMap)setupFleetIsland();playCoins();rewardNotice(`${m.fleet.name.toLocaleUpperCase('tr')}   ${+i+1}. KAİDEYE ${TOWER_TYPES[type].name.toLocaleUpperCase('tr')} DİKİLDİ   −${cost} İNCİ`);renderGuild();});
  const role=document.getElementById('guildRole') as HTMLSelectElement|null;if(role)role.onchange=()=>{g.role=role.value as GuildRole;saveGuild(g);renderGuild();toast(`Test: rolün ${ROLE_NAMES[g.role]}`);};
  const claim=document.getElementById('guildClaim');if(claim)claim.onclick=()=>{fleetOwners[currentMap]='player';saveFleetOwners(fleetOwners);g.towers[currentMap]=Array(TOWER_SLOTS).fill(null);saveGuild(g);enemies.splice(0,enemies.length,...enemies.filter(e=>!e.tower));setupFleetIsland();rewardNotice(`TEST · ${map.fleet.name.toLocaleUpperCase('tr')} FİLONA KATILDI`);renderGuild();};
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
const tierQuests=()=>QUESTS.filter(q=>q.map===currentMap);
const questUnit=(q:QuestDef)=>q.kind==='npc'?'Gemi':q.kind==='monster'?'Canavar':'Sandık';
function renderQuestLog(){
  ui('questList').innerHTML=`<p class="quest-tier">${currentMap} ${mapDef().name} görevleri · harita seviyesi ${mapDef().tier}</p>`+tierQuests().map((quest,index)=>{
    const cooling=(questCooldownUntil[quest.id]??0)>Date.now(),active=state.activeQuest===quest.id,progress=questProgress[quest.id]??0;
    const status=cooling?cooldownText(questCooldownUntil[quest.id]):active?'GÖREVİ İPTAL ET':progress>0?'DEVAM ET':'GÖREVİ BAŞLAT';
    const action=pendingCancel===quest.id?`<div class="cancel-confirm"><strong>Emin misin?</strong><button data-confirm-cancel="${quest.id}">İPTALİ ONAYLA</button><button data-keep-quest="${quest.id}">VAZGEÇ</button></div>`:`<button data-quest="${quest.id}" ${cooling?'disabled':''}>${status}</button>`;
    return `<article class="quest-entry ${active?'active':''} ${cooling?'completed':''}"><div class="quest-number">${String(index+1).padStart(2,'0')}</div><div class="quest-copy"><span>${cooling?'2 SAAT BEKLEME':quest.kind==='npc'?'GEMİ AVI':quest.kind==='monster'?'DENİZ CANAVARI':'GANİMET'}</span><h3>${quest.title}</h3><p>${quest.description}</p><div class="quest-rewards"><b>${quest.gold.toLocaleString('tr-TR')} ALTIN</b><b>${quest.xp.toLocaleString('tr-TR')} TP</b><b>◈ ${quest.pearls} İNCİ</b></div><small>${cooling?'Yeniden açılmasına: '+cooldownText(questCooldownUntil[quest.id]):`${Math.min(progress,quest.required)} / ${quest.required} ${questUnit(quest)}`}</small></div>${action}</article>`;
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
  state.gold+=goldGainAch(quest.gold);state.fame+=xpGain(quest.xp);state.pearls+=quest.pearls;bumpAch('quest');
  rewardNotice(`GÖREV TAMAMLANDI   +${quest.gold.toLocaleString('tr-TR')} Altın   +${quest.pearls} İnci   +${quest.xp.toLocaleString('tr-TR')} TP`);
  toast(`${quest.title} tamamlandı`);questProgress[quest.id]=0;questCooldownUntil[quest.id]=Date.now()+QUEST_COOLDOWN_MS;state.activeQuest=null;saveQuestState();saveAccount();
}
function updateUI(){
  ui('pearls').textContent=String(state.pearls).padStart(3,'0');ui('gold').textContent=String(state.gold).padStart(3,'0');
  document.querySelectorAll<HTMLElement>('#quickInventory [data-quick-item]').forEach(slot=>{const item=slot.dataset.quickItem as QuickItemId;const count=slot.querySelector('b');if(count)count.textContent=quickCount(item);slot.classList.toggle('active',item===state.ammo||((item==='powder'||item==='shield')&&consumableOn[item]));});
  ui('hpText').textContent=`${Math.ceil(state.hp).toLocaleString('tr-TR')} / ${effectiveMaxHp().toLocaleString('tr-TR')}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/effectiveMaxHp()*100}%`;
  const need=xpNeed(state.level),needText=Number.isFinite(need)?String(need):'AZAMİ';ui('xpText').textContent=`${state.fame} / ${needText}`;(ui('xpBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('level').textContent=String(state.level);ui('captainLevel').textContent=String(state.level);ui('profileElite').textContent=eliteProgress().text;ui('profileBattle').textContent=`${state.battlePoints} / 500`;(ui('profileEliteBar') as HTMLElement).style.width=`${eliteProgress().pct}%`;(ui('profileBattleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;
  (ui('xpHudBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('xpHudText').textContent=`${state.fame} / ${needText}`;(ui('hpHudBar') as HTMLElement).style.width=`${Math.max(0,state.hp/effectiveMaxHp()*100)}%`;ui('hpHudText').textContent=`${Math.ceil(state.hp).toLocaleString('tr-TR')} / ${effectiveMaxHp().toLocaleString('tr-TR')}`;(ui('eliteBar') as HTMLElement).style.width=`${eliteProgress().pct}%`;ui('eliteText').textContent=eliteProgress().text;(ui('battleBar') as HTMLElement).style.width=`${Math.min(100,state.battlePoints/5)}%`;ui('battleText').textContent=`${state.battlePoints} / 500`;
  const quest=state.activeQuest===null?null:questById(state.activeQuest);ui('questTitle').textContent=quest?.title||'Görev seçilmedi';ui('questDescription').textContent=quest?.description||'Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.';ui('quest').textContent=quest?`${questProgress[quest.id]??0} / ${quest.required} ${questUnit(quest)}`:'Hazır olduğunda bir görev başlat';ui('questBadge').textContent=quest?`${questProgress[quest.id]??0}/${quest.required}`:'';ui('openQuestTop').classList.toggle('has-quest',!!quest);
  ui('reloadText').textContent=player.cooldown>0?`${player.cooldown.toFixed(1)} sn`:'HAZIR';ui('attack').classList.toggle('reloading',player.cooldown>0);
  ui('attackLabel').textContent=state.attacking?'SALDIRIYI İPTAL ET':'SALDIR';ui('attack').classList.toggle('active',state.attacking);
  ui('repair').classList.toggle('active',state.repairing);
  const elite=eliteShip(),eliteButton=ui('ability-elite');eliteButton.classList.toggle('ship-hidden',!eliteEnabled());eliteButton.title=`${elite.ability} — ${elite.abilityDescription}`;ui('eliteAbilityName').textContent=elite.ability.toLocaleUpperCase('tr');ui('eliteAbilityTime').textContent=eliteAbility.active>0?`${Math.ceil(eliteAbility.active)} SN`:eliteAbility.cooldown>0?`${Math.ceil(eliteAbility.cooldown)}`:'HAZIR';eliteButton.classList.toggle('active',eliteAbility.active>0);eliteButton.style.setProperty('--cd',Math.min(1,eliteAbility.cooldown/(ELITE_COOLDOWN*bonus.cooldown)).toFixed(3));const eliteIcon=ui('eliteAbilityIcon') as HTMLElement,iconUrl=`url(${eliteArtUrl(elite.id)})`;if(eliteIcon.style.getPropertyValue('--elite-img')!==iconUrl)eliteIcon.style.setProperty('--elite-img',iconUrl);
  renderCombatTargets();
}

let visibleCombatTargets:Target[]=[];
function renderCombatTargets(){
  const targets:Target[]=[];
  const add=(target:Target|null)=>{if(target&&targetExists(target)&&!targets.includes(target))targets.push(target);};
  add(selected);enemies.forEach(enemy=>{if(enemy.aggro)add(enemy);});monsters.forEach(monster=>{if(monster.aggro)add(monster);});
  visibleCombatTargets=targets.slice(0,5);
  const root=ui('combatTargets');root.classList.toggle('visible',visibleCombatTargets.length>0);
  root.innerHTML=visibleCombatTargets.map((target,index)=>{const range=Math.round(dist(player,target));const active=target===selected;const fighting=target.aggro||(active&&state.attacking);const role=target.kind==='ship'&&target.boss?'HARİTA BOSSU':target.kind==='ship'&&target.tower?'FİLO KULESİ · FİLO SAVAŞI':target.kind==='monster'?'DENİZ CANAVARI':target.role==='heavy'?'AĞIR GEMİ':'HAFİF GEMİ';const portrait=target.kind==='monster'?target.def.portrait:target.def?.portrait??-1;return `<button class="combat-target ${active?'selected':''}" data-combat-target="${index}"><span class="target-portrait ${target.kind} ${target.kind==='ship'?target.role:''}">${target.kind==='ship'&&target.boss?`<i class="portrait-art" style="${portraitStyle(BOSS_ATLAS,target.boss.portrait,MAP_KEYS.length,BOSS_ATLAS_COLS)}"></i>`:portrait>=0?`<i class="portrait-art" style="${portraitStyle(PORTRAIT_ATLAS,portrait,PORTRAIT_COUNT,PORTRAIT_COLS)}"></i>`:`<i class="portrait-art tower-art" style="background-image:url(${fleetTowerUrl(theme().fleet)})"></i>`}</span><span class="target-info"><small>${target.kind==='monster'?role:'SV '+target.tier+' · '+role} · ${range}m</small><strong>${target.name}</strong><i><em style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></em></i><b>${Math.ceil(target.hp)} / ${target.maxHp}</b></span><span class="target-state">${fighting?'SAVAŞ':'HEDEF'}</span></button>`;}).join('');
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
      player.angle+=clamp(delta,-4.6*dt,4.6*dt);
      // Dönüşte hız az düşer (90° dönüşte %80, tam geri dönüşte %45); varışta son 80 birimde yavaşlar
      const alignment=1-.55*Math.pow(Math.abs(delta)/Math.PI,1.5),arrival=clamp(d/80,.25,1);
      const targetSpeed=effectiveSpeed()*alignment*arrival;
      player.speed+=(targetSpeed-player.speed)*Math.min(1,dt*(targetSpeed<player.speed?3.2:4.4));
      if(d<7){destination=null;player.speed=0;}
    }
    else {
      player.angle+=turn*3.2*dt;
      const targetSpeed=thrust>0?effectiveSpeed()*(turn?.88:1):0;
      player.speed+=(targetSpeed-player.speed)*Math.min(1,dt*(thrust>0?4:3.8));
    }
    player.speed=clamp(player.speed,0,effectiveSpeed()+4);
    player.x=clamp(player.x+Math.sin(player.angle)*player.speed*dt,25,WORLD_WIDTH-25);player.y=clamp(player.y-Math.cos(player.angle)*player.speed*dt,25,WORLD_HEIGHT-25);resolveIslandCollision();
  updateAbilityFx(dt);ghostTimer=Math.max(0,ghostTimer-dt);ghostTrailClock-=dt;if(ghostTimer>0&&ghostTrailClock<=0){ghostTrailClock=.07;ghostTrail.push({x:player.x,y:player.y});if(ghostTrail.length>6)ghostTrail.shift();}if(ghostTimer<=0)ghostTrail.length=0;
  player.cooldown=Math.max(0,player.cooldown-dt*(steamTimer>0?2:1));updateEliteAbilities(dt);eliteAbility.active=Math.max(0,eliteAbility.active-dt);eliteAbility.cooldown=Math.max(0,eliteAbility.cooldown-dt);state.invulnerable=Math.max(0,state.invulnerable-dt);collisionNotice=Math.max(0,collisionNotice-dt);{const f=cinematic.focus??player;camera.x+=(f.x-camera.x)*Math.min(1,dt*3);camera.y+=(f.y-camera.y)*Math.min(1,dt*3);}camera.zoom+=(camera.targetZoom-camera.zoom)*Math.min(1,dt*7);
  for(let i=salvoQueue.length-1;i>=0;i--){salvoQueue[i].delay-=dt;if(salvoQueue[i].delay<=0){releaseSalvo(salvoQueue[i]);salvoQueue.splice(i,1);}}
  if(state.repairing){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*(.035+upgrades.repair*.008)*bonus.repair*(elitePassive('coral')&&playerHitClock>5?2:1)*dt);if(state.hp>=effectiveMaxHp()){state.repairing=false;saveAccount();ui('repair').classList.remove('active');toast('Gövde tamamen onarıldı');}}
  wakeClock-=dt;if(Math.abs(player.speed)>8&&wakeClock<=0){wakeClock=.1;particles.push({x:player.x-Math.sin(player.angle)*22,y:player.y+Math.cos(player.angle)*22,vx:-Math.sin(player.angle)*8,vy:Math.cos(player.angle)*8,life:.75,maxLife:.75,kind:'foam'});}
  monsters.forEach(m=>{if((m.frozen??0)>0){m.frozen=Math.max(0,m.frozen!-dt);m.cooldown=Math.max(m.cooldown,.5);return;}m.phase+=dt;m.cooldown-=dt;m.slowTimer=Math.max(0,m.slowTimer-dt);if(m.aggro){m.combatTimer-=dt;if(m.combatTimer<=0||Math.hypot(m.x-m.homeX,m.y-m.homeY)>720)m.aggro=false;}if(m.aggro&&dist(m,player)<430&&m.cooldown<=0)monsterFire(m);});
  // Saldırı: kaptan hareket etse de hedef menzildeyken ateş sürer; hedef menzilden çıkınca saldırı durur
  // ve menzile tekrar girildiğinde SALDIR'a yeniden basmak gerekir.
  if(state.attacking&&selected){
    const d=dist(player,selected),cannonRange=effectiveRange();
    if(d>cannonRange){
      if(attackChase){const away=Math.atan2(player.y-selected.y,player.x-selected.x);routeTarget=null;destination=routeVia(navigablePoint({x:selected.x+Math.cos(away)*(cannonRange-35),y:selected.y+Math.sin(away)*(cannonRange-35)}));}
      else{state.attacking=false;ui('attack').classList.remove('active');toast('Hedef menzil dışına çıktı — saldırı durdu');}
    }else{
      if(attackChase){attackChase=false;destination=null;routeTarget=null;}
      // Rota verilmediyse gemi borda ateşi için hedefin yanına döner
      if(!destination){player.speed+=(effectiveSpeed()*.42-player.speed)*Math.min(1,dt*1.4);const course=broadsideCourse(selected),delta=angleDelta(course,player.angle);player.angle+=clamp(delta,-2.6*dt,2.6*dt);}
      fireAtTarget();
    }
  }
  player.angle=Math.atan2(Math.sin(player.angle),Math.cos(player.angle));
  for(const e of enemies){
    if(e.tower){updateTower(e,dt);continue;}
    if((e.frozen??0)>0){e.frozen=Math.max(0,e.frozen!-dt);e.cooldown=Math.max(e.cooldown,.5);continue;}
    const d=dist(e,player);e.wander+=dt;e.slowTimer=Math.max(0,e.slowTimer-dt);if(e.aggro){e.combatTimer-=dt;if(e.combatTimer<=0||Math.hypot(e.x-e.homeX,e.y-e.homeY)>680)e.aggro=false;}
    const homeDistance=Math.hypot(e.x-e.homeX,e.y-e.homeY);
    const target=e.aggro?Math.atan2(player.y-e.y,player.x-e.x)+Math.PI/2:homeDistance>90?Math.atan2(e.homeY-e.y,e.homeX-e.x)+Math.PI/2:e.angle+Math.sin(e.wander*.35)*.008;
    e.angle+=Math.atan2(Math.sin(target-e.angle),Math.cos(target-e.angle))*dt*(e.aggro?.8:.25);
    if(!e.aggro||d>240){const slow=e.slowTimer>0?.55:1;e.x=clamp(e.x+Math.sin(e.angle)*e.speed*(e.aggro?1:.45)*slow*dt,40,WORLD_WIDTH-40);e.y=clamp(e.y-Math.cos(e.angle)*e.speed*(e.aggro?1:.45)*slow*dt,40,WORLD_HEIGHT-40);if(Math.random()<dt*3)particles.push({x:e.x-Math.sin(e.angle)*18,y:e.y+Math.cos(e.angle)*18,vx:0,vy:0,life:.55,maxLife:.55,kind:'foam'});} if(e.aggro&&d<440&&e.cooldown<=0)enemyFire(e);e.cooldown-=dt;
  }
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.owner==='player'&&s.target&&targetExists(s.target)){const a=Math.atan2(s.target.y-s.y,s.target.x-s.x),speed=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;s.life=Math.max(s.life,.12);}
    if(s.flight===undefined){const aim=s.owner==='player'?s.target:player,sp=Math.max(1,Math.hypot(s.vx,s.vy)),d=aim&&targetExistsOrPlayer(aim)?dist(s,aim):sp*s.life;s.flight=Math.max(.15,Math.min(s.life,d/sp));s.age=0;s.arc=Math.min(80,d*.13)*(s.splash?2.2:1);
      if(s.splash&&aim)particles.push({x:aim.x,y:aim.y,vx:0,vy:0,life:s.flight,maxLife:s.flight,kind:'target',size:120});}
    s.age=(s.age??0)+dt;s.trail=(s.trail??0)-dt;
    if(s.trail<=0){s.trail=s.ammo==='fire'?.03:.05;const z=shotHeight(s);
      if(s.visual==='spit')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,life:.4,maxLife:.4,kind:'bubble',z,size:14});
      else if(s.ammo==='fire')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*12,vy:(Math.random()-.5)*12,life:.4,maxLife:.4,kind:'firePuff',z,size:30});
      else if(s.ammo==='explosive')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30,life:.3,maxLife:.3,kind:'spark',z:z+10,size:14});
      else if(s.ammo==='leech')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,life:.45,maxLife:.45,kind:'soul',z,size:16});
      else if(s.ammo!=='grape')particles.push({x:s.x,y:s.y,vx:0,vy:0,life:.35,maxLife:.35,kind:'smoke',z,size:16,variant:Math.floor(Math.random()*4)});}
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(s.owner==='player'){
      for(let j=enemies.length-1;j>=0&&s.life>0;j--){
        const e=enemies[j];
        if(dist(s,e)<(e.hitRadius??25)){const hit=eliteOnHit(e,s.damage*(s.ammo==='breaker'&&e.tower?SPECIAL_AMMO.breaker.towerFactor:1));s.hit=true;if(s.slow)e.slowTimer=Math.max(e.slowTimer,s.slow);if(s.splash)towerSplash(s,e);e.aggro=true;e.combatTimer=12;if(s.ammo==='chain')e.slowTimer=3;if(s.ammo==='fire'){e.burnTimer=SPECIAL_AMMO.fire.burnSeconds;e.burnDps=Math.max(e.burnDps??0,hit*FIRE_DOT_SHARE*bonus.burn/SPECIAL_AMMO.fire.burnSeconds);}e.hp-=hit;damageText(e.x,e.y,hit);burst(e.x,e.y);playHit();ammoImpact(s,e,hit);s.life=0;
          if(e.hp<=0)sinkEnemy(e);
        }
      }
      for(let j=monsters.length-1;j>=0&&s.life>0;j--){
        const m=monsters[j];
        if(dist(s,m)<m.radius){const hit=eliteOnHit(m,s.damage);s.hit=true;if(s.slow)m.slowTimer=Math.max(m.slowTimer,s.slow);if(s.splash)towerSplash(s,m);m.aggro=true;m.combatTimer=12;if(s.ammo==='chain')m.slowTimer=3;if(s.ammo==='fire'){m.burnTimer=SPECIAL_AMMO.fire.burnSeconds;m.burnDps=Math.max(m.burnDps??0,hit*FIRE_DOT_SHARE*bonus.burn/SPECIAL_AMMO.fire.burnSeconds);}m.hp-=hit;damageText(m.x,m.y,hit);burst(m.x,m.y);playHit();ammoImpact(s,m,hit);s.life=0;
          if(m.hp<=0)defeatMonster(m);
        }
      }
    }else if(state.invulnerable<=0&&ghostTimer<=0&&dist(s,player)<22){
      s.hit=true;s.life=0;
      // Su Kubbesi hasarı tamamen emer; Hayalet Kadırga pasifi %10 ihtimalle gülleyi savuşturur
      if(domeTimer>0)spawnRipple(s);
      else if(elitePassive('phantom')&&Math.random()<.1)spawnText(player,'SAVUŞTURDU','#7fffe0');
      else{
      state.repairing=false;playerHitClock=0;
      const taken=s.damage*bonus.taken*useConsumable('shield')*eliteTakenMult();
      state.hp-=taken;if(rageTimer>0)state.hp=Math.max(1,state.hp);damageText(player.x,player.y,Math.round(taken));playHit(true);burst(player.x,player.y);
      }
      if(state.hp<=0){
        respawn();
        // Respawn empties shots. Stop reading this volley, then finish UI/draw normally.
        break;
      }
    }
    if(s.life<=0){if(!s.hit)splashAt(s.x,s.y,s.splash?160:110);shots.splice(i,1);}
  }
  updateLootChests(dt);updateTreasure(dt);updateWakes(dt);updateSparkles(dt);updateArsenal(dt);updateEvents(dt);
  if(insideOwnLagoon(player)&&state.hp<effectiveMaxHp()){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*.06*dt);if(state.hp>=effectiveMaxHp())saveAccount();}
  updateJumpPrompt();updateCoordBadge();mapFade=Math.max(0,mapFade-dt*1.6);updateWeather(dt);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;if(p.vr)p.rot=(p.rot??0)+p.vr*dt;
    if(p.vz!==undefined){p.z=(p.z??0)+p.vz*dt;p.vz-=340*dt;if(p.z<=0){p.z=0;p.vz=undefined;p.vx*=.25;p.vy*=.25;p.vr=(p.vr??0)*.1;if(p.kind==='splinter')particles.push({x:p.x,y:p.y,vx:0,vy:0,life:.4,maxLife:.4,kind:'foam',size:20,variant:0});}}
    if(p.life<=0)particles.splice(i,1);}
  for(let i=wrecks.length-1;i>=0;i--){const w=wrecks[i];w.t+=dt;w.bubble-=dt;if(w.bubble<=0){w.bubble=.09;const a=Math.random()*Math.PI*2,r=Math.random()*26;particles.push({x:w.x+Math.cos(a)*r,y:w.y+Math.sin(a)*r*.6,vx:0,vy:-6,life:.7,maxLife:.7,kind:Math.random()<.6?'bubble':'foam',size:10+Math.random()*10,variant:0});}if(w.t>=WRECK_TIME)wrecks.splice(i,1);}
  let need=xpNeed(state.level);while(state.fame>=need){state.fame-=need;state.level++;setAch('level',state.level);state.maxHp=baseMaxHp();state.hp=effectiveMaxHp();saveAccount();playLevelUp();rewardNotice(`SEVİYE ${state.level}   +${HP_PER_LEVEL.toLocaleString('tr-TR')} Azami Gövde   +1 Yetenek Puanı   ${state.level}/1 AÇILDI`);toast(`Seviye ${state.level}! Yeni denizler açıldı`);need=xpNeed(state.level);}
  if(state.level>=MAX_LEVEL)state.fame=Math.min(state.fame,0);
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui('toast').classList.remove('show');}if(rewardTimer>0){rewardTimer-=dt;if(rewardTimer<=0){ui('rewardToast').classList.remove('show');const next=rewardQueue.shift();if(next)setTimeout(()=>showReward(next),220);}} updateUI();
}

function sinkEnemy(e:Enemy){
  const j=enemies.indexOf(e);if(j<0)return;
  enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}
  burst(e.x,e.y,true);playExplosion();playSink(earGain(e));splashAt(e.x,e.y,190);
  if(e.def&&!e.tower)wrecks.push({x:e.x,y:e.y,angle:e.angle,sprite:e.def.sprite,span:e.def.span,t:0,bubble:0});
  if(e.tower){destroyTower();return;}
  if(e.boss){defeatBoss(e);return;}
  // NPC ve canavar yalnızca tecrübe puanı ve altın verir (Seafight'taki gibi); savaş puanı sadece rakip oyuncu batırınca gelir.
  const eliteLoot=eliteLootMult();if(bannerTimer>0)spawnCoins(e,player);
  const goldGain=goldGainAch(e.rewardGold*(1+bonus.bounty)*eliteLoot),fame=xpGain(e.rewardFame);state.gold+=goldGain;state.fame+=fame;saveAccount();bumpAch('npc');if(e.role==='heavy')bumpAch('heavy');
  rewardNotice(`+${goldGain} Altın   +${fame} TP`);toast(`${e.name} batırıldı`);if(e.def)recordQuestProgress('npc',e.def.id);countBossKill(e);if(!e.summoned)setTimeout(spawnEnemy,1800);
}
function defeatMonster(m:Monster){
  playExplosion();const d=m.def;
  const eliteLoot=eliteLootMult();if(bannerTimer>0)spawnCoins(m,player);
  const goldGain=goldGainAch(d.gold*(1+bonus.bounty)*eliteLoot),fame=xpGain(d.xp);state.gold+=goldGain;state.fame+=fame;saveAccount();bumpAch('monster');
  rewardNotice(`+${goldGain} Altın   +${fame} TP`);recordQuestProgress('monster',d.id);
  const p=randomSeaPoint(900);m.hp=m.maxHp;m.aggro=false;m.burnTimer=0;m.x=p.x;m.y=p.y;m.homeX=m.x;m.homeY=m.y;m.combatTimer=0;selected=null;state.attacking=false;toast(`${m.name} yenildi`);
}
function updateTower(e:Enemy,dt:number){
  const d=dist(e,player);e.cooldown-=dt;e.combatTimer=Math.max(0,e.combatTimer-dt);e.slowTimer=0;e.burnTimer=Math.max(0,(e.burnTimer??0));
  e.aggro=!mapDef().safe&&(d<(e.fireRange??460)+30||e.combatTimer>0);
  if(e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*(e.aggro?.004:.02)*dt);
  if(e.aggro&&d<(e.fireRange??460)&&e.cooldown<=0&&state.invulnerable<=0&&stealthTimer<=0){const muzzle=towerMuzzle(e),tx=muzzle.x,ty=muzzle.y,a=Math.atan2(player.y-ty,player.x-tx);
    muzzleFlash(tx,ty,a,60);for(const off of [-.05,.05])shots.push({x:tx,y:ty,vx:Math.cos(a+off)*320,vy:Math.sin(a+off)*320,life:2.2,owner:'enemy',damage:e.damage,hit:false,ammo:theme().fleet==='lava'?'fire':'iron'});
    playEnemyCannon(d,(e.x-player.x)/600);e.cooldown=e.reload+Math.random()*.4;}
}
function destroyTower(){
  towersDestroyedHere++;const left=enemies.filter(x=>x.tower).length,f=mapDef().fleet;
  toast(left?`${f.name}: ${left} kule kaldı`:`${f.name} düştü!`);
  if(left>0)return;
  fleetOwners[currentMap]='player';saveFleetOwners(fleetOwners);if(guild){guild.towers[currentMap]=Array(TOWER_SLOTS).fill(null);saveGuild(guild);}const r=fleetReward(mapDef().tier);state.gold+=r.gold;state.fame+=r.xp;saveAccount();
  setupFleetIsland();rewardNotice(`${f.name.toLocaleUpperCase('tr')} FİLONA KATILDI   +${r.gold} Altın   +${r.xp} TP`);
}
// Filonun diktiği kuleler: tipine göre top, havan (alan hasarı), zincir (yavaşlatma) ya da fener (dost onarımı).
function updateOwnTowers(dt:number){
  if(!hasFleetIsland()||fleetOwner()!=='player')return;const t=fleetTower(mapDef().tier);
  for(const tw of ownTowers){const def=TOWER_TYPES[tw.type],range=t.range*def.range;
    if(tw.type==='beacon'){if(dist(player,tw)<range&&state.hp<effectiveMaxHp()){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*.03*dt);if(Math.random()<dt*6)particles.push({x:player.x+(Math.random()-.5)*40,y:player.y+(Math.random()-.5)*30,vx:0,vy:-20,life:.6,maxLife:.6,kind:'foam'});}continue;}
    tw.cooldown-=dt;if(tw.cooldown>0)continue;
    const target=enemies.filter(e=>!e.tower&&dist(e,tw)<range).sort((a,b)=>dist(a,tw)-dist(b,tw))[0]??monsters.find(m=>dist(m,tw)<range);
    if(!target)continue;tw.cooldown=t.reload*def.reload;const muzzle=towerMuzzle(tw,tw.type),a=Math.atan2(target.y-muzzle.y,target.x-muzzle.x),speed=tw.type==='mortar'?300:420;
    muzzleFlash(muzzle.x,muzzle.y,a,60);shots.push({x:muzzle.x,y:muzzle.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:2.8,owner:'player',damage:t.ownDamage*def.damage,hit:false,ammo:tw.type==='chain'?'chain':theme().fleet==='lava'?'fire':'iron',target,
      slow:tw.type==='chain'?3:undefined,splash:tw.type==='mortar'?90:undefined});}
}
// Havan: isabet noktasının çevresindeki diğer düşmanlara %60 hasar
function towerSplash(s:Shot,hit:Target){burst(hit.x,hit.y,true);
  for(const o of [...enemies,...monsters] as Target[]){if(o===hit||(o.kind==='ship'&&o.tower)||dist(o,hit)>(s.splash??0))continue;const dmg=s.damage*.6;o.hp-=dmg;damageText(o.x,o.y,dmg);
    if(o.hp<=0){if(o.kind==='ship')sinkEnemy(o);else defeatMonster(o);}}}
function updateEvents(dt:number){
  const map=mapDef();
  updateOwnTowers(dt);
  eventPanelClock-=dt;if(eventPanelClock>0)return;eventPanelClock=.25;
  const panel=ui('eventPanel'),rows:string[]=[];
  const boss=activeBoss(),bd=bossFor(currentMap),bst=bossOf(currentMap),bossArt=`<i class="event-art" style="${portraitStyle(BOSS_ATLAS,bd.portrait,MAP_KEYS.length,BOSS_ATLAS_COLS)}"></i>`;
  if(boss)rows.push(`<button class="event-row boss" data-event-route="boss">${bossArt}<span><small>HARİTA BOSSU · ${Math.round(dist(boss,player))}m</small><strong>${bd.name}</strong><i><em style="width:${boss.hp/boss.maxHp*100}%"></em></i></span></button>`);
  else rows.push(`<div class="event-row boss-wait">${bossArt}<span><small>BOSS · ${NPCS[bd.trigger].name.toLocaleUpperCase('tr')} BATIR</small><strong>${bd.name}</strong><b>${bst.kills} / ${BOSS_KILLS}</b><i><em style="width:${bst.kills/BOSS_KILLS*100}%"></em></i></span></div>`);
  if(treasure.active||treasure.parts>0){const a=treasure.active;rows.push(`<button class="event-row treasure" data-event-route="treasure"><img src="${TREASURE_ICON}" alt=""/><span><small>${a?'HAZİNE HARİTASI · HEDEF':'HAZİNE HARİTASI PARÇALARI'}</small><strong>${a?`${a.map} · ${a.label}`:`${treasure.parts} / ${TREASURE_PARTS} parça`}</strong>${a?'':`<i><em style="width:${treasure.parts/TREASURE_PARTS*100}%"></em></i>`}</span></button>`);}
  const owned=fleetOwner()==='player',left=enemies.filter(e=>e.tower).length;
  if(hasFleetIsland())rows.push(`<button class="event-row fort ${owned?'owned':''}" data-event-route="fort"><i class="event-art fleet-art" style="background-image:url(${fleetBaseUrl(theme().fleet)})"></i><span><small>${owned?'FİLO ADAN · İÇERİDE ONARIM':`RAKİP FİLO ADASI · FİLO SAVAŞI GEREKİR`}</small><strong>${map.fleet.name}</strong>${owned?'':`<i class="danger"><em style="width:${left/FLEET.towers.length*100}%"></em></i>`}</span></button>`);
  panel.innerHTML=rows.join('');panel.classList.toggle('visible',rows.length>0);
  panel.querySelectorAll<HTMLButtonElement>('[data-event-route]').forEach(b=>b.onclick=()=>{if(b.dataset.eventRoute==='treasure'){const a=treasure.active;if(!a){toast('Denizde sürüklenen sandıklardan parça topla');return;}if(a.map!==currentMap){toast(`Hazine ${a.map} ${MAPS[a.map].name} denizinde (${a.label})`);return;}}const f=mapDef().fleet,target=b.dataset.eventRoute==='treasure'?treasure.active!:b.dataset.eventRoute==='boss'?activeBoss():fleetEnterable()?{x:f.x+FLEET.lagoon.x,y:f.y+FLEET.lagoon.y}:{x:f.x,y:f.y+FLEET.islandR+120};if(!target)return;routeTarget=navigablePoint({x:target.x,y:target.y});destination=routeVia(routeTarget);toast('Rota çizildi');});
}
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
// Elit özel yetenekleri yeniden tasarlanıyor; onaylanan yetenekler buraya eklenecek
// ---------------------------------------------------------------- Elit gemi pasifleri ve özel yetenekler
function elitePassive(id:EliteShipId){return eliteEnabled()&&activeEliteShip===id;}
// Bir salvonun çıplak gücü; yetenek hasarları bunun katı olarak ölçeklenir
function salvoPower(){return Math.max(1,state.cannon)*BALL_DAMAGE*(1+upgrades.damage*.11)*CANNONS[state.cannonType].damage*bonus.damage*(1+equipBonus().damage+achBonus().damage);}
function eliteDamageMult(t:Target|null){
  let m=(bannerTimer>0?1.2:1)*(rageTimer>0?1.3:1);
  if(elitePassive('ragnarok'))m*=1+.03*Math.floor(Math.max(0,1-state.hp/effectiveMaxHp())*10);
  if(t&&elitePassive('kraken')&&dist(player,t)<200)m*=1.1;
  if(t&&elitePassive('bone')&&t.hp<t.maxHp*.25)m*=1.2;
  return m;
}
function eliteTakenMult(){return(elitePassive('ironclad')?.9:1)*(steamTimer>0?.8:1)*(elitePassive('atlantean')&&consumableOn.shield?.9:1);}
function eliteLootMult(){return(elitePassive('sovereign')?1.1:1)*(bannerTimer>0?2:1);}
function eliteLeech(dmg:number){const r=(moonTimer>0?.25:0)+(elitePassive('crimson')?.03:0);if(r>0&&state.hp>0)state.hp=Math.min(effectiveMaxHp(),state.hp+dmg*r);}
// Gülle isabetinde çalışan pasifler: kritik, yanma, yavaşlatma, can emme
function eliteOnHit(t:Target,hit:number){
  if(!eliteEnabled())return hit;
  if(elitePassive('void')&&Math.random()<.05){hit*=2;spawnText(t,'KRİTİK','#c9a0ff');}
  if(elitePassive('magma')&&Math.random()<.15){t.burnTimer=3;t.burnDps=Math.max(t.burnDps??0,hit*FIRE_DOT_SHARE/3);}
  if(elitePassive('glacial'))t.slowTimer=Math.max(t.slowTimer,2);
  eliteLeech(hit);return hit;
}
function abilityHit(t:Target,dmg:number,raw=false){
  if(!targetExists(t))return;const hit=Math.round(raw?dmg:dmg*eliteDamageMult(t));
  t.hp-=hit;t.aggro=true;t.combatTimer=12;damageText(t.x,t.y,hit);burst(t.x,t.y);eliteLeech(hit);
  if(t.hp<=0){if(t.kind==='ship')sinkEnemy(t);else defeatMonster(t);}
}
function targetsNear(p:Vec,r:number){const out:Target[]=[];enemies.forEach(e=>{if(dist(e,p)<r+(e.hitRadius??25))out.push(e);});monsters.forEach(m=>{if(dist(m,p)<r+m.radius)out.push(m);});return out;}
const immovable=(t:Target)=>t.kind==='ship'&&(!!t.tower||!!t.boss);
function freezeTarget(t:Target,sec:number){if(t.kind==='ship'&&t.tower)return;const s=t.kind==='ship'&&t.boss?sec/2:sec;t.frozen=Math.max(t.frozen??0,s);spawnFrost(t,s);}
function later(t:number,fn:()=>void){abilityQueue.push({t,fn});}
function updateEliteAbilities(dt:number){
  domeTimer=Math.max(0,domeTimer-dt);steamTimer=Math.max(0,steamTimer-dt);moonTimer=Math.max(0,moonTimer-dt);bannerTimer=Math.max(0,bannerTimer-dt);
  rageTimer=Math.max(0,rageTimer-dt);coralTimer=Math.max(0,coralTimer-dt);stealthTimer=Math.max(0,stealthTimer-dt);playerHitClock+=dt;
  for(let i=abilityQueue.length-1;i>=0;i--){const q=abilityQueue[i];q.t-=dt;if(q.t<=0){abilityQueue.splice(i,1);q.fn();}}
  for(let i=lavaPools.length-1;i>=0;i--){const l=lavaPools[i];l.life-=dt;l.tick-=dt;if(l.tick<=0){l.tick=.5;targetsNear(l,80).forEach(t=>abilityHit(t,l.dps*.5,true));}if(l.life<=0)lavaPools.splice(i,1);}
  if(krakenHold){const k=krakenHold,t=k.target;k.time-=dt;
    if(k.time<=0||!targetExists(t))krakenHold=null;
    else{const d=Math.max(1,dist(player,t)),want={x:player.x+(t.x-player.x)/d*110,y:player.y+(t.y-player.y)/d*110};t.x+=(want.x-t.x)*Math.min(1,dt*5);t.y+=(want.y-t.y)*Math.min(1,dt*5);t.frozen=Math.max(t.frozen??0,.1);}}
  if(voidHole){const v=voidHole;v.time-=dt;
    for(const t of targetsNear(v,400))if(!immovable(t)){const d=Math.max(1,dist(t,v)),pull=Math.min(d,160*dt);t.x-=(t.x-v.x)/d*pull;t.y-=(t.y-v.y)/d*pull;}
    if(v.time<=0){voidHole=null;targetsNear(v,150).forEach(t=>abilityHit(t,v.damage));burst(v.x,v.y,true);playExplosion();}}
  if(coralTimer>0){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*.05*dt);targetsNear(player,300).forEach(t=>{t.slowTimer=Math.max(t.slowTimer,.5);});}
}
function activateEliteAbility(){
  if(!eliteEnabled()){toast('Elit yetenek için TERSANE\'den bir elit gemi seç');return;}
  const ship=eliteShip();
  if(eliteAbility.cooldown>0){toast(`${ship.ability} ${Math.ceil(eliteAbility.cooldown)} sn sonra hazır`);return;}
  const t=selected&&targetExists(selected)?selected:null;
  if(ship.needsTarget){if(!t){toast(`${ship.ability} için önce bir hedef seç`);return;}if(dist(player,t)>effectiveRange()+150){toast('Hedef yetenek menzilinin dışında');return;}}
  const P=salvoPower();let active=.8;
  switch(ship.id){
    case 'phantom':ghostTimer=5;active=5;spawnText(player,'HAYALET GEÇİŞ','#7fffe0');playWind();break;
    case 'magma':{const c={x:t!.x,y:t!.y};
      for(let i=0;i<5;i++){const d=i*.14,at=i?{x:c.x+(Math.random()-.5)*150,y:c.y+(Math.random()-.5)*100}:c;spawnMeteor(at,d);later(d+.45,()=>{targetsNear(at,70).forEach(x=>abilityHit(x,P*.5));burst(at.x,at.y,true);playExplosion();});}
      later(1.1,()=>{spawnLavaPool(c,4);lavaPools.push({x:c.x,y:c.y,life:4,tick:0,dps:P*.15});});screenTint(.25,'255,90,20');break;}
    case 'glacial':abilityHit(t!,P*.5);if(targetExists(t!)){if(t!.kind==='ship'&&t!.tower)toast('Kuleler dondurulamaz');else freezeTarget(t!,4);}break;
    case 'kraken':spawnTentacles(t!,3);abilityHit(t!,P*.8);if(targetExists(t!)){if(immovable(t!)){if(!(t!.kind==='ship'&&t!.tower))t!.frozen=Math.max(t!.frozen??0,1.5);}else krakenHold={target:t!,time:3};}playSplash();break;
    case 'ironclad':steamTimer=6;active=6;spawnSteam(player,6);playWind();break;
    case 'crimson':moonTimer=8;active=8;spawnBloodMoon(player,8);screenTint(.35,'150,20,30');break;
    case 'atlantean':domeTimer=5;active=5;spawnDome(player,5);playSplash();break;
    case 'bone':{const tg=t!;spawnScythe(tg);later(.35,()=>{if(!targetExists(tg))return;
      if(!immovable(tg)&&tg.hp<tg.maxHp*.2){spawnText(tg,'İNFAZ','#d9f7ff');spawnSoul(tg,player);abilityHit(tg,tg.hp+1,true);}
      else{spawnSoul(tg,player);abilityHit(tg,P*2.5);}});break;}
    case 'tempest':{const chain:Target[]=[t!];
      for(let j=0;j<2;j++){const last=chain[chain.length-1];let best:Target|null=null,bd=380;[...enemies,...monsters].forEach(x=>{if(chain.includes(x))return;const d=dist(x,last);if(d<bd){bd=d;best=x;}});if(best)chain.push(best);else break;}
      spawnLightning(player,chain[0]);abilityHit(chain[0],P*1.5);
      for(let j=1;j<chain.length;j++){const a=chain[j-1],b=chain[j],from={x:a.x,y:a.y};later(j*.15,()=>{if(!targetExists(b))return;spawnLightning(from,b,.55,false);abilityHit(b,P*(1.5-j*.3));});}
      break;}
    case 'sovereign':bannerTimer=10;active=10;spawnBanner(player,10);playLevelUp();break;
    case 'jade':{const ang=Math.atan2(t!.y-player.y,t!.x-player.x),len=effectiveRange()+40,dx=Math.cos(ang),dy=Math.sin(ang),o={x:player.x,y:player.y};spawnBreath(player,ang,len,1.2);
      later(.2,()=>{[...enemies,...monsters].forEach(x=>{const rx=x.x-o.x,ry=x.y-o.y,along=rx*dx+ry*dy,side=Math.abs(rx*dy-ry*dx),r=x.kind==='ship'?(x.hitRadius??25):x.radius;if(along>0&&along<len&&side<55+r){x.burnTimer=3;x.burnDps=Math.max(x.burnDps??0,P*.1);abilityHit(x,P*2);}});});break;}
    case 'ragnarok':rageTimer=4;active=4;spawnRage(player,4);screenTint(.3,'200,30,10');break;
    case 'void':voidHole={x:t!.x,y:t!.y,time:3,damage:P*2};spawnVortex(voidHole,3);active=3;break;
    case 'coral':coralTimer=6;active=6;spawnCoral(player,6);break;
    case 'sand':stealthTimer=5;active=5;spawnSun(player,5);targetsNear(player,350).forEach(x=>{x.cooldown=Math.max(x.cooldown,2);spawnBlind(x,2);});playWind();break;
  }
  eliteAbility.active=active;eliteAbility.cooldown=ELITE_COOLDOWN*bonus.cooldown;
}
function toggleConsumable(id:ConsumableId){
  const c=CONSUMABLES[id];if(!consumableOn[id]&&arsenal[id]<=0){toast(`${c.name} kalmadı — MALZEMELER'den alabilirsin`);return;}
  consumableOn[id]=!consumableOn[id];if(consumableOn[id]&&id==='shield')playShield();toast(`${c.name} ${consumableOn[id]?'açıldı':'kapatıldı'}`);renderQuickSlots();
}
// Açık sarf malzemesinden 1 adet harcar; bitince kendiliğinden kapanır. Çarpanı döndürür.
function useConsumable(id:ConsumableId){
  if(!consumableOn[id])return 1;if(arsenal[id]<=0){consumableOn[id]=false;renderQuickSlots();return 1;}
  arsenal[id]-=1;saveArsenal(arsenal);if(arsenal[id]<=0){consumableOn[id]=false;toast(`${CONSUMABLES[id].name} tükendi`);}renderQuickSlots();
  return CONSUMABLES[id].factor;
}
function activateAbility(id:'speed'){
  const t=abilityTimers[id],a=ABILITIES[id];
  if(t.cooldown>0){toast(`${a.name} ${Math.ceil(t.cooldown)} sn sonra hazır`);return;}
  t.active=a.duration;t.cooldown=a.cooldown*bonus.cooldown;toast(`${a.name} etkin`);playWind();
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
  const burnDps=(SPECIAL_AMMO.fire.burnDps+state.level*30)*bonus.burn;
  for(const e of [...enemies])if(e.burnTimer&&e.burnTimer>0){e.burnTimer-=dt;e.hp-=(e.burnDps||burnDps)*dt;if(e.burnTimer<=0)e.burnDps=0;if(Math.random()<dt*14)particles.push({x:e.x+(Math.random()-.5)*26,y:e.y+(Math.random()-.5)*20,vx:0,vy:-22,life:.5,maxLife:.5,kind:'spark'});if(e.hp<=0)sinkEnemy(e);}
  for(const m of monsters)if(m.burnTimer&&m.burnTimer>0){m.burnTimer-=dt;m.hp-=(m.burnDps||burnDps)*dt;if(m.burnTimer<=0)m.burnDps=0;if(Math.random()<dt*14)particles.push({x:m.x+(Math.random()-.5)*40,y:m.y+(Math.random()-.5)*30,vx:0,vy:-22,life:.5,maxLife:.5,kind:'spark'});if(m.hp<=0)defeatMonster(m);}
  for(const id of ['speed','mine'] as AbilityId[]){const t=abilityTimers[id],button=document.getElementById(`ability-${id}`);if(!button)continue;
    const cd=Math.min(1,t.cooldown/(ABILITIES[id].cooldown*bonus.cooldown)),label=t.active>0&&id!=='mine'?`${Math.ceil(t.active)} SN`:t.cooldown>0?`${Math.ceil(t.cooldown)}`:id==='mine'?`${arsenal.mine} · ${ABILITIES.mine.key}`:ABILITIES[id].key;
    button.style.setProperty('--cd',cd.toFixed(3));button.classList.toggle('active',t.active>0&&id!=='mine');const small=button.querySelector('small');if(small&&small.textContent!==label)small.textContent=label;}
}
// ---------------------------------------------------------------- Başarımlar
function bumpAch(stat:AchStat,n=1){ach.stats[stat]+=n;checkAchievements();}
function setAch(stat:AchStat,v:number){if(v>ach.stats[stat]){ach.stats[stat]=v;checkAchievements();}}
let achSaveAt=0;
function checkAchievements(){
  const fresh=unlockReached(ach);
  for(const d of fresh){state.pearls+=d.pearls;rewardNotice(`BAŞARIM · ${d.name.toLocaleUpperCase('tr')}   +${d.pearls} İnci   ${bonusText(d.bonus)}`);toast(`Başarım açıldı: ${d.name}`);}
  if(fresh.length){achBonusCache=achievementBonus(ach);saveAccount();playLevelUp();saveAchievements(ach);return;}
  const now=performance.now();if(now-achSaveAt>2000){achSaveAt=now;saveAchievements(ach);}
}
function renderAchievements(){
  const b=achBonus();ui('achSummary').innerHTML=`<b>${ach.unlocked.length} / ${ACHIEVEMENTS.length}</b> madalya · Kalıcı bonus: ${bonusText(b)||'henüz yok'}`;
  ui('achGrid').innerHTML=ACHIEVEMENTS.map((d,i)=>{const done=ach.unlocked.includes(d.id),v=Math.min(ach.stats[d.stat],d.goal);
    return`<article class="ach-card ${done?'done':''}"><i class="ach-badge" style="${badgeStyle(i)}"></i><div><h4>${d.name}</h4><p>${d.desc}</p><small>${bonusText(d.bonus)} · ${d.pearls} İnci</small><span class="ach-bar"><em style="width:${v/d.goal*100}%"></em></span><b>${done?'✓ AÇILDI':`${v.toLocaleString('tr-TR')} / ${d.goal.toLocaleString('tr-TR')}`}</b></div></article>`;}).join('');
}
setAch('level',state.level);
// ---------------------------------------------------------------- Günlük giriş ödülü
let daily=loadDaily();
function dailyText(r:DailyReward){return[r.gold&&`${r.gold.toLocaleString('tr-TR')} Altın`,r.pearls&&`${r.pearls} İnci`,r.chain&&`${r.chain} Zincir Güllesi`,r.fire&&`${r.fire} Ateş Güllesi`,r.explosive&&`${r.explosive} Patlayıcı Gülle`,r.powder&&`${r.powder} Kara Barut`,r.shield&&`${r.shield} Kalkan`,r.equip&&'Sıradan Donanım'].filter(Boolean) as string[];}
function openDaily(){renderDaily();ui('dailyOverlay').classList.add('open');}
function closeDaily(){ui('dailyOverlay').classList.remove('open');}
function renderDaily(){
  const st=dailyStatus(daily);
  ui('dailyGrid').innerHTML=[1,2,3,4,5,6,7].map(d=>{const r=dailyReward(d,state.level),done=d<st.day||(d===st.day&&!st.canClaim),today=d===st.day&&st.canClaim;
    return`<article class="daily-day ${done?'done':''} ${today?'today':''} ${d===7?'grand':''}"><b>${d}. GÜN</b><ul>${dailyText(r).map(t=>`<li>${t}</li>`).join('')}</ul>${today?'<button id="claimDaily">TOPLA</button>':done?'<span class="tick">✓ ALINDI</span>':'<span class="lock">SIRADA</span>'}</article>`;}).join('');
  ui('dailyNote').textContent=st.canClaim?'Bugünün ödülü hazır. Yarın gelmezsen takvim 1. güne döner.':'Bugünün ödülünü aldın. Yarın yeni ödül seni bekliyor.';
  const b=document.getElementById('claimDaily');if(b)b.onclick=claimToday;
}
function claimToday(){
  const st=dailyStatus(daily);if(!st.canClaim)return;const r=dailyReward(st.day,state.level);daily=claimDaily(daily);saveDaily(daily);setAch('daily',daily.streak);
  if(r.gold)state.gold+=r.gold;if(r.pearls)state.pearls+=r.pearls;if(r.chain)state.chainAmmo+=r.chain;
  for(const k of ['fire','explosive','powder','shield'] as const)if(r[k])arsenal[k]+=r[k]!;
  let eq='';if(r.equip){const pool=EQUIPMENT.filter(e=>e.rarity===0),e=pool[Math.floor(Math.random()*pool.length)];equipOwned[e.id]=(equipOwned[e.id]??0)+1;eq=e.name;}
  saveArsenal(arsenal);saveAccount();renderQuickSlots();updateUI();playCoins();renderDaily();
  rewardNotice(`GÜNLÜK ÖDÜL · ${st.day}. GÜN   ${dailyText(r).map(t=>t==='Sıradan Donanım'?eq:t).join('   ')}`);
}
// Oyun açılınca, bugünün ödülü alınmadıysa takvim kendiliğinden açılır
setTimeout(()=>{if(dailyStatus(daily).canClaim)openDaily();},1600);
// ---------------------------------------------------------------- Hazine avı
const treasure=loadTreasure();let dig:{t:number;x:number;y:number}|null=null;
function rollTreasurePart(){
  if(Math.random()>=PART_CHANCE)return;treasure.parts++;
  if(treasure.parts>=TREASURE_PARTS&&!treasure.active){treasure.parts-=TREASURE_PARTS;treasure.active=pickTreasureSpot();rewardNotice(`HAZİNE HARİTASI TAMAMLANDI   ${treasure.active.map} · ${treasure.active.label}`);toast(`Hazine ${MAPS[treasure.active.map].name} denizinde, ${treasure.active.label} koordinatında!`);}
  else toast(`Hazine haritası parçası bulundu (${Math.min(treasure.parts,TREASURE_PARTS)}/${TREASURE_PARTS})`);
  saveTreasure(treasure);
}
// Oyuncunun açabildiği denizlerden birinde, adalardan ve filo adasından uzak bir nokta
function pickTreasureSpot(){
  const keys=MAP_KEYS.filter(k=>tierOf(k)<=state.level),key=keys[Math.floor(Math.random()*keys.length)],m=MAPS[key];
  for(let i=0;i<80;i++){const x=300+Math.random()*(WORLD_WIDTH-600),y=300+Math.random()*(WORLD_HEIGHT-600);
    if(m.islands.some(is=>Math.hypot(x-is.x,y-is.y)<is.r+90))continue;if(Math.hypot(x-m.fleet.x,y-m.fleet.y)<FLEET.islandR+160)continue;
    return{map:key,x,y,label:coordLabel({x,y})};}
  return{map:key,x:WORLD_WIDTH/2,y:WORLD_HEIGHT-400,label:coordLabel({x:WORLD_WIDTH/2,y:WORLD_HEIGHT-400})};
}
const canDig=()=>!!treasure.active&&treasure.active.map===currentMap&&dist(player,treasure.active)<DIG_RADIUS;
function startDig(){if(!canDig()||dig)return;dig={t:0,x:player.x,y:player.y};destination=null;routeTarget=null;player.speed=0;toast('Kazı başladı — gemiyi hareket ettirme');}
function updateTreasure(dt:number){
  const btn=ui('digPrompt');btn.classList.toggle('visible',canDig()||!!dig);
  if(!dig)return;if(Math.hypot(player.x-dig.x,player.y-dig.y)>25||!canDig()){dig=null;toast('Kazı yarıda kaldı');return;}
  dig.t+=dt;(ui('digBar') as HTMLElement).style.width=`${Math.min(100,dig.t/DIG_SECONDS*100)}%`;
  if(Math.random()<dt*10)particles.push({x:treasure.active!.x+(Math.random()-.5)*30,y:treasure.active!.y+(Math.random()-.5)*20,vx:(Math.random()-.5)*60,vy:-40-Math.random()*40,life:.6,maxLife:.6,kind:'foam'});
  if(dig.t<DIG_SECONDS)return;
  const spot=treasure.active!,m=MAPS[spot.map],r=treasureReward(m.tier,NPCS[m.npcs[0]].gold);dig=null;treasure.active=null;treasure.found++;saveTreasure(treasure);bumpAch('treasure');
  state.gold+=r.gold;state.pearls+=r.pearls;if(r.equip)equipOwned[r.equip]=(equipOwned[r.equip]??0)+1;saveAccount();playCoins();playLevelUp();
  for(let n=0;n<3;n++)burst(spot.x+(Math.random()-.5)*30,spot.y+(Math.random()-.5)*20,false);
  rewardNotice(`HAZİNE BULUNDU   +${r.gold.toLocaleString('tr-TR')} Altın   +${r.pearls} İnci${r.equip?`   +${equipById(r.equip)!.name}`:''}`);toast('Hazine sandığı çıkarıldı!');
}
function drawTreasureMark(){
  const a=treasure.active;if(!a||a.map!==currentMap||dist(player,a)>380)return;const s=worldToScreen(a),t=performance.now()/1000;
  ctx.save();ctx.strokeStyle=`rgba(241,198,98,${.35+Math.sin(t*3)*.2})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y,DIG_RADIUS*camera.zoom,DIG_RADIUS*camera.zoom*.6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#c0291a';ctx.lineWidth=6;ctx.lineCap='round';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(s.x-12,s.y-12);ctx.lineTo(s.x+12,s.y+12);ctx.moveTo(s.x+12,s.y-12);ctx.lineTo(s.x-12,s.y+12);ctx.stroke();ctx.restore();
}
function updateLootChests(dt:number){
  for(let i=lootChests.length-1;i>=0;i--){const c=lootChests[i];c.life-=dt;
    if(dist(c,player)<CHEST_PICKUP_RADIUS){lootChests.splice(i,1);playCoins();recordQuestProgress('chest',currentMap);rollTreasurePart();bumpAch('chest');c.gold=Math.round(c.gold*bonus.chestGold);state.gold+=c.gold;state.chainAmmo+=c.chain;state.pearls+=c.pearls;saveAccount();renderQuickSlots();burst(c.x,c.y);rewardNotice(chestRewardText(c));toast(c.kind==='gilded'?'Yaldızlı sandık toplandı!':'Ganimet sandığı toplandı');if(destination&&Math.hypot(destination.x-c.x,destination.y-c.y)<2)destination=null;continue;}
    if(c.life<=0)lootChests.splice(i,1);}
  driftClock-=dt;
  if(driftClock<=0){driftClock=DRIFT_RESPAWN_SECONDS;if(lootChests.filter(c=>c.source==='drift').length<4){const p=randomSeaPoint(260);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(mapDef().tier-1)));}}
}
// Deniz pırıltıları (Seafight tarzı): denizde parlayan inciler; üzerinden geçince küçük ödül verir, yenisi rastgele yerde çıkar.
function spawnSparkle(){const p=randomSeaPoint(200);sparkles.push({x:p.x,y:p.y,seed:Math.random(),born:performance.now()});}
function updateSparkles(dt:number){
  for(let i=sparkles.length-1;i>=0;i--){const g=sparkles[i];if(dist(g,player)>SPARKLE_PICKUP)continue;sparkles.splice(i,1);
    const loot=1,light=NPCS[mapDef().npcs[0]],gold=Math.max(1,Math.round(light.gold*(.1+Math.random()*.1)*loot)),xp=Math.max(1,Math.round(light.xp*.15)),pearl=Math.random()<.2?1:0;
    state.gold+=gold;state.fame+=xp;state.pearls+=pearl;saveAccount();playCoins();
    for(let n=0;n<8;n++){const a=Math.random()*Math.PI*2,sp=30+Math.random()*50;particles.push({x:g.x,y:g.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.5,maxLife:.5,kind:'foam'});}
    particles.push({x:g.x,y:g.y-10,vx:0,vy:-26,life:1.1,maxLife:1.1,kind:'damage',text:`+${gold} Altın${pearl?' +1 İnci':''} +${xp} TP`});
    if(routeTarget&&dist(routeTarget,g)<4){routeTarget=null;destination=null;}
    sparkleQueue.push(SPARKLE_RESPAWN);}
  for(let i=sparkleQueue.length-1;i>=0;i--){sparkleQueue[i]-=dt;if(sparkleQueue[i]<=0){sparkleQueue.splice(i,1);spawnSparkle();}}
}
function drawSparkle(g:{x:number;y:number;seed:number;born:number}){const s=worldToScreen(g),now=performance.now();drawSeaSparkle(ctx,s.x,s.y,now,g.seed,Math.min(1,(now-g.born)/600));}
function drawLootChest(c:LootChest){const s=worldToScreen(c),fading=c.life<6?(Math.floor(c.life*4)%2?.35:.85):1;drawChestSprite(ctx,c.kind,s.x,s.y,performance.now(),fading);}
// Harita kenarı: komşu deniz varsa parıldayan geçiş şeridi, yoksa sis duvarı
function drawMapEdges(){
  const t=performance.now()/1000;
  for(const dir of ['north','south','east','west'] as Dir[]){const to=neighbor(currentMap,dir),open=!!to&&state.level>=MAPS[to].tier;
    const a=worldToScreen({x:0,y:0}),b=worldToScreen({x:WORLD_WIDTH,y:WORLD_HEIGHT});const band=EDGE;
    const x0=dir==='east'?b.x-band:a.x,y0=dir==='south'?b.y-band:a.y,wd=dir==='east'||dir==='west'?band:b.x-a.x,ht=dir==='north'||dir==='south'?band:b.y-a.y;
    const g=dir==='north'?ctx.createLinearGradient(0,y0,0,y0+band):dir==='south'?ctx.createLinearGradient(0,y0+band,0,y0):dir==='west'?ctx.createLinearGradient(x0,0,x0+band,0):ctx.createLinearGradient(x0+band,0,x0,0);
    const c=!to?'8,18,22':open?'111,214,196':'224,122,95',al=!to?.55:.22+Math.sin(t*2)*.06;g.addColorStop(0,`rgba(${c},${al})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(x0,y0,wd,ht);}
}
// Sinematik mod (yalnızca geliştirme): tanıtım videosu çekimi için cetveller gizlenir, kamera istenen noktayı izler
const cinematic:{on:boolean;focus:Vec|null}={on:false,focus:null};
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
const SHIP_DIRECTION_FRAMES=[4,3,6,5,0,1,2,7] as const;
// Açı birçok tur dönünce -2π'nin altına inebilir; negatif mod boş kare (görünmez gemi) verirdi → her zaman 0..7
function shipCompass(angle:number){return((Math.round(angle/(Math.PI/4))%8)+8)%8;}
function shipDirectionFrame(angle:number){return SHIP_DIRECTION_FRAMES[shipCompass(angle)];}
// Elit gemiler de başlangıç gemisi gibi 8 yönlü çizilir: pruva gidilen yöne döner (elite-dir-<id>-v1.webp, 4 × 2 kare, 221 × 256).
// Sayfalardaki yanlış yöne bakan kareler elite-ships.ts ELITE_DIR_SHOWS ile düzeltilir (gerekirse karşı yön aynalanır).
const eliteDirImages=new Map<string,HTMLImageElement>();
function eliteDirImage(id:string){let im=eliteDirImages.get(id);if(!im){im=new Image();im.decoding='async';im.src=`/assets/elite-dir-${id}-v1.webp?r=${SHIP_ART_REV}`;eliteDirImages.set(id,im);}return im;}
const ELITE_FRAME={w:221,h:256,scale:.56};
let ghostFade=0;
const shipAlpha=()=>ghostFade>0?ghostFade:ghostTimer>0?.55:stealthTimer>0?.4:1;
function drawEliteDirectionalShip(s:Vec){
  const id=eliteShip().id,dir=eliteDirImage(id);
  ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1)*shipAlpha();if(ghostTimer>0){ctx.filter='saturate(.35) brightness(1.35)';ctx.shadowColor='#5fffd0';};
  ctx.shadowColor=ghostTimer>0?'#5fffd0':'#000b';ctx.shadowBlur=13;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(dir.complete&&dir.naturalWidth){const {frame:f,mirror}=eliteDirFrame(id,shipCompass(player.angle)),{w,h,scale}=ELITE_FRAME;if(mirror)ctx.scale(-1,1);ctx.drawImage(dir,(f%4)*w,Math.floor(f/4)*h,w,h,-w*scale/2,-h*scale/2,w*scale,h*scale);ctx.restore();return true;}
  // Yön sayfası yüklenene kadar yan görünüş (sağa giderken aynalanır)
  const im=eliteArtImage(id);if(!im.complete||!im.naturalWidth){ctx.restore();return false;}
  const dx=Math.sin(player.angle);if(Math.abs(dx)>.2)eliteFacing=dx<0?-1:1;if(eliteFacing>0)ctx.scale(-1,1);ctx.drawImage(im,-75,-75,150,150);
  ctx.restore();return true;
}
// Özel gemi: tek açılı raster; sağa giderken aynalanır
const specialImages=new Map<string,HTMLImageElement>();
function drawSpecialShip(s:Vec){
  const sp=specialById(activeSkin);if(!sp)return false;
  const src=`${sp.dir??sp.art}?r=${SHIP_ART_REV}`;let im=specialImages.get(src);if(!im){im=new Image();im.decoding='async';im.src=src;specialImages.set(src,im);}
  if(!im.complete||!im.naturalWidth)return false;
  ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1)*shipAlpha();ctx.shadowColor='#000b';ctx.shadowBlur=13;if(ghostTimer>0){ctx.filter='saturate(.35) brightness(1.35)';ctx.shadowColor='#5fffd0';}
  if(sp.dir){const f=shipDirectionFrame(player.angle),c=im.naturalWidth/4;ctx.drawImage(im,(f%4)*c,Math.floor(f/4)*c,c,c,-80,-86,160,160);ctx.restore();return true;}
  specialFacingDir=specialFacing(player.angle,specialFacingDir);
  if(specialFacingDir>0)ctx.scale(-1,1);ctx.drawImage(im,-78,-96,156,156);ctx.restore();return true;
}
function drawPlayerShip(){
  const s=worldToScreen(player);
  if(eliteEnabled()&&drawEliteDirectionalShip(s))return;
  if(!eliteEnabled()&&activeSkin&&drawSpecialShip(s))return;
  // Elit atlas yüklenene kadar aynı yön karesindeki başlangıç gemisi görünür kalır; gemi asla kaybolmaz.

  if(!directionalShipImage.complete||!directionalShipImage.naturalWidth){
    if(!playerShipImage.complete||!playerShipImage.naturalWidth){drawShip(player,player.angle,'#173f48',1.1);return;}
  }
  ctx.save();ctx.translate(s.x,s.y);ctx.shadowColor='#000b';ctx.shadowBlur=13;ctx.globalAlpha=(state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1)*shipAlpha();if(ghostTimer>0){ctx.filter='saturate(.35) brightness(1.35)';ctx.shadowColor='#5fffd0';};
  if(directionalShipImage.complete&&directionalShipImage.naturalWidth){
    const frame=shipDirectionFrame(player.angle),sx=(frame%4)*256,sy=Math.floor(frame/4)*256;
    ctx.drawImage(directionalShipImage,sx,sy,256,256,-80,-86,160,160);
  }else ctx.drawImage(playerShipImage,-75,-80,150,150);
  ctx.restore();
}
function drawIsland(i:WorldIsland){const s=worldToScreen(i);if(drawIslandSprite(ctx,i,s.x,s.y)){ctx.fillStyle='#e8dcb8';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='600 12px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.9);ctx.shadowBlur=0;return;}const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,i.r);g.addColorStop(0,'#617c4e');g.addColorStop(.5,'#3c593e');g.addColorStop(.66,'#b9a16b');g.addColorStop(.72,'#17434a');g.addColorStop(1,'#0b2b35');ctx.fillStyle=g;ctx.beginPath();for(let n=0;n<18;n++){const a=n/18*Math.PI*2,r=i.r*(.78+Math.sin(n*4.7)*.09);const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();for(let n=0;n<7;n++){const a=n*2.1,r=i.r*.38;ctx.fillStyle='#213c2d';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,7+n%3*2,0,7);ctx.fill();}ctx.fillStyle='#d7c697';ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.76);}
function drawMonster(m:Monster){const s=worldToScreen(m);if(drawMonsterSheet(ctx,m.def,s.x,s.y,m.phase)){ctx.fillStyle=theme().label;ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-m.radius-18);ctx.shadowBlur=0;if(m.hp<m.maxHp){ctx.fillStyle='#07161c';ctx.fillRect(s.x-30,s.y-m.radius-12,60,5);ctx.fillStyle='#b070ff';ctx.fillRect(s.x-30,s.y-m.radius-12,60*m.hp/m.maxHp,5);}return;}ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#477f72';ctx.lineWidth=9;ctx.lineCap='round';for(let n=0;n<6;n++){const a=n/6*Math.PI*2+m.phase*.12;ctx.beginPath();ctx.moveTo(Math.cos(a)*12,Math.sin(a)*12);ctx.quadraticCurveTo(Math.cos(a+.5)*50,Math.sin(a+.5)*50,Math.cos(a+Math.sin(m.phase+n)*.35)*m.radius,Math.sin(a+Math.sin(m.phase+n)*.35)*m.radius);ctx.stroke();}ctx.fillStyle='#38675f';ctx.beginPath();ctx.arc(0,0,25,0,7);ctx.fill();ctx.fillStyle='#d5cc71';ctx.beginPath();ctx.arc(-8,-5,4,0,7);ctx.arc(8,-5,4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#89b0a8';ctx.font='600 10px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-66);}
function drawFleetIsland(){
  if(!hasFleetIsland())return;const f=mapDef().fleet,s=worldToScreen(f),th=theme().fleet,owned=fleetOwner()==='player';
  const baseOk=drawFleetBase(ctx,th,s.x,s.y);
  if(owned)for(const tw of [...ownTowers].sort((a,b)=>a.y-b.y)){const p=worldToScreen(tw);drawBuiltTower(ctx,TOWER_TYPES[tw.type].frame,tw.slot,p.x,p.y);}
  if(!baseOk){ctx.fillStyle='#4a7a3c';ctx.beginPath();ctx.arc(s.x,s.y,FLEET.islandR,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3a3c42';ctx.lineWidth=18;ctx.beginPath();ctx.arc(s.x,s.y,FLEET.wallR,Math.PI/2+FLEET.gap/2,Math.PI/2-FLEET.gap/2+Math.PI*2);ctx.stroke();}
  ctx.textAlign='center';ctx.font='700 14px Cinzel';ctx.fillStyle=owned?'#9fe8dc':'#f0b8a8';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.name,s.x,s.y-FLEET.islandR-24);ctx.font='700 9px Inter';ctx.fillText(owned?'FİLO ADAN · LAGÜNDE ONARIM':fleetEnterable()?'RAKİP FİLO · TEST: GİRİŞ AÇIK (GÜNEY KANALI)':'RAKİP FİLO · GİRİŞ YASAK',s.x,s.y-FLEET.islandR-10);ctx.shadowBlur=0;
}
// ---- atış ve savaş efektleri (src/vfx.ts atlası)
const UNDER=new Set<ParticleKind>(['foam','bubble','plank','target']);
function targetExistsOrPlayer(t:Target|typeof player){return t===player||targetExists(t as Target);}
function shotHeight(s:Shot){if(!s.flight)return 0;const p=Math.min(1,(s.age??0)/s.flight);return (s.arc??0)*4*p*(1-p);}
function drawShotShadow(s:Shot){const p=worldToScreen(s),h=shotHeight(s),k=1-Math.min(.5,h/160);drawVfx(ctx,'shadow',p.x,p.y+2,46*k,{alpha:.9*k});}
function drawShotBall(s:Shot){const p=worldToScreen(s),y=p.y-shotHeight(s),spin=(s.age??0)*16;
  if(s.visual==='spit'){drawVfx(ctx,'spit',p.x,y,46,{rot:spin*.2});return;}
  if(s.owner==='enemy'){if(s.ammo==='fire')drawVfx(ctx,'fire',p.x,y,52,{rot:spin*.3});else drawVfx(ctx,'enemy',p.x,y,40);return;}
  if(s.ammo==='fire')drawVfx(ctx,'fire',p.x,y,54,{rot:spin*.3});
  else if(s.ammo==='chain')drawVfx(ctx,'chain',p.x,y,62,{rot:spin});
  else if(s.ammo==='explosive')drawVfx(ctx,'bomb',p.x,y,46,{rot:Math.sin(spin*.3)*.4});
  else if(s.ammo==='breaker')drawVfx(ctx,'breaker',p.x,y,48,{rot:Math.atan2(s.vy,s.vx)});
  else if(s.ammo==='leech')drawVfx(ctx,'leech',p.x,y,48);
  else if(s.ammo==='grape'){const a=Math.atan2(s.vy,s.vx);for(let k=0;k<5;k++){const off=(k-2)*7,back=(k%2)*8;drawVfx(ctx,'pellet',p.x-Math.cos(a)*back-Math.sin(a)*off,y-Math.sin(a)*back+Math.cos(a)*off,34);}}
  else drawVfx(ctx,'iron',p.x,y,40);}
function drawParticle(p:Particle){const s=worldToScreen(p),a=Math.max(0,Math.min(1,p.life/p.maxLife)),y=s.y-(p.z??0),size=p.size;
  switch(p.kind){
    case 'damage':ctx.globalAlpha=a;ctx.fillStyle='#ffd878';ctx.font='700 14px Inter';ctx.textAlign='center';ctx.fillText(p.text||'',s.x,y);ctx.globalAlpha=1;return;
    case 'explosion':drawVfxAnim(ctx,EXPLOSION_ROW,1-a,s.x,y-(size??90)*.12,size??90);return;
    case 'splash':drawVfxAnim(ctx,SPLASH_ROW,1-a,s.x,y-(size??70)*.28,size??70);return;
    case 'flash':drawVfx(ctx,'flash',s.x,y,(size??40)*(.75+.5*(1-a)),{rot:p.rot,alpha:a});return;
    case 'smoke':drawVfx(ctx,'smoke',s.x,y,(size??22)*(1+(1-a)*1.1),{alpha:a*.75,variant:p.variant??0,rot:p.rot});return;
    case 'spark':drawVfx(ctx,'ember',s.x,y,size??12,{alpha:a});return;
    case 'foam':drawVfx(ctx,'foam',s.x,y,(size??18)*(1+(1-a)*.8),{alpha:a*.85,variant:p.variant??0});return;
    case 'target':drawVfx(ctx,'target',s.x,y,(size??100)*(1.15-.15*(1-a)),{alpha:.55+.35*Math.sin(performance.now()/90)});return;
    case 'shock':drawVfx(ctx,'shock',s.x,y,(size??200)*(.4+.6*(1-a)),{alpha:a});return;
    case 'soul':drawVfx(ctx,'soul',s.x,y,size??24,{alpha:Math.min(1,a*1.8)});return;
    case 'splinter':drawVfx(ctx,'splinter',s.x,y,size??24,{rot:p.rot,alpha:Math.min(1,a*2),variant:p.variant??0});return;
    default:drawVfx(ctx,p.kind as 'bubble'|'plank'|'firePuff'|'poison',s.x,y,(size??18)*(p.kind==='firePuff'?.6+a*.6:1),{rot:p.rot,alpha:Math.min(1,a*1.6)});}}
// Batan gemi: yan yatar, suya gömülür, kabarcıklar çıkarır
function drawWreck(w:Wreck){const s=worldToScreen(w),k=Math.min(1,w.t/WRECK_TIME);ctx.save();ctx.globalAlpha=Math.max(0,1-k*k);ctx.translate(s.x,s.y+k*12);ctx.rotate(Math.sin(w.t*3)*.05+k*.35);ctx.scale(1-k*.2,1-k*.5);drawNpcShip(ctx,w.sprite,w.span,0,0,w.angle,performance.now());ctx.restore();}
// ---------------------------------------------------------------- Gemi–su etkileşimi
// Her geminin altında yumuşak su gölgesi ve bordasında köpük halkası; hareket ederken kıçtan V biçiminde açılan
// dümen suyu izi ve pruvada su sıçraması. Görünüm 42° yukarıdan bakış: zemindeki izler dikeyde ~0,67 basıktır.
const FLAT=.67;
type WakePt={x:number;y:number;a:number;t:number;w:number};
const wakes=new Map<object,{pts:WakePt[];px:number;py:number;acc:number}>();
const hullLength=(o:object)=>o===player?100:(o as Enemy).boss?165:(o as Enemy).def?(o as Enemy).def!.span*.6:60;
function updateWakes(dt:number){
  const now=performance.now()/1000,ships:object[]=[player,...enemies.filter(e=>!e.tower)];
  for(const [o] of wakes)if(!ships.includes(o))wakes.delete(o);
  for(const o of ships){const sh=o as {x:number;y:number;angle:number},w=wakes.get(o)??{pts:[],px:sh.x,py:sh.y,acc:0};wakes.set(o,w);
    const v=Math.hypot(sh.x-w.px,sh.y-w.py)/Math.max(dt,1e-3);w.px=sh.x;w.py=sh.y;w.acc+=dt;
    while(w.pts.length&&now-w.pts[0].t>2.6)w.pts.shift();
    if(v>12&&w.acc>.06){w.acc=0;const L=hullLength(o),fx=Math.sin(sh.angle),fy=-Math.cos(sh.angle);if(w.pts.length>40)w.pts.shift();
      w.pts.push({x:sh.x-fx*L*.42,y:sh.y-fy*L*.42*FLAT,a:sh.angle,t:now,w:Math.min(1,v/110)});
      if(Math.random()<Math.min(.9,v/120))particles.push({x:sh.x+fx*L*.46+(Math.random()-.5)*8,y:sh.y+fy*L*.46*FLAT,vx:-fy*(Math.random()<.5?-1:1)*(18+Math.random()*24)+fx*v*.3,vy:fx*(Math.random()<.5?-1:1)*12+fy*v*.3*FLAT,life:.45,maxLife:.45,kind:'foam'});}}
}
function drawWake(o:object){const w=wakes.get(o);if(!w||!w.pts.length)return;const now=performance.now()/1000,L=hullLength(o);
  ctx.save();ctx.lineCap='round';
  for(const side of [-1,1]){ctx.beginPath();let first=true;
    for(let i=w.pts.length-1;i>=0;i--){const p=w.pts[i],age=now-p.t,lx=Math.cos(p.a),ly=Math.sin(p.a)*FLAT,spread=L*.16+age*L*.32*p.w,s=worldToScreen({x:p.x+lx*side*spread,y:p.y+ly*side*spread});
      if(first){ctx.moveTo(s.x,s.y);first=false;}else ctx.lineTo(s.x,s.y);}
    ctx.strokeStyle='rgba(235,250,248,.16)';ctx.lineWidth=2.6;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;ctx.stroke();}
  for(let i=0;i<w.pts.length;i+=2){const p=w.pts[i],age=now-p.t,a=Math.max(0,1-age/2.6)*.07*p.w,s=worldToScreen(p),r=L*.06+age*L*.05;
    ctx.fillStyle=`rgba(225,245,242,${a})`;ctx.beginPath();ctx.ellipse(s.x,s.y,r,r*FLAT*.7,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();}
function drawHullWater(o:{x:number;y:number;angle:number},L:number,moving:number){
  const s=worldToScreen(o),fx=Math.sin(o.angle),fy=-Math.cos(o.angle)*FLAT,rot=Math.atan2(fy,fx),len=L*.5*Math.hypot(fx,fy)+L*.14,wid=L*.19,t=performance.now()/1000;
  ctx.save();ctx.translate(s.x,s.y+4);ctx.rotate(rot);
  const g=ctx.createRadialGradient(0,0,wid*.3,0,0,len*1.05);g.addColorStop(0,'rgba(2,14,20,.34)');g.addColorStop(1,'rgba(2,14,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,len*1.05,wid*1.6,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=`rgba(230,248,245,${.18+.1*Math.sin(t*2.4)+moving*.18})`;ctx.lineWidth=1.6+moving*1.4;ctx.setLineDash([10,7]);ctx.lineDashOffset=-t*18;ctx.beginPath();ctx.ellipse(0,0,len,wid,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();}
const shipMoving=(o:object)=>{const w=wakes.get(o),p=w?.pts[w.pts.length-1];return p&&performance.now()/1000-p.t<.15?p.w:0;};
// Can çubuğu: çerçeveli, türüne göre renkli ve genişlikte
function drawHealthBar(x:number,y:number,width:number,frac:number,color:string){
  ctx.fillStyle='rgba(3,12,16,.85)';ctx.fillRect(x-width/2-2,y-2,width+4,10);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(x-width/2,y,width,6);ctx.strokeStyle='rgba(232,200,130,.55)';ctx.lineWidth=1;ctx.strokeRect(x-width/2-2.5,y-2.5,width+5,11);
  const g=ctx.createLinearGradient(0,y,0,y+6);g.addColorStop(0,'#ffffff55');g.addColorStop(.5,'#ffffff00');g.addColorStop(1,'#00000040');ctx.fillStyle=color;ctx.fillRect(x-width/2,y,width*Math.max(0,Math.min(1,frac)),6);ctx.fillStyle=g;ctx.fillRect(x-width/2,y,width*Math.max(0,Math.min(1,frac)),6);}
// Boss: tema renkli nabız halesi, kara amiral sancağı ve geniş adlı can plakası
function drawBossAura(e:Enemy,s:{x:number;y:number}){const t=performance.now()/1000,tint=theme().tint,g=ctx.createRadialGradient(s.x,s.y,30,s.x,s.y,170);
  g.addColorStop(0,tint+'00');g.addColorStop(.62,tint+Math.round((.09+Math.sin(t*2.6)*.04)*255).toString(16).padStart(2,'0'));g.addColorStop(1,tint+'00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y+8,170,170*FLAT,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=tint+'88';ctx.lineWidth=2;ctx.setLineDash([14,10]);ctx.lineDashOffset=t*30;ctx.beginPath();ctx.ellipse(s.x,s.y+8,150,150*FLAT,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  if(Math.random()<.25)particles.push({x:e.x+(Math.random()-.5)*60,y:e.y-20-Math.random()*30,vx:(Math.random()-.5)*8,vy:-22,life:1.6,maxLife:1.6,kind:'smoke',variant:Math.floor(Math.random()*4)} as Particle);}
function drawBossFlag(s:{x:number;y:number},top:number){const t=performance.now()/1000,x=s.x+6,y=s.y+top-78;
  ctx.save();ctx.strokeStyle='#2a1a0e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+54);ctx.lineTo(x,y-4);ctx.stroke();
  ctx.fillStyle='#0c0c0e';ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<=10;i++){const u=i/10;ctx.lineTo(x+u*46,y+Math.sin(t*5+u*4)*3*u);}for(let i=10;i>=0;i--){const u=i/10;ctx.lineTo(x+u*46,y+28+Math.sin(t*5+u*4)*3*u);}ctx.closePath();ctx.fill();
  ctx.fillStyle='#e8dcc0';const cx=x+20,cy=y+12+Math.sin(t*5+1.7)*1.5;ctx.beginPath();ctx.arc(cx,cy,5.5,0,Math.PI*2);ctx.fill();ctx.fillRect(cx-3.5,cy+3,7,4);ctx.fillStyle='#0c0c0e';ctx.beginPath();ctx.arc(cx-2,cy,1.5,0,7);ctx.arc(cx+2,cy,1.5,0,7);ctx.fill();
  ctx.strokeStyle='#e8dcc0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-8,cy+6);ctx.lineTo(cx+8,cy+12);ctx.moveTo(cx+8,cy+6);ctx.lineTo(cx-8,cy+12);ctx.stroke();ctx.restore();}
function drawBossPlate(e:Enemy,s:{x:number;y:number},top:number){const W=190,x=s.x,y=s.y+top-10;
  ctx.save();ctx.fillStyle='rgba(8,10,12,.82)';ctx.strokeStyle='#f1c662';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-W/2,y-24,W,34,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f1c662';ctx.font='700 12px Cinzel';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.name,x,y-13);
  drawHealthBar(x,y-3,W-24,e.hp/e.maxHp,'#e0463a');ctx.fillStyle='#fff';ctx.font='700 8px Inter';ctx.fillText(`${Math.ceil(e.hp).toLocaleString('tr-TR')} / ${e.maxHp.toLocaleString('tr-TR')}`,x,y);ctx.restore();}
// Güneş parıltıları: dünya ızgarasına bağlı rastgele noktalarda kısa süreli yanıp sönen ışık kırpıntıları
function drawSeaGlints(w:number,h:number){const t=performance.now()/1000,C=70,vw=w/camera.zoom,vh=h/camera.zoom,x0=camera.x-vw/2,y0=camera.y-vh/2,dark=theme().weather==='fog'||theme().weather==='motes'||theme().weather==='storm';
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let gx=Math.floor(x0/C);gx<=Math.ceil((x0+vw)/C);gx++)for(let gy=Math.floor(y0/C);gy<=Math.ceil((y0+vh)/C);gy++){
    const hsh=Math.sin(gx*127.1+gy*311.7)*43758.5453,f=hsh-Math.floor(hsh);if(f>.42)continue;
    const ph=f*50,b=Math.pow(Math.max(0,Math.sin(t*(1.2+f*2)+ph)),14);if(b<.05)continue;
    const s=worldToScreen({x:gx*C+f*C*2.1%C,y:gy*C+(f*7.3%1)*C}),len=5+f*10,a=b*(dark?.25:.55);
    ctx.fillStyle=`rgba(255,250,225,${a})`;ctx.beginPath();ctx.ellipse(s.x,s.y,len,1.2,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(s.x,s.y,1.1,len*.35,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();}
function draw(){
  const w=innerWidth,h=innerHeight,map=mapDef(),th=theme();const sea=ctx.createLinearGradient(0,0,0,h);sea.addColorStop(0,th.sea[0]);sea.addColorStop(1,th.sea[1]);ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-w/2,-h/2);
  const pattern=seaTilePattern(ctx);if(pattern){const vw=w/camera.zoom,vh=h/camera.zoom;pattern.setTransform(new DOMMatrix().translateSelf(-camera.x+w/2+Math.sin(performance.now()/5200)*14,-camera.y+h/2+performance.now()/260%1024).scaleSelf(2,2));ctx.globalAlpha=.2;ctx.fillStyle=pattern;ctx.fillRect(w/2-vw/2,h/2-vh/2,vw,vh);
    // İkinci dalga katmanı: farklı ölçek ve ters yönde akış; iki katmanın girişimi denize canlı bir kıpırtı verir
    const t=performance.now();pattern.setTransform(new DOMMatrix().translateSelf(-camera.x*1.04+w/2-t/190%1536,-camera.y*1.04+h/2+Math.cos(t/4100)*20).scaleSelf(3.1,3.1).rotateSelf(24));ctx.globalAlpha=.12;ctx.fillRect(w/2-vw/2,h/2-vh/2,vw,vh);ctx.globalAlpha=1;}
  drawSeaGlints(w,h);
  ctx.globalAlpha=.12;ctx.fillStyle=th.label;ctx.font='700 42px Cinzel';ctx.textAlign='center';for(const label of map.labels){const p=worldToScreen(label);ctx.fillText(label.text,p.x,p.y);}ctx.globalAlpha=1;
  drawCoordGrid();drawMapEdges();islands.forEach(drawIsland);drawFleetIsland();lootChests.forEach(drawLootChest);drawTreasureMark();sparkles.forEach(drawSparkle);mines.forEach(m=>{const p=worldToScreen(m);drawMineSprite(ctx,p.x,p.y,performance.now(),m.arm>0,m.life<5);});monsters.forEach(drawMonster);
  wrecks.forEach(drawWreck);drawAbilityFxUnder(ctx,worldToScreen);particles.forEach(p=>{if(UNDER.has(p.kind))drawParticle(p);});shots.forEach(drawShotShadow);
  wakes.forEach((_,o)=>drawWake(o));
  [...enemies].sort((a,b)=>a.y-b.y).forEach(e=>{const s=worldToScreen(e);if(e.boss)drawBossAura(e,s);if(!e.tower)drawHullWater(e,hullLength(e),shipMoving(e));const raster=e.tower?drawBastion(ctx,e.towerIndex??0,s.x,s.y):e.def?drawNpcShip(ctx,e.def.sprite,e.def.span,s.x,s.y,e.angle,performance.now()):false;if(!raster)drawShip(e,e.angle,e.color);const top=raster?(e.tower?TOWER_LABEL_OFFSET:shipLabelOffset(e.def!.span)):-42;if(e.boss){drawBossFlag(s,top);drawBossPlate(e,s,top);return;}const bw=e.tower||e.role==='heavy'?72:56;drawHealthBar(s.x,s.y+top,bw,e.hp/e.maxHp,e.tower?'#f09a4f':e.role==='heavy'?'#f0584a':'#4fd0da');ctx.fillStyle='#e6dccb';ctx.font='600 10px Inter';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText(e.name,s.x,s.y+top-7);ctx.shadowBlur=0;});
  if(selected&&targetExists(selected)){const t=worldToScreen(selected);ctx.strokeStyle='#f1c662';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,selected.kind==='monster'?selected.radius+10:34,0,7);ctx.stroke();}
  drawHullWater(player,hullLength(player),shipMoving(player));
  if(ghostTimer>0){const px=player.x,py=player.y;ghostTrail.forEach((p,i)=>{ghostFade=(i+1)/(ghostTrail.length+1)*.35;player.x=p.x;player.y=p.y;drawPlayerShip();});ghostFade=0;player.x=px;player.y=py;}
  drawPlayerShip();drawPlayerLabel();
  particles.forEach(p=>{if(!UNDER.has(p.kind))drawParticle(p);});shots.forEach(drawShotBall);
  drawAbilityFx(ctx,worldToScreen,innerWidth,innerHeight);
  if(consumableOn.shield){const p=worldToScreen(player),t=performance.now()/1000,g=ctx.createRadialGradient(p.x,p.y,30,p.x,p.y,62);g.addColorStop(0,'#9fe8ff00');g.addColorStop(.75,'#9fe8ff30');g.addColorStop(1,'#d4a64c88');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,62,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(212,166,76,${.55+Math.sin(t*6)*.25})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,62,0,Math.PI*2);ctx.stroke();}
  if(destination){const d=worldToScreen(destination),p=worldToScreen(player);ctx.strokeStyle='#e7cf8d55';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(d.x,d.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e7cf8d';ctx.beginPath();ctx.arc(d.x,d.y,9,0,7);ctx.stroke();}
  const ps=worldToScreen(player);ctx.strokeStyle=selected?'#e8cf934d':'#e8cf9328';ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(ps.x,ps.y,selected?effectiveRange():115,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
  drawWeather();if(!cinematic.on)drawCoordRulers();
  if(mapFade>0){ctx.fillStyle=`rgba(2,10,14,${Math.min(1,mapFade)})`;ctx.fillRect(0,0,w,h);}
  drawMinimap();
}
// Koordinat ızgarası: dünya içinde soluk çizgiler, ekran kenarında kamerayı izleyen cetveller.
function drawCoordGrid(){
  const a=worldToScreen({x:0,y:0});ctx.strokeStyle='rgba(210,240,235,.055)';ctx.lineWidth=1;ctx.beginPath();
  for(let c=1;c<GRID_COLS;c++){const x=a.x+c*CELL_W;ctx.moveTo(x,a.y);ctx.lineTo(x,a.y+WORLD_HEIGHT);}
  for(let r=1;r<GRID_ROWS;r++){const y=a.y+r*CELL_H;ctx.moveTo(a.x,y);ctx.lineTo(a.x+WORLD_WIDTH,y);}
  ctx.stroke();
}
function drawCoordRulers(){
  const w=innerWidth,h=innerHeight,z=camera.zoom,T=16,L=26,top=0,here=gridCell(player);
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
function drawMinimap(){const W=170,H=125,sx=(x:number)=>x/WORLD_WIDTH*W,sy=(y:number)=>y/WORLD_HEIGHT*H,th=theme();
  mini.fillStyle=th.sea[1];mini.fillRect(0,0,W,H);mini.strokeStyle='#9fc2bd22';mini.strokeRect(.5,.5,W-1,H-1);
  for(const dir of ['north','south','east','west'] as Dir[]){const to=neighbor(currentMap,dir);if(!to)continue;mini.fillStyle=state.level>=MAPS[to].tier?'#6fd6c4aa':'#e07a5f88';if(dir==='north')mini.fillRect(W/2-14,0,28,2);if(dir==='south')mini.fillRect(W/2-14,H-2,28,2);if(dir==='west')mini.fillRect(0,H/2-12,2,24);if(dir==='east')mini.fillRect(W-2,H/2-12,2,24);}
  mini.save();mini.scale(W/WORLD_WIDTH,H/WORLD_HEIGHT);
  for(const i of islands)drawIslandSprite(mini,i,i.x,i.y);
  if(hasFleetIsland()){const f=mapDef().fleet;drawFleetBase(mini,th.fleet,f.x,f.y);}
  mini.restore();
  for(const m of monsters){mini.fillStyle='#b070ff';mini.beginPath();mini.arc(sx(m.x),sy(m.y),2.5,0,7);mini.fill();}
  mini.fillStyle='#f4f8ff';for(const g of sparkles)mini.fillRect(sx(g.x)-.5,sy(g.y)-.5,1.5,1.5);
  for(const c of lootChests){mini.fillStyle=c.kind==='gilded'?'#ffd46b':'#d9a95b';mini.fillRect(sx(c.x)-1,sy(c.y)-1,2,2);}
  for(const e of enemies){if(e.tower)continue;mini.fillStyle=e.boss?'#f1c662':'#c34e3d';const r=e.boss?5:3;mini.fillRect(sx(e.x)-r/2,sy(e.y)-r/2,r,r);}
  mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(sx(player.x),sy(player.y),3,0,7);mini.fill();}
// manualClock (yalnızca geliştirme): tanıtım videosu kare kare çekilirken oyun dışarıdan adımlanır
let manualClock=false;
let last=performance.now();function loop(now:number){const dt=Math.min(.033,(now-last)/1000);last=now;if(!manualClock){update(dt);draw();}requestAnimationFrame(loop);}renderQuickSlots();updateUI();requestAnimationFrame(loop);
// Yalnızca geliştirme sunucusunda: tarayıcı testleri için durum erişimi.
if(import.meta.env.DEV)(window as any).__ky={elite:(id:EliteShipId)=>{activeEliteShip=id;activeShip=id;activeSkin=null;eliteAbility.cooldown=0;activateEliteAbility();},treasure,rollTreasurePart,manual:(on:boolean)=>{manualClock=on;},step:(dt:number)=>{update(dt);draw();},noFade:()=>{mapFade=0;},cinematic,makeShip,NPCS,MONSTERS,state,player,camera,enemies,monsters,respawn,enterMap,mapDef,fleetOwner,lootChests,sparkles,sinkEnemy,shots,particles,wrecks,select:(t:Target)=>{selected=t;state.attacking=true;},route:(v:Vec)=>{routeTarget=navigablePoint(v);destination=routeVia(routeTarget);},fleetNav,get routeTarget(){return routeTarget;},get selected(){return selected;},get destination(){return destination;}};

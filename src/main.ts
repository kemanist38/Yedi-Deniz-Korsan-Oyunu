import {ELITE_ENTRY_PRICE,CANNON_COSTS,UPGRADE_PRICE_MULTIPLIER,ELITE_ECONOMY_VERSION,migrateElitePoints} from './economy';
import {migrateQuestRules,type SavedQuests} from './quest-migration';
import {ELITE_CANNON_CAPACITY,ELITE_REWARDS,cumulativeEliteBonus,eliteBonusText} from './elite-progression';
import {drawMysticPlayerMarker} from './player-marker';
import {PIRATE_RAGE_DESIGN,loadSpecialDesign,saveSpecialDesign,loadDesignOwned,saveDesignOwned,type SpecialDesignId} from './special-designs';
import {loadFestival,saveFestival,festivalStatus,claimFestival,FESTIVAL_REWARDS,FESTIVAL_DAYS,type FestivalReward} from './festival';
import {drawFlare,drawShotSprite,drawPuff,drawGlint} from './shotArt';
import './storageMigration';
import './style.css';
import './rage-ui.css';
import {ACTIONS,loadSettings,saveSettings,keyLabel,normalizeKey,DEFAULT_BINDS,type ActionId} from './settings';
import {playBossMusic,stopBossMusic,playBossHorn,setAudio,unlockAudio,playCannon,playEnemyCannon,playHit,playExplosion,playCoins,playSpeed,playRage,playShield,playSplash,playLevelUp,playMapJump,playSink,playHeal,playClick} from './audio';
import {drawSeaSparkle,drawNpcShip,drawMonsterSheet,drawChestSprite,drawIslandSprite,drawFleetBase,drawBastion,drawBuiltTower,drawMineSprite,seaTilePattern,islandSheetUrl,shipLabelOffset,portraitStyle,preload,fleetBaseUrl,fleetTowerUrl,setTowerTheme,TOWER_LABEL_OFFSET,FLEET_ART,drawFleetOccluder} from './sprites';
import {MAPS,GRID,THEMES,NPCS,MONSTERS,QUESTS,QUEST_COOLDOWN_MS,FLEET,FLEET_SCALE,WORLD_WIDTH,WORLD_HEIGHT,MAX_LEVEL,xpNeed,neighbor,bossFor,BOSS_KILLS,BOSS_ATLAS,BOSS_ATLAS_COLS,MAP_KEYS,type BossDef,type MapDef,tierOf,fleetTower,fleetReward,PORTRAIT_COUNT,PORTRAIT_COLS,PORTRAIT_ATLAS,GRID_COLS,GRID_ROWS,CELL_W,CELL_H,colName,rowName,gridCell,coordLabel,type MapKey,type WorldIsland,type NpcDef,type MonsterDef,type Dir,type QuestDef} from './campaign';
import {ACHIEVEMENTS,loadAchievements,saveAchievements,unlockReached,achievementBonus,bonusText,badgeStyle,type AchStat} from './achievements';
import {loadDaily,saveDaily,dailyStatus,claimDaily,dailyReward,type DailyReward} from './daily';
import {TREASURE_PARTS,PART_CHANCE,DIG_RADIUS,DIG_SECONDS,TREASURE_ICON,loadTreasure,saveTreasure,treasureReward} from './treasure';
import {EQUIPMENT,EQUIP_SLOTS,RARITY_NAMES,equipById,equipStatText,equipTotals,equipIconStyle,type EquipSlot} from './equipment';
import {PEARL_PACKS,packTotal,priceText,VIP_PACKS,VIP_XP_BONUS,loadVipUntil,saveVipUntil,vipActive,vipDaysLeft,extendVip,VIP_DAY_MS} from './pearlShop';
import {BOARDS,rankRows,rankPage,RANK_PAGE_SIZE,type BoardId,type RankPlayer,type RankFleet,type RankRow} from './leaderboard';
import {redeem,loadRedeemed,saveRedeemed,rewardText} from './coupons';
import {newPvpBudget,pvpClamp,type PvpBudget} from './pvp';
import {loadLevelQuest,saveLevelQuest,levelQuestDone,levelQuestKill,levelQuestGoal,needsLevelQuest} from './level-quest';
import {loadMentorship,saveMentorship,canMentor,apprenticeBlock,pairBlock,acceptRequest,rejectRequest,removeApprentice,onOwnLevel,claimReward,GRADUATE_LEVEL,MAX_APPRENTICES,TOGETHER_XP_BONUS} from './mentorship';
import {INSIGNIA_SHEET,INSIGNIA_W,INSIGNIA_H,insigniaTier,loadRivalSinks,saveRivalSinks} from './insignia';
import {loadLog,saveLog,addLog,daySummary,LOG_KINDS,type LogKind,type LogEntry} from './logbook';
import {BALL_DAMAGE,CHAIN_FACTOR,CHAIN_SLOW,FIRE_NPC_FACTOR,EXPLOSIVE_PLAYER_FACTOR,leechHeal,repairAmount,ELITE_POINTS_PER_BALL,ELITE_MAX_LEVEL,questEp,bossEp,eliteLevelEp,eliteLevelFromEp,ABILITIES,SPECIAL_AMMO,MINE,SPEED_BOOST,VISION_RADIUS,COMPASS,CONSUMABLES,AMMO_PRICES,SUPPLY_PRICES,loadArsenal,saveArsenal,type AbilityId,type SpecialAmmo,type ConsumableId,type SupplyId,type Price,priceOf} from './arsenal';
import {loadFleetOwners,saveFleetOwners,loadRuins,markRuin,ruinLeft,ruinLabel,clearRuins} from './conquest';
import {RIVAL_SP,battleRank,loadRivalLog,claimRivalSp,dayKey,RANK_SHEET,RANK_COLS,RANK_ICONS,rankIcon,BATTLE_RANKS} from './battle';
import {setupChat} from './chat';
import {SIEGE_MS,WALL_TOWERS,INNER_TOWERS,gateOf,gateLeft,siegeWindow,newSiege,loadSiege,saveSiege,siegePhase,siegeStats,siegeProgress,contribReward,earnsChest,victoryChest,ranking,loadTitle,grantTitle,HERO_TITLE,type SiegeSave} from './siege';
import {dayEvent,spMult,xpMult,epMult,goldMult,sparkleMult,bossKillsNeeded,untilMidnight} from './events';
import {TALENTS,OFFICERS,OFFICER_MAX_RANK,officerCost,officerSlots,talentPoints,loadCrew,saveCrew,spentPoints,computeBonus,type TalentId,type OfficerId} from './crew';
import {FLEET_MASK} from './fleetMask';
import {drawVfx} from './vfx';
import {fleetTowerRegen} from './fleetBalance';
import {towerContains,towerMuzzle} from './towerGeometry';
import {loadGuild,saveGuild,islandSlots,towerTypeCost,tagError,canBuild,TOWER_TYPES,ROLE_NAMES,TOWER_SLOTS,type TowerType,type GuildRole,GUILD_NAME_MAX,GUILD_TAG_MAX,type Guild} from './guild';
import {loadProfile,saveProfile,nickError,rankOf,NICK_CHANGE_COST,NICK_COOLDOWN_MS,NICK_MAX} from './profile';
import {createChest,chestRewardText,CHEST_PICKUP_RADIUS,CHEST_CLICK_RADIUS,DRIFT_RESPAWN_SECONDS,type LootChest} from './loot';
import {ELITE_SHIPS,ELITE_ISO,eliteById,type EliteShipId} from './elite-ships';
import {isoAdvance,type IsoMove,type IsoFace} from './iso-move';
import {spawnText,spawnSoul,spawnRage,clearRageFx,screenTint,updateAbilityFx,drawAbilityFx} from './abilityFx';
import {newRage,rageActive,rageReady,gainRage,startRage,rageSalvo,tickRage,RAGE_MAX,RAGE_SPEED,RAGE_SALVOS,RAGE_PER_RIVAL,RAGE_PER_BOSS} from './rage';

type Vec = { x: number; y: number };
type AmmoKind = 'iron'|'chain'|SpecialAmmo;
const isSpecial=(a:string):a is SpecialAmmo=>a in SPECIAL_AMMO;
type CannonKind = 'cast'|'long'|'rapid'|'heavy';
type CannonStock=Record<CannonKind,number>;
type Shot = Vec & { noHome?:boolean; captain?:Enemy; foe?:Enemy; powder?:boolean; vx:number; vy:number; life:number; owner:'player'|'enemy'; damage:number; hit:boolean; ammo:AmmoKind; target?:Target; slow?:number; splash?:number; visual?:'spit'; age?:number; flight?:number; arc?:number; trail?:number };
type SalvoRound = { powder?:boolean; delay:number; target:Target; side:number; slot:number; damage:number; ammo:AmmoKind };
type EnemyRole='light'|'heavy';
// Test kaptanı: elit gemili, oyuncu gibi savaşan yapay rakip (yalnız test modunda 1/1'de)
type Captain={elite:EliteShipId;ammo:AmmoKind;ammoClock:number;foe:Enemy|null;orbit:Vec|null;orbitClock:number};
type Enemy = Vec & { kind:'ship'; captain?:Captain; pvp?:PvpBudget; frozen?:number; iso?:IsoMove|null; isoT?:Vec; face?:IsoFace; def?:NpcDef; boss?:BossDef; summoned?:boolean; escortsCalled?:boolean; burnTimer?:number; burnDps?:number; tower?:boolean; towerIndex?:number; lastHitBy?:'player'|'captain'; siege?:boolean; commander?:boolean;  hitRadius?:number; fireRange?:number; rewardXp?:number; role:EnemyRole; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; damage:number; reload:number; rewardGold:number; rewardFame:number; color:string; name:string; tier:number; aggro:boolean; wander:number; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type ParticleKind='flare'|'ember'|'glint'|'wisp'|'foam'|'smoke'|'spark'|'damage'|'flash'|'splinter'|'bubble'|'plank'|'firePuff'|'target'|'poison'|'soul'|'shock';
// z: su üstünden yükseklik (ekranda yukarı kayar); vz ile savrulan parçalar suya düşer
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:ParticleKind; text?:string; color?:string; z?:number; vz?:number; rot?:number; vr?:number; size?:number; variant?:number };
type Wreck = Vec & { image:HTMLCanvasElement; t:number };
const wrecks:Wreck[]=[];
type Monster = Vec & { kind:'monster'; frozen?:number; def:MonsterDef; burnTimer?:number; burnDps?:number; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean; slowTimer:number; homeX:number; homeY:number; combatTimer:number };
type Target = Enemy|Monster;
type UpgradeKind = 'hull'|'damage'|'range'|'reload'|'speed'|'repair';
type QuickItemId = 'iron'|'chain'|SpecialAmmo|'mine'|'powder'|'shield'|'repairkit'|'speed'|'compass';
type ShipSelection='starter'|EliteShipId;
const ELITE_ONE_PRICE=ELITE_ENTRY_PRICE;
// Test süresince elit gemiler ve 8. seviyeye kadar tüm haritalar açık.
const ELITE_TEST_MODE=true;
const CANNONS:Record<CannonKind,{name:string;damage:number;range:number;reload:number}>={
  cast:{name:'Döküm',damage:1,range:390,reload:1.65},
  long:{name:'Uzun',damage:.82,range:470,reload:2.05},
  rapid:{name:'Seri',damage:.68,range:340,reload:1.05},
  heavy:{name:'Ağır',damage:1.38,range:365,reload:2.65}
};
const UPGRADES:Record<UpgradeKind,{name:string;description:string;effect:string;pearls:number}>={
  hull:{name:'Güçlendirilmiş Gövde',description:'Geminin azami gövde dayanıklılığını artırır.',effect:'+2.500 gövde · top kapasitesi sabit',pearls:8},
  damage:{name:'Top Güvertesi',description:'Her borda atışının verdiği hasarı artırır.',effect:'+%11 hasar',pearls:10},
  range:{name:'Uzun Namlular',description:'Tüm top türlerinin etkili menzilini artırır.',effect:'+18 menzil',pearls:9},
  reload:{name:'Tecrübeli Topçular',description:'Topların yeniden dolma süresini azaltır.',effect:'-%4 dolum',pearls:12},
  speed:{name:'Yeni Yelken Takımı',description:'Geminin ulaşabileceği azami hızı artırır.',effect:'+5 hız',pearls:9},
  repair:{name:'Usta Marangozlar',description:'Açık denizde yapılan tamirin hızını artırır.',effect:'+%4 tamir',pearls:7}
};
const QUICK_ITEMS:Record<QuickItemId,{name:string;icon:string;category:'ammo'|'consumable';description:string}>={
  iron:{name:'Demir Gülle',icon:'iron',category:'ammo',description:'Standart ve sınırsız top güllesi.'},chain:{name:'Zincir Güllesi',icon:'chain',category:'ammo',description:'Oyuncuları 3 saniye %40 yavaşlatır; NPC\'ye etki etmez.'},
  fire:{name:'Ateş Güllesi',icon:'damage',category:'ammo',description:'NPC ve canavarlara %40 fazla hasar.'},
  explosive:{name:'Patlayıcı Gülle',icon:'damage',category:'ammo',description:'Oyunculara %40 fazla hasar.'},breaker:{name:'Kule Kırıcı',icon:'iron',category:'ammo',description:'Kulelere 2,6 kat hasar.'},leech:{name:'Can Emici',icon:'damage',category:'ammo',description:'Yalnız oyunculardan şansla can çalar.'},
  repairkit:{name:'Tamir Sandığı',icon:'repairkit',category:'consumable',description:'Açık deniz tamirini başlatır.'},speed:{name:'Hız İksiri',icon:'speed',category:'consumable',description:'İçince 4 sn boyunca hız %55 artar; her kullanımda 1 adet harcar.'},
  compass:{name:'Pusula',icon:'compass',category:'consumable',description:'Basınca 8 saniye boyunca haritadaki bütün gemileri ve canavarları mini haritada gösterir. 20 saniyede bir kullanılır, her kullanımda 1 adet harcar.'},
  powder:{name:'Kara Barut',icon:'damage',category:'consumable',description:CONSUMABLES.powder.description},shield:{name:'Kalkan',icon:'hull',category:'consumable',description:CONSUMABLES.shield.description},mine:{name:'Deniz Mayını',icon:'hull',category:'consumable',description:'Kıçtan mayın bırakır.'}
};
const AMMO_ROW=6;
const QUICK_TIPS:Record<QuickItemId,string>={iron:'Sınırsız',chain:'Yavaşlatır',fire:'NPC +%40',explosive:'Oyuncu +%40',breaker:'Kule ×2,6',leech:'Can çalar',repairkit:'Tamir',speed:'Hızlandırır',compass:'Herkesi gösterir',powder:'Hasar artar',shield:'Hasar azalır',mine:'Mayın bırakır'};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="corner-buttons"><button class="round-button" id="openShop" aria-label="Market"><img src="/assets/icon-market-v2.webp" alt="" draggable="false"/></button><button class="round-button" id="openMenu" aria-label="Menü"><img src="/assets/icon-menu-v2.webp" alt="" draggable="false"/></button></div>
      <nav class="shop-tabs" id="shopTabs"><button id="openEliteShips" data-shop="eliteShipOverlay"><img class="nav-img" id="shipNavIcon" alt="" draggable="false"/><span>TERSANE</span></button><button id="openEquipShop" data-shop="equipShopOverlay"><i class="nav-img equip-nav"></i><span>DONANIM</span></button><button id="openCannonShop" data-shop="cannonShopOverlay"><img class="nav-img" src="/assets/cannon-cast-v1.webp" alt="" draggable="false"/><span>TOPLAR</span></button><button id="openShip" data-shop="shipOverlay"><img class="nav-img" src="/assets/icon-inventory-v3.webp" alt="" draggable="false"/><span>ENVANTER</span></button><button id="openMarket" data-shop="marketOverlay"><img class="nav-img" src="/assets/ammo-fire-v2.webp" alt="" draggable="false"/><span>GÜLLELER</span></button><button id="openLoadoutTab" data-shop="supplyOverlay"><img class="nav-img" src="/assets/icon-chest-v2.webp" alt="" draggable="false"/><span>MALZEMELER</span></button><button id="openPearlShop" data-shop="pearlShopOverlay"><img class="nav-img" src="/assets/icon-pearl-v1.webp" alt="" draggable="false"/><span>MAĞAZA</span></button><button class="shop-close" id="closeShopTabs" aria-label="Marketi kapat">×</button></nav>
      <div class="captain-overlay menu-overlay mentor-overlay" id="mentorOverlay"><section class="captain-profile menu-window mentor-window"><header><img class="menu-logo" src="/assets/icon-mentor-v1.webp" alt="" draggable="false"/><div><span class="eyebrow">Usta ve çırak</span><h2>KAPTAN &amp; MUÇO</h2></div><button id="closeMentorship" aria-label="Kapat">×</button></header><div id="mentorPanel"></div></section></div><div class="captain-overlay menu-overlay" id="menuOverlay"><section class="captain-profile menu-window"><header><img class="menu-logo" src="/assets/logo-pirate-rage-v1.webp" alt="Pirate Rage: Korsan Öfkesi" draggable="false"/><div><span class="eyebrow">Kaptan köşkü</span><h2>MENÜ</h2></div><button id="closeMenu" aria-label="Menüyü kapat">×</button></header><div class="menu-grid"><button id="openCaptain"><img src="/assets/icon-hat-v2.webp" alt="" draggable="false"/><span>KAPTAN PROFİLİ</span></button><button id="openGuild"><img src="/assets/icon-fleet-v1.webp" alt="" draggable="false"/><span>FİLO</span></button><button id="openDevelopment"><img src="/assets/icon-anvil-v2.webp" alt="" draggable="false"/><span>GELİŞTİRME</span></button><button id="openCrew"><img src="/assets/crew-helmsman-v1.webp" alt="" draggable="false"/><span>TAYFA</span></button><button id="openDaily"><img src="/assets/icon-chest-v2.webp" alt="" draggable="false"/><span>GÜNLÜK ÖDÜL</span></button><button id="openMenuQuests"><img src="/assets/icon-scroll-v2.webp" alt="" draggable="false"/><span>GÖREVLER</span></button><button id="openMenuWorld"><img id="menuWorldIcon" alt="" draggable="false"/><span>DÜNYA HARİTASI</span></button><button id="openLog"><img src="/assets/icon-treasure-map-v3.webp" alt="" draggable="false"/><span>SEYİR DEFTERİ</span></button><button id="openRanks"><img src="/assets/icon-flag-v1.webp" alt="" draggable="false"/><span>SIRALAMALAR</span></button><button id="openCoupon"><img src="/assets/icon-pearl-v1.webp" alt="" draggable="false"/><span>KUPON KODU</span></button><button id="openMentorship"><img src="/assets/icon-mentor-v1.webp" alt="" draggable="false"/><span>KAPTAN &amp; MUÇO</span></button><button id="openSettings"><img src="/assets/icon-gear-v2.webp" alt="" draggable="false"/><span>AYARLAR</span></button></div></section></div>
      <div class="resources"><div class="resource compact"><i class="sprite icon-gold"></i><span>ALTIN</span><b id="gold">000</b></div><div class="resource compact pearl" id="pearlResource" title="İnci satın al"><i class="sprite icon-pearl"></i><span>İNCİ</span><b id="pearls">000</b><em class="pearl-plus">+</em></div></div>
      <div class="panel quest" hidden><span class="eyebrow">Aktif görev</span><h3 id="questTitle">Görev seçilmedi</h3><p id="questDescription">Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.</p><div class="progress" id="quest">Hazır olduğunda bir görev başlat</div><button class="quest-open" id="openQuests">GÖREVLERİ AÇ</button></div>
      <section class="combat-targets" id="combatTargets" aria-live="polite"></section>
      <div class="hud-dock"><div class="dock-status"><div class="status-pair"><div class="status-line hp-line"><span>CP</span><i><em id="hpHudBar"></em></i><b id="hpHudText">100 / 100</b></div></div><div class="dock-center"><button class="recenter" id="recenterShip" aria-label="Gemiyi haritada ortala">✥</button></div><div class="status-pair"><div class="status-line battle-line"><span>SP</span><i><em id="battleBar"></em></i><b id="battleText">0 / 100</b></div></div></div></div><div class="slot-bar" id="ammoBar" data-bar="ammo"><div class="bar-grip" title="Tutup sürükle · çift tık: eski yerine"><button class="bar-toggle" aria-label="Gülle yuvalarını aç/kapat" title="Aç/kapat"><i></i></button></div><div class="bar-slots" id="ammoSlots"></div></div><div class="slot-bar" id="itemBar" data-bar="item"><div class="bar-grip" title="Tutup sürükle · çift tık: eski yerine"><button class="bar-toggle" aria-label="Malzeme yuvalarını aç/kapat" title="Aç/kapat"><i></i></button></div><div class="bar-slots" id="itemSlots"></div></div><div class="ammo-picker" id="ammoPicker"></div><div class="top-status" id="topStatus"><div class="status-line xp-line"><span>TP</span><i><em id="xpHudBar"></em></i><b id="xpHudText">0 / 100</b></div><b class="top-level" id="level" title="Kaptan seviyesi">1</b><div class="status-line elite-line"><span>EP</span><i><em id="eliteBar"></em></i><b id="eliteText">0 / 100</b></div></div>
      <div class="combat-controls" id="combatControls"><button class="combat-action attack" id="attack" title="Saldır"><b><img src="/assets/icon-attack-v2.webp" alt="" draggable="false"/></b><span id="attackLabel">SALDIR</span><small id="reloadText">HAZIR</small></button><button class="combat-action repair" id="repair" title="Tamir et"><b><img src="/assets/icon-repair-v2.webp" alt="" draggable="false"/></b><span>TAMİR</span><small data-bind="repair"></small></button><button class="combat-action speed ability" id="ability-speed" title="Hız İksiri"><b><img src="/assets/icon-speed-potion-v2.webp" alt="" draggable="false"/></b><span>HIZ</span><small data-bind="speed"></small></button><button class="combat-action mine ability" id="ability-mine" title="Deniz Mayını"><b><img src="/assets/icon-mine-v2.webp" alt="" draggable="false"/></b><span>MAYIN</span><small data-bind="mine"></small></button><button class="combat-action rage" id="rageButton" title="Korsan Öfkesi — bar dolunca bas: 2 salvo %25 hasar, %15 hız"><b><img src="/assets/icon-app-192.png" alt="" draggable="false"/></b><span>KORSAN ÖFKESİ</span><small id="rageTime">%0</small></button></div>
      <div class="map-cluster"><div class="map-badge" id="mapBadge"><strong id="mapName"></strong><small id="mapSubtitle"></small><b class="map-coord" id="mapCoord" title="Konum koordinatı">1/1 - 00AA</b></div><canvas id="minimap" width="188" height="133"></canvas><button class="world-map-button" id="openWorldMap" aria-label="Dünya haritalarını görüntüle"><img id="worldMapIcon" alt="" draggable="false"/><span>DÜNYA</span></button><button class="quest-bust" id="openQuestTop" aria-label="Görevler"><img src="/assets/quest-captain-v2.webp" alt="" draggable="false"/><span>GÖREVLER</span><small id="questBadge"></small></button><div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div></div>
      <div class="sink-notices" id="sinkNotices" role="status" aria-live="polite"></div>
      <div class="toast" id="toast"></div>
      <div class="portal-prompt" id="portalPrompt"></div><div class="quest-overlay daily-overlay" id="dailyOverlay"><section class="daily-window"><header><div><span class="eyebrow">Her gün gel, ödül büyüsün</span><h2>GÜNLÜK ÖDÜL</h2></div><button id="closeDaily" aria-label="Kapat">×</button></header><div class="daily-grid" id="dailyGrid"></div><p class="daily-note" id="dailyNote"></p></section></div><button class="dig-prompt" id="digPrompt"><img src="/assets/icon-treasure-map-v3.webp" alt="" draggable="false"/><span>HAZİNEYİ KAZ</span><i><em id="digBar"></em></i></button><div class="event-panel" id="eventPanel"></div><div class="quest-overlay world-overlay" id="worldMapOverlay"><section class="world-scroll" aria-label="Dünya haritası"><button class="scroll-close" id="closeWorldMap" aria-label="Dünya haritasını kapat">×</button><div class="world-chart" id="worldChart"></div><div id="worldInfo" hidden></div></section></div><div class="quest-overlay" id="questOverlay"><section class="quest-log"><header><div><span class="eyebrow">Kaptanın görev defteri</span><h2>DENİZ GÖREVLERİ</h2></div><button id="closeQuests" aria-label="Görevleri kapat">×</button></header><p class="quest-intro">1 aktif görev · Tekrar süresi: ${QUEST_COOLDOWN_MS/3_600_000} saat</p><div class="quest-list" id="questList"></div></section></div>
      <div class="captain-overlay" id="captainOverlay"><section class="captain-profile"><header><div><span class="eyebrow">Oyuncu profili</span><h2 id="captainName">KAPTAN</h2></div><button id="closeCaptain" aria-label="Kaptan profilini kapat">×</button></header><div class="captain-tab" id="captainTab-profile"><div class="captain-identity"><div class="captain-portrait"><img src="/assets/icon-hat-v2.webp" alt="" draggable="false"/><b id="captainLevel">1</b></div><div><span>AMİRAL GEMİSİ</span><strong>Yedi Deniz</strong><small>Gölgeler Denizi Kaptanı</small></div></div><div class="captain-nick" id="captainNick"></div><div class="captain-stat-grid"><article><span>TECRÜBE PUANI</span><b id="xpText">0 / 100</b><i class="xp"><em id="xpBar"></em></i></article><article><span>CAN PUANI</span><b id="hpText">100 / 100</b><i class="hp"><em id="hpBar" style="width:100%"></em></i></article><article><span>ELİT PUAN</span><b id="profileElite">0 / 100</b><i class="elite"><em id="profileEliteBar"></em></i></article><article><span>SAVAŞ PUANI</span><b id="profileBattle">0 / 500</b><i class="battle"><em id="profileBattleBar"></em></i></article></div><div class="bonus-summary" id="bonusSummary"></div><section class="rank-medals"><header><span class="eyebrow">Savaş rütbesi madalyaları</span><p class="ach-summary" id="rankMedalSummary"></p></header><div class="rank-medal-grid" id="rankMedals"></div></section><section class="captain-medals"><header><span class="eyebrow">Madalyalar ve kalıcı bonuslar</span><p class="ach-summary" id="achSummary"></p></header><div class="ach-grid" id="achGrid"></div></section></div></section></div><div class="captain-overlay" id="guildOverlay"><section class="captain-profile crew-window guild-window"><header><div><span class="eyebrow">Filo hazinesi ve ada kuleleri</span><h2>FİLO</h2></div><button id="closeGuild" aria-label="Filo penceresini kapat">×</button></header><div id="guildPanel"></div></section></div><div class="captain-overlay" id="crewOverlay"><section class="captain-profile crew-window"><header><div><span class="eyebrow">Geminin subayları</span><h2>TAYFA</h2></div><button id="closeCrew" aria-label="Tayfayı kapat">×</button></header><div id="crewPanel"></div></section></div><div class="quest-overlay" id="logOverlay"><section class="quest-log log-window"><header><div><span class="eyebrow">Kaptanın günlüğü</span><h2>SEYİR DEFTERİ</h2></div><button id="closeLog" aria-label="Seyir defterini kapat">×</button></header><div id="logPanel"></div></section></div><div class="quest-overlay" id="rankOverlay"><section class="quest-log rank-log"><header><div><span class="eyebrow">Denizlerin en iyileri</span><h2>SIRALAMALAR</h2></div><button id="closeRanks" aria-label="Sıralamaları kapat">×</button></header><div id="rankPanel"></div></section></div><div class="quest-overlay" id="couponOverlay"><section class="quest-log coupon-log"><header><div><span class="eyebrow">Etkinlik ödülleri</span><h2>KUPON KODU</h2></div><button id="closeCoupon" aria-label="Kupon penceresini kapat">×</button></header><p class="quest-intro">Etkinliklerde ve duyurularda paylaşılan kodu gir, ödülün hemen hesabına eklensin. Her kod bir kez kullanılır.</p><div class="coupon-form"><input id="couponInput" maxlength="32" placeholder="KUPON KODU" autocomplete="off" spellcheck="false"/><button id="couponRedeem">KULLAN</button></div><p class="coupon-result" id="couponResult"></p></section></div><div class="quest-overlay" id="settingsOverlay"><section class="quest-log settings-log"><header><div><span class="eyebrow">Oyun tercihleri</span><h2>AYARLAR</h2></div><button id="closeSettings" aria-label="Ayarları kapat">×</button></header><div id="settingsPanel"></div></section></div>
      <div class="ship-overlay" id="eliteShipOverlay"><section class="ship-menu elite-ship-window"><header><div><span class="eyebrow">Filo tersanesi</span><h2>TERSANE</h2></div></header><div class="elite-ship-layout"><div class="elite-ship-grid" id="eliteShipGrid"></div><aside class="elite-ship-detail" id="eliteShipDetail"></aside></div></section></div><div class="ship-overlay" id="shipOverlay"><section class="ship-menu inv-window"><header><div class="inv-top"><img src="/assets/cannon-cast-v1.webp" alt="" draggable="false"/><span id="shipSummary"></span></div><h2>ENVANTER</h2></header><div class="inv-modes"><button data-inv-mode="cannon">TOPLAR</button><button data-inv-mode="equip">DONANIM</button></div><div class="inv-body"><aside class="inv-captain"><img src="/assets/captain-bust-v1.webp" alt="" draggable="false"/></aside><section class="inv-panel"><header><span>Depo</span><button class="inv-arrow to-depot" id="invToDepot" title="Seçili topu depoya al">⬅</button></header><div class="inv-grid" id="invDepot" data-side="depot"></div></section><section class="inv-panel"><header><button class="inv-arrow to-ship" id="invToShip" title="Seçili topu gemiye al">➡</button><span>Gemi</span></header><div class="inv-grid" id="invShip" data-side="ship"></div></section><aside class="inv-info"><header>Bilgi</header><div id="cannonRows"></div></aside></div></section></div><div class="market-overlay" id="equipShopOverlay"><section class="market-menu"><header><div><span class="eyebrow">Gemi ustası</span><h2>DONANIM</h2></div></header><div class="market-list" id="equipShopList"></div></section></div><div class="market-overlay" id="cannonShopOverlay"><section class="market-menu cannon-shop"><header><div><span class="eyebrow">Topçu dökümhanesi</span><h2>TOPLAR</h2></div></header><div class="market-list" id="cannonShopList"></div></section></div>
      <div class="development-overlay" id="developmentOverlay"><section class="development-menu"><header><div><span class="eyebrow">Kaptanın gelişim planı</span><h2>GELİŞTİRME</h2></div><button id="closeDevelopment" aria-label="Geliştirmeyi kapat">×</button></header><div id="talentPanel"><div class="dev-tree" id="upgradeList"></div><div class="upgrade-confirm" id="upgradeConfirm"></div></div></section></div>
      <div class="market-overlay" id="marketOverlay"><section class="market-menu"><header><div><span class="eyebrow">Tüccar loncası</span><h2>GÜLLELER</h2></div></header><div class="market-list" id="marketList"></div></section></div><div class="market-overlay" id="supplyOverlay"><section class="market-menu"><header><div><span class="eyebrow">Sarf malzemeleri</span><h2>MALZEMELER</h2></div></header><div class="market-list" id="supplyList"></div></section></div><div class="market-overlay" id="pearlShopOverlay"><section class="market-menu pearl-shop"><header><div><span class="eyebrow">Kaptanın hazinesi</span><h2>İNCİ HAZİNESİ</h2><p>İnciyle elit gülleler, malzemeler ve elit gemiler alınır. Büyük paketlerde bonus inci artar.</p></div></header><div class="vip-block"><div class="vip-head"><b class="vip-crown">VİP</b><div><h3>VİP ÜYELİK</h3><p>Hareket halindeyken tamir · %10 fazla tecrübe puanı</p></div><span class="vip-status" id="vipStatus"></span></div><div class="vip-packs" id="vipPacks"></div></div><h3 class="pearl-title">İNCİ PAKETLERİ</h3><div class="pearl-packs" id="pearlPacks"></div><p class="pearl-note" id="pearlNote"></p></section></div><div class="buy-confirm" id="buyConfirm"></div><div class="loadout-overlay" id="loadoutOverlay"><section class="loadout-menu"><header><div><span class="eyebrow">Sarf malzemeleri</span><h2 id="loadoutTitle">MALZEMELER</h2></div><button id="closeLoadout">×</button></header><p id="loadoutHint">Sarf malzemeleri alt sıraya yerleşir. Sürükleyip bırak ya da önce eşyaya, sonra yuvaya dokun. Kara Barut ve Kalkan yuvaya dokununca açılır/kapanır.</p><div class="loadout-items" id="loadoutItems"></div><div class="loadout-slots" id="loadoutSlots"></div></section></div>
    </section>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>('#sea')!;
// alpha:false → tuval opak; tarayıcı arka planla karıştırmaz (daha hızlı birleştirme)
const ctx = canvas.getContext('2d',{alpha:false})!;
const minimap = document.querySelector<HTMLCanvasElement>('#minimap')!;
const mini = minimap.getContext('2d')!;
// Mini harita da cihaz piksel oranında çizilir (çizim kodu 188×133 koordinatlarıyla çalışmaya devam eder)
{const k=Math.min(3,Math.max(1,devicePixelRatio||1));minimap.width=188*k;minimap.height=133*k;}
const playerShipImage=new Image();playerShipImage.src='/assets/starter-ship-v2.webp';
document.documentElement.style.setProperty('--starter-ship',`url("${playerShipImage.src}")`);
// Başlangıç gemisi "Yedi Deniz": 8 yönlü sayfa (4 × 2, 256 px; elitlerle aynı kare sırası)
const directionalShipImage=new Image();directionalShipImage.src='/assets/starter-ship-dir-v2.webp';
document.documentElement.style.setProperty('--pirate-icons','url("/assets/pirate-ui-icons-v1.webp")');
([['/assets/icon-world-v2.webp','worldMapIcon'],['/assets/icon-world-v2.webp','menuWorldIcon'],['/assets/icon-ship-nav-v2.webp','shipNavIcon']] as const).forEach(([src,id])=>{const img=document.getElementById(id) as HTMLImageElement|null;if(img)img.src=src;});
const cannonAssetSources:Record<CannonKind,string>={cast:'/assets/cannon-cast-v1.webp',long:'/assets/cannon-long-v1.webp',rapid:'/assets/cannon-rapid-v1.webp',heavy:'/assets/cannon-heavy-v1.webp'};
const rasterItemAssets:Partial<Record<QuickItemId,string>>={};
(Object.keys(SPECIAL_AMMO) as SpecialAmmo[]).forEach(k=>{rasterItemAssets[k]=SPECIAL_AMMO[k].icon;});rasterItemAssets.mine=ABILITIES.mine.icon;rasterItemAssets.shield=CONSUMABLES.shield.icon;rasterItemAssets.powder=CONSUMABLES.powder.icon;rasterItemAssets.speed=ABILITIES.speed.icon;rasterItemAssets.repairkit='/assets/icon-repair-v2.webp';
rasterItemAssets.iron='/assets/ammo-iron-v2.webp';rasterItemAssets.compass=COMPASS.icon;rasterItemAssets.chain='/assets/ammo-chain-v2.webp';
// Elit gemiler: tersane kartındaki tasarımın birebir aynısı, gemi başına temiz raster (384 px, pruva sol-aşağı).
// Gemi görselleri aynı dosya adıyla yenilendiğinde tarayıcı önbelleği eskisini göstermesin diye sürüm eki (görsel değişince artır)
const SHIP_ART_REV='9';
const eliteArtUrl=(id:string)=>`${eliteById(id).asset}?r=${SHIP_ART_REV}`;
const ui = (id:string) => document.getElementById(id)!;
const keys = new Set<string>();
const QUEST_STORAGE='yedi-deniz-quests-v2';
const ACCOUNT_STORAGE='yedi-deniz-account-v1';
let storedQuests:SavedQuests|null=null;
let storedAccount:{pearls?:number;gold:number;wood?:number;fame:number;level:number;maxHp:number;hp:number;chainAmmo:number;elitePoints?:number;eliteEconomyVersion?:number;battlePoints?:number;cannonType?:CannonKind;cannonInventory?:CannonStock;mountedCannons?:CannonStock;equipOwned?:Record<string,number>;equipped?:Partial<Record<EquipSlot,string|null>>;quickSlots?:Array<QuickItemId|null>;upgrades:Record<UpgradeKind,number>;eliteShip?:EliteShipId;activeShip?:ShipSelection;elitePurchased?:boolean;currentMap?:MapKey}|null=null;
try{storedQuests=migrateQuestRules(JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null'));if(storedQuests)localStorage.setItem(QUEST_STORAGE,JSON.stringify(storedQuests));}catch{storedQuests=null;}
try{storedAccount=JSON.parse(localStorage.getItem(ACCOUNT_STORAGE)||'null');if(storedAccount){storedAccount.elitePoints=migrateElitePoints(storedAccount.elitePoints??0,storedAccount.eliteEconomyVersion);storedAccount.eliteEconomyVersion=ELITE_ECONOMY_VERSION;}}catch{storedAccount=null;}
const storedActive=storedQuests?.active&&QUESTS.some(q=>q.id===storedQuests!.active)?storedQuests.active:null;
const BASE_HP=75000,HP_PER_LEVEL=2500,HP_PER_HULL=2500,BASE_CANNONS=100;
const upgrades:Record<UpgradeKind,number>={hull:storedAccount?.upgrades?.hull||0,damage:storedAccount?.upgrades?.damage||0,range:storedAccount?.upgrades?.range||0,reload:storedAccount?.upgrades?.reload||0,speed:storedAccount?.upgrades?.speed||0,repair:storedAccount?.upgrades?.repair||0};
// Test aşamasında tüm inci geliştirmeleri en üst seviyededir
if(ELITE_TEST_MODE)for(const k of Object.keys(upgrades) as UpgradeKind[])upgrades[k]=10;
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
// VİP: %10 fazla tecrübe; hareket halinde tamir
let vipUntil=loadVipUntil();const isVip=()=>vipActive(vipUntil);
// Kaptan & Muço: ustası aynı denizdeyken muço daha çok TP kazanır. Diğer oyuncular sunucu gelince görünür; o zamana dek yakında usta yok.
let mentorship=loadMentorship();
const mentorNearby=()=>false;
const xpGain=(n:number)=>Math.round(n*(1+achBonus().xp)*xpMult()*(isVip()?1+VIP_XP_BONUS:1)*(mentorship.mentor&&mentorNearby()?1+TOGETHER_XP_BONUS:1)),goldGainAch=(n:number)=>Math.round(n*(1+achBonus().gold)*goldMult());
const state = { pearls:storedAccount?.pearls??30, gold:storedAccount?.gold??40, fame:storedAccount?.fame??0, level:ELITE_TEST_MODE?MAX_LEVEL:Math.min(MAX_LEVEL,storedAccount?.level??1), hp:storedAccount?.hp??Infinity, maxHp:storedAccount?.maxHp??100, elitePoints:storedAccount?.elitePoints??0,battlePoints:storedAccount?.battlePoints??0,cannon:18, cannonType:storedAccount?.cannonType&&CANNONS[storedAccount.cannonType]?storedAccount.cannonType:'cast' as CannonKind, activeQuest:storedActive as string|null, ammo:'iron' as AmmoKind, chainAmmo:storedAccount?.chainAmmo??2000, attacking:false, repairing:false, invulnerable:0 };
let levelQuest=loadLevelQuest(state.level),levelQuestNoticed=false;
// Seviye görevi açık mı: TP dolmuş ama görev bitmemiş
const levelQuestOpen=()=>state.fame>=xpNeed(state.level)&&!levelQuestDone(levelQuest);
function levelQuestHit(kind:'npc'|'monster',id:string,tier:number){
  if(!levelQuestKill(levelQuest,kind,id,tier,state.fame>=xpNeed(state.level)))return;saveLevelQuest(levelQuest);
  const g=levelQuestGoal(levelQuest.level);
  if(levelQuestDone(levelQuest))rewardNotice(`Seviye görevi tamamlandı · Seviye ${levelQuest.level+1} açılıyor`,'gain');
  else toast(`Seviye görevi · ${levelQuest.ships}/${g.ships} ağır gemi · ${levelQuest.monsters}/${g.monsters} canavar`);
}
function levelQuestHtml(){
  if(!needsLevelQuest(state.level)||!Number.isFinite(xpNeed(state.level)))return'';
  const g=levelQuestGoal(state.level),open=levelQuestOpen(),L=state.level;
  return`<article class="quest-entry level-quest ${open?'active':''}"><div class="quest-number">★</div><div class="quest-copy"><span>SEVİYE GÖREVİ · ${L} → ${L+1}</span><h3>${open?'Seviye görevi hazır':'TP dolunca açılır'}</h3><p>${L}/1 veya ${L}/2 denizinde ${g.ships} ağır gemi batır ve ${g.monsters} canavar yen. Görev bitene kadar kazandığın TP birikir.</p><b>${levelQuest.ships}/${g.ships} Ağır gemi · ${levelQuest.monsters}/${g.monsters} Canavar</b></div></article>`;
}
// Eski ölçekli kayıtlar (100 canlı, 18 toplu gemi) bir kez Seafight ölçeğine taşınır: can formülden hesaplanır,
// gemiye en az 50 döküm top yerleştirilir.
if(storedAccount&&storedAccount.maxHp<5000){const total=(Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);if(total<50)mountedCannons.cast+=50-total;state.hp=Infinity;}
state.maxHp=BASE_HP+(state.level-1)*HP_PER_LEVEL+upgrades.hull*HP_PER_HULL;
state.cannon=(Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);
let elitePurchased=storedAccount?.elitePurchased===true;
let activeEliteShip:EliteShipId=storedAccount?.eliteShip&&ELITE_SHIPS.some(s=>s.id===storedAccount!.eliteShip)?storedAccount.eliteShip:'phantom';
// Test modunda elit satın alınmış sayılmaz; seçilen elit gemi yine de yeniden yüklemede korunur
let activeShip:ShipSelection=(elitePurchased||ELITE_TEST_MODE)&&storedAccount?.activeShip&&ELITE_SHIPS.some(s=>s.id===storedAccount!.activeShip)?storedAccount.activeShip:'starter';
let designOwned=ELITE_TEST_MODE||loadDesignOwned();
let activeSpecialDesign=designOwned?loadSpecialDesign():null;
let previewShip:ShipSelection|SpecialDesignId=activeSpecialDesign??activeShip;
// Özel tasarım yalnızca görünümü değiştirir; seçili geminin gücü ve donanımı korunur.
const quickSlots:Array<QuickItemId|null>=Array(12).fill(null);
{const stored=(storedAccount?.quickSlots??['iron','chain','fire','breaker','speed','powder','shield','mine']).filter((id):id is QuickItemId=>!!id&&id!=='repairkit'&&id in QUICK_ITEMS);
  const place=(id:QuickItemId)=>{if(quickSlots.includes(id))return;const row=QUICK_ITEMS[id].category==='ammo'?0:AMMO_ROW;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=id;return;}};
  stored.forEach(place);place('compass');(['iron','chain','fire','breaker','speed','powder','shield','mine'] as QuickItemId[]).forEach(id=>{if(!storedAccount?.quickSlots)place(id);});}
const arsenal=loadArsenal();
// Eski kayıtlarda gülle stoğu salvo sayısıydı; artık her top 1 gülle harcar. Stoklar bir kez 50 topluk salvoya göre çevrilir.
if(!arsenal.ballsV1){for(const k of ['fire','explosive','breaker','leech'] as const)arsenal[k]*=50;state.chainAmmo*=50;arsenal.ballsV1=true;saveArsenal(arsenal);}
// Kara Barut eski kayıtlarda da sarf sırasına bir kez yerleşir
if(!quickSlots.includes('powder')){const free=quickSlots.findIndex((v,k)=>k>=AMMO_ROW&&!v);if(free>=0)quickSlots[free]='powder';}
// Açık/kapalı sarf malzemeleri
const consumableOn:Record<ConsumableId,boolean>={powder:false,shield:false};
const crew=loadCrew();
// Test aşaması (ELITE_TEST_MODE): her açılışta bol stok ve tam gelişmiş gemi. Değerler yalnızca alt sınırdır;
// harcadıkça azalır, sayfa yenilenince yeniden dolar.
if(ELITE_TEST_MODE){const M=5_000_000;
  for(const k of ['fire','explosive','breaker','leech','powder','shield','speed','mine','compass'] as const)arsenal[k]=Math.max(arsenal[k],M);saveArsenal(arsenal);
  state.chainAmmo=Math.max(state.chainAmmo,M);state.gold=Math.max(state.gold,M);state.pearls=Math.max(state.pearls,M);
  state.fame=Math.max(state.fame,100_000_000);state.battlePoints=Math.max(state.battlePoints,BATTLE_RANKS[BATTLE_RANKS.length-1].sp);state.elitePoints=Math.max(state.elitePoints,200_000_000);
  for(const id of Object.keys(TALENTS) as TalentId[])crew.talents[id]=TALENTS[id].max;
  for(const id of Object.keys(OFFICERS) as OfficerId[])crew.officers[id]=OFFICER_MAX_RANK;
  crew.active=(Object.keys(OFFICERS) as OfficerId[]).filter(id=>crew.active.includes(id)).concat((Object.keys(OFFICERS) as OfficerId[]).filter(id=>!crew.active.includes(id))).slice(0,officerSlots(state.level));saveCrew(crew);}
let bonus=computeBonus(crew);
// Test aşamasında gemi her zaman yuvası kadar ağır topla dolu; top satın almak gerekmez
function fillTestCannons(){if(!ELITE_TEST_MODE)return;for(const k of Object.keys(mountedCannons) as CannonKind[]){cannonInventory[k]+=k==='heavy'?Math.max(0,mountedCannons[k]-cannonCapacity()):mountedCannons[k];mountedCannons[k]=0;}mountedCannons.heavy=cannonCapacity();cannonInventory.heavy=Math.max(cannonInventory.heavy,5000);state.cannonType='heavy';state.cannon=mountedCannonCount();}
if(!arsenal.seeded){for(const item of ['fire','breaker','shield','mine'] as QuickItemId[]){const row=QUICK_ITEMS[item].category==='ammo'?0:AMMO_ROW;if(quickSlots.includes(item))continue;for(let i=row;i<row+AMMO_ROW;i++)if(!quickSlots[i]){quickSlots[i]=item;break;}}arsenal.seeded=true;saveArsenal(arsenal);}
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
// Serbest bakış: oyuncu haritayı sürükleyince ya da mini haritada gezinince kamera bu noktaya bakar
let freeLook:Vec|null=null;
function lookAt(x:number,y:number,snap=false){freeLook={x:clamp(x,0,WORLD_WIDTH),y:clamp(y,0,WORLD_HEIGHT)};if(snap){camera.x=freeLook.x;camera.y=freeLook.y;}}
const shots:Shot[]=[]; const enemies:Enemy[]=[];
const salvoQueue:SalvoRound[]=[];
const particles:Particle[]=[];
const WORLD_STORAGE='yedi-deniz-world-v2';
let currentMap:MapKey=(()=>{try{const k=(storedAccount?.currentMap||localStorage.getItem(WORLD_STORAGE)) as MapKey|null;if(k&&k in MAPS&&tierOf(k)<=state.level)return k;}catch{}return'1/1';})();
// Büyük Kuşatma sürerken (siege dolu) deniz Kara Kale'ye dönüşür; currentMap oyuncunun geldiği deniz olarak kalır.
let siege:SiegeSave|null=null,siegeOrigin:{map:MapKey;x:number;y:number}|null=null;
const SIEGE_MAP:MapDef={...MAPS['7/1'],name:'Kara Kale',description:'Büyük Kuşatma: bütün kaptanlar birlikte Kara Kale\'ye saldırır.',safe:false,npcs:[],monster:'',monsters:[],npcCount:0,heavyShare:0,islands:[],labels:[],fleet:{x:3000,y:1800,name:'Kara Kale'},spawn:{x:3000,y:2850}};
// Kuşatma gemileri normal haritanın boş NPC listesinden bağımsızdır.
const SIEGE_COMMANDER:BossDef={...bossFor('8/2'),name:'Kara Kale Komutanı'};
const SIEGE_GUARD:NpcDef={...NPCS['n8-2-heavy'],name:'Kara Kale Muhafızı'};
const mapDef=()=>siege?SIEGE_MAP:MAPS[currentMap];
const isAlly=(o:Target|Vec)=>!!siege&&(o as Enemy).kind==='ship'&&!!(o as Enemy).captain;
const theme=()=>THEMES[mapDef().tier];
const hasFleetIsland=()=>mapDef().tier>=2;
const monsters:Monster[]=[];
function createMonsters(){monsters.length=0;const map=mapDef();for(const id of map.monsters){const def=MONSTERS[id];if(!def.sprite)continue;const count=map.safe?1:2;for(let k=0;k<count;k++){const p=randomSeaPoint(700);monsters.push({kind:'monster',def,x:p.x,y:p.y,phase:Math.random()*6,radius:def.radius,name:def.name,hp:def.hp,maxHp:def.hp,cooldown:0,aggro:false,slowTimer:0,homeX:p.x,homeY:p.y,combatTimer:0});}}}
const lootChests:LootChest[]=[];
const SPARKLE_COUNT=12,SPARKLE_PICKUP=40,SPARKLE_RESPAWN=4;
const sparkles:{x:number;y:number;seed:number;born:number}[]=[];
const sparkleQueue:number[]=[];
const abilityTimers:Record<AbilityId,{active:number;cooldown:number}>={speed:{active:0,cooldown:0},mine:{active:0,cooldown:0}};
const mines:{x:number;y:number;life:number;arm:number}[]=[];
const abilityActive=(id:AbilityId)=>abilityTimers[id].active>0;
let glintClock=0;
// Korsan Öfkesi (src/rage.ts): bütün gemilerin ortak etkin yeteneği
const rage=newRage();let rageEmber=0,playerHitClock=99;
const abilityQueue:{t:number;fn:()=>void}[]=[];
const eliteEnabled=()=>activeShip!=='starter';
const eliteShip=()=>eliteById(activeEliteShip);
const earnedEliteLevel=()=>ELITE_TEST_MODE?15:elitePurchased?eliteLevelFromEp(state.elitePoints):0;
const eliteBonus=()=>cumulativeEliteBonus(earnedEliteLevel());
// Elit ilerlemesi tasarımdan bağımsızdır; kaptan ve gövde seviyesi +2.500 can verir.
const baseMaxHp=()=>BASE_HP+(state.level-1)*HP_PER_LEVEL+upgrades.hull*HP_PER_HULL;
// Oyuncu–oyuncu savaşında bu geminin hasar bütçesi (en az 30 sn'de batırılabilir)
const playerPvp:PvpBudget={pool:Infinity,t:0};
const effectiveMaxHp=()=>Math.round(state.maxHp*(1+equipBonus().hp+achBonus().hp+eliteBonus().hp));
if(!Number.isFinite(state.hp)||state.hp>effectiveMaxHp())state.hp=effectiveMaxHp();
let driftClock=0;
let collisionNotice=0;
const islands:WorldIsland[]=[];
let jumpPrompt:{dir:Dir;to:MapKey}|null=null;
const fleetOwners=loadFleetOwners();
const fleetOwner=(key?:MapKey)=>!key&&siege?'npc':fleetOwners[key??currentMap]??'npc';
const ownTowers:{x:number;y:number;cooldown:number;slot:number;type:TowerType}[]=[];
let guild:Guild|null=loadGuild();
let buildType:TowerType='cannon';
let focusedFoundation:string|null=null;
const profile=loadProfile();
const chat=setupChat(()=>({nick:profile.nick,tag:guild?.tag??null}));
function escapeHtml(t:string){return t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
// HUD 10 Hz güncellenir; DOM yalnız içerik değişince yazılır (her karede yeniden kurmak donmaya yol açıyordu)
const towerRuins=loadRuins();
let eventPanelClock=0,towersDestroyedHere=0,uiClock=0,eventPanelHtml='',combatTargetsHtml='',combatTargetsTop='';
let mapFade=0;

// Retina ekranlarda çizim yoğunluğu 1,5× ile sınırlı: piksel yükü 2×'e göre %44 daha az, görüntü yine keskin
// Çözünürlük: cihaz piksel oranı (telefonlarda 2–3) en çok 2,5'e kadar kullanılır, toplam piksel ~2,4 milyonla sınırlanır;
// küçük ekranlı telefonlarda keskin, büyük masaüstü ekranlarda yine hızlı kalır.
// Uyarlanır çözünürlük: oyun akıcı değilse (FPS < 45) tavan 2,5 → 2 → 1,5'e iner; telefon güçlüyse keskin kalır.
let dprCap=2.5,fpsFrames=0,fpsClock=0,slowChecks=0;
function watchFps(dt:number){fpsFrames++;fpsClock+=dt;if(fpsClock<2)return;const fps=fpsFrames/fpsClock;fpsFrames=0;fpsClock=0;
  if(fps<45&&dprCap>1.5&&Math.min(devicePixelRatio,dprCap)>1.5){if(++slowChecks>=2){dprCap=Math.max(1.5,dprCap-.5);slowChecks=0;resize();}}else slowChecks=0;}
function resize(){ const d=Math.max(1,Math.min(devicePixelRatio,dprCap,Math.sqrt(2_400_000/(innerWidth*innerHeight)))); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize',resize); resize();
const settings=loadSettings();setAudio(settings.sound,settings.volume,settings.music);
let rebinding:ActionId|null=null;
const held=(action:ActionId,...extra:string[])=>keys.has(settings.binds[action])||extra.some(k=>keys.has(k));
function closeAllOverlays(){ui('menuOverlay').classList.remove('open');closeMentorship();closePearlShop();closeWorldMap();closeQuestLog();closeEliteShips();closeShipMenu();closeMarket();closeCaptainProfile();closeDevelopment();closeCrew();closeGuild();closeSettings();closeLoadout();}
function runAction(action:ActionId){
  if(action==='attack')toggleAttack();else if(action==='rage')activateRage();else if(action==='repair')toggleRepair();else if(action==='recenter')recenterShip();
  else if(action==='jump')useJump();else if(action==='speed')activateAbility('speed');else if(action==='shield')toggleConsumable('shield');else if(action==='mine')dropMine();else if(action==='compass')useCompass();
  else if(action==='map'){ui('worldMapOverlay').classList.contains('open')?closeWorldMap():openWorldMap();}
  else if(action==='zoomIn')setZoom(camera.targetZoom+.1);else if(action==='zoomOut')setZoom(camera.targetZoom-.1);
  else if(action.startsWith('ammo'))useQuickSlot(Number(action.slice(4))-1);else if(action.startsWith('item'))useQuickSlot(AMMO_ROW+Number(action.slice(4))-1);
}
addEventListener('keydown',e=>{
  unlockAudio();const key=normalizeKey(e);
  if(rebinding){e.preventDefault();if(key!=='escape'){for(const a of ACTIONS)if(settings.binds[a.id]===key)settings.binds[a.id]='';settings.binds[rebinding]=key;saveSettings(settings);renderQuickSlots();refreshBindHints();}rebinding=null;renderSettings();return;}
  if(e.target instanceof HTMLInputElement)return;
  if(key==='enter'&&!Object.values(settings.binds).includes('enter')){e.preventDefault();chat.open();(document.getElementById('chatInput') as HTMLInputElement|null)?.focus();return;}
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
function worldClick(e:{clientX:number;clientY:number}){
  const world={x:(e.clientX-innerWidth/2)/camera.zoom+camera.x,y:(e.clientY-innerHeight/2)/camera.zoom+camera.y};
  if(hasFleetIsland()&&fleetOwner()==='player'&&guild){
    const f=mapDef().fleet,slots=islandSlots(guild,currentMap);
    const slot=FLEET.towers.map(([dx,dy],i)=>({x:f.x+dx,y:f.y+dy,i})).sort((a,b)=>b.y-a.y).find(t=>towerContains(world,t,!!slots[t.i]))?.i;
    if(slot!==undefined){focusedFoundation=`${currentMap}:${slot}`;openGuild();document.querySelector(`[data-foundation="${focusedFoundation}"]`)?.scrollIntoView({block:'center'});toast(slots[slot]?`${TOWER_TYPES[slots[slot]!.type].name} · Kaide ${slot+1}`:`Kaide ${slot+1}: kule tipini seçip DİK düğmesine bas`);return;}
  }
  const towerHit=enemies.filter(n=>n.tower&&towerContains(world,n)).sort((a,b)=>b.y-a.y)[0];
  const hit=towerHit??[...enemies,...monsters].filter(n=>!isAlly(n)&&dist(n,world)<Math.max(42,n.kind==='monster'?n.radius:(n.hitRadius??0))).sort((a,b)=>dist(a,world)-dist(b,world))[0];
  if(hit){if(hit!==selected){selected=hit;state.attacking=false;attackChase=false;ui('attack').classList.remove('active');}else if(!state.attacking)toggleAttack();}
  else{const glint=sparkles.find(g=>dist(g,world)<34);if(glint){routeTarget={x:glint.x,y:glint.y};destination=routeVia(routeTarget);attackChase=false;return;}const chest=lootChests.find(c=>dist(c,world)<CHEST_CLICK_RADIUS);routeTarget=chest?{x:chest.x,y:chest.y}:navigablePoint(world);destination=routeVia(routeTarget);attackChase=false;}
}
// Harita gezinme: sol tuşa basılı tutup sürükleyince kamera gemiden ayrılır (✥ ile geri döner);
// sürüklemeden bırakılan tık, hedef seçimi/rota olarak işlenir.
// Dokunmatik ekranda iki parmakla sıkıştırınca yakınlaştırma/uzaklaştırma; ikinci parmak değince dokunuş tık sayılmaz.
{let press:{x:number;y:number;cx:number;cy:number;id:number}|null=null,panning=false,pinch:{d:number;z:number}|null=null;
  const touches=new Map<number,{x:number;y:number}>();
  const spread=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1;};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;
    if(e.pointerType==='touch'){touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){press=null;panning=false;canvas.classList.remove('panning');pinch={d:spread(),z:camera.targetZoom};return;}if(touches.size>2)return;}
    press={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,id:e.pointerId};panning=false;});
  canvas.addEventListener('pointermove',e=>{const t=touches.get(e.pointerId);if(t){t.x=e.clientX;t.y=e.clientY;if(pinch&&touches.size>=2){setZoom(pinch.z*spread()/pinch.d);return;}}
    if(!press||e.pointerId!==press.id)return;const dx=e.clientX-press.x,dy=e.clientY-press.y;
    if(!panning&&Math.hypot(dx,dy)>(e.pointerType==='touch'?14:8)){panning=true;try{canvas.setPointerCapture(e.pointerId);}catch{}canvas.classList.add('panning');}
    if(panning)lookAt(press.cx-dx/camera.zoom,press.cy-dy/camera.zoom,true);});
  const end=(e:PointerEvent)=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(!press||e.pointerId!==press.id)return;const was=panning;press=null;panning=false;canvas.classList.remove('panning');if(!was&&e.type==='pointerup')worldClick(e);};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);}

// Mini harita: tıklayıp sürükleyerek haritada gezinme (görüş penceresi o noktaya taşınır)
{let down=false;const at=(e:PointerEvent)=>{const r=minimap.getBoundingClientRect();lookAt((e.clientX-r.left)/r.width*WORLD_WIDTH,(e.clientY-r.top)/r.height*WORLD_HEIGHT,true);};
  minimap.addEventListener('pointerdown',e=>{down=true;try{minimap.setPointerCapture(e.pointerId);}catch{}at(e);});
  minimap.addEventListener('pointermove',e=>{if(down)at(e);});
  const up=()=>{down=false;};minimap.addEventListener('pointerup',up);minimap.addEventListener('pointercancel',up);}
ui('attack').onclick=toggleAttack;
ui('repair').onclick=toggleRepair;
// Küçük ekranlar (telefon, tablet): arayüz en az 1180 × 640'lık sanal bir alana göre dizilip orantılı küçültülür.
// Böylece telefonda da masaüstündeki yerleşim korunur; ölçek --ui değişkeniyle CSS'e verilir (bkz. .hud, .chat).
let uiScale=1;
// Dokunmatik ekranlarda (telefon) sanal alan 880 × 480: yazılar ve düğmeler parmakla okunup basılabilecek boyda kalır.
const TOUCH=matchMedia('(pointer:coarse)').matches;
function fitHud(){const [vw,vh]=TOUCH?[880,480]:[1180,640];uiScale=Math.max(.5,Math.min(1,innerWidth/vw,innerHeight/vh));document.documentElement.style.setProperty('--ui',String(uiScale));document.documentElement.classList.toggle('touch',TOUCH);}
fitHud();
// Günün etkinliği: üst ortada, gece yarısına kalan süreyle
const dayEventEl=document.createElement('div');dayEventEl.className='day-event';document.querySelector('.hud')!.append(dayEventEl);
let dayEventText='';
// Cuma: kuşatma açılınca "KATIL" düğmesi; test modunda her gün denemek için ayrıca açık
function renderDayEvent(force=false){const ev=dayEvent(),w=siegeWindow(),join=w.open||ELITE_TEST_MODE;
  const time=ev?.id==='siege'?(w.open?`bitimine ${Math.max(1,Math.ceil((w.end-Date.now())/60000))} dk`:w.upcoming?`20:00'de başlıyor`:'sona erdi'):untilMidnight();
  const t=(ev?`<b>${ev.day.toLocaleUpperCase('tr')} · ${ev.name.toLocaleUpperCase('tr')}</b><span>${ev.desc}</span><em>${time}</em>`:'')+(join?`<button data-siege-join>${w.open?'KUŞATMAYA KATIL':'TEST · KUŞATMA'}</button>`:'');
  if(t===dayEventText&&!force)return;dayEventText=t;dayEventEl.innerHTML=t;dayEventEl.classList.toggle('on',!!t);
  const b=dayEventEl.querySelector('[data-siege-join]') as HTMLButtonElement|null;if(b)b.onclick=enterSiege;}
setInterval(renderDayEvent,15000);
{const hint=document.createElement('div');hint.className='rotate-hint';hint.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="18.5" r=".9" fill="currentColor"/></svg>Telefonunu yatay çevir<small>Pirate Rage yatay ekranda oynanır</small>`;document.body.append(hint);}
// HUD çerçeveleri: alt bar (CP/SP), gülle çerçevesi ve malzeme çerçevesi. Her biri kendi tutamağından tek başına taşınır.
// Bir çerçeve başka bir çerçevenin kenarına yaklaştırılıp bırakılınca ona yapışır ve grup olur; alt bar tutulup taşınınca
// ona bağlı tüm çerçeveler birlikte gelir. Gülle/malzeme çerçevesi tek tutulunca gruptan ayrılır (ona bağlı olanlar yerinde
// kalır ve bir üstteki çerçeveye bağlanır). Ekranın sol/sağ kenarına bırakılan çerçeve dikey sütuna dönüşür.
// Konumlar, yönler, açık/kapalı durumu ve bağlar saklanır; tutamağa çift tık o çerçeveyi varsayılan yerine döndürür.
{type FrameId='dock'|'ammo'|'item';
  const EL:Record<FrameId,HTMLElement>={dock:document.querySelector('.hud-dock') as HTMLElement,ammo:ui('ammoBar'),item:ui('itemBar')};
  // gülle/malzeme çerçevesi tutamaktan ya da yuvalar dışındaki kenarından tutulur
  const GRIP:Record<FrameId,HTMLElement>={dock:EL.dock.querySelector('.dock-status') as HTMLElement,ammo:EL.ammo,item:EL.item};
  const IDS:FrameId[]=['dock','ammo','item'],DEFAULT_LINK:Record<FrameId,FrameId|null>={dock:null,ammo:'dock',item:'ammo'};
  const POS=(id:FrameId)=>id==='dock'?'yedi-deniz-dock-pos':`yedi-deniz-bar-${id}`,LINKS='yedi-deniz-frame-links',EDGE=90,SNAP=26,GAP=2;
  let link:Record<FrameId,FrameId|null>={...DEFAULT_LINK};
  try{const l=JSON.parse(localStorage.getItem(LINKS)||'null');if(l)link={dock:null,ammo:l.ammo??null,item:l.item??null};}catch{}
  const rect=(id:FrameId)=>EL[id].getBoundingClientRect();
  // x,y ekran pikseli; çerçevenin kendi konumu ölçeklenmiş arayüz pikselinde saklanır (uiScale)
  const place=(id:FrameId,x:number,y:number)=>{const e=EL[id],w=e.offsetWidth,h=e.offsetHeight,k=uiScale;e.classList.add('moved');e.style.left=`${clamp(x/k,0,Math.max(0,innerWidth/k-w))}px`;e.style.top=`${clamp(y/k,0,Math.max(0,innerHeight/k-h))}px`;};
  const kids=(id:FrameId)=>IDS.filter(k=>link[k]===id);
  const tree=(id:FrameId):FrameId[]=>kids(id).flatMap(k=>[k,...tree(k)]);
  const save=()=>{try{for(const id of IDS){const e=EL[id];localStorage.setItem(POS(id),JSON.stringify({x:e.classList.contains('moved')?parseFloat(e.style.left):null,y:parseFloat(e.style.top),v:e.classList.contains('vertical'),c:e.classList.contains('collapsed')}));}localStorage.setItem(LINKS,JSON.stringify(link));}catch{}};
  // kenara bırakılan çerçeve dikey, ortaya bırakılan yatay olur (yalnız gülle/malzeme)
  const orient=(id:FrameId)=>{if(id==='dock')return;const e=EL[id],r=rect(id),v=r.left<EDGE||r.right>innerWidth-EDGE;if(v===e.classList.contains('vertical'))return;const cx=r.left+r.width/2,cy=r.top+r.height/2;e.classList.toggle('vertical',v);
    const n=rect(id);place(id,r.left<EDGE?r.left:r.right>innerWidth-EDGE?r.right-n.width:cx-n.width/2,cy-n.height/2);};
  // en yakın kenara yapış: alt/üst kenara (ortalanarak) ya da sol/sağ kenara (üstleri hizalı)
  const snap=(id:FrameId)=>{const r=rect(id);let best:{d:number;to:FrameId;x:number;y:number}|null=null;
    for(const t of IDS){if(t===id)continue;const q=rect(t),hOver=Math.min(r.right,q.right)-Math.max(r.left,q.left),vOver=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top),cx=q.left+q.width/2-r.width/2;
      const opts:[number,number,number,boolean][]=[[Math.abs(r.top-q.bottom),cx,q.bottom+GAP,hOver>-SNAP],[Math.abs(r.bottom-q.top),cx,q.top-r.height-GAP,hOver>-SNAP],[Math.abs(r.left-q.right),q.right+GAP,q.top,vOver>-SNAP],[Math.abs(r.right-q.left),q.left-r.width-GAP,q.top,vOver>-SNAP]];
      for(const [d,x,y,ok] of opts)if(ok&&d<SNAP&&(!best||d<best.d))best={d,to:t,x,y};}
    if(best){place(id,best.x,best.y);link[id]=best.to;}};
  for(const id of IDS){try{const p=JSON.parse(localStorage.getItem(POS(id))||'null');if(p){if(id!=='dock'){EL[id].classList.toggle('vertical',!!p.v);EL[id].classList.toggle('collapsed',!!p.c);}if(p.x!=null&&Number.isFinite(p.x))requestAnimationFrame(()=>place(id,p.x*uiScale,p.y*uiScale));}}catch{}}
  for(const id of ['ammo','item'] as FrameId[])(EL[id].querySelector('.bar-toggle') as HTMLElement).onclick=()=>{EL[id].classList.toggle('collapsed');closeAmmoPicker();save();};
  let drag:{id:FrameId;dx:number;dy:number;group:{id:FrameId;ox:number;oy:number}[]}|null=null;
  for(const id of IDS){const grip=GRIP[id];
    // dokunmatikte parmak çoğu zaman yuvaya denk gelir: yuva/düğme üstünde 0,35 sn basılı tutunca da sürükleme başlar
    let hold=0,holdAt:{x:number;y:number}|null=null,eatClick=false;
    grip.addEventListener('pointerdown',e=>{if((e.target as HTMLElement).closest('button')){if(e.pointerType!=='touch')return;holdAt={x:e.clientX,y:e.clientY};clearTimeout(hold);
        hold=window.setTimeout(()=>{if(!holdAt)return;eatClick=true;startDrag(e);navigator.vibrate?.(15);},350);return;}
      startDrag(e);});
    grip.addEventListener('pointermove',e=>{if(holdAt&&Math.hypot(e.clientX-holdAt.x,e.clientY-holdAt.y)>10){holdAt=null;clearTimeout(hold);}});
    for(const t of ['pointerup','pointercancel'])grip.addEventListener(t,()=>{holdAt=null;clearTimeout(hold);});
    grip.addEventListener('click',e=>{if(eatClick){eatClick=false;e.stopPropagation();e.preventDefault();}},true);
    const startDrag=(e:PointerEvent)=>{const r=rect(id);closeAmmoPicker();
      // tek tutulan gülle/malzeme çerçevesi gruptan ayrılır; ona bağlı olanlar bir üstteki çerçeveye geçer
      if(id!=='dock'){for(const k of kids(id))link[k]=link[id];link[id]=null;}
      const group=id==='dock'?tree('dock').map(k=>{const q=rect(k);return{id:k,ox:q.left-r.left,oy:q.top-r.top};}):[];
      for(const g of group)place(g.id,r.left+g.ox,r.top+g.oy);
      drag={id,dx:e.clientX-r.left,dy:e.clientY-r.top,group};try{grip.setPointerCapture(e.pointerId);}catch{}EL[id].classList.add('dragging');grip.classList.add('dragging');};
    // grup taşınırken tüm grubun kutusu ekranda kalacak şekilde sınırlanır (çerçeveler üst üste binmez)
    grip.addEventListener('pointermove',e=>{if(!drag||drag.id!==id)return;const k=uiScale,w=EL[id].offsetWidth*k,h=EL[id].offsetHeight*k;let x0=0,y0=0,x1=w,y1=h;
      for(const g of drag.group){x0=Math.min(x0,g.ox);y0=Math.min(y0,g.oy);x1=Math.max(x1,g.ox+EL[g.id].offsetWidth*k);y1=Math.max(y1,g.oy+EL[g.id].offsetHeight*k);}
      const x=clamp(e.clientX-drag.dx,-x0,Math.max(-x0,innerWidth-x1)),y=clamp(e.clientY-drag.dy,-y0,Math.max(-y0,innerHeight-y1));
      place(id,x,y);for(const g of drag.group)place(g.id,x+g.ox,y+g.oy);});
    const stop=()=>{if(!drag||drag.id!==id)return;drag=null;EL[id].classList.remove('dragging');grip.classList.remove('dragging');if(id!=='dock'){orient(id);snap(id);}save();};
    grip.addEventListener('pointerup',stop);grip.addEventListener('pointercancel',stop);
    grip.addEventListener('dblclick',e=>{if((e.target as HTMLElement).closest('button'))return;const el=EL[id];el.classList.remove('moved','vertical');el.style.left='';el.style.top='';link[id]=DEFAULT_LINK[id];
      if(id==='dock')for(const k of tree('dock')){EL[k].classList.remove('moved','vertical');EL[k].style.left='';EL[k].style.top='';}save();});}
  addEventListener('resize',()=>{fitHud();for(const id of IDS)if(EL[id].classList.contains('moved'))place(id,parseFloat(EL[id].style.left)*uiScale,parseFloat(EL[id].style.top)*uiScale);});}
ui('ability-speed').onclick=()=>activateAbility('speed');ui('ability-mine').onclick=dropMine;ui('rageButton').onclick=activateRage;
function recenterShip(){freeLook=null;camera.x=player.x;camera.y=player.y;toast('Kamera gemiye ortalandı');}
ui('recenterShip').onclick=recenterShip;{const top=ui('topStatus');const hp=document.querySelector('.hud-dock .hp-line'),sp=document.querySelector('.hud-dock .battle-line');if(hp)top.appendChild(hp);if(sp)top.appendChild(sp);top.classList.add('four-bars');}{const rc=ui('recenterShip');rc.className='combat-action recenter-btn';rc.innerHTML='<b><svg viewBox="0 0 48 48" width="70%" height="70%" aria-hidden="true"><g fill="none" stroke="#ffe09b" stroke-width="3" stroke-linecap="round"><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4" fill="#ffe09b"/><path d="M24 4v40M4 24h40M9.9 9.9l28.2 28.2M38.1 9.9 9.9 38.1"/></g><g fill="#ffe09b"><circle cx="24" cy="4" r="2.6"/><circle cx="24" cy="44" r="2.6"/><circle cx="4" cy="24" r="2.6"/><circle cx="44" cy="24" r="2.6"/><circle cx="9.9" cy="9.9" r="2.6"/><circle cx="38.1" cy="38.1" r="2.6"/><circle cx="38.1" cy="9.9" r="2.6"/><circle cx="9.9" cy="38.1" r="2.6"/></g></svg></b><span>GEMİ</span>';rc.title='Gemiyi ortala';ui('combatControls').appendChild(rc);}
ui('openWorldMap').onclick=openWorldMap;ui('closeWorldMap').onclick=closeWorldMap;
ui('worldMapOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('worldMapOverlay'))closeWorldMap();});
ui('openCaptain').onclick=openCaptainProfile;
ui('closeCaptain').onclick=closeCaptainProfile;
ui('openGuild').onclick=openGuild;ui('closeGuild').onclick=closeGuild;ui('guildOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('guildOverlay'))closeGuild();});
ui('openCrew').onclick=openCrew;ui('closeCrew').onclick=closeCrew;ui('crewOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('crewOverlay'))closeCrew();});
ui('openLog').onclick=openLogbook;ui('closeLog').onclick=closeLogbook;ui('logOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('logOverlay'))closeLogbook();});
ui('openRanks').onclick=openRanks;ui('closeRanks').onclick=closeRanks;ui('rankOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('rankOverlay'))closeRanks();});
ui('openCoupon').onclick=openCoupon;ui('closeCoupon').onclick=closeCoupon;ui('couponOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('couponOverlay'))closeCoupon();});
ui('couponRedeem').onclick=redeemCoupon;ui('couponInput').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')redeemCoupon();});
ui('openSettings').onclick=openSettings;ui('openMentorship').onclick=openMentorship;ui('closeMentorship').onclick=closeMentorship;ui('mentorOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('mentorOverlay'))closeMentorship();});ui('closeSettings').onclick=closeSettings;ui('settingsOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('settingsOverlay'))closeSettings();});
ui('captainOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('captainOverlay'))closeCaptainProfile();});
ui('zoomOut').onclick=()=>setZoom(camera.targetZoom-.1);
ui('zoomIn').onclick=()=>setZoom(camera.targetZoom+.1);
ui('openQuests').onclick=openQuestLog;
ui('openQuestTop').onclick=openQuestLog;
ui('closeQuests').onclick=closeQuestLog;
ui('questOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('questOverlay'))closeQuestLog();});
ui('openEliteShips').onclick=openEliteShips;ui('openShip').onclick=openShipMenu;

ui('digPrompt').onclick=startDig;ui('openDaily').onclick=openDaily;ui('closeDaily').onclick=closeDaily;ui('dailyOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('dailyOverlay'))closeDaily();});ui('equipShopOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('equipShopOverlay'))closeEquipShop();});ui('cannonShopOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('cannonShopOverlay'))closeCannonShop();});
ui('shipOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('shipOverlay'))closeShipMenu();});
ui('openDevelopment').onclick=openDevelopment;
ui('closeDevelopment').onclick=closeDevelopment;
ui('developmentOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('developmentOverlay'))closeDevelopment();});
ui('openMarket').onclick=openMarket;

ui('marketOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('marketOverlay'))closeMarket();});
ui('supplyOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('supplyOverlay'))closeSupply();});
// Fare tekerleği yakındaki rakipleri sırayla işaretler (yakından uzağa); yakınlaştırma klavye kısayollarında
function cycleTarget(dir:number){
  const reach=Math.max(900,effectiveRange()*1.6);
  const list:Target[]=[...enemies,...monsters].filter(t=>targetExists(t)&&Math.hypot(t.x-player.x,t.y-player.y)<=reach)
    .sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
  if(!list.length)return;
  const i=selected?list.indexOf(selected):-1;
  const next=i<0?list[0]:list[(i+dir+list.length)%list.length];
  if(next!==selected){selected=next;attackChase=false;updateUI();}
}
let wheelAt=0;
canvas.addEventListener('wheel',e=>{e.preventDefault();const now=performance.now();if(now-wheelAt<120)return;wheelAt=now;cycleTarget(e.deltaY>0?1:-1);},{passive:false});
ui('closeLoadout').onclick=closeLoadout;
ui('loadoutOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('loadoutOverlay'))closeLoadout();});
// Sağ üst: market (sekmeli gemi/top/mühimmat pencereleri) ve menü (profil, filo, geliştirme, tayfa, ayarlar)
const SHOP_OVERLAYS=['eliteShipOverlay','equipShopOverlay','cannonShopOverlay','shipOverlay','marketOverlay','supplyOverlay','pearlShopOverlay'];
// Shared frame and one persistent close control for all six shop sections.
SHOP_OVERLAYS.forEach(id=>{ui(id).classList.add('shop-overlay');ui(id).querySelector('section')!.classList.add('shop-window');});
const SHOP_OPEN:Record<string,()=>void>={eliteShipOverlay:openEliteShips,equipShopOverlay:openEquipShop,cannonShopOverlay:openCannonShop,shipOverlay:openShipMenu,marketOverlay:openMarket,supplyOverlay:openSupply,pearlShopOverlay:openPearlShop};
let lastShop='marketOverlay';
function closeShops(){closePearlShop();closeEliteShips();closeEquipShop();closeCannonShop();closeShipMenu();closeMarket();closeSupply();closeLoadout();closeBuy();}
function showShop(id:string){closeShops();closeMenu();lastShop=id;SHOP_OPEN[id]();}
function syncShopTabs(){const open=SHOP_OVERLAYS.find(id=>ui(id).classList.contains('open'));ui('shopTabs').classList.toggle('open',!!open);document.body.classList.toggle('shop-open',!!open);
  document.querySelectorAll<HTMLButtonElement>('#shopTabs [data-shop]').forEach(b=>b.classList.toggle('active',b.dataset.shop===open));}
const shopWatch=new MutationObserver(syncShopTabs);SHOP_OVERLAYS.forEach(id=>shopWatch.observe(ui(id),{attributes:true,attributeFilter:['class']}));
document.querySelectorAll<HTMLButtonElement>('#shopTabs [data-shop]').forEach(b=>b.onclick=()=>showShop(b.dataset.shop!));
ui('openShop').onclick=()=>showShop(lastShop);
// Mağaza sekmesi (İnci Hazinesi): gerçek parayla VİP ve inci paketleri (src/pearlShop.ts)
function openPearlShop(){renderPearlShop();ui('pearlShopOverlay').classList.add('open');}
function closePearlShop(){ui('pearlShopOverlay').classList.remove('open');}
function renderPearlShop(){
  ui('pearlPacks').innerHTML=PEARL_PACKS.map(p=>`<article class="pearl-pack${p.tag?' tagged':''}" data-pack="${p.id}">${p.tag?`<i class="pack-tag">${p.tag}</i>`:''}<img src="/assets/icon-pearl-v1.webp" alt="" draggable="false"/><h4>${p.name}</h4><strong>${fmt(packTotal(p))} İnci</strong><small>${p.bonus?`${fmt(p.pearls)} + <b>${fmt(p.bonus)} bonus</b>`:'&nbsp;'}</small><button>${priceText(p.price)}</button></article>`).join('');
  ui('vipStatus').textContent=isVip()?`AKTİF · ${vipDaysLeft(vipUntil)} gün kaldı`:'VİP değilsin';ui('vipStatus').classList.toggle('on',isVip());
  ui('vipPacks').innerHTML=VIP_PACKS.map(v=>`<article class="vip-pack" data-vip="${v.id}"><strong>${v.months} AY</strong><small>${v.months*30} gün VİP</small><button>${priceText(v.price)}</button></article>`).join('');
  ui('vipPacks').querySelectorAll<HTMLElement>('[data-vip]').forEach(el=>el.querySelector('button')!.onclick=()=>buyVip(el.dataset.vip!));
  ui('pearlNote').textContent=ELITE_TEST_MODE?'Test modu: ödeme alınmaz, paket hemen hesabına eklenir.':'Ödemeler güvenli ödeme sağlayıcısı üzerinden alınır.';
  ui('pearlPacks').querySelectorAll<HTMLElement>('[data-pack]').forEach(el=>el.querySelector('button')!.onclick=()=>buyPearlPack(el.dataset.pack!));}
function buyVip(id:string){const v=VIP_PACKS.find(x=>x.id===id);if(!v)return;
  if(!ELITE_TEST_MODE){toast('Ödeme sistemi yakında açılacak');return;}
  vipUntil=extendVip(vipUntil,v.months);saveVipUntil(vipUntil);playCoins();rewardNotice(`VİP ${v.months} ay satın alındı · ${vipDaysLeft(vipUntil)} gün aktif`,'shop');renderPearlShop();}
function buyPearlPack(id:string){const p=PEARL_PACKS.find(x=>x.id===id);if(!p)return;
  if(!ELITE_TEST_MODE){toast('Ödeme sistemi yakında açılacak');return;}
  state.pearls+=packTotal(p);saveAccount();updateUI();playCoins();rewardNotice(`${p.name} satın alındı · +${fmt(packTotal(p))} inci`,'shop');}
ui('pearlResource').onclick=()=>showShop('pearlShopOverlay');
ui('pearlShopOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('pearlShopOverlay'))closePearlShop();});ui('closeShopTabs').onclick=closeShops;
function openMenu(){closeShops();closePearlShop();ui('menuOverlay').classList.add('open');}
function closeMenu(){ui('menuOverlay').classList.remove('open');}
ui('openMenu').onclick=openMenu;ui('closeMenu').onclick=closeMenu;ui('menuOverlay').addEventListener('pointerdown',e=>{if(e.target===ui('menuOverlay'))closeMenu();});
ui('openMenuQuests').onclick=openQuestLog;ui('openMenuWorld').onclick=openWorldMap;
// menüdeki bir kutuya tıklanınca hedef pencere açılır, menü kapanır
document.querySelectorAll<HTMLButtonElement>('.menu-grid button').forEach(b=>b.addEventListener('click',closeMenu));

function spawnEnemy(){
  const map=mapDef();if(regularEnemyCount()>=map.npcCount)return;
  const available=map.npcs.map(id=>NPCS[id]).filter(def=>!!def.sprite);if(!available.length)return;
  const missing=available.filter(def=>!enemies.some(e=>!e.tower&&!e.boss&&e.def?.id===def.id));
  const pool=missing.length?missing:available;
  const def=pool[Math.floor(Math.random()*pool.length)],p=randomSeaPoint(520);
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
  const map=mapDef(),f=map.fleet;ownTowers.length=0;towersDestroyedHere=0;if(!hasFleetIsland())return;
  // Kendi adanda yalnızca filonun diktiği kuleler vardır; boş kaideler FİLO sekmesinden inciyle doldurulur.
  if(fleetOwner()==='player'){if(guild){const slots=islandSlots(guild,currentMap);FLEET.towers.forEach(([dx,dy],i)=>{const t=slots[i];if(t)ownTowers.push({x:f.x+dx,y:f.y+dy,cooldown:Math.random()*2,slot:i,type:t.type});});}return;}
  if(siege){spawnSiegeTowers();return;}
  FLEET.towers.forEach((_,i)=>{if(!ruinLeft(towerRuins,currentMap,i))spawnRivalTower(i);});
}
// Rakip filo kulesi; yıkılan kaidedeki kule 1 saat dolmadan geri gelmez (reviveRivalTowers)
function spawnRivalTower(i:number){const map=mapDef(),f=map.fleet,t=fleetTower(map.tier),[dx,dy]=FLEET.towers[i];
  const tower:Enemy={kind:'ship',role:'heavy',tower:true,towerIndex:i,x:f.x+dx,y:f.y+dy,angle:0,hp:t.hp,maxHp:t.hp,cooldown:Math.random()*2,speed:0,damage:t.damage,reload:t.reload,rewardGold:0,rewardFame:0,color:'#555',name:`${f.name} Kulesi`,tier:map.tier,aggro:false,wander:0,slowTimer:0,homeX:f.x+dx,homeY:f.y+dy,combatTimer:0,hitRadius:34,fireRange:t.range};enemies.push(tower);
}
function reviveRivalTowers(){if(siege||!hasFleetIsland()||fleetOwner()==='player')return;
  FLEET.towers.forEach((_,i)=>{if(!ruinLeft(towerRuins,currentMap,i)&&!enemies.some(e=>e.tower&&e.towerIndex===i))spawnRivalTower(i);});}
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
  if(activeBoss())return;const b=bossFor(currentMap);if(!b.sprite)return;const p=randomSeaPoint(700);
  const e=makeShip(b as unknown as NpcDef,p.x,p.y,Math.random()*6);e.boss=b;e.hitRadius=64;e.speed=b.speed;e.color='#2f5a4a';enemies.push(e);
  toast(`${b.name} ${mapDef().name} sularında belirdi!`);rewardNotice(`Boss ${b.name} belirdi`,'battle');playBossHorn();playBossMusic(mapDef().tier);
}
function countBossKill(e:Enemy){
  if(siege)return;
  const b=bossFor(currentMap);if(e.def?.id!==b.trigger||e.summoned)return;const st=bossOf(currentMap);if(st.pending)return;
  st.kills++;if(st.kills>=bossKillsNeeded(BOSS_KILLS)){st.kills=0;st.pending=true;spawnBoss();}saveBosses();
}
function bossFire(e:Enemy){
  const base=Math.atan2(player.y-e.y,player.x-e.x),enraged=e.hp<e.maxHp*.5;playEnemyCannon(dist(e,player)*.6,(e.x-player.x)/600);
  muzzleFlash(e.x+Math.cos(base)*30,e.y+Math.sin(base)*30,base,84);
  for(const off of enraged?[-.24,-.12,0,.12,.24]:[-.15,0,.15])shots.push({x:e.x,y:e.y,vx:Math.cos(base+off)*280,vy:Math.sin(base+off)*280,life:2.2,owner:'enemy',damage:e.damage*(.85+Math.random()*.3)*(enraged?.8:1),hit:false,ammo:'iron'});
  e.cooldown=e.reload*(enraged?.8:1);
  if(enraged&&!e.escortsCalled){e.escortsCalled=true;const def=NPCS[mapDef().npcs[1]];for(let k=0;k<2;k++){const ship=makeShip(def,e.x+(k?70:-70),e.y+50,e.angle);ship.aggro=true;ship.combatTimer=20;ship.summoned=true;ship.name=`${e.name} Muhafızı`;enemies.push(ship);}toast(`${e.name} muhafızlarını çağırdı!`);}
}
function defeatBoss(e:Enemy){
  const b=e.boss!;stopBossMusic();const bEp=bossEp(b.tier);gainElitePoints(bEp);gainRage(rage,RAGE_PER_BOSS);state.fame+=xpGain(b.xp);bumpAch('boss');state.pearls+=b.pearls;bossOf(currentMap).pending=false;saveBosses();saveAccount();
  for(let n=0;n<3;n++)setTimeout(()=>{burst(e.x+(Math.random()-.5)*80,e.y+(Math.random()-.5)*50,true);playExplosion();},n*260);
  rewardNotice(`${b.name} batırıldı · +${fmt(b.xp)} TP · +${fmt(b.pearls)} inci · +${fmt(bEp)} EP kazanıldı`,'battle',{xp:b.xp,sink:true});
}
function populateMap(){
  stopBossMusic();abilityQueue.length=0;
  const map=mapDef();islands.splice(0,islands.length,...map.islands.map(i=>({...i})));
  enemies.length=0;shots.length=0;salvoQueue.length=0;particles.length=0;wrecks.length=0;lootChests.length=0;sparkles.length=0;sparkleQueue.length=0;mines.length=0;driftClock=DRIFT_RESPAWN_SECONDS;
  setTowerTheme(theme().fleet);
  preload([...(hasFleetIsland()?[fleetBaseUrl(theme().fleet),fleetTowerUrl(theme().fleet)]:[]),...(siege?[SIEGE_COMMANDER.sprite,SIEGE_GUARD.sprite]:[]),...map.npcs.map(id=>NPCS[id].sprite),...map.monsters.map(id=>MONSTERS[id].sprite),...new Set(map.islands.map(i=>islandSheetUrl(i.look)))]);
  createMonsters();setupFleetIsland();
  for(let i=0;i<map.npcCount;i++)spawnEnemy();
  if(siege){spawnSiegeAllies();ui('mapName').textContent=map.name;ui('mapSubtitle').textContent='BÜYÜK KUŞATMA';ui('mapBadge').className='map-badge danger-3';renderSiegeHud();return;}
  if(bossOf(currentMap).pending)spawnBoss();
  spawnTestCaptains();
  for(let i=0;i<3;i++){const p=randomSeaPoint(0);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(map.tier-1)));}
  for(let i=0;i<SPARKLE_COUNT*sparkleMult();i++)spawnSparkle();
  ui('mapName').textContent=`${map.key} · ${map.name}`;ui('mapSubtitle').textContent=map.safe?'SAVAŞA KAPALI':`${theme().name.toLocaleUpperCase('tr')} · SEVİYE ${map.tier}`;ui('mapBadge').className=`map-badge ${map.safe?'safe':'danger-'+Math.min(3,Math.ceil(map.tier/3))}`;
}
function enterMap(key:MapKey,at:Vec){
  currentMap=key;fleetSafe=null;fleetFields.clear();try{localStorage.setItem(WORLD_STORAGE,key);}catch{}populateMap();
  player.x=at.x;player.y=at.y;player.speed=0;destination=null;selected=null;state.attacking=false;ui('attack').classList.remove('active');
  camera.x=player.x;camera.y=player.y;jumpPrompt=null;mapFade=1;updateJumpPrompt();playMapJump();
  rewardNotice(`${mapDef().key} ${mapDef().name} · ${mapDef().safe?'savaşa kapalı':'seviye '+mapDef().tier}`,'none');
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
  const dir=siege?null:edgeDir(),to=dir?neighbor(currentMap,dir):null,next=dir&&to?{dir,to}:null,el=ui('portalPrompt');
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
const FM_N=FLEET_MASK.n,FM_CELL=FLEET_MASK.cell*FLEET_SCALE,FM_HALF=FM_N*FM_CELL/2;
const FLEET_GRID=(()=>{const g=new Uint8Array(FM_N*FM_N);let k=0;for(const part of FLEET_MASK.rle.split(',')){const v=+part[0],n=parseInt(part.slice(1),36);g.fill(v,k,k+n);k+=n;}return g;})();
const fleetGrid=()=>FLEET_GRID;
const fleetEnterable=()=>hasFleetIsland()&&(siege?siegePhase(siege)>=2:fleetOwner()==='player'||FLEET_TEST_ENTRY);
function fleetCellOf(p:Vec){const f=mapDef().fleet;return{i:Math.floor((p.x-f.x+FM_HALF)/FM_CELL),j:Math.floor((p.y-f.y+FM_HALF)/FM_CELL)};}
function fleetCellValue(i:number,j:number){return i<0||j<0||i>=FM_N||j>=FM_N?1:fleetGrid()[j*FM_N+i];}
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
const fleetPads:Record<string,{grid:Uint8Array;clear:Uint8Array}>=Object.fromEntries(Object.entries({shared:FLEET_GRID}).map(([key,source])=>{
  const grid=new Uint8Array(PN*PN).fill(1);
  for(let j=0;j<FM_N;j++)for(let i=0;i<FM_N;i++)grid[(j+FM_PAD)*PN+i+FM_PAD]=source[j*FM_N+i];
  const clear=new Uint8Array(PN*PN);
  for(let j=0;j<PN;j++)for(let i=0;i<PN;i++){
    if(!grid[j*PN+i])continue;let r=1;
    search:for(;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const x=i+dx,y=j+dy;if(x>=0&&y>=0&&x<PN&&y<PN&&!grid[y*PN+x])break search;
    }
    clear[j*PN+i]=r;
  }
  return[key,{grid,clear}];
}));
const padGrid=()=>fleetPads.shared.grid;
const padClear=()=>fleetPads.shared.clear;
function padCellOf(p:Vec){const c=fleetCellOf(p);return{i:clamp(c.i+FM_PAD,0,PN-1),j:clamp(c.j+FM_PAD,0,PN-1)};}
function padCenter(i:number,j:number){return fleetCellCenter(i-FM_PAD,j-FM_PAD);}
function padNearestOpen(c:{i:number;j:number}){if(padGrid()[c.j*PN+c.i])return c;for(let r=1;r<30;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const i=c.i+dx,j=c.j+dy;if(i>=0&&j>=0&&i<PN&&j<PN&&padGrid()[j*PN+i])return{i,j};}return c;}
// hedef hücresine göre mesafe alanları (en son 8 hedef önbellekte)
const fleetFields=new Map<string,Float32Array>();
function buildFleetField(t:{i:number;j:number}){
  const D=new Float32Array(PN*PN).fill(Infinity),heap:number[]=[],push=(k:number)=>{heap.push(k);let n=heap.length-1;while(n>0){const p=(n-1)>>1;if(D[heap[p]]<=D[heap[n]])break;[heap[p],heap[n]]=[heap[n],heap[p]];n=p;}},
    pop=()=>{const top=heap[0],last=heap.pop()!;if(heap.length){heap[0]=last;let n=0;for(;;){const l=n*2+1,r=l+1;let m=n;if(l<heap.length&&D[heap[l]]<D[heap[m]])m=l;if(r<heap.length&&D[heap[r]]<D[heap[m]])m=r;if(m===n)break;[heap[m],heap[n]]=[heap[n],heap[m]];n=m;}}return top;};
  const s0=t.j*PN+t.i;D[s0]=0;push(s0);
  while(heap.length){const k=pop(),x=k%PN,y=(k-x)/PN;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=PN||ny>=PN)continue;const j=ny*PN+nx;if(!padGrid()[j])continue;if(dx&&dy&&(!padGrid()[y*PN+nx]||!padGrid()[ny*PN+x]))continue;
    const cl=padClear()[j],cost=(dx&&dy?1.414:1)*(cl>=3?1:cl===2?1.8:3.5),nd=D[k]+cost;if(nd<D[j]){D[j]=nd;push(j);}}}
  return D;
}
// from: yolu bulunacak gemi (varsayılan oyuncu); kuşatmada müttefik kaptanlar da kullanır
// Küçük adalar: hedefe giden doğru bir adanın içinden geçiyorsa gemi adanın çevresinde yörüngeye alınır.
// Dolanma yönü (saat yönü / tersi) hedef başına bir kez seçilir ve korunur; böylece gemi yarı yolda fikir değiştirip
// iki yan arasında gidip gelmez. Ara nokta her karede gemiden ileri doğru kayar, doğru açılınca doğrudan hedefe gidilir.
const detourSides=new WeakMap<Vec,Map<number,number>>();
function islandDetour(from:Vec,target:Vec):Vec{
  const dx=target.x-from.x,dy=target.y-from.y,L2=dx*dx+dy*dy;if(L2<1)return target;
  let best:{t:number;i:number}|null=null;
  islands.forEach((island,i)=>{const block=island.r*.72+28+22;
    const t=((island.x-from.x)*dx+(island.y-from.y)*dy)/L2;
    // yalnız doğrunun iç kısmı adaya giriyorsa engel say: gemi ya da hedef kıyıdaysa uç noktalar sayılmaz
    if(t<=0||t>=1)return;const d=Math.hypot(from.x+dx*t-island.x,from.y+dy*t-island.y);
    if(d<block&&(!best||t<best.t))best={t,i};});
  if(!best)return target;
  const bi=(best as {t:number;i:number}).i,island=islands[bi],R=island.r*.72+28+60;
  const as=Math.atan2(from.y-island.y,from.x-island.x),at=Math.atan2(target.y-island.y,target.x-island.x);
  let sides=detourSides.get(target);if(!sides){sides=new Map();detourSides.set(target,sides);}
  let side=sides.get(bi);
  if(side===undefined){let diff=at-as;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;side=diff>=0?1:-1;sides.set(bi,side);}
  // kalan yay seçilen yönde ölçülür; uzaktaki gemi teğet noktasına, kıyıdaki gemi ~35° ileriye yönelir
  let rem=(at-as)*side;while(rem<0)rem+=Math.PI*2;while(rem>Math.PI*2)rem-=Math.PI*2;if(rem>Math.PI*1.6)rem=0;
  const D=Math.hypot(from.x-island.x,from.y-island.y),step=Math.max(.6,D>R?Math.acos(R/D):0),a=as+side*Math.min(rem,step);
  return{x:island.x+Math.cos(a)*R,y:island.y+Math.sin(a)*R};
}
function routeVia(target:Vec,from:Vec=player):Vec{const way=fleetRoute(target,from);return way===target?islandDetour(from,target):way;}
function fleetRoute(target:Vec,from:Vec):Vec{
  if(!fleetEnterable()||fleetWideLine(from,target))return target;
  const t=padNearestOpen(padCellOf(target)),key=`${currentMap}:${t.i},${t.j}`;
  let D=fleetFields.get(key);if(!D){D=buildFleetField(t);fleetFields.set(key,D);if(fleetFields.size>8)fleetFields.delete(fleetFields.keys().next().value!);}let c=padNearestOpen(padCellOf(from));if(!Number.isFinite(D[c.j*PN+c.i]))return target;
  // Yol boyunca kalın çizgiyle görülebilen en uzak hücre; kıyıya çok yakınken ince çizgiye, o da olmazsa sıradaki hücreye düşülür.
  let way:Vec|null=null,first:Vec|null=null;
  for(let step=0;step<80;step++){const here=D[c.j*PN+c.i];if(here<=0){if(fleetWideLine(from,target)||(!way&&fleetClearLine(from,target)))return target;break;}let next=c,nd=here;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=c.i+dx,j=c.j+dy;if(i<0||j<0||i>=PN||j>=PN)continue;const v=D[j*PN+i];if(v<nd){nd=v;next={i,j};}}
    if(next===c)break;c=next;const cand=padCenter(c.i,c.j);if(!first)first=cand;
    if(fleetWideLine(from,cand))way=cand;else if(!way&&step<3&&fleetClearLine(from,cand))way=cand;else if(way||step>=3)break;}
  return way??first??target;
}
function insideOwnLagoon(p:Vec){return hasFleetIsland()&&fleetOwner()==='player'&&fleetNav(p)===2;}
function navigablePoint(point:Vec){
  const fc=fleetCollision(point);if(fc)return{x:fc.x,y:fc.y};
  for(const island of islands){const shore=island.r*.72+38,d=dist(point,island);if(d<shore){const a=Math.atan2(point.y-island.y,point.x-island.x);return{x:island.x+Math.cos(a)*shore,y:island.y+Math.sin(a)*shore};}}
  return{x:clamp(point.x,25,WORLD_WIDTH-25),y:clamp(point.y,25,WORLD_HEIGHT-25)};
}
function resolveIslandCollision(){
  const fc=fleetCollision(player);if(!fc&&hasFleetIsland())fleetSafe={x:player.x,y:player.y};if(fc){const hard=!fleetSafe||(fc.x!==player.x&&fc.y!==player.y);player.x=fc.x;player.y=fc.y;player.speed*=hard?.5:.9;if(!routeTarget)destination=null;if(collisionNotice<=0){toast(fleetEnterable()?`${fc.name} karasına çıkılamaz — lagüne doğu ve batı kapılarından girilir`:`${fc.name} rakip filonun adası — içeri girilemez`);collisionNotice=2;}}
  for(const island of islands){const shore=island.r*.72+28,d=dist(player,island);if(d<shore){const a=d>.01?Math.atan2(player.y-island.y,player.x-island.x):player.angle-Math.PI/2;player.x=island.x+Math.cos(a)*shore;player.y=island.y+Math.sin(a)*shore;player.speed*=.28;destination=null;if(collisionNotice<=0){toast(`${island.name} kıyısına daha fazla yaklaşamazsın`);collisionNotice=2;}}}
}
function setZoom(value:number){camera.targetZoom=clamp(value,.5,1.15);ui('zoomValue').textContent=`${Math.round(camera.targetZoom*100)}%`;}
function targetExists(t:Target){return t.kind==='ship'?enemies.includes(t):monsters.includes(t);}

// Saldırı menzil dışından başlatılırsa gemi hedefe yaklaşır; kaptan rota verirse yaklaşma biter.
let attackChase=false;
function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;attackChase=state.attacking&&dist(player,selected)>effectiveRange();if(state.attacking){state.repairing=false;fireAtTarget();}ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
function toggleRepair(){
  if(state.hp>=effectiveMaxHp()){toast('Gövde zaten tamamen sağlam');return;}
  const danger=enemies.some(e=>e.aggro&&dist(e,player)<520)||monsters.some(m=>m.aggro&&dist(m,player)<520);
  if(danger||state.attacking){toast('Savaş durumundayken tamir yapılamaz');return;}
  state.repairing=!state.repairing;toast(state.repairing?'Açık deniz tamiri başladı':'Tamir durduruldu');
}
let repairMoveHint=0;
function fireAtTarget(){
  const cannon=CANNONS[state.cannonType];
  if(!selected||player.cooldown>0||dist(player,selected)>effectiveRange())return;
  if(state.ammo==='chain'&&state.chainAmmo<=0){state.ammo='iron';toast('Zincir güllesi tükendi');}
  if(isSpecial(state.ammo)&&arsenal[state.ammo]<=0){toast(`${SPECIAL_AMMO[state.ammo].name} tükendi`);state.ammo='iron';renderQuickSlots();}
  // Seafight mantığı: her top 1 gülle harcar. Stok top sayısından azsa kalan toplar demir gülle atar.
  const stock=state.ammo==='chain'?state.chainAmmo:isSpecial(state.ammo)?arsenal[state.ammo]:Infinity,loaded=Math.min(state.cannon,stock);
  const ammoMult=state.ammo==='chain'?CHAIN_FACTOR:isSpecial(state.ammo)?SPECIAL_AMMO[state.ammo].damage:1,mix=state.cannon>0?(loaded*ammoMult+(state.cannon-loaded))/state.cannon:1;
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),tx=selected.x-player.x,ty=selected.y-player.y;
  const powderF=useConsumable('powder'),side=fx*ty-fy*tx>0?-1:1,damage=state.cannon*BALL_DAMAGE*(1+upgrades.damage*.11)*cannon.damage*bonus.damage*mix*(1+equipBonus().damage+achBonus().damage+eliteBonus().damage)*powderF*rageSalvo(rage);
  salvoQueue.push({delay:0,target:selected,side,slot:0,damage,ammo:state.ammo,powder:powderF>1});
  if(state.ammo==='chain'){state.chainAmmo-=loaded;saveAccount();gainElitePoints(loaded*ELITE_POINTS_PER_BALL.chain);bumpAch('eliteBalls',loaded);}
  else if(isSpecial(state.ammo)){arsenal[state.ammo]-=loaded;saveArsenal(arsenal);renderQuickSlots();gainElitePoints(loaded*ELITE_POINTS_PER_BALL[state.ammo]);bumpAch('eliteBalls',loaded);}
  player.cooldown=(1-equipBonus().reload)*cannon.reload*Math.max(.6,1-upgrades.reload*.04)*bonus.reload/(1+eliteBonus().reload)*(state.ammo==='chain'?1.18:1)*(isSpecial(state.ammo)?SPECIAL_AMMO[state.ammo].reload:1);
}
function gainElitePoints(ep:number){
  ep*=epMult();if(ep<=0)return;const before=eliteLevelFromEp(state.elitePoints);state.elitePoints=Math.round((state.elitePoints+ep)*1000)/1000;const after=eliteLevelFromEp(state.elitePoints);saveAccount();
  if(after>before&&elitePurchased){const ship=ELITE_SHIPS.find(x=>x.level===after);rewardNotice(`Elit ${after} açıldı${ship?` · ${ship.name} tersanede`:''}`);}
}
// Elit puan çubuğu: mevcut elit seviyesinden bir sonrakine ilerleme
function eliteProgress(){const lvl=eliteLevelFromEp(state.elitePoints),lo=eliteLevelEp(lvl),hi=lvl>=ELITE_MAX_LEVEL?lo:eliteLevelEp(lvl+1);
  return{text:lvl>=ELITE_MAX_LEVEL?Math.floor(state.elitePoints).toLocaleString('tr-TR'):`${Math.floor(state.elitePoints).toLocaleString('tr-TR')} / ${hi.toLocaleString('tr-TR')}`,pct:lvl>=ELITE_MAX_LEVEL?100:Math.min(100,(state.elitePoints-lo)/(hi-lo)*100)};}
function releaseSalvo(round:SalvoRound){
  if(!targetExists(round.target))return;
  const d=dist(player,round.target);
  const a=Math.atan2(round.target.y-player.y,round.target.x-player.x);
  const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),rx=Math.cos(player.angle),ry=Math.sin(player.angle),speed=510;
  const tx=(round.target.x-player.x)/Math.max(1,d),ty=(round.target.y-player.y)/Math.max(1,d),forwardDot=fx*tx+fy*ty;
  const muzzle=forwardDot>.55?{x:fx*24,y:fy*24}:forwardDot<-.55?{x:-fx*20,y:-fy*20}:{x:rx*round.side*18,y:ry*round.side*18};
  const x=player.x+muzzle.x,y=player.y+muzzle.y;
  shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:Math.max(1.1,d/speed+.5),owner:'player',damage:round.damage,hit:false,ammo:round.ammo,target:round.target,powder:round.powder});
  playCannon(state.cannonType,round.ammo);
  muzzleFlash(x,y,Math.atan2(muzzle.y,muzzle.x));
}
// NPC ve canavar atış menzili: başlangıç topunun (Döküm 390) altında, oyuncu vuramadığı yerden hasar yemesin
const NPC_FIRE_RANGE=360;
// Güvenli haritalar dışında NPC, oyuncu menzile girince saldırır; oyuncu menzilden çıkınca birkaç saniye sonra vazgeçer
function proximityAggro(u:{aggro:boolean;combatTimer:number},d:number){
  if(d>=NPC_FIRE_RANGE||mapDef().safe||state.hp<=0||state.invulnerable>0)return;
  if(!u.aggro){u.aggro=true;u.combatTimer=4;}else u.combatTimer=Math.max(u.combatTimer,4);
}
function enemyFire(e:Enemy){
  if(e.boss){bossFire(e);return;}
  const a=Math.atan2(player.y-e.y,player.x-e.x);playEnemyCannon(dist(e,player),(e.x-player.x)/600);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy',damage:e.damage*(.85+Math.random()*.3),hit:false,ammo:'iron'}); e.cooldown=e.reload+Math.random()*.55;muzzleFlash(e.x+Math.cos(a)*16,e.y+Math.sin(a)*16,a,36);
}
function monsterFire(m:Monster){const a=Math.atan2(player.y-m.y,player.x-m.x);playSplash();for(const off of m.def.tier>=5?[-.12,0,.12]:[0])shots.push({x:m.x,y:m.y,vx:Math.cos(a+off)*210,vy:Math.sin(a+off)*210,life:2.4,owner:'enemy',damage:m.def.damage*(.85+Math.random()*.3),hit:false,ammo:'iron',visual:'spit'});m.cooldown=m.def.reload;}
// Batınca bulunduğun denizde, düşmanlardan uzak rastgele bir noktada %10 gövdeyle yeniden doğ.
// Batınca kısa yazı: kimin batırdığı (oyuncu gülleleri kaptanı taşır; diğerlerinde en yakın saldıran düşman)
function killerNear(){let best='',bd=Infinity;
  for(const e of enemies)if(e.aggro||e.tower){const d=dist(e,player);if(d<bd){bd=d;best=e.name;}}
  for(const m of monsters)if(m.aggro){const d=dist(m,player);if(d<bd){bd=d;best=m.name;}}
  return best||'düşman';}
function showSunkBy(name:string){rewardNotice(`${name} tarafından batırıldın`,'battle');}
function respawn(){
  if(siege){siegeRespawn();return;}
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
// Vuruş: parlak çekirdek ışığı, patlama animasyonu, savrulup suya düşen tahta kıymıkları, parlak korlar ve açık renkli barut dumanı
// Damage numbers provide impact feedback; no burst particles are allocated.
function burst(_x:number,_y:number,_large=false){}
// Iska: suya düşen güllenin su sütunu ve köpük halkası
// Oyuncuya uzaklığa göre ses seviyesi (0..1)
function earGain(p:Vec){return Math.max(0,Math.min(1,1.15-dist(p,player)/900));}
function splashAt(x:number,y:number,_size=110){const eg=earGain({x,y});if(eg>.05)playSplash(eg*.8);}
// Özel güllelerin isabet etkisi: can emici şansa bağlı olarak oyuncuyu onarır (src/arsenal.ts LEECH)
function ammoImpact(s:Shot,target:Target,hit:number){
  if(s.owner!=='player')return;
  if(s.ammo==='leech'){const heal=leechHeal(hit,target.kind==='ship'&&!!target.captain,effectiveMaxHp());if(heal<=0)return;playHeal();state.hp=Math.min(effectiveMaxHp(),state.hp+heal);healText(player.x,player.y,heal);
    for(let n=0;n<4;n++){const a=Math.atan2(player.y-target.y,player.x-target.x)+(Math.random()-.5)*.8,sp=dist(player,target)/.7;particles.push({x:target.x,y:target.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.7,maxLife:.7,kind:'soul',z:18,size:26});}}
}
// Namlu alevi ve top dumanı
function muzzleFlash(x:number,y:number,angle:number,size=40){particles.push({x,y,vx:0,vy:0,life:.2,maxLife:.2,kind:'flash',rot:angle,size,z:6});for(let n=0;n<2;n++)particles.push({x,y,vx:Math.cos(angle)*(30+n*25)+(Math.random()-.5)*10,vy:Math.sin(angle)*(30+n*25)+(Math.random()-.5)*10,life:.9+Math.random()*.4,maxLife:1.3,kind:'wisp',z:6,size:9+n*5});}
const WRECK_TIME=1.1;
const MAX_WRECKS=24;
// Hasar yazısı: verdiğin hasar barut açıkken sarı, kapalıyken kırmızı; aldığın hasar kalkan açıkken mavi, kapalıyken kırmızı
const DMG_GOLD='#ffd23a',DMG_RED='#ff4a3a',DMG_BLUE='#5fb8ff';
let playerSlow=0,repairClock=0;
function healText(x:number,y:number,value:number){particles.push({x,y:y-14,vx:0,vy:-22,life:1.1,maxLife:1.1,kind:'damage',color:'#5ee07a',text:`+${Math.round(value).toLocaleString('tr-TR')}`});}
function damageText(x:number,y:number,value:number,color=DMG_GOLD){particles.push({x,y,vx:0,vy:-24,life:1,maxLife:1,kind:'damage',color,text:`-${Math.round(value).toLocaleString('tr-TR')}`});}
let toastTimer=0;
function toast(msg:string){ui('toast').textContent=msg;ui('toast').classList.add('show');toastTimer=2.2;}
// Üstte küçük bildirim satırları (en çok 3, 4 sn) ve seyir defteri kaydı. kind 'none' yalnız gösterir, deftere yazmaz.
const logbook=loadLog();
function rewardNotice(msg:string,kind:LogKind|'none'='gain',data:Partial<LogEntry>={}){
  const text=msg.replace(/\s{3,}/g,' · '),feed=ui('sinkNotices'),line=document.createElement('div');
  line.textContent=text;feed.appendChild(line);while(feed.children.length>3)feed.firstElementChild!.remove();setTimeout(()=>line.remove(),4000);
  if(kind!=='none'){addLog(logbook,{t:Date.now(),kind,text,...data});saveLog(logbook);if(ui('logOverlay').classList.contains('open'))renderLogbook();}
}
function sinkNotice(name:string,sp:number){
  rewardNotice(sp>0?`${name} batırıldı · +${fmt(sp)} SP kazanıldı`:`${name} batırıldı · günlük SP sınırına ulaşıldı`,'battle',{sp,sink:true});
}
function saveQuestState(){localStorage.setItem(QUEST_STORAGE,JSON.stringify({rulesVersion:2,active:state.activeQuest,progress:questProgress,cooldowns:questCooldownUntil}));}
function saveAccount(){localStorage.setItem(ACCOUNT_STORAGE,JSON.stringify({pearls:state.pearls,gold:state.gold,fame:state.fame,level:state.level,maxHp:state.maxHp,hp:state.hp,chainAmmo:state.chainAmmo,elitePoints:state.elitePoints,eliteEconomyVersion:ELITE_ECONOMY_VERSION,battlePoints:state.battlePoints,cannonType:state.cannonType,cannonInventory,mountedCannons,equipOwned,equipped,quickSlots,upgrades,eliteShip:activeEliteShip,activeShip,elitePurchased,currentMap}));try{localStorage.setItem(WORLD_STORAGE,currentMap);}catch{}}
function effectiveRange(){return(CANNONS[state.cannonType].range+upgrades.range*18+bonus.range+equipBonus().range);}
function effectiveSpeed(){return(128+upgrades.speed*5)*bonus.speed*(1+equipBonus().speed+eliteBonus().speed)*(abilityActive('speed')?SPEED_BOOST:1)*(rageActive(rage)?RAGE_SPEED:1)*(playerSlow>0?CHAIN_SLOW.factor:1);}
function cannonCapacity(){return earnedEliteLevel()>0?ELITE_CANNON_CAPACITY:BASE_CANNONS;}
function mountedCannonCount(){return (Object.keys(mountedCannons) as CannonKind[]).reduce((sum,kind)=>sum+mountedCannons[kind],0);}
function cannonAsset(kind:CannonKind){
  return cannonAssetSources[kind]?`<img src="${cannonAssetSources[kind]}" alt="${CANNONS[kind].name} Top" draggable="false"/>`:'<span class="asset-loading"></span>';
}
function cooldownText(until:number){const minutes=Math.max(1,Math.ceil((until-Date.now())/60000)),hours=Math.floor(minutes/60),mins=minutes%60;return hours>0?`${hours} sa ${mins} dk`:`${mins} dk`;}
let pendingUpgrade:UpgradeKind|null=null;
function upgradeCost(kind:UpgradeKind){return Math.round(UPGRADES[kind].pearls*UPGRADE_PRICE_MULTIPLIER*(1+upgrades[kind]*.55));}
function upgradeIcon(kind:UpgradeKind){return `<i class="sprite icon-${kind}"></i>`;}
function openShipMenu(){pendingUpgrade=null;invSelected=state.cannonType;renderShipMenu();ui('shipOverlay').classList.add('open');}
function closeShipMenu(){pendingUpgrade=null;ui('shipOverlay').classList.remove('open');}
// Envanter (Seafight tarzı): solda depo, sağda gemi ızgarası; küçük top simgeleri adetleriyle durur.
// Simgeye dokunup adet yazılır, oklarla taşınır; ya da simge öteki tarafa sürüklenir (sağa: gemiye, sola: depoya).
let invSelected:CannonKind='cast',invMode:'cannon'|'equip'='cannon',invEquipSel:string|null=null;
const INV_CELLS=9;
function renderShipMenu(){
  document.querySelectorAll<HTMLButtonElement>('[data-inv-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.invMode===invMode);b.onclick=()=>{invMode=b.dataset.invMode as typeof invMode;renderShipMenu();};});
  if(invMode==='equip'){renderEquipInventory();return;}
  state.cannon=mountedCannonCount();const activeCannon=CANNONS[state.cannonType],kinds=Object.keys(CANNONS) as CannonKind[];
  ui('shipSummary').innerHTML=`<b>${state.cannon} / ${cannonCapacity()}</b><small>SALVO HASARI ${fmt(Math.round(state.cannon*BALL_DAMAGE*(1+equipBonus().damage+achBonus().damage+eliteBonus().damage)*(1+upgrades.damage*.11)*activeCannon.damage*bonus.damage))}</small>`;
  const tiles=(side:'depot'|'ship')=>{const list=kinds.filter(k=>(side==='ship'?mountedCannons[k]:cannonInventory[k])>0);
    return list.map(k=>`<button class="inv-tile ${invSelected===k?'selected':''} ${side==='ship'&&state.cannonType===k?'active':''}" data-inv="${k}" data-side="${side}" title="${CANNONS[k].name} Top">${cannonAsset(k)}<b>${fmt(side==='ship'?mountedCannons[k]:cannonInventory[k])}</b>${side==='ship'&&state.cannonType===k?'<i>AKTİF</i>':''}</button>`).join('')+'<span class="inv-empty"></span>'.repeat(Math.max(0,INV_CELLS-list.length));};
  ui('invDepot').innerHTML=tiles('depot');ui('invShip').innerHTML=tiles('ship');
  const c=CANNONS[invSelected],active=state.cannonType===invSelected,prev=(document.getElementById('invAmount') as HTMLInputElement|null)?.value??'1';
  ui('cannonRows').innerHTML=`<div class="inv-info-art">${cannonAsset(invSelected)}</div><h3>${c.name} Top</h3>
    <dl><dt>Hasar</dt><dd>×${c.damage.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})}</dd><dt>Menzil</dt><dd>${c.range}</dd><dt>Dolum</dt><dd>${c.reload.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} sn</dd><dt>Depoda</dt><dd>${fmt(cannonInventory[invSelected])}</dd><dt>Gemide</dt><dd>${fmt(mountedCannons[invSelected])}</dd></dl>
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
  ui('invDepot').innerHTML=owned.map(e=>`<button class="inv-tile equip-tile rarity-${e.rarity} ${invEquipSel===e.id?'selected':''}" data-inv="${e.id}" data-side="depot" title="${e.name}">${equipIcon(e.id)}<b>${fmt(equipOwned[e.id])}</b></button>`).join('')+'<span class="inv-empty"></span>'.repeat(Math.max(0,INV_CELLS-owned.length));
  ui('invShip').innerHTML=EQUIP_SLOTS.map(sl=>{const id=equipped[sl.id],e=id?equipById(id):undefined;
    return e?`<button class="inv-tile equip-tile rarity-${e.rarity} ${invEquipSel===e.id?'selected':''}" data-inv="${e.id}" data-side="ship" title="${e.name}">${equipIcon(e.id)}<small class="slot-name">${sl.name}</small></button>`:`<span class="inv-empty equip-slot"><small>${sl.name}</small></span>`;}).join('');
  const e=invEquipSel?equipById(invEquipSel):undefined;
  ui('cannonRows').innerHTML=e?`<div class="inv-info-art">${equipIcon(e.id,'equip-icon big')}</div><h3>${e.name}</h3><dl><dt>Yuva</dt><dd>${EQUIP_SLOTS.find(s=>s.id===e.slot)!.name}</dd><dt>Nadirlik</dt><dd class="rarity-text-${e.rarity}">${RARITY_NAMES[e.rarity]}</dd><dt>Etki</dt><dd>${equipStatText(e.stats)}</dd><dt>Depoda</dt><dd>${fmt(equipOwned[e.id]??0)}</dd><dt>Gemide</dt><dd>${equipped[e.slot]===e.id?'Takılı':'—'}</dd></dl>
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
const CANNON_PRICES:Record<CannonKind,Price>=CANNON_COSTS;
function equipIcon(id:string,cls='equip-icon'){const e=equipById(id);return e?`<i class="${cls} rarity-${e.rarity}" style="${equipIconStyle(e)}"></i>`:'';}
function openEquipShop(){renderEquipShop();ui('equipShopOverlay').classList.add('open');}
function closeEquipShop(){ui('equipShopOverlay').classList.remove('open');}
function renderEquipShop(){
  renderBuyRows('equipShopList',EQUIPMENT.map(e=>({id:e.id,name:e.name,art:`<div class="ammo-icon equip-shop-art rarity-${e.rarity}">${equipIcon(e.id)}<b>${fmt(equipOwned[e.id]??0)}</b></div>`,
    desc:`${EQUIP_SLOTS.find(s=>s.id===e.slot)!.name} · ${RARITY_NAMES[e.rarity]} · ${equipStatText(e.stats)}`,note:`Depoda ${fmt(equipOwned[e.id]??0)}${equipped[e.slot]===e.id?' · Gemide takılı':''} · ENVANTER → DONANIM'dan gemiye tak`,unit:e.price,
    give:(n:number)=>{equipOwned[e.id]=(equipOwned[e.id]??0)+n;},after:renderEquipShop})));
}
function openCannonShop(){renderCannonShop();ui('cannonShopOverlay').classList.add('open');}
function closeCannonShop(){ui('cannonShopOverlay').classList.remove('open');}
function renderCannonShop(){
  renderBuyRows('cannonShopList',(Object.keys(CANNONS) as CannonKind[]).map(kind=>{const c=CANNONS[kind];return{id:kind,name:`${c.name} Top`,art:`<div class="ammo-icon cannon-shop-art">${cannonAsset(kind)}</div>`,
    desc:`Hasar ×${c.damage.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} · Menzil ${c.range} · Dolum ${c.reload.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} sn`,note:`Depoda ${fmt(cannonInventory[kind])} · Gemide ${fmt(mountedCannons[kind])} · Toplar depoya gider`,unit:CANNON_PRICES[kind],
    give:(n:number)=>{cannonInventory[kind]+=n;},after:renderCannonShop};}));
}
// Gemi değişince (ör. elitten başlangıç gemisine) yuva sayısı düşebilir; taşan toplar depoya iner.
function fitCannonsToCapacity(){
  if(ELITE_TEST_MODE){fillTestCannons();return;}
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
function openEliteShips(){previewShip=activeSpecialDesign??activeShip;shipyardTab=activeSpecialDesign?'special':'elite';renderEliteShips();ui('eliteShipOverlay').classList.add('open');}
function closeEliteShips(){ui('eliteShipOverlay').classList.remove('open');}
function equipStarterShip(){
  activeSpecialDesign=null;saveSpecialDesign(null);const oldMax=effectiveMaxHp();activeShip='starter';state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*effectiveMaxHp()/oldMax));fitCannonsToCapacity();saveAccount();renderEliteShips();updateUI();toast('Başlangıç gemisi seçildi');
}
function purchaseEliteOne(){
  if(elitePurchased)return;
  if(state.pearls<ELITE_ONE_PRICE){toast(`Elit 1 için ${fmt(ELITE_ONE_PRICE)} İnci gerekli`);return;}
  activeSpecialDesign=null;saveSpecialDesign(null);state.pearls-=ELITE_ONE_PRICE;elitePurchased=true;activeEliteShip='phantom';activeShip='phantom';previewShip='phantom';saveAccount();renderEliteShips();updateUI();rewardNotice('Elit 1 açıldı · Hayalet Kadırga','shop');toast('Hayalet Kadırga satın alındı');
}
// Tersane iki sekmeli: ELİT GEMİLER (başlangıç + 15 elit) ve ÖZEL GEMİLER (yalnızca görünüm tasarımları). Kartlarda kısa yazı.
let shipyardTab:'elite'|'special'='elite';
function renderEliteShips(){
  const unlocked=ELITE_TEST_MODE?ELITE_MAX_LEVEL:elitePurchased?eliteLevelFromEp(state.elitePoints):0;
  const card=(id:string,name:string,art:string,requirement:string,effect:string,active:boolean,locked=false,label='SEÇ')=>
    `<article class="elite-card ${active?'active':''} ${previewShip===id?'previewed':''} ${locked?'locked':''}"><button class="ship-preview-button" data-preview="${id}" aria-label="${name} önizle" aria-pressed="${previewShip===id}">${art}<strong>${name}</strong></button><p class="ship-requirement">${requirement}</p><p class="ship-effect">${effect}</p><button class="ship-select" data-select-ship="${id}" ${locked||active&&id!=='pirate-rage'?'disabled':''}>${active?(id==='pirate-rage'?'ÇIKAR':'SEÇİLİ'):label}</button></article>`;
  const special=card('pirate-rage','Pirate Rage',`<img class="elite-art" src="${PIRATE_RAGE_DESIGN.card}" alt="" draggable="false"/>`,designOwned?'Özel tasarım':'Açılış Festivali ödülü',designOwned?'Sadece görünüm':'7 festival gününün hepsinde giriş yapana verilir',!!activeSpecialDesign,!designOwned);
  const starter=card('starter','Yedi Deniz','<span class="starter-ship-art" role="img" aria-label="Başlangıç gemisi"></span>','0 EP','Başlangıç gemisi',activeShip==='starter'&&!activeSpecialDesign);
  const cards=ELITE_SHIPS.map(ship=>{
    const purchase=ship.level===1&&!elitePurchased&&!ELITE_TEST_MODE;
    const requirement=`${eliteLevelEp(ship.level).toLocaleString('tr-TR')} EP${purchase?` · ${fmt(ELITE_ONE_PRICE)} İnci`:''}`;
    return card(ship.id,ship.name,`<img class="elite-art" src="${eliteArtUrl(ship.id)}" alt="" draggable="false"/>`,requirement,eliteBonusText(ELITE_REWARDS[ship.level],true,true),activeShip===ship.id&&!activeSpecialDesign,ship.level>unlocked&&!purchase,purchase?'SATIN AL':'SEÇ');
  }).join('');
  const grid=ui('eliteShipGrid'),scroll=ui('eliteShipGrid').parentElement!.scrollTop;
  const tab=(id:typeof shipyardTab,label:string)=>`<button data-shipyard-tab="${id}" class="${shipyardTab===id?'active':''}">${label}</button>`;
  grid.innerHTML=`<nav class="shipyard-tabs">${tab('elite','ELİT GEMİLER')}${tab('special','ÖZEL GEMİLER')}</nav>`+(shipyardTab==='special'?special:starter+cards);
  grid.querySelectorAll<HTMLButtonElement>('[data-shipyard-tab]').forEach(b=>b.onclick=()=>{shipyardTab=b.dataset.shipyardTab as typeof shipyardTab;grid.parentElement!.scrollTop=0;renderEliteShips();});
  ui('eliteShipDetail').hidden=true;ui('eliteShipDetail').innerHTML='';
  grid.parentElement!.scrollTop=scroll;
  grid.querySelectorAll<HTMLButtonElement>('[data-preview]').forEach(button=>button.onclick=()=>{
    previewShip=button.dataset.preview as ShipSelection|SpecialDesignId;
    grid.querySelectorAll<HTMLElement>('.elite-card').forEach(el=>el.classList.toggle('previewed',el.contains(button)));
    grid.querySelectorAll<HTMLButtonElement>('[data-preview]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  });
  grid.querySelectorAll<HTMLButtonElement>('[data-select-ship]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.selectShip!;
    if(id==='pirate-rage'){if(!designOwned){toast('Pirate Rage, Açılış Festivali\'nin son ödülü');return;}activeSpecialDesign=activeSpecialDesign?null:'pirate-rage';saveSpecialDesign(activeSpecialDesign);previewShip='pirate-rage';renderEliteShips();toast(activeSpecialDesign?'Pirate Rage tasarımı seçildi':'Geminin kendi görünümü seçildi');return;}
    if(id==='starter'){previewShip='starter';equipStarterShip();return;}
    const ship=ELITE_SHIPS.find(s=>s.id===id);if(!ship)return;
    if(ship.level===1&&!elitePurchased&&!ELITE_TEST_MODE){purchaseEliteOne();return;}
    if(ship.level>unlocked)return;
    activeSpecialDesign=null;saveSpecialDesign(null);const oldMax=effectiveMaxHp();activeEliteShip=ship.id;activeShip=ship.id;previewShip=ship.id;
    state.hp=Math.min(effectiveMaxHp(),Math.max(1,state.hp*effectiveMaxHp()/oldMax));fitCannonsToCapacity();saveAccount();renderEliteShips();updateUI();toast(`${ship.name} seçildi`);
  });
}
function openDevelopment(){pendingUpgrade=null;renderUpgrades();ui('developmentOverlay').classList.add('open');}
function closeDevelopment(){pendingUpgrade=null;ui('developmentOverlay').classList.remove('open');}
const DEV_BRANCHES:{name:string;icon:string;nodes:({kind:'pearl';id:UpgradeKind}|{kind:'point';id:TalentId})[]}[]=[
  {name:'Topçuluk',icon:'/assets/cannon-heavy-v1.webp',nodes:[{kind:'pearl',id:'damage'},{kind:'pearl',id:'range'},{kind:'pearl',id:'reload'},{kind:'point',id:'firemaster'},{kind:'point',id:'sapper'}]},
  {name:'Denizcilik',icon:'/assets/icon-ship-nav-v2.webp',nodes:[{kind:'pearl',id:'hull'},{kind:'pearl',id:'speed'},{kind:'pearl',id:'repair'},{kind:'point',id:'tough'},{kind:'point',id:'windcaller'}]},
  {name:'Yağma',icon:'/assets/icon-chest-v2.webp',nodes:[{kind:'point',id:'plunder'},{kind:'point',id:'scavenger'},{kind:'point',id:'bounty'}]},
];
function renderUpgrades(){
  const free=talentPoints(state.level)-spentPoints(crew);
  ui('upgradeList').innerHTML=`<p class="talent-points">İnci: <b>${fmt(state.pearls)}</b> · Uzmanlık puanı: <b>${Math.max(0,free)}</b> <small>İnci ile temel güçler, seviye başına kazanılan uzmanlık puanıyla özel uzmanlıklar açılır.</small>${spentPoints(crew)>0?'<button id="resetTalents">PUANLARI SIFIRLA · 5 İNCİ</button>':''}</p><div class="talent-branches">${DEV_BRANCHES.map(branch=>`<section class="talent-branch"><header><img src="${branch.icon}" alt=""/><h3>${branch.name}</h3></header>${branch.nodes.map(node=>{
    if(node.kind==='pearl'){const item=UPGRADES[node.id],level=upgrades[node.id],maxed=level>=10;return`<button class="talent pearl-node ${level?'owned':''} ${maxed?'maxed':''} ${pendingUpgrade===node.id?'selected':''}" data-upgrade="${node.id}" ${maxed?'disabled':''}><span class="talent-icon">${upgradeIcon(node.id)}</span><span><strong>${item.name}</strong><small>${item.effect} / seviye</small></span><b>${level}/10<em>${maxed?'AZAMİ':`◈ ${fmt(upgradeCost(node.id))}`}</em></b></button>`;}
    const t=TALENTS[node.id],rank=crew.talents[node.id]||0,maxed=rank>=t.max;return`<button class="talent ${rank?'owned':''} ${maxed?'maxed':''}" data-talent="${node.id}" ${free<=0||maxed?'disabled':''}><img src="${t.icon}" alt=""/><span><strong>${t.name}</strong><small>${t.per} / kademe</small></span><b>${rank}/${t.max}<em>1 PUAN</em></b></button>`;}).join('')}</section>`).join('')}</div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach(button=>button.onclick=()=>requestUpgrade(button.dataset.upgrade as UpgradeKind));
  document.querySelectorAll<HTMLButtonElement>('[data-talent]').forEach(b=>b.onclick=()=>{const id=b.dataset.talent as TalentId;if(talentPoints(state.level)-spentPoints(crew)<=0)return;crew.talents[id]=(crew.talents[id]||0)+1;refreshBonus();renderUpgrades();toast(`${TALENTS[id].name} ${crew.talents[id]}. kademe`);});
  const reset=document.getElementById('resetTalents');if(reset)reset.onclick=()=>{if(state.pearls<5){toast('Sıfırlamak için 5 İnci gerekli');return;}state.pearls-=5;crew.talents={};saveAccount();refreshBonus();renderUpgrades();updateUI();toast('Uzmanlık puanları iade edildi');};
  if(!pendingUpgrade){ui('upgradeConfirm').classList.remove('visible');ui('upgradeConfirm').innerHTML='';return;}
  const item=UPGRADES[pendingUpgrade],cost=upgradeCost(pendingUpgrade);ui('upgradeConfirm').classList.add('visible');ui('upgradeConfirm').innerHTML=`<div><strong>${item.name} yükseltmesini onaylıyor musun?</strong><span>${fmt(cost)} İnci harcanacak.</span></div><button id="confirmUpgrade">SATIN AL</button><button id="cancelUpgrade">VAZGEÇ</button>`;
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
  pendingUpgrade=null;saveAccount();renderUpgrades();updateUI();rewardNotice(`${UPGRADES[kind].name} geliştirildi · seviye ${upgrades[kind]}`,'shop');
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
  list.innerHTML=rows.map(r=>`<article class="market-item buy-row" data-row="${r.id}">${r.art}<div><h4>${r.name}</h4><details class="buy-details"><summary>Özellikler</summary><p>${r.desc}</p>${r.note?`<small>${r.note}</small>`:''}</details><em class="${r.unit.currency}">${r.unit.per&&r.unit.per>1?`${fmt(r.unit.per)} adet = `:''}${fmt(r.unit.amount)} ${CURRENCY_NAME[r.unit.currency]}</em></div><div class="buy-box"><input type="number" inputmode="numeric" min="1" max="${BUY_MAX}" placeholder="Adet" aria-label="${r.name} adedi"/><span class="buy-total">Toplam: —</span><button disabled>SATIN AL</button></div></article>`).join('');
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
  if(cur==='gold')state.gold-=cost;else state.pearls-=cost;row.give(qty);saveArsenal(arsenal);saveAccount();closeBuy();playCoins();renderQuickSlots();updateUI();row.after();rewardNotice(`${fmt(qty)} ${row.name} satın alındı · −${fmt(cost)} ${cur==='gold'?'altın':'inci'}`,'shop');
}
function openMarket(){renderMarket();ui('marketOverlay').classList.add('open');}
function closeMarket(){ui('marketOverlay').classList.remove('open');}
function renderMarket(){
  renderBuyRows('marketList',(Object.keys(AMMO_PRICES) as (keyof typeof AMMO_PRICES)[]).map(id=>({id,name:QUICK_ITEMS[id].name,art:`<div class="ammo-icon">${itemAsset(id)}<b>${quickCount(id)}</b></div>`,
    desc:id==='chain'?`${QUICK_ITEMS.chain.description} · Her gülle ${ELITE_POINTS_PER_BALL.chain.toLocaleString('tr-TR',{maximumFractionDigits:4})} EP`:`${SPECIAL_AMMO[id].description} · Her gülle ${ELITE_POINTS_PER_BALL[id].toLocaleString('tr-TR',{maximumFractionDigits:4})} EP`,unit:AMMO_PRICES[id],give:(n:number)=>{if(id==='chain')state.chainAmmo+=n;else arsenal[id]+=n;},after:renderMarket})));
}
function openSupply(){renderSupply();ui('supplyOverlay').classList.add('open');}
function closeSupply(){ui('supplyOverlay').classList.remove('open');}
function renderSupply(){
  renderBuyRows('supplyList',(Object.keys(SUPPLY_PRICES) as SupplyId[]).map(id=>({id,name:QUICK_ITEMS[id].name,art:`<div class="ammo-icon">${itemAsset(id)}<b>${fmt(arsenal[id])}</b></div>`,
    desc:QUICK_ITEMS[id].description,unit:SUPPLY_PRICES[id],give:(n:number)=>{arsenal[id]+=n;},after:renderSupply})));
}
let loadoutTab:'ammo'|'consumable'='ammo';
let pendingQuickItem:QuickItemId|null=null;
function quickCount(item:QuickItemId){if(item==='iron')return'∞';if(item==='chain')return fmt(state.chainAmmo);if(isSpecial(item)||item==='mine'||item==='powder'||item==='shield'||item==='speed'||item==='compass')return fmt(arsenal[item]);return'';}
function slotKey(index:number){return keyLabel(settings.binds[(index<AMMO_ROW?`ammo${index+1}`:`item${index-AMMO_ROW+1}`) as ActionId]);}
function itemAsset(item:QuickItemId){return rasterItemAssets[item]?`<img class="raster-item" src="${rasterItemAssets[item]}" alt="${QUICK_ITEMS[item].name}" draggable="false"/>`:`<i class="sprite icon-${QUICK_ITEMS[item].icon}"></i>`;}
function quickSlotHtml(item:QuickItemId|null,index:number){const row=index<AMMO_ROW?'ammo-row':'item-row',key=slotKey(index),k=key==='—'?'':key;
  return item?`<button class="quick-slot ${row} ${item===state.ammo||((item==='powder'||item==='shield')&&consumableOn[item])?'active':''}" data-quick-slot="${index}" data-quick-item="${item}" aria-label="${QUICK_ITEMS[item].name}">${itemAsset(item)}<b>${quickCount(item)}</b><kbd>${k}</kbd></button>`:`<button class="quick-slot ${row} empty" data-quick-slot="${index}" title="${index<AMMO_ROW?'Gülle yuvası':'Sarf yuvası'}"><span>+</span><kbd>${k}</kbd></button>`;}
// Sohbet düğmesi mobilde büyük gülle düğmesinin hemen üstünde durur (ölçekten bağımsız, gerçek konuma göre)
function placeChatAboveDock(){const chat=document.querySelector<HTMLElement>('.chat'),main=document.getElementById('mobMain');if(!chat||!main)return;
  requestAnimationFrame(()=>{const r=main.getBoundingClientRect();chat.style.left=`${Math.max(4,r.left+r.width/2-22)}px`;chat.style.bottom=`${innerHeight-r.top+22}px`;});}
addEventListener('resize',()=>{if(TOUCH)placeChatAboveDock();});
// Mobil dokunmatik: tüm gülle ve malzemeler tek sırada, soldaki büyük düğme seçili gülleyi gösterir ve sırayı açıp kapatır
let mobileTrayOpen=false;
function renderMobileDock(){if(!TOUCH)return;let dock=document.getElementById('mobileDock');
  if(!dock){ui('ammoBar').parentElement!.insertAdjacentHTML('beforeend','<div class="mobile-dock" id="mobileDock"><button class="mob-main" id="mobMain"></button><div class="mob-tray" id="mobTray"></div></div>');dock=ui('mobileDock');
    ui('mobMain').onclick=()=>{mobileTrayOpen=!mobileTrayOpen;renderMobileDock();};document.body.classList.add('touch-ui');}
  placeChatAboveDock();
  ui('mobMain').innerHTML=`${itemAsset(state.ammo)}<b>${quickCount(state.ammo)}</b>`;dock.classList.toggle('open',mobileTrayOpen);
  ui('mobTray').innerHTML=quickSlots.map((item,i)=>item?`<button class="${item===state.ammo||((item==='powder'||item==='shield')&&consumableOn[item])?'active':''}" data-mob-slot="${i}" data-quick-item="${item}" title="${QUICK_ITEMS[item].name}">${itemAsset(item)}<b>${quickCount(item)}</b></button>`:'').join('');
  ui('mobTray').querySelectorAll<HTMLButtonElement>('[data-mob-slot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.mobSlot),ammo=i<AMMO_ROW;useQuickSlot(i);if(ammo){mobileTrayOpen=false;renderMobileDock();}});}
function renderQuickSlots(){renderMobileDock();
  ui('ammoSlots').innerHTML=quickSlots.slice(0,AMMO_ROW).map((item,i)=>quickSlotHtml(item,i)).join('');
  ui('itemSlots').innerHTML=quickSlots.slice(AMMO_ROW).map((item,i)=>quickSlotHtml(item,i+AMMO_ROW)).join('');
  document.querySelectorAll<HTMLButtonElement>('.slot-bar [data-quick-slot]').forEach(slot=>{const index=Number(slot.dataset.quickSlot);slot.onclick=()=>{if(index<AMMO_ROW&&!pendingQuickItem){if(quickSlots[index])useQuickSlot(index);openAmmoPicker(index);}else useQuickSlot(index);};slot.ondragover=e=>e.preventDefault();slot.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/quick-item') as QuickItemId;if(item&&QUICK_ITEMS[item])assignQuickSlot(index,item);};});
}
// Gülle seçme sekmesi: numaralı gülle yuvasına dokununca tüm gülleler küçük bir sekmede açılır; seçilen gülle o yuvaya
// yerleşir ve atış güllesi olur (başka yuvadaysa iki yuva yer değiştirir).
let pickerSlot=-1;
function closeAmmoPicker(){pickerSlot=-1;ui('ammoPicker').classList.remove('open');}
function openAmmoPicker(index:number){
  const picker=ui('ammoPicker');if(pickerSlot===index&&picker.classList.contains('open')){closeAmmoPicker();return;}pickerSlot=index;
  const ammo=(Object.keys(QUICK_ITEMS) as QuickItemId[]).filter(id=>QUICK_ITEMS[id].category==='ammo');
  picker.innerHTML=`<small>${index+1}. YUVA</small><div>${ammo.map(id=>`<button class="${quickSlots[index]===id?'current':''}" data-pick="${id}" title="${QUICK_ITEMS[id].name}">${itemAsset(id)}<b>${quickCount(id)}</b></button>`).join('')}</div>`;
  picker.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach(b=>b.onclick=()=>{const id=b.dataset.pick as QuickItemId,old=quickSlots[index],from=quickSlots.indexOf(id);
    // seçilen gülle başka yuvadaysa iki yuva yer değiştirir; böylece hiçbir gülle bardan kaybolmaz
    if(old!==id){assignQuickSlot(index,id);if(from>=0&&old){quickSlots[from]=old;saveAccount();renderQuickSlots();}}useQuickSlot(index);closeAmmoPicker();});
  const bar=ui('ammoBar'),slot=bar.querySelector(`[data-quick-slot="${index}"]`) as HTMLElement,r=slot.getBoundingClientRect(),vertical=bar.classList.contains('vertical');
  picker.classList.toggle('side',vertical);picker.classList.add('open');const k=uiScale,pw=picker.offsetWidth*k,ph=picker.offsetHeight*k;
  let x=vertical?(r.left<innerWidth/2?r.right+8:r.left-pw-8):r.left+r.width/2-pw/2,y=vertical?r.top+r.height/2-ph/2:r.top-ph-8;
  if(!vertical&&y<4)y=r.bottom+8;
  picker.style.left=`${clamp(x,4,innerWidth-pw-4)/k}px`;picker.style.top=`${clamp(y,4,innerHeight-ph-4)/k}px`;}
addEventListener('pointerdown',e=>{if(pickerSlot<0)return;const t=e.target as HTMLElement;if(t.closest('#ammoPicker')||t.closest('#ammoBar [data-quick-slot]'))return;closeAmmoPicker();},true);
addEventListener('keydown',e=>{if(e.key==='Escape')closeAmmoPicker();});
function useQuickSlot(index:number){
  if(pendingQuickItem){assignQuickSlot(index,pendingQuickItem);return;}
  const item=quickSlots[index];if(!item){openLoadout(index<AMMO_ROW?'ammo':'consumable');return;}
  if(item==='iron'||item==='chain'){state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}
  else if(isSpecial(item)){if(arsenal[item]<=0){toast(`${QUICK_ITEMS[item].name} kalmadı — marketten alabilirsin`);}else{state.ammo=item;toast(`${QUICK_ITEMS[item].name} seçildi`);}}
  else if(item==='repairkit')toggleRepair();else if(item==='speed')activateAbility('speed');else if(item==='powder'||item==='shield')toggleConsumable(item);else if(item==='mine')dropMine();else if(item==='compass')useCompass();
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
  ui('worldInfo').innerHTML=`<div><span class="eyebrow">${m.key} · ${THEMES[m.tier].name}</span><h3>${m.name}</h3><p>${m.description}</p><dl><div><dt>Seviye</dt><dd>${m.tier}+</dd></div><div><dt>Gemiler</dt><dd>${npcs}</dd></div><div><dt>Canavar</dt><dd>${m.monsters.map(id=>MONSTERS[id].name).join(', ')}</dd></div><div><dt>Filo adası</dt><dd>${fleetOwner(m.key)==='player'?'<b class="safe">Senin</b>':'<b class="danger">Rakip</b>'}</dd></div></dl></div><button disabled>${m.key===currentMap?'ŞU AN BURADASIN':locked?`SEVİYE ${m.tier} GEREKLİ`:'KENARLARDAN GEÇİŞ'}</button>`;
}
function openQuestLog(){renderQuestLog();ui('questOverlay').classList.add('open');}
function closeQuestLog(){pendingCancel=null;ui('questOverlay').classList.remove('open');}
function openCaptainProfile(){renderNick();updateUI();renderBonusSummary();renderAchievements();saveAchievements(ach);ui('captainOverlay').classList.add('open');}
function refreshBonus(){bonus=computeBonus(crew);saveCrew(crew);renderBonusSummary();}
function renderBonusSummary(){
  const pct=(v:number)=>`${v>=1?'+':''}${Math.round((v-1)*100)}%`;
  ui('bonusSummary').innerHTML=`<span class="eyebrow">Geliştirme, uzmanlık ve tayfa bonusları</span><div><b>Hasar ${pct(bonus.damage*(1+upgrades.damage*.11))}</b><b>Dolum ${pct(Math.max(.6,1-upgrades.reload*.04)*bonus.reload)}</b><b>Menzil +${upgrades.range*18+bonus.range}</b><b>Hız ${pct(bonus.speed*(104+upgrades.speed*5)/104)}</b><b>Alınan hasar ${pct(bonus.taken)}</b><b>Tamir ${pct(bonus.repair)}</b></div><p>Elit ${earnedEliteLevel()} kalıcı toplamı: ${eliteBonusText(eliteBonus())||'henüz yok'}</p><p>Ana madalya koleksiyonu: ${bonusText(achBonus())||'17 madalya tamamlanınca +%5 hasar ve +%5 can'}</p>`;
}
// ---------------------------------------------------------------- Kaptan adı (nick): ilk ad ücretsiz, sonra inciyle ve 1 gün arayla
function renderNick(){
  ui('captainName').textContent=profile.nick.toLocaleUpperCase('tr');
  const wait=profile.named?profile.changedAt+NICK_COOLDOWN_MS-Date.now():0,cost=profile.named?NICK_CHANGE_COST:0,h=Math.ceil(wait/3600000);
  ui('captainNick').innerHTML=`<div><span>KAPTAN ADI</span><strong>${guild?`<em class="guild-tag">[${escapeHtml(guild.tag)}]</em>`:''}${escapeHtml(profile.nick)}</strong>${heroTitle?`<em class="hero-title">★ ${heroTitle.name} · ${Math.ceil((heroTitle.until-Date.now())/86_400_000)} gün</em>`:''}<small>${rankOf(state.level)} · ${profile.named?`Değiştirme ücreti ${NICK_CHANGE_COST} İnci · iki değişiklik arası 1 gün`:'İlk adını ücretsiz belirleyebilirsin'}</small></div>
    <div class="nick-form"><input id="nickInput" maxlength="${NICK_MAX}" placeholder="Yeni kaptan adı" ${wait>0?'disabled':''}/><button id="nickSave" ${wait>0?'disabled':''}>${wait>0?`${h} SAAT SONRA`:cost?`DEĞİŞTİR · ${fmt(cost)} İNCİ`:'ADI KAYDET'}</button></div>`;
  const btn=document.getElementById('nickSave') as HTMLButtonElement|null;if(!btn||wait>0)return;
  btn.onclick=()=>{const n=(ui('nickInput') as HTMLInputElement).value.trim(),err=nickError(n);if(err){toast(err);return;}if(n===profile.nick){toast('Bu zaten senin adın');return;}
    if(cost&&state.pearls<cost){toast(`Ad değiştirmek için ${fmt(cost)} inci gerekli`);return;}state.pearls-=cost;profile.nick=n;profile.changedAt=Date.now();profile.named=true;saveProfile(profile);saveAccount();updateUI();renderNick();rewardNotice(`Kaptan adı: ${n}${cost?` · −${fmt(cost)} inci`:''}`,'other');};
}
// Gemi altındaki ad: [FİLO TAG] nick, altında rütbe
// Kuşatma Kahramanı unvanı (bir hafta): ad altın çerçeveli bir levhada, altında unvan yazısı
let heroTitle=loadTitle();setInterval(()=>{heroTitle=loadTitle();},60000);
// Kaptan adı: kalın, altın degradeli ve koyu kahve kontürlü yazı ([TAG] ad). Oyuncu ve diğer kaptanlar aynı stili kullanır.
// rank: savaş rütbesi sırası (BATTLE_RANKS); rozeti adın sağında, yazıdan biraz büyük çizilir
const rankSheet=new Image();rankSheet.src=RANK_SHEET;
function drawRankBadge(c:CanvasRenderingContext2D,rank:number,x:number,y:number,size:number){if(!rankSheet.complete||!rankSheet.naturalWidth)return false;
  const i=rankIcon(rank),cell=rankSheet.naturalWidth/RANK_COLS;c.drawImage(rankSheet,(i%RANK_COLS)*cell,Math.floor(i/RANK_COLS)*cell,cell,cell,x,y-size/2,size,size);return true;}
function drawCaptainName(x:number,y:number,tag:string,nick:string,size=17,rank=-1){
  ctx.save();ctx.font=`900 ${size}px Inter, "Arial Black", sans-serif`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.lineJoin='round';
  const text=tag?`${tag} ${nick}`:nick,w=ctx.measureText(text).width,bs=rank>=0?Math.round(size*2.6):0,x0=x-(w+(bs?bs+3:0))/2;
  if(bs)drawRankBadge(ctx,rank,x0,y,bs);const tx=x0+(bs?bs+3:0);
  const g=ctx.createLinearGradient(0,y-size*.55,0,y+size*.55);g.addColorStop(0,'#fff6c2');g.addColorStop(.45,'#ffd34d');g.addColorStop(1,'#d98a16');
  ctx.shadowColor='#000c';ctx.shadowBlur=5;ctx.shadowOffsetY=1.5;ctx.lineWidth=Math.max(3,size*.26);ctx.strokeStyle='#2b1606';ctx.strokeText(text,tx,y);
  ctx.shadowColor='transparent';ctx.fillStyle=g;ctx.fillText(text,tx,y);
  ctx.restore();return w;}
// Güverte işareti: adın altında ortalı; kademesi batırılan rakip sayısına göre (sayı yazılmaz)
let rivalSinks=ELITE_TEST_MODE?Math.max(loadRivalSinks(),12_500):loadRivalSinks();
const insigniaImg=new Image();insigniaImg.src=INSIGNIA_SHEET;
// Telefonda 512 px'lik işaret tek adımda ~100 px'e inince kırık görünüyordu: her kademe için yarıya yarıya küçültülmüş kopyalar
// bir kez hazırlanır, çizimde ekrandaki gerçek piksel boyuna en yakın (ondan büyük) kopya seçilir.
const insigniaMips:HTMLCanvasElement[][]=[];
function insigniaLevels(t:number){let lv=insigniaMips[t];if(lv)return lv;lv=[];let src:CanvasImageSource=insigniaImg,sx=0,sy=t*INSIGNIA_H,w=INSIGNIA_W,h=INSIGNIA_H;
  while(w>=64){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;g.imageSmoothingQuality='high';g.drawImage(src,sx,sy,w*(src===insigniaImg?1:2),h*(src===insigniaImg?1:2),0,0,w,h);
    lv.push(c);src=c;sx=0;sy=0;w=Math.round(w/2);h=Math.round(h/2);}
  return insigniaMips[t]=lv;}
function drawInsignia(x:number,y:number,count:number,w=140){if(!insigniaImg.complete||!insigniaImg.naturalWidth)return;
  const t=insigniaTier(count),h=w*INSIGNIA_H/INSIGNIA_W,m=ctx.getTransform(),px=w*Math.hypot(m.a,m.b),lv=insigniaLevels(t);
  let pick=lv[0];for(const c of lv)if(c.width>=px)pick=c;
  ctx.save();ctx.imageSmoothingQuality='high';ctx.drawImage(pick,x-w/2,y,w,h);ctx.restore();}
function drawPlayerLabel(){
  const p=worldToScreen(player),y=p.y+60,tag=guild?`[${guild.tag}]`:'',nick=profile.nick;
  ctx.save();ctx.font='900 17px Inter';const w=ctx.measureText(tag?`${tag} ${nick}`:nick).width;
  if(heroTitle){const bw=w+24,h=24;ctx.beginPath();ctx.roundRect(p.x-bw/2,y-h/2,bw,h,12);const g=ctx.createLinearGradient(0,y-h/2,0,y+h/2);g.addColorStop(0,'#5a3c0ccc');g.addColorStop(1,'#2a1a04cc');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#ffd27a';ctx.stroke();
    ctx.font='800 10px Cinzel, serif';ctx.textAlign='center';ctx.fillStyle='#ffd27a';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText(`★ ${heroTitle.name.toLocaleUpperCase('tr')} ★`,p.x,y+20);}
  ctx.restore();drawCaptainName(p.x,y,tag,nick,17,battleRank(state.battlePoints).index);drawInsignia(p.x,y+(heroTitle?22:9),rivalSinks);
}
// ---------------------------------------------------------------- Filo: hazine, bağış ve kule dikme
function openGuild(){renderGuild();ui('guildOverlay').classList.add('open');}
function closeGuild(){ui('guildOverlay').classList.remove('open');focusedFoundation=null;}
function ownedFleetIslands(){return(Object.keys(MAPS) as MapKey[]).filter(k=>MAPS[k].tier>=2&&fleetOwner(k)==='player');}
function renderGuild(){
  const panel=ui('guildPanel');
  if(!guild){panel.innerHTML=`<div class="guild-create"><p>Henüz bir filon yok. Filo kurduğunda <b>filo başkanı</b> sen olursun. Filo üyeleri hazineye <b>inci bağışlar</b>. Başkan da bu hazineyle filo adalarındaki boş kaidelere kule diker.</p><div class="guild-create-row"><label>Kısaltma (tag)<input id="guildTag" maxlength="${GUILD_TAG_MAX}" placeholder="Ör. TC★"/></label><label>Filo adı<input id="guildName" maxlength="${GUILD_NAME_MAX}" placeholder="Ör. Türk Korsanları"/></label></div><small class="guild-hint">Kısaltma gemi adının önünde görünür: <b>[TC★]${escapeHtml(profile.nick)}</b></small><button id="guildCreate">FİLO KUR</button></div>`;
    const tagInput=ui('guildTag') as HTMLInputElement;tagInput.oninput=()=>{tagInput.value=tagInput.value.toLocaleUpperCase('tr').replace(/\*/g,'★');};
    ui('guildCreate').onclick=()=>{const name=(ui('guildName') as HTMLInputElement).value.trim(),tag=tagInput.value.trim(),te=tagError(tag);if(te){toast(te);return;}if(name.length<3){toast('Filo adı en az 3 harf olmalı');return;}const g:Guild={name,tag,role:'leader',treasury:0,donated:0,created:Date.now(),towers:{}};guild=g;for(const k of ownedFleetIslands())islandSlots(g,k);saveGuild(g);setupFleetIsland();rewardNotice(`[${tag}] ${name} filosu kuruldu`,'other');renderGuild();};return;}
  const g=guild,islands=ownedFleetIslands(),map=mapDef(),here=hasFleetIsland()?map.fleet.name:'',allowed=canBuild(g.role);
  // Kule resmi: tek tip filo kulesi
  const art=(_slot:number,_type:TowerType,ghost=false)=>`<i class="tower-art ${ghost?'ghost':''}"></i>`;
  const islandHtml=islands.length?islands.map(k=>{const m=MAPS[k],slots=islandSlots(g,k),cost=towerTypeCost(m.tier,buildType),built=slots.filter(Boolean).length;
    return`<article class="guild-island"><header><div><span class="eyebrow">${m.key} · Seviye ${m.tier}</span><h4>${m.fleet.name}</h4></div><b>${built} / ${TOWER_SLOTS} kule</b></header><div class="tower-slots">${slots.map((t,i)=>t?`<div class="tower-slot built">${art(i,t.type)}<small>${TOWER_TYPES[t.type].name}</small><em><span style="width:${Math.round(t.hp/t.maxHp*100)}%"></span></em></div>`:(ruin=>ruin?`<button class="tower-slot empty ruined" disabled title="Yıkılan kule 1 saat dolmadan yeniden dikilemez">${art(i,buildType,true)}<small>Kaide ${i+1} · yıkık</small><b>${ruinLabel(ruin)} sonra</b></button>`:`<button class="tower-slot empty" data-build="${k}:${i}" ${!allowed||g.treasury<cost?'disabled':''}>${art(i,buildType,true)}<small>Kaide ${i+1}</small><b>${allowed?`DİK · ${fmt(cost)} İnci`:'YETKİ YOK'}</b></button>`)(ruinLeft(towerRuins,k,i))).join('')}</div></article>`;}).join('')
    :`<p class="guild-empty">Filonun henüz bir adası yok. Adalar 5. seviye ve üstü denizlerdedir. Bir adanın bütün kulelerini yıkınca ada filona katılır ve kaideleri boşalır.</p>`;
  const testClaim=FLEET_TEST_ENTRY&&hasFleetIsland()&&fleetOwner()!=='player'?`<button class="guild-test" id="guildClaim">TEST: ${here} adasını filona kat</button>`:'';
  const testRole=FLEET_TEST_ENTRY?`<label class="guild-test-role">TEST · rolün <select id="guildRole">${(Object.keys(ROLE_NAMES) as GuildRole[]).map(r=>`<option value="${r}" ${g.role===r?'selected':''}>${ROLE_NAMES[r]}</option>`).join('')}</select></label>`:'';
  panel.innerHTML=`<div class="guild-head"><div><span class="eyebrow">Filo</span><h3><em class="guild-tag">[${escapeHtml(g.tag)}]</em> ${escapeHtml(g.name)}</h3><small>${ROLE_NAMES[g.role]}: ${escapeHtml(profile.nick)} (sen) · Üye: 1</small></div><div class="guild-treasury"><span>FİLO HAZİNESİ</span><strong><i class="sprite icon-pearl"></i>${fmt(g.treasury)} İnci</strong><small>Senin bağışın: ${fmt(g.donated)} İnci</small></div></div>
    <div class="guild-members"><span class="eyebrow">Filo üyeleri ve yetkiler</span><div class="member-row"><b>[${escapeHtml(g.tag)}]${escapeHtml(profile.nick)}</b><em class="role ${g.role}">${ROLE_NAMES[g.role]}</em><small>Bağış: ${fmt(g.donated)} İnci</small></div><p>Kule dikme yetkisi yalnızca <b>Filo Başkanı</b> ve <b>Başkan Yardımcısı</b>ndadır. Başkan, üyelerden birini yardımcı atar. Diğer üyeler hazineye inci bağışlar.</p>${testRole}</div>
    <div class="guild-donate"><span>İnci bağışla <small>(elindeki: ${fmt(state.pearls)})</small></span>${[10,50,100].map(n=>`<button data-donate="${n}" ${state.pearls<n?'disabled':''}>+${n}</button>`).join('')}<input id="donateAmount" type="number" min="1" max="${state.pearls}" placeholder="Miktar"/><button id="donateCustom">BAĞIŞLA</button></div>
    ${testClaim}<div class="guild-islands">${islandHtml}</div>`;
  const donate=(n:number)=>{n=Math.floor(n);if(!(n>0)){toast('Geçerli bir miktar gir');return;}if(state.pearls<n){toast('Yeterli incin yok');return;}state.pearls-=n;g.treasury+=n;g.donated+=n;saveGuild(g);saveAccount();updateUI();playCoins();rewardNotice(`Filo hazinesine ${fmt(n)} inci bağışlandı`,'other');renderGuild();};
  // Restore the selected foundation after type changes, donations and construction.
  panel.querySelectorAll<HTMLElement>('.guild-island').forEach((article,index)=>{
    article.querySelectorAll<HTMLElement>('.tower-slot').forEach((slot,i)=>{
      const key=`${islands[index]}:${i}`;slot.dataset.foundation=key;
      slot.classList.toggle('chosen-foundation',key===focusedFoundation);
    });
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-donate]').forEach(b=>b.onclick=()=>donate(Number(b.dataset.donate)));
  ui('donateCustom').onclick=()=>donate(Number((ui('donateAmount') as HTMLInputElement).value));
  panel.querySelectorAll<HTMLButtonElement>('[data-build]').forEach(b=>b.onclick=()=>{if(!canBuild(g.role)){toast('Kule dikme yetkisi yalnızca başkan ve yardımcısında');return;}
    const [k,i]=b.dataset.build!.split(':') as [MapKey,string],m=MAPS[k],type=buildType,cost=towerTypeCost(m.tier,type),slots=islandSlots(g,k);
    if(slots[+i]){toast('Bu kaidede zaten bir kule var');renderGuild();return;}
    const ruin=ruinLeft(towerRuins,k,+i);if(ruin){toast(`Bu kaidedeki kule yıkıldı; ${ruinLabel(ruin)} sonra yeniden dikilebilir`);renderGuild();return;}
    if(g.treasury<cost){toast(`Filo hazinesinde ${fmt(cost)} inci gerekli`);return;}g.treasury-=cost;const hp=fleetTower(m.tier).hp;slots[+i]={hp,maxHp:hp,type};saveGuild(g);if(k===currentMap)setupFleetIsland();playCoins();rewardNotice(`${m.fleet.name}: ${+i+1}. kaideye ${TOWER_TYPES[type].name} dikildi · −${fmt(cost)} inci`,'shop');renderGuild();});
  const role=document.getElementById('guildRole') as HTMLSelectElement|null;if(role)role.onchange=()=>{g.role=role.value as GuildRole;saveGuild(g);renderGuild();toast(`Test: rolün ${ROLE_NAMES[g.role]}`);};
  const claim=document.getElementById('guildClaim');if(claim)claim.onclick=()=>{fleetOwners[currentMap]='player';saveFleetOwners(fleetOwners);clearRuins(towerRuins,currentMap);g.towers[currentMap]=Array(TOWER_SLOTS).fill(null);saveGuild(g);enemies.splice(0,enemies.length,...enemies.filter(e=>!e.tower));setupFleetIsland();rewardNotice(`Test · ${map.fleet.name} filona katıldı`,'other');renderGuild();};
}
function openCrew(){renderCrew();ui('crewOverlay').classList.add('open');}
function closeCrew(){ui('crewOverlay').classList.remove('open');}
function renderCrew(){
  const slots=officerSlots(state.level);
  ui('crewPanel').innerHTML=`<p class="talent-points">Görevdeki subaylar: <b>${crew.active.length} / ${slots}</b> <small>Yuvalar 3. ve 6. seviyede açılır. Yalnızca görevdeki subaylar bonus verir.</small></p><div class="officer-grid">${(Object.keys(OFFICERS) as OfficerId[]).map(id=>{const o=OFFICERS[id],rank=crew.officers[id]||0,active=crew.active.includes(id),cost=officerCost(rank),maxed=rank>=OFFICER_MAX_RANK;
    return`<article class="officer ${active?'active':''} ${rank?'hired':''}"><img src="${o.icon}" alt=""/><div><span>${o.title}</span><h4>${o.name}</h4><small>${o.per} / rütbe</small><i>${'★'.repeat(rank)}${'☆'.repeat(OFFICER_MAX_RANK-rank)}</i></div><footer>${rank?`<button data-officer-toggle="${id}">${active?'GÖREVDEN AL':'GÖREVE AL'}</button>`:''}<button data-officer-rank="${id}" ${maxed?'disabled':''}>${maxed?'AZAMİ RÜTBE':rank?`RÜTBE ↑ ${fmt(cost)} ALTIN`:`İŞE AL · ${fmt(cost)} ALTIN`}</button></footer></article>`;}).join('')}</div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-officer-rank]').forEach(b=>b.onclick=()=>{const id=b.dataset.officerRank as OfficerId,rank=crew.officers[id]||0,cost=officerCost(rank);if(rank>=OFFICER_MAX_RANK)return;if(state.gold<cost){toast('Yeterli altının yok');return;}state.gold-=cost;crew.officers[id]=rank+1;if(!rank&&crew.active.length<officerSlots(state.level))crew.active.push(id);saveAccount();refreshBonus();renderCrew();updateUI();rewardNotice(`${OFFICERS[id].name} ${rank?`${rank+1}. rütbeye yükseldi`:'tayfaya katıldı'}`,'shop');});
  document.querySelectorAll<HTMLButtonElement>('[data-officer-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.officerToggle as OfficerId,i=crew.active.indexOf(id);if(i>=0)crew.active.splice(i,1);else{if(crew.active.length>=officerSlots(state.level)){toast('Boş subay yuvası yok');return;}crew.active.push(id);}refreshBonus();renderCrew();});
}
// Profilde rütbe madalyaları: kazanılanlar parlak, sıradaki vurgulu, kalanlar soluk (SP eşiğiyle)
function renderRankMedals(){const cur=battleRank(state.battlePoints).index;
  ui('rankMedalSummary').textContent=`${cur+1} / ${BATTLE_RANKS.length} madalya · ${BATTLE_RANKS[cur].name}`;
  ui('rankMedals').innerHTML=BATTLE_RANKS.map((r,i)=>`<div class="rank-medal ${i<=cur?'earned':''} ${i===cur+1?'next':''}" title="${r.name} · ${fmt(r.sp)} SP">${rankBadgeHtml(i)}<b>${r.name}</b><small>${fmt(r.sp)} SP</small></div>`).join('');}
// HTML içinde rütbe rozeti (profil, sıralama)
function rankBadgeHtml(rank:number){const i=rankIcon(rank),rows=Math.ceil(RANK_ICONS/RANK_COLS);
  return`<i class="rank-badge" style="background-image:url(${RANK_SHEET});background-size:${RANK_COLS*100}% ${rows*100}%;background-position:${(i%RANK_COLS)/(RANK_COLS-1)*100}% ${Math.floor(i/RANK_COLS)/Math.max(1,rows-1)*100}%"></i>`;}
// ---------------------------------------------------------------- Seyir defteri
// Yeniden eskiye; gün değişince tarih başlığı. Üstte bugünün özeti (batırma, TP, altın, SP).
let logFilter:LogKind|'all'='all';
function renderLogbook(){const sum=daySummary(logbook),rows=logbook.filter(e=>logFilter==='all'||e.kind===logFilter).slice().reverse();
  const day=(t:number)=>new Date(t).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}),time=(t:number)=>new Date(t).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  let last='',list='';for(const e of rows){const d=day(e.t);if(d!==last){list+=`<h4 class="log-day">${d}</h4>`;last=d;}list+=`<div class="log-row ${e.kind}"><time>${time(e.t)}</time><span>${escapeHtml(e.text)}</span></div>`;}
  ui('logPanel').innerHTML=`<div class="log-summary"><span>BUGÜN</span><b>${fmt(sum.sinks)} batırma</b><b>+${fmt(sum.xp)} TP</b><b>+${fmt(sum.gold)} altın</b><b>+${fmt(sum.sp)} SP</b></div>
    <div class="rank-tabs log-tabs">${LOG_KINDS.map(k=>`<button data-log-kind="${k.id}" class="${k.id===logFilter?'active':''}">${k.name}</button>`).join('')}</div>
    <div class="log-list">${list||'<p class="rank-empty">Henüz kayıt yok. Batırdığın gemiler, kazançların ve alışverişlerin burada görünür.</p>'}</div>`;
  ui('logPanel').querySelectorAll<HTMLButtonElement>('[data-log-kind]').forEach(b=>b.onclick=()=>{logFilter=b.dataset.logKind as typeof logFilter;renderLogbook();});}
function openLogbook(){renderLogbook();ui('logOverlay').classList.add('open');}
function closeLogbook(){ui('logOverlay').classList.remove('open');}
// ---------------------------------------------------------------- Sıralamalar
// Sunucu gelene kadar tablo bu tarayıcıdaki kaptandan (test modunda test kaptanları da) kurulur.
let rankBoard:BoardId='xp',rankPageNo=0;
const TEST_RANKERS:RankPlayer[]=[
  {nick:'ADM_AHMET',tag:'TC★',fleet:'Türk Korsanları',level:8,xp:4_200_000,ep:3_100_000,sp:61_000,npc:8_400,monster:410,boss:14,treasure:31},
  {nick:'ADM_YASİN',tag:'TC★',fleet:'Türk Korsanları',level:7,xp:2_900_000,ep:1_450_000,sp:23_500,npc:5_100,monster:260,boss:7,treasure:18},
  {nick:'ADM_DOGAN',tag:'KRK',fleet:'Kara Kartallar',level:6,xp:900_000,ep:640_000,sp:9_800,npc:3_300,monster:120,boss:3,treasure:9},
];
function rankData(){const me:RankPlayer={nick:profile.nick,tag:guild?.tag??null,fleet:guild?.name??null,level:state.level,xp:state.fame,ep:state.elitePoints,sp:state.battlePoints,npc:ach.stats.npc,monster:ach.stats.monster,boss:ach.stats.boss,treasure:ach.stats.treasure,me:true};
  const players=[me,...(ELITE_TEST_MODE?TEST_RANKERS:[])],fleets:RankFleet[]=[];
  for(const p of players){if(!p.tag||!p.fleet)continue;let f=fleets.find(x=>x.tag===p.tag);if(!f){f={tag:p.tag,name:p.fleet,members:[]};fleets.push(f);}f.members.push(p);if(p.me)f.me=true;}
  return{players,fleets};}
// Her sayfada 100 sıra; liste pencere içinde kayar, altta sayfa düğmeleri ve "Sıram" kısayolu
function renderRanks(){const {players,fleets}=rankData(),board=BOARDS.find(b=>b.id===rankBoard)!,all=rankRows(rankBoard,players,fleets),pg=rankPage(all,rankPageNo);rankPageNo=pg.page;
  const tabs=(fleet:boolean)=>BOARDS.filter(b=>b.fleet===fleet).map(b=>`<button data-board="${b.id}" class="${b.id===rankBoard?'active':''}">${b.name}</button>`).join('');
  const mine=all.findIndex(r=>r.me),from=pg.page*RANK_PAGE_SIZE;
  const row=(r:RankRow)=>`<div class="rank-row ${r.me?'me':''} ${r.rank<=3?'top'+r.rank:''}"><b>${r.rank}</b><span><span>${r.tag?`<em class="guild-tag">[${escapeHtml(r.tag)}]</em>`:''}${escapeHtml(r.name)}${r.sp!==undefined?rankBadgeHtml(battleRank(r.sp).index):''}${r.me?' <i>(sen)</i>':''}</span><small>${escapeHtml(r.sub)}</small></span><strong>${fmt(r.score)} <small>${board.unit}</small></strong></div>`;
  ui('rankPanel').innerHTML=`<div class="rank-tabs"><span>OYUNCU</span>${tabs(false)}</div><div class="rank-tabs"><span>FİLO</span>${tabs(true)}</div>
    <p class="quest-intro">${board.desc}. ${ELITE_TEST_MODE?'Test modu: örnek kaptanlar listede. ':''}Sunucu açılınca bütün oyuncular burada sıralanacak.</p>
    <div class="rank-table" id="rankTable">${pg.rows.length?pg.rows.map(row).join(''):`<p class="rank-empty">${board.fleet?'Henüz sıralamada filo yok. Bir filo kur ya da bir filoya katıl.':'Henüz sıralamada kimse yok.'}</p>`}</div>
    <div class="rank-pager"><button data-page="${pg.page-1}" ${pg.page<=0?'disabled':''}>‹ ÖNCEKİ</button><span>Sayfa ${pg.page+1} / ${pg.pages}${all.length?` · ${fmt(from+1)}–${fmt(from+pg.rows.length)}. sıra`:''}</span>${mine>=0?`<button data-page="${Math.floor(mine/RANK_PAGE_SIZE)}" class="rank-mine">SIRAM: ${fmt(all[mine].rank)}</button>`:''}<button data-page="${pg.page+1}" ${pg.page>=pg.pages-1?'disabled':''}>SONRAKİ ›</button></div>`;
  ui('rankPanel').querySelectorAll<HTMLButtonElement>('[data-board]').forEach(b=>b.onclick=()=>{rankBoard=b.dataset.board as BoardId;rankPageNo=0;renderRanks();});
  ui('rankPanel').querySelectorAll<HTMLButtonElement>('[data-page]').forEach(b=>b.onclick=()=>{rankPageNo=Number(b.dataset.page);renderRanks();
    const me=ui('rankTable').querySelector<HTMLElement>('.rank-row.me');if(b.classList.contains('rank-mine')&&me)me.scrollIntoView({block:'center'});else ui('rankTable').scrollTop=0;});}
function openRanks(){rankPageNo=0;renderRanks();ui('rankOverlay').classList.add('open');}
function closeRanks(){ui('rankOverlay').classList.remove('open');}
// ---------------------------------------------------------------- Kupon kodu
const redeemedCoupons=loadRedeemed();
function openCoupon(){(ui('couponInput') as HTMLInputElement).value='';ui('couponResult').textContent='';ui('couponResult').className='coupon-result';ui('couponOverlay').classList.add('open');setTimeout(()=>(ui('couponInput') as HTMLInputElement).focus(),50);}
function closeCoupon(){ui('couponOverlay').classList.remove('open');}
async function redeemCoupon(){const input=ui('couponInput') as HTMLInputElement,out=ui('couponResult'),r=await redeem(input.value,redeemedCoupons,dayKey());
  if(!r.ok){out.textContent=r.error;out.className='coupon-result bad';return;}
  const w=r.coupon.reward;state.pearls+=w.pearls??0;state.gold+=w.gold??0;state.fame+=w.xp??0;state.elitePoints+=w.ep??0;if(w.vipDays){vipUntil=Math.max(vipUntil,Date.now())+w.vipDays*VIP_DAY_MS;saveVipUntil(vipUntil);}
  saveRedeemed(redeemedCoupons);saveAccount();updateUI();playCoins();input.value='';out.textContent=`Kupon kullanıldı: ${rewardText(w)}`;out.className='coupon-result ok';rewardNotice(`Kupon kullanıldı · ${rewardText(w)}`);}
function openSettings(){rebinding=null;renderSettings();ui('settingsOverlay').classList.add('open');}
function closeSettings(){rebinding=null;ui('settingsOverlay').classList.remove('open');}
function refreshBindHints(){document.querySelectorAll<HTMLElement>('[data-bind]').forEach(el=>{el.textContent=keyLabel(settings.binds[el.dataset.bind as ActionId]);});}
function renderSettings(){
  const groups=[...new Set(ACTIONS.map(a=>a.group))];
  ui('settingsPanel').innerHTML=`<section class="settings-block"><h3>SES</h3><div class="sound-row"><button id="soundToggle" class="${settings.sound?'on':''}">${settings.sound?'SES AÇIK':'SES KAPALI'}</button><label>Efekt sesi<input id="soundVolume" type="range" min="0" max="100" value="${Math.round(settings.volume*100)}" ${settings.sound?'':'disabled'}/></label><label>Müzik sesi<input id="musicVolume" type="range" min="0" max="100" value="${Math.round(settings.music*100)}" ${settings.sound?'':'disabled'}/></label></div></section><section class="settings-block"><h3>GÖRÜNÜM</h3><label class="settings-check"><input type="checkbox" id="hideOthersInsignia" ${settings.hideOthersInsignia?'checked':''}/><span>Diğer oyuncuların güverte işaretlerini ve rütbe rozetlerini gizle</span></label></section>
  <section class="settings-block keybinds-block"><h3>KLAVYE KISAYOLLARI <button id="resetBinds">VARSAYILANA DÖN</button></h3><p>Değiştirmek istediğin eyleme tıkla, sonra yeni tuşa bas. ESC iptal eder. Ok tuşları her zaman haritayı kaydırmak için de çalışır.</p>${groups.map(g=>`<h4>${g}</h4><div class="bind-grid">${ACTIONS.filter(a=>a.group===g).map(a=>`<button class="bind ${rebinding===a.id?'listening':''}" data-rebind="${a.id}"><span>${a.label}</span><kbd>${rebinding===a.id?'TUŞA BAS…':keyLabel(settings.binds[a.id])}</kbd></button>`).join('')}</div>`).join('')}</section>`;
  ui('soundToggle').onclick=()=>{settings.sound=!settings.sound;setAudio(settings.sound,settings.volume,settings.music);saveSettings(settings);renderSettings();};
  (ui('soundVolume') as HTMLInputElement).oninput=e=>{settings.volume=Number((e.target as HTMLInputElement).value)/100;setAudio(settings.sound,settings.volume,settings.music);saveSettings(settings);};
  (ui('musicVolume') as HTMLInputElement).oninput=e=>{settings.music=Number((e.target as HTMLInputElement).value)/100;setAudio(settings.sound,settings.volume,settings.music);saveSettings(settings);};
  (ui('hideOthersInsignia') as HTMLInputElement).onchange=e=>{settings.hideOthersInsignia=(e.target as HTMLInputElement).checked;saveSettings(settings);};
  ui('resetBinds').onclick=()=>{settings.binds={...DEFAULT_BINDS};saveSettings(settings);renderQuickSlots();refreshBindHints();renderSettings();toast('Kısayollar varsayılana döndü');};
  document.querySelectorAll<HTMLButtonElement>('[data-rebind]').forEach(b=>b.onclick=()=>{rebinding=b.dataset.rebind as ActionId;renderSettings();});
}
// ---- Kaptan & Muço (ayarlar)
// Test modunda örnek istekler (sunucu gelene kadar arayüzü denemek için)
if(ELITE_TEST_MODE&&!mentorship.requests.length&&!mentorship.apprentices.length){mentorship.requests=[{nick:'Acemi_Deniz',level:2},{nick:'TayfaAli',level:4},{nick:'MiçoKaan',level:5}];saveMentorship(mentorship);}
function openMentorship(){renderMentorship();ui('mentorOverlay').classList.add('open');}
function closeMentorship(){ui('mentorOverlay').classList.remove('open');}
function renderMentorship(){ui('mentorPanel').innerHTML=mentorshipHtml();bindMentorship();}
function mentorshipHtml(){
  const m=mentorship,lv=state.level,esc=escapeHtml;
  const role=m.mentor?`Muço · Ustan: <b>${esc(m.mentor.nick)}</b> (Sv. ${m.mentor.level})`:canMentor(lv)?`Usta Kaptan · ${m.apprentices.length}/${MAX_APPRENTICES} muço${m.graduates?` · ${m.graduates} mezun`:''}`:apprenticeBlock(m,lv)??'Bir usta kaptana çıraklık isteği gönderebilirsin';
  const reqs=m.requests.length?m.requests.map(r=>{const block=pairBlock(m,lv,r);return`<div class="mate-row"><span><b>${esc(r.nick)}</b> · Sv. ${r.level}</span>${block?`<em title="${esc(block)}">${esc(block)}</em>`:''}<span class="mate-btns"><button data-mate-accept="${esc(r.nick)}" ${block?'disabled':''}>KABUL</button><button data-mate-reject="${esc(r.nick)}">REDDET</button></span></div>`;}).join(''):'<p class="mate-empty">Bekleyen çıraklık isteği yok.</p>';
  const apps=m.apprentices.length?m.apprentices.map(a=>`<div class="mate-row"><span><b>${esc(a.nick)}</b> · Sv. ${a.level}</span><span class="mate-btns"><button data-mate-remove="${esc(a.nick)}">ÇIKAR</button></span></div>`).join(''):'<p class="mate-empty">Henüz muçon yok.</p>';
  // Ödüller sandık olarak: kilitli / hazır (parlar) / alındı; sandığa tıklayınca içeriği ve TALEP ET görünür
  const chest=(key:string,lvl:number,g:{gold:number;pearls:number},title:string,locked:string)=>{const pend=m.pending.some(r=>r.key===key),done=m.claimed.includes(key);
    return`<button class="mate-chest ${done?'done':pend?'ready':'locked'}" data-chest="${esc(key)}" data-chest-title="${esc(title)}" data-chest-gold="${g.gold}" data-chest-pearls="${g.pearls}" data-chest-state="${done?'done':pend?'ready':'locked'}" data-chest-locked="${esc(locked)}" title="${esc(title)}"><img src="/assets/icon-chest-v2.webp" alt="" draggable="false"/><b>${lvl}</b>${done?'<i>✓</i>':''}</button>`;};
  // Yalnız kazanılmış (talep edilmemiş) sandıklar listelenir; alınan sandık listeden düşer
  const earned=m.pending.map(r=>{const lv=Number(r.key.slice(r.key.lastIndexOf('-')+1))||0;return chest(r.key,lv,r,r.label,'');}).join('');
  const rewards=`<h4>Kazanılan sandıklar${m.claimed.length?` <small>(${m.claimed.length} sandık alındı)</small>`:''}</h4>${earned?`<div class="mate-chests">${earned}</div><div class="mate-chest-info" id="mateChestInfo"><p class="mate-empty">İçinde ne olduğunu görmek için bir sandığa dokun.</p></div>`:'<p class="mate-empty">Muço ya da muçon her seviye atladığında buraya bir ödül sandığı düşer.</p>'}`;
  return `<p class="mate-role">${role}</p>${canMentor(lv)&&!m.mentor?`<h4>Muçoların</h4>${apps}<h4>Çıraklık istekleri</h4>${reqs}`:''}${rewards}`;
}
function bindMentorship(){
  const claim=(key:string)=>{const r=claimReward(mentorship,key);if(!r)return;state.gold+=r.gold;state.pearls+=r.pearls;saveMentorship(mentorship);saveAccount();updateUI();rewardNotice(`${r.label} · +${r.gold.toLocaleString('tr-TR')} altın · +${r.pearls.toLocaleString('tr-TR')} inci`,'gain');renderMentorship();};
  document.querySelectorAll<HTMLButtonElement>('[data-chest]').forEach(b=>b.onclick=()=>{const d=b.dataset,info=ui('mateChestInfo');
    document.querySelectorAll('.mate-chest.picked').forEach(x=>x.classList.remove('picked'));b.classList.add('picked');
    const st=d.chestState==='done'?'<i class="got">ÖDÜL ALINDI</i>':d.chestState==='ready'?`<button data-mate-claim="${escapeHtml(d.chest!)}">TALEP ET</button>`:`<i>${escapeHtml(d.chestLocked!)}</i>`;
    info.innerHTML=`<img src="/assets/icon-chest-v2.webp" alt=""/><div><b>${escapeHtml(d.chestTitle!)}</b><span>◈ ${Number(d.chestGold).toLocaleString('tr-TR')} altın · ${Number(d.chestPearls).toLocaleString('tr-TR')} inci</span></div>${st}`;
    info.querySelector<HTMLButtonElement>('[data-mate-claim]')?.addEventListener('click',()=>claim(d.chest!));});
  document.querySelectorAll<HTMLButtonElement>('[data-mate-accept]').forEach(b=>b.onclick=()=>{const n=b.dataset.mateAccept!,err=acceptRequest(mentorship,state.level,n);if(err){toast(err);return;}saveMentorship(mentorship);toast(`${n} artık muçon`);renderMentorship();});
  document.querySelectorAll<HTMLButtonElement>('[data-mate-reject]').forEach(b=>b.onclick=()=>{rejectRequest(mentorship,b.dataset.mateReject!);saveMentorship(mentorship);renderMentorship();});
  document.querySelectorAll<HTMLButtonElement>('[data-mate-remove]').forEach(b=>b.onclick=()=>{const n=b.dataset.mateRemove!;if(!confirm(`${n} muçoluktan çıkarılsın mı?`))return;removeApprentice(mentorship,n);saveMentorship(mentorship);toast(`${n} muçoluktan çıkarıldı`);renderMentorship();});
}
function closeCaptainProfile(){ui('captainOverlay').classList.remove('open');}
const tierQuests=()=>QUESTS.filter(q=>q.map===currentMap);
const questUnit=(q:QuestDef)=>q.kind==='npc'?'Gemi':q.kind==='monster'?'Canavar':q.kind==='sparkle'?'Pırıltı':'Sandık';
function renderQuestLog(){
  ui('questList').innerHTML=levelQuestHtml()+`<p class="quest-tier">${currentMap} · ${mapDef().name}</p>`+tierQuests().map((quest,index)=>{
    const cooling=(questCooldownUntil[quest.id]??0)>Date.now(),active=state.activeQuest===quest.id,progress=questProgress[quest.id]??0;
    const status=cooling?cooldownText(questCooldownUntil[quest.id]):active?'İPTAL':progress>0?'DEVAM':'BAŞLAT';
    const action=pendingCancel===quest.id?`<div class="cancel-confirm"><strong>Emin misin?</strong><button data-confirm-cancel="${quest.id}">İPTALİ ONAYLA</button><button data-keep-quest="${quest.id}">VAZGEÇ</button></div>`:`<button data-quest="${quest.id}" ${cooling?'disabled':''}>${status}</button>`;
    return `<article class="quest-entry ${active?'active':''} ${cooling?'completed':''}"><div class="quest-number">${String(index+1).padStart(2,'0')}</div><div class="quest-copy"><span>${cooling?'BEKLEMEDE':quest.kind==='npc'?'GEMİ AVI':quest.kind==='monster'?'DENİZ CANAVARI':quest.kind==='sparkle'?'PIRILTI':'GANİMET'}</span><h3>${quest.title.split(': ').pop()}</h3><p>${quest.description}</p><div class="quest-rewards"><b>${quest.gold.toLocaleString('tr-TR')} ALTIN</b><b>${quest.xp.toLocaleString('tr-TR')} TP</b><b>◈ ${fmt(quest.pearls)} İNCİ</b></div><small>${cooling?'Yeniden açılmasına: '+cooldownText(questCooldownUntil[quest.id]):`${Math.min(progress,quest.required)} / ${quest.required} ${questUnit(quest)}`}</small></div>${action}</article>`;
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
  state.activeQuest=null;questProgress[id]=0;questCooldownUntil[id]=Date.now()+QUEST_COOLDOWN_MS;pendingCancel=null;saveQuestState();renderQuestLog();toast(`${questById(id).title} iptal edildi — ${QUEST_COOLDOWN_MS/3_600_000} saat sonra yeniden açılacak`);updateUI();
}
function recordQuestProgress(kind:QuestDef['kind'],id:string){
  if(state.activeQuest===null)return;
  const quest=questById(state.activeQuest);
  if(!quest||quest.map!==currentMap||quest.kind!==kind||!quest.ids.includes(id))return;
  questProgress[quest.id]=(questProgress[quest.id]??0)+1;saveQuestState();
  if(questProgress[quest.id]<quest.required)return;
  state.gold+=goldGainAch(quest.gold);state.fame+=xpGain(quest.xp);state.pearls+=quest.pearls;bumpAch('quest');const qEp=questEp(quest.tier);gainElitePoints(qEp);
  rewardNotice(`Görev tamamlandı: ${quest.title} · +${fmt(quest.gold)} altın · +${fmt(quest.pearls)} inci · +${fmt(quest.xp)} TP · +${fmt(qEp)} EP`,'gain',{xp:quest.xp,gold:quest.gold});
  toast(`${quest.title} tamamlandı`);questProgress[quest.id]=0;questCooldownUntil[quest.id]=Date.now()+QUEST_COOLDOWN_MS;state.activeQuest=null;saveQuestState();saveAccount();
}
// Her seviye atlayışta küçük hediye: inci ve Ateş Güllesi (yeni seviyeyle büyür)
const levelGift=(level:number)=>({pearls:50*level,fire:300*level});
let levelUpTimer=0;
function showLevelUp(level:number){
  let el=document.getElementById('levelUpSplash');
  if(!el){el=document.createElement('div');el.id='levelUpSplash';el.className='levelup-splash';document.body.append(el);el.onclick=()=>el!.classList.remove('open');}
  el.innerHTML=`<div class="lu-rays"></div><div class="lu-card"><i class="lu-badge" style="background-position:${(Math.min(MAX_LEVEL,level)-1)/7*100}% 0"></i><span>YENİ SEVİYE</span><h2>SEVİYE ${level}</h2><p>+${HP_PER_LEVEL.toLocaleString('tr-TR')} gövde · +1 uzmanlık puanı · yeni denizler açıldı</p><p class="lu-gift"><img src="/assets/icon-pearl-v1.webp" alt=""/>+${fmt(levelGift(level).pearls)} İnci <img src="/assets/ammo-fire-v2.webp" alt=""/>+${fmt(levelGift(level).fire)} Ateş Güllesi</p></div>`;
  el.classList.remove('open');void el.offsetWidth;el.classList.add('open');
  clearTimeout(levelUpTimer);levelUpTimer=window.setTimeout(()=>el!.classList.remove('open'),3800);
}
if(matchMedia('(hover:hover)').matches){const tip=document.createElement('div');tip.className='qtip-float';document.body.append(tip);
  document.addEventListener('pointerover',e=>{const el=(e.target as HTMLElement).closest?.<HTMLElement>('.slot-bar [data-quick-item]');if(!el){tip.classList.remove('show');return;}const it=el.dataset.quickItem as QuickItemId,r=el.getBoundingClientRect();tip.innerHTML=`<b>${QUICK_ITEMS[it].name}</b>${QUICK_TIPS[it]}`;tip.style.left=`${r.left+r.width/2}px`;tip.style.top=`${r.top-6}px`;tip.classList.add('show');});}
function updateDots(){try{
  const daily1=dailyStatus(daily).canClaim||!!(festival&&festivalStatus(festival).canClaim),mate=mentorship.pending.length>0,quest=state.activeQuest===null||levelQuestOpen();
  const set=(id:string,on:boolean)=>document.getElementById(id)?.classList.toggle('has-dot',on);
  set('openDaily',daily1);set('openMentorship',mate);set('openMenuQuests',quest);set('openQuestTop',quest);set('openMenu',daily1||mate);
}catch{}}
function updateUI(){
  updateDots();
  // Saldırı sürerken SALDIR, gövde tamken (tamir yokken) TAMİR soluk görünür
  ui('attack').classList.toggle('dim',state.attacking);ui('repair').classList.toggle('dim',!state.repairing&&state.hp>=effectiveMaxHp());
  ui('pearls').textContent=state.pearls<1000?String(state.pearls).padStart(3,'0'):fmt(state.pearls);ui('gold').textContent=state.gold<1000?String(state.gold).padStart(3,'0'):fmt(state.gold);
  if(TOUCH&&document.getElementById('mobMain')){const c=ui('mobMain').querySelector('b');if(c)c.textContent=quickCount(state.ammo);}document.querySelectorAll<HTMLElement>('.slot-bar [data-quick-item],#mobTray [data-quick-item]').forEach(slot=>{const item=slot.dataset.quickItem as QuickItemId;const count=slot.querySelector('b');if(count)count.textContent=quickCount(item);slot.classList.toggle('active',item===state.ammo||((item==='powder'||item==='shield')&&consumableOn[item]));});
  ui('hpText').textContent=`${Math.ceil(state.hp).toLocaleString('tr-TR')} / ${effectiveMaxHp().toLocaleString('tr-TR')}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/effectiveMaxHp()*100}%`;
  const need=xpNeed(state.level);ui('xpText').textContent=Number.isFinite(need)?`${state.fame.toLocaleString('tr-TR')} / ${need.toLocaleString('tr-TR')}`:state.fame.toLocaleString('tr-TR');(ui('xpBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('level').textContent=String(state.level);ui('level').style.backgroundPosition=`${(Math.min(MAX_LEVEL,Math.max(1,state.level))-1)/7*100}% 0`;ui('level').style.setProperty('--lvp',`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`);ui('level').title=Number.isFinite(need)?`Seviye ${state.level} · sonraki seviyeye %${Math.floor(Math.min(100,state.fame/need*100))}`:`Seviye ${state.level} · en yüksek seviye`;ui('captainLevel').textContent=String(state.level);ui('profileElite').textContent=eliteProgress().text;{const br=battleRank(state.battlePoints);ui('profileBattle').innerHTML=`${rankBadgeHtml(br.index)}${br.name} · ${spText()}`;}(ui('profileEliteBar') as HTMLElement).style.width=`${eliteProgress().pct}%`;(ui('profileBattleBar') as HTMLElement).style.width=`${battleRank(state.battlePoints).pct}%`;
  (ui('xpHudBar') as HTMLElement).style.width=`${Number.isFinite(need)?Math.min(100,state.fame/need*100):100}%`;ui('xpHudText').textContent=Number.isFinite(need)?`${state.fame.toLocaleString('tr-TR')} / ${need.toLocaleString('tr-TR')}`:state.fame.toLocaleString('tr-TR');{const lq=levelQuestOpen();ui('xpHudBar').parentElement!.parentElement!.classList.toggle('lq-ready',lq);if(lq){const g=levelQuestGoal(state.level);ui('xpHudText').textContent=`SEVİYE GÖREVİ ${levelQuest.ships+levelQuest.monsters}/${g.ships+g.monsters}`;}}(ui('hpHudBar') as HTMLElement).style.width=`${Math.max(0,state.hp/effectiveMaxHp()*100)}%`;ui('hpHudText').textContent=`${Math.ceil(state.hp).toLocaleString('tr-TR')} / ${effectiveMaxHp().toLocaleString('tr-TR')}`;(ui('eliteBar') as HTMLElement).style.width=`${eliteProgress().pct}%`;ui('eliteText').textContent=eliteProgress().text;(ui('battleBar') as HTMLElement).style.width=`${battleRank(state.battlePoints).pct}%`;ui('battleText').textContent=spText();
  const quest=state.activeQuest===null?null:questById(state.activeQuest);ui('questTitle').textContent=quest?.title||'Görev seçilmedi';ui('questDescription').textContent=quest?.description||'Kaptan, yapmak istediğin görevi görev defterinden seçebilirsin.';ui('quest').textContent=quest?`${questProgress[quest.id]??0} / ${quest.required} ${questUnit(quest)}`:'Hazır olduğunda bir görev başlat';ui('questBadge').textContent=quest?`${questProgress[quest.id]??0}/${quest.required}`:'';ui('openQuestTop').classList.toggle('has-quest',!!quest);
  ui('reloadText').textContent=player.cooldown>0?`${player.cooldown.toLocaleString('tr-TR',{minimumFractionDigits:1,maximumFractionDigits:1})} sn`:'HAZIR';ui('attack').classList.toggle('reloading',player.cooldown>0);
  ui('attackLabel').textContent=state.attacking?'SALDIRIYI İPTAL ET':'SALDIR';ui('attack').classList.toggle('active',state.attacking);
  ui('repair').classList.toggle('active',state.repairing);
  {const b=ui('rageButton'),on=rageActive(rage),ready=rageReady(rage);b.classList.toggle('active',on);b.classList.toggle('ready',ready);
    b.style.setProperty('--rage',(on?1:rage.meter/RAGE_MAX).toFixed(3));ui('rageTime').textContent=on?`${rage.salvos}/${RAGE_SALVOS} SALVO`:ready?'HAZIR':`%${Math.floor(rage.meter)}`;}
  renderCombatTargets();
}

let visibleCombatTargets:Target[]=[];
function renderCombatTargets(){
  const targets:Target[]=[];
  const add=(target:Target|null)=>{if(target&&targetExists(target)&&!targets.includes(target))targets.push(target);};
  add(selected);enemies.forEach(enemy=>{if(enemy.aggro)add(enemy);});monsters.forEach(monster=>{if(monster.aggro)add(monster);});
  visibleCombatTargets=targets.slice(0,5);
  const root=ui('combatTargets');root.classList.toggle('visible',visibleCombatTargets.length>0);
  // sağda, olay panelinin (hazine vb.) hemen altında dur; konum yalnız panel değişince okunur
  if(root.style.top!==combatTargetsTop)root.style.top=combatTargetsTop;
  // Seafight usulü küçük kart: simge, [TAG] ad, sayılı can çubuğu. Savaştaki hedefin kenarı kırmızı.
  const html=visibleCombatTargets.map((target,index)=>{const active=target===selected;const fighting=target.aggro||(active&&state.attacking);const portrait=target.kind==='monster'?target.def.portrait:target.def?.portrait??-1;return `<button class="combat-target ${active?'selected':''} ${fighting?'fighting':''}" data-combat-target="${index}"><span class="target-portrait ${target.kind} ${target.kind==='ship'?target.role:''}">${target.kind==='ship'&&target.boss?`<i class="portrait-art" style="${portraitStyle(BOSS_ATLAS,target.boss.portrait,MAP_KEYS.length,BOSS_ATLAS_COLS)}"></i>`:portrait>=0?`<i class="portrait-art" style="${portraitStyle(PORTRAIT_ATLAS,portrait,PORTRAIT_COUNT,PORTRAIT_COLS)}"></i>`:target.kind==='ship'&&target.captain?`<i class="portrait-art tower-art" style="background-image:url(${eliteArtUrl(target.captain.elite)})"></i>`:`<i class="portrait-art tower-art" style="background-image:url(${fleetTowerUrl(theme().fleet)})"></i>`}</span><span class="target-info"><strong>${target.name}</strong><i><em style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></em><b>${fmt(Math.ceil(target.hp))} / ${fmt(target.maxHp)}</b></i></span></button>`;}).join('');
  if(html===combatTargetsHtml)return;combatTargetsHtml=html;root.innerHTML=html;
  root.querySelectorAll<HTMLButtonElement>('[data-combat-target]').forEach(button=>button.onpointerdown=()=>{const target=visibleCombatTargets[Number(button.dataset.combatTarget)];if(target){selected=target;updateUI();}});
}

// Seafight usulü gemi: son baktığı çapraz yüz (dururken de korunur)
const isoFace={east:false,north:false};let isoMove:IsoMove|null=null;
// Bütün gemiler (başlangıç gemisi dahil) Seafight usulü 4 çaprazda merdiven hareketiyle gider
const isoShip=()=>true;
const isoIndex=()=>isoFace.north?(isoFace.east?0:3):(isoFace.east?1:2);
function update(dt:number){{const rc=document.getElementById('recenterShip');if(rc){const away=!!freeLook&&dist(freeLook,player)>60;if(rc.classList.contains('show')!==away)rc.classList.toggle('show',away);}}
    // W-A-S-D (ve oklar) gemiyi yürütmez: gemi yerinde kalırken harita kayar, oyuncu tıklayacağı yeri önceden görür. V gemiye geri ortalar.
    {const px=(held('right','arrowright')?1:0)-(held('left','arrowleft')?1:0),py=(held('back','arrowdown')?1:0)-(held('forward','arrowup')?1:0);
      if(px||py){const base=freeLook??camera,n=Math.hypot(px,py),v=520*dt/camera.zoom;lookAt(base.x+px/n*v,base.y+py/n*v);}
      // tıklayıp rota verince kamera yavaşça gemiye döner
      else if(freeLook&&!cinematic.focus&&(routeTarget||destination)){const k=Math.min(1,dt*2.5);freeLook.x+=(player.x-freeLook.x)*k;freeLook.y+=(player.y-freeLook.y)*k;if(dist(freeLook,player)<12)freeLook=null;}}
    const turn=0,thrust=0;
    if(routeTarget){if(dist(player,routeTarget)<14)routeTarget=null;else destination=routeVia(routeTarget);}
    if(destination&&!thrust&&!turn&&isoShip()){
      // Seafight usulü: 8 yön, dikey hız yarı, anlık kalkış/duruş; açı yalnızca iz ve efektler için tutulur
      const V=effectiveSpeed()*1.8,st=isoAdvance(isoMove,player.x,player.y,destination.x,destination.y,V,dt,isoFace);isoMove=st.m;
      // Açı ve hız bu adımın hareketini verecek şekilde ayarlanır; taşıma aşağıdaki ortak satırda yapılır
      if(st.done){destination=null;player.speed=0;isoMove=null;}else if(st.mx||st.my){player.angle=Math.atan2(st.mx,-st.my);player.speed=Math.hypot(st.mx,st.my)/Math.max(dt,1e-3);}else player.speed=0;
    }
    else if(destination&&!thrust&&!turn){
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
      player.angle+=turn*3.2*dt;if(thrust>0&&isoShip()){const fx=Math.sin(player.angle),fy=-Math.cos(player.angle);if(Math.abs(fx)>.15)isoFace.east=fx>0;if(Math.abs(fy)>.15)isoFace.north=fy<0;}
      const targetSpeed=thrust>0?effectiveSpeed()*(turn?.88:1):0;
      player.speed+=(targetSpeed-player.speed)*Math.min(1,dt*(thrust>0?4:3.8));
    }
    player.speed=clamp(player.speed,0,isoShip()&&destination?effectiveSpeed()*2.2:effectiveSpeed()+4);
    player.x=clamp(player.x+Math.sin(player.angle)*player.speed*dt,25,WORLD_WIDTH-25);player.y=clamp(player.y-Math.cos(player.angle)*player.speed*dt,25,WORLD_HEIGHT-25);resolveIslandCollision();
  updateAbilityFx(dt);
  player.cooldown=Math.max(0,player.cooldown-dt);updateRage(dt);state.invulnerable=Math.max(0,state.invulnerable-dt);collisionNotice=Math.max(0,collisionNotice-dt);{const f=cinematic.focus??freeLook??player;const cf=f===player?Math.min(1,dt*12):Math.min(1,dt*3);camera.x+=(f.x-camera.x)*cf;camera.y+=(f.y-camera.y)*cf;}camera.zoom+=(camera.targetZoom-camera.zoom)*Math.min(1,dt*7);
  for(let i=salvoQueue.length-1;i>=0;i--){salvoQueue[i].delay-=dt;if(salvoQueue[i].delay<=0){releaseSalvo(salvoQueue[i]);salvoQueue.splice(i,1);}}
  if(state.repairing&&!isVip()&&player.speed>4&&repairMoveHint<=0){toast('Hareket halindeyken tamir için VİP gerekir — dur, tamir devam etsin');repairMoveHint=6;}repairMoveHint=Math.max(0,repairMoveHint-dt);
  playerSlow=Math.max(0,playerSlow-dt);
  // Tamir saniyede bir kez sabit miktar ekler ve yeşil "+N" yazısıyla gösterir
  if(state.repairing&&(isVip()||player.speed<=4)){repairClock+=dt;while(repairClock>=1&&state.repairing){repairClock-=1;
    const amt=repairAmount((1+upgrades.repair*.04)*bonus.repair*(1+eliteBonus().repair)),before=state.hp;
    state.hp=Math.min(effectiveMaxHp(),state.hp+amt);if(state.hp>before)healText(player.x,player.y,state.hp-before);
    if(state.hp>=effectiveMaxHp()){state.repairing=false;saveAccount();ui('repair').classList.remove('active');rewardNotice('Gövde tamamen onarıldı','none');}}}else repairClock=0;
  monsters.forEach(m=>{if((m.frozen??0)>0){m.frozen=Math.max(0,m.frozen!-dt);m.cooldown=Math.max(m.cooldown,.5);return;}m.phase+=dt;m.cooldown-=dt;m.slowTimer=Math.max(0,m.slowTimer-dt);proximityAggro(m,dist(m,player));if(m.aggro){m.combatTimer-=dt;if(m.combatTimer<=0||Math.hypot(m.x-m.homeX,m.y-m.homeY)>720)m.aggro=false;}if(m.aggro&&dist(m,player)<NPC_FIRE_RANGE&&m.cooldown<=0)monsterFire(m);});
  // Saldırı: kaptan hareket etse de hedef menzildeyken ateş sürer; hedef menzilden çıkınca saldırı durur
  // ve menzile tekrar girildiğinde SALDIR'a yeniden basmak gerekir.
  if(state.attacking&&selected){
    const d=dist(player,selected),cannonRange=effectiveRange();
    if(d>cannonRange){
      if(attackChase){const away=Math.atan2(player.y-selected.y,player.x-selected.x);routeTarget=null;destination=routeVia(navigablePoint({x:selected.x+Math.cos(away)*(cannonRange-35),y:selected.y+Math.sin(away)*(cannonRange-35)}));}
      else{state.attacking=false;ui('attack').classList.remove('active');toast('Hedef menzil dışına çıktı — saldırı durdu');}
    }else{
      if(attackChase){attackChase=false;destination=null;routeTarget=null;}
      // Rota verilmediyse gemi yerinde durur ve ateş eder (kendiliğinden süzülmez)
      fireAtTarget();
    }
  }
  player.angle=Math.atan2(Math.sin(player.angle),Math.cos(player.angle));
  for(const e of enemies){
    if(e.tower){if(siege)updateSiegeTower(e,dt);else updateTower(e,dt);continue;}
    if(e.captain){if(siege)updateSiegeCaptain(e,dt);else updateCaptain(e,dt);continue;}
    if(e.commander){updateCommander(e,dt);continue;}
    if((e.frozen??0)>0){e.frozen=Math.max(0,e.frozen!-dt);e.cooldown=Math.max(e.cooldown,.5);continue;}
    const d=dist(e,player);e.wander+=dt;e.slowTimer=Math.max(0,e.slowTimer-dt);proximityAggro(e,d);if(e.aggro){e.combatTimer-=dt;if(e.combatTimer<=0||Math.hypot(e.x-e.homeX,e.y-e.homeY)>680)e.aggro=false;}
    const homeDistance=Math.hypot(e.x-e.homeX,e.y-e.homeY);
    const target=e.aggro?Math.atan2(player.y-e.y,player.x-e.x)+Math.PI/2:homeDistance>90?Math.atan2(e.homeY-e.y,e.homeX-e.x)+Math.PI/2:e.angle+Math.sin(e.wander*.35)*.008;
    e.angle+=Math.atan2(Math.sin(target-e.angle),Math.cos(target-e.angle))*dt*(e.aggro?.8:.25);
    // Seafight usulü: NPC de oyuncu gibi yalnızca 4 çaprazda, merdiven adımlarıyla gider; hedef rota açısının 320 birim ilerisidir
    if(!e.aggro||d>240){const slow=e.slowTimer>0?.55:1,want={x:clamp(e.x+Math.sin(e.angle)*320,40,WORLD_WIDTH-40),y:clamp(e.y-Math.cos(e.angle)*320,40,WORLD_HEIGHT-40)};
      if(!e.isoT||dist(e.isoT,want)>60){e.isoT=want;e.iso=null;}
      e.face??={east:Math.sin(e.angle)>=0,north:Math.cos(e.angle)>0};
      const st=isoAdvance(e.iso??null,e.x,e.y,e.isoT.x,e.isoT.y,e.speed*(e.aggro?1:.45)*slow*1.4,dt,e.face);e.iso=st.m;
      if(st.done)e.isoT=undefined;else{e.x=clamp(e.x+st.mx,40,WORLD_WIDTH-40);e.y=clamp(e.y+st.my,40,WORLD_HEIGHT-40);}}
    else e.face={east:player.x>e.x,north:player.y<e.y};/* menzilde durup ateş ederken oyuncuya döner */ if(e.aggro&&d<NPC_FIRE_RANGE&&e.cooldown<=0)enemyFire(e);e.cooldown-=dt;
  }
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.foe){if(enemies.includes(s.foe)){const a=Math.atan2(s.foe.y-s.y,s.foe.x-s.x),sp=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a)*sp;s.vy=Math.sin(a)*sp;s.life=Math.max(s.life,.12);}}
    else if(s.owner==='enemy'&&!s.noHome&&state.invulnerable<=0){const a=Math.atan2(player.y-s.y,player.x-s.x),speed=Math.max(Math.hypot(s.vx,s.vy),Math.abs(player.speed)+220);s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;s.life=Math.max(s.life,.12);}
    if(s.owner==='player'&&s.target&&targetExists(s.target)){const a=Math.atan2(s.target.y-s.y,s.target.x-s.x),speed=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;s.life=Math.max(s.life,.12);}
    if(s.flight===undefined){const aim=s.owner==='player'?s.target:s.foe??player,sp=Math.max(1,Math.hypot(s.vx,s.vy)),d=aim&&targetExistsOrPlayer(aim)?dist(s,aim):sp*s.life;s.flight=Math.max(.15,Math.min(s.life,d/sp));s.age=0;s.arc=Math.min(80,d*.13)*(s.splash?2.2:1);
      if(s.splash&&aim)particles.push({x:aim.x,y:aim.y,vx:0,vy:0,life:s.flight,maxLife:s.flight,kind:'target',size:120});}
    s.age=(s.age??0)+dt;s.trail=(s.trail??0)-dt;
    if(s.trail<=0){s.trail=.08;const z=shotHeight(s);
      if(s.visual==='spit')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,life:.4,maxLife:.4,kind:'bubble',z,size:14});
      else if(s.ammo==='fire')particles.push({x:s.x,y:s.y,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30,life:.3,maxLife:.3,kind:'spark',z:z+4,size:8});}
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(s.owner==='player'){
      for(let j=enemies.length-1;j>=0&&s.life>0;j--){
        const e=enemies[j];if(isAlly(e))continue;
        if(dist(s,e)<(e.hitRadius??25)){const rawHit=(s.damage*(s.ammo==='breaker'&&e.tower?SPECIAL_AMMO.breaker.towerFactor:1)*(s.ammo==='fire'&&!e.tower&&!e.captain?FIRE_NPC_FACTOR:1)*(s.ammo==='explosive'&&e.captain?EXPLOSIVE_PLAYER_FACTOR:1));const hit=e.captain?pvpClamp(e.pvp??=newPvpBudget(e.maxHp,performance.now()/1000),e.maxHp,rawHit,performance.now()/1000):rawHit;s.hit=true;if(s.slow)e.slowTimer=Math.max(e.slowTimer,s.slow);if(s.splash)towerSplash(s,e);e.aggro=true;e.lastHitBy='player';e.combatTimer=12;if(s.ammo==='chain'&&e.captain)e.slowTimer=CHAIN_SLOW.seconds;e.hp-=hit;siegeHit(e,hit,profile.nick);damageText(e.x,e.y,hit,s.powder?DMG_GOLD:DMG_RED);burst(e.x,e.y);playHit();ammoImpact(s,e,hit);s.life=0;
          if(e.hp<=0)sinkEnemy(e);
        }
      }
      for(let j=monsters.length-1;j>=0&&s.life>0;j--){
        const m=monsters[j];
        if(dist(s,m)<m.radius){const hit=(s.damage*(s.ammo==='fire'?FIRE_NPC_FACTOR:1));s.hit=true;if(s.slow)m.slowTimer=Math.max(m.slowTimer,s.slow);if(s.splash)towerSplash(s,m);m.aggro=true;m.combatTimer=12;m.hp-=hit;damageText(m.x,m.y,hit,s.powder?DMG_GOLD:DMG_RED);burst(m.x,m.y);playHit();ammoImpact(s,m,hit);s.life=0;
          if(m.hp<=0)defeatMonster(m);
        }
      }
    }else if(s.foe){if(enemies.includes(s.foe)&&dist(s,s.foe)<(s.foe.hitRadius??30)){s.hit=true;s.life=0;captainHit(s.foe,s,s.captain??null);}}
    else if(state.invulnerable<=0&&dist(s,player)<22){
      s.hit=true;s.life=0;
      // Hayalet Kadırga pasifi %10 ihtimalle gülleyi savuşturur
      {
      state.repairing=false;playerHitClock=0;
      const shieldF=useConsumable('shield'),rawTaken=s.damage*bonus.taken*shieldF*eliteTakenMult(),taken=s.captain?pvpClamp(playerPvp,effectiveMaxHp(),rawTaken,performance.now()/1000):rawTaken;
      state.hp-=taken;damageText(player.x,player.y,Math.round(taken),shieldF<1?DMG_BLUE:DMG_RED);playHit(true);burst(player.x,player.y);
      if(s.captain&&s.ammo==='chain')playerSlow=CHAIN_SLOW.seconds;
      if(s.captain&&s.ammo==='leech'&&enemies.includes(s.captain)){const c=s.captain,h=leechHeal(taken,true,c.maxHp);if(h>0){c.hp=Math.min(c.maxHp,c.hp+h);spawnSoul(player,c);}}
      }
      if(state.hp<=0){
        const killer=s.captain?.name??killerNear();
        respawn();showSunkBy(killer);
        // Respawn empties shots. Stop reading this volley, then finish UI/draw normally.
        break;
      }
    }
    if(s.life<=0){if(!s.hit)splashAt(s.x,s.y,s.splash?160:110);shots.splice(i,1);}
  }
  updateLootChests(dt);updateTreasure(dt);updateSparkles(dt);updateArsenal(dt);updateEvents(dt);
  if(insideOwnLagoon(player)&&state.hp<effectiveMaxHp()){state.hp=Math.min(effectiveMaxHp(),state.hp+effectiveMaxHp()*.06*dt);if(state.hp>=effectiveMaxHp())saveAccount();}
  updateJumpPrompt();updateCoordBadge();mapFade=Math.max(0,mapFade-dt*1.6);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;if(p.vr)p.rot=(p.rot??0)+p.vr*dt;
    if(p.vz!==undefined){p.z=(p.z??0)+p.vz*dt;p.vz-=340*dt;if(p.z<=0){p.z=0;p.vz=undefined;p.vx*=.25;p.vy*=.25;p.vr=(p.vr??0)*.1;if(p.kind==='splinter')particles.push({x:p.x,y:p.y,vx:0,vy:0,life:.4,maxLife:.4,kind:'foam',size:20,variant:0});}}
    if(p.life<=0)particles.splice(i,1);}
  for(let i=wrecks.length-1;i>=0;i--){wrecks[i].t+=dt;if(wrecks[i].t>=WRECK_TIME)wrecks.splice(i,1);}
  compassReveal=Math.max(0,compassReveal-dt);compassCooldown=Math.max(0,compassCooldown-dt);compassPulse=Math.max(0,compassPulse-dt*.8);
  let need=xpNeed(state.level);if(state.fame>=need&&!levelQuestDone(levelQuest)&&!levelQuestNoticed){levelQuestNoticed=true;const g=levelQuestGoal(state.level);rewardNotice(`TP doldu · Seviye görevi: ${state.level}. denizde ${g.ships} ağır gemi ve ${g.monsters} canavar`,'gain');toast('Seviye görevi hazır · Görevler');}
  while(state.fame>=need&&levelQuestDone(levelQuest)){state.fame-=need;state.level++;levelQuest=loadLevelQuest(state.level);saveLevelQuest(levelQuest);levelQuestNoticed=false;setAch('level',state.level);{const rw=onOwnLevel(mentorship,state.level);for(const r of rw)rewardNotice(`${r.level>=GRADUATE_LEVEL?'Mezuniyet':'Muço'} ödülü hazır · Kaptan & Muço penceresinden talep et`,'gain');saveMentorship(mentorship);}state.maxHp=baseMaxHp();state.hp=effectiveMaxHp();const gift=levelGift(state.level);state.pearls+=gift.pearls;arsenal.fire+=gift.fire;saveArsenal(arsenal);renderQuickSlots();saveAccount();playLevelUp();rewardNotice(`Seviye ${state.level} oldun · +${HP_PER_LEVEL.toLocaleString('tr-TR')} azami gövde · +1 uzmanlık puanı · +${fmt(gift.pearls)} inci · +${fmt(gift.fire)} Ateş Güllesi · ${state.level}/1 açıldı`);toast(`Seviye ${state.level}! Yeni denizler açıldı`);showLevelUp(state.level);need=xpNeed(state.level);}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui('toast').classList.remove('show');}uiClock-=dt;if(uiClock<=0){uiClock=.1;updateUI();};
}

// ---------------------------------------------------------------- Büyük Kuşatma (src/siege.ts)
// Filo adası altyapısı Kara Kale olarak kullanılır. Test kaptanları sunucu gelene kadar diğer oyuncuların yerine
// müttefik olarak savaşır: oyuncu onlara, onlar oyuncuya saldırmaz. Kaleden yıkılan hiçbir şey onarılmaz.
const SIEGE_PARTICIPANTS=4,SIEGE_FIRE_RANGE=520;
let siegeHudClock=0,siegeSaveClock=0;
function siegeHit(t:Target,amount:number,who:string){if(!siege||t.kind!=='ship'||!t.siege||amount<=0)return;
  const eff=Math.max(0,amount+Math.min(0,t.hp));siege.contrib[who]=(siege.contrib[who]??0)+eff;}
function siegeTarget(i:number){const st=siegeStats(SIEGE_PARTICIPANTS),f=SIEGE_MAP.fleet,[dx,dy]=FLEET.towers[i],inner=INNER_TOWERS.includes(i),hp=inner?st.innerHp:st.wallHp;
  return{kind:'ship',role:'heavy',tower:true,towerIndex:i,siege:true,x:f.x+dx,y:f.y+dy,angle:0,hp,maxHp:hp,cooldown:1+Math.random()*2,speed:0,damage:Math.round(st.towerDamage*(inner?1.3:1)),reload:inner?1.9:2.3,rewardGold:0,rewardFame:0,color:'#555',
    name:inner?'Kara Kale İç Kulesi':`Kara Kale Sur Topu · ${gateOf(i)==='west'?'Batı':'Doğu'} Kapısı`,tier:8,aggro:false,wander:0,slowTimer:0,homeX:f.x+dx,homeY:f.y+dy,combatTimer:0,hitRadius:34,fireRange:inner?st.range+40:st.range} as Enemy;}
function spawnSiegeTowers(){if(!siege)return;for(let i=0;i<FLEET.towers.length;i++)if(!siege.destroyed.includes(i))enemies.push(siegeTarget(i));
  if(siegePhase(siege)===3)spawnCommander();}
// Lagünde (maske değeri 2) verilen noktaya en yakın, kıyıdan uzak deniz hücresi
function lagoonPoint(near:Vec):Vec{let best:Vec=near,bd=Infinity;const g=fleetGrid();
  for(let j=2;j<FM_N-2;j++)for(let i=2;i<FM_N-2;i++){if(g[j*FM_N+i]!==2)continue;let open=true;for(let dy=-2;dy<=2&&open;dy++)for(let dx=-2;dx<=2;dx++)if(!g[(j+dy)*FM_N+i+dx]){open=false;break;}
    if(!open)continue;const c=fleetCellCenter(i,j),d=dist(c,near);if(d<bd){bd=d;best=c;}}
  return best;}
function spawnCommander(){if(!siege||enemies.some(e=>e.commander))return;const st=siegeStats(SIEGE_PARTICIPANTS),f=SIEGE_MAP.fleet,p=lagoonPoint({x:f.x,y:f.y+210*FLEET_SCALE});
  const boss=SIEGE_COMMANDER;
  const e=makeShip(boss as unknown as NpcDef,p.x,p.y,0);Object.assign(e,{boss,commander:true,siege:true,hitRadius:64,speed:0,hp:siege.commanderHp??st.commanderHp,maxHp:st.commanderHp,damage:st.commanderDamage,reload:2.2,name:boss.name,aggro:true,combatTimer:999,cooldown:2,wander:14});
  enemies.push(e);siege.commanderHp=e.hp;saveSiege(siege);playBossHorn();playBossMusic(8);rewardNotice('3. aşama · Kara Kale komutanı sancak gemisiyle çıktı','battle');}
// Kuleler ve komutan en yakın saldırgana (oyuncu ya da müttefik kaptan) ateş eder
function siegeAttackers(from:Vec,range:number){const out:Vec[]=[];if(state.invulnerable<=0&&dist(from,player)<range)out.push(player);
  for(const a of enemies)if(isAlly(a)&&dist(a,from)<range)out.push(a);return out.sort((a,b)=>dist(a,from)-dist(b,from));}
function siegeShot(x:number,y:number,a:number,speed:number,damage:number,t:Vec,extra:Partial<Shot>={}){shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:Math.max(2.4,Math.hypot(t.x-x,t.y-y)/speed+.5),owner:'enemy',damage,hit:false,ammo:'iron',...(t===player?{}:{foe:t as Enemy}),...extra});}
function updateSiegeTower(e:Enemy,dt:number){e.cooldown-=dt;e.slowTimer=0;e.combatTimer=Math.max(0,e.combatTimer-dt);const R=towerReach(e),t=siegeAttackers(e,R)[0];
  e.aggro=!!t||e.combatTimer>0;if(!t||e.cooldown>0)return;const m=towerMuzzle(e),a=Math.atan2(t.y-m.y,t.x-m.x);muzzleFlash(m.x,m.y,a,60);
  for(const off of [-.05,.05])siegeShot(m.x,m.y,a+off,320,e.damage,t);if(dist(e,player)<900)playEnemyCannon(dist(e,player),(e.x-player.x)/600);e.cooldown=e.reload+Math.random()*.4;}
function updateCommander(e:Enemy,dt:number){if((e.frozen??0)>0){e.frozen=Math.max(0,e.frozen!-dt);return;}e.slowTimer=Math.max(0,e.slowTimer-dt);
  const t=siegeAttackers(e,Math.max(560,effectiveRange()+TOWER_REACH_MARGIN))[0];if(t)e.face={east:t.x>e.x,north:t.y<e.y};e.cooldown-=dt;e.wander-=dt;const enraged=e.hp<e.maxHp*.5;
  if(t&&e.cooldown<=0){const a=Math.atan2(t.y-e.y,t.x-e.x);muzzleFlash(e.x+Math.cos(a)*34,e.y+Math.sin(a)*34,a,84);playEnemyCannon(dist(e,player)*.6,(e.x-player.x)/600);
    for(const off of enraged?[-.24,-.12,0,.12,.24]:[-.15,0,.15])siegeShot(e.x,e.y,a+off,290,e.damage*(.85+Math.random()*.3),t);e.cooldown=e.reload*(enraged?.8:1);}
  // Yaylım ateşi: her 14 sn'de çevresine 16 gülle (hedef takibi yok)
  if(e.wander<=0){e.wander=14;spawnText(e,'YAYLIM ATEŞİ','#ffb070');playEnemyCannon(dist(e,player)*.5,(e.x-player.x)/600);
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;siegeShot(e.x,e.y,a,260,e.damage*.6,player,{noHome:true,life:2});}}
  // Canı yarıya inince iki muhafız gemisi çağırır (bir kez)
  if(enraged&&!e.escortsCalled){e.escortsCalled=true;for(const k of [-1,1]){const p=lagoonPoint({x:e.x+k*160,y:e.y});const ship=makeShip(SIEGE_GUARD,p.x,p.y,0);Object.assign(ship,{aggro:true,combatTimer:999,summoned:true,siege:true});enemies.push(ship);}
    rewardNotice('Komutan muhafızlarını çağırdı','none');}}
// Müttefik kaptanlar: o aşamanın hedeflerine saldırır; 1. aşamada kale çemberinin dışından dolaşır, sonra lagüne girer
function spawnSiegeAllies(){if(!siege)return;const TEST_CAPTAINS:[string,EliteShipId][]=[['ADM_AHMET','magma'],['ADM_YASİN','tempest'],['ADM_DOGAN','glacial']],sp=SIEGE_MAP.spawn;
  TEST_CAPTAINS.forEach(([name,elite],i)=>{const x=sp.x+(i-1)*260,y=sp.y+60;
    enemies.push({kind:'ship',role:'heavy',x,y,angle:0,hp:400000,maxHp:400000,cooldown:1+i*.6,speed:150,damage:1100,reload:2.3,rewardGold:0,rewardFame:0,color:'#2f6a5a',name,tier:8,aggro:false,wander:0,slowTimer:0,homeX:x,homeY:y,combatTimer:0,hitRadius:44,
      captain:{elite,ammo:'iron',ammoClock:2+i*2,foe:null,orbit:null,orbitClock:0},face:{east:true,north:true}});});}
function siegeFoes(){if(!siege)return[];const ph=siegePhase(siege);
  return enemies.filter(o=>o.siege&&(ph===1?o.tower&&WALL_TOWERS.includes(o.towerIndex!):ph===2?o.tower:!o.tower));}
function updateSiegeCaptain(e:Enemy,dt:number){const c=e.captain!,f=SIEGE_MAP.fleet,ring=FLEET.islandR+46;e.slowTimer=Math.max(0,e.slowTimer-dt);
  if((e.frozen??0)>0){e.frozen=Math.max(0,e.frozen!-dt);return;}
  const foes=siegeFoes();if(!c.foe||!enemies.includes(c.foe)||!foes.includes(c.foe)||Math.random()<dt*.15)c.foe=foes.sort((a,b)=>dist(a,e)-dist(b,e))[0]??null;
  const foe=c.foe,open=siegePhase(siege!)>=2;
  c.orbitClock-=dt;if(foe&&(!c.orbit||c.orbitClock<=0||dist(e,c.orbit)<30)){c.orbitClock=3+Math.random()*2;e.iso=null;
    if(!open){const a=Math.atan2(foe.y-f.y,foe.x-f.x)+(Math.random()-.5)*.3;c.orbit={x:f.x+Math.cos(a)*ring,y:f.y+Math.sin(a)*ring};}
    else{let pick:Vec|null=null;const a0=Math.random()*Math.PI*2;for(let k=0;k<16&&!pick;k++){const a=a0+k*Math.PI/8,r=150+Math.random()*120,q={x:foe.x+Math.cos(a)*r,y:foe.y+Math.sin(a)*r};if(fleetNav(q)===2)pick=q;}c.orbit=pick??lagoonPoint(foe);}}
  // ara nokta: kapalıyken çemberin çevresinden dolaş, açıkken lagün yol bulucusunu kullan
  let way:Vec|null=c.orbit;if(way){const ae=Math.atan2(e.y-f.y,e.x-f.x),at=Math.atan2(way.y-f.y,way.x-f.x),diff=Math.atan2(Math.sin(at-ae),Math.cos(at-ae));
    if(!open&&Math.abs(diff)>.35){const a=ae+Math.sign(diff)*.5;way={x:f.x+Math.cos(a)*ring,y:f.y+Math.sin(a)*ring};}
    else if(open)way=routeVia(way,e);}
  e.face??={east:true,north:true};if(way){const st=isoAdvance(e.iso??null,e.x,e.y,way.x,way.y,e.speed*(e.slowTimer>0?.55:1)*1.4,dt,e.face);e.iso=st.m;
    if(st.done)e.iso=null;else{e.x=clamp(e.x+st.mx,40,WORLD_WIDTH-40);e.y=clamp(e.y+st.my,40,WORLD_HEIGHT-40);const back=fleetCollision(e);if(back){e.x=back.x;e.y=back.y;}}}
  for(const o of [player,...enemies.filter(x=>x.captain&&x!==e)] as Vec[]){const dx=e.x-o.x,dy=e.y-o.y,dd=Math.hypot(dx,dy)||1;if(dd<150){const k=(150-dd)*Math.min(1,dt*3);e.x+=dx/dd*k;e.y+=dy/dd*k*.6;}}
  c.ammoClock-=dt;if(c.ammoClock<=0){c.ammoClock=5+Math.random()*4;const all:AmmoKind[]=['iron','chain','fire','explosive','breaker','leech'];c.ammo=all[Math.floor(Math.random()*all.length)];}
  if(!foe)return;const d=dist(e,foe);e.cooldown-=dt;if(d<SIEGE_FIRE_RANGE&&e.cooldown<=0){captainFire(e,foe);e.cooldown=e.reload;}}
function siegeTowerDown(e:Enemy){if(!siege||e.towerIndex===undefined)return;const before=siegePhase(siege),i=e.towerIndex;if(!siege.destroyed.includes(i))siege.destroyed.push(i);saveSiege(siege);
  const after=siegePhase(siege);
  if(WALL_TOWERS.includes(i)){const g=gateOf(i),left=gateLeft(siege,g);toast(left?`${g==='west'?'Batı':'Doğu'} kapısında ${left} sur topu kaldı`:`${g==='west'?'BATI':'DOĞU'} KAPISI DÜŞTÜ`);if(!left)rewardNotice(`${g==='west'?'BATI':'DOĞU'} KAPISI DÜŞTÜ`);}
  else toast(`İç kule yıkıldı · ${INNER_TOWERS.filter(k=>!siege!.destroyed.includes(k)).length} kule kaldı`);
  if(before===1&&after===2){fleetFields.clear();rewardNotice('2. aşama · kapılar açıldı, lagüne gir ve iç kuleleri yık','battle');}
  if(after===3)spawnCommander();renderSiegeHud();}
// Katkı ödülü: ödenmemiş hasar kadar (ayrılınca ya da kuşatma bitince)
function payContribution(){if(!siege)return null;const dmg=siege.contrib[profile.nick]??0,unpaid=dmg-siege.paid;if(unpaid<=0)return null;
  const r=contribReward(unpaid,SIEGE_PARTICIPANTS),xp=xpGain(r.xp),gold=goldGainAch(r.gold);state.fame+=xp;state.gold+=gold;state.pearls+=r.pearls;siege.paid=dmg;saveSiege(siege);saveAccount();
  return{xp,gold,pearls:r.pearls};}
function siegeWon(e:Enemy){if(!siege)return;stopBossMusic();siege.result='won';siege.commanderHp=0;saveSiege(siege);
  for(let n=0;n<4;n++)later(n*.25,()=>{burst(e.x+(Math.random()-.5)*90,e.y+(Math.random()-.5)*60,true);playExplosion();});
  enemies.splice(0,enemies.length,...enemies.filter(o=>!o.siege));finishSiege(true);}
function finishSiege(won:boolean){if(!siege)return;const reward=payContribution(),dmg=siege.contrib[profile.nick]??0,order=ranking(siege.contrib),rank=order.findIndex(([n])=>n===profile.nick)+1;
  let chest:ReturnType<typeof victoryChest>|null=null,title=false;
  if(won&&earnsChest(dmg,SIEGE_PARTICIPANTS)){chest=victoryChest(Math.random,EQUIPMENT.filter(q=>q.rarity===1).map(q=>q.id));state.pearls+=chest.pearls;
    for(const [k,n] of Object.entries(chest.ammo))arsenal[k as keyof typeof chest.ammo]+=n!;arsenal.speed+=chest.speed;if(chest.equip)equipOwned[chest.equip]=(equipOwned[chest.equip]??0)+1;saveArsenal(arsenal);saveAccount();renderQuickSlots();}
  if(won&&rank>0&&rank<=3&&dmg>0){heroTitle=grantTitle();title=true;}
  playLevelUp();showSiegeResult(won,dmg,rank,order,reward,chest,title);renderSiegeHud();}
function siegeRespawn(){const sp=SIEGE_MAP.spawn;player.x=sp.x+(Math.random()-.5)*200;player.y=sp.y;player.speed=0;destination=null;routeTarget=null;camera.x=player.x;camera.y=player.y;freeLook=null;
  state.hp=effectiveMaxHp();state.invulnerable=10;state.attacking=false;selected=null;ui('attack').classList.remove('active');mapFade=1;playSplash();
  toast('Gemin battı — kuşatma limanında tam gövdeyle doğdun, 10 sn korunuyorsun');}
function updateSiege(dt:number){if(!siege)return;
  siegeSaveClock-=dt;if(siegeSaveClock<=0){siegeSaveClock=2;const c=enemies.find(e=>e.commander);if(c){siege.commanderHp=Math.max(0,c.hp);}saveSiege(siege);}
  if(!siege.result&&Date.now()>siege.end){siege.result='lost';saveSiege(siege);stopBossMusic();finishSiege(false);}
  siegeHudClock-=dt;if(siegeHudClock<=0){siegeHudClock=.5;renderSiegeHud();}}
function siegeTimeLeft(){if(!siege)return'';const min=Math.max(0,Math.ceil((siege.end-Date.now())/60000));return min>=60?`${Math.floor(min/60)} sa ${min%60} dk`:`${min} dk`;}
const PHASE_NAMES=['','1. AŞAMA · DIŞ SURLAR','2. AŞAMA · İÇ KULELER','3. AŞAMA · KALE KOMUTANI','KALE DÜŞTÜ'];
// Üst şerit: aşama, kapılar, yıkılma oranı ve kalan süre
const siegeBar=document.createElement('div');siegeBar.className='siege-bar';document.querySelector('.hud')!.append(siegeBar);
renderDayEvent();
function renderSiegeHud(){siegeBar.classList.toggle('on',!!siege);dayEventEl.classList.toggle('hidden',!!siege);if(!siege)return;const ph=siegePhase(siege),pct=Math.round(siegeProgress(siege,SIEGE_PARTICIPANTS)*100);
  const detail=ph===1?`Batı kapısı: ${gateLeft(siege,'west')} top · Doğu kapısı: ${gateLeft(siege,'east')} top`:ph===2?`İç kuleler: ${INNER_TOWERS.filter(i=>!siege!.destroyed.includes(i)).length} / 4`:ph===3?'Komutanın sancak gemisini batır':siege.result==='won'?'Zafer!':'';
  const html=`<div><b>KARA KALE · ${siege.result==='lost'?'KUŞATMA BİTTİ':PHASE_NAMES[ph]}</b><small>${siege.result?'':`bitime ${siegeTimeLeft()}`}</small></div><div><span>${detail}</span><i><em style="width:${pct}%"></em></i><small>%${pct}</small></div><button data-siege-leave>AYRIL</button>`;
  if(siegeBar.dataset.html===html)return;siegeBar.dataset.html=html;siegeBar.innerHTML=html;(siegeBar.querySelector('[data-siege-leave]') as HTMLButtonElement).onclick=leaveSiege;}
// Sağ panel: komutan ve katkı sıralaması
function siegePanelRows(){if(!siege)return[];const rows:string[]=[],order=ranking(siege.contrib).slice(0,10),total=Object.values(siege.contrib).reduce((a,b)=>a+b,0)||1;
  rows.push(`<div class="event-row siege-board"><small>KATKI SIRALAMASI</small><ol>${order.map(([n,d])=>`<li class="${n===profile.nick?'me':''}"><b>${escapeHtml(n)}</b><em>${fmt(Math.round(d))}</em><span>%${Math.round(d/total*100)}</span></li>`).join('')||'<li><b>Henüz hasar yok</b></li>'}</ol></div>`);
  return rows;}
function showSiegeResult(won:boolean,dmg:number,rank:number,order:[string,number][],reward:{xp:number;gold:number;pearls:number}|null,chest:ReturnType<typeof victoryChest>|null,title:boolean){
  const el=document.createElement('div');el.className='siege-result';const ammoNames=chest?Object.entries(chest.ammo).map(([k,n])=>`${fmt(n)} ${SPECIAL_AMMO[k as keyof typeof chest.ammo].name}`).join(' · '):'';
  el.innerHTML=`<section><span class="eyebrow">BÜYÜK KUŞATMA</span><h2>${won?'KARA KALE DÜŞTÜ!':'KUŞATMA SONA ERDİ'}</h2><p>${won?'Kaptanlar kaleyi birlikte yıktı.':'Kale bu akşam ayakta kaldı; katkı ödülün verildi.'}</p>
    <dl><dt>Verdiğin hasar</dt><dd>${Math.round(dmg).toLocaleString('tr-TR')}</dd><dt>Sıran</dt><dd>${rank>0?`${rank}. / ${order.length}`:'—'}</dd>
    <dt>Katkı ödülü</dt><dd>${reward?`+${reward.xp.toLocaleString('tr-TR')} TP · +${reward.gold.toLocaleString('tr-TR')} Altın · +${fmt(reward.pearls)} İnci`:'—'}</dd>
    ${won?`<dt>Zafer sandığı</dt><dd>${chest?`+${fmt(chest.pearls)} İnci · ${ammoNames} · +${fmt(chest.speed)} Hız İksiri${chest.equip?` · ${EQUIPMENT.find(q=>q.id===chest.equip)?.name}`:''}`:'Kalenin en az %2\'si kadar hasar gerekli'}</dd>`:''}</dl>
    ${title?`<div class="hero-award">★ ${HERO_TITLE.toLocaleUpperCase('tr')} ★<small>İlk 3'e girdin · unvanın 7 gün adının altında parlayacak</small></div>`:''}
    <ol>${order.slice(0,5).map(([n,d],i)=>`<li class="${n===profile.nick?'me':''}"><b>${i+1}. ${escapeHtml(n)}</b><em>${fmt(Math.round(d))}</em></li>`).join('')}</ol>
    <button data-close>LİMANA DÖN</button></section>`;
  document.querySelector('.hud')!.append(el);(el.querySelector('[data-close]') as HTMLButtonElement).onclick=()=>{el.remove();leaveSiege();};}
function canEnterSiege(){return siegeWindow().open||ELITE_TEST_MODE;}
function enterSiege(){if(siege)return;if(!canEnterSiege()){toast('Büyük Kuşatma her Cuma 20:00–22:00 arasında açılır');return;}if(inCombat()){toast('Savaş sırasında kuşatmaya geçilemez');return;}
  const w=siegeWindow(),id=w.open?w.id:`test-${w.id}`;let s=loadSiege();
  if(!s||s.id!==id||(!w.open&&(s.result||Date.now()>s.end)))s=newSiege(id,w.open?w.end:Date.now()+SIEGE_MS);
  if(s.result){toast(s.result==='won'?'Kara Kale bu akşam düştü; gelecek Cuma yeniden kurulur':'Bu akşamki kuşatma sona erdi');return;}
  siegeOrigin={map:currentMap,x:player.x,y:player.y};siege=s;saveSiege(s);fleetSafe=null;fleetFields.clear();populateMap();
  const sp=SIEGE_MAP.spawn;player.x=sp.x;player.y=sp.y;player.speed=0;destination=null;routeTarget=null;selected=null;state.attacking=false;ui('attack').classList.remove('active');camera.x=player.x;camera.y=player.y;freeLook=null;
  mapFade=1;playMapJump();eventPanelHtml='';rewardNotice('Büyük Kuşatma · Kara Kale','battle');toast('Batı ve doğu kapılarını koruyan sur toplarını yık');}
function leaveSiege(){if(!siege)return;const r=siege.result?null:payContribution();document.querySelector('.siege-result')?.remove();stopBossMusic();
  const o=siegeOrigin;siege=null;siegeOrigin=null;fleetSafe=null;fleetFields.clear();populateMap();
  if(o){player.x=o.x;player.y=o.y;}player.speed=0;destination=null;routeTarget=null;selected=null;state.attacking=false;camera.x=player.x;camera.y=player.y;freeLook=null;
  mapFade=1;playMapJump();eventPanelHtml='';renderSiegeHud();renderDayEvent(true);if(r)rewardNotice(`Kuşatma katkısı · +${fmt(r.xp)} TP · +${fmt(r.gold)} altın · +${fmt(r.pearls)} inci kazanıldı`,'battle',{xp:r.xp,gold:r.gold});}
function sinkEnemy(e:Enemy){
  const j=enemies.indexOf(e);if(j<0)return;
  if(!e.tower)spawnWreck(e);
  if(e.captain){enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}burst(e.x,e.y,true);playExplosion();playSink(earGain(e));splashAt(e.x,e.y,190);if(e.lastHitBy!=='captain'){gainRage(rage,RAGE_PER_RIVAL);const sp=claimRivalSp(rivalLog,e.name)?gainSp(RIVAL_SP*spMult()):0;sinkNotice(e.name,sp);rivalSinks++;saveRivalSinks(rivalSinks);saveAccount();}e.lastHitBy=undefined;
    const map=currentMap,inst=siege;later(5,()=>{if(currentMap!==map||siege!==inst)return;const a=Math.random()*Math.PI*2,p={x:clamp(e.homeX+Math.cos(a)*450,80,WORLD_WIDTH-80),y:clamp(e.homeY+Math.sin(a)*260,80,WORLD_HEIGHT-80)};Object.assign(e,{x:p.x,y:p.y,hp:e.maxHp,frozen:0,burnTimer:0,slowTimer:0});e.captain!.foe=null;enemies.push(e);spawnText(e,`${e.name} YENİDEN DENİZDE`,'#9fe8dc');});return;}
  enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}
  burst(e.x,e.y,true);playExplosion();playSink(earGain(e));splashAt(e.x,e.y,190);
  if(e.tower){destroyTower(e);return;}
  if(e.commander){siegeWon(e);return;}
  if(e.boss){defeatBoss(e);return;}
  // NPC tecrübe puanı ve altın verir; savaş puanı (SP) yalnızca rakip oyuncu batırınca gelir (src/battle.ts).
    const goldGain=goldGainAch(e.rewardGold*(1+bonus.bounty)),fame=xpGain(e.rewardFame);state.gold+=goldGain;state.fame+=fame;saveAccount();bumpAch('npc');if(e.role==='heavy')bumpAch('heavy');
  rewardNotice(`${e.name} batırıldı · +${fmt(goldGain)} altın · +${fmt(fame)} TP kazanıldı`,'battle',{xp:fame,gold:goldGain,sink:true});if(e.def){recordQuestProgress('npc',e.def.id);levelQuestHit('npc',e.def.id,e.def.tier);}countBossKill(e);if(!e.summoned)setTimeout(spawnEnemy,1800);
}
// Savaş puanı kazancı; rütbe atlanırsa duyurulur
const spText=()=>{const r=battleRank(state.battlePoints);return r.next?`${fmt(state.battlePoints)} / ${fmt(r.next.sp)}`:fmt(state.battlePoints);};
const rivalLog=loadRivalLog();
function gainSp(n:number){const before=battleRank(state.battlePoints).index;state.battlePoints+=n;
  const r=battleRank(state.battlePoints);if(r.index>before){playLevelUp();rewardNotice(`Rütbe atladın: ${r.name} · ${r.index+1}. rütbe madalyası kazanıldı`,'battle');if(ui('captainOverlay').classList.contains('open'))renderRankMedals();}return n;}
function defeatMonster(m:Monster){
  spawnWreck(m);
  playExplosion();const d=m.def;
    const goldGain=goldGainAch(d.gold*(1+bonus.bounty)),fame=xpGain(d.xp);state.gold+=goldGain;state.fame+=fame;saveAccount();bumpAch('monster');
  rewardNotice(`${m.name} yenildi · +${fmt(goldGain)} altın · +${fmt(fame)} TP kazanıldı`,'battle',{xp:fame,gold:goldGain,sink:true});recordQuestProgress('monster',d.id);levelQuestHit('monster',d.id,d.tier);
  const p=randomSeaPoint(900);m.hp=m.maxHp;m.aggro=false;m.burnTimer=0;m.x=p.x;m.y=p.y;m.homeX=m.x;m.homeY=m.y;m.combatTimer=0;selected=null;state.attacking=false;
}
// Kule menzili hiçbir zaman oyuncunun top menzilinin altında kalmaz: kuleye ateş edebilen gemiyi kule de vurur
// (uzun top + geliştirme + donanım kuleyi menzil dışından vuramaz). Saldırı altındaki kule yetenek menzilini (+150) de kapsar.
const TOWER_REACH_MARGIN=60,TOWER_ALERT_REACH=200;
function towerReach(e:Enemy){return Math.max(e.fireRange??460,effectiveRange()+(e.combatTimer>0?TOWER_ALERT_REACH:TOWER_REACH_MARGIN));}
function updateTower(e:Enemy,dt:number){
  const d=dist(e,player),reach=towerReach(e);e.cooldown-=dt;e.combatTimer=Math.max(0,e.combatTimer-dt);e.slowTimer=0;e.burnTimer=Math.max(0,(e.burnTimer??0));
  e.aggro=!mapDef().safe&&(d<reach+30||e.combatTimer>0);
  if(e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+(e.siege?e.maxHp*(e.aggro?.004:.02):fleetTowerRegen(e.maxHp,e.combatTimer>0))*dt);
  if(e.aggro&&d<reach&&e.cooldown<=0&&state.invulnerable<=0){const muzzle=towerMuzzle(e),tx=muzzle.x,ty=muzzle.y,a=Math.atan2(player.y-ty,player.x-tx);
    muzzleFlash(tx,ty,a,60);for(const off of [-.05,.05])shots.push({x:tx,y:ty,vx:Math.cos(a+off)*320,vy:Math.sin(a+off)*320,life:Math.max(2.2,d/320+.5),owner:'enemy',damage:e.damage,hit:false,ammo:theme().fleet==='lava'?'fire':'iron'});
    playEnemyCannon(d,(e.x-player.x)/600);e.cooldown=e.reload+(e.siege?Math.random()*.4:0);}
}
function destroyTower(e:Enemy){
  if(siege){siegeTowerDown(e);return;}
  towersDestroyedHere++;if(e.towerIndex!==undefined)markRuin(towerRuins,currentMap,e.towerIndex);const left=enemies.filter(x=>x.tower).length,f=mapDef().fleet;
  toast(left?`${f.name}: ${left} kule kaldı`:`${f.name} düştü!`);
  if(left>0)return;
  fleetOwners[currentMap]='player';saveFleetOwners(fleetOwners);clearRuins(towerRuins,currentMap);if(guild){guild.towers[currentMap]=Array(TOWER_SLOTS).fill(null);saveGuild(guild);}const r=fleetReward(mapDef().tier);state.gold+=r.gold;state.fame+=r.xp;saveAccount();
  setupFleetIsland();rewardNotice(`${f.name} filona katıldı · +${fmt(r.gold)} altın · +${fmt(r.xp)} TP kazanıldı`,'battle',{xp:r.xp,gold:r.gold});
}
// Filonun diktiği kuleler: tek tip filo kulesi, menzildeki en yakın düşmana top atar.
function updateOwnTowers(dt:number){
  if(!hasFleetIsland()||fleetOwner()!=='player')return;const t=fleetTower(mapDef().tier);
  for(const tw of ownTowers){const def=TOWER_TYPES[tw.type],range=t.range*def.range;
    tw.cooldown-=dt;if(tw.cooldown>0)continue;
    const target=enemies.filter(e=>!e.tower&&dist(e,tw)<range).sort((a,b)=>dist(a,tw)-dist(b,tw))[0]??monsters.find(m=>dist(m,tw)<range);
    if(!target)continue;tw.cooldown=t.reload*def.reload;const muzzle=towerMuzzle(tw),a=Math.atan2(target.y-muzzle.y,target.x-muzzle.x),speed=420;
    muzzleFlash(muzzle.x,muzzle.y,a,60);shots.push({x:muzzle.x,y:muzzle.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:2.8,owner:'player',damage:t.ownDamage*def.damage,hit:false,ammo:theme().fleet==='lava'?'fire':'iron',target});}
}
// Havan: isabet noktasının çevresindeki diğer düşmanlara %60 hasar
function towerSplash(s:Shot,hit:Target){burst(hit.x,hit.y,true);
  for(const o of [...enemies,...monsters] as Target[]){if(o===hit||isAlly(o)||(o.kind==='ship'&&o.tower)||dist(o,hit)>(s.splash??0))continue;const dmg=s.damage*.6;o.hp-=dmg;if(o.kind==='ship')o.lastHitBy='player';damageText(o.x,o.y,dmg);
    if(o.hp<=0){if(o.kind==='ship')sinkEnemy(o);else defeatMonster(o);}}}
let ruinClock=5;
function updateEvents(dt:number){
  ruinClock-=dt;if(ruinClock<=0){ruinClock=5;reviveRivalTowers();}

  updateOwnTowers(dt);
  if(siege)updateSiege(dt);
  eventPanelClock-=dt;if(eventPanelClock>0)return;eventPanelClock=.25;
  const panel=ui('eventPanel'),rows:string[]=[];
  if(siege)rows.push(...siegePanelRows());else{
  const boss=activeBoss(),bd=bossFor(currentMap),bossArt=`<i class="event-art" style="${portraitStyle(BOSS_ATLAS,bd.portrait,MAP_KEYS.length,BOSS_ATLAS_COLS)}"></i>`;
  if(boss)rows.push(`<button class="event-row boss" data-event-route="boss">${bossArt}<span><small>HARİTA BOSSU · ${fmt(Math.round(dist(boss,player)))}m</small><strong>${bd.name}</strong><i><em style="width:${boss.hp/boss.maxHp*100}%"></em></i></span></button>`);
  if(treasure.active||treasure.parts>0){const a=treasure.active;rows.push(`<button class="event-row treasure" data-event-route="treasure"><img src="${TREASURE_ICON}" alt=""/><span><small>${a?'HAZİNE HARİTASI · HEDEF':'HAZİNE HARİTASI PARÇALARI'}</small><strong>${a?`${a.map} · ${a.label}`:`${treasure.parts} / ${TREASURE_PARTS} parça`}</strong>${a?'':`<i><em style="width:${treasure.parts/TREASURE_PARTS*100}%"></em></i>`}</span></button>`);}
  }
  const html=rows.join('');if(html===eventPanelHtml)return;eventPanelHtml=html;
  panel.innerHTML=html;panel.classList.toggle('visible',rows.length>0);
  combatTargetsTop=`${rows.length&&panel.offsetHeight?panel.offsetTop+panel.offsetHeight+4:panel.offsetTop}px`;
  panel.querySelectorAll<HTMLButtonElement>('[data-event-route]').forEach(b=>b.onclick=()=>{if(b.dataset.eventRoute==='treasure'){const a=treasure.active;if(!a){toast('Denizde sürüklenen sandıklardan parça topla');return;}if(a.map!==currentMap){toast(`Hazine ${a.map} ${MAPS[a.map].name} denizinde (${a.label})`);return;}}const f=mapDef().fleet,target=b.dataset.eventRoute==='treasure'?treasure.active!:b.dataset.eventRoute==='boss'?activeBoss():fleetEnterable()?{x:f.x+(player.x<f.x?-430:430),y:f.y-20}:{x:f.x,y:f.y+FLEET_ART.h/2+120};if(!target)return;routeTarget=navigablePoint({x:target.x,y:target.y});destination=routeVia(routeTarget);toast('Rota çizildi');});
}
// ---------------------------------------------------------------- Elit gemiler
// Elit gemilerin ayrı yetenekleri (pasifleri) kaldırıldı; yalnız seviye bonusları (ELITE_REWARDS, eliteBonus) geçerlidir.
function eliteTakenMult(){return 1-eliteBonus().defense;}
function later(t:number,fn:()=>void){abilityQueue.push({t,fn});}
// Korsan Öfkesi: bar dolunca basılır; sonraki 2 salvo %25 güçlü, gemi %15 hızlı ve alevler içinde (en çok 5 sn)
function activateRage(){
  if(rageActive(rage)){toast(`Korsan Öfkesi açık · ${rage.salvos} güçlü salvo kaldı`);return;}
  if(!startRage(rage)){toast(`Öfke barı dolmadı (%${Math.floor(rage.meter)}) — rakip oyuncu ve boss batırdıkça dolar`);return;}
  spawnText(player,'KORSAN ÖFKESİ!','#ff7a2a');spawnRage(player,rage.time);screenTint(.35,'200,40,10');playRage();
  for(let n=0;n<30;n++){const a=Math.random()*Math.PI*2,sp=60+Math.random()*90;particles.push({x:player.x,y:player.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.5,life:.6+Math.random()*.4,maxLife:1,kind:'ember',z:10+Math.random()*30,size:10+Math.random()*14,color:n%2?'#ff6a1a':'#ffd27a'});}
}
function updateRage(dt:number){
  playerHitClock+=dt;
  for(let i=abilityQueue.length-1;i>=0;i--){const q=abilityQueue[i];q.t-=dt;if(q.t<=0){abilityQueue.splice(i,1);q.fn();}}
  const was=rageActive(rage);tickRage(rage,dt);
  if(rageActive(rage)){rageEmber-=dt;while(rageEmber<=0){rageEmber+=1/18;const a=Math.random()*Math.PI*2;particles.push({x:player.x+Math.cos(a)*62,y:player.y+Math.sin(a)*32,vx:(Math.random()-.5)*20,vy:-30-Math.random()*40,life:.45+Math.random()*.3,maxLife:.75,kind:'ember',z:4+Math.random()*24,size:5+Math.random()*6,color:Math.random()<.5?'#ff5a14':'#ffb03a'});}}
  else if(was)clearRageFx();
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
// Pusula: görüş sisini kısa süre kaldırır
let compassReveal=0,compassCooldown=0;
function useCompass(){
  if(compassCooldown>0){toast(`Pusula ${Math.ceil(compassCooldown)} sn sonra hazır`);return;}
  if(arsenal.compass<=0){toast('Pusula kalmadı — Malzemeler\'den alabilirsin');return;}
  arsenal.compass--;saveArsenal(arsenal);renderQuickSlots();compassReveal=COMPASS.reveal;compassCooldown=COMPASS.cooldown;compassPulse=1;playClick();
  toast(`Pusula açıldı · ${COMPASS.reveal} sn boyunca bütün deniz görünür`);
}
let compassPulse=0;
// Mini haritada görünür mü: görüş dairesinin içinde ya da pusula açıkken
const seenOnMap=(p:Vec)=>compassReveal>0||dist(p,player)<=VISION_RADIUS;
function activateAbility(id:'speed'){
  const t=abilityTimers[id],a=ABILITIES[id];
  if(t.cooldown>0){toast(`${a.name} ${Math.ceil(t.cooldown)} sn sonra hazır`);return;}
  if(t.active>0){toast(`${a.name} zaten etkin`);return;}
  if(arsenal.speed<=0){toast(`${a.name} kalmadı — marketten alabilirsin`);return;}
  arsenal.speed--;saveArsenal(arsenal);renderQuickSlots();
  t.active=a.duration;t.cooldown=a.cooldown;// hız iksiri bekleme süresi sabit 30 sn (kaptan bonusları kısaltmaz)
  toast(`${a.name} içildi · kalan ${arsenal.speed.toLocaleString('tr-TR')}`);playSpeed();
  // içildiği an gemiyi saran kısa parıltı patlaması
  if(id==='speed')for(let n=0;n<26;n++){const ang=Math.random()*Math.PI*2,sp=40+Math.random()*70;particles.push({x:player.x,y:player.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp*.5,life:.5+Math.random()*.4,maxLife:.9,kind:'glint',z:10+Math.random()*40,size:8+Math.random()*12,color:n%3?'#5ff3ff':'#ffffff',rot:Math.random()*3});}
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
  for(const e of [...enemies])if(dist(e,mine)<MINE.blastRadius&&!isAlly(e)){e.aggro=true;e.lastHitBy='player';e.combatTimer=12;e.hp-=damage;siegeHit(e,damage,profile.nick);damageText(e.x,e.y,damage);if(e.hp<=0)sinkEnemy(e);}
  for(const m of monsters)if(dist(m,mine)<MINE.blastRadius+m.radius*.5){m.aggro=true;m.combatTimer=12;m.hp-=damage;damageText(m.x,m.y,damage);if(m.hp<=0)defeatMonster(m);}
}
function updateArsenal(dt:number){
  for(const t of Object.values(abilityTimers)){t.active=Math.max(0,t.active-dt);t.cooldown=Math.max(0,t.cooldown-dt);}
  // Hız İksiri etkisi: gemi giderken kıçından süzülüp sönen parıltılı yıldız izi (turkuaz; arada beyaz ve altın)
  if(abilityActive('speed')&&Math.abs(player.speed)>15){glintClock-=dt;while(glintClock<=0){glintClock+=1/90;
    const fx=Math.sin(player.angle),fy=-Math.cos(player.angle),back=30+Math.random()*30,side=(Math.random()-.5)*36,r=Math.random();
    particles.push({x:player.x-fx*back-fy*side,y:player.y-fy*back*.5+fx*side*.5,vx:-fx*12+(Math.random()-.5)*10,vy:-fy*6-6-Math.random()*8,life:.55+Math.random()*.45,maxLife:1,kind:'glint',z:4+Math.random()*34,size:8+Math.random()*14,color:r<.62?'#5ff3ff':r<.86?'#ffffff':'#ffe08a',rot:Math.random()*Math.PI});}}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.life-=dt;m.arm=Math.max(0,m.arm-dt);if(m.life<=0){mines.splice(i,1);continue;}
    if(m.arm<=0&&(enemies.some(e=>dist(e,m)<MINE.triggerRadius)||monsters.some(x=>dist(x,m)<MINE.triggerRadius+x.radius*.6)))detonateMine(i);}
  const burnDps=(SPECIAL_AMMO.fire.burnDps+state.level*30)*bonus.burn;
  for(const e of [...enemies])if(e.burnTimer&&e.burnTimer>0){e.burnTimer-=dt;e.hp-=(e.burnDps||burnDps)*dt;if(e.burnTimer<=0)e.burnDps=0;if(e.hp<=0)sinkEnemy(e);}
  for(const m of monsters)if(m.burnTimer&&m.burnTimer>0){m.burnTimer-=dt;m.hp-=(m.burnDps||burnDps)*dt;if(m.burnTimer<=0)m.burnDps=0;if(m.hp<=0)defeatMonster(m);}
  for(const id of ['speed','mine'] as AbilityId[]){const t=abilityTimers[id],button=document.getElementById(`ability-${id}`);if(!button)continue;
    const cd=Math.min(1,t.cooldown/(ABILITIES[id].cooldown*(id==='speed'?1:bonus.cooldown))),label=t.active>0&&id!=='mine'?`${Math.ceil(t.active)} SN`:t.cooldown>0?`${Math.ceil(t.cooldown)}`:'';// hazırken rozet boş kalır (miktar ve kısayol yazılmaz); yalnızca etkin süre ve bekleme sayılır
    button.style.setProperty('--cd',cd.toFixed(3));button.classList.toggle('active',t.active>0&&id!=='mine');const small=button.querySelector('small');if(small&&small.textContent!==label)small.textContent=label;}
}
// ---------------------------------------------------------------- Başarımlar
function bumpAch(stat:AchStat,n=1){ach.stats[stat]+=n;checkAchievements();}
function setAch(stat:AchStat,v:number){if(v>ach.stats[stat]){ach.stats[stat]=v;checkAchievements();}}
let achSaveAt=0;
function checkAchievements(){
  const fresh=unlockReached(ach);
  for(const d of fresh){state.pearls+=d.pearls;rewardNotice(`Başarım açıldı: ${d.name} · +${fmt(d.pearls)} inci`);}
  if(fresh.length){const hadCollection=achBonusCache.damage>0;achBonusCache=achievementBonus(ach);if(!hadCollection&&achBonusCache.damage>0)rewardNotice('Ana madalya koleksiyonu tamamlandı · +%5 hasar · +%5 can');saveAccount();playLevelUp();saveAchievements(ach);return;}
  const now=performance.now();if(now-achSaveAt>2000){achSaveAt=now;saveAchievements(ach);}
}
function renderAchievements(){
  const b=achBonus();ui('achSummary').innerHTML=`<b>${ach.unlocked.length} / ${ACHIEVEMENTS.length}</b> madalya · Ana koleksiyon ödülü: ${bonusText(b)||'17 madalya tamamlanınca +%5 hasar ve +%5 can'}`;
  renderRankMedals();
  ui('achGrid').innerHTML=ACHIEVEMENTS.map((d,i)=>{const done=ach.unlocked.includes(d.id),v=Math.min(ach.stats[d.stat],d.goal);
    return`<article class="ach-card ${done?'done':''}"><i class="ach-badge" style="${badgeStyle(i)}"></i><div><h4>${d.name}</h4><p>${d.desc}</p><small>${fmt(d.pearls)} İnci</small><span class="ach-bar"><em style="width:${v/d.goal*100}%"></em></span><b>${done?'✓ AÇILDI':`${v.toLocaleString('tr-TR')} / ${d.goal.toLocaleString('tr-TR')}`}</b></div></article>`;}).join('');
}
setAch('level',state.level);
// ---------------------------------------------------------------- Günlük giriş ödülü
let daily=loadDaily();
function dailyText(r:DailyReward){return[r.gold&&`${r.gold.toLocaleString('tr-TR')} Altın`,r.pearls&&`${fmt(r.pearls)} İnci`,r.chain&&`${fmt(r.chain)} Zincir Güllesi`,r.fire&&`${fmt(r.fire)} Ateş Güllesi`,r.breaker&&`${fmt(r.breaker)} Kule Kırıcı`,r.powder&&`${fmt(r.powder)} Kara Barut`,r.shield&&`${fmt(r.shield)} Kalkan`,r.equip&&'Sıradan Donanım'].filter(Boolean) as string[];}
const REWARD_ICONS:[string,string][]=[['Altın','icon-gold-v1'],['İnci','icon-pearl-v1'],['Zincir','ammo-chain-v2'],['Ateş','ammo-fire-v2'],['Alev','ammo-fire-v2'],['Patlayıcı','ammo-explosive-v2'],['Kule Kırıcı','ammo-breaker-v2'],['Barut','icon-powder-v4'],['Kalkan','icon-shield-v3'],['Hız','icon-speed-potion-v2'],['Donanım','icon-anvil-v2']];
function rewardLi(t:string){const ic=REWARD_ICONS.find(([k])=>t.includes(k));return`<li>${ic?`<img src="/assets/${ic[1]}.webp" alt="" draggable="false"/>`:''}<span>${t}</span></li>`;}
function openDaily(){renderDaily();ui('dailyOverlay').classList.add('open');}
function closeDaily(){ui('dailyOverlay').classList.remove('open');}
function renderDaily(){
  renderFestival();
  const st=dailyStatus(daily);
  ui('dailyGrid').innerHTML=[1,2,3,4,5,6,7].map(d=>{const r=dailyReward(d,state.level),done=d<st.day||(d===st.day&&!st.canClaim),today=d===st.day&&st.canClaim;
    return`<article class="daily-day ${done?'done':''} ${today?'today':''} ${d===7?'grand':''}"><b>${d}. GÜN</b><ul>${dailyText(r).map(rewardLi).join('')}</ul>${today?'<button id="claimDaily">TOPLA</button>':done?'<span class="tick">✓ ALINDI</span>':'<span class="lock">SIRADA</span>'}</article>`;}).join('');
  ui('dailyNote').textContent=st.canClaim?'Bugünün ödülü hazır. Yarın gelmezsen takvim 1. güne döner.':'Bugünün ödülünü aldın. Yarın yeni ödül seni bekliyor.';
  const b=document.getElementById('claimDaily');if(b)b.onclick=claimToday;
}
function claimToday(){
  const st=dailyStatus(daily);if(!st.canClaim)return;const r=dailyReward(st.day,state.level);daily=claimDaily(daily);saveDaily(daily);setAch('daily',daily.streak);
  if(r.gold)state.gold+=r.gold;if(r.pearls)state.pearls+=r.pearls;if(r.chain)state.chainAmmo+=r.chain;
  for(const k of ['fire','breaker','powder','shield'] as const)if(r[k])arsenal[k]+=r[k]!;
  let eq='';if(r.equip){const pool=EQUIPMENT.filter(e=>e.rarity===0),e=pool[Math.floor(Math.random()*pool.length)];equipOwned[e.id]=(equipOwned[e.id]??0)+1;eq=e.name;}
  saveArsenal(arsenal);saveAccount();renderQuickSlots();updateUI();playCoins();renderDaily();
  rewardNotice(`Günlük ödül · ${st.day}. gün · ${dailyText(r).map(t=>t==='Sıradan Donanım'?eq:t).join(' · ')}`);
}
// ---- Açılış Festivali: ilk 7 gün, her gün giriş yapana özel ödül; 7/7 olana Pirate Rage tasarımı
let festival=loadFestival(ELITE_TEST_MODE);
function festivalText(r:FestivalReward){return[r.gold&&`${r.gold.toLocaleString('tr-TR')} Altın`,r.pearls&&`${fmt(r.pearls)} İnci`,r.chain&&`${fmt(r.chain)} Zincir Güllesi`,r.fire&&`${fmt(r.fire)} Alev Güllesi`,r.explosive&&`${fmt(r.explosive)} Patlayıcı Gülle`,r.speed&&`${fmt(r.speed)} Hız İksiri`,r.design&&'PIRATE RAGE özel gemi tasarımı'].filter(Boolean) as string[];}
function renderFestival(){
  let box=document.getElementById('festivalBox');
  const st=festival?festivalStatus(festival):null;
  if(!festival||!st||st.day<1||st.day>FESTIVAL_DAYS){box?.remove();return;}
  if(!box){box=document.createElement('div');box.id='festivalBox';box.className='festival-box';ui('dailyGrid').before(box);}
  const days=FESTIVAL_REWARDS.map((r,i)=>{const d=i+1,done=festival!.claimed.includes(d),today=d===st.day&&st.canClaim,missed=st.missed.includes(d),grand=d===FESTIVAL_DAYS;
    return`<article class="daily-day festival-day ${done?'done':''} ${today?'today':''} ${missed?'missed':''} ${grand?'grand':''}"><b>${d}. GÜN</b>${grand?`<img src="${PIRATE_RAGE_DESIGN.card}" alt="" draggable="false"/>`:''}<ul>${festivalText(r).filter(t=>!t.startsWith('PIRATE')).map(rewardLi).join('')}${r.design?'<li class="design">PIRATE RAGE</li>':''}</ul>${today?'<button id="claimFestival">AL</button>':missed?'<em>KAÇIRILDI</em>':''}</article>`;}).join('');
  const note=st.grandLost?'Bir festival günü kaçırıldı: son ödül (Pirate Rage) artık kazanılamaz, diğer günlerin ödüllerini almaya devam edebilirsin.':`Festivalin ${st.day}. günü · ${festival.claimed.length}/${FESTIVAL_DAYS} gün. 7 günün hepsine gelen Pirate Rage özel gemisini kazanır; bu ödüller bir daha verilmez.`;
  box.innerHTML=`<h3>AÇILIŞ FESTİVALİ</h3><div class="daily-grid">${days}</div><p class="daily-note">${note}</p><h3 class="festival-sub">GÜNLÜK ÖDÜL</h3>`;
  const b=document.getElementById('claimFestival');if(b)b.onclick=claimFestivalToday;
}
function claimFestivalToday(){
  if(!festival)return;const r=claimFestival(festival);if(!r)return;saveFestival(festival);
  if(r.gold)state.gold+=r.gold;if(r.pearls)state.pearls+=r.pearls;if(r.chain)state.chainAmmo+=r.chain;
  for(const k of ['fire','explosive','speed'] as const)if(r[k])arsenal[k]+=r[k]!;
  if(r.design){designOwned=true;saveDesignOwned();}
  saveArsenal(arsenal);saveAccount();renderQuickSlots();updateUI();playCoins();renderDaily();
  rewardNotice(`Açılış Festivali · ${festival.claimed.length}. ödül · ${festivalText(r).join(' · ')}`);
  if(r.design)toast('PIRATE RAGE özel gemisi senin! Tersane → Özel Gemiler');
}
// Oyun açılınca, bugünün günlük ya da festival ödülü alınmadıysa takvim kendiliğinden açılır
setTimeout(()=>{if(dailyStatus(daily).canClaim||(festival&&festivalStatus(festival).canClaim))openDaily();},1600);
// ---------------------------------------------------------------- Hazine avı
const treasure=loadTreasure();let dig:{t:number;x:number;y:number}|null=null;
function rollTreasurePart(){
  if(Math.random()>=PART_CHANCE)return;treasure.parts++;
  if(treasure.parts>=TREASURE_PARTS&&!treasure.active){treasure.parts-=TREASURE_PARTS;treasure.active=pickTreasureSpot();rewardNotice(`Hazine haritası tamamlandı · ${treasure.active.map} · ${treasure.active.label}`);toast(`Hazine ${MAPS[treasure.active.map].name} denizinde, ${treasure.active.label} koordinatında!`);}
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
  rewardNotice(`Hazine bulundu · +${fmt(r.gold)} altın · +${fmt(r.pearls)} inci${r.equip?` · +${equipById(r.equip)!.name}`:''}`,'gain',{gold:r.gold});
}
function drawTreasureMark(){
  const a=treasure.active;if(!a||a.map!==currentMap||dist(player,a)>380)return;const s=worldToScreen(a),t=performance.now()/1000;
  ctx.save();ctx.strokeStyle=`rgba(241,198,98,${.35+Math.sin(t*3)*.2})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y,DIG_RADIUS*camera.zoom,DIG_RADIUS*camera.zoom*.6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#c0291a';ctx.lineWidth=6;ctx.lineCap='round';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(s.x-12,s.y-12);ctx.lineTo(s.x+12,s.y+12);ctx.moveTo(s.x+12,s.y-12);ctx.lineTo(s.x-12,s.y+12);ctx.stroke();ctx.restore();
}
function updateLootChests(dt:number){
  for(let i=lootChests.length-1;i>=0;i--){const c=lootChests[i];c.life-=dt;
    if(dist(c,player)<CHEST_PICKUP_RADIUS){lootChests.splice(i,1);playCoins();recordQuestProgress('chest',currentMap);rollTreasurePart();bumpAch('chest');c.gold=Math.round(c.gold*bonus.chestGold*goldMult());state.gold+=c.gold;state.chainAmmo+=c.chain;state.pearls+=c.pearls;saveAccount();renderQuickSlots();burst(c.x,c.y);rewardNotice(`${c.kind==='gilded'?'Yaldızlı sandık':'Ganimet sandığı'} toplandı · ${chestRewardText(c)}`,'gain',{gold:c.gold});if(destination&&Math.hypot(destination.x-c.x,destination.y-c.y)<2)destination=null;continue;}
    if(c.life<=0)lootChests.splice(i,1);}
  driftClock-=dt;
  if(driftClock<=0){driftClock=DRIFT_RESPAWN_SECONDS;if(lootChests.filter(c=>c.source==='drift').length<4){const p=randomSeaPoint(260);lootChests.push(createChest('drift',p.x,p.y,bonus.gilded,1+.5*(mapDef().tier-1)));}}
}
// Deniz pırıltıları (Seafight tarzı): denizde parlayan inciler; üzerinden geçince küçük ödül verir, yenisi rastgele yerde çıkar.
function spawnSparkle(){const p=randomSeaPoint(200);sparkles.push({x:p.x,y:p.y,seed:Math.random(),born:performance.now()});}
function updateSparkles(dt:number){
  for(let i=sparkles.length-1;i>=0;i--){const g=sparkles[i];if(dist(g,player)>SPARKLE_PICKUP)continue;sparkles.splice(i,1);playCoins();
    const loot=1,light=NPCS[mapDef().npcs[0]],gold=Math.max(1,Math.round(light.gold*(.1+Math.random()*.1)*loot*goldMult())),xp=Math.max(1,Math.round(light.xp*.15)),pearl=Math.random()<.2?1:0;
    state.gold+=gold;state.fame+=xp;state.pearls+=pearl;recordQuestProgress('sparkle',currentMap);saveAccount();playCoins();
    for(let n=0;n<8;n++){const a=Math.random()*Math.PI*2,sp=30+Math.random()*50;particles.push({x:g.x,y:g.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.5,maxLife:.5,kind:'foam'});}
    particles.push({x:g.x,y:g.y-10,vx:0,vy:-26,life:1.1,maxLife:1.1,kind:'damage',text:`+${fmt(gold)} Altın${pearl?' +1 İnci':''} +${fmt(xp)} TP`});
    if(routeTarget&&dist(routeTarget,g)<4){routeTarget=null;destination=null;}
    sparkleQueue.push(SPARKLE_RESPAWN/sparkleMult());}
  for(let i=sparkleQueue.length-1;i>=0;i--){sparkleQueue[i]-=dt;if(sparkleQueue[i]<=0){sparkleQueue.splice(i,1);spawnSparkle();}}
}
function drawSparkle(g:{x:number;y:number;seed:number;born:number}){const s=worldToScreen(g),now=performance.now();drawSeaSparkle(ctx,s.x,s.y,now,g.seed,Math.min(1,(now-g.born)/600));}
function drawLootChest(c:LootChest){const s=worldToScreen(c),fading=c.life<6?(Math.floor(c.life*4)%2?.35:.85):1;drawChestSprite(ctx,c.kind,s.x,s.y,performance.now(),fading);}
// Harita kenarı: komşu deniz varsa parıldayan geçiş şeridi, yoksa sis duvarı
function drawMapEdges(){
  const t=performance.now()/1000;
  // Harita sınırının dışı deniz değil: simsiyah boşluk ve ince kenar çizgisi, oyuncu haritanın bittiğini görsün
  {const a=worldToScreen({x:0,y:0}),b=worldToScreen({x:WORLD_WIDTH,y:WORLD_HEIGHT}),w=innerWidth,h=innerHeight,vw=w/camera.zoom,vh=h/camera.zoom,L=w/2-vw/2-2,T=h/2-vh/2-2,R=w/2+vw/2+2,B=h/2+vh/2+2;
    ctx.fillStyle='#000';if(a.x>L)ctx.fillRect(L,T,a.x-L,B-T);if(b.x<R)ctx.fillRect(b.x,T,R-b.x,B-T);if(a.y>T)ctx.fillRect(L,T,R-L,a.y-T);if(b.y<B)ctx.fillRect(L,b.y,R-L,B-b.y);
    ctx.strokeStyle='rgba(232,200,130,.35)';ctx.lineWidth=2;ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);}
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
// Elit gemiler 4 çapraz görünüşle çizilir (ELITE_ISO); görünüş son gidilen çapraza göre seçilir
const eliteIsoImages=new Map<string,HTMLImageElement>();
function eliteIsoImage(src:string){let im=eliteIsoImages.get(src);if(!im){im=new Image();im.decoding='async';im.src=`${src}?r=${SHIP_ART_REV}`;eliteIsoImages.set(src,im);}return im;}
const shipAlpha=()=>1;
function drawEliteDirectionalShip(s:Vec){
  const iso=activeSpecialDesign?PIRATE_RAGE_DESIGN.sprite:ELITE_ISO[eliteShip().id];
  {const im=eliteIsoImage(iso);if(!im.complete||!im.naturalWidth)return false;
    ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1)*shipAlpha();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    // Gölge bulanıklığı yok (keskin kenar); gemi altındaki su havuzu gölgeyi verir. Kaynak kare 512 px: yakınlaştırmada da net
    const c=im.naturalHeight,D=158;ctx.drawImage(im,isoIndex()*c,0,c,c,-D/2,-D*.7,D,D);ctx.restore();return true;}
  return false;
}
function drawPlayerShip(){
  const s=worldToScreen(player);
  if((activeSpecialDesign||eliteEnabled())&&drawEliteDirectionalShip(s))return;
  // Elit atlas yüklenene kadar aynı yön karesindeki başlangıç gemisi görünür kalır; gemi asla kaybolmaz.

  if(!directionalShipImage.complete||!directionalShipImage.naturalWidth){
    if(!playerShipImage.complete||!playerShipImage.naturalWidth){drawShip(player,player.angle,'#173f48',1.1);return;}
  }
  ctx.save();ctx.translate(s.x,s.y);ctx.shadowColor='#000b';ctx.shadowBlur=13;ctx.globalAlpha=(state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1)*shipAlpha();
  if(directionalShipImage.complete&&directionalShipImage.naturalWidth){
    const frame=shipDirectionFrame(isoFaceAngle(isoFace)),sx=(frame%4)*256,sy=Math.floor(frame/4)*256;
    ctx.drawImage(directionalShipImage,sx,sy,256,256,-80,-86,160,160);
  }else ctx.drawImage(playerShipImage,-75,-80,150,150);
  ctx.restore();
}
function drawIsland(i:WorldIsland){const s=worldToScreen(i);if(drawIslandSprite(ctx,i,s.x,s.y))return;const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,i.r);g.addColorStop(0,'#617c4e');g.addColorStop(.5,'#3c593e');g.addColorStop(.66,'#b9a16b');g.addColorStop(.72,'#17434a');g.addColorStop(1,'#0b2b35');ctx.fillStyle=g;ctx.beginPath();for(let n=0;n<18;n++){const a=n/18*Math.PI*2,r=i.r*(.78+Math.sin(n*4.7)*.09);const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();for(let n=0;n<7;n++){const a=n*2.1,r=i.r*.38;ctx.fillStyle='#213c2d';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,7+n%3*2,0,7);ctx.fill();}}
function drawMonster(m:Monster){const s=worldToScreen(m);if(drawMonsterSheet(ctx,m.def,s.x,s.y,m.phase)){ctx.fillStyle=theme().label;ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-m.radius-18);ctx.shadowBlur=0;if(m.hp<m.maxHp){ctx.fillStyle='#07161c';ctx.fillRect(s.x-30,s.y-m.radius-12,60,5);ctx.fillStyle='#b070ff';ctx.fillRect(s.x-30,s.y-m.radius-12,60*m.hp/m.maxHp,5);}return;}}
// İç adanın arkasında bir gemi varsa kale ve üst kule kaideleri gemilerin üstüne yeniden çizilir; o kaidelerdeki kuleler de
function drawFleetOccluders(){if(!hasFleetIsland())return;const f=mapDef().fleet,behind=(v:Vec)=>Math.abs(v.x-f.x)<380&&v.y-f.y<-88&&v.y-f.y>-250;
  if(!behind(player)&&!enemies.some(e=>!e.tower&&behind(e)))return;const s=worldToScreen(f);drawFleetOccluder(ctx,theme().fleet,s.x,s.y);
  for(const e of enemies)if(e.tower&&(e.towerIndex===12||e.towerIndex===13)){const p=worldToScreen(e);drawBastion(ctx,e.towerIndex,p.x,p.y);}
  if(fleetOwner()==='player')for(const tw of ownTowers)if(tw.slot===12||tw.slot===13){const p=worldToScreen(tw);drawBuiltTower(ctx,TOWER_TYPES[tw.type].frame,tw.slot,p.x,p.y);}}
function drawFleetIsland(){
  if(!hasFleetIsland())return;const f=mapDef().fleet,s=worldToScreen(f),th=theme().fleet,owned=fleetOwner()==='player';
  const baseOk=drawFleetBase(ctx,th,s.x,s.y);
  if(owned)for(const tw of [...ownTowers].sort((a,b)=>a.y-b.y)){const p=worldToScreen(tw);drawBuiltTower(ctx,TOWER_TYPES[tw.type].frame,tw.slot,p.x,p.y);}
  if(!baseOk){ctx.fillStyle='#4a7a3c';ctx.beginPath();ctx.ellipse(s.x,s.y,FLEET_ART.w/2,FLEET_ART.h/2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3a3c42';ctx.lineWidth=18;ctx.beginPath();ctx.arc(s.x,s.y,FLEET.wallR,Math.PI/2+FLEET.gap/2,Math.PI/2-FLEET.gap/2+Math.PI*2);ctx.stroke();}
  ctx.textAlign='center';ctx.font='700 14px Cinzel';ctx.fillStyle=owned?'#9fe8dc':'#f0b8a8';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.name,s.x,s.y-FLEET_ART.h/2-24);ctx.font='700 9px Inter';ctx.fillText(owned?'FİLO ADAN · LAGÜNDE ONARIM':fleetEnterable()?'RAKİP FİLO · TEST: GİRİŞ AÇIK (DOĞU VE BATI KAPILARI)':'RAKİP FİLO · GİRİŞ YASAK',s.x,s.y-FLEET_ART.h/2-10);ctx.shadowBlur=0;
}
// ---- atış ve savaş efektleri (src/vfx.ts atlası)
const UNDER=new Set<ParticleKind>(['foam','bubble','plank','target']);
function targetExistsOrPlayer(t:Target|typeof player){return t===player||targetExists(t as Target);}
function shotHeight(s:Shot){if(!s.flight)return 0;const p=Math.min(1,(s.age??0)/s.flight);return (s.arc??0)*4*p*(1-p);}
function drawShotShadow(s:Shot){const p=worldToScreen(s),h=shotHeight(s),k=1-Math.min(.5,h/160);drawVfx(ctx,'shadow',p.x,p.y+2,16*k,{alpha:.6*k});}
// Gülleler: kullanıcının mühimmat ikonlarıyla aynı tarzdaki uçuş görselleri (shotArt.ts); iz görselin içindedir.
function drawShotBall(s:Shot){const p=worldToScreen(s),y=p.y-shotHeight(s),spin=(s.age??0)*16,a=Math.atan2(s.vy,s.vx);
  if(s.visual==='spit'){drawVfx(ctx,'spit',p.x,y,34,{rot:spin*.2});return;}
  const look=s.owner==='enemy'&&!s.captain?(s.ammo==='fire'?'fire':'iron'):s.ammo==='chain'||s.ammo==='fire'||s.ammo==='explosive'||s.ammo==='breaker'||s.ammo==='leech'?s.ammo:'iron';
  drawShotSprite(ctx,look,p.x,y,a);}
function drawParticle(p:Particle){if(!onScreen(p,260))return;const s=worldToScreen(p),a=Math.max(0,Math.min(1,p.life/p.maxLife)),y=s.y-(p.z??0),size=p.size;
  switch(p.kind){
    case 'damage':ctx.globalAlpha=a;ctx.font='800 15px Inter';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000c';ctx.strokeText(p.text||'',s.x,y);ctx.fillStyle=p.color||DMG_GOLD;ctx.fillText(p.text||'',s.x,y);ctx.globalAlpha=1;return;
    case 'flash':drawShotSprite(ctx,'muzzle',s.x,y,p.rot??0,(size??40)/40*(.8+.35*(1-a)),Math.min(1,a*1.6));return;
    case 'smoke':drawVfx(ctx,'smoke',s.x,y,(size??22)*(1+(1-a)*1.1),{alpha:a*.75,variant:p.variant??0,rot:p.rot});return;
    case 'spark':drawVfx(ctx,'ember',s.x,y,size??12,{alpha:a});return;
    case 'flare':drawFlare(ctx,s.x,y,(size??80)*(.55+.45*(1-a)),Math.min(1,a*1.5));return;
    case 'ember':drawFlare(ctx,s.x,y,(size??7)*(1.2+.8*a),Math.min(1,a*1.4));return;
    case 'glint':drawGlint(ctx,s.x,y,(size??10)*(.5+.5*Math.sin(Math.min(1,a)*Math.PI)),p.color??'#5ff3ff',a,p.rot??0);return;
    case 'wisp':drawPuff(ctx,s.x,y,(size??6)*(.6+(1-a)*1.2),a*.45);return;
    case 'foam':drawVfx(ctx,'foam',s.x,y,(size??18)*(1+(1-a)*.8),{alpha:a*.85,variant:p.variant??0});return;
    case 'target':drawVfx(ctx,'target',s.x,y,(size??100)*(1.15-.15*(1-a)),{alpha:.55+.35*Math.sin(performance.now()/90)});return;
    case 'shock':drawVfx(ctx,'shock',s.x,y,(size??200)*(.4+.6*(1-a)),{alpha:a});return;
    case 'soul':drawVfx(ctx,'soul',s.x,y,size??24,{alpha:Math.min(1,a*1.8)});return;
    case 'splinter':drawVfx(ctx,'splinter',s.x,y,size??24,{rot:p.rot,alpha:Math.min(1,a*2),variant:p.variant??0});return;
    default:drawVfx(ctx,p.kind as 'bubble'|'plank'|'firePuff'|'poison',s.x,y,(size??18)*(p.kind==='firePuff'?.6+a*.6:1),{rot:p.rot,alpha:Math.min(1,a*1.6)});}}
// ---------------------------------------------------------------- Test kaptanları
// Yalnızca test modunda 1/1'de: elit gemili üç yapay kaptan birbirleriyle ve oyuncuyla serbest savaşır. Farklı gülleler
// seçer; batınca 5 sn sonra yeniden denize çıkar.
// (sabitler fonksiyon içinde: harita kurulumu bu bölümden önce de çalışabilir)
function spawnTestCaptains(){if(!ELITE_TEST_MODE||currentMap!=='1/1')return;
  const TEST_CAPTAINS:[string,EliteShipId][]=[['ADM_AHMET','magma'],['ADM_YASİN','tempest'],['ADM_DOGAN','glacial']];
  TEST_CAPTAINS.forEach(([name,elite],i)=>{const a=i/3*Math.PI*2,x=WORLD_WIDTH/2+Math.cos(a)*700,y=WORLD_HEIGHT/2+Math.sin(a)*380;
    enemies.push({kind:'ship',role:'heavy',x,y,angle:0,hp:400000,maxHp:400000,cooldown:1+i*.6,speed:150,damage:1100,reload:2.3,rewardGold:0,rewardFame:0,color:'#79372f',name,tier:8,aggro:true,wander:0,slowTimer:0,homeX:x,homeY:y,combatTimer:999,hitRadius:44,
      captain:{elite,ammo:'iron',ammoClock:2+i*2,foe:null,orbit:null,orbitClock:0},face:{east:Math.cos(a)<0,north:Math.sin(a)>0}});});}
const captainFoeOf=(e:Enemy)=>e.captain!.foe&&enemies.includes(e.captain!.foe)?e.captain!.foe:null;
function updateCaptain(e:Enemy,dt:number){const c=e.captain!;e.slowTimer=Math.max(0,e.slowTimer-dt);
  if((e.frozen??0)>0){e.frozen=Math.max(0,e.frozen!-dt);return;}
  // hedef: en yakın rakip (diğer kaptanlar ve oyuncu); oyuncu hedefse foe boş kalır
  // oyuncu 1,6 kat uzak sayılır: kaptanlar önce birbirleriyle çatışır
  let best:Enemy|null=null,bd=dist(e,player)*1.6;for(const o of enemies)if(o!==e&&o.captain){const d=dist(e,o);if(d<bd){bd=d;best=o;}}
  if(c.foe!==best&&Math.random()<dt*.6)c.foe=best;const foe:Vec=captainFoeOf(e)??player,d=dist(e,foe);
  // hareket: uzaksa yaklaş, menzildeyse rakibin çevresinde dolaş (Seafight merdiven adımları)
  c.orbitClock-=dt;if(!c.orbit||c.orbitClock<=0||dist(e,c.orbit)<30){const r=d>560?Math.max(0,d-360):360+Math.random()*60,a=Math.atan2(e.y-foe.y,e.x-foe.x)+(Math.random()<.5?-1:1)*(.6+Math.random()*.6);
    c.orbit={x:clamp(foe.x+Math.cos(a)*r,80,WORLD_WIDTH-80),y:clamp(foe.y+Math.sin(a)*r,80,WORLD_HEIGHT-80)};c.orbitClock=2.5+Math.random()*2;e.iso=null;
    // savaş alanından (doğduğu yer) 650 birimden fazla uzaklaşmaz
    const hx=c.orbit.x-e.homeX,hy=c.orbit.y-e.homeY,hl=Math.hypot(hx,hy);if(hl>650){c.orbit.x=e.homeX+hx/hl*650;c.orbit.y=e.homeY+hy/hl*650;}}
  e.face??={east:true,north:false};const st=isoAdvance(e.iso??null,e.x,e.y,c.orbit.x,c.orbit.y,e.speed*(e.slowTimer>0?.55:1)*1.4,dt,e.face);e.iso=st.m;
  if(st.done)c.orbitClock=0;else{e.x=clamp(e.x+st.mx,40,WORLD_WIDTH-40);e.y=clamp(e.y+st.my,40,WORLD_HEIGHT-40);}
  // üst üste binmesin: diğer kaptanlardan ve oyuncudan en az 170 birim uzak durur
  for(const o of [player,...enemies.filter(x=>x.captain&&x!==e)] as Vec[]){const dx=e.x-o.x,dy=e.y-o.y,dd=Math.hypot(dx,dy)||1;if(dd<170){const k=(170-dd)*Math.min(1,dt*3);e.x+=dx/dd*k;e.y+=dy/dd*k*.6;}}
  // gülle değiştirme
  c.ammoClock-=dt;if(c.ammoClock<=0){c.ammoClock=5+Math.random()*4;const all:AmmoKind[]=['iron','chain','fire','explosive','breaker','leech'];c.ammo=all[Math.floor(Math.random()*all.length)];}
  e.cooldown-=dt;if(d<470&&e.cooldown<=0)captainFire(e,foe);}
function captainFire(e:Enemy,foe:Vec){const c=e.captain!,a=Math.atan2(foe.y-e.y,foe.x-e.x),fe=captainFoeOf(e);
  playEnemyCannon(dist(e,player),(e.x-player.x)/600);muzzleFlash(e.x+Math.cos(a)*30,e.y+Math.sin(a)*30-10,a,44);
  for(let k=0;k<3;k++){const off=(k-1)*.06;later(k*.08,()=>{if(!enemies.includes(e))return;
    shots.push({x:e.x,y:e.y,vx:Math.cos(a+off)*300,vy:Math.sin(a+off)*300,life:2.4,owner:'enemy',damage:e.damage*(.85+Math.random()*.3)*(c.ammo==='iron'?1:1.4),hit:false,ammo:c.ammo,captain:e,foe:fe??undefined});});}
  e.cooldown=e.reload*(.9+Math.random()*.3);}
// kaptan güllesi başka bir kaptana isabet etti
function captainHit(t:Enemy,s:Shot,from:Enemy|null){const dmg=Math.round(s.damage);t.hp-=dmg;t.lastHitBy='captain';if(from)siegeHit(t,dmg,from.name);damageText(t.x,t.y,dmg,DMG_RED);burst(t.x,t.y);
  if(s.ammo==='chain')t.slowTimer=CHAIN_SLOW.seconds;
  if(s.ammo==='leech'&&from){const h=leechHeal(dmg,true,from.maxHp);if(h>0){from.hp=Math.min(from.maxHp,from.hp+h);spawnSoul(t,from);}}
  if(from&&t.captain&&!t.captain.foe)t.captain.foe=from;if(t.hp<=0)sinkEnemy(t);}
function drawCaptain(e:Enemy,s:Vec){const c=e.captain!,im=eliteIsoImage(ELITE_ISO[c.elite]);if(!im.complete||!im.naturalWidth)return;
  const f=e.face??{east:true,north:false},idx=f.north?(f.east?0:3):(f.east?1:2),h=im.naturalHeight,D=158;
  drawHullWater(e,100);ctx.save();ctx.translate(s.x,s.y);if((e.frozen??0)>0)ctx.filter='saturate(.4) brightness(1.3) hue-rotate(160deg)';ctx.drawImage(im,idx*h,0,h,h,-D/2,-D*.7,D,D);ctx.restore();
  const top=-122;drawHealthBar(s.x,s.y+top,80,e.hp/e.maxHp,siege?'#4fd18a':'#f0584a');{const sp=TEST_RANKERS.find(r=>r.nick===e.name)?.sp??0,show=!settings.hideOthersInsignia;drawCaptainName(s.x,s.y+top-11,'',e.name,14,show?battleRank(sp).index:-1);if(show)drawInsignia(s.x,s.y+34,Math.round(sp/25),115);}}
// Capture once at death, then fade the same pose without new particles or assets.
function spawnWreck(o:Enemy|Monster){
  if(!onScreen(o,320))return;
  const image=document.createElement('canvas');image.width=image.height=384;
  const c=image.getContext('2d');if(!c)return;c.translate(192,230);
  let drawn=false;
  if(o.kind==='monster')drawn=drawMonsterSheet(c,o.def,0,0,o.phase);
  else if(o.captain){const im=eliteIsoImage(ELITE_ISO[o.captain.elite]);if(im.complete&&im.naturalWidth){const f=o.face??{east:true,north:false},idx=f.north?(f.east?0:3):(f.east?1:2),h=im.naturalHeight;c.drawImage(im,idx*h,0,h,h,-79,-158*.7,158,158);drawn=true;}}
  else if(o.def)drawn=drawNpcShip(c,o.def.sprite,o.def.span,0,0,npcFaceAngle(o),performance.now());
  if(!drawn)return;if(wrecks.length>=MAX_WRECKS)wrecks.shift();
  wrecks.push({x:o.x,y:o.y,image,t:0});
}
function drawWreck(w:Wreck){
  if(!onScreen(w,320))return;
  const s=worldToScreen(w),k=Math.min(1,w.t/WRECK_TIME),fade=k*k*(3-2*k);
  ctx.save();ctx.globalAlpha=1-fade;ctx.drawImage(w.image,s.x-192,s.y-230+k*12);ctx.restore();
}
// ---------------------------------------------------------------- Gemi–su etkileşimi
// Her geminin altında yalnızca önceden çizilmiş yumuşak su gölgesi (performans için dümen suyu izi ve köpük yok).
// Seafight gibi 2:1 izometrik kamera: deniz düzlemi yarıya basık (şamandıra halkaları ve dikey/yatay hız oranından ölçüldü)
const FLAT=.5;
const hullLength=(o:object)=>o===player?100:(o as Enemy).boss?165:(o as Enemy).def?(o as Enemy).def!.span*.6:60;
// Ekran dışı çizim atlanır: görüş alanı + pay (dünya birimi)
// NPC görünüşü: oyuncu gemisi gibi 4 çapraz; yön sayfasındaki KD/GD/GB/KB kareleri
// 4 çapraz yüzün 8 yönlü sayfadaki karşılığı (4 görünüşlü görseli olmayan gemiler için)
const isoFaceAngle=(f:IsoFace)=>f.north?(f.east?Math.PI/4:-Math.PI/4):(f.east?Math.PI*3/4:-Math.PI*3/4);
const npcFaceAngle=(e:Enemy)=>isoFaceAngle(e.face??{east:Math.sin(e.angle)>=0,north:Math.cos(e.angle)>0});
function onScreen(v:Vec,m:number){const hw=innerWidth/2/camera.zoom+m,hh=innerHeight/2/camera.zoom+m;return Math.abs(v.x-camera.x)<hw&&Math.abs(v.y-camera.y)<hh;}
const HULL_SHADOW=(()=>{const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d')!,r=g.createRadialGradient(64,64,6,64,64,64);
  r.addColorStop(0,'rgba(2,14,20,.34)');r.addColorStop(1,'rgba(2,14,20,0)');g.fillStyle=r;g.scale(1,.5);g.fillRect(0,0,128,128);return c;})();
function drawHullWater(o:{x:number;y:number;angle:number},L:number){
  const s=worldToScreen(o),fx=Math.sin(o.angle),fy=-Math.cos(o.angle)*FLAT,len=(L*.5*Math.hypot(fx,fy)+L*.14)*1.05,wid=L*.19*1.6;
  ctx.save();ctx.translate(s.x,s.y+4);ctx.rotate(Math.atan2(fy,fx));ctx.drawImage(HULL_SHADOW,-len,-wid,len*2,wid*2);ctx.restore();}
// Can çubuğu: çerçeveli, türüne göre renkli ve genişlikte
function drawHealthBar(x:number,y:number,width:number,frac:number,color:string){
  ctx.fillStyle='rgba(3,12,16,.85)';ctx.fillRect(x-width/2-2,y-2,width+4,10);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(x-width/2,y,width,6);ctx.strokeStyle='rgba(232,200,130,.55)';ctx.lineWidth=1;ctx.strokeRect(x-width/2-2.5,y-2.5,width+5,11);
  const g=ctx.createLinearGradient(0,y,0,y+6);g.addColorStop(0,'#ffffff55');g.addColorStop(.5,'#ffffff00');g.addColorStop(1,'#00000040');ctx.fillStyle=color;ctx.fillRect(x-width/2,y,width*Math.max(0,Math.min(1,frac)),6);ctx.fillStyle=g;ctx.fillRect(x-width/2,y,width*Math.max(0,Math.min(1,frac)),6);}
// Boss: tema renkli nabız halesi, kara amiral sancağı ve geniş adlı can plakası
function drawBossAura(_e:Enemy,s:{x:number;y:number}){const t=performance.now()/1000,tint=theme().tint,g=ctx.createRadialGradient(s.x,s.y,30,s.x,s.y,170);
  g.addColorStop(0,tint+'00');g.addColorStop(.62,tint+Math.round((.09+Math.sin(t*2.6)*.04)*255).toString(16).padStart(2,'0'));g.addColorStop(1,tint+'00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s.x,s.y+8,170,170*FLAT,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=tint+'88';ctx.lineWidth=2;ctx.setLineDash([14,10]);ctx.lineDashOffset=t*30;ctx.beginPath();ctx.ellipse(s.x,s.y+8,150,150*FLAT,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
}
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
// Seçim halkaları (geminin altında, deniz üstünde; hafif perspektif için elips).
// Hedef: mavi parlayan halka + 4 çentik + dönen sarı noktalı iç çember. Oyuncu: mor rün çemberi.
const RING_Y=.5;
function drawTargetMarker(t:Target){
  const s=worldToScreen(t),R=t.kind==='monster'?t.radius+22:(t.boss?100:Math.max(40,(t.def?.span??90)*.56)),now=performance.now()/1000;
  ctx.save();ctx.translate(s.x,s.y+R*.18);ctx.scale(1,RING_Y);
  const g=ctx.createRadialGradient(0,0,R*.55,0,0,R*1.05);g.addColorStop(0,'rgba(40,90,255,0)');g.addColorStop(.8,'rgba(40,110,255,.28)');g.addColorStop(1,'rgba(40,110,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R*1.05,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='#3d8bff';ctx.shadowBlur=14;ctx.strokeStyle='#4f95ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle='#bcd6ff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R-3,0,Math.PI*2);ctx.stroke();
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;ctx.save();ctx.rotate(a);ctx.fillStyle='#2a63d8';ctx.strokeStyle='#bcd6ff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(R-7,0);ctx.lineTo(R+6,-6);ctx.lineTo(R+10,0);ctx.lineTo(R+6,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  ctx.rotate(now*.6);ctx.strokeStyle='#f5d03a';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.setLineDash([.1,9]);ctx.beginPath();ctx.arc(0,0,R*.8,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
// Halka geminin gövdesine ortalanır: o an çizilen kare (seçili gemi ve yönü) bir kez taranır, gövdenin (görselin alt
// kısmındaki opak bölge) ortası bulunur ve önbelleğe alınır. Böylece her gemide ve her yönde halka teknenin tam altında durur.
const hullCenters=new Map<string,Vec>();
function hullCenter(im:HTMLImageElement,sx:number,sy:number,sw:number,sh:number,dx:number,dy:number,dw:number,dh:number):Vec{
  const key=`${im.src}|${sx}|${sy}`;let c=hullCenters.get(key);if(c)return{x:dx+c.x*dw,y:dy+c.y*dh};
  const N=96,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d',{willReadFrequently:true})!;g.drawImage(im,sx,sy,sw,sh,0,0,N,N);
  let a:Uint8ClampedArray;try{a=g.getImageData(0,0,N,N).data;}catch{return{x:dx+dw/2,y:dy+dh*.62};}
  let top=N,bot=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(a[(y*N+x)*4+3]>110){if(y<top)top=y;if(y>bot)bot=y;}
  if(bot<0){c={x:.5,y:.62};}else{// gövde: opak alanın alt %40'ı (direk ve yelkenler hariç)
    const from=bot-(bot-top)*.4;let sx2=0,sy2=0,n=0;for(let y=Math.floor(from);y<=bot;y++)for(let x=0;x<N;x++)if(a[(y*N+x)*4+3]>110){sx2+=x;sy2+=y;n++;}
    c={x:(sx2/n+.5)/N,y:(sy2/n+.5)/N};}
  hullCenters.set(key,c);return{x:dx+c.x*dw,y:dy+c.y*dh};}
// Şu an çizilen oyuncu gemisi karesi (drawPlayerShip ile aynı kaynak ve hedef dikdörtgeni)
function playerShipFrame():[HTMLImageElement,number,number,number,number,number,number,number,number]|null{
  if(activeSpecialDesign||eliteEnabled()){const im=eliteIsoImage(activeSpecialDesign?PIRATE_RAGE_DESIGN.sprite:ELITE_ISO[eliteShip().id]);
    if(im.complete&&im.naturalWidth){const c=im.naturalHeight,D=158;return[im,isoIndex()*c,0,c,c,-D/2,-D*.7,D,D];}}
  if(directionalShipImage.complete&&directionalShipImage.naturalWidth){const f=shipDirectionFrame(isoFaceAngle(isoFace));return[directionalShipImage,(f%4)*256,Math.floor(f/4)*256,256,256,-80,-86,160,160];}
  return null;}
function drawPlayerMarker(){
  const s=worldToScreen(player),f=playerShipFrame(),o=f?hullCenter(...f):{x:0,y:10};
  drawMysticPlayerMarker(ctx,s.x+o.x,s.y+o.y,performance.now()/1000);
}

// Gemi ölçeği: gemiler, adları, rozetleri, can çubukları ve halkaları kendi noktaları etrafında birlikte küçültülür
// (kalabalık savaşta 30–40 gemi rahat görünsün diye). Kuleler, adalar ve efektler etkilenmez.
const SHIP_DRAW_SCALE:number=.72;
function atShipScale(o:Vec|null,fn:()=>void){if(!o||SHIP_DRAW_SCALE===1){fn();return;}const s=worldToScreen(o);ctx.save();ctx.translate(s.x,s.y);ctx.scale(SHIP_DRAW_SCALE,SHIP_DRAW_SCALE);ctx.translate(-s.x,-s.y);fn();ctx.restore();}
function draw(){
  const w=innerWidth,h=innerHeight,map=mapDef(),th=theme();if(!seaTilePattern(ctx)){const sea=ctx.createLinearGradient(0,0,0,h);sea.addColorStop(0,th.sea[0]);sea.addColorStop(1,th.sea[1]);ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);}
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-w/2,-h/2);
  // Deniz: referanstan çıkarılmış kesintisiz doku, dünyaya sabitli tek katman
  const pattern=seaTilePattern(ctx);if(pattern){const vw=w/camera.zoom,vh=h/camera.zoom;pattern.setTransform(new DOMMatrix().translateSelf(-camera.x+w/2,-camera.y+h/2).scaleSelf(1.5,1.5));ctx.fillStyle=pattern;ctx.fillRect(w/2-vw/2,h/2-vh/2,vw,vh);}
  ctx.globalAlpha=.12;ctx.fillStyle=th.label;ctx.font='700 42px Cinzel';ctx.textAlign='center';for(const label of map.labels){const p=worldToScreen(label);ctx.fillText(label.text,p.x,p.y);}ctx.globalAlpha=1;
  drawMapEdges();islands.forEach(i=>{if(onScreen(i,i.r+260))drawIsland(i);});drawFleetIsland();lootChests.forEach(drawLootChest);drawTreasureMark();sparkles.forEach(drawSparkle);mines.forEach(m=>{const p=worldToScreen(m);drawMineSprite(ctx,p.x,p.y,performance.now(),m.arm>0,m.life<5);});monsters.forEach(m=>{if(onScreen(m,320))atShipScale(m,()=>drawMonster(m));});
  particles.forEach(p=>{if(UNDER.has(p.kind))drawParticle(p);});wrecks.forEach(w=>atShipScale(w,()=>drawWreck(w)));shots.forEach(drawShotShadow);
  if(selected&&targetExists(selected))drawTargetMarker(selected);
  enemies.filter(e=>onScreen(e,e.boss?420:300)).sort((a,b)=>a.y-b.y).forEach(e=>atShipScale(e.tower?null:e,()=>{const s=worldToScreen(e);if(e.captain){drawCaptain(e,s);return;}if(e.boss)drawBossAura(e,s);if(!e.tower)drawHullWater(e,hullLength(e));const raster=e.tower?drawBastion(ctx,e.towerIndex??0,s.x,s.y):e.def?drawNpcShip(ctx,e.def.sprite,e.def.span,s.x,s.y,npcFaceAngle(e),performance.now()):false;if(!raster)return;const top=raster?(e.tower?TOWER_LABEL_OFFSET:shipLabelOffset(e.def!.span)):-42;if(e.boss){drawBossFlag(s,top);drawBossPlate(e,s,top);return;}const bw=e.tower||e.role==='heavy'?72:56;drawHealthBar(s.x,s.y+top,bw,e.hp/e.maxHp,e.tower?'#f09a4f':e.role==='heavy'?'#f0584a':'#4fd0da');ctx.fillStyle='#e6dccb';ctx.font='700 15px Inter';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText(e.name,s.x,s.y+top-7);ctx.shadowBlur=0;}));
  atShipScale(player,()=>{drawPlayerMarker();drawHullWater(player,hullLength(player));drawPlayerShip();
});
  drawFleetOccluders();atShipScale(player,drawPlayerLabel);
  particles.forEach(p=>{if(!UNDER.has(p.kind)&&p.kind!=='damage')drawParticle(p);});shots.forEach(drawShotBall);
  drawAbilityFx(ctx,worldToScreen,innerWidth,innerHeight);
  particles.forEach(p=>{if(p.kind==='damage')drawParticle(p);});
  ctx.restore();
  if(!cinematic.on)drawCoordRulers();
  if(mapFade>0){ctx.fillStyle=`rgba(2,10,14,${Math.min(1,mapFade)})`;ctx.fillRect(0,0,w,h);}
  drawMinimap();
}
// Koordinat cetvelleri: ekran kenarında kamerayı izler (dünya içinde ızgara çizgisi ve rota çizgisi çizilmez; görüntü temiz kalsın).
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
function updateCoordBadge(){const text=`${siege?'KALE':currentMap} - ${coordLabel(player)}`;if(text!==lastCoord){lastCoord=text;ui('mapCoord').textContent=text;}}
function drawMinimap(){const W=188,H=133,sx=(x:number)=>x/WORLD_WIDTH*W,sy=(y:number)=>y/WORLD_HEIGHT*H,th=theme();
  mini.setTransform(minimap.width/W,0,0,minimap.height/H,0,0);mini.clearRect(0,0,W,H);void th;
  for(const dir of ['north','south','east','west'] as Dir[]){const to=neighbor(currentMap,dir);if(!to)continue;mini.fillStyle=state.level>=MAPS[to].tier?'#6fd6c4aa':'#e07a5f88';if(dir==='north')mini.fillRect(W/2-14,0,28,2);if(dir==='south')mini.fillRect(W/2-14,H-2,28,2);if(dir==='west')mini.fillRect(0,H/2-12,2,24);if(dir==='east')mini.fillRect(W-2,H/2-12,2,24);}
  mini.save();mini.scale(W/WORLD_WIDTH,H/WORLD_HEIGHT);
  for(const i of islands)drawIslandSprite(mini,i,i.x,i.y);
  if(hasFleetIsland()){const f=mapDef().fleet;drawFleetBase(mini,th.fleet,f.x,f.y);}
  mini.restore();
  // Görüş sisi: gemi çevresi açık, dışı koyu (pusula açıkken kalkar)
  if(compassReveal<=0){const cx=sx(player.x),cy=sy(player.y),rx=VISION_RADIUS/WORLD_WIDTH*W;
    const g=mini.createRadialGradient(cx,cy,rx*.82,cx,cy,rx*1.05);g.addColorStop(0,'#05080a00');g.addColorStop(1,'#0a141a99');
    mini.fillStyle=g;mini.fillRect(0,0,W,H);}
  if(compassPulse>0){const cx=sx(player.x),cy=sy(player.y);mini.strokeStyle=`rgba(255,214,120,${compassPulse})`;mini.lineWidth=1.5;mini.beginPath();mini.arc(cx,cy,(1-compassPulse)*W,0,7);mini.stroke();}
  for(const m of monsters){if(!seenOnMap(m))continue;mini.fillStyle='#b070ff';mini.beginPath();mini.arc(sx(m.x),sy(m.y),2.5,0,7);mini.fill();}
  mini.fillStyle='#f4f8ff';for(const g of sparkles)if(seenOnMap(g))mini.fillRect(sx(g.x)-.5,sy(g.y)-.5,1.5,1.5);
  for(const c of lootChests){if(!seenOnMap(c))continue;mini.fillStyle=c.kind==='gilded'?'#ffd46b':'#d9a95b';mini.fillRect(sx(c.x)-1,sy(c.y)-1,2,2);}
  for(const e of enemies){if(e.tower||(!e.boss&&!seenOnMap(e)))continue;mini.fillStyle=e.boss?'#f1c662':'#c34e3d';const r=e.boss?5:3;mini.fillRect(sx(e.x)-r/2,sy(e.y)-r/2,r,r);}
  mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(sx(player.x),sy(player.y),3,0,7);mini.fill();
  // görüş penceresi: kameranın ekranda gösterdiği alan
  const vw=innerWidth/camera.zoom,vh=innerHeight/camera.zoom;mini.strokeStyle=freeLook?'#ffe09bee':'#ffe09b88';mini.lineWidth=1.2;mini.strokeRect(sx(camera.x-vw/2),sy(camera.y-vh/2),vw/WORLD_WIDTH*W,vh/WORLD_HEIGHT*H);}
// manualClock (yalnızca geliştirme): tanıtım videosu kare kare çekilirken oyun dışarıdan adımlanır
let manualClock=false;
let last=performance.now();function loop(now:number){const raw=(now-last)/1000,dt=Math.min(.033,raw);last=now;if(raw<1)watchFps(raw);if(!manualClock){update(dt);draw();}requestAnimationFrame(loop);}fitCannonsToCapacity();saveAccount();renderQuickSlots();updateUI();requestAnimationFrame(loop);
// Açılış ekranı (index.html #splash): sayfa yüklenince ve en az 2 sn gösterildikten sonra söner
{const splash=document.getElementById('splash');if(splash){const shown=performance.now();let done=false;
  const hide=()=>{if(done)return;done=true;setTimeout(()=>{splash.classList.add('gone');setTimeout(()=>splash.remove(),700);},Math.max(0,2000-(performance.now()-shown)));};
  if(document.readyState==='complete')hide();else window.addEventListener('load',hide);setTimeout(hide,6000);}}
// Yalnızca geliştirme sunucusunda: tarayıcı testleri için durum erişimi.
if(import.meta.env.DEV)(window as any).__ky={isoFace,levelUp:showLevelUp,sunk:showSunkBy,setLevel:(l:number,f:number)=>{state.level=l;state.fame=f;levelQuest=loadLevelQuest(l);levelQuestNoticed=false;},lqKill:(k:"npc"|"monster",id:string,t:number)=>levelQuestHit(k,id,t),range:()=>effectiveRange(),spawnBoss:()=>spawnBoss(),elite:(id:EliteShipId)=>{activeEliteShip=id;activeShip=id;},rage:()=>{rage.meter=RAGE_MAX;activateRage();},get rageState(){return rage;},treasure,rollTreasurePart,manual:(on:boolean)=>{manualClock=on;},step:(dt:number)=>{update(dt);draw();},noFade:()=>{mapFade=0;},cinematic,makeShip,NPCS,MONSTERS,state,player,camera,enemies,monsters,respawn,enterMap,mapDef,fleetOwner,lootChests,sparkles,sinkEnemy,burst,splashAt,enterSiege,leaveSiege,get siege(){return siege;},shots,particles,wrecks,select:(t:Target)=>{selected=t;state.attacking=true;},ammo:(id:AmmoKind)=>{state.ammo=id;renderQuickSlots();},potion:()=>activateAbility('speed'),setElite:(id:EliteShipId)=>{activeEliteShip=id;activeShip=id;fitCannonsToCapacity();},route:(v:Vec)=>{routeTarget=navigablePoint(v);destination=routeVia(routeTarget);},fleetNav,get routeTarget(){return routeTarget;},get selected(){return selected;},get destination(){return destination;}};

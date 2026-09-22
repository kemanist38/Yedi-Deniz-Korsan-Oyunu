import './style.css';

type Vec = { x: number; y: number };
type Shot = Vec & { vx:number; vy:number; life:number; owner:'player'|'enemy' };
type Loot = Vec & { kind:'gold'|'wood'; value:number; bob:number };
type Enemy = Vec & { kind:'ship'; angle:number; hp:number; maxHp:number; cooldown:number; speed:number; name:string; tier:number; aggro:boolean; wander:number };
type Particle = Vec & { vx:number; vy:number; life:number; maxLife:number; kind:'foam'|'smoke'|'spark'|'damage'; text?:string };
type Monster = Vec & { kind:'monster'; phase:number; radius:number; name:string; hp:number; maxHp:number; cooldown:number; aggro:boolean };
type Target = Enemy|Monster;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <canvas id="sea"></canvas><div class="grain"></div>
    <section class="hud">
      <div class="brand">KARA YELKEN<small>GÖLGELER DENİZİ</small></div>
      <div class="resources"><div class="resource">ALTIN<b id="gold">000</b></div><div class="resource">KERESTE<b id="wood">000</b></div><div class="resource">ŞÖHRET<b id="fame">000</b></div></div>
      <div class="panel quest"><span class="eyebrow">Aktif görev</span><h3>Kızıl Sular</h3><p>Yağmacı filonun devriyelerini batır ve bölgeyi güvenli hâle getir.</p><div class="progress" id="quest">0 / 5 Düşman</div></div>
      <div class="panel captain"><div class="name-row"><strong>Kaptan Yasin</strong><span class="level" id="level">SEVİYE 1</span></div><div class="bar-label"><span>GÖVDE</span><span id="hpText">100 / 100</span></div><div class="bar hp"><i id="hpBar" style="width:100%"></i></div><div class="bar-label"><span>ŞÖHRET</span><span id="xpText">0 / 100</span></div><div class="bar xp"><i id="xpBar" style="width:0%"></i></div></div>
      <div class="panel target-card" id="targetCard"><span class="eyebrow">HEDEF YOK</span><h3 id="targetName">Denizde bir gemi seç</h3><div class="bar hp"><i id="targetHp" style="width:0%"></i></div><div class="target-meta"><span id="targetRange">— menzil</span><span id="targetTier">—</span></div></div>
      <div class="panel actionbar"><button class="action active" data-ammo="iron"><b>●</b><span>Demir</span><small id="ironAmmo">∞</small></button><button class="action" data-ammo="chain"><b>⛓</b><span>Zincir</span><small id="chainAmmo">40</small></button><button class="action fire" id="attack"><b>⚔</b><span>SALDIR</span><small>R</small></button><button class="action" id="repair"><b>✚</b><span>Tamir</span><small>F</small></button></div>
      <div class="panel zoom-controls"><button id="zoomOut" aria-label="Uzaklaştır">−</button><span id="zoomValue">70%</span><button id="zoomIn" aria-label="Yakınlaştır">+</button></div>
      <canvas id="minimap" width="170" height="125"></canvas>
      <div class="panel port-card" id="port"><button class="close" id="closePort">×</button><span class="eyebrow">Güvenli Bölge</span><h2>Kül Limanı</h2><p>Gövdeni onar, toplarını güçlendir ve daha tehlikeli sulara hazırlan.</p><div class="upgrade-grid"><button class="upgrade" data-upgrade="repair">Gövdeyi Onar <small>25 altın</small></button><button class="upgrade" data-upgrade="cannon">Topları Güçlendir <small>80 altın + 20 kereste</small></button></div></div>
      <div class="toast" id="toast"></div>
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
const portIslandImage=new Image();
const islandChunks=['aa','ab','ac','ad'];
Promise.all(islandChunks.map(part=>fetch(`/assets/kul-limani-v1.b64.${part}`).then(r=>r.text())))
  .then(parts=>{portIslandImage.src=`data:image/webp;base64,${parts.join('')}`;})
  .catch(()=>{portIslandImage.src='/assets/kul-limani-v1.webp';});
const ui = (id:string) => document.getElementById(id)!;
const WORLD = 2800;
const keys = new Set<string>();
const state = { gold:40, wood:10, fame:0, level:1, hp:100, maxHp:100, cannon:18, kills:0, portOpen:false, ammo:'iron' as 'iron'|'chain', chainAmmo:40, attacking:false, repairing:false, invulnerable:0 };
const player = { x:WORLD/2, y:WORLD/2, angle:-Math.PI/2, speed:0, cooldown:0 };
let destination:Vec|null=null;
let selected:Target|null=null;
const camera = { x:player.x, y:player.y, zoom:.7, targetZoom:.7 };
const shots:Shot[]=[]; const loot:Loot[]=[]; const enemies:Enemy[]=[];
const particles:Particle[]=[];
const monsters:Monster[]=[{kind:'monster',x:1980,y:1530,phase:0,radius:52,name:'Derinlik Leviathanı',hp:180,maxHp:180,cooldown:0,aggro:false}];
let wakeClock=0;
const islands = [
  {x:1350,y:1340,r:180,name:'Kül Limanı',port:true}, {x:760,y:610,r:150,name:'Fırtına Burnu'},
  {x:2180,y:710,r:210,name:'Ölü Adam Adası'}, {x:2250,y:2050,r:170,name:'Mercan Geçidi'}, {x:650,y:2110,r:230,name:'Sis Kayalıkları'}
];

function resize(){ const d=Math.min(devicePixelRatio,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize',resize); resize();
addEventListener('keydown',e=>{ keys.add(e.key.toLowerCase()); if(['q','e',' '].includes(e.key.toLowerCase())) fire(e.key.toLowerCase()); if(e.key.toLowerCase()==='f') togglePort(); if(e.key.toLowerCase()==='r') toggleAttack(); });
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{
  const world={x:(e.clientX-innerWidth/2)/camera.zoom+camera.x,y:(e.clientY-innerHeight/2)/camera.zoom+camera.y};
  const hit=[...enemies,...monsters].filter(n=>dist(n,world)<Math.max(42,n.kind==='monster'?n.radius:0)).sort((a,b)=>dist(a,world)-dist(b,world))[0];
  if(hit){selected=hit;state.attacking=false;toast(`${hit.name} hedef seçildi`);}
  else{destination=world;state.attacking=false;}
});
ui('closePort').onclick=()=>togglePort(false);
ui('attack').onclick=toggleAttack;
ui('repair').onclick=()=>togglePort();
ui('zoomOut').onclick=()=>setZoom(camera.targetZoom-.1);
ui('zoomIn').onclick=()=>setZoom(camera.targetZoom+.1);
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.targetZoom+(e.deltaY<0?.1:-.1));},{passive:false});
document.querySelectorAll<HTMLButtonElement>('[data-ammo]').forEach(b=>b.onclick=()=>{state.ammo=b.dataset.ammo as 'iron'|'chain';document.querySelectorAll('[data-ammo]').forEach(x=>x.classList.toggle('active',x===b));});
document.querySelectorAll<HTMLButtonElement>('.upgrade').forEach(b=>b.onclick=()=>upgrade(b.dataset.upgrade!));

function spawnEnemy(){
  const a=Math.random()*Math.PI*2,d=500+Math.random()*650,tier=1+Math.floor(state.level/3);
  enemies.push({kind:'ship',x:clamp(player.x+Math.cos(a)*d,80,WORLD-80),y:clamp(player.y+Math.sin(a)*d,80,WORLD-80),angle:a+Math.PI,hp:42+tier*12,maxHp:42+tier*12,cooldown:Math.random()*2,speed:35+Math.random()*15,name:['Yağmacı','Kaçakçı','Kızıl Korsan'][Math.floor(Math.random()*3)],tier,aggro:false,wander:Math.random()*6});
}
for(let i=0;i<7;i++) spawnEnemy();
function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n));}
function dist(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y);}
function setZoom(value:number){camera.targetZoom=clamp(value,.5,1.15);ui('zoomValue').textContent=`${Math.round(camera.targetZoom*100)}%`;}
function targetExists(t:Target){return t.kind==='ship'?enemies.includes(t):monsters.includes(t);}

function fire(side:string){
  if(player.cooldown>0||state.portOpen)return;
  player.cooldown=.72;
  const sides=side===' '?[-1,1]:[side==='q'?-1:1];
  for(const s of sides) for(let i=-1;i<=1;i++){
    const a=player.angle+s*Math.PI/2+i*.07, speed=430;
    shots.push({x:player.x+Math.cos(a)*24,y:player.y+Math.sin(a)*24,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:1.1,owner:'player'});
  }
}
function toggleAttack(){if(!selected||!targetExists(selected)){toast('Önce bir hedef seç');return;}state.attacking=!state.attacking;ui('attack').classList.toggle('active',state.attacking);toast(state.attacking?'Otomatik saldırı başladı':'Saldırı durduruldu');}
function fireAtTarget(){
  if(!selected||player.cooldown>0||dist(player,selected)>390)return;
  if(state.ammo==='chain'&&state.chainAmmo<=0){state.ammo='iron';toast('Zincir güllesi tükendi');}
  const a=Math.atan2(selected.y-player.y,selected.x-player.x),speed=510;
  for(let i=-2;i<=2;i++)shots.push({x:player.x,y:player.y,vx:Math.cos(a+i*.025)*speed,vy:Math.sin(a+i*.025)*speed,life:.9,owner:'player'});
  if(state.ammo==='chain')state.chainAmmo-=5;
  player.cooldown=state.ammo==='chain'?2.2:1.65;
}
function enemyFire(e:Enemy){
  const a=Math.atan2(player.y-e.y,player.x-e.x);
  shots.push({x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2.2,owner:'enemy'}); e.cooldown=2.2+Math.random();
}
function monsterFire(m:Monster){const a=Math.atan2(player.y-m.y,player.x-m.x);shots.push({x:m.x,y:m.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:2.4,owner:'enemy'});m.cooldown=2.8;}
function respawn(){
  let spot={x:WORLD/2,y:WORLD/2};
  for(let tries=0;tries<40;tries++){const candidate={x:160+Math.random()*(WORLD-320),y:160+Math.random()*(WORLD-320)};if(islands.every(i=>dist(candidate,i)>i.r+170)&&monsters.every(m=>dist(candidate,m)>260)){spot=candidate;break;}}
  player.x=spot.x;player.y=spot.y;player.speed=18;destination=null;state.hp=Math.max(18,Math.round(state.maxHp*.2));state.repairing=true;state.invulnerable=4;state.attacking=false;state.portOpen=false;selected=null;shots.length=0;enemies.forEach(e=>e.aggro=false);monsters.forEach(m=>m.aggro=false);ui('attack').classList.remove('active');ui('port').classList.remove('open');toast('Açık denizde yeniden doğdun — gövde onarılıyor');
}
function burst(x:number,y:number,large=false){for(let n=0;n<(large?18:7);n++){const a=Math.random()*Math.PI*2,s=15+Math.random()*(large?75:35);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.7,maxLife:1,kind:n%3?'smoke':'spark'});}}
function damageText(x:number,y:number,value:number){particles.push({x,y,vx:0,vy:-24,life:1,maxLife:1,kind:'damage',text:`-${Math.round(value)}`});}
function upgrade(kind:string){
  if(kind==='repair'&&state.gold>=25&&state.hp<state.maxHp){state.gold-=25;state.hp=state.maxHp;toast('Gövde tamamen onarıldı');}
  else if(kind==='cannon'&&state.gold>=80&&state.wood>=20){state.gold-=80;state.wood-=20;state.cannon+=5;toast('Top hasarı +5');}
  else toast('Yeterli kaynağın yok');
  updateUI();
}
function togglePort(force?:boolean){
  if(dist(player,islands[0])>245&&!state.portOpen){toast('Limana yaklaşmalısın');return;}
  state.portOpen=force??!state.portOpen; ui('port').classList.toggle('open',state.portOpen);
}
let toastTimer=0;
function toast(msg:string){ui('toast').textContent=msg;ui('toast').classList.add('show');toastTimer=2.2;}
function updateUI(){
  ui('gold').textContent=String(state.gold).padStart(3,'0');ui('wood').textContent=String(state.wood).padStart(3,'0');ui('fame').textContent=String(state.fame).padStart(3,'0');
  ui('hpText').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`; (ui('hpBar') as HTMLElement).style.width=`${state.hp/state.maxHp*100}%`;
  const need=state.level*100;ui('xpText').textContent=`${state.fame} / ${need}`;(ui('xpBar') as HTMLElement).style.width=`${Math.min(100,state.fame/need*100)}%`;ui('level').textContent=`SEVİYE ${state.level}`;ui('quest').textContent=`${Math.min(state.kills,5)} / 5 Düşman`;ui('chainAmmo').textContent=String(state.chainAmmo);
  const valid=selected&&targetExists(selected);ui('targetCard').classList.toggle('visible',!!valid);
  if(valid&&selected){ui('targetName').textContent=selected.name;ui('targetRange').textContent=`${Math.round(dist(player,selected))} menzil`;ui('targetTier').textContent=selected.kind==='ship'?`Sınıf ${selected.tier}`:'Deniz Canavarı';(ui('targetHp') as HTMLElement).style.width=`${selected.hp/selected.maxHp*100}%`;}
}

function update(dt:number){
  if(!state.portOpen){
    const turn=(keys.has('a')||keys.has('arrowleft')?-1:0)+(keys.has('d')||keys.has('arrowright')?1:0);
    const thrust=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    if(destination&&!thrust&&!turn){const d=dist(player,destination),desired=Math.atan2(destination.y-player.y,destination.x-player.x)+Math.PI/2;const delta=Math.atan2(Math.sin(desired-player.angle),Math.cos(desired-player.angle));player.angle+=clamp(delta,-2.2*dt,2.2*dt);player.speed+=(d>24?92-player.speed*.8:-player.speed*2.5)*dt;if(d<24)destination=null;}
    else {player.angle+=turn*2.05*dt;const cruise=thrust?thrust*92:16;player.speed+=(cruise-player.speed)*dt*(thrust?1.1:.7);}
    player.speed=clamp(player.speed,-38,108);
    player.x=clamp(player.x+Math.sin(player.angle)*player.speed*dt,25,WORLD-25);player.y=clamp(player.y-Math.cos(player.angle)*player.speed*dt,25,WORLD-25);
  }
  player.cooldown=Math.max(0,player.cooldown-dt);state.invulnerable=Math.max(0,state.invulnerable-dt);camera.x+=(player.x-camera.x)*Math.min(1,dt*3);camera.y+=(player.y-camera.y)*Math.min(1,dt*3);camera.zoom+=(camera.targetZoom-camera.zoom)*Math.min(1,dt*7);
  if(state.repairing){state.hp=Math.min(state.maxHp,state.hp+state.maxHp*.035*dt);if(state.hp>=state.maxHp){state.repairing=false;toast('Gövde tamamen onarıldı');}}
  wakeClock-=dt;if(Math.abs(player.speed)>8&&wakeClock<=0){wakeClock=.1;particles.push({x:player.x-Math.sin(player.angle)*22,y:player.y+Math.cos(player.angle)*22,vx:-Math.sin(player.angle)*8,vy:Math.cos(player.angle)*8,life:.75,maxLife:.75,kind:'foam'});}
  monsters.forEach(m=>{m.phase+=dt;m.cooldown-=dt;if(m.aggro&&dist(m,player)<430&&m.cooldown<=0)monsterFire(m);});
  if(state.attacking&&selected){const d=dist(player,selected);if(d>330){destination={x:selected.x+Math.cos(Math.atan2(player.y-selected.y,player.x-selected.x))*290,y:selected.y+Math.sin(Math.atan2(player.y-selected.y,player.x-selected.x))*290};}else{destination=null;fireAtTarget();}}
  for(const e of enemies){
    const d=dist(e,player);e.wander+=dt;
    const target=e.aggro?Math.atan2(player.y-e.y,player.x-e.x)+Math.PI/2:e.angle+Math.sin(e.wander*.35)*.008;
    e.angle+=Math.atan2(Math.sin(target-e.angle),Math.cos(target-e.angle))*dt*(e.aggro?.8:.25);
    if(!e.aggro||d>240){e.x=clamp(e.x+Math.sin(e.angle)*e.speed*(e.aggro?1:.45)*dt,40,WORLD-40);e.y=clamp(e.y-Math.cos(e.angle)*e.speed*(e.aggro?1:.45)*dt,40,WORLD-40);if(Math.random()<dt*3)particles.push({x:e.x-Math.sin(e.angle)*18,y:e.y+Math.cos(e.angle)*18,vx:0,vy:0,life:.55,maxLife:.55,kind:'foam'});} if(e.aggro&&d<440&&e.cooldown<=0)enemyFire(e);e.cooldown-=dt;
  }
  for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.owner==='player'){for(let j=enemies.length-1;j>=0&&s.life>0;j--){const e=enemies[j];if(dist(s,e)<25){const hit=state.cannon*(state.ammo==='chain'?1.45:1);e.aggro=true;e.hp-=hit;damageText(e.x,e.y,hit);burst(e.x,e.y);s.life=0;if(e.hp<=0){burst(e.x,e.y,true);enemies.splice(j,1);if(selected===e){selected=null;state.attacking=false;ui('attack').classList.remove('active');}state.gold+=12+e.tier*5;state.fame+=20;state.kills++;loot.push({x:e.x+18,y:e.y,kind:'wood',value:5,bob:Math.random()*6});toast(`${e.name} batırıldı`);setTimeout(spawnEnemy,1400);}}}for(let j=monsters.length-1;j>=0&&s.life>0;j--){const m=monsters[j];if(dist(s,m)<m.radius){const hit=state.cannon*(state.ammo==='chain'?1.45:1);m.aggro=true;m.hp-=hit;damageText(m.x,m.y,hit);burst(m.x,m.y);s.life=0;if(m.hp<=0){state.gold+=100;state.fame+=80;m.hp=m.maxHp;m.aggro=false;m.x=160+Math.random()*(WORLD-320);m.y=160+Math.random()*(WORLD-320);selected=null;state.attacking=false;toast(`${m.name} yenildi`);}}}}else if(state.invulnerable<=0&&dist(s,player)<22){state.repairing=false;state.hp-=8;damageText(player.x,player.y,8);burst(player.x,player.y);s.life=0;if(state.hp<=0)respawn();}if(s.life<=0)shots.splice(i,1);}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  for(let i=loot.length-1;i>=0;i--){loot[i].bob+=dt*3;if(dist(loot[i],player)<42){state.wood+=loot[i].value;loot.splice(i,1);toast('Kereste toplandı');}}
  const need=state.level*100;if(state.fame>=need){state.fame-=need;state.level++;state.maxHp+=15;state.hp=state.maxHp;toast(`Seviye ${state.level}!`);} if(state.kills===5){state.gold+=100;state.kills++;toast('Görev tamamlandı: +100 altın');}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui('toast').classList.remove('show');} updateUI();
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
  if(!playerShipImage.complete||!playerShipImage.naturalWidth){drawShip(player,player.angle,'#173f48',1.1);return;}
  const bob=Math.sin(performance.now()/420)*1.8;
  ctx.save();ctx.translate(s.x,s.y+bob);ctx.rotate(player.angle-Math.PI*1.25+Math.sin(performance.now()/700)*.012);
  ctx.shadowColor='#000b';ctx.shadowBlur=16;ctx.globalAlpha=state.invulnerable&&Math.floor(performance.now()/120)%2?.55:1;ctx.drawImage(playerShipImage,-49,-49,98,98);ctx.restore();
}
function drawIsland(i:typeof islands[number]){const s=worldToScreen(i);if(i.port&&portIslandImage.complete&&portIslandImage.naturalWidth){ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=22;ctx.drawImage(portIslandImage,s.x-280,s.y-190,560,373);ctx.restore();ctx.fillStyle='#f3d59b';ctx.font='700 13px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+178);return;}const g=ctx.createRadialGradient(s.x-20,s.y-30,10,s.x,s.y,i.r);g.addColorStop(0,'#617c4e');g.addColorStop(.5,'#3c593e');g.addColorStop(.66,'#b9a16b');g.addColorStop(.72,'#17434a');g.addColorStop(1,'#0b2b35');ctx.fillStyle=g;ctx.beginPath();for(let n=0;n<18;n++){const a=n/18*Math.PI*2,r=i.r*(.78+Math.sin(n*4.7)*.09);const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();for(let n=0;n<7;n++){const a=n*2.1,r=i.r*.38;ctx.fillStyle='#213c2d';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,7+n%3*2,0,7);ctx.fill();}ctx.fillStyle='#d7c697';ctx.font='600 11px Cinzel';ctx.textAlign='center';ctx.fillText(i.name,s.x,s.y+i.r*.76);}
function drawMonster(m:Monster){const s=worldToScreen(m);ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#477f72';ctx.lineWidth=9;ctx.lineCap='round';for(let n=0;n<6;n++){const a=n/6*Math.PI*2+m.phase*.12;ctx.beginPath();ctx.moveTo(Math.cos(a)*12,Math.sin(a)*12);ctx.quadraticCurveTo(Math.cos(a+.5)*50,Math.sin(a+.5)*50,Math.cos(a+Math.sin(m.phase+n)*.35)*m.radius,Math.sin(a+Math.sin(m.phase+n)*.35)*m.radius);ctx.stroke();}ctx.fillStyle='#38675f';ctx.beginPath();ctx.arc(0,0,25,0,7);ctx.fill();ctx.fillStyle='#d5cc71';ctx.beginPath();ctx.arc(-8,-5,4,0,7);ctx.arc(8,-5,4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#89b0a8';ctx.font='600 10px Cinzel';ctx.textAlign='center';ctx.fillText(m.name,s.x,s.y-66);}
function draw(){
  const w=innerWidth,h=innerHeight;const sea=ctx.createLinearGradient(0,0,0,h);sea.addColorStop(0,'#0e3b48');sea.addColorStop(1,'#071f2a');ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-w/2,-h/2);
  ctx.strokeStyle='#74b3b40b';ctx.lineWidth=1;const grid=80,ox=(-camera.x+innerWidth/2)%grid,oy=(-camera.y+innerHeight/2)%grid;for(let x=ox;x<w;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=oy;y<h;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='#87c8ca22';for(let n=0;n<30;n++){const x=(n*193-camera.x*.12)%(w+120)-60,y=(n*97-camera.y*.1)%(h+100);ctx.beginPath();ctx.arc(x,y,28+n%4*8,.2,2.8);ctx.stroke();}
  ctx.globalAlpha=.12;ctx.fillStyle='#b7d9d1';ctx.font='700 42px Cinzel';ctx.textAlign='center';ctx.fillText('KIZIL SULAR',worldToScreen({x:1500,y:1040}).x,worldToScreen({x:1500,y:1040}).y);ctx.fillText('SİS DENİZİ',worldToScreen({x:610,y:1800}).x,worldToScreen({x:610,y:1800}).y);ctx.globalAlpha=1;
  islands.forEach(drawIsland);monsters.forEach(drawMonster);loot.forEach(l=>{const s=worldToScreen(l);ctx.fillStyle='#bd8a44';ctx.fillRect(s.x-7,s.y-7+Math.sin(l.bob)*3,14,14);ctx.strokeStyle='#f0d38c';ctx.strokeRect(s.x-7,s.y-7+Math.sin(l.bob)*3,14,14);});
  particles.forEach(p=>{const s=worldToScreen(p),a=Math.max(0,p.life/p.maxLife);ctx.globalAlpha=a;if(p.kind==='damage'){ctx.fillStyle='#ffd878';ctx.font='700 14px Inter';ctx.textAlign='center';ctx.fillText(p.text||'',s.x,s.y);}else{ctx.fillStyle=p.kind==='foam'?'#b9e2df':p.kind==='spark'?'#ffb340':'#3f4545';ctx.beginPath();ctx.arc(s.x,s.y,p.kind==='smoke'?7*(1-a)+3:p.kind==='foam'?4:2,0,7);ctx.fill();}ctx.globalAlpha=1;});
  shots.forEach(s=>{const p=worldToScreen(s);ctx.fillStyle=s.owner==='player'?'#ffd889':'#ff7450';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();ctx.shadowBlur=0;});
  enemies.forEach(e=>{drawShip(e,e.angle,'#732f2b');const s=worldToScreen(e);ctx.fillStyle='#07161c';ctx.fillRect(s.x-25,s.y-42,50,5);ctx.fillStyle='#c64f3d';ctx.fillRect(s.x-25,s.y-42,50*e.hp/e.maxHp,5);ctx.fillStyle='#d7cbb5';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(e.name,s.x,s.y-49);});
  if(selected&&targetExists(selected)){const t=worldToScreen(selected);ctx.strokeStyle='#f1c662';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,selected.kind==='monster'?selected.radius+10:34,0,7);ctx.stroke();}
  drawPlayerShip();
  if(destination){const d=worldToScreen(destination),p=worldToScreen(player);ctx.strokeStyle='#e7cf8d55';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(d.x,d.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e7cf8d';ctx.beginPath();ctx.arc(d.x,d.y,9,0,7);ctx.stroke();}
  const ps=worldToScreen(player);ctx.strokeStyle='#e8cf9366';ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(ps.x,ps.y,115,0,7);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();drawMinimap();
}
function drawMinimap(){mini.fillStyle='#061820';mini.fillRect(0,0,170,125);mini.strokeStyle='#9fc2bd22';mini.strokeRect(.5,.5,169,124);for(const i of islands){mini.fillStyle=i.port?'#d5aa5f':'#536d4b';mini.beginPath();mini.arc(i.x/WORLD*170,i.y/WORLD*125,Math.max(3,i.r/WORLD*170),0,7);mini.fill();}for(const e of enemies){mini.fillStyle='#c34e3d';mini.fillRect(e.x/WORLD*170-1,e.y/WORLD*125-1,3,3);}mini.fillStyle='#f4dd9d';mini.beginPath();mini.arc(player.x/WORLD*170,player.y/WORLD*125,3,0,7);mini.fill();}
let last=performance.now();function loop(now:number){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}updateUI();requestAnimationFrame(loop);

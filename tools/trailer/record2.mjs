// Tanıtım videosu: oyun kare kare (30 fps) adımlanır, her kare ekran görüntüsü olarak alınır; olaylar ses kurgusu için loglanır
import {chromium} from '/home/user/kara-yelken/tools/asset-studio/node_modules/playwright/index.mjs';import fs from 'node:fs';
const W=1280,H=720,FPS=30,TOTAL=15;
fs.mkdirSync('frames',{recursive:true});for(const f of fs.readdirSync('frames'))fs.unlinkSync('frames/'+f);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(()=>{try{if(!localStorage.getItem('yedi-deniz-profile-v1'))localStorage.setItem('yedi-deniz-profile-v1',JSON.stringify({nick:'ADMİN',named:true,changedAt:0}));}catch{}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:5173/');await p.waitForTimeout(2500);
await p.click('#openShop');await p.click('#openEliteShips');await p.click('[data-elite="magma"]');await p.click('#equipEliteShip');await p.click('#closeShopTabs');
await p.addScriptTag({path:'overlay.js'});
// tüm deniz görsellerini önceden yükle (sahne geçişinde boş kare olmasın)
for(const key of ['5/1','7/1','8/1','2/1']){await p.evaluate(k=>window.__ky.enterMap(k,{x:3000,y:2000}),key);await p.waitForTimeout(1200);}
await p.evaluate(()=>{const k=window.__ky;k.state.level=8;k.state.maxHp=1e7;k.state.hp=1e7;k.cinematic.on=true;k.manual(true);
  const T=window.__trailer,seen=new WeakSet();window.__ev=[];
  const scene=(key,px,py,angle,zoom=1.45)=>{k.enterMap(key,{x:px,y:py});k.noFade();k.player.x=px;k.player.y=py;k.player.angle=angle;k.player.speed=45;k.camera.x=px;k.camera.y=py;k.camera.zoom=k.camera.targetZoom=zoom;k.state.hp=1e7;k.state.attacking=false;k.cinematic.focus=null;
    for(let i=k.enemies.length-1;i>=0;i--)if(!k.enemies[i].tower)k.enemies.splice(i,1);};
  const ship=(id,x,y,angle,name,hp)=>{const s=k.makeShip(k.NPCS[id],x,y,angle);if(name)s.name=name;if(hp)s.hp=s.maxHp=hp;s.aggro=true;s.combatTimer=999;k.enemies.push(s);return s;};
  const SC=[
    {t:0,run(){scene('2/1',2400,2000,Math.PI/2);k.cinematic.focus={x:2400,y:1885};k.camera.y=1885;}},
    {t:2.3,run(){scene('2/1',2420,2000,Math.PI/2);const r=ship('n9-2-heavy',2660,2010,-Math.PI/2,'KEMANİST',60000);r.damage=30;r.fireRange=520;r.reload=1.2;r.speed=18;k.state.ammo='fire';k.cinematic.focus={x:2540,y:2005};k.camera.x=2540;k.camera.y=2005;k.select(r);}},
    {t:6.1,run(){scene('5/1',3000,2000,Math.PI/2);k.state.ammo='explosive';const a=ship('n5-1-heavy',3200,1975,Math.PI,null,200),b=ship('n5-1-light',3235,2045,Math.PI,null,90),c=ship('n5-2-light',3160,2065,Math.PI,null,90);[a,b,c].forEach(s=>{s.speed=6;s.damage=10;});k.cinematic.focus={x:3100,y:2020};k.camera.x=3100;k.camera.y=2020;k.select(a);}},
    {t:9.1,run(){scene('7/1',3000,2000,Math.PI/2);k.state.ammo='fire';const m=k.monsters[0];m.x=3200;m.y=2010;m.homeX=m.x;m.homeY=m.y;m.hp=m.maxHp=40000;m.aggro=true;m.combatTimer=999;k.cinematic.focus={x:3100,y:2005};k.camera.x=3100;k.camera.y=2005;k.select(m);}},
    {t:11.6,run(){const f0=k.MAPS?null:null;scene('8/1',3000,2000,0,.9);const fl=k.mapDef().fleet;k.player.x=fl.x+30;k.player.y=fl.y+640;k.player.speed=95;k.route({x:fl.x,y:fl.y+240});k.cinematic.focus={x:fl.x,y:fl.y+410};k.camera.x=fl.x;k.camera.y=fl.y+470;}},
    {t:13.2,run(){k.camera.targetZoom=.62;}},
  ];
  const CAP=[[2.3,6.1,'KAPTANLAR KARŞI KARŞIYA','OYUNCUYA KARŞI OYUNCU'],[6.1,9.1,'KORSAN FİLOLARINI BATIR','PATLAYICI · KULE KIRICI · CAN EMİCİ GÜLLELER'],[9.1,11.6,'EFSANEVİ CANAVARLARI AVLA','KARANLIK UÇURUM DENİZİ'],[11.6,13.2,'FİLO ADANI KUR, KULELERİNİ DİK','ALEV DENİZİ']];
  const fade=(t,a,b,f=.3)=>Math.max(0,Math.min(1,(t-a)/f,(b-t)/f));
  let next=0;
  window.__frame=(t,dt)=>{while(next<SC.length&&t>=SC[next].t-1e-6){SC[next].run();next++;}
    if(k.player.cooldown>.55)k.player.cooldown=.55;
    k.step(dt);
    for(const s of k.shots)if(!seen.has(s)){seen.add(s);window.__ev.push({t,type:'shot',owner:s.owner,ammo:s.ammo});}
    for(const q of k.particles){if(seen.has(q))continue;if(q.kind==='explosion'){seen.add(q);window.__ev.push({t,type:(q.size??0)>200?'boom':'hit'});}else if(q.kind==='splash'){seen.add(q);window.__ev.push({t,type:'splash'});}}
    // katman
    const cuts=[2.3,6.1,9.1,11.6];let blk=0;for(const c of cuts)blk=Math.max(blk,1-Math.min(1,Math.abs(t-c)/.18));blk=Math.max(blk,1-Math.min(1,t/.35));T.black(blk);
    const title=Math.max(fade(t,0,2.3,.4),Math.min(1,Math.max(0,(t-13.3)/.5)));T.set('.title','opacity',title);T.set('.title p','opacity',t<5?1:0);
    const soon=Math.min(1,Math.max(0,(t-13.9)/.25));T.set('.soon','opacity',soon);T.set('.soon','transform',`scale(${.7+.3*Math.min(1,soon*1.1)+(soon<1?soon*.12:0)})`);
    T.set('.vs','opacity',fade(t,2.45,6.0,.3));
    const c=CAP.find(([a,b])=>t>=a&&t<b);const cq=document.querySelector('#tr .cap');if(c){cq.querySelector('b').textContent=c[2];cq.querySelector('small').textContent=c[3];const o=fade(t,c[0]+.15,c[1]-.1,.3);cq.style.opacity=o;cq.style.transform=`translateY(${(1-o)*12}px)`;}else cq.style.opacity=0;
  };});
const N=TOTAL*FPS;const t0=Date.now();
for(let i=0;i<N;i++){const t=i/FPS;await p.evaluate(([t,dt])=>window.__frame(t,dt),[t,1/FPS]);await p.screenshot({path:`frames/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});if(i%60===0)console.log('kare',i,((Date.now()-t0)/1000).toFixed(0)+'s');}
const events=await p.evaluate(()=>window.__ev);fs.writeFileSync('events.json',JSON.stringify(events));
console.log('bitti',N,'kare, olay',events.length,'hatalar',errs);await b.close();

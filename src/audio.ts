// Yedi Deniz Korsan Oyunu ses efektleri. Asıl sesler asset atölyesinde (tools/asset-studio/sfx.js) katmanlı olarak tasarlanıp
// public/assets/sfx/*.mp3 olarak üretilir; her sesin birkaç varyantı vardır ve her çalışta rastgele biri, hafif perde
// ve seviye farkıyla çalınır. Dosyalar yüklenene kadar (ilk saniyeler) aşağıdaki anlık sentez yedek olarak çalar.
// Top türü gövde sesini (döküm, uzun namlu, seri, ağır), gülle türü üstüne binen katmanı belirler.
import {SFX_VARIANTS} from './sfxManifest';
export type CannonSound='cast'|'long'|'rapid'|'heavy';
export type AmmoSound='iron'|'chain'|'fire'|'grape'|'explosive'|'breaker'|'leech';

let ctx:AudioContext|null=null,master:GainNode|null=null,noiseBuffer:AudioBuffer|null=null;
let enabled=true,volume=.7;
const lastPlayed=new Map<string,number>();

function audio(){
  if(!enabled)return null;
  if(!ctx){
    const AC=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!AC)return null;
    ctx=new AC();const comp=ctx.createDynamicsCompressor();comp.threshold.value=-8;comp.ratio.value=3;comp.attack.value=.003;comp.release.value=.25;
    master=ctx.createGain();master.gain.value=volume;master.connect(comp);comp.connect(ctx.destination);
    noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    loadSamples(ctx);
  }
  if(ctx.state==='suspended')void ctx.resume();
  return ctx;
}
export function setAudio(on:boolean,vol:number){enabled=on;volume=vol;if(master&&ctx)master.gain.setTargetAtTime(on?vol:0,ctx.currentTime,.05);}
// Tarayıcılar sesi ilk kullanıcı etkileşiminden sonra açar.
export function unlockAudio(){audio();}
// ---- örnek (sample) çalar
const samples=new Map<string,AudioBuffer[]>();
function loadSamples(c:AudioContext){
  for(const [name,count] of Object.entries(SFX_VARIANTS))for(let v=0;v<count;v++)
    fetch(`/assets/sfx/${name}-${v}.mp3`).then(r=>r.arrayBuffer()).then(b=>c.decodeAudioData(b)).then(buf=>{const list=samples.get(name)??[];list[v]=buf;samples.set(name,list);}).catch(()=>{});
}
type PlayOpts={gain?:number;pan?:number;rate?:number;delay?:number;lowpass?:number;jitter?:number};
// Varyantlardan rastgele birini çalar; yüklenmemişse false döner (çağıran yedek sentezi kullanır)
function sample(name:string,{gain=1,pan=0,rate=1,delay=0,lowpass=0,jitter=.04}:PlayOpts={}){
  const c=ctx,list=samples.get(name)?.filter(Boolean);if(!c||!master||!list?.length)return false;
  const src=c.createBufferSource();src.buffer=list[Math.floor(Math.random()*list.length)];src.playbackRate.value=rate*(1+(Math.random()*2-1)*jitter);
  let node:AudioNode=src;if(lowpass){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lowpass;f.Q.value=.5;node.connect(f);node=f;}
  const g=c.createGain();g.gain.value=gain*(1+(Math.random()*2-1)*.08);node.connect(g);
  if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(master);}else g.connect(master);
  src.start(c.currentTime+delay);return true;
}
function throttle(key:string,ms:number){const now=performance.now();if((lastPlayed.get(key)??0)+ms>now)return true;lastPlayed.set(key,now);return false;}

function out(c:AudioContext,gain:number,pan=0){
  const g=c.createGain();g.gain.value=gain;
  if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(master!);}else g.connect(master!);
  return g;
}
function noise(c:AudioContext,dest:AudioNode,{start=0,dur=.5,type='lowpass' as BiquadFilterType,f0=1200,f1=200,q=.7,peak=1,attack=.004}={}){
  const t=c.currentTime+start,src=c.createBufferSource();src.buffer=noiseBuffer;src.playbackRate.value=.8+Math.random()*.4;
  const filter=c.createBiquadFilter();filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(f0,t);filter.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  src.connect(filter);filter.connect(g);g.connect(dest);src.start(t,Math.random()*1.2);src.stop(t+dur+.05);
}
function tone(c:AudioContext,dest:AudioNode,{start=0,dur=.4,type='sine' as OscillatorType,f0=120,f1=40,peak=1,attack=.005}={}){
  const t=c.currentTime+start,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(10,f1),t+dur);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05);
}

const CANNON_SHAPE:Record<CannonSound,{sub:[number,number];tail:number;crack:number;body:number;gain:number}>={
  cast:{sub:[120,42],tail:.75,crack:2600,body:1400,gain:.9},
  long:{sub:[140,48],tail:1.05,crack:3400,body:1800,gain:.85},
  rapid:{sub:[170,70],tail:.38,crack:3000,body:2200,gain:.7},
  heavy:{sub:[90,26],tail:1.3,crack:1800,body:900,gain:1},
};
export function playCannon(cannon:CannonSound,ammo:AmmoSound,{gain=1,pan=0}={}){
  const c=audio();if(!c||throttle(`cannon-${cannon}-${ammo}`,70))return;
  if(sample(`cannon-${cannon}`,{gain:.95*gain,pan})){if(ammo!=='iron')sample(`ammo-${ammo}`,{gain:.8*gain,pan,delay:.015});return;}
  const s=CANNON_SHAPE[cannon],o=out(c,s.gain*gain,pan);
  // Barut patlaması: kısa namlu çatlağı, yoğun basınç gövdesi ve uzaktaki deniz yankısı.
  noise(c,o,{dur:.035,type:'highpass',f0:s.crack*1.35,f1:s.crack*.7,q:.8,peak:.9,attack:.001});
  noise(c,o,{start:.006,dur:s.tail*.52,type:'bandpass',f0:s.body,f1:170,q:.65,peak:1,attack:.002});
  noise(c,o,{start:.012,dur:s.tail,type:'lowpass',f0:520,f1:48,q:.7,peak:.88,attack:.003});
  tone(c,o,{start:.008,dur:Math.min(.24,s.tail*.35),type:'sine',f0:s.sub[0]*.72,f1:s.sub[1]*.62,peak:.24,attack:.002});
  noise(c,o,{start:.105,dur:s.tail*.7,type:'lowpass',f0:390,f1:62,q:.55,peak:.18,attack:.025});
  noise(c,o,{start:.235,dur:s.tail*.62,type:'bandpass',f0:720,f1:95,q:.75,peak:.09,attack:.035});
  if(ammo==='chain'){
    for(let i=0;i<4;i++)noise(c,o,{start:.045+i*.038+Math.random()*.018,dur:.045,type:'bandpass',f0:2600+Math.random()*1200,f1:1250,q:7,peak:.2});
  }
  if(ammo==='fire'){
    noise(c,o,{start:.035,dur:.8,type:'bandpass',f0:430,f1:1900,q:.9,peak:.32,attack:.07});
    for(let i=0;i<7;i++)noise(c,o,{start:.1+Math.random()*.55,dur:.025,type:'highpass',f0:2800,f1:1900,peak:.12});
  }
  if(ammo==='grape'){
    for(let i=0;i<4;i++)noise(c,o,{start:.018+i*.017+Math.random()*.012,dur:.075,type:'bandpass',f0:1750,f1:420,q:1.1,peak:.22});
  }
}
export function playEnemyCannon(distance:number,pan=0){
  const c=audio();if(!c||throttle('enemy-cannon',90))return;
  const g=Math.max(.07,Math.min(.5,1-distance/950));
  // uzaktaki top: daha kısık, tizleri yutulmuş ve hafif pes
  if(sample(Math.random()<.5?'cannon-cast':'cannon-long',{gain:g*1.3,pan,rate:.93,lowpass:Math.max(700,4200-distance*3.4)}))return;
  const o=out(c,g,pan);
  noise(c,o,{dur:.035,type:'highpass',f0:2900,f1:1500,peak:.55,attack:.001});
  noise(c,o,{start:.01,dur:.62,type:'bandpass',f0:1050,f1:105,q:.7,peak:.82,attack:.002});
  noise(c,o,{start:.02,dur:1.05,type:'lowpass',f0:410,f1:45,peak:.7,attack:.004});
  tone(c,o,{start:.012,dur:.2,f0:76,f1:31,peak:.16,attack:.002});
  noise(c,o,{start:.16,dur:.72,type:'lowpass',f0:330,f1:58,peak:.13,attack:.04});
}
export function playHit(heavy=false){
  const c=audio();if(!c||throttle('hit',55))return;if(sample('hit',{gain:heavy?.9:.6,rate:heavy?.86:1}))return;const o=out(c,heavy?.7:.45);
  noise(c,o,{dur:.18,type:'bandpass',f0:900,f1:300,q:1.4,peak:.8});tone(c,o,{dur:.16,f0:160,f1:60,peak:.5});
}
export function playExplosion(big=true){
  const c=audio();if(!c||throttle('explosion',120))return;if(sample(big?'explosion':'blast',{gain:big?1:.85}))return;const o=out(c,big?1:.7);
  tone(c,o,{dur:1.2,f0:80,f1:22,peak:1});noise(c,o,{dur:1.6,f0:1500,f1:60,peak:1});
  for(let i=0;i<6;i++)noise(c,o,{start:.1+Math.random()*.6,dur:.12,type:'bandpass',f0:600+Math.random()*900,f1:200,q:2,peak:.3});
}
export function playCoins(){
  const c=audio();if(!c||throttle('coins',120))return;if(sample('coins',{gain:.55}))return;const o=out(c,.35);
  [1760,2217,2637,3136].forEach((f,i)=>tone(c,o,{start:i*.06,dur:.35,type:'triangle',f0:f,f1:f*.98,peak:.5}));
}
export function playWind(){
  const c=audio();if(!c)return;if(sample('wind',{gain:.7}))return;const o=out(c,.45);
  noise(c,o,{dur:1.1,type:'bandpass',f0:300,f1:1800,q:1.5,peak:.8,attack:.25});
}
export function playShield(){
  const c=audio();if(!c)return;if(sample('shield',{gain:.65}))return;const o=out(c,.4);
  [410,1085,1730,2390].forEach((f,i)=>tone(c,o,{dur:1.2-i*.2,type:'sine',f0:f,f1:f*.995,peak:.5/(i+1)}));
}
export function playSplash(gain=1){
  const c=audio();if(!c||throttle('splash',150))return;if(sample('splash',{gain:.6*gain}))return;const o=out(c,.35*gain);
  noise(c,o,{dur:.5,type:'lowpass',f0:1800,f1:200,peak:.7});tone(c,o,{dur:.2,f0:300,f1:90,peak:.3});
}
export function playLevelUp(){
  const c=audio();if(!c)return;if(sample('levelup',{gain:.7,jitter:0}))return;const o=out(c,.4);
  [523,659,784,1047].forEach((f,i)=>tone(c,o,{start:i*.12,dur:.6,type:'triangle',f0:f,f1:f,peak:.6}));
}
export function playMapJump(){
  const c=audio();if(!c)return;if(sample('mapjump',{gain:.75,jitter:0}))return;const o=out(c,.5);
  noise(c,o,{dur:1.3,type:'bandpass',f0:200,f1:3200,q:2,peak:.8,attack:.3});tone(c,o,{start:.2,dur:1,type:'sine',f0:300,f1:900,peak:.25});
}
export function playClick(){
  const c=audio();if(!c||throttle('click',40))return;if(sample('click',{gain:.4}))return;const o=out(c,.25);
  tone(c,o,{dur:.06,type:'square',f0:900,f1:600,peak:.2});
}
// Batan gemi: tahta inlemesi ve kabarcıklar
export function playSink(gain=1){const c=audio();if(!c||throttle('sink',300))return;sample('sink',{gain:.7*gain});}
// Can emici onarımı
export function playHeal(){const c=audio();if(!c||throttle('heal',250))return;sample('heal',{gain:.45});}

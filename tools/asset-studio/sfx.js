// Kara Yelken — ses tasarımı. Her ses OfflineAudioContext ile katman katman sentezlenir (44,1 kHz stereo),
// açık deniz yankısı (üretilmiş dürtü yanıtı) eklenir, sıkıştırılır ve normalize edilir. Her sesten birkaç
// varyant üretilir; oyun her çalışta rastgele birini seçer. sfx.mjs → public/assets/sfx/*.mp3
export const SR=44100;

function rng(seed){let s=(seed*2654435761)>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}

// ---------------------------------------------------------------- yapı taşları
class Kit{
  constructor(c,seed){this.c=c;this.r=rng(seed);this.buffers={};
    const comp=c.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=6;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.2;comp.connect(c.destination);
    this.dry=c.createGain();this.dry.connect(comp);
    this.verb=c.createConvolver();this.verbIn=c.createGain();this.verbIn.connect(this.verb);this.verb.connect(comp);this.setVerb(2,.45);}
  // Açık deniz yankısı: seyrek erken yansımalar + alçak geçirilmiş, üstel sönen dağınık kuyruk
  setVerb(len=2,damp=.5){const c=this.c,n=Math.floor(len*SR),b=c.createBuffer(2,n,SR),r=rng(991);
    for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const t=i/SR,w=r()*2-1;lp+=(w-lp)*(damp*Math.exp(-t*1.2)+.04);d[i]=lp*Math.exp(-t*3.2/len)*(t<.012?t/.012:1);}
      for(let k=0;k<9;k++){const at=Math.floor((.018+r()*.14)*SR);d[at]+=(r()-.5)*1.4*Math.exp(-at/SR*6);}}
    this.verb.buffer=b;}
  noiseBuffer(color){if(this.buffers[color])return this.buffers[color];const c=this.c,n=SR*4,b=c.createBuffer(1,n,SR),d=b.getChannelData(0),r=rng(color.length*7919+13);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,br=0;
    for(let i=0;i<n;i++){const w=r()*2-1;
      if(color==='white')d[i]=w*.5;
      else if(color==='pink'){b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926;}
      else{br=(br+.02*w)/1.02;d[i]=br*3.2;}}
    return this.buffers[color]=b;}
  shaper(drive){const s=this.c.createWaveShaper(),n=2048,curve=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;curve[i]=Math.tanh(x*drive)/Math.tanh(drive);}s.curve=curve;s.oversample='4x';return s;}
  // Çıkış: stereo konum, kuru seviye ve yankı gönderimi
  bus({pan=0,wet=.25,gain=1}={}){const c=this.c,g=c.createGain();g.gain.value=gain;const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(this.dry);if(wet>0){const s=c.createGain();s.gain.value=wet;p.connect(s);s.connect(this.verbIn);}return g;}
  env(param,t,{a=.002,peak=1,tau=.2,hold=0,end}){param.setValueAtTime(0,t);param.linearRampToValueAtTime(peak,t+a);if(hold)param.setValueAtTime(peak,t+a+hold);param.setTargetAtTime(0,t+a+hold,tau);if(end)param.setValueAtTime(0,end);}
  sweep(param,t,f0,f1,dur){param.setValueAtTime(f0,t);param.exponentialRampToValueAtTime(Math.max(10,f1),t+dur);}
  // Filtrelenmiş gürültü katmanı
  noise(dest,{t=0,dur=1,color='white',filters=[],a=.002,peak=1,tau=.2,hold=0,drive=0,rate=1}){
    const c=this.c,src=c.createBufferSource();src.buffer=this.noiseBuffer(color);src.playbackRate.value=rate;let node=src;
    for(const f of filters){const bq=c.createBiquadFilter();bq.type=f.type;bq.Q.value=f.q??.7;if(f.f1)this.sweep(bq.frequency,t,f.f0,f.f1,f.sweep??dur);else bq.frequency.value=f.f0;if(f.gain!==undefined)bq.gain.value=f.gain;node.connect(bq);node=bq;}
    if(drive){const sh=this.shaper(drive);node.connect(sh);node=sh;}
    const g=c.createGain();this.env(g.gain,t,{a,peak,tau,hold});node.connect(g);g.connect(dest);g._dest=dest;src.start(t,this.r()*2.5);src.stop(t+dur);return g;}
  // Osilatör katmanı (perde kaydırmalı)
  osc(dest,{t=0,dur=.5,type='sine',f0=100,f1,a=.002,peak=1,tau=.2,hold=0,drive=0,vib=0,vibRate=6,detune=0}){
    const c=this.c,o=c.createOscillator();o.type=type;o.detune.value=detune;if(f1)this.sweep(o.frequency,t,f0,f1,dur*.6);else o.frequency.value=f0;
    if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=vibRate;lg.gain.value=vib;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur);}
    let node=o;if(drive){const sh=this.shaper(drive);o.connect(sh);node=sh;}
    const g=c.createGain();this.env(g.gain,t,{a,peak,tau,hold});node.connect(g);g.connect(dest);o.start(t);o.stop(t+dur);return g;}
  // Rezonatör: kısa darbeyle uyarılan dar bant (metal tınısı, tahta tıkırtısı)
  ping(dest,{t=0,f=2000,q=25,peak=1,tau=.08}){this.noise(dest,{t,dur:tau*8+.02,color:'white',filters:[{type:'bandpass',f0:f,q}],a:.0005,peak:peak*q*.4,tau:.0015});
    this.osc(dest,{t,dur:tau*8,f0:f,peak:peak*.12,tau,a:.001});}
  // Rastgele dalgalanan genlik (gök gürültüsü gibi yuvarlanan kuyruk)
  // zarfı bozmamak için ayrı bir kazanç düğümü araya girer
  wobble(g,t,dur,depth=.5,rate=7){const n=Math.max(8,Math.floor(dur*rate)),curve=new Float32Array(n);let v=1;for(let i=0;i<n;i++){v+=(this.r()-.5)*depth;v=Math.max(1-depth,Math.min(1+depth,v));curve[i]=v;}
    const m=this.c.createGain();g.disconnect();g.connect(m);m.connect(g._dest);m.gain.setValueCurveAtTime(curve,t,dur);}
}

// ---------------------------------------------------------------- top atışları
const CANNONS={
  cast:{sub:[92,36],crack:2200,body:4200,tail:1.7,len:1},
  long:{sub:[104,40],crack:2900,body:5200,tail:2.1,len:1.1},
  rapid:{sub:[128,52],crack:2600,body:4800,tail:1,len:.65},
  heavy:{sub:[72,27],crack:1700,body:3400,tail:2.6,len:1.35},
};
function cannon(k,kind){const p=CANNONS[kind],r=k.r,v=.94+r()*.12;
  const front=k.bus({wet:.28}),wide=[k.bus({pan:-.55,wet:.5,gain:.8}),k.bus({pan:.55,wet:.5,gain:.8})];
  // Küçük hoparlörlerde de duyulsun diye enerji 100–800 Hz gövdede ve 2–5 kHz çatlakta toplanır; alt bas yalnızca destek.
  // 1) namlu çatlağı: çok kısa, sert, doygun + parlak ikinci çatlak
  k.noise(front,{dur:.08,color:'white',filters:[{type:'highpass',f0:p.crack*v,q:.8}],a:.0004,peak:1.7,tau:.011,drive:4});
  k.noise(front,{dur:.12,color:'white',filters:[{type:'bandpass',f0:p.crack*1.2*v,q:1}],a:.0006,peak:1.2,tau:.022,drive:3});
  // 2) barut patlaması gövdesi: parlak başlayıp hızla kararır
  k.noise(front,{dur:.9*p.len,color:'pink',filters:[{type:'lowpass',f0:p.body*v,f1:300,sweep:.2*p.len,q:.5}],a:.001,peak:1.7,tau:.075*p.len,drive:2.6});
  // 3) orta bant yumruk (göğüsteki "güm")
  k.noise(front,{dur:.7*p.len,color:'pink',filters:[{type:'bandpass',f0:420*v,f1:180,sweep:.3*p.len,q:.9}],a:.0015,peak:2.2,tau:.07*p.len,drive:2.2});
  k.osc(front,{dur:.4*p.len,type:'triangle',f0:p.sub[0]*2.3*v,f1:p.sub[1]*2.5*v,peak:.45,tau:.07*p.len,drive:1.4});
  // 4) alt bas desteği
  k.osc(front,{dur:.6*p.len,f0:p.sub[0]*v,f1:p.sub[1]*v,peak:.42,tau:.11*p.len,a:.002,drive:1.2});
  // 5) basınç dalgası
  k.noise(front,{t:.004,dur:1.1*p.len,color:'brown',filters:[{type:'lowpass',f0:260,q:.6}],a:.004,peak:.4,tau:.15*p.len});
  // 6) açık denizde yuvarlanan kuyruk (iki yana açılmış, dalgalı)
  wide.forEach((b,i)=>{const g=k.noise(b,{t:.03+i*.02,dur:p.tail+.4,color:'brown',filters:[{type:'lowpass',f0:700,f1:150,sweep:p.tail,q:.5}],a:.05,peak:.42,tau:p.tail*.3});k.wobble(g,.25+i*.02,p.tail,.45,6+i*2);});
  // 7) gövdenin tahta çatırtısı (topun geri tepmesi)
  for(let i=0;i<3;i++)k.ping(front,{t:.02+r()*.05,f:300+r()*500,q:6,peak:.3,tau:.03});
  return 1.2+p.tail;
}
// ---------------------------------------------------------------- gülle katmanları (top sesinin üstüne biner)
const AMMO={
  chain(k){const b=k.bus({wet:.3});// dönen zincir vınlaması + metal şıngırtıları
    const g=k.noise(b,{t:.02,dur:.9,color:'pink',filters:[{type:'bandpass',f0:900,f1:600,q:2.2}],a:.03,peak:.9,tau:.3});
    const l=k.c.createOscillator(),lg=k.c.createGain();l.type='square';k.sweep(l.frequency,.02,17,8,.8);lg.gain.value=.45;l.connect(lg);lg.connect(g.gain);l.start(.02);l.stop(.95);
    for(let i=0;i<8;i++)k.ping(b,{t:.03+i*.07+k.r()*.03,f:2600+k.r()*2600,q:28,peak:.35-i*.03,tau:.05});return 1.2;},
  fire(k){const b=k.bus({wet:.35});// alev hışırtısı, gürleme ve kor çıtırtıları
    k.noise(b,{t:.02,dur:1.2,color:'pink',filters:[{type:'bandpass',f0:280,f1:1500,sweep:.5,q:1.1}],a:.07,peak:.8,tau:.3});
    k.noise(b,{t:.02,dur:1.2,color:'brown',filters:[{type:'lowpass',f0:320}],a:.05,peak:.5,tau:.35});
    for(let i=0;i<26;i++)k.noise(b,{t:.05+k.r()*1,dur:.02,color:'white',filters:[{type:'highpass',f0:2500+k.r()*3000}],a:.0003,peak:.25+k.r()*.35,tau:.002});return 1.4;},
  grape(k){const b=k.bus({wet:.3});// yayılan saçma patlakları + tane vızıltısı
    for(let i=0;i<8;i++){const t=k.r()*.075;k.noise(k.bus({pan:(k.r()-.5)*.9,wet:.3}),{t,dur:.08,color:'white',filters:[{type:'bandpass',f0:1100+k.r()*1400,q:1.3}],a:.0005,peak:.7,tau:.012,drive:3});}
    k.noise(b,{t:.04,dur:.5,color:'white',filters:[{type:'highpass',f0:5200,f1:2400,sweep:.4}],a:.02,peak:.25,tau:.12});return .8;},
  explosive(k){const b=k.bus({wet:.25});// fitil cızırtısı ve havan tokadı
    const g=k.noise(b,{t:.02,dur:.6,color:'white',filters:[{type:'highpass',f0:4200,q:.7}],a:.01,peak:.45,tau:.2});k.wobble(g,.03,.5,.8,40);
    k.osc(b,{dur:.3,f0:190,f1:62,peak:.6,tau:.06,drive:2});return .9;},
  breaker(k){const b=k.bus({wet:.45});// çelik mermi çınlaması, ses üstü çatlak, ıslık
    k.noise(b,{dur:.05,color:'white',filters:[{type:'highpass',f0:3200}],a:.0003,peak:.8,tau:.006,drive:5});
    [[620,.5],[1510,.35],[2730,.3],[4150,.22],[5890,.15]].forEach(([f,tau],i)=>k.osc(b,{t:.01,dur:tau*6,f0:f*(1+(k.r()-.5)*.02),peak:.28/(1+i*.4),tau}));
    k.osc(b,{t:.03,dur:.5,f0:2300,f1:1300,peak:.08,tau:.18,a:.02});return 1.6;},
  leech(k){const b=k.bus({wet:.6});// hayalet iniltisi: vibratolu sesler ve yükselen fısıltı
    [[330,0],[337,8],[495,-6],[165,0]].forEach(([f,d],i)=>k.osc(b,{t:.02,dur:1.2,type:i===3?'triangle':'sine',f0:f,detune:d,vib:6+i*2,vibRate:5+i,a:.18,hold:.1,peak:i===3?.35:.22,tau:.3}));
    k.noise(b,{t:.02,dur:1.1,color:'pink',filters:[{type:'bandpass',f0:600,f1:2400,sweep:.5,q:5}],a:.25,peak:.35,tau:.25});return 1.5;},
};
// ---------------------------------------------------------------- vuruşlar, patlamalar, su
function hit(k){const b=k.bus({wet:.22}),r=k.r;// tahta gövdeye isabet: gümleme, kırılma, kıymıklar, gıcırtı
  k.noise(b,{dur:.5,color:'brown',filters:[{type:'lowpass',f0:300}],a:.002,peak:.6,tau:.08,drive:2});
  k.noise(b,{dur:.4,color:'pink',filters:[{type:'bandpass',f0:520,f1:260,sweep:.2,q:1}],a:.001,peak:1.6,tau:.06,drive:2.5});
  k.osc(b,{dur:.3,f0:180,f1:80,peak:.35,tau:.05});
  for(let i=0;i<8;i++)k.noise(k.bus({pan:(r()-.5)*.8,wet:.2}),{t:r()*.09,dur:.06,color:'pink',filters:[{type:'bandpass',f0:350+r()*2200,q:1.8}],a:.0008,peak:.6+r()*.4,tau:.012+r()*.02,drive:2.5});
  for(let i=0;i<6;i++)k.ping(b,{t:.02+r()*.2,f:3000+r()*3000,q:12,peak:.2,tau:.012});
  k.osc(b,{t:.05,dur:.3,type:'sawtooth',f0:170+r()*60,f1:120,peak:.08,tau:.08,a:.02});return .9;}
function explosion(k,big){const len=big?1:.55,r=k.r,b=k.bus({wet:.4}),wide=[k.bus({pan:-.6,wet:.55}),k.bus({pan:.6,wet:.55})];
  if(big)k.setVerb(3,.4);
  k.noise(b,{dur:.08,color:'white',filters:[{type:'highpass',f0:1500}],a:.0004,peak:1.1,tau:.01,drive:4});
  k.noise(b,{dur:1.5*len,color:'pink',filters:[{type:'lowpass',f0:3500,f1:160,sweep:.5*len}],a:.002,peak:1.4,tau:.2*len,drive:3});
  k.osc(b,{dur:1.6*len,f0:68,f1:22,peak:1.1,tau:.35*len,drive:1.8});
  wide.forEach((w,i)=>{const g=k.noise(w,{t:.05,dur:3*len+.3,color:'brown',filters:[{type:'lowpass',f0:600,f1:120,sweep:2.5*len}],a:.06,peak:.7,tau:.8*len});k.wobble(g,.1,2.8*len,.5,5+i*3);});
  for(let i=0;i<(big?16:7);i++)k.noise(k.bus({pan:(r()-.5)*1.2,wet:.4}),{t:.15+r()*1.4*len,dur:.08,color:'pink',filters:[{type:'bandpass',f0:500+r()*2500,q:2}],a:.001,peak:.15+r()*.3,tau:.02,drive:2});
  return 3.4*len+.6;}
function splash(k){const r=k.r,b=k.bus({wet:.2});// suya düşme: plop, su püskürmesi, kabarcıklar
  k.osc(b,{dur:.12,f0:620+r()*200,f1:170,peak:.55,tau:.03});
  k.noise(b,{dur:.25,color:'pink',filters:[{type:'lowpass',f0:3000,f1:500,sweep:.15}],a:.002,peak:.8,tau:.05});
  k.noise(b,{t:.02,dur:1,color:'white',filters:[{type:'bandpass',f0:2600,f1:1400,sweep:.6,q:.9}],a:.025,peak:.55,tau:.22});
  for(let i=0;i<14;i++){const t=.05+r()*.7,f=380+r()*900;k.osc(k.bus({pan:(r()-.5)*.8,wet:.2}),{t,dur:.06,f0:f,f1:f*2.2,peak:.12+r()*.1,tau:.012});}return 1.2;}
function sink(k){const r=k.r,b=k.bus({wet:.45});// batış: tahta inlemesi, su dolması, kabarcık
  for(let i=0;i<2;i++){const g=k.osc(b,{t:.1+i*.7,dur:1.2,type:'sawtooth',f0:62+r()*20,f1:44,peak:.18,tau:.35,a:.15});}
  k.noise(b,{t:.1,dur:1.6,color:'pink',filters:[{type:'bandpass',f0:500,f1:260,sweep:1.4,q:6}],a:.3,peak:.35,tau:.4});
  k.noise(b,{dur:2.8,color:'brown',filters:[{type:'lowpass',f0:700,f1:200,sweep:2.4}],a:.4,peak:.6,tau:.8});
  for(let i=0;i<46;i++){const t=.2+r()*2.4,f=250+r()*700;k.osc(k.bus({pan:(r()-.5),wet:.3}),{t,dur:.08,f0:f,f1:f*2.5,peak:.1+r()*.12,tau:.015});}return 3.2;}
// ---------------------------------------------------------------- arayüz ve yetenekler
function coins(k){const r=k.r,b=k.bus({wet:.25});[0,.05,.09,.15,.2,.29].forEach((t,i)=>{const f=2100+r()*1100;[1,2.76,5.4].forEach((m,j)=>k.osc(b,{t,dur:.8,f0:f*m,peak:.3/(1+j*1.3),tau:.16/(1+j*.8)}));k.noise(b,{t,dur:.02,color:'white',filters:[{type:'highpass',f0:4000}],a:.0003,peak:.2,tau:.003});});return 1.2;}
function bell(k,t,f,peak=1){const b=k.bus({wet:.5});[[.5,1.6],[1,1.2],[1.19,.9],[1.56,.7],[2,.6],[2.51,.45],[3.01,.35]].forEach(([m,tau],i)=>k.osc(b,{t,dur:tau*6,f0:f*m,peak:peak*.32/(1+i*.35),tau}));k.noise(b,{t,dur:.03,color:'white',filters:[{type:'bandpass',f0:f*4,q:3}],a:.0003,peak:peak*.5,tau:.004});}
function levelup(k){bell(k,0,520);bell(k,.42,520,.8);const b=k.bus({wet:.5});[523.25,659.25,783.99,1046.5].forEach((f,i)=>{k.osc(b,{t:.9+i*.13,dur:1.4,type:'triangle',f0:f,peak:.35,tau:.4,a:.01});k.osc(b,{t:.9+i*.13,dur:1.2,f0:f*2,peak:.1,tau:.3});});return 3.2;}
function shield(k){const b=k.bus({wet:.6});[[410,.9],[1085,.7],[1730,.55],[2390,.45],[3120,.35]].forEach(([f,tau],i)=>k.osc(b,{dur:2,f0:f,peak:.3/(1+i*.4),tau,a:.12,vib:f*.004,vibRate:9}));
  k.noise(b,{dur:1.4,color:'white',filters:[{type:'bandpass',f0:5000,q:2}],a:.2,peak:.25,tau:.3});k.osc(b,{dur:.5,f0:180,f1:90,peak:.4,tau:.12});return 2;}
function wind(k){const b=k.bus({wet:.3});const g=k.noise(b,{dur:1.8,color:'pink',filters:[{type:'bandpass',f0:280,f1:1100,sweep:.6,q:.9}],a:.4,peak:1,tau:.45});k.wobble(g,.1,1.5,.35,8);
  for(let i=0;i<5;i++)k.noise(b,{t:.15+i*.11,dur:.09,color:'brown',filters:[{type:'lowpass',f0:400}],a:.005,peak:.5,tau:.03});return 2;}
function mapjump(k){k.setVerb(3,.35);const b=k.bus({wet:.6});k.noise(b,{dur:2.2,color:'brown',filters:[{type:'lowpass',f0:120,f1:2200,sweep:1.1,q:1.5}],a:.6,peak:1.1,tau:.4});
  k.osc(b,{dur:2,f0:55,f1:110,peak:.6,tau:.5,a:.4});[880,1175,1568,2093].forEach((f,i)=>k.osc(b,{t:.5+i*.12,dur:1.5,f0:f,peak:.14,tau:.35,a:.05,vib:f*.01}));return 2.8;}
function click(k){const b=k.bus({wet:.05});k.ping(b,{f:1900,q:9,peak:.9,tau:.012});k.ping(b,{f:680,q:6,peak:.7,tau:.02});return .15;}
function heal(k){const b=k.bus({wet:.6});[880,1318.5,1760].forEach((f,i)=>k.osc(b,{t:i*.06,dur:1.2,f0:f,peak:.22,tau:.3,a:.08,vib:6,vibRate:6}));k.noise(b,{dur:.9,color:'white',filters:[{type:'bandpass',f0:6000,q:3}],a:.15,peak:.15,tau:.2});return 1.3;}

// ad → [varyant sayısı, üretici]
export const SOUNDS={
  'cannon-cast':[3,k=>cannon(k,'cast')],'cannon-long':[3,k=>cannon(k,'long')],'cannon-rapid':[3,k=>cannon(k,'rapid')],'cannon-heavy':[3,k=>cannon(k,'heavy')],
  'ammo-chain':[2,AMMO.chain],'ammo-fire':[2,AMMO.fire],'ammo-grape':[2,AMMO.grape],'ammo-explosive':[2,AMMO.explosive],'ammo-breaker':[2,AMMO.breaker],'ammo-leech':[2,AMMO.leech],
  hit:[4,hit],explosion:[2,k=>explosion(k,true)],blast:[2,k=>explosion(k,false)],splash:[3,splash],sink:[2,sink],
  coins:[2,coins],levelup:[1,levelup],shield:[1,shield],wind:[2,wind],mapjump:[1,mapjump],click:[2,click],heal:[2,heal],
};
// Tek ses varyantını üretir: {l,r} Float32Array, tepe -1 dBFS'e normalize, kuyruğu sessizlikte kırpılmış
export async function renderSfx(name,variant){
  const [,build]=SOUNDS[name],probe=new OfflineAudioContext(2,SR,SR),probeKit=new Kit(probe,1);const len=build(probeKit)+.3;
  const c=new OfflineAudioContext(2,Math.ceil(len*SR),SR),k=new Kit(c,(name.length*131+variant*977)>>>0);build(k);
  const buf=await c.startRendering(),l=buf.getChannelData(0),r=buf.getChannelData(1);
  let peak=0;for(let i=0;i<l.length;i++)peak=Math.max(peak,Math.abs(l[i]),Math.abs(r[i]));const g=peak?.89/peak:1;
  let end=l.length;const floor=.0015/g;while(end>SR*.1&&Math.abs(l[end-1])<floor&&Math.abs(r[end-1])<floor)end--;end=Math.min(l.length,end+Math.floor(SR*.02));
  const L=new Float32Array(end),R=new Float32Array(end),fade=Math.floor(SR*.02);for(let i=0;i<end;i++){const f=i>end-fade?(end-i)/fade:1;L[i]=l[i]*g*f;R[i]=r[i]*g*f;}
  return{l:L,r:R,sr:SR};
}

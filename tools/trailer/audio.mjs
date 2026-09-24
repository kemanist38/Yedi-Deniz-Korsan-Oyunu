// Fragman sesi: prosedürel epik müzik + oyunun ses efektleri olay zamanlarına göre (OfflineAudioContext, 48 kHz stereo)
import {chromium} from '/home/user/kara-yelken/tools/asset-studio/node_modules/playwright/index.mjs';import fs from 'node:fs';
const events=JSON.parse(fs.readFileSync('events.json','utf8'));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();await p.goto('http://localhost:5173/');
const wav=await p.evaluate(async events=>{
  const SR=48000,DUR=15.2,c=new OfflineAudioContext(2,Math.ceil(SR*DUR),SR);
  const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;comp.connect(c.destination);
  const master=c.createGain();master.gain.value=.9;master.connect(comp);
  // yankı
  const verb=c.createConvolver(),vl=SR*2.6,vb=c.createBuffer(2,vl,SR);for(let ch=0;ch<2;ch++){const d=vb.getChannelData(ch);for(let i=0;i<vl;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/vl,3.2);}verb.buffer=vb;const vg=c.createGain();vg.gain.value=.28;verb.connect(vg);vg.connect(master);
  const bus=(g=1,wet=.3)=>{const x=c.createGain();x.gain.value=g;x.connect(master);const w=c.createGain();w.gain.value=wet;x.connect(w);w.connect(verb);return x;};
  const noiseBuf=c.createBuffer(1,SR*2,SR);{const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const env=(g,t,a,peak,rel)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(0,t+a,rel);};
  // --- müzik: 96 BPM, Re minör; Dm - Bb - C - Dm, taiko davulları, yaylı dron, pirinç vuruşları
  const BPM=96,beat=60/BPM,mus=bus(.55,.35);
  const drum=(t,f=62,g=1)=>{const o=c.createOscillator(),gg=c.createGain();o.frequency.setValueAtTime(f*1.9,t);o.frequency.exponentialRampToValueAtTime(f,t+.09);env(gg,t,.003,g,.16);o.connect(gg);gg.connect(mus);o.start(t);o.stop(t+1);
    const n=c.createBufferSource();n.buffer=noiseBuf;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;const ng=c.createGain();env(ng,t,.001,g*.35,.03);n.connect(bp);bp.connect(ng);ng.connect(mus);n.start(t);n.stop(t+.3);};
  const note=(f,t,dur,g,type='sawtooth',cut=1400)=>{for(const det of [-7,0,7]){const o=c.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=cut;const gg=c.createGain();gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(g/3,t+.25);gg.gain.setValueAtTime(g/3,t+dur-.3);gg.gain.linearRampToValueAtTime(0,t+dur);o.connect(lp);lp.connect(gg);gg.connect(mus);o.start(t);o.stop(t+dur+.05);}};
  const hz=m=>440*Math.pow(2,(m-69)/12);
  const chords=[[50,53,57],[46,50,53],[48,52,55],[50,53,57]];// Dm Bb C Dm
  const bar=beat*4;
  for(let i=0;i*bar<13.2;i++){const ch=chords[i%4],t=i*bar;ch.forEach(m=>note(hz(m),t,bar+.05,.16));note(hz(ch[0]-12),t,bar+.05,.22,'sawtooth',500);}
  // davul kalıbı: sahne 1'den sonra yoğunlaşır
  for(let t=0;t<13.2;t+=beat/2){const k=Math.round(t/(beat/2))%8,dense=t>2.3;if(k===0||k===4||(dense&&(k===3||k===6)))drum(t,k===0?52:66,k===0?1:.7);if(dense&&t>6&&k%2===1)drum(t,90,.35);}
  // sahne geçişlerinde pirinç vuruşu
  const brass=(t,m,g=.5)=>{[0,7,12].forEach(i=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=hz(m+i);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(400,t);lp.frequency.linearRampToValueAtTime(2600,t+.12);lp.frequency.setTargetAtTime(700,t+.15,.3);const g2=c.createGain();env(g2,t,.04,g/3,.45);o.connect(lp);lp.connect(g2);g2.connect(mus);o.start(t);o.stop(t+2);});};
  [2.3,6.1,9.1,11.6].forEach((t,i)=>{brass(t,[50,46,48,50][i]);drum(t,45,1.2);});
  // kapanış: yükselen nefes + büyük vuruş + ÇOK YAKINDA vurgusu
  {const n=c.createBufferSource();n.buffer=noiseBuf;n.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(300,12.2);bp.frequency.exponentialRampToValueAtTime(4000,13.2);const g=c.createGain();g.gain.setValueAtTime(0,12.2);g.gain.linearRampToValueAtTime(.35,13.15);g.gain.linearRampToValueAtTime(0,13.25);n.connect(bp);bp.connect(g);g.connect(mus);n.start(12.2);n.stop(13.4);}
  drum(13.25,38,1.6);brass(13.25,38,.9);brass(13.25,50,.6);[50,53,57,62].forEach(m=>note(hz(m),13.3,1.9,.2,'sawtooth',1800));
  drum(13.9,45,1.3);brass(13.9,57,.7);
  // --- efektler
  const sfx={};const load=async n=>{if(!sfx[n])sfx[n]=await Promise.all([0,1,2,3].map(v=>fetch(`/assets/sfx/${n}-${v}.mp3`).then(r=>r.ok?r.arrayBuffer():null).then(a=>a?c.decodeAudioData(a):null).catch(()=>null))).then(l=>l.filter(Boolean));return sfx[n];};
  const play=async(n,t,g,rate=1,lp=0)=>{const l=await load(n);if(!l.length)return;const s=c.createBufferSource();s.buffer=l[Math.floor(Math.random()*l.length)];s.playbackRate.value=rate*(.96+Math.random()*.08);let node=s;if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.connect(f);node=f;}const gg=c.createGain();gg.gain.value=g;node.connect(gg);gg.connect(sfxBus);s.start(Math.max(0,t));};
  const sfxBus=bus(.9,.15);
  const last={};
  for(const e of events){if(e.t>13.2)continue;const key=e.type+(e.owner||'');if(last[key]!==undefined&&e.t-last[key]<.09)continue;last[key]=e.t;
    if(e.type==='shot'&&e.owner==='player'){await play('cannon-cast',e.t,.55);if(e.ammo&&e.ammo!=='iron')await play('ammo-'+e.ammo,e.t+.01,.35);}
    else if(e.type==='shot')await play('cannon-long',e.t,.3,.92,2500);
    else if(e.type==='hit')await play('hit',e.t,.45);
    else if(e.type==='boom')await play('explosion',e.t,.6);
    else if(e.type==='splash')await play('splash',e.t,.25);}
  await play('mapjump',0.05,.35);await play('wind',11.65,.4);
  const buf=await c.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;
  // sonda yumuşak kısılma
  for(let i=0;i<n;i++){const t=i/SR,f=t>14.3?Math.max(0,1-(t-14.3)/.9):1;L[i]*=f;R[i]*=f;}
  let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));const k=.95/peak;
  const out=new DataView(new ArrayBuffer(44+n*4));const w=(o,s)=>{for(let i=0;i<s.length;i++)out.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF');out.setUint32(4,36+n*4,true);w(8,'WAVEfmt ');out.setUint32(16,16,true);out.setUint16(20,1,true);out.setUint16(22,2,true);out.setUint32(24,SR,true);out.setUint32(28,SR*4,true);out.setUint16(32,4,true);out.setUint16(34,16,true);w(36,'data');out.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){out.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*k))*32767,true);out.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*k))*32767,true);}
  const u=new Uint8Array(out.buffer);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);},events);
fs.writeFileSync('audio.wav',Buffer.from(wav,'base64'));console.log('audio.wav',(fs.statSync('audio.wav').size/1e6).toFixed(1),'MB');await b.close();

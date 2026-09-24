// Yedi Deniz Korsan Oyunu — boss müzikleri. Her deniz teması (1–8) için kendi tonu, dizisi, temposu ve çalgılarıyla
// 8 ölçülük, kesintisiz dönen (loop) bir savaş parçası OfflineAudioContext ile sentezlenir.
// music.mjs → public/assets/music/boss-<tema>.mp3
import {Kit,rng,SR} from './sfx.js';

const SCALES={dorian:[0,2,3,5,7,9,10],minor:[0,2,3,5,7,8,10],harmonic:[0,2,3,5,7,8,11],phrygian:[0,1,3,5,7,8,10]};
// Akorlar dizinin derecesi (0 = kök) olarak; her ölçüye bir akor
export const THEMES={
  1:{name:'Güvenli Harita',bpm:112,root:50,scale:'dorian',chords:[0,6,3,4,0,6,4,0],lead:'fiddle',drums:'bodhran',pad:.5,seed:11},
  2:{name:'İnciyolu Denizi',bpm:118,root:52,scale:'minor',chords:[0,5,2,6,0,5,6,0],lead:'marimba',drums:'war',pad:.55,seed:23},
  3:{name:'Azurya Denizi',bpm:122,root:45,scale:'minor',chords:[0,5,6,4,0,3,6,4],lead:'horn',drums:'war',pad:.6,seed:37},
  4:{name:'Hayalet Denizi',bpm:96,root:49,scale:'phrygian',chords:[0,1,0,6,0,1,5,4],lead:'whistle',drums:'slow',pad:.8,seed:41,eerie:true},
  5:{name:'Buzmahzen Denizi',bpm:104,root:54,scale:'minor',chords:[0,5,2,6,3,5,6,4],lead:'bells',drums:'war',pad:.7,seed:53,bells:true},
  6:{name:'Fırtına Denizi',bpm:132,root:43,scale:'harmonic',chords:[0,5,3,4,0,5,1,4],lead:'horn',drums:'storm',pad:.6,seed:67,thunder:true},
  7:{name:'Karanlık Uçurum Denizi',bpm:92,root:46,scale:'phrygian',chords:[0,1,6,0,5,1,6,4],lead:'organ',drums:'slow',pad:.9,seed:71,eerie:true},
  8:{name:'Alev Denizi',bpm:140,root:50,scale:'harmonic',chords:[0,5,1,4,0,5,3,4],lead:'fire',drums:'storm',pad:.6,seed:89,drive:true},
};
const BARS=8;
const hz=m=>440*Math.pow(2,(m-69)/12);
const note=(th,deg,oct=0)=>{const sc=SCALES[th.scale],n=sc.length,o=Math.floor(deg/n),d=((deg%n)+n)%n;return th.root+sc[d]+12*(o+oct);};

// ---------------------------------------------------------------- çalgılar
function kick(k,b,t,p=1){k.osc(b,{t,dur:.5,f0:110,f1:42,peak:1.1*p,tau:.16});k.noise(b,{t,dur:.05,color:'white',filters:[{type:'lowpass',f0:1800}],peak:.25*p,tau:.01});}
function taiko(k,b,t,p=1){k.osc(b,{t,dur:.9,f0:88,f1:52,peak:1*p,tau:.28});k.noise(b,{t,dur:.4,color:'brown',filters:[{type:'lowpass',f0:500}],peak:.9*p,tau:.12});k.ping(b,{t,f:180,q:4,peak:.3*p,tau:.05});}
function snare(k,b,t,p=1){k.noise(b,{t,dur:.25,color:'white',filters:[{type:'bandpass',f0:2200,q:.8}],peak:.55*p,tau:.07});k.osc(b,{t,dur:.15,f0:210,f1:160,peak:.35*p,tau:.05});}
function frame(k,b,t,p=1){k.noise(b,{t,dur:.2,color:'pink',filters:[{type:'bandpass',f0:600,q:1.2}],peak:.7*p,tau:.06});k.osc(b,{t,dur:.3,f0:130,f1:95,peak:.5*p,tau:.09});}
function bass(k,b,t,m,dur,th){const g=k.osc(b,{t,dur:dur+.1,type:'sawtooth',f0:hz(m),peak:.4,a:.01,hold:dur*.6,tau:.08,drive:th.drive?2.5:0});
  const lp=k.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=th.drive?900:520;lp.Q.value=3;g.disconnect();g.connect(lp);lp.connect(b);
  k.osc(b,{t,dur:dur+.1,f0:hz(m-12),peak:.35,a:.01,hold:dur*.6,tau:.08});}
function pad(k,b,t,ms,dur,th){for(const m of ms)for(const det of [-9,9]){const g=k.osc(b,{t,dur:dur+.4,type:th.eerie?'triangle':'sawtooth',f0:hz(m),detune:det,a:.35,hold:dur-.3,peak:.07*th.pad,tau:.3});
  const lp=k.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=th.eerie?1400:1800;g.disconnect();g.connect(lp);lp.connect(b);}}
function lead(k,b,t,m,dur,th){const f=hz(m);
  switch(th.lead){
    case 'fiddle':{const g=k.osc(b,{t,dur:dur+.15,type:'sawtooth',f0:f,peak:.16,a:.04,hold:dur*.7,tau:.1,vib:f*.008,vibRate:6});const bp=k.c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*3;bp.Q.value=.8;g.disconnect();g.connect(bp);bp.connect(b);break;}
    case 'marimba':k.osc(b,{t,dur:.8,f0:f,peak:.4,tau:.22});k.osc(b,{t,dur:.3,f0:f*4,peak:.1,tau:.05});break;
    case 'horn':horn(k,b,t,f,dur,.13);break;
    case 'whistle':k.osc(b,{t,dur:dur+.3,f0:f*2,peak:.16,a:.12,hold:dur*.6,tau:.25,vib:f*.02,vibRate:4.5});break;
    case 'bells':[[1,1.4],[2.76,.5],[5.4,.25]].forEach(([mm,tau],i)=>k.osc(b,{t,dur:tau*5,f0:f*2*mm,peak:.22/(1+i),tau}));break;
    case 'organ':[1,2,3,4].forEach((h,i)=>k.osc(b,{t,dur:dur+.1,f0:f*h,peak:.08/(1+i*.6),a:.03,hold:dur*.8,tau:.08}));break;
    case 'fire':{const g=k.osc(b,{t,dur:dur+.1,type:'sawtooth',f0:f,peak:.13,a:.01,hold:dur*.7,tau:.08,drive:4,vib:f*.01,vibRate:6.5});const lp=k.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;g.disconnect();g.connect(lp);lp.connect(b);break;}
  }}
function horn(k,b,t,f,dur,peak){[[1,0],[1.003,6]].forEach(([mm,det])=>{const g=k.osc(b,{t,dur:dur+.3,type:'sawtooth',f0:f*mm,detune:det,a:.07,hold:dur*.7,peak,tau:.15,vib:f*.005,vibRate:5});
  const lp=k.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.5;lp.frequency.setValueAtTime(400,t);lp.frequency.linearRampToValueAtTime(f*6,t+.12);g.disconnect();g.connect(lp);lp.connect(b);});}

// ---------------------------------------------------------------- beste
function compose(k,th){
  const beat=60/th.bpm,bar=beat*4,r=rng(th.seed),drums=k.bus({wet:.25,gain:.9}),low=k.bus({wet:.15}),padB=k.bus({wet:.6}),leadB=k.bus({wet:.45,pan:.12}),hi=k.bus({wet:.5,pan:-.2});
  // Motif: 2 ölçülük ritim ve melodi, 4 kez tekrar; son tekrarda yükselir
  const rhythm=[[0,1],[1,.5],[1.5,.5],[2,1],[3,1],[4,1.5],[5.5,.5],[6,2]];
  const steps=rhythm.map(()=>Math.floor(r()*5)-2);
  for(let i=0;i<BARS;i++){const t=i*bar,deg=th.chords[i],tri=[deg,deg+2,deg+4].map(d=>note(th,d,0));
    pad(k,padB,t,tri,bar,th);
    // bas: sekizlik ostinato (kök, kök, beşli, kök)
    for(let e=0;e<8;e++){const m=note(th,deg+(e%4===2?4:0),-1);bass(k,low,t+e*beat/2,m,beat/2*.9,th);}
    // davul
    for(let q=0;q<4;q++){const tt=t+q*beat;
      if(th.drums==='bodhran'){frame(k,drums,tt,q%2?.6:1);frame(k,drums,tt+beat*.5,.45);if(q===3)frame(k,drums,tt+beat*.75,.4);}
      else if(th.drums==='slow'){if(q===0||q===2)taiko(k,drums,tt,q?0.7:1);if(q===3&&i%2)taiko(k,drums,tt+beat*.5,.5);}
      else{if(q%2===0)kick(k,drums,tt);else snare(k,drums,tt,.8);if(th.drums==='storm'){kick(k,drums,tt+beat*.5,.6);snare(k,drums,tt+beat*.75,.3);}if(q===0)taiko(k,drums,tt,.7);}}
    if(i===BARS-1)for(let n=0;n<6;n++)taiko(k,drums,t+bar-beat*1.5+n*beat/4,.5+n*.08);
    if(th.bells&&i%2===0)[0,2].forEach(q=>k.osc(hi,{t:t+q*beat,dur:2,f0:hz(note(th,deg+4,2)),peak:.12,tau:.6}));
    if(th.thunder&&i%4===2)k.noise(hi,{t:t+beat,dur:3,color:'brown',filters:[{type:'lowpass',f0:300}],a:.3,peak:.6,tau:.9});
  }
  // Melodi: ilk ölçü çiftinde motif, sonra akora göre kaydırılmış tekrarlar
  for(let rep=0;rep<BARS/2;rep++){let d=th.chords[rep*2]+(rep===3?2:0);
    rhythm.forEach(([at,len],j)=>{d+=steps[j];const chordTone=at%2===0,deg=chordTone?th.chords[rep*2+(at>=4?1:0)]+[0,2,4][Math.abs(d)%3]:d;
      lead(k,leadB,rep*2*bar+at*beat,note(th,deg,1),len*beat*.92,th);});}
  return BARS*bar;
}
// Döngü: parça + 3 sn kuyruk sentezlenir, kuyruk başa eklenir → kesintisiz tekrar
export async function renderMusic(tier){
  const th=THEMES[tier],len=BARS*4*60/th.bpm,tail=3,c=new OfflineAudioContext(2,Math.ceil((len+tail)*SR),SR),k=new Kit(c,th.seed);k.setVerb(2.6,.4);compose(k,th);
  const buf=await c.startRendering(),N=Math.round(len*SR),out=[0,1].map(ch=>{const d=buf.getChannelData(ch),o=new Float32Array(N);o.set(d.subarray(0,N));for(let i=0;i<d.length-N;i++)o[i]+=d[N+i];return o;});
  let peak=0;for(const o of out)for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(o[i]));const g=peak?.8/peak:1;for(const o of out)for(let i=0;i<N;i++)o[i]*=g;
  return{l:out[0],r:out[1],sr:SR,seconds:len};
}

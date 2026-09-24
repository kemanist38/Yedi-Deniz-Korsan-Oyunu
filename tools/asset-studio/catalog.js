// Yedi Deniz Korsan Oyunu — 18 haritanın NPC gemileri ve canavarlarının görsel katalogu.
// Kimlikler (ör. "n3-2-heavy") oyundaki src/campaign.ts ile birebir aynıdır.

// ---------------------------------------------------------------- Amblemler (yelken) ve sancak işaretleri
const E={
  anchor:(x,W,H,c)=>{x.strokeStyle=c;x.fillStyle=c;x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(W/2,H*.2);x.lineTo(W/2,H*.78);x.stroke();x.beginPath();x.arc(W/2,H*.2,12,0,7);x.lineWidth=7;x.stroke();x.lineWidth=12;x.beginPath();x.moveTo(W*.34,H*.34);x.lineTo(W*.66,H*.34);x.stroke();x.beginPath();x.arc(W/2,H*.56,W*.22,.15*Math.PI,.85*Math.PI);x.stroke();},
  shell:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W/2,H*.78);for(let i=0;i<=8;i++){const a=Math.PI*(1+i/8);x.lineTo(W/2+Math.cos(a)*W*.3,H*.52+Math.sin(a)*H*.3);}x.closePath();x.fill();x.strokeStyle='#00000055';x.lineWidth=4;for(let i=1;i<8;i++){const a=Math.PI*(1+i/8);x.beginPath();x.moveTo(W/2,H*.78);x.lineTo(W/2+Math.cos(a)*W*.3,H*.52+Math.sin(a)*H*.3);x.stroke();}},
  skull:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W/2,H*.42,W*.18,0,7);x.fill();x.fillRect(W*.38,H*.5,W*.24,H*.14);x.fillStyle='#00000099';x.beginPath();x.arc(W*.43,H*.43,W*.05,0,7);x.arc(W*.57,H*.43,W*.05,0,7);x.fill();for(let i=0;i<3;i++)x.fillRect(W*(.41+i*.07),H*.57,W*.03,H*.07);
    x.strokeStyle=c;x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(W*.22,H*.72);x.lineTo(W*.78,H*.86);x.moveTo(W*.78,H*.72);x.lineTo(W*.22,H*.86);x.stroke();},
  trident:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=11;x.lineCap='round';x.beginPath();x.moveTo(W/2,H*.2);x.lineTo(W/2,H*.82);x.moveTo(W*.32,H*.24);x.lineTo(W*.32,H*.42);x.quadraticCurveTo(W/2,H*.52,W*.68,H*.42);x.lineTo(W*.68,H*.24);x.stroke();},
  flame:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W/2,H*.16);x.bezierCurveTo(W*.78,H*.42,W*.74,H*.8,W/2,H*.82);x.bezierCurveTo(W*.26,H*.8,W*.22,H*.5,W*.4,H*.36);x.bezierCurveTo(W*.42,H*.5,W*.5,H*.52,W*.5,H*.42);x.bezierCurveTo(W*.5,H*.3,W*.46,H*.24,W/2,H*.16);x.fill();},
  snow:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=9;x.lineCap='round';x.translate(W/2,H/2);for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-H*.32);x.moveTo(0,-H*.2);x.lineTo(-W*.07,-H*.27);x.moveTo(0,-H*.2);x.lineTo(W*.07,-H*.27);x.stroke();}x.setTransform(1,0,0,1,0,0);},
  drop:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W/2,H*.18);x.bezierCurveTo(W*.74,H*.5,W*.72,H*.8,W/2,H*.8);x.bezierCurveTo(W*.28,H*.8,W*.26,H*.5,W/2,H*.18);x.fill();x.fillStyle='#00000066';x.beginPath();x.arc(W*.44,H*.6,W*.05,0,7);x.arc(W*.56,H*.6,W*.05,0,7);x.fill();},
  bolt:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W*.56,H*.14);x.lineTo(W*.3,H*.54);x.lineTo(W*.48,H*.54);x.lineTo(W*.4,H*.86);x.lineTo(W*.72,H*.42);x.lineTo(W*.54,H*.42);x.closePath();x.fill();},
  crescent:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W/2,H/2,W*.28,0,7);x.fill();x.globalCompositeOperation='destination-out';x.beginPath();x.arc(W*.6,H*.44,W*.24,0,7);x.fill();x.globalCompositeOperation='source-over';x.beginPath();x.arc(W*.66,H*.62,W*.04,0,7);x.fill();},
  crown:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W*.24,H*.7);x.lineTo(W*.24,H*.36);x.lineTo(W*.37,H*.52);x.lineTo(W/2,H*.28);x.lineTo(W*.63,H*.52);x.lineTo(W*.76,H*.36);x.lineTo(W*.76,H*.7);x.closePath();x.fill();x.fillRect(W*.24,H*.72,W*.52,H*.07);},
  spiral:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=10;x.lineCap='round';x.beginPath();for(let i=0;i<=120;i++){const t=i/120,a=t*Math.PI*5,r=t*W*.32;const px=W/2+Math.cos(a)*r,py=H/2+Math.sin(a)*r;i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();},
  eye:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.ellipse(W/2,H/2,W*.3,H*.16,0,0,7);x.fill();x.fillStyle='#00000099';x.beginPath();x.arc(W/2,H/2,W*.08,0,7);x.fill();},
  fish:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.ellipse(W*.46,H/2,W*.22,H*.12,0,0,7);x.fill();x.beginPath();x.moveTo(W*.66,H/2);x.lineTo(W*.82,H*.36);x.lineTo(W*.82,H*.64);x.closePath();x.fill();},
  sun:(x,W,H,c)=>{x.save();x.translate(W/2,H*.5);x.fillStyle=c;for(let i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,-72);x.lineTo(10,-30);x.lineTo(-10,-30);x.closePath();x.fill();}x.beginPath();x.arc(0,0,30,0,7);x.fill();x.restore();},
};
const F={
  bar:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,H*.4,W*.8,H*.2);},
  dot:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.arc(W*.36,H/2,12,0,7);x.fill();},
  cross:(x,W,H,c)=>{x.strokeStyle=c;x.lineWidth=6;x.beginPath();x.moveTo(W*.24,H*.2);x.lineTo(W*.5,H*.8);x.moveTo(W*.5,H*.2);x.lineTo(W*.24,H*.8);x.stroke();},
  diamond:(x,W,H,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(W*.36,H*.15);x.lineTo(W*.5,H/2);x.lineTo(W*.36,H*.85);x.lineTo(W*.22,H/2);x.closePath();x.fill();},
};

// ---------------------------------------------------------------- Gemi tipleri
function hullPaint(p,extra={}){return{plank:p.plank,plankDark:p.plankDark,trim:p.trim,tar:p.tar||'#120c09',band:p.band,ports:extra.ports||0,portLid:p.portLid||p.band,portColor:p.portColor||'#140d0a',stripe:extra.stripe?p.band:null};}
const ARCH={
  sloop:(p)=>({hull:{L:40,B:13.5,D:8,bowRise:2.6,sternRise:2.8,sternW:.52,bulwark:1,waterline:.72},hp:hullPaint(p,{stripe:true}),
    masts:[{t:.56,h:30,r:.6,flag:4,gaff:{foot:2.2,throat:24,peak:28,len:16,sail:0,bulge:1.6}}],jib:{sail:1,bulge:1.3,drop:1},bowsprit:9,cargo:3,castles:[{from:0,to:.14,h:1.6,windows:2}],span:104}),
  lugger:(p)=>({hull:{L:44,B:13,D:8,bowRise:3.2,sternRise:3,sternW:.45,bulwark:1,waterline:.72},hp:hullPaint(p,{stripe:true}),
    masts:[{t:.66,h:26,r:.6,flag:4,lateen:{len:30,low:5,high:30,sail:0}},{t:.3,h:22,r:.55,flag:0,lateen:{len:24,low:4,high:25,sail:1}}],bowsprit:6,cargo:2,castles:[{from:0,to:.12,h:1.4,windows:2}],span:104}),
  brig:(p)=>({hull:{L:52,B:16.5,D:9.5,bowRise:3,sternRise:4,sternW:.6,bulwark:1.2,waterline:.72},hp:hullPaint(p,{ports:4}),guns:{count:4},
    masts:[{t:.66,h:36,r:.75,flag:5,yards:[{y:33,w:17,drop:12,sail:0,bulge:1.9},{y:20.5,w:20,drop:13,sail:1,bulge:2}]},{t:.33,h:38,r:.8,flag:5,gaff:{foot:2.5,throat:30,peak:35,len:19,sail:2,bulge:1.5}}],
    jib:{sail:2,bulge:1.2,drop:2},bowsprit:11,cargo:4,castles:[{from:0,to:.17,h:2.4,windows:3,lanterns:true}],span:104}),
  junk:(p)=>({hull:{L:58,B:19,D:10,bowRise:4.5,sternRise:7,sternW:.78,bulwark:1.4,waterline:.72},hp:hullPaint(p,{ports:5}),guns:{count:5},
    masts:[{t:.76,h:30,r:.7,flag:0,junk:{foot:3,h:28,w:16,battens:6,sail:1}},{t:.5,h:38,r:.85,flag:6,junk:{foot:3,h:36,w:22,battens:7,sail:0}},{t:.22,h:28,r:.7,flag:0,junk:{foot:3,h:26,w:14,battens:5,sail:1}}],
    bowsprit:4,cargo:3,castles:[{from:0,to:.22,h:4,windows:3,lanterns:true},{from:.86,to:.96,h:1.8,windows:1}],span:112}),
  frigate:(p)=>({hull:{L:64,B:19.5,D:11,bowRise:3.8,sternRise:5,sternW:.66,bulwark:1.4,waterline:.72},hp:hullPaint(p,{ports:7}),guns:{count:7},figurehead:true,
    masts:[{t:.72,h:40,r:.85,flag:6,yards:[{y:37,w:15,drop:9,sail:1},{y:27.5,w:19,drop:10.5,sail:1},{y:16.5,w:23,drop:11.5,sail:1,bulge:2.1}]},
           {t:.46,h:46,r:.95,flag:8,yards:[{y:43,w:17,drop:10,sail:1},{y:32,w:21.5,drop:12,sail:1},{y:19,w:26,drop:13.5,sail:0,bulge:2.3}]},
           {t:.2,h:36,r:.8,flag:5,yards:[{y:33,w:13,drop:8.5,sail:2},{y:23.5,w:16.5,drop:9.5,sail:2}],gaff:{foot:3,throat:14,peak:18,len:12,sail:2,bulge:1}}],
    jib:{sail:2,bulge:1.2,drop:3},bowsprit:14,cargo:2,castles:[{from:0,to:.2,h:3.2,windows:4,lanterns:true},{from:.83,to:.93,h:1.6,windows:2}],span:112}),
  galleon:(p)=>({hull:{L:72,B:22,D:12,bowRise:5,sternRise:8,sternW:.74,bulwark:1.6,waterline:.72},hp:hullPaint(p,{ports:8}),guns:{count:8},figurehead:true,
    masts:[{t:.74,h:42,r:.9,flag:6,yards:[{y:39,w:16,drop:9,sail:1},{y:29,w:21,drop:11,sail:1},{y:17.5,w:25,drop:12.5,sail:1,bulge:2.1}]},
           {t:.48,h:50,r:1,flag:9,yards:[{y:47,w:18,drop:10,sail:1},{y:35.5,w:23,drop:12.5,sail:1},{y:21.5,w:28,drop:14.5,sail:0,bulge:2.4}]},
           {t:.22,h:38,r:.85,flag:5,lateen:{len:26,low:8,high:34,sail:2}}],
    jib:{sail:2,bulge:1.2,drop:3},bowsprit:16,cargo:2,castles:[{from:0,to:.24,h:5,windows:5,lanterns:true},{from:.82,to:.94,h:2.4,windows:2}],span:124}),
};

// p: palet — sail, sail2, sail3, stripe/ hstripe, emblem, plank… flag…
function ship(id,arch,p){
  const a=ARCH[arch](p),seed=[...id].reduce((s,ch)=>s*31+ch.charCodeAt(0)>>>0,7)%9973;
  const sail=(base,extra={})=>({base,dirt:p.dirt??.14,ragged:p.ragged||0,patches:p.patches||0,patchColors:p.patchColors||['#6b4a33'],...extra});
  return{id,arch,span:a.span,def:{seed,hull:a.hull,hullPaint:a.hp,deckPaint:{wood:p.deck||'#6a5236',dark:p.deckDark||'#44331f'},spar:p.spar||'#3a281b',
    sails:[sail(p.sail,{emblem:E[p.emblem],emblemColor:p.emblemColor,stripes:p.stripes||0,stripeColor:p.stripeColor,hstripes:p.hstripes||0,border:p.border,battens:arch==='junk'?6:0}),
           sail(p.sail2||p.sail,{stripes:p.stripes||0,stripeColor:p.stripeColor,hstripes:p.hstripes||0,border:p.border,battens:arch==='junk'?6:0}),
           sail(p.sail3||p.sail2||p.sail,{battens:arch==='junk'?5:0})],
    masts:a.masts,jib:a.jib,bowsprit:a.bowsprit,cargo:a.cargo,guns:a.guns,figurehead:a.figurehead,glow:p.glow,
    flag:{base:p.flag,mark:F[p.flagMark||'dot'],markColor:p.flagColor||'#e8dcc0'},castles:a.castles.map(c=>({...c,glass:p.glass||'#f2c46a'}))}};
}

const wood={plank:'#3a2519',plankDark:'#24160f',trim:'#b8904c',band:'#5b2a20'};
export const SHIPS=[
  // 1 · Zümrüt Sular
  ship('n1-1-light','sloop',{...wood,sail:'#d8cda6',sail2:'#e2d8b8',emblem:'fish',emblemColor:'#3f6a3a',flag:'#3f6a3a',band:'#3f6a3a',patches:2,patchColors:['#b8a57a','#c9b98e']}),
  ship('n1-1-heavy','brig',{...wood,sail:'#d6c9a0',sail2:'#cfc196',stripes:4,stripeColor:'#4f7d4a',emblem:'anchor',emblemColor:'#2e4a2c',flag:'#2e5a36',flagMark:'bar',band:'#35573a',portLid:'#4f7d4a'}),
  // 2 · Mercan
  ship('n2-1-light','lugger',{...wood,plank:'#4a3024',sail:'#f0b0a0',sail2:'#f4c2b2',emblem:'shell',emblemColor:'#b0453a',flag:'#d0604e',band:'#b0453a'}),
  ship('n2-2-light','sloop',{...wood,plank:'#e0d8c8',plankDark:'#b8ae9a',trim:'#4fb8b0',band:'#3f9a98',sail:'#f4f2ea',sail2:'#e8f4f2',emblem:'crescent',emblemColor:'#3f9a98',flag:'#3f9a98',flagMark:'dot',flagColor:'#f4f2ea',deck:'#9a8a6a'}),
  ship('n2-2-heavy','frigate',{plank:'#1f3a3e',plankDark:'#12262a',trim:'#e0b24e',band:'#2f7a7a',portLid:'#3fa8a0',sail:'#bfeee6',sail2:'#d8f4ee',sail3:'#e8f8f4',border:'#e0b24e',emblem:'trident',emblemColor:'#1f6f6a',flag:'#1f6f6a',flagMark:'diamond',flagColor:'#e0b24e',glass:'#bff6ea'}),
  // 3 · Sis
  ship('n3-1-light','sloop',{plank:'#3d3f3c',plankDark:'#262826',trim:'#8a9a96',band:'#4a5550',sail:'#aab0aa',sail2:'#b8beb8',ragged:18,emblem:'eye',emblemColor:'#3a4440',flag:'#3a4440',flagColor:'#c8d4ce',dirt:.3}),
  ship('n3-1-heavy','brig',{plank:'#343a36',plankDark:'#1f2421',trim:'#8fa89a',band:'#3a4a42',portLid:'#56695e',sail:'#9aa89c',sail2:'#a8b4aa',sail3:'#b4beb6',ragged:22,patches:3,patchColors:['#7a8a7c','#c0c8c0'],emblem:'spiral',emblemColor:'#2c3833',flag:'#2c3833',flagMark:'bar',flagColor:'#b8c8be',dirt:.3}),
  ship('n3-2-light','lugger',{plank:'#d8d0bc',plankDark:'#a89e88',trim:'#6a6456',band:'#8a826e',sail:'#e8e2d0',sail2:'#ddd6c2',ragged:30,emblem:'skull',emblemColor:'#3a3428',flag:'#1a1814',flagColor:'#e8e2d0',dirt:.35}),
  ship('n3-2-heavy','galleon',{plank:'#23302a',plankDark:'#121a16',trim:'#6fd6a8',band:'#1f3a30',portLid:'#2f5a48',portColor:'#6dffc4',sail:'#8ec8ae',sail2:'#9fd8bf',sail3:'#aee2cc',ragged:38,patches:3,patchColors:['#6aa892'],emblem:'skull',emblemColor:'#16302a',flag:'#0e1a17',flagMark:'cross',flagColor:'#8dffd0',glow:'#4dffb0',glass:'#8dffd0',dirt:.35}),
  // 4 · Kızıl
  ship('n4-1-light','brig',{plank:'#2a1a16',plankDark:'#170d0b',trim:'#c8503c',band:'#7a1f1a',portLid:'#a3302a',sail:'#1e1a1a',sail2:'#2a2222',sail3:'#302626',stripes:0,emblem:'skull',emblemColor:'#c83c2c',flag:'#8a1a14',flagMark:'cross',flagColor:'#1a1010',border:'#8a1a14'}),
  ship('n4-1-heavy','frigate',{plank:'#301512',plankDark:'#1a0a08',trim:'#d4a64c',band:'#8a1f1a',portLid:'#b03028',sail:'#9a1f1a',sail2:'#a82a22',sail3:'#b0342a',border:'#1a1010',emblem:'crown',emblemColor:'#1a1010',flag:'#1a1010',flagMark:'diamond',flagColor:'#c83c2c'}),
  ship('n4-2-light','lugger',{plank:'#4a2e1e',plankDark:'#2a1810',trim:'#a86a3a',band:'#7a4020',sail:'#b0683a',sail2:'#a25e34',patches:4,patchColors:['#7a4a2a','#c8844a','#5a3020'],emblem:'anchor',emblemColor:'#3a1c10',flag:'#5a2a14',flagColor:'#d09058',dirt:.35}),
  ship('n4-2-heavy','junk',{plank:'#231a16',plankDark:'#120c0a',trim:'#b8602c',band:'#5a2a18',portLid:'#8a4020',sail:'#8a3a22',sail2:'#7a3420',sail3:'#6a2e1c',emblem:'sun',emblemColor:'#e0a040',flag:'#1a1210',flagMark:'dot',flagColor:'#e0a040',dirt:.25}),
  // 5 · Buz
  ship('n5-1-light','sloop',{plank:'#c8d8e4',plankDark:'#9ab0c0',trim:'#4a7aa8',band:'#6a9ac8',sail:'#f0f6fa',sail2:'#e4eef6',emblem:'snow',emblemColor:'#4a7aa8',flag:'#4a7aa8',flagColor:'#f0f6fa',deck:'#b8c4cc',deckDark:'#8a98a4'}),
  ship('n5-1-heavy','brig',{plank:'#2a3a4c',plankDark:'#16222e',trim:'#bfe6ff',band:'#4a7aa8',portLid:'#6a9ac8',sail:'#dceaf4',sail2:'#cfe2f0',sail3:'#c4dcee',hstripes:6,stripeColor:'#7aaad0',emblem:'snow',emblemColor:'#2a4a6a',flag:'#2a4a6a',flagMark:'diamond',flagColor:'#bfe6ff',glass:'#bfe6ff'}),
  ship('n5-2-light','lugger',{plank:'#9ac0d8',plankDark:'#6a90aa',trim:'#e8f6ff',band:'#5a8ab0',sail:'#bfe6ff',sail2:'#a8dcf8',emblem:'drop',emblemColor:'#2a5a80',flag:'#5a8ab0',flagColor:'#e8f6ff',glow:'#7fd0ff',glass:'#bfe6ff'}),
  ship('n5-2-heavy','galleon',{plank:'#e4ecf2',plankDark:'#b8c6d2',trim:'#9ab8d0',band:'#3a5a7a',portLid:'#5a7a9a',sail:'#f4f8fb',sail2:'#e8f0f6',sail3:'#dce8f2',border:'#9ab8d0',emblem:'crown',emblemColor:'#5a7a9a',flag:'#3a5a7a',flagMark:'cross',flagColor:'#e4ecf2',deck:'#c0ccd4',deckDark:'#909ea8',glass:'#bfe6ff'}),
  // 6 · Zehir
  ship('n6-1-light','sloop',{plank:'#3a3a22',plankDark:'#222212',trim:'#8aa83a',band:'#4a5a22',sail:'#8a9a5a',sail2:'#9aa866',patches:3,patchColors:['#6a7a3a','#b0b870'],emblem:'drop',emblemColor:'#2a3a12',flag:'#4a5a22',flagColor:'#c8e070',dirt:.35}),
  ship('n6-1-heavy','brig',{plank:'#1a2216',plankDark:'#0c120a',trim:'#9aff5a',band:'#2a4a1a',portLid:'#3a6a22',portColor:'#9aff5a',sail:'#2a3a22',sail2:'#34462a',sail3:'#3e5232',emblem:'skull',emblemColor:'#9aff5a',flag:'#1a2216',flagMark:'cross',flagColor:'#9aff5a',glow:'#6aff3a',glass:'#b0ff70'}),
  ship('n6-2-light','lugger',{plank:'#4a4030',plankDark:'#2a2418',trim:'#8a8a4a',band:'#5a5a2a',sail:'#a8a070',sail2:'#9a9262',ragged:28,patches:4,patchColors:['#6a6a3a','#8a7a4a','#c0b880'],emblem:'spiral',emblemColor:'#3a3a1a',flag:'#5a5a2a',flagColor:'#d0d080',dirt:.45}),
  ship('n6-2-heavy','galleon',{plank:'#2e3018',plankDark:'#181a0c',trim:'#c8c04a',band:'#4a4a1a',portLid:'#6a6a22',sail:'#c8c46a',sail2:'#bab45e',sail3:'#aca652',ragged:20,patches:3,patchColors:['#8a8a3a','#dada8a'],emblem:'skull',emblemColor:'#2e3018',flag:'#c8c04a',flagMark:'dot',flagColor:'#2e3018',dirt:.4}),
  // 7 · Alev
  ship('n7-1-light','brig',{plank:'#1c1816',plankDark:'#0c0a08',trim:'#ff8a2a',band:'#3a1a10',portLid:'#6a2a14',portColor:'#ff8a2a',sail:'#3a3432',sail2:'#443c38',sail3:'#4e4440',ragged:14,emblem:'flame',emblemColor:'#ff7a1a',flag:'#1c1816',flagMark:'bar',flagColor:'#ff7a1a',glow:'#ff5a10',glass:'#ffb060'}),
  ship('n7-1-heavy','frigate',{plank:'#141010',plankDark:'#080606',trim:'#ffb040',band:'#5a1a0a',portLid:'#a0300a',portColor:'#ffa040',sail:'#c8481a',sail2:'#d0561e',sail3:'#d86424',border:'#1a1010',emblem:'flame',emblemColor:'#ffd070',flag:'#1a1010',flagMark:'diamond',flagColor:'#ff8a2a',glow:'#ff6a1a',glass:'#ffb060'}),
  ship('n7-2-light','lugger',{plank:'#2a1a12',plankDark:'#140c08',trim:'#ffa040',band:'#7a2a0a',sail:'#ff9a3a',sail2:'#ff8a2a',emblem:'flame',emblemColor:'#7a1a0a',flag:'#7a2a0a',flagColor:'#ffd070',glow:'#ff7a1a'}),
  ship('n7-2-heavy','junk',{plank:'#120c0a',plankDark:'#060404',trim:'#ff6a1a',band:'#3a0e06',portLid:'#7a1a0a',portColor:'#ff6a1a',sail:'#5a140a',sail2:'#4a1008',sail3:'#3a0c06',emblem:'sun',emblemColor:'#ff8a2a',flag:'#120c0a',flagMark:'cross',flagColor:'#ff6a1a',glow:'#ff3a0a',glass:'#ff8a3a'}),
  // 8 · Fırtına
  ship('n8-1-light','sloop',{plank:'#2a2e36',plankDark:'#16181e',trim:'#e0c040',band:'#3a4050',sail:'#5a606e',sail2:'#666c7a',emblem:'bolt',emblemColor:'#f0d040',flag:'#2a2e36',flagMark:'bar',flagColor:'#f0d040'}),
  ship('n8-1-heavy','frigate',{plank:'#1a2030',plankDark:'#0c1018',trim:'#f0d040',band:'#243050',portLid:'#34426a',sail:'#2a3450',sail2:'#323e5c',sail3:'#3a4868',border:'#f0d040',emblem:'bolt',emblemColor:'#f0d040',flag:'#1a2030',flagMark:'diamond',flagColor:'#f0d040',glow:'#6a8aff',glass:'#bfd0ff'}),
  ship('n8-2-light','brig',{plank:'#30343c',plankDark:'#1a1c22',trim:'#a0aac0',band:'#44485a',portLid:'#5a6078',sail:'#8a92a4',sail2:'#9aa2b2',sail3:'#a8b0c0',hstripes:4,stripeColor:'#5a6278',emblem:'spiral',emblemColor:'#2a2e3a',flag:'#44485a',flagMark:'cross',flagColor:'#d0d8e8'}),
  ship('n8-2-heavy','galleon',{plank:'#141a2a',plankDark:'#0a0e18',trim:'#e0b24e',band:'#1a2a50',portLid:'#2a3a6a',sail:'#1e2a4a',sail2:'#243258',sail3:'#2a3a64',border:'#e0b24e',emblem:'bolt',emblemColor:'#e0b24e',flag:'#e0b24e',flagMark:'dot',flagColor:'#1a2a50',glow:'#4a6aff',glass:'#ffd070'}),
  // 9 · Derinlik
  ship('n9-1-light','lugger',{plank:'#1a1422',plankDark:'#0c0812',trim:'#b070ff',band:'#2a1a40',sail:'#3a2a5a',sail2:'#342650',emblem:'crescent',emblemColor:'#c890ff',flag:'#1a1422',flagColor:'#c890ff',glow:'#9a4aff',glass:'#d0a0ff'}),
  ship('n9-1-heavy','junk',{plank:'#140e1c',plankDark:'#08060e',trim:'#c890ff',band:'#2a1440',portLid:'#4a2270',portColor:'#c890ff',sail:'#2a1840',sail2:'#241438',sail3:'#1e1030',emblem:'eye',emblemColor:'#d8a8ff',flag:'#140e1c',flagMark:'diamond',flagColor:'#c890ff',glow:'#8a3aff',glass:'#d0a0ff'}),
  ship('n9-2-light','frigate',{plank:'#101014',plankDark:'#060608',trim:'#c0c0c8',band:'#1a1a22',portLid:'#2a2a34',sail:'#18181e',sail2:'#202028',sail3:'#282830',border:'#6a6a78',emblem:'skull',emblemColor:'#c0c0c8',flag:'#101014',flagMark:'cross',flagColor:'#c0c0c8'}),
  ship('n9-2-heavy','galleon',{plank:'#0c0a0e',plankDark:'#040306',trim:'#f0c04a',band:'#1a1020',portLid:'#3a2240',portColor:'#f0c04a',sail:'#14101a',sail2:'#1a1422',sail3:'#201a2a',border:'#f0c04a',emblem:'crown',emblemColor:'#f0c04a',flag:'#0c0a0e',flagMark:'diamond',flagColor:'#f0c04a',glow:'#7a3aff',glass:'#ffd070'}),
];

// ---------------------------------------------------------------- Canavarlar (tür + palet)
export const MONSTERS=[
  {id:'m1-1',kind:'crab',pal:{base:'#4a6a3a',dark:'#1e2e16',light:'#8aa85a',spots:'#c8d070',eye:['#ffe070','#ffb020'],limb:'#5a7a44'}},
  {id:'m1-2',kind:'serpent',pal:{base:'#2f6a6a',dark:'#123436',light:'#7ac0b0',spots:'#e0e090',eye:['#ffe070','#ff9a20'],fin:'#e07a4a'}},
  {id:'m2-2',kind:'jelly',pal:{dome:'#ffb0d0',glow:'#ff70b0',tentacle:'#ffd0e4',core:'#ffffff'}},
  {id:'m3-1',kind:'serpent',pal:{base:'#5a6660',dark:'#262c28',light:'#a8b4ac',spots:'#d0e0d8',eye:['#d0fff0','#6fffd0'],fin:'#8a9a92'}},
  {id:'m3-2',kind:'hydra',pal:{base:'#d8d0bc',dark:'#8a8270',light:'#f4eee0',spots:'#6a6250',eye:['#8dffd0','#3fdca8'],horn:'#3a3428'}},
  {id:'m4-1',kind:'crab',pal:{base:'#a8301f',dark:'#4a0e08',light:'#e0604a',spots:'#ffd0a0',eye:['#fff0a0','#ffb040'],limb:'#b83a24'}},
  {id:'m4-2',kind:'turtle',pal:{base:'#7a4a2a',dark:'#3a2010',light:'#b0703a',spots:'#d0a060',eye:['#ffe070','#ff9a20'],shell:'#8a5a30',skin:'#6a5a3a'}},
  {id:'m5-1',kind:'serpent',pal:{base:'#8ac0e0',dark:'#2a5a80',light:'#e8f6ff',spots:'#ffffff',eye:['#bff6ff','#4ad0ff'],fin:'#bfe6ff'}},
  {id:'m5-2',kind:'turtle',pal:{base:'#9ac0d8',dark:'#3a6a8a',light:'#e8f6ff',spots:'#ffffff',eye:['#bff6ff','#4ad0ff'],shell:'#c8e4f4',skin:'#6a8aa0',crystals:'#bfe6ff'}},
  {id:'m6-1',kind:'jelly',pal:{dome:'#8aff5a',glow:'#4aff2a',tentacle:'#c8ff9a',core:'#f0ffd0'}},
  {id:'m6-2',kind:'hydra',pal:{base:'#4a6a2a',dark:'#1a2a0e',light:'#8aa85a',spots:'#c8e070',eye:['#e0ff70','#9aff2a'],horn:'#2a3a12'}},
  {id:'m7-1',kind:'crab',pal:{base:'#2a1a16',dark:'#0e0806',light:'#5a3a2a',spots:'#ff8a2a',eye:['#fff0a0','#ff6a10'],limb:'#3a2418',lava:'#ff5a10'}},
  {id:'m7-2',kind:'serpent',pal:{base:'#3a1a10',dark:'#140806',light:'#c8481a',spots:'#ffb040',eye:['#fff0a0','#ff6a10'],fin:'#ff7a1a',lava:'#ff5a10'}},
  {id:'m8-2',kind:'jelly',pal:{dome:'#8ab0ff',glow:'#4a7aff',tentacle:'#d0e0ff',core:'#ffffff'}},
  {id:'m9-1',kind:'kraken',pal:{look:'abyss'}},
  {id:'m9-2',kind:'hydra',pal:{base:'#2a2030',dark:'#0e0a12',light:'#6a5a78',spots:'#f0c04a',eye:['#fff0a0','#f0a020'],horn:'#f0c04a'}},
];

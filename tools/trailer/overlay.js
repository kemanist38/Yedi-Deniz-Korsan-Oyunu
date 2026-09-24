// Tanıtım videosu katmanı: başlık, sahne yazıları, düello bandı ve kapanış kartı (oyun sayfasına enjekte edilir)
window.__trailer=(()=>{
  const st=document.createElement('style');st.textContent=`
  .hud{display:none!important}
  #sea{filter:brightness(1.22) saturate(1.2) contrast(1.05)}
  #tr .sync{position:absolute;inset:0;background:#ff00ff;display:none}
  #tr{position:fixed;inset:0;z-index:999;pointer-events:none;font-family:Cinzel,serif;color:#f6dfa4}
  #tr .vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 60%,#0007 100%)}
  #tr .bars::before,#tr .bars::after{content:'';position:absolute;left:0;right:0;height:52px;background:#000}
  #tr .bars::before{top:0}#tr .bars::after{bottom:0}
  #tr .black{position:absolute;inset:0;background:#000;opacity:0;transition:none}
  #tr .cap{position:absolute;left:0;right:0;bottom:78px;text-align:center;opacity:0;transform:translateY(12px);transition:none}
  #tr .cap.on{opacity:1;transform:none}
  #tr .cap b{display:inline-block;padding:8px 26px;font:700 30px Cinzel;letter-spacing:.12em;text-shadow:0 3px 10px #000,0 0 22px #000;background:linear-gradient(90deg,transparent,#000a 18%,#000a 82%,transparent)}
  #tr .cap small{display:block;margin-top:4px;font:600 13px Inter,sans-serif;letter-spacing:.35em;color:#cfe8e2;text-shadow:0 2px 6px #000}
  #tr .title{position:absolute;inset:0;display:grid;place-content:center;text-align:center;opacity:0;transition:none}
  #tr .title.on{opacity:1}
  #tr .title h1{margin:0;font:700 78px Cinzel;letter-spacing:.08em;line-height:1;color:#ffe3a0;text-shadow:0 4px 0 #6a3a10,0 8px 28px #000,0 0 40px #ffb04066}
  #tr .title h2{margin:10px 0 0;font:700 30px Cinzel;letter-spacing:.55em;color:#e8c47a;text-shadow:0 3px 12px #000}
  #tr .title p{margin:18px 0 0;font:600 15px Inter,sans-serif;letter-spacing:.4em;color:#bfe4dc;text-shadow:0 2px 8px #000}
  #tr .title .soon{margin-top:26px;display:inline-block;padding:10px 34px;border:2px solid #e8c47a;font:800 34px Cinzel;letter-spacing:.3em;color:#fff2c8;background:#2a0c06cc;box-shadow:0 0 30px #ff8a3a88;transform:scale(.8);opacity:0;transition:none}
  #tr .title .soon.on{transform:none;opacity:1}
  #tr .vs{position:absolute;top:84px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:26px;opacity:0;transition:none}
  #tr .vs.on{opacity:1}
  #tr .vs span{padding:6px 18px;font:800 26px Cinzel;letter-spacing:.1em;text-shadow:0 2px 8px #000;background:#000a;border-bottom:3px solid}
  #tr .vs .a{color:#9fe8dc;border-color:#2fb8a8}#tr .vs .b{color:#ffb4a0;border-color:#d8483a}
  #tr .vs i{font:900 34px Cinzel;font-style:normal;color:#ffd36a;text-shadow:0 0 18px #ff8a3a}`;
  document.head.appendChild(st);
  const root=document.createElement('div');root.id='tr';root.innerHTML=`<div class="vig"></div><div class="bars"></div>
    <div class="vs"><span class="a">ADMİN</span><i>VS</i><span class="b">KEMANİST</span></div>
    <div class="cap"><b></b><small></small></div>
    <div class="title"><h1>YEDİ DENİZ</h1><h2>KORSAN OYUNU</h2><p>YEDİ DENİZ · YEDİ EFSANE</p><div class="soon">ÇOK YAKINDA</div></div>
    <div class="black"></div><div class="sync"></div>`;
  document.body.appendChild(root);
  const q=s=>root.querySelector(s);
  return{
    sync(on){q('.sync').style.display=on?'block':'none';},
    set(sel,prop,val){q(sel).style[prop]=val;},
    black(v){q('.black').style.opacity=v;},
    title(on){q('.title').classList.toggle('on',on);},
    soon(on){q('.soon').classList.toggle('on',on);},
    tagline(on){q('.title p').style.opacity=on?1:0;},
    vs(on){q('.vs').classList.toggle('on',on);},
    cap(text,sub=''){const c=q('.cap');if(!text){c.classList.remove('on');return;}q('.cap b').textContent=text;q('.cap small').textContent=sub;c.classList.add('on');},
  };
})();

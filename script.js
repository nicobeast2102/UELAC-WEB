// mobile menu
const menuToggle=document.getElementById('menuToggle');
const mainNav=document.getElementById('mainNav');
if(menuToggle&&mainNav){
  menuToggle.addEventListener('click',()=>mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));
}

// home gallery carousel
const galTrack=document.getElementById('galTrack');
if(galTrack){
  const galPrev=document.getElementById('galPrev');
  const galNext=document.getElementById('galNext');
  let galIndex=0;
  function galVisible(){return window.innerWidth<=600?1:(window.innerWidth<=900?2:3);}
  function galMax(){return galTrack.children.length-galVisible();}
  function galRender(){
    const cardW=galTrack.children[0].getBoundingClientRect().width;
    const gap=20;
    galTrack.style.transform=`translateX(-${galIndex*(cardW+gap)}px)`;
  }
  galNext.addEventListener('click',()=>{galIndex=Math.min(galIndex+1,galMax());galRender();});
  galPrev.addEventListener('click',()=>{galIndex=Math.max(galIndex-1,0);galRender();});
  window.addEventListener('resize',()=>{galIndex=Math.min(galIndex,galMax());galRender();});
}

// contact form
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',function(e){
    e.preventDefault();
    document.getElementById('formNote').classList.add('show');
    this.reset();
  });
}

// innovation topic carousels: photos rotate every 2s; short videos play fully, then advance.
// Each .feat-photo lists its files in data-files (inside images/<data-topic>/).
// Phones only autoplay a muted video that is actually visible, so: items are always fully opaque
// (the active one is simply stacked on top), nothing starts until the carousel is on screen,
// and it pauses when scrolled away.
function loadInnovationMedia(src){
  return new Promise(function(resolve){
    const url=encodeURI(src);
    const ext=src.split('.').pop().toLowerCase();
    if(['mp4','mov','webm','m4v'].indexOf(ext)>-1){
      const v=document.createElement('video');
      v.muted=true; v.defaultMuted=true; v.setAttribute('muted','');
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      v.setAttribute('disablepictureinpicture',''); v.setAttribute('disableremoteplayback','');
      v.preload='metadata';
      v.onerror=function(){ if(v.parentNode) v.parentNode.removeChild(v); resolve(null); };
      v.src=url+'#t=0.1';
      resolve(v);
    } else {
      const img=new Image();
      img.decoding='async';
      img.onload=function(){resolve(img);};
      img.onerror=function(){resolve(null);};
      img.src=url;
    }
  });
}

document.querySelectorAll('.feat-photo[data-topic]').forEach(function(container){
  const folder='images/'+container.dataset.topic+'/';
  let files;
  if(container.dataset.files){
    files=container.dataset.files.split(',').map(function(f){return f.trim();}).filter(Boolean);
  } else {
    files=[];
    for(let n=1;n<=4;n++){ ['jpg','png','mp4','mov'].forEach(function(e){ files.push(n+'.'+e); }); }
  }
  let inView=false, current=null, timer, stall;
  function media(){ return Array.prototype.slice.call(container.querySelectorAll('.feat-media')); }
  function removeTap(){ const b=container.querySelector('.feat-play'); if(b) b.remove(); }
  function needTap(){
    if(container.querySelector('.feat-play')) return;
    const b=document.createElement('button');
    b.type='button'; b.className='feat-play'; b.setAttribute('aria-label','Reproducir video'); b.textContent='▶';
    b.addEventListener('click',function(ev){
      ev.stopPropagation();
      const act=container.querySelector('.feat-media.active');
      if(act && act.tagName==='VIDEO'){ const p=act.play(); if(p && p.then) p.then(removeTap).catch(function(){}); }
      else removeTap();
    });
    container.appendChild(b);
  }
  function playVideo(v){
    const p=v.play();
    if(p && p.then){ p.then(removeTap).catch(function(){ needTap(); }); }
  }
  function stop(){
    clearTimeout(timer); clearTimeout(stall);
    media().forEach(function(m){ if(m.tagName==='VIDEO') m.pause(); });
  }
  function show(cur){
    clearTimeout(timer); clearTimeout(stall);
    current=cur;
    if(cur.tagName!=='VIDEO') removeTap();
    const list=media();
    list.forEach(function(m){ m.classList.remove('active'); if(m!==cur && m.tagName==='VIDEO') m.pause(); });
    cur.classList.add('active');
    const nxt=list[(list.indexOf(cur)+1)%list.length];
    if(nxt && nxt!==cur && nxt.tagName==='VIDEO') nxt.preload='auto';
    let advanced=false;
    function next(){
      if(advanced) return;
      advanced=true; clearTimeout(timer); clearTimeout(stall);
      const l=media();
      show(l[(l.indexOf(cur)+1)%l.length] || cur);
    }
    if(cur.tagName==='VIDEO'){
      cur.preload='auto';
      cur.currentTime=0;
      playVideo(cur);
      cur.onended=next;
      timer=setTimeout(next,20000);
      stall=setTimeout(function(){ if(cur.readyState<3 && media().length>1 && !container.querySelector('.feat-play')) next(); },9000);
    } else {
      timer=setTimeout(next,2000);
    }
  }
  document.addEventListener('touchend',function(){
    const act=container.querySelector('.feat-media.active');
    if(act && act.tagName==='VIDEO' && act.paused && inView) playVideo(act);
  },{once:true,passive:true});
  function add(m,idx){
    m.classList.add('feat-media');
    m.dataset.order=idx;
    const after=media().filter(function(x){ return +x.dataset.order>idx; })[0];
    container.insertBefore(m,after||null);
    container.classList.remove('loading');
    if(inView && !current) show(m);
  }
  function loadAll(){
    container.classList.add('loading');
    setTimeout(function(){ container.classList.remove('loading'); },15000);
    let chain=Promise.resolve();
    files.forEach(function(f,idx){
      chain=chain.then(function(){
        return loadInnovationMedia(folder+f).then(function(m){ if(m) add(m,idx); });
      });
    });
  }
  if('IntersectionObserver' in window){
    // 1) start downloading shortly before it reaches the screen
    const pre=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){ pre.disconnect(); loadAll(); }
    },{rootMargin:'300px'});
    pre.observe(container);
    // 2) play only while it is really on screen
    const vis=new IntersectionObserver(function(entries){
      inView=entries[0].isIntersecting;
      if(inView){
        const l=media();
        if(l.length) show(current && l.indexOf(current)>-1 ? current : l[0]);
      } else {
        stop();
      }
    },{threshold:0.3});
    vis.observe(container);
  } else {
    inView=true;
    loadAll();
  }
});

// admissions steps: start the 1-2-3 highlight sequence when the steps scroll into view
const stepsEl=document.querySelector('.steps');
if(stepsEl){
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ stepsEl.classList.add('in-view'); io.disconnect(); } });
    },{threshold:0.3});
    io.observe(stepsEl);
  } else {
    stepsEl.classList.add('in-view');
  }
}

// innovation cards: click keeps the zoom highlight on one card at a time (hover handled in CSS)
document.querySelectorAll('.feat').forEach(function(card){
  card.addEventListener('click',function(){
    const was=card.classList.contains('selected');
    document.querySelectorAll('.feat').forEach(function(c){ c.classList.remove('selected'); });
    if(!was) card.classList.add('selected');
  });
});

// ---------------------------------------------------------------------
// Designer pass: scroll progress, floating WhatsApp, back-to-top,
// reveal-on-scroll, animated counters, educational path, document search
// ---------------------------------------------------------------------
(function(){
  const bar=document.createElement('div');
  bar.className='scroll-progress'; bar.innerHTML='<span></span>';
  document.body.appendChild(bar);
  const fill=bar.firstChild;

  const top=document.createElement('button');
  top.className='to-top'; top.setAttribute('aria-label','Volver arriba');
  top.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  top.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  document.body.appendChild(top);

  const wa=document.createElement('a');
  wa.className='fab-wa';
  wa.href='https://wa.me/593959284565?text=%F0%9F%91%8B%20Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20de%20su%20escuelita%20%F0%9F%8F%AB';
  wa.target='_blank'; wa.rel='noopener'; wa.setAttribute('aria-label','Escríbenos por WhatsApp');
  wa.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.16 0-.43.06-.65.3-.23.24-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z"/></svg>';
  document.body.appendChild(wa);

  function onScroll(){
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    fill.style.transform='scaleX('+(max>0?h.scrollTop/max:0)+')';
    top.classList.toggle('show',h.scrollTop>600);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();

// reveal-on-scroll (soft fade/slide-up with a small stagger between siblings)
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sel='.page-hero > *,.section-head,.feature-card,.mv-card,.value-chip,.auth-card-v2,.stats-band,.serv-card,.extra-card,.uniforme-item,details.level,.faq-item,.bento-tile,.horario-wrap,.doc-cols > *,.info-grid > *,.lema-wide,.gal-head,.marquee';
  const els=document.querySelectorAll(sel);
  const io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      const el=e.target;
      io.unobserve(el);
      el.classList.remove('reveal');
      el.classList.add('reveal-in');
      el.addEventListener('animationend',function(ev){ if(ev.target===el) el.classList.remove('reveal-in'); });
    });
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){
    const sibs=Array.prototype.filter.call(el.parentNode.children,function(c){ return c.matches(sel); });
    el.style.setProperty('--d',(Math.min(sibs.indexOf(el),6)*0.08)+'s');
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// animated counters: [data-count] counts up from 0 when it scrolls into view
(function(){
  const nums=document.querySelectorAll('[data-count]');
  if(!nums.length) return;
  function show(el,v){ el.textContent=Math.round(v)+(el.dataset.suffix||''); }
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)){ nums.forEach(function(el){ show(el,+el.dataset.count); }); return; }
  nums.forEach(function(el){ show(el,0); });
  const io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      const el=e.target, end=+el.dataset.count, t0=performance.now(), dur=1800;
      (function tick(t){
        const p=Math.min((t-t0)/dur,1);
        show(el,end*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:0.4});
  nums.forEach(function(el){ io.observe(el); });
})();

// educational path: line draws and levels pop in order when it scrolls into view
(function(){
  const path=document.querySelector('.path');
  if(!path) return;
  if(!('IntersectionObserver' in window)){ return; }
  path.classList.add('armed');
  const io=new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting){ path.classList.add('in-view'); io.disconnect(); }
  },{threshold:0.35});
  io.observe(path);
})();

// document search: filters both lists as you type (ignores accents and capitals)
(function(){
  const input=document.getElementById('docSearch');
  if(!input) return;
  const items=document.querySelectorAll('.doc-list li,.doc-side li');
  const count=document.getElementById('docCount');
  const empty=document.getElementById('docEmpty');
  function norm(t){ return t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  input.addEventListener('input',function(){
    const q=norm(input.value.trim());
    let shown=0;
    items.forEach(function(li){
      const ok=!q || norm(li.textContent).indexOf(q)>-1;
      li.style.display=ok?'':'none';
      if(ok) shown++;
    });
    count.textContent=q?(shown+' resultado'+(shown===1?'':'s')):'';
    empty.style.display=shown?'none':'block';
  });
})();

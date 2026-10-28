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

// innovation topic carousels: the photos and videos are real elements written in the page
// (videos use autoplay + muted + loop + playsinline, like the admissions video), so the phone
// starts them by itself. This script only decides which one is on top:
// photos stay 2 s, a video stays for one full play-through.
document.querySelectorAll('.feat-photo').forEach(function(container){
  let timer, currentEl=null, inView=false;
  function items(){ return Array.prototype.slice.call(container.querySelectorAll('.feat-media')); }
  function schedule(el){
    clearTimeout(timer);
    if(items().length<2) return;
    let wait=2000;
    if(el.tagName==='VIDEO'){
      const d=el.duration;
      wait=(isFinite(d) && d>0) ? Math.min(d*1000+200,30000) : 6000;
    }
    timer=setTimeout(function(){
      const list=items();
      const k=list.indexOf(el);
      show(list[(k+1)%list.length] || list[0]);
    },wait);
  }
  function show(el){
    if(!el) return;
    currentEl=el;
    items().forEach(function(m){ m.classList.toggle('active',m===el); });
    if(el.tagName==='VIDEO'){
      try{ el.currentTime=0; }catch(e){}
      if(!isFinite(el.duration)){
        el.addEventListener('loadedmetadata',function(){ if(currentEl===el && inView) schedule(el); },{once:true});
      }
    }
    schedule(el);
  }
  function begin(){
    const list=items();
    if(!list.length) return;
    show(currentEl && list.indexOf(currentEl)>-1 ? currentEl : list[0]);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      inView=entries[0].isIntersecting;
      if(inView) begin(); else clearTimeout(timer);
    },{threshold:0.3}).observe(container);
  } else {
    inView=true; begin();
  }
  // same safety net as the admissions video: if the phone held the videos back, the first touch starts them
  function kick(){ container.querySelectorAll('video').forEach(function(v){ const p=v.play(); if(p && p.catch) p.catch(function(){}); }); }
  document.addEventListener('touchstart',kick,{once:true,passive:true});
  document.addEventListener('click',kick,{once:true});
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
  const sel='.page-hero > *,.section-head,.feature-card,.mv-card,.value-chip,.auth-card-v2,.stats-band,.serv-card,.extra-card,.uniforme-item,.uf-card,details.level,.faq-item,.bento-tile,.horario-wrap,.doc-cols > *,.info-grid > *,.lema-wide,.gal-head,.marquee';
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

// home: tiles ("Explora el Liceo") and photo slots ("Por qué elegirnos") fade through their slides;
// data-shuffle puts the photos in a random order on every visit
(function(){
  document.querySelectorAll('.bento-tile,.feature-photo[data-rotate]').forEach(function(box,n){
    function slides(){ return Array.prototype.slice.call(box.querySelectorAll('.slide')); }
    if(box.hasAttribute('data-shuffle')){
      const list=slides();
      for(let i=list.length-1;i>0;i--){ const r=Math.floor(Math.random()*(i+1)); const t=list[i]; list[i]=list[r]; list[r]=t; }
      list.forEach(function(sl){ sl.classList.remove('active'); box.appendChild(sl); });
      if(list.length) list[0].classList.add('active');
    }
    // photos download only when they are about to be shown (current + next), not all at once
    function loadSlide(sl){
      if(!sl) return;
      const img=sl.querySelector('img');
      if(!img || !img.dataset.src) return;
      const src=img.dataset.src;
      img.removeAttribute('data-src');
      img.src=src;
      if(sl.classList.contains('fit')) sl.style.setProperty('--bg','url("'+src+'")');
    }
    function warm(){
      const list=slides();
      if(!list.length) return;
      let k=list.findIndex(function(x){ return x.classList.contains('active'); });
      if(k<0) k=0;
      loadSlide(list[k]); loadSlide(list[(k+1)%list.length]);
    }
    // a photo that is missing removes itself; make sure something is always showing
    function ensure(){
      const list=slides();
      if(list.length && !list.some(function(x){ return x.classList.contains('active'); })) list[0].classList.add('active');
    }
    setTimeout(function(){ ensure(); warm(); },1200); setTimeout(function(){ ensure(); warm(); },3000);
    let timer, starter;
    function step(){
      const list=slides();
      if(!list.length) return;
      const k=list.findIndex(function(x){ return x.classList.contains('active'); });
      list.forEach(function(x){ x.classList.remove('active'); });
      list[(k+1)%list.length].classList.add('active');
      warm();
    }
    function stop(){ clearTimeout(starter); clearInterval(timer); }
    function start(){
      stop();
      if(slides().length<2) return;
      starter=setTimeout(function(){ timer=setInterval(step,3400); },n*600);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){ if(entries[0].isIntersecting) start(); else stop(); },{threshold:0.2}).observe(box);
      const pre=new IntersectionObserver(function(entries){ if(entries[0].isIntersecting){ warm(); pre.disconnect(); } },{rootMargin:'300px'});
      pre.observe(box);
    } else { warm(); start(); }
  });
})();

// footer wallpaper shimmer: runs only while the footer is visible
(function(){
  const f=document.querySelector('footer');
  if(!f || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(e){ f.classList.toggle('in-view',e[0].isIntersecting); }).observe(f);
})();

// uniform cards: slideshow (each change updates the caption) + "+" button that opens the whole uniform
(function(){
  document.querySelectorAll('.uf-card').forEach(function(card){
    const box=card.querySelector('.uf-photo');
    const cap=card.querySelector('.uf-caption');
    const dotsBox=card.querySelector('.uf-dots');
    const imgs=Array.prototype.slice.call(box.querySelectorAll('img'));
    const dots=Array.prototype.slice.call(dotsBox.querySelectorAll('button'));
    let current=imgs[0], timer, inView=false, started=false;
    function ok(){ return imgs.filter(function(i){ return !i.classList.contains('missing'); }); }
    function load(img){
      if(!img || !img.dataset.src) return;
      const s=img.dataset.src;
      img.removeAttribute('data-src');
      img.onerror=function(){
        img.classList.add('missing');
        dots[imgs.indexOf(img)].classList.add('gone');
        if(ok().length===0) box.classList.add('empty');
        else if(img===current) next();
      };
      img.src=s;
    }
    function setCaption(t){
      cap.classList.add('swap');
      setTimeout(function(){ cap.textContent=t; cap.classList.remove('swap'); },200);
    }
    function show(img){
      clearTimeout(timer);
      imgs.forEach(function(i){ i.classList.remove('active'); });
      img.classList.add('active');
      current=img;
      dots.forEach(function(d,k){ d.classList.toggle('on',imgs[k]===img); });
      setCaption(img.dataset.name);
      load(img);
      const list=ok();
      load(list[(list.indexOf(img)+1)%list.length]);
      if(list.length>1 && inView) timer=setTimeout(next,2800);
    }
    function next(){
      const list=ok();
      if(!list.length) return;
      show(list[(Math.max(list.indexOf(current),0)+1)%list.length]);
    }
    dots.forEach(function(d,k){
      d.addEventListener('click',function(){ if(!imgs[k].classList.contains('missing')) show(imgs[k]); });
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){
        inView=e[0].isIntersecting;
        if(inView){ if(!started){ started=true; load(current); load(imgs[1]); } show(current); }
        else clearTimeout(timer);
      },{threshold:0.2}).observe(box);
    } else { inView=true; started=true; load(current); show(current); }

    const btn=card.querySelector('.uf-toggle');
    btn.addEventListener('click',function(){
      const panel=document.getElementById(btn.getAttribute('aria-controls'));
      if(!panel) return;
      const open=btn.getAttribute('aria-expanded')==='true';
      // only one uniform open at a time
      document.querySelectorAll('.uf-toggle').forEach(function(b){
        if(b===btn) return;
        b.setAttribute('aria-expanded','false');
        b.querySelector('.lbl').textContent='Ver todo el uniforme';
        b.closest('.uf-card').classList.remove('open');
        const p=document.getElementById(b.getAttribute('aria-controls'));
        if(p) p.hidden=true;
      });
      btn.setAttribute('aria-expanded',open?'false':'true');
      card.classList.toggle('open',!open);
      panel.hidden=open;
      btn.querySelector('.lbl').textContent=open?'Ver todo el uniforme':'Ocultar uniforme';
      if(!open && panel.scrollIntoView) panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  });
})();

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
function loadInnovationMedia(src){
  return new Promise(function(resolve){
    const url=encodeURI(src);
    const ext=src.split('.').pop().toLowerCase();
    if(['mp4','mov','webm','m4v'].indexOf(ext)>-1){
      const v=document.createElement('video');
      v.muted=true; v.setAttribute('muted',''); v.setAttribute('playsinline','');
      v.preload='metadata';
      v.onloadedmetadata=function(){resolve(v);};
      v.onerror=function(){resolve(null);};
      v.src=url;
    } else {
      const img=new Image();
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
  Promise.all(files.map(function(f){return loadInnovationMedia(folder+f);})).then(function(list){
    const items=list.filter(Boolean);
    if(!items.length) return;
    items.forEach(function(m){ m.classList.add('feat-media'); container.appendChild(m); });
    if(items.length===1){
      items[0].classList.add('active');
      if(items[0].tagName==='VIDEO'){ items[0].loop=true; items[0].play().catch(function(){}); }
      return;
    }
    let timer;
    function show(i){
      items.forEach(function(m){ m.classList.remove('active'); if(m.tagName==='VIDEO') m.pause(); });
      const cur=items[i];
      cur.classList.add('active');
      let advanced=false;
      function next(){ if(advanced) return; advanced=true; clearTimeout(timer); show((i+1)%items.length); }
      if(cur.tagName==='VIDEO'){
        cur.currentTime=0;
        cur.play().catch(function(){});
        cur.onended=next;
        timer=setTimeout(next,20000);
      } else {
        timer=setTimeout(next,2000);
      }
    }
    show(0);
  });
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

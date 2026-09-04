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

// innovation topic photo carousels (auto-rotate every 2s, up to 4 photos each)
document.querySelectorAll('.feat-photo').forEach(function(container){
  const imgs=container.querySelectorAll('img');
  if(!imgs.length) return;
  imgs[0].classList.add('active');
  let idx=0;
  setInterval(function(){
    const live=container.querySelectorAll('img');
    if(live.length<=1) return;
    live.forEach(im=>im.classList.remove('active'));
    idx=(idx+1)%live.length;
    live[idx].classList.add('active');
  },2000);
});

(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!Element.prototype.animate)return;
 const root=document.documentElement;
 root.classList.add('motion-ready');
 const ease='cubic-bezier(.16,1,.3,1)';
 const seen=new WeakSet();
 const activeAnimations=new WeakMap();
 let entered=false,lastScrollY=scrollY,scrollDirection=1;
 window.addEventListener('scroll',()=>{
  const nextY=scrollY;
  if(nextY===lastScrollY)return;
  const nextDirection=nextY>lastScrollY?1:-1;
  if(entered&&nextDirection<0&&scrollDirection>0){
   document.querySelectorAll('#home,.work-marquee,.aboutme-section,#directory-landing,.familiar-statement,#about,#contact,#project-grid .project-card').forEach(el=>{
    const bounds=el.getBoundingClientRect();
    if(seen.has(el)&&bounds.bottom>0&&bounds.top<innerHeight)settle(el);
   });
  }
  scrollDirection=nextDirection;lastScrollY=nextY;
 },{passive:true});
 function play(el,frames,options){
  el.style.visibility='visible';
  const animation=el.animate(frames,{duration:1500,easing:ease,fill:'both',...options});
  let running=activeAnimations.get(el);if(!running){running=new Set();activeAnimations.set(el,running)}running.add(animation);
  animation.finished.then(()=>{running.delete(animation);animation.cancel()}).catch(()=>running.delete(animation));
  return animation;
 }
 function title(el,delay=0){
  if(!el)return;
  el.style.visibility='visible';
  const letters=el.querySelectorAll('.kinetic-letter');
  const aboutReference=el.id==='aboutme-title';
  if(letters.length)letters.forEach((letter,i)=>play(letter,[
   {transform:aboutReference?'translateY(65px) scaleX(.45)':'translateY(125px) scaleY(.35)',clipPath:'inset(100% 0 0 0)'},
   {transform:'translateY(0) scaleY(1)',clipPath:'inset(0% 0 0 0)'}
  ],{duration:1750,delay:delay+i*60}));
  else play(el,[{transform:'translateY(110px)',clipPath:'inset(100% 0 0 0)'},{transform:'translateY(0)',clipPath:'inset(0% 0 0 0)'}],{duration:1800,delay});
 }
 function lift(el,delay=0){if(el)play(el,[{transform:'translateY(85px)',clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',clipPath:'inset(0 0 0% 0)'}],{duration:1500,delay})}
 const observer=new IntersectionObserver(entries=>{
  if(!entered)return;
  for(const entry of entries){
   if(!entry.isIntersecting||entry.intersectionRatio===0){
    if(seen.has(entry.target)){seen.delete(entry.target);reset(entry.target)}
    continue;
   }
   if(scrollDirection<0&&!seen.has(entry.target)){seen.add(entry.target);settle(entry.target);continue;}
   if(entry.intersectionRatio<.16||seen.has(entry.target))continue;
   seen.add(entry.target);reveal(entry.target);
  }
 },{threshold:[0,.16]});
 function settle(el){
  [el,...el.querySelectorAll('*')].forEach(node=>{activeAnimations.get(node)?.forEach(animation=>animation.cancel());node.style.removeProperty('visibility')});
  el.style.visibility='visible';
 }
 function reset(el){settle(el);el.style.visibility='hidden'}
 function watch(el){if(!el||seen.has(el))return;el.style.visibility='hidden';observer.observe(el)}
 function reveal(el){
  el.style.visibility='visible';
  if(el.matches('#home')){
   title(el.querySelector('#hero-title'));lift(el.querySelector('.cover-kicker'),150);lift(el.querySelector('.hero-subline'),1000);
  }else if(el.matches('.work-marquee')){
   lift(el.querySelector('.marquee-top'));
   el.querySelectorAll('.marquee-group:first-child .wall-card').forEach((card,i)=>{
    lift(card,350+i*130);const image=card.querySelector('img');
    if(image)play(image,[{transform:'scale(1.12)',clipPath:'inset(0 0 100% 0)'},{transform:'scale(1)',clipPath:'inset(0 0 0% 0)'}],{duration:1800,delay:500+i*130});
   });
  }else if(el.matches('.aboutme-section')){
   title(el.querySelector('#aboutme-title'));
   lift(el.querySelector('.aboutme-copy'),1000);lift(el.querySelector('.aboutme-cta'),1350);
  }else if(el.matches('#directory-landing')){
   title(el.querySelector('#directory-title'));
   el.querySelectorAll('.directory-entry').forEach((row,i)=>lift(row,1050+i*170));
  }else if(el.matches('.familiar-statement')){
   el.querySelectorAll('.familiar-line').forEach((line,i)=>title(line,i*240));
  }else if(el.matches('#about')){
   play(el.querySelector('.bio-folder'),[{transform:'translateY(110px) rotate(4deg)',opacity:0},{transform:'translateY(0) rotate(-1deg)',opacity:1}],{duration:1700});
   lift(el.querySelector('.bio-sheet'),240);
   play(el.querySelector('.bio-member-card'),[{transform:'translate(-110px,65px) rotate(-22deg)',clipPath:'inset(100% 0 0 0)'},{transform:innerWidth<=760?'translate(0,0) rotate(-7deg)':'translate(0,0) rotate(-10deg)',clipPath:'inset(0% 0 0 0)'}],{duration:1700,delay:450});
   el.querySelectorAll('.bio-block').forEach((block,i)=>lift(block,650+i*160));
   [el.querySelector('.bio-pin'),el.querySelector('.bio-clip')].forEach((item,i)=>{const rest=getComputedStyle(item).transform;play(item,[{transform:'translateY(-55px) '+(rest==='none'?'':rest),opacity:0},{transform:rest,opacity:1}],{duration:1300,delay:850+i*170})});
  }else if(el.matches('#contact')){
   lift(el.querySelector('.contact-panel'));
   const photo=el.querySelector('.contact-photo');
   if(photo)play(photo,[
    {transform:'scale(1.1)',clipPath:'inset(0 0 100% 0)'},
    {transform:'scale(1)',clipPath:'inset(0 0 0% 0)'}
   ],{duration:1900,delay:200});
   el.querySelectorAll('.contact-panel-content>div').forEach((column,i)=>lift(column,950+i*170));
  }else if(el.matches('.project-card')){
   const index=[...el.parentElement.children].indexOf(el);
   lift(el,Math.min(index,5)*170);
   const img=el.querySelector('img');
   if(img)play(img,[{transform:'scale(1.14)',clipPath:'inset(0 0 100% 0)'},{transform:'scale(1)',clipPath:'inset(0 0 0% 0)'}],{duration:1900,delay:250+Math.min(index,5)*170});
  }
 }
 window.addEventListener('portfolio:about-open',()=>{const about=document.querySelector('#about');if(!document.body.classList.contains('about-page-active'))return;seen.add(about);settle(about);reveal(about)});
 let setupDone=false;
 function setupMotion(){
  if(setupDone)return;setupDone=true;
  document.querySelectorAll('.work-marquee,.aboutme-section,#directory-landing,.familiar-statement,#about,#contact').forEach(watch);
  new MutationObserver(()=>document.querySelectorAll('#project-grid .project-card').forEach(card=>{if(!card.dataset.motionWatched){card.dataset.motionWatched='true';watch(card)}})).observe(document.querySelector('#project-grid'),{childList:true});
 }
 window.addEventListener('portfolio:ready',setupMotion,{once:true});
 if(document.querySelector('#hero-title .kinetic-letter'))setupMotion();
 window.addEventListener('portfolio:entering',()=>{
  root.classList.add('opening-started');seen.add(document.querySelector('#home'));
  title(document.querySelector('#hero-title'),650);
  lift(document.querySelector('.cover-kicker'),450);
  lift(document.querySelector('.hero-subline'),1400);
  play(document.querySelector('.nav'),[{transform:'translateY(-90px)'},{transform:'translateY(0)'}],{duration:1600,delay:450});
 },{once:true});
 window.addEventListener('portfolio:entered',()=>{
  entered=true;observer.observe(document.querySelector('#home'));
  document.querySelectorAll('.work-marquee,.aboutme-section,#directory-landing,.familiar-statement,#about,#contact').forEach(el=>{observer.unobserve(el);observer.observe(el)});
 },{once:true});
})();


(() => {
 const root=document.documentElement,loader=document.querySelector('#intro-loader');
 const status=document.querySelector('#loader-status');
 const progress=document.querySelector('#loader-progress'),percent=document.querySelector('#loader-percent');
 const sound=new Audio('assets/intro-sound.mp3');sound.preload='auto';sound.volume=.8;
 let dismissed=false,ready=false,completed=0,total=1,frame=0,soundFrame=0,timer,soundTimer,shown=0;
 const started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pageParts=[...document.querySelectorAll('body>.nav,body>main,body>footer,body>.skip')];pageParts.forEach(el=>el.inert=true);
 function setProgress(n){shown=Math.max(shown,n);percent.textContent=shown;progress.setAttribute('aria-valuenow',String(shown))}
 function animate(now){if(dismissed||ready)return;const time=Math.min(1,(now-started)/1800);const assets=total?completed/total:0;setProgress(Math.floor(Math.min(95,assets*100,time*100)));frame=requestAnimationFrame(animate)}
 function leave(){if(dismissed)return;dismissed=true;clearTimeout(timer);clearTimeout(soundTimer);cancelAnimationFrame(frame);cancelAnimationFrame(soundFrame);root.classList.add('is-entering');loader.classList.add('is-leaving');pageParts.forEach(el=>el.inert=false);pageParts.forEach(el=>el.style.visibility='visible');window.dispatchEvent(new Event('portfolio:entering'));setTimeout(()=>{root.classList.remove('booting','is-entering');loader.remove();pageParts.forEach(el=>el.style.removeProperty('visibility'));window.dispatchEvent(new Event('portfolio:entered'))},reduced?0:1450)}
 function animateSoundProgress(){if(dismissed)return;const duration=Number.isFinite(sound.duration)&&sound.duration>0?sound.duration:1.95;setProgress(95+Math.min(4,Math.floor(Math.max(0,sound.currentTime)/duration*5)));soundFrame=requestAnimationFrame(animateSoundProgress)}
 function finishWithoutSound(){if(dismissed)return;setProgress(100);leave()}
 function requestSound(){
  if(dismissed)return;
  clearTimeout(soundTimer);
  status.textContent='';
  const enter=document.createElement('button'),skip=document.createElement('button');
  enter.type=skip.type='button';enter.className='loader-enter';skip.className='loader-silent';
  enter.textContent='开启声音并进入';skip.textContent='静音进入';
  enter.addEventListener('click',()=>{
   window.dispatchEvent(new Event('portfolio:audio-enable'));
   status.replaceChildren();withSound();
  },{once:true});
  skip.addEventListener('click',()=>{window.dispatchEvent(new Event('portfolio:audio-disable'));finishWithoutSound()},{once:true});
  status.append(enter,skip);
 }
 function withSound(){
  setProgress(95);
  try{
   sound.currentTime=0;sound.onended=finishWithoutSound;
   const playing=sound.play();
   if(playing)playing.then(()=>{
    if(dismissed){sound.pause();return;}
    animateSoundProgress();
    soundTimer=setTimeout(finishWithoutSound,6000);
   }).catch(error=>{if(error.name==='NotAllowedError')requestSound();else finishWithoutSound()});
   else finishWithoutSound();
  }catch(error){if(error.name==='NotAllowedError')requestSound();else finishWithoutSound()}
 }
 function finish(){if(ready||dismissed)return;ready=true;clearTimeout(timer);cancelAnimationFrame(frame);loader.classList.add('is-ready');status.textContent='';withSound()}
 window.addEventListener('portfolio:ready',async()=>{const images=[...document.querySelectorAll('#hero-wall img')];total=images.length+1;completed=1;await Promise.all(images.map(async img=>{try{await img.decode()}catch{}completed++}));await new Promise(r=>setTimeout(r,Math.max(0,1800-(performance.now()-started))));finish()},{once:true});
 // A stalled image request must never trap visitors on the loading screen.
 timer=setTimeout(finish,10000);frame=requestAnimationFrame(animate);
})();

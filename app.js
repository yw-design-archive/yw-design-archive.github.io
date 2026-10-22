let content,currentProject,lastFocus,activeCategory=null;
const $=s=>document.querySelector(s);
const dialog=$('#project-dialog');
const workOrder=['lotus','chess','turandot','beasts','zhuoxi','seasons','medal','tea'];
const text=(selector,value)=>{$(selector).textContent=value};
const categoryOrder=[
 {zh:'非遗文创',label:'非遗文创设计',en:'INTANGIBLE CULTURAL HERITAGE',stamp:'04'},
 {zh:'视觉设计',label:'跨文化视觉设计',en:'VISUAL DESIGN',stamp:'02'},
 {zh:'博物馆文创',label:'博物馆文旅产品',en:'MUSEUM CULTURAL & CREATIVE',stamp:'03'},
 {zh:'产品与社会项目',en:'PRODUCT & SOCIAL PROJECTS',stamp:'05'}
];
function fillKineticTitle(title,value){const words=value.toLocaleUpperCase().split(' ');let letterIndex=0;title.replaceChildren();title.setAttribute('aria-label',words.join(' '));title.tabIndex=0;for(const [wordIndex,word] of words.entries()){if(wordIndex)title.append(document.createTextNode(' '));const wordNode=document.createElement('span');wordNode.className='kinetic-word';wordNode.setAttribute('aria-hidden','true');for(const char of word){const letter=document.createElement('span');letter.className='kinetic-letter';letter.style.setProperty('--letter-index',letterIndex++);const glyph=document.createElement('span');glyph.className='kinetic-glyph';glyph.textContent=char;glyph.dataset.letter=char;letter.append(glyph);wordNode.append(letter)}title.append(wordNode)}}
async function init(){
 try{
 content=await (await fetch('content.json')).json();
 if(new URLSearchParams(location.search).get('preview')==='1'){
  try{const draft=localStorage.getItem('yun-portfolio-draft');if(draft)content=JSON.parse(draft)}catch{}
  const banner=document.createElement('a');banner.className='draft-banner';banner.href='edit.html';banner.textContent='本机草稿预览 · 返回编辑';document.body.append(banner);
 }
 fillKineticTitle($('#hero-title'),content.headline||'LATENT & FORM');fillKineticTitle($('#aboutme-title'),'ABOUTME');fillKineticTitle($('#directory-title'),'CREATIONS');
 text('#about-text',content.about);
 text('#email-link',content.email);$('#email-link').href='mailto:'+content.email;
 $('.brand>span:last-child').replaceChildren(document.createTextNode(content.name+' '));const small=document.createElement('small');small.textContent=content.englishName.toUpperCase();$('.brand>span:last-child').append(small);
 const wall=$('#hero-wall'),wallGroup=document.createElement('div');wallGroup.className='marquee-group';
 const marqueeImages=[['02','lotus'],['03','chess'],['04','turandot'],['05','beasts'],['06','zhuoxi'],['07','seasons'],['09','tea'],['08','medal']];
 for(const [number,id] of marqueeImages){const p=content.projects.find(project=>project.id===id);if(!p)continue;const a=document.createElement('a');a.href='#project='+encodeURIComponent(p.id);a.className='wall-card';a.setAttribute('aria-label','查看'+p.title);const img=document.createElement('img');img.src='assets/marquee/prince-'+number+(number==='08'?'-v2':'')+'.jpg';img.alt=p.title+' 作品展示';img.width=1000;img.height=1357;img.decoding='async';const title=document.createElement('span');title.textContent=p.title+' ↗';a.append(img,title);wallGroup.append(a)}
 const repeat=wallGroup.cloneNode(true);repeat.setAttribute('aria-hidden','true');repeat.querySelectorAll('a').forEach(a=>a.tabIndex=-1);wall.append(wallGroup,repeat);
 categoryOrder.forEach((category,i)=>{
  const projects=content.projects.filter(p=>p.category===category.zh);
  const row=document.createElement('button');row.type='button';row.className='directory-entry';row.dataset.category=category.zh;row.setAttribute('role','listitem');row.setAttribute('aria-label','打开分类 '+category.en+' / '+(category.label||category.zh)+'，'+projects.length+' 个项目');
  const labels=document.createElement('span');labels.className='directory-entry-labels';const en=document.createElement('span');en.className='directory-entry-en';en.textContent=category.en;const zh=document.createElement('span');zh.className='directory-entry-cn';zh.textContent=category.label||category.zh;labels.append(en,zh);
  const arrow=document.createElement('span');arrow.className='directory-entry-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
  const stamp=document.createElement('span');stamp.className='directory-stamp';stamp.setAttribute('aria-hidden','true');
  const stampImage=document.createElement('img');stampImage.src='assets/category-stamps/liuer-'+category.stamp+'.jpg';stampImage.alt='';stampImage.width=256;stampImage.height=440;stampImage.decoding='async';stampImage.loading='lazy';stamp.append(stampImage);
  row.append(labels,stamp,arrow);row.onclick=()=>openCategory(category.zh);$('#category-grid').append(row);
 });
 showCategories();if(!document.documentElement.classList.contains('booting'))route();
 }catch(e){$('#project-grid').textContent='作品内容暂时无法加载，请刷新页面重试。';console.error(e)}
 finally{window.dispatchEvent(new Event('portfolio:ready'))}
}
function showCategories(){activeCategory=null;$('#work').classList.remove('is-category-open');$('#directory-landing').hidden=false;$('#directory-detail').hidden=true;$('#project-grid').hidden=true;text('#directory-total',String(categoryOrder.length).padStart(2,'0')+' CATEGORIES');text('#result-count','显示 '+categoryOrder.length+' 个分类目录');fitDirectoryComposition()}
function openCategory(category){
 const hash='#category='+encodeURIComponent(category);
 if(location.hash===hash)displayCategory(category);else location.hash=hash;
}
function displayCategory(category){
 document.body.classList.add('category-page-active');
 activeCategory=category;$('#work').classList.add('is-category-open');$('#directory-landing').hidden=true;$('#directory-detail').hidden=false;$('#project-grid').hidden=false;
 const item=categoryOrder.find(x=>x.zh===category);text('#folder-category-cn',item.label||item.zh);text('#folder-category-title',item.en);
 const projects=content.projects.filter(p=>p.category===category);if(category==='视觉设计'||category==='产品与社会项目')projects.reverse();$('#folder-project-list').replaceChildren();
 for(const p of projects){const button=document.createElement('button');button.type='button';button.dataset.projectId=p.id;button.textContent=p.title;button.onclick=()=>renderProjectSheets(p);$('#folder-project-list').append(button)}
 $('#folder-category-tabs').replaceChildren();for(const entry of categoryOrder){const button=document.createElement('button');button.type='button';button.textContent=entry.label||entry.zh;button.setAttribute('aria-pressed',String(entry.zh===category));button.onclick=()=>openCategory(entry.zh);$('#folder-category-tabs').append(button)}
 renderProjectSheets(projects[0]);document.title=category+' — 王蕴 Yun Wang';$('#work').scrollIntoView({behavior:'instant',block:'start'});syncNavTone();
}
$('#directory-back').addEventListener('click',()=>{location.hash='work'});
function projectPageSource(page){return page==='22-a'?'assets/footer-teaware.jpg':page==='22-b'?'assets/tea-centered-board.png':'assets/p'+page+'.webp'}
function renderProjectSheets(p){
 if(!p)return;$('#project-grid').replaceChildren();text('#directory-current',p.english);text('#folder-project-tags',p.tags.join(' / '));
 $('#folder-project-list').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.projectId===p.id)));
 for(const [i,page] of p.pages.entries()){
  const card=document.createElement('a');card.className='project-sheet';card.href='#project='+encodeURIComponent(p.id);card.setAttribute('aria-label','查看'+p.title+'，图版 '+(i+1));
  const image=document.createElement('img');image.src=projectPageSource(page);image.alt=p.title+' 作品图版 '+(i+1);image.loading=i<2?'eager':'lazy';image.decoding='async';card.append(image);$('#project-grid').append(card);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const animation=card.animate([{transform:'translateY(50px)',clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',clipPath:'inset(0 0 0% 0)'}],{duration:1400,delay:i*120,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});animation.finished.then(()=>animation.cancel()).catch(()=>{})}
 }
 $('.folder-stage').scrollTop=0;text('#result-count',p.category+'：'+p.title+'，共 '+p.pages.length+' 张图版');
}
function syncAboutPage(){
 const showingAbout=location.hash==='#about';
 const changed=document.body.classList.contains('about-page-active')!==showingAbout;
 document.body.classList.toggle('about-page-active',showingAbout);
 const aboutLink=$('.nav a[href="#about"]');
 if(showingAbout)aboutLink.setAttribute('aria-current','page');else aboutLink.removeAttribute('aria-current');
 if(changed){
  const target=showingAbout?$('#about'):$(location.hash==='#work'?'#work':location.hash==='#contact'?'#contact':'#home');
  target.scrollIntoView({behavior:'instant',block:'start'});
  fitDirectoryComposition();
  if(showingAbout)requestAnimationFrame(()=>window.dispatchEvent(new Event('portfolio:about-open')));
 }
}
$('.nav a[href="#about"]').addEventListener('click',event=>{if(location.hash==='#about'){event.preventDefault();window.scrollTo({top:0,behavior:'instant'});window.dispatchEvent(new Event('portfolio:about-open'))}});
function centerDirectory(){
 fitDirectoryComposition();
 const area=$('.directory-content'),bounds=area.getBoundingClientRect();
 window.scrollTo({top:scrollY+bounds.top+bounds.height/2-innerHeight/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('.nav a[href="#work"]').addEventListener('click',event=>{
 event.preventDefault();
 if(location.hash!=='#work')history.pushState(null,'','#work');
 route();
});
function route(){
 if(!content)return;
 const projectMatch=location.hash.match(/^#project=(.+)$/);
 const categoryMatch=location.hash.match(/^#category=(.+)$/);
 syncAboutPage();
 if(categoryMatch){
  let category;try{category=decodeURIComponent(categoryMatch[1])}catch{return}
  if(categoryOrder.some(item=>item.zh===category)){if(dialog.open)closeProject(false);displayCategory(category)}
 }else if(projectMatch){
  const p=content.projects.find(x=>x.id===decodeURIComponent(projectMatch[1]));if(p)openProject(p);
 }else{
  if(dialog.open)closeProject(false);
  const leavingCategory=document.body.classList.contains('category-page-active');
  document.body.classList.remove('category-page-active');
  if(leavingCategory){showCategories();const target=location.hash==='#about'?$('#about'):location.hash==='#contact'?$('#contact'):location.hash==='#work'?$('#work'):$('#home');target.scrollIntoView({behavior:'instant',block:'start'});document.title='王蕴 Yun Wang — 设计作品集'}
 }
 if(location.hash==='#work')centerDirectory();
 syncNavTone();
}
function openProject(p){currentProject=p;dialog.dataset.projectId=p.id;const ordered=workOrder.map(id=>content.projects.find(project=>project.id===id)).filter(Boolean);const i=ordered.indexOf(p);text('#detail-number',String(i+1).padStart(2,'0'));text('#detail-title',p.title);text('#detail-english',p.english);text('#detail-meta',p.category+' / '+p.year);text('#detail-description',p.description);text('#detail-awards',p.awards||'');$('#detail-tags').replaceChildren();for(const tag of p.tags){const s=document.createElement('span');s.textContent=tag;$('#detail-tags').append(s)}$('#detail-gallery').replaceChildren();for(const [j,page] of p.pages.entries()){const a=document.createElement('a');a.href=projectPageSource(page);a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',p.title+' 图版 '+(j+1)+'，打开大图');const img=document.createElement('img');img.src=a.href;img.alt=p.title+' 原作品集图版 '+(j+1)+'，点击查看大图';img.loading=j<2?'eager':'lazy';img.decoding='async';a.append(img);$('#detail-gallery').append(a)}const next=ordered[(i+1)%ordered.length];text('#next-project','下一个项目 / '+next.title+' ↗');$('#next-project').onclick=()=>{location.hash='project='+next.id};if(!dialog.open){lastFocus=document.activeElement;dialog.showModal();document.body.style.overflow='hidden'}dialog.scrollTop=0;$('#close-dialog').focus();document.title=p.title+' — 王蕴 Yun Wang'}
function closeProject(update=true){dialog.close();document.body.style.overflow='';document.title='王蕴 Yun Wang — 设计作品集';if(update)history.replaceState(null,'',location.pathname+location.search+(document.body.classList.contains('category-page-active')&&activeCategory?'#category='+encodeURIComponent(activeCategory):'#work'));lastFocus?.focus({preventScroll:true})}
$('#close-dialog').onclick=()=>closeProject();dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject()});window.addEventListener('hashchange',route);window.addEventListener('portfolio:entering',()=>{$('#hero-title')?.classList.add('is-visible');$('.cover-heading')?.classList.add('is-entering')},{once:true});window.addEventListener('portfolio:entered',route);
const siteNav=$('.nav'),lightSection=$('#work');function syncNavTone(){if(!siteNav||!lightSection)return;const navRect=siteNav.getBoundingClientRect(),sectionRect=lightSection.getBoundingClientRect();siteNav.classList.toggle('is-light',document.body.classList.contains('directory-page-active')||(sectionRect.top<navRect.bottom&&sectionRect.bottom>navRect.top))}window.addEventListener('scroll',syncNavTone,{passive:true});window.addEventListener('resize',syncNavTone);syncNavTone();init();
const aboutTitle=$('#aboutme-title');if('IntersectionObserver'in window){const aboutObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){aboutTitle.classList.add('is-visible');aboutObserver.disconnect()}},{threshold:.35});aboutObserver.observe(aboutTitle)}else aboutTitle.classList.add('is-visible');


const directoryHeading=$('#directory-title');
window.addEventListener('portfolio:ready',()=>{
 directoryHeading.querySelectorAll('.kinetic-glyph').forEach(glyph=>glyph.dataset.letter=glyph.textContent);
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}
  },{threshold:.22,rootMargin:'0px 0px -7% 0px'});
  observer.observe(directoryHeading);document.querySelectorAll('.directory-entry').forEach(row=>observer.observe(row));
 }else {directoryHeading.classList.add('is-revealed');document.querySelectorAll('.directory-entry').forEach(row=>row.classList.add('is-revealed'));}
},{once:true});


const directoryList=$('#category-grid');
if('ResizeObserver' in window){
 const directorySizeObserver=new ResizeObserver(()=>{
  directoryList.style.setProperty('--directory-unscaled-height',directoryList.offsetHeight+'px');
 });
 directorySizeObserver.observe(directoryList);
}

function fitDirectoryComposition(){
 const landing=$('#directory-landing'),area=$('.directory-content');
 if(!landing||landing.hidden||!area.clientWidth)return;
 const measure=document.createElement('canvas').getContext('2d');
 landing.querySelectorAll('.directory-entry-labels').forEach(labels=>{
  const en=labels.querySelector('.directory-entry-en'),cn=labels.querySelector('.directory-entry-cn');
  const style=getComputedStyle(labels);
  measure.font='700 '+style.fontSize+' '+getComputedStyle(en).fontFamily;
  const available=labels.clientWidth-cn.offsetWidth-parseFloat(style.columnGap||0)-4;
  const fit=Math.min(1,Math.max(0,available)/(measure.measureText(en.textContent).width*1.08));
  labels.style.setProperty('--category-label-fit',fit.toFixed(4));
 });
 const height=landing.offsetHeight;
 if(!height)return;
 const normalRow=innerWidth<=760?43:48;
 const restingHeight=height-[...landing.querySelectorAll('.directory-entry')].reduce((sum,row)=>sum+Math.max(0,row.offsetHeight-normalRow),0);
 const scale=.9*Math.min(area.clientWidth/landing.offsetWidth,Math.max(300,innerHeight-150)/(restingHeight+38));
 area.style.setProperty('--directory-fit',scale.toFixed(4));
 area.style.setProperty('--directory-fitted-height',((restingHeight+38)*scale).toFixed(2)+'px');
}
window.addEventListener('resize',fitDirectoryComposition);
window.addEventListener('portfolio:ready',()=>{fitDirectoryComposition();document.fonts.ready.then(fitDirectoryComposition)},{once:true});
if('ResizeObserver'in window){new ResizeObserver(fitDirectoryComposition).observe($('#directory-landing'))}


// Pointer tracking is event-driven and pauses when the eyes are off screen.
const trackingEyes=[...document.querySelectorAll('.aboutme-eyes i')];
let eyeFrame=0,eyePointer=null;
function updatePupils(){
 eyeFrame=0;
 if(!eyePointer)return;
 for(const eye of trackingEyes){
  const bounds=eye.getBoundingClientRect();
  if(bounds.bottom<0||bounds.top>innerHeight||!bounds.width)continue;
  const dx=eyePointer.x-bounds.left-bounds.width/2,dy=eyePointer.y-bounds.top-bounds.height/2;
  const distance=Math.max(100,Math.hypot(dx,dy));
  eye.style.setProperty('--pupil-x',(dx/distance*3).toFixed(2)+'px');
  eye.style.setProperty('--pupil-y',(dy/distance*3.4).toFixed(2)+'px');
 }
}
function queuePupils(){if(eyePointer&&!eyeFrame)eyeFrame=requestAnimationFrame(updatePupils)}
window.addEventListener('pointermove',event=>{
 if(event.pointerType==='touch')return;
 eyePointer={x:event.clientX,y:event.clientY};queuePupils();
},{passive:true});
window.addEventListener('scroll',queuePupils,{passive:true});
function centerPupils(){eyePointer=null;cancelAnimationFrame(eyeFrame);eyeFrame=0;trackingEyes.forEach(eye=>{eye.style.removeProperty('--pupil-x');eye.style.removeProperty('--pupil-y')})}
document.documentElement.addEventListener('pointerleave',centerPupils);
window.addEventListener('blur',centerPupils);

const artworkStrip=document.querySelector('.work-marquee');
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{for(const entry of entries)artworkStrip.classList.toggle('is-in-view',entry.isIntersecting)}).observe(artworkStrip)}else artworkStrip.classList.add('is-in-view');


// All large titles share one speed-aware, single-glyph fisheye interaction.
function bindSpeedFisheye(rollingTitle){
rollingTitle.classList.add('shared-fisheye');
let baseSlot=parseFloat(getComputedStyle(rollingTitle).getPropertyValue('--fisheye-slot'))||.74;
window.addEventListener('resize',()=>{baseSlot=parseFloat(getComputedStyle(rollingTitle).getPropertyValue('--fisheye-slot'))||.74;startRolling()});
let rollingStates=[],rollingFrame=0,rollingTime=0,lastRollingX=null,rollingDirection=1,rollingLastTime=0,rollingSpeed=0,rollingSpeedTarget=0;
const reducedRolling=matchMedia('(prefers-reduced-motion: reduce)').matches;
function paintRollingFrame(now){
 const dt=Math.min(40,rollingTime?now-rollingTime:16);rollingTime=now;
 rollingSpeed+=(rollingSpeedTarget-rollingSpeed)*(1-Math.exp(-dt/95));
 rollingSpeedTarget*=Math.exp(-dt/240);
 if(rollingSpeed<.001&&rollingSpeedTarget<.001){rollingSpeed=0;rollingSpeedTarget=0}
 let moving=rollingSpeed>0||rollingSpeedTarget>0;
 rollingStates.forEach(state=>{
  const difference=state.target-state.value;
  state.value=Math.abs(difference)<.001?state.target:state.value+difference*(1-Math.exp(-dt/180));
  if(Math.abs(state.target-state.value)>.001)moving=true;
  const amount=state.value;
  const expanded=amount>.012;
  const width=expanded?.05+.95*amount:.14;
  const drift=reducedRolling?0:difference*state.direction*8;
  const lens=reducedRolling?0:Math.pow(amount,1.8);
  state.letter.style.setProperty('--roll-slot',(baseSlot+(.28+.18*rollingSpeed)*amount).toFixed(4)+'em');
  state.glyph.style.fontFamily=expanded?'PortfolioMontserratBold, sans-serif':'PortfolioOswaldLight, sans-serif';
  state.glyph.style.fontWeight=expanded?'700':'300';
  state.glyph.style.transformOrigin='center center';
  state.glyph.style.transform='translateX(calc(-50% + '+drift.toFixed(3)+'px)) scale('+(width*(1+(.22+.38*rollingSpeed)*lens)).toFixed(4)+','+(1+(.18+.24*rollingSpeed)*lens).toFixed(4)+')';
 });
 const influence=Math.max(0,...rollingStates.map(state=>state.value));
 rollingTitle.style.setProperty('--about-word-gap',(.14-.045*influence).toFixed(4)+'em');
 if(moving)rollingFrame=requestAnimationFrame(paintRollingFrame);else{rollingFrame=0;rollingTime=0}
}
function startRolling(){if(!rollingFrame)rollingFrame=requestAnimationFrame(paintRollingFrame)}
function prepareRolling(){
 rollingStates=[...rollingTitle.querySelectorAll('.kinetic-letter')].map(letter=>({letter,glyph:letter.querySelector('.kinetic-glyph'),value:0,target:0,direction:1}));
}
window.addEventListener('portfolio:ready',prepareRolling,{once:true});
if(rollingTitle.querySelector('.kinetic-letter'))prepareRolling();
rollingTitle.addEventListener('pointermove',event=>{
 if(event.pointerType==='touch')return;
 if(lastRollingX!==null){
  const distance=Math.abs(event.clientX-lastRollingX);
  if(distance>1)rollingDirection=event.clientX>lastRollingX?1:-1;
  const elapsed=Math.max(16,event.timeStamp-rollingLastTime);
  rollingSpeedTarget=reducedRolling?0:Math.min(1,distance/elapsed/1.8);
 }
 rollingLastTime=event.timeStamp;lastRollingX=event.clientX;
 const visualScale=rollingTitle.getBoundingClientRect().width/Math.max(1,rollingTitle.offsetWidth);
 const radius=parseFloat(getComputedStyle(rollingTitle).fontSize)*1.6*visualScale;
 // Read the geometry first, then animate without repeated layout reads.
 const centers=rollingStates.map(state=>{const box=state.letter.getBoundingClientRect();return box.left+box.width/2});
 rollingStates.forEach((state,i)=>{
  state.target=Math.pow(Math.max(0,1-Math.abs(event.clientX-centers[i])/radius),1.35);
  state.lensSide=Math.max(-1,Math.min(1,(centers[i]-event.clientX)/radius));
  state.direction=rollingDirection;
 });
 startRolling();
},{passive:true});
function closeRolling(){lastRollingX=null;rollingLastTime=0;rollingSpeedTarget=0;rollingStates.forEach(state=>state.target=0);startRolling()}
rollingTitle.addEventListener('pointerleave',closeRolling);
rollingTitle.addEventListener('pointercancel',closeRolling);
rollingTitle.addEventListener('focus',()=>{rollingStates.forEach((state,i)=>{const center=Math.floor(rollingStates.length/2);state.target=i===center?1:Math.abs(i-center)===1?.3:0});startRolling()});
rollingTitle.addEventListener('blur',closeRolling);
window.addEventListener('blur',closeRolling);
}
['#hero-title','#aboutme-title','#directory-title'].forEach(selector=>bindSpeedFisheye(document.querySelector(selector)));

// A local lens for the closing statement; keep its existing font and two lines.
document.querySelectorAll('.familiar-line').forEach(line=>{
 const source=[...line.childNodes];
 line.setAttribute('aria-label',line.textContent);
 line.replaceChildren();
 for(const node of source){
  for(const char of node.textContent){
   const slot=document.createElement('span');slot.className='statement-letter';slot.setAttribute('aria-hidden','true');
   const glyph=document.createElement('span');glyph.className='statement-glyph'+(node.nodeType===1&&node.classList.contains('statement-accent')?' statement-accent':'');glyph.textContent=char;slot.append(glyph);line.append(slot);
  }
 }
 if(matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches)return;
 const slots=[...line.children],glyphs=slots.map(slot=>slot.firstElementChild);
 const amounts=slots.map(()=>0),targets=slots.map(()=>0);
 let boxes=[],frame=0,previous=0;
 function lockLetterWidths(){
  slots.forEach(slot=>slot.style.removeProperty('width'));
  glyphs.forEach(glyph=>glyph.style.removeProperty('font-variation-settings'));
  const widths=slots.map(slot=>slot.getBoundingClientRect().width);
  slots.forEach((slot,i)=>slot.style.width=widths[i]+'px');
  boxes=slots.map(slot=>slot.getBoundingClientRect());
 }
 document.fonts.ready.then(lockLetterWidths);
 window.addEventListener('resize',lockLetterWidths,{passive:true});
 function tick(now){
  const ease=1-Math.exp(-Math.min(now-previous||16,48)/150);previous=now;
  let moving=false;
  amounts.forEach((amount,i)=>{amounts[i]=amount+(targets[i]-amount)*ease;if(Math.abs(targets[i]-amounts[i])>.001)moving=true});
  const growth=amounts.map((amount,i)=>(boxes[i]?.width||0)*amount*.38);
  let shift=-growth.reduce((sum,value)=>sum+value,0)/2;
  glyphs.forEach((glyph,i)=>{
   const amount=amounts[i];glyph.style.transform='translateX('+(shift+growth[i]/2).toFixed(2)+'px) scale('+(1+.48*amount).toFixed(4)+')';glyph.style.fontVariationSettings='"wght" '+(300+400*amount).toFixed(1);shift+=growth[i];
  });
  if(moving)frame=requestAnimationFrame(tick);else{frame=0;previous=0;if(targets.every(value=>value===0))glyphs.forEach(glyph=>{glyph.style.removeProperty('transform');glyph.style.removeProperty('font-variation-settings')})}
 }
 function animate(){if(!frame)frame=requestAnimationFrame(tick)}
 line.addEventListener('pointerenter',()=>{boxes=slots.map(slot=>slot.getBoundingClientRect())});
 line.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch')return;
  const radius=parseFloat(getComputedStyle(line).fontSize)*1.25;
  boxes.forEach((box,i)=>{const distance=Math.abs(event.clientX-box.left-box.width/2);targets[i]=Math.exp(-Math.pow(distance/radius,2)*2)});animate();
 });
 function restore(){targets.fill(0);animate()}
 line.addEventListener('pointerleave',restore);line.addEventListener('pointercancel',restore);
});

const menuButton=document.querySelector('.menu-button');
const navigation=document.querySelector('#navigation');
const setMenuOpen=open=>{
  menuButton.setAttribute('aria-expanded',String(open));
  navigation.classList.toggle('open',open);
};
const closeMenuOutside=event=>{
  if(!navigation.contains(event.target)&&!menuButton.contains(event.target))setMenuOpen(false);
};
menuButton.addEventListener('click',()=>setMenuOpen(menuButton.getAttribute('aria-expanded')!=='true'));
navigation.addEventListener('click',event=>{if(event.target.closest('a'))setMenuOpen(false)});
document.addEventListener('pointerdown',closeMenuOutside);
document.addEventListener('click',closeMenuOutside);
document.addEventListener('focusin',closeMenuOutside);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&navigation.classList.contains('open')){setMenuOpen(false);menuButton.focus()}
});
window.matchMedia('(max-width: 1200px)').addEventListener('change',()=>setMenuOpen(false));
const form=document.querySelector('#offer-form');
const result=document.querySelector('#form-result');
const formIntro=document.querySelector('#offer-form-intro');
const phone=document.querySelector('#phone');
form.addEventListener('submit',event=>{
  event.preventDefault();
  const value=phone.value.trim();
  const digits=value.replace(/\D/g,'');
  const validPhone=/^[+()\d\s.-]+$/.test(value)&&digits.length>=10&&digits.length<=15;
  phone.setCustomValidity(validPhone?'':'Please enter a phone number with 10 to 15 digits.');
  if(!form.reportValidity())return;
  form.hidden=true;
  formIntro.hidden=true;
  result.hidden=false;
  result.focus();
});
phone.addEventListener('input',()=>phone.setCustomValidity(''));
document.querySelector('.reset-form').addEventListener('click',()=>{result.hidden=true;form.hidden=false;formIntro.hidden=false;document.querySelector('#address').focus()});
document.querySelector('#year').textContent=new Date().getFullYear();


// Motion enhances the page; all content stays readable without JavaScript.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const activeAnimations=new Set();
const animateElement=(element,keyframes,options={})=>{
  if(motionPreference.matches||!element.animate)return;
  const animation=element.animate(keyframes,{duration:850,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards',...options});
  activeAnimations.add(animation);
  animation.finished.then(()=>activeAnimations.delete(animation),()=>activeAnimations.delete(animation));
};
document.documentElement.classList.add('motion-enabled');
const revealCandidates=[...document.querySelectorAll('.section-heading,.steps article,.approach-image,.approach-copy,.project-grid article,.situations-inner>div:first-child,.situation-card,.reviews>.eyebrow,.reviews>h2,.review-viewport,.areas>div,.offer-copy,.offer-card')];
// Animate each visual group once, without also fading its descendants.
const revealTargets=revealCandidates.filter(element=>!revealCandidates.some(parent=>parent!==element&&parent.contains(element)));
let revealObserver;
const revealElement=element=>{
  if(element.classList.contains('revealed'))return;
  element.classList.add('revealed');
  element.classList.remove('reveal-pending');
  revealObserver?.unobserve(element);
};
const revealSection=section=>revealTargets.forEach(element=>{
  if(section===element||section.contains(element))revealElement(element);
});
if('IntersectionObserver' in window&&!motionPreference.matches){
  revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)revealElement(entry.target)});
  },{threshold:0,rootMargin:'96px 0px 96px 0px'});
  revealTargets.forEach(element=>{
    const rect=element.getBoundingClientRect();
    // Never hide anything already visible, restored by an anchor, or collapsed.
    if(rect.height===0||rect.top<window.innerHeight+96){
      element.classList.add('revealed');
      return;
    }
    element.classList.add('scroll-reveal','reveal-pending');
    element.addEventListener('transitionend',event=>{
      if(event.target===element&&event.propertyName==='opacity'&&!element.classList.contains('reveal-pending'))element.classList.remove('scroll-reveal');
    });
    revealObserver.observe(element);
  });
}else revealTargets.forEach(element=>element.classList.add('revealed'));
document.addEventListener('focusin',event=>{
  revealTargets.forEach(element=>{if(element.contains(event.target))revealElement(element)});
});
motionPreference.addEventListener('change',event=>{
  if(!event.matches)return;
  revealObserver?.disconnect();
  revealTargets.forEach(element=>{
    element.classList.remove('scroll-reveal','reveal-pending');
    element.classList.add('revealed');
  });
});
if(!location.hash||location.hash==='#'){
  document.querySelectorAll('.hero-copy>.eyebrow,.hero-line,.hero-subtitle,.hero-benefits,.hero-description,.hero-actions').forEach((element,index)=>{
    animateElement(element,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000,delay:100+index*105});
  });
  animateElement(document.querySelector('.hero-photo'),[{transform:'scale(1.055)'},{transform:'scale(1)'}],{duration:2400});
  animateElement(document.querySelector('.photo-caption'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{delay:800,duration:1000});
}
const header=document.querySelector('.header');
// Center anchor destinations in the space below the sticky header.
const sectionScrollTop=(sectionTop,sectionHeight,viewportHeight,headerHeight,pageHeight)=>{
  const availableHeight=Math.max(0,viewportHeight-headerHeight);
  const breathingRoom=Math.max(0,(availableHeight-sectionHeight)/2);
  return Math.min(Math.max(0,pageHeight-viewportHeight),Math.max(0,sectionTop-headerHeight-breathingRoom));
};
const scrollToSection=(target,moveFocus=false)=>{
  revealSection(target);
  const rect=target.getBoundingClientRect();
  const top=target.id==='top'?0:sectionScrollTop(rect.top+window.scrollY,rect.height,window.innerHeight,header.getBoundingClientRect().height,document.documentElement.scrollHeight);
  if(moveFocus){
    const hadTabIndex=target.hasAttribute('tabindex');
    if(!hadTabIndex){
      target.setAttribute('tabindex','-1');
      target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
    }
    target.focus({preventScroll:true});
  }
  window.scrollTo({top,behavior:motionPreference.matches?'instant':'smooth'});
};
const anchorDestination=hash=>{
  if(!hash||hash==='#')return document.getElementById('top');
  try{return document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return null;}
};
document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href^="#"]');
  if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const hash=link.getAttribute('href');
  const target=anchorDestination(hash);
  if(!target)return;
  event.preventDefault();
  menuButton.setAttribute('aria-expanded','false');
  navigation.classList.remove('open');
  if(location.hash!==hash)history.pushState(null,'',hash);
  scrollToSection(target,true);
});
window.addEventListener('hashchange',()=>{
  const target=anchorDestination(location.hash);
  if(target)scrollToSection(target);
});
const progress=document.querySelector('.reading-progress');
let scrollFrame=0;
const updateScroll=()=>{
  scrollFrame=0;
  header.classList.toggle('scrolled',window.scrollY>30);
  const distance=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.transform='scaleX('+(distance>0?Math.min(1,Math.max(0,window.scrollY/distance)):0)+')';
};
const scheduleScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)};
window.addEventListener('scroll',scheduleScroll,{passive:true});
window.addEventListener('resize',scheduleScroll,{passive:true});
window.addEventListener('load',scheduleScroll,{once:true});
updateScroll();
motionPreference.addEventListener('change',()=>{
  if(motionPreference.matches){activeAnimations.forEach(animation=>animation.cancel());activeAnimations.clear()}
});

// Slide one card at a time, with a temporary copy for seamless wraparound.
const reviewCards=document.querySelector('#review-cards');
const reviewStatus=document.querySelector('#review-status');
const reviewViewport=document.querySelector('.review-viewport');
const reviewMobile=window.matchMedia('(max-width:760px)');
let reviewTransition=null;
let queuedReviewDirection=0;
const syncReviewAccessibility=()=>{
  [...reviewCards.children].forEach((card,index)=>{
    const hidden=card.hasAttribute('data-review-clone')||(reviewMobile.matches&&index!==0);
    card.inert=hidden;
    if(hidden)card.setAttribute('aria-hidden','true');
    else card.removeAttribute('aria-hidden');
  });
};
const announceReview=()=>{
  const current=reviewCards.firstElementChild;
  reviewStatus.textContent='Testimonial '+current.dataset.review+' of 3. '+current.querySelector('figcaption').textContent;
};
const rotateReviews=direction=>{
  if(reviewTransition){queuedReviewDirection=direction;return;}
  const first=reviewCards.firstElementChild;
  const last=reviewCards.lastElementChild;
  const reorder=()=>{if(direction>0)reviewCards.append(first);else reviewCards.prepend(last);};
  if(motionPreference.matches||!reviewCards.animate){reorder();syncReviewAccessibility();announceReview();return;}
  const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(reviewCards).columnGap);
  const copy=(direction>0?first:last).cloneNode(true);
  copy.setAttribute('data-review-clone','');
  copy.setAttribute('aria-hidden','true');
  copy.inert=true;
  if(direction>0)reviewCards.append(copy);else reviewCards.prepend(copy);
  reviewViewport.setAttribute('aria-busy','true');
  const animation=reviewCards.animate([
    {transform:'translateX('+(direction>0?0:-step)+'px)'},
    {transform:'translateX('+(direction>0?-step:0)+'px)'}
  ],{duration:540,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  const complete=()=>{
    if(reviewTransition?.animation!==animation)return;
    reorder();copy.remove();animation.cancel();
    reviewTransition=null;
    reviewViewport.removeAttribute('aria-busy');
    syncReviewAccessibility();announceReview();
    const next=queuedReviewDirection;queuedReviewDirection=0;
    if(next)rotateReviews(next);
  };
  reviewTransition={animation,complete};
  animation.onfinish=complete;
};
document.querySelector('.review-next').addEventListener('click',()=>rotateReviews(1));
document.querySelector('.review-prev').addEventListener('click',()=>rotateReviews(-1));
window.addEventListener('resize',()=>{queuedReviewDirection=0;reviewTransition?.complete();syncReviewAccessibility();});
motionPreference.addEventListener('change',event=>{if(event.matches){queuedReviewDirection=0;reviewTransition?.complete();}});
syncReviewAccessibility();

document.querySelector('.footer-back-top').addEventListener('click',()=>{
  document.querySelector('.header .brand').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:motionPreference.matches?'instant':'smooth'});
});

// Expand the collection in place; rapid toggles resume from the current height.
const collectionToggle=document.querySelector('#collection-toggle');
const moreProjects=document.querySelector('#more-projects');
const collectionStatus=document.querySelector('#collection-status');
let collectionAnimation;
collectionToggle.addEventListener('click',()=>{
  const expand=collectionToggle.getAttribute('aria-expanded')!=='true';
  const startHeight=moreProjects.hidden?0:moreProjects.getBoundingClientRect().height;
  collectionAnimation?.cancel();
  collectionAnimation=null;
  collectionToggle.setAttribute('aria-expanded',String(expand));
  setRollingLabel(collectionToggle,expand?'View less':'View more');
  moreProjects.hidden=false;
  moreProjects.inert=!expand;
  moreProjects.style.height='auto';
  const targetHeight=expand?moreProjects.scrollHeight:0;
  moreProjects.style.height=expand?'auto':'0px';
  collectionStatus.textContent=expand?'Showing all 6 renovation examples.':'Showing 3 renovation examples.';
  if(motionPreference.matches||!moreProjects.animate){moreProjects.hidden=!expand;moreProjects.style.height='';return;}
  const animation=moreProjects.animate([{height:startHeight+'px'},{height:targetHeight+'px'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'});
  collectionAnimation=animation;
  animation.finished.then(()=>{
    if(collectionAnimation!==animation)return;
    moreProjects.hidden=!expand;
    moreProjects.style.height='';
    collectionAnimation=null;
  }).catch(()=>{});
});
motionPreference.addEventListener('change',event=>{if(event.matches)collectionAnimation?.finish()});

// Two visual copies roll letter by letter; each control keeps one accessible name.
function createRollingLabel(text){
  const label=document.createElement('span');
  label.className='roll-label';
  label.setAttribute('aria-hidden','true');
  for(let copy=0;copy<2;copy++){
    const line=document.createElement('span');line.className='roll-line';
    [...text].forEach((character,index)=>{
      const letter=document.createElement('span');letter.textContent=character;
      letter.style.setProperty('--roll-duration',Math.min(.2+index*.035,.7)+'s');
      line.append(letter);
    });
    label.append(line);
  }
  return label;
}
function setRollingLabel(control,text){
  const label=control.querySelector('.roll-label');
  if(label)label.replaceWith(createRollingLabel(text));
  else control.querySelector('span').textContent=text;
  control.setAttribute('aria-label',text);
}
document.querySelectorAll('.button,.nav-cta,.collection-toggle,.footer-back-top,.town-buttons button,.reset-form,.hero-scroll').forEach(control=>{
  const nameCopy=control.cloneNode(true);
  nameCopy.querySelectorAll('[aria-hidden="true"],svg').forEach(element=>element.remove());
  if(!control.hasAttribute('aria-label'))control.setAttribute('aria-label',nameCopy.textContent.replace(/\s+/g,' ').trim());
  const walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.textContent.trim()&&!node.parentElement.closest('svg,[aria-hidden="true"]'))textNodes.push(node);
  }
  textNodes.forEach(node=>node.replaceWith(createRollingLabel(node.textContent.trim())));
  control.classList.add('letter-button');
});


// Background photos rotate only while visible and respect reduced motion.
const heroScenes=[...document.querySelectorAll('.hero-scene')];
let heroSceneIndex=0;
let heroSlideshowPaused=motionPreference.matches;
let heroOnScreen=true;
let heroSlideTimer;
const scheduleHeroSlide=()=>{
  clearTimeout(heroSlideTimer);
  if(heroSlideshowPaused||!heroOnScreen||document.hidden)return;
  heroSlideTimer=setTimeout(()=>showHeroScene((heroSceneIndex+1)%heroScenes.length),7000);
};
const showHeroScene=index=>{
  const next=heroScenes[index];
  if(next.complete&&next.naturalWidth>0){
    heroScenes.forEach((scene,i)=>scene.classList.toggle('is-active',i===index));
    heroSceneIndex=index;
  }
  scheduleHeroSlide();
};
document.addEventListener('visibilitychange',scheduleHeroSlide);
motionPreference.addEventListener('change',event=>{if(event.matches){heroSlideshowPaused=true;scheduleHeroSlide();}});
if('IntersectionObserver' in window){
  new IntersectionObserver(([entry])=>{heroOnScreen=entry.isIntersecting;scheduleHeroSlide();},{threshold:.1}).observe(document.querySelector('.hero'));
}
scheduleHeroSlide();


// Open every renovation pair in an accessible, keyboard-friendly image viewer.
const galleryItems=[...document.querySelectorAll('#properties .project-grid article')];
const galleryDialog=document.querySelector('#gallery-lightbox');
const lightboxImage=document.querySelector('#lightbox-image');
const lightboxTitle=document.querySelector('#lightbox-title');
const lightboxCount=document.querySelector('#lightbox-count');
let galleryIndex=0;
let galleryOpener;
let galleryImageAnimation;
const showGalleryImage=index=>{
  galleryIndex=(index+galleryItems.length)%galleryItems.length;
  const item=galleryItems[galleryIndex];
  const source=item.querySelector('img');
  galleryImageAnimation?.cancel();
  lightboxImage.src=source.getAttribute('src');
  lightboxImage.alt=source.alt;
  lightboxTitle.textContent=item.querySelector('h3').textContent;
  lightboxCount.textContent=(galleryIndex+1)+' / '+galleryItems.length;
  if(!motionPreference.matches&&lightboxImage.animate){
    galleryImageAnimation=lightboxImage.animate([{opacity:.35,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:260,easing:'ease-out'});
  }
};
galleryItems.forEach((item,index)=>{
  item.querySelector('.gallery-open').addEventListener('click',event=>{
    galleryOpener=event.currentTarget;
    showGalleryImage(index);
    document.documentElement.classList.add('gallery-viewing');
    galleryDialog.showModal();
  });
});
galleryDialog.querySelector('.lightbox-close').addEventListener('click',()=>galleryDialog.close());
galleryDialog.querySelector('.lightbox-prev').addEventListener('click',()=>showGalleryImage(galleryIndex-1));
galleryDialog.querySelector('.lightbox-next').addEventListener('click',()=>showGalleryImage(galleryIndex+1));
let galleryBackdropPress=false;
galleryDialog.addEventListener('pointerdown',event=>{galleryBackdropPress=event.target===galleryDialog;});
galleryDialog.addEventListener('click',event=>{if(galleryBackdropPress&&event.target===galleryDialog)galleryDialog.close();galleryBackdropPress=false;});
galleryDialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();showGalleryImage(galleryIndex+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();showGalleryImage(galleryIndex-1);}
});
galleryDialog.addEventListener('close',()=>{
  document.documentElement.classList.remove('gallery-viewing');
  galleryImageAnimation?.cancel();
  galleryOpener?.focus({preventScroll:true});
});
motionPreference.addEventListener('change',event=>{if(event.matches)galleryImageAnimation?.finish();});

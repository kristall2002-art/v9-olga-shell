(function(){
"use strict";
var html=document.documentElement;html.classList.add('js');
var RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
function onView(el,fn,th){
  if(!('IntersectionObserver' in window)){fn();return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){fn();io.disconnect();}});},{threshold:th||.2});
  io.observe(el);
}
function fmt(v){return String(v).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}

/* 1.1 — заголовок проявляется по буквам */
(function(){
  var h=document.querySelector('.split');if(!h)return;var k=0;
  h.querySelectorAll('.ln').forEach(function(ln){
    var t=ln.textContent;ln.textContent='';ln.setAttribute('aria-hidden','true');
    t.split(' ').forEach(function(w,wi){
      if(wi)ln.appendChild(document.createTextNode(' '));
      var ws=document.createElement('span');ws.className='wd';
      for(var i=0;i<w.length;i++){var c=document.createElement('span');c.className='ch';c.textContent=w[i];c.style.setProperty('--i',k++);ws.appendChild(c);}
      ln.appendChild(ws);
    });
  });
  setTimeout(function(){h.classList.add('go');},150);
})();

/* 5.1 — цифры набегают счётом */
document.querySelectorAll('.cnt').forEach(function(el){
  var t=parseFloat(el.dataset.v),suf=el.dataset.s||'';
  if(RM)return;
  onView(el,function(){
    var st=null;
    function step(ts){if(st===null)st=ts;var p=Math.min(1,(ts-st)/1500);
      el.textContent=fmt(Math.round(t*(1-Math.pow(1-p,3))))+suf;if(p<1)requestAnimationFrame(step);}
    el.textContent='0'+suf;requestAnimationFrame(step);
  },.6);
});

/* 3.1 — карточки всплывают по очереди */
(function(){
  var cards=[].slice.call(document.querySelectorAll('.pop'));if(!cards.length)return;
  onView(cards[0].parentNode,function(){
    cards.forEach(function(c,i){c.style.animationDelay=(i*170)+'ms';c.classList.add('in');});
  },.15);
})();

/* галерея-кольцо: фото летят по кругу, прилетают из глубины */
(function(){
  var wrap=document.getElementById('ring');if(!wrap)return;
  var ring=wrap.querySelector('.ring'),figs=[].slice.call(ring.children),n=figs.length;
  var step=360/n,rot=0,R=0,auto=!RM,drag=false,x0=0,r0=0,moved=0,vel=0,lastX=0,idleT;
  function layout(){
    var cw=wrap.clientWidth,w=Math.min(cw*0.62,Math.max(195,Math.min(299,cw*0.221)));/* v8: фото на 30% крупнее, на телефоне не шире экрана */
    wrap.style.setProperty('--iw',w+'px');wrap.style.height=Math.round(w*1.65*1.14+20)+'px';/* v8: блок по высоте фото, без пустых полей */
    R=Math.round(w*n/(2*Math.PI)*1.3);
    figs.forEach(function(f,i){f._a=step*i;});
    paint();
  }
  function paint(){
    ring.style.transform='translateZ('+(-R)+'px) rotateY('+rot+'deg)';
    figs.forEach(function(f){
      var a=((f._a+rot)%360+360)%360; if(a>180)a-=360;
      var c=Math.cos(a*Math.PI/180);
      f.style.transform='rotateY('+f._a+'deg) translateZ('+R+'px)';
      f.style.opacity=(0.25+0.75*((c+1)/2)).toFixed(3);
      f.style.zIndex=Math.round((c+1)*50);
      f._front=Math.abs(a)<step/2;
    });
  }
  function tick(){
    if(!drag){
      if(Math.abs(vel)>0.02){rot+=vel;vel*=0.94;}
      else if(auto)rot-=0.09;
      paint();
    }
    requestAnimationFrame(tick);
  }
  function pause(){auto=false;clearTimeout(idleT);idleT=setTimeout(function(){auto=!RM;},3500);}
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=0;x0=lastX=e.clientX;r0=rot;vel=0;pause();});
  window.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-x0;moved=Math.max(moved,Math.abs(dx));
    vel=(e.clientX-lastX)*0.25;lastX=e.clientX;rot=r0+dx*0.25;paint();});
  window.addEventListener('pointerup',function(e){
    if(!drag)return;drag=false;
    if(moved<6){var el=document.elementFromPoint(e.clientX,e.clientY),f=el&&el.closest?el.closest('.ring figure'):null;
      if(f){var v=f.querySelector('video'),im=f.querySelector('img');if(v)openLbVideo(v);else openLb(im.src,im.alt);vel=0;}}
  });
  window.addEventListener('pointercancel',function(){drag=false;});
  function turn(k){pause();vel=0;var target=rot+k*step,from=rot,t0=null;
    function an(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/500);rot=from+(target-from)*(1-Math.pow(1-p,3));paint();if(p<1)requestAnimationFrame(an);}
    requestAnimationFrame(an);}
  document.getElementById('rPrev').addEventListener('click',function(){turn(1);});
  document.getElementById('rNext').addEventListener('click',function(){turn(-1);});
  wrap.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')turn(1);if(e.key==='ArrowRight')turn(-1);
    if(e.key==='Enter'||e.key===' '){var f=figs.filter(function(x){return x._front;})[0];if(!f)return;e.preventDefault();
      var v=f.querySelector('video'),im=f.querySelector('img');if(v)openLbVideo(v);else openLb(im.src,im.alt);}});
  window.addEventListener('resize',layout);
  window.__ringLayout=layout;
  layout();requestAnimationFrame(tick);
  /* видео в кольце играет, только пока кольцо на экране: телефон не греется зря */
  var vids=[].slice.call(ring.querySelectorAll('video'));
  if(vids.length&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){vids.forEach(function(v){
      if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();});});},{threshold:.05}).observe(wrap);
  }
  onView(wrap,function(){
    figs.forEach(function(f,i){f.querySelector('.inner').style.transitionDelay=(i*70)+'ms';});
    wrap.classList.add('go');
  },.25);
})();

/* лайтбокс */
var lb=document.getElementById('lb'),lbi=lb.querySelector('img'),lbv=lb.querySelector('video');
function openLb(src,alt){lb.classList.remove('vid');lbi.src=src;lbi.alt=alt||'';lb.classList.add('open');lb.setAttribute('aria-hidden','false');lb._t=Date.now();}
function openLbVideo(v){/* видео крупно: тот же файл, что играет в кольце, без звука и по кругу */
  lbv.poster=v.poster;lbv.setAttribute('aria-label',v.getAttribute('aria-label')||'');
  var src=v.currentSrc||v.querySelector('source').src;if(lbv.src!==src)lbv.src=src;
  lb.classList.add('vid','open');lb.setAttribute('aria-hidden','false');lb._t=Date.now();
  var p=lbv.play();if(p&&p.catch)p.catch(function(){});}
function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');if(lbv)lbv.pause();}
lb.addEventListener('click',function(){if(Date.now()-(lb._t||0)<450)return;closeLb();});/* тап, открывший фото, не закрывает его */
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb();});

/* светлая / тёмная тема — тумблер, выбор запоминается */
(function(){
  var sw=document.getElementById('theme');
  function aria(){sw.setAttribute('aria-checked',html.classList.contains('dark')?'true':'false');}
  aria();
  function set(d){html.classList.toggle('dark',d);aria();try{localStorage.setItem('os-theme',d?'dark':'light');}catch(e){}}
  sw.addEventListener('click',function(){set(!html.classList.contains('dark'));});
  document.querySelectorAll('.thm-lb').forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-t')==='dark');});});
})();

/* крупнее / мельче */
(function(){
  var steps=['0.9','1','1.12','1.25'],cur=steps.indexOf(getComputedStyle(html).getPropertyValue('--zoom').trim()||'1');if(cur<0)cur=1;
  function set(i){cur=Math.max(0,Math.min(steps.length-1,i));html.style.setProperty('--zoom',steps[cur]);
    try{localStorage.setItem('os-zoom',steps[cur]);}catch(e){}if(window.__ringLayout)window.__ringLayout();if(window.__h1fit)window.__h1fit();}
  document.getElementById('szUp').addEventListener('click',function(){set(cur+1);});
  document.getElementById('szDown').addEventListener('click',function(){set(cur-1);});
})();

/* 6.1 — заливка кнопки слева направо по касанию */
document.querySelectorAll('.btn.fill').forEach(function(b){
  b.addEventListener('touchstart',function(){
    b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
    clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('on');},1100);
  },{passive:true});
});

/* заголовки разделов проявляются мягко, без слетающих букв */
(function(){
  if(RM)return;
  document.querySelectorAll('.h2').forEach(function(h){
    h.classList.add('soft');
    onView(h,function(){h.classList.add('go');},.1);
  });
})();

/* v8: строка со сменой слов не переносится — кегль заголовка подгоняем под самое длинное слово */
(function(){
  var h=document.querySelector('.h1'),ln=h&&h.querySelector('.ln[data-words]');if(!ln)return;
  var words=ln.getAttribute('data-words').split('|'),longest=words.reduce(function(a,b){return b.length>a.length?b:a;});
  function fit(){
    h.style.fontSize='';
    var m=document.createElement('span');m.className='it';m.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;left:-9999px';
    m.textContent='вам '+longest;ln.appendChild(m);
    var need=m.getBoundingClientRect().width,avail=h.clientWidth;ln.removeChild(m);
    if(need>avail){var fs=parseFloat(getComputedStyle(h).fontSize);h.style.fontSize=Math.floor(fs*avail/need*0.97)+'px';}
  }
  fit();window.addEventListener('resize',fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  window.__h1fit=fit;
})();

/* А3 — последнее слово заголовка меняется: спокойно, уверенно, комфортно */
(function(){
  var ln=document.querySelector('.h1 .ln[data-words]');if(!ln||RM)return;
  var words=ln.getAttribute('data-words').split('|'),wi=0;
  var wd=ln.querySelectorAll('.wd');wd=wd[wd.length-1];if(!wd)return;
  wd.classList.add('swap');
  function put(w,cls){
    var box=document.createElement('span');box.className='sw '+cls;
    for(var i=0;i<w.length;i++){var c=document.createElement('span');c.className='sc';c.textContent=w[i];c.style.setProperty('--j',i);box.appendChild(c);}
    return box;
  }
  function next(){
    var old=wd.querySelector('.sw.cur');
    wi=(wi+1)%words.length;
    var nw=put(words[wi],'cur enter');
    if(old){old.classList.remove('cur');old.classList.add('leave');setTimeout(function(){old.remove();},900);}
    wd.style.width=wd.offsetWidth+'px';
    wd.appendChild(nw);
    requestAnimationFrame(function(){wd.style.width=nw.offsetWidth+'px';nw.classList.remove('enter');});
  }
  setTimeout(function(){
    var first=put(words[0],'cur');wd.innerHTML='';wd.appendChild(first);
    setInterval(next,1600);
  },2600);
})();

/* А5 — блеск бежит по золотым надписям и кнопкам «Записаться» */
(function(){
  if(RM)return;
  document.querySelectorAll('.eyebrow,.logo-sub,.c-kind,.ftr h3,.ftr h4').forEach(function(el){el.classList.add('shine');});
  document.querySelectorAll('.btn.fill').forEach(function(b){
    if(!/Записаться/.test(b.textContent))return;
    var g=document.createElement('span');g.className='glint';b.appendChild(g);
  });
})();

/* активный пункт меню */
(function(){
  var links=[].slice.call(document.querySelectorAll('.nav a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  window.addEventListener('scroll',function(){
    var y=scrollY+120,cur=0;secs.forEach(function(s,n){if(s&&s.offsetTop<=y)cur=n;});
    links.forEach(function(a,n){a.classList.toggle('on',n===cur);});
  },{passive:true});
})();
/* отзывы: на компьютере сначала шесть, остальные по кнопке */
(function(){
  var box=document.getElementById('quotes'),btn=document.querySelector('.rv-more');
  if(!box||!btn||box.children.length<=6)return;
  box.classList.add('short');btn.hidden=false;
  btn.addEventListener('click',function(){box.classList.remove('short');btn.parentNode.style.display='none';});
})();
})();

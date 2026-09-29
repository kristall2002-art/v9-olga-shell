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

/* v9: 3D-шар из работ — крутится мышью и пальцем в любую сторону, по инерции */
(function(){
  var wrap=document.getElementById('ball');if(!wrap)return;
  var ball=wrap.querySelector('.ball'),src=[].slice.call(ball.children);
  var N=Math.max(src.length,36);/* фото повторяем, чтобы шар был плотным */
  for(var k=src.length;k<N;k++){var c=src[k%src.length].cloneNode(true);c.querySelector('img').alt='';ball.appendChild(c);}
  var tiles=[].slice.call(ball.children),ga=Math.PI*(3-Math.sqrt(5));
  tiles.forEach(function(t,i){var y=1-(i+.5)/N*2,r=Math.sqrt(1-y*y),a=ga*i;t._p=[Math.cos(a)*r,y,Math.sin(a)*r];});
  var R=200,M=[1,0,0,0,1,0,0,0,1];
  function mul(A,B){var C=[];for(var i=0;i<3;i++)for(var j=0;j<3;j++)C[i*3+j]=A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j];return C;}
  function rot(ax,ay,ang){
    var l=Math.hypot(ax,ay);if(!l||!ang)return;ax/=l;ay/=l;
    var c=Math.cos(ang),s=Math.sin(ang),t=1-c;
    M=mul([t*ax*ax+c,t*ax*ay,ay*s, t*ax*ay,t*ay*ay+c,-ax*s, -ay*s,ax*s,c],M);
  }
  function layout(){
    var cw=wrap.clientWidth,ch=wrap.clientHeight;
    R=Math.round(Math.min(cw*0.42,ch*0.42,320));
    var w=Math.round(R*0.46);wrap.style.setProperty('--tw',w+'px');
    tiles.forEach(function(t){var p=t._p,yaw=Math.atan2(p[0],p[2])*180/Math.PI,pitch=Math.asin(p[1])*180/Math.PI;
      t.style.transform='rotateY('+yaw+'deg) rotateX('+(-pitch)+'deg) translateZ('+R+'px)';});
    paint();
  }
  function paint(){
    ball.style.transform='translateZ('+(-R)+'px) matrix3d('+M[0]+','+M[3]+','+M[6]+',0,'+M[1]+','+M[4]+','+M[7]+',0,'+M[2]+','+M[5]+','+M[8]+',0,0,0,0,1)';
    tiles.forEach(function(t){
      var p=t._p,z=M[6]*p[0]+M[7]*p[1]+M[8]*p[2],o=z<-0.1?0:0.3+0.7*(z+0.1)/1.1;
      if(t._o!==o){t.style.opacity=o.toFixed(2);t._o=o;}t._z=z;
    });
  }
  var vx=0,vy=0,drag=false,x0,y0,lx,ly,moved=0,auto=!RM,idleT,visible=true,K=0.006;
  function pause(){auto=false;clearTimeout(idleT);idleT=setTimeout(function(){auto=!RM;},3500);}
  function tick(){
    if(!drag&&visible){
      if(Math.abs(vx)+Math.abs(vy)>0.05){rot(vy,vx,Math.hypot(vx,vy)*K);vx*=0.94;vy*=0.94;paint();}
      else if(auto){rot(0.3,1,0.003);paint();}
    }
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window)new IntersectionObserver(function(e){visible=e[0].isIntersecting;}).observe(wrap);
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=0;x0=lx=e.clientX;y0=ly=e.clientY;vx=vy=0;pause();
    try{wrap.setPointerCapture(e.pointerId);}catch(_){}});
  wrap.addEventListener('pointermove',function(e){if(!drag)return;
    var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    moved=Math.max(moved,Math.hypot(e.clientX-x0,e.clientY-y0));
    rot(-dy,dx,Math.hypot(dx,dy)*K);vx=dx;vy=-dy;paint();});
  wrap.addEventListener('pointerup',function(e){
    if(!drag)return;drag=false;
    if(moved<6){vx=vy=0;var best=null;
      tiles.forEach(function(t){if(t._z<=0)return;var r=t.getBoundingClientRect();
        if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&(!best||t._z>best._z))best=t;});
      if(best){var im=best.querySelector('img');openLb(im.src,im.alt);}
    }
  });
  wrap.addEventListener('pointercancel',function(){drag=false;});
  wrap.addEventListener('keydown',function(e){var m={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,12],ArrowDown:[0,-12]}[e.key];
    if(m){e.preventDefault();pause();vx=m[0];vy=m[1];}});
  window.addEventListener('resize',layout);window.__ringLayout=layout;
  layout();requestAnimationFrame(tick);
  onView(wrap,function(){wrap.classList.add('go');},.2);
})();

/* лайтбокс */
var lb=document.getElementById('lb'),lbi=lb.querySelector('img');
function openLb(src,alt){lbi.src=src;lbi.alt=alt||'';lb.classList.add('open');lb.setAttribute('aria-hidden','false');lb._t=Date.now();}
function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');}
lb.addEventListener('click',function(){if(Date.now()-(lb._t||0)<450)return;closeLb();});/* тап, открывший фото, не закрывает его */
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb();});

/* светлая / тёмная тема — тумблер, выбор запоминается */
(function(){
  var sw=document.getElementById('theme');
  function aria(){sw.setAttribute('aria-checked',html.classList.contains('dark')?'true':'false');}
  aria();
  sw.addEventListener('click',function(){
    var d=html.classList.toggle('dark');aria();try{localStorage.setItem('os-theme',d?'dark':'light');}catch(e){}
  });
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
  document.querySelectorAll('.eyebrow,.logo-sub,.c-kind,.ftr h4').forEach(function(el){el.classList.add('shine');});
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
})();

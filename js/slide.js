(function(){
var slides=document.querySelectorAll('.slide'),total=slides.length;
var ctrEl=document.getElementById('ctr');
var barEl=document.getElementById('bar');
var cur=0,exitTimer=null,prevSlide=null;

function updateUI(){
  if(ctrEl)ctrEl.textContent=(cur+1)+' / '+total;
  if(barEl)barEl.style.width=((cur+1)/total*100)+'%';
}

function goTo(n){
  if(n<0||n>=total||n===cur)return;
  if(exitTimer){clearTimeout(exitTimer);if(prevSlide){prevSlide.classList.remove('exit','active');}}
  prevSlide=slides[cur];
  prevSlide.classList.remove('active');
  prevSlide.classList.add('exit');
  exitTimer=setTimeout(function(){prevSlide.classList.remove('exit');exitTimer=null;},350);
  cur=n;
  slides[cur].classList.add('active');
  updateUI();
}

document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();goTo(cur+1);}
  if(e.key==='ArrowLeft'){e.preventDefault();goTo(cur-1);}
});
document.addEventListener('click',function(e){
  if(e.target.closest('a,button,input'))return;
  if(e.clientX>window.innerWidth/2)goTo(cur+1);
  else goTo(cur-1);
});
var touchStartX=0,touchStartY=0;
document.addEventListener('touchstart',function(e){touchStartX=e.changedTouches[0].screenX;touchStartY=e.changedTouches[0].screenY;},{passive:true});
document.addEventListener('touchend',function(e){
  var dx=e.changedTouches[0].screenX-touchStartX;
  var dy=e.changedTouches[0].screenY-touchStartY;
  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){
    if(dx<0)goTo(cur+1); else goTo(cur-1);
  }
},{passive:true});

updateUI();

// Fullscreen toggle
var fsBtn=document.createElement('button');
fsBtn.className='fs-btn';
fsBtn.textContent='\u26F6 \u5168\u753B\u9762';
fsBtn.addEventListener('click',function(){
  var d=document,el=d.documentElement;
  if(!d.fullscreenElement&&!d.webkitFullscreenElement){
    (el.requestFullscreen||el.webkitRequestFullscreen).call(el);
  }else{
    (d.exitFullscreen||d.webkitExitFullscreen).call(d);
  }
});
document.body.appendChild(fsBtn);
})();

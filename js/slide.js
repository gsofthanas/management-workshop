(function(){
const slides=document.querySelectorAll('.slide'),total=slides.length;
let cur=0,exitTimer=null,prevSlide=null;
function goTo(n){
  if(n<0||n>=total)return;
  if(exitTimer){clearTimeout(exitTimer);if(prevSlide){prevSlide.classList.remove('exit','active');}}
  prevSlide=slides[cur];
  prevSlide.classList.remove('active');
  prevSlide.classList.add('exit');
  exitTimer=setTimeout(()=>{prevSlide.classList.remove('exit');exitTimer=null;},350);
  cur=n;
  slides[cur].classList.add('active');
  document.getElementById('ctr').textContent=(cur+1)+' / '+total;
  document.getElementById('bar').style.width=((cur+1)/total*100)+'%';
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();goTo(cur+1);}
  if(e.key==='ArrowLeft'){e.preventDefault();goTo(cur-1);}
});
document.addEventListener('click',e=>{
  if(e.target.closest('a,button,input'))return;
  if(e.clientX>window.innerWidth/2)goTo(cur+1);
  else goTo(cur-1);
});
let touchStartX=0,touchStartY=0;
document.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX;touchStartY=e.changedTouches[0].screenY;},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].screenX-touchStartX;
  const dy=e.changedTouches[0].screenY-touchStartY;
  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){
    if(dx<0)goTo(cur+1); else goTo(cur-1);
  }
},{passive:true});
document.getElementById('bar').style.width=(1/total*100)+'%';
})();

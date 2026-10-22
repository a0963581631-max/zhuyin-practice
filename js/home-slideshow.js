(() => {
 const photos=Array.from({length:8},(_,i)=>homePhotoSource(i+1));
 const backdrop=document.getElementById('homeBackdrop');
 const layers=[...backdrop.querySelectorAll('.home-photo')];
 let index=0, active=0, timer=null, warmTimer=null, busy=false, started=false;
 const animations=[null,null], cache=new Map();
 const home=()=>!['learn','help','math','chinese','math-1-parts','math-1-count30'].includes(location.hash.slice(1))&&!/^chinese-[1-6](?:-(?:first|second)(?:-(?:pretty(?:-quiz)?|scissors-rock-paper|tadpole-mom))?)?$/.test(location.hash.slice(1))&&!/^math-[1-6]$/.test(location.hash.slice(1))&&!/^math-1-parts-(split|join|practice)$/.test(location.hash.slice(1));
 const running=()=>home()&&!document.hidden;
 function load(n,priority='low'){
   if(cache.has(n))return cache.get(n);
   const pending=new Promise(resolve=>{
     const photo=new Image();photo.decoding='async';photo.fetchPriority=priority;
     photo.onload=async()=>{try{await photo.decode();}catch{}resolve(true);};
     photo.onerror=()=>resolve(false);photo.src=photos[n];
   });
   cache.set(n,pending);
   pending.then(ok=>{if(!ok)cache.delete(n);});
   return pending;
 }
 function warm(){
   clearTimeout(warmTimer);
   warmTimer=setTimeout(()=>{if(running()&&started)load((index+1)%photos.length);},1200);
 }
 function drift(slot){
   if(animations[slot])animations[slot].cancel();
   const angle=Math.random()*Math.PI*2,distance=0.6+Math.random()*0.5;
   const x=Math.cos(angle)*distance,y=Math.sin(angle)*distance;
   animations[slot]=layers[slot].animate([
     {transform:`translate(${-x}%, ${-y}%)`},
     {transform:`translate(${x}%, ${y}%)`}
   ],{duration:7400,easing:'linear',fill:'forwards'});
 }
 async function showNext(){
   if(busy||!running())return;
   busy=true;
   const target=started?(index+1)%photos.length:index;
   const ok=await load(target,started?'low':'high');
   busy=false;
   if(!running())return;
   if(!ok){index=target;return;} // Keep the current photo if a request fails.
   const next=started?1-active:active;
   layers[next].style.backgroundImage=`url("${photos[target]}")`;
   layers[next].dataset.photo=String(target+1);
   drift(next);layers[next].classList.add('visible');
   if(started)layers[active].classList.remove('visible');
   active=next;index=target;started=true;warm();
 }
 function sync(){
   clearInterval(timer);clearTimeout(warmTimer);timer=null;
   backdrop.hidden=!home();document.body.classList.toggle('home-active',home());
   animations.forEach(a=>{if(a)running()?a.play():a.pause();});
   if(running()){
     if(!started)showNext();else warm();
     timer=setInterval(showNext,6000);
   }
 }
 window.addEventListener('hashchange',sync);
 document.addEventListener('visibilitychange',sync);
 sync();
})();

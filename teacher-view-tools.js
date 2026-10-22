/* Shared teacher annotations and live region zoom. No screenshots or copied lessons. */
window.TeacherViewTools=(()=>{
'use strict';
function createDrawing({canvas,color,width,space}){
 const ctx=canvas.getContext('2d'),pages=new Map();
 let strokes=[],current=null,key='',w=0,h=0,d=1;
 function coordinates(){return space?.()||null;}
 function paint(){
  ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);ctx.save();
  const camera=coordinates();
  if(camera){
   if(camera.clip){const c=camera.clip;ctx.beginPath();ctx.rect(c.x,c.y,c.width,c.height);ctx.clip();}
   ctx.translate(camera.left,camera.top);ctx.scale(camera.scale,camera.scale);
  }
  for(const s of strokes){
   ctx.globalCompositeOperation=s.erase?'destination-out':'source-over';ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   const sx=camera?1:w,sy=camera?1:h,a=s.points[0],b=s.points[s.points.length-1];
   const x=a.x*sx,y=a.y*sy,dx=(b.x-a.x)*sx,dy=(b.y-a.y)*sy;
   if(s.shape==='square'||s.shape==='circle'){
    if(s.shape==='square')ctx.rect(x,y,dx,dy);else ctx.ellipse(x+dx/2,y+dy/2,Math.abs(dx)/2,Math.abs(dy)/2,0,0,Math.PI*2);
    if(s.fill)ctx.fill();else ctx.stroke();
   }else if(s.shape==='line'){ctx.moveTo(x,y);ctx.lineTo(b.x*sx,b.y*sy);ctx.stroke();}
   else if(s.points.length===1){ctx.arc(x,y,s.width/2,0,Math.PI*2);ctx.fill();}
   else{s.points.forEach((p,i)=>i?ctx.lineTo(p.x*sx,p.y*sy):ctx.moveTo(p.x*sx,p.y*sy));ctx.stroke();}
  }
  ctx.restore();ctx.globalCompositeOperation='source-over';
 }
 function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
  // CSS transforms enlarge the canvas without changing its layout dimensions.
  w=canvas.clientWidth;h=canvas.clientHeight;d=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);paint();
 }
 function point(e){
  const c=coordinates();if(c)return{x:(e.clientX-c.left)/c.scale,y:(e.clientY-c.top)/c.scale};
  const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
 }
 function finish(){if(!current)return;const id=current.id;current=null;if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
 function move(e){if(!current||current.id!==e.pointerId)return;const p=point(e);if(current.shape==='free')current.points.push(p);else current.points[1]=p;paint();}
 canvas.onpointerdown=e=>{
  if(e.button!==0||current||!w||!h)return;
  const camera=coordinates();if(camera?.clip){const c=camera.clip;if(e.clientX<c.x||e.clientY<c.y||e.clientX>c.x+c.width||e.clientY>c.y+c.height)return;}
  e.preventDefault();canvas.setPointerCapture(e.pointerId);
  current={id:e.pointerId,color:color(),width:(api.erase?(api.eraseWidth||width()*4):width())/(camera?.scale||1),erase:api.erase,shape:api.erase?'free':api.shape,fill:api.fill,points:[point(e)]};
  strokes.push(current);paint();
 };
 canvas.onpointermove=move;
 canvas.onpointerup=e=>{if(current?.id===e.pointerId){move(e);finish();}};
 canvas.onpointercancel=e=>{if(current?.id===e.pointerId){strokes.pop();finish();paint();}};
 canvas.onlostpointercapture=()=>{current=null;};
 const api={erase:false,eraseWidth:0,shape:'free',fill:false,resize,finish,repaint:paint,
  setContext(next){if(key===next)return;finish();pages.set(key,strokes);key=next;strokes=pages.get(key)||[];paint();},
  clear(){finish();strokes=[];pages.set(key,strokes);paint();},undo(){finish();strokes.pop();paint();}
 };
 new ResizeObserver(resize).observe(canvas);return api;
}
function createView({host,root,prepare,redraw,restoreSource}){
 const $=id=>root.getElementById(id);
 // One stable wrapper preserves original nodes, event handlers and form state.
 const content=document.createElement('div');content.id='teacherLessonContent';
 content.style.cssText='position:relative;display:flow-root;';
 for(const node of [...document.body.children])if(node!==host&&node.tagName!=='SCRIPT')content.append(node);
 const pageViewport=document.createElement('div');pageViewport.id='teacherLessonViewport';pageViewport.append(content);
 document.body.insertBefore(pageViewport,host);
 const style=document.createElement('style');style.textContent=`
 #regionSelect{position:fixed;inset:0 100px 0 0;z-index:260;pointer-events:auto;touch-action:none;cursor:crosshair;background:#16394b22;outline:none}
 #regionSelection{position:absolute;border:3px dashed #177f98;background:#fff3;box-shadow:0 0 0 9999px #16394b33;pointer-events:none}
 #regionInstructions{position:absolute;top:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-radius:12px;background:#f7fcfd;color:#214858;font-weight:700;box-shadow:0 3px 15px #16394b33}
 #regionInstructions span{flex:1}#regionCancel{flex:none}
 #viewStatus{position:fixed;bottom:10px;left:10px;right:105px;z-index:250;pointer-events:none;border-radius:12px;padding:8px 12px;background:#f7fcfd;color:#214858;box-shadow:0 3px 15px #16394b33;font-size:14px}
 #viewStatus:empty{display:none}
 .teacher-region-viewport{position:fixed;inset:0 100px 0 0;z-index:150;background:#fff;overflow:hidden;pointer-events:auto;isolation:isolate}
 @media(max-width:600px){#regionSelect,.teacher-region-viewport{right:78px}#viewStatus{right:82px}#regionInstructions{font-size:14px;flex-wrap:wrap}}
 `;root.append(style);
 const selector=document.createElement('div');selector.id='regionSelect';selector.hidden=true;selector.tabIndex=-1;selector.setAttribute('role','dialog');selector.setAttribute('aria-label','選擇放大區域');
 selector.innerHTML='<div id="regionInstructions"><span id="regionHint">在教材上拖曳框選要放大的區域，放開後放大；按 Esc 可取消。</span><button id="regionCancel" type="button">取消</button></div><div id="regionSelection" hidden></div>';
 const status=document.createElement('div');status.id='viewStatus';status.setAttribute('role','status');root.append(selector,status);
 let selection=null,zoom=null,lastFocus=null;
 const rectOf=el=>el.getBoundingClientRect();
 function railButton(){return $('regionZoom');}
 function announce(text){status.textContent=text;}
 function sourceAt(x,y){
  for(const id of ['hundredStage','board','count']){const el=$(id);const r=rectOf(el);if(!el.hidden&&r.width&&r.height&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return el;}
  return content;
 }
 function bounds(source){
  const a=rectOf(source),b=rectOf(selector);
  return{left:Math.max(0,a.left),top:Math.max(0,a.top),right:Math.min(b.right,a.right),bottom:Math.min(b.bottom,a.bottom)};
 }
 function clampPoint(e,b){return{x:Math.max(b.left,Math.min(b.right,e.clientX)),y:Math.max(b.top,Math.min(b.bottom,e.clientY))};}
 function box(a,b){return{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)};}
 function cancel(focus=true){
  if(selection&&selector.hasPointerCapture(selection.id))selector.releasePointerCapture(selection.id);
  selection=null;selector.hidden=true;$('regionSelection').hidden=true;railButton().setAttribute('aria-pressed',String(!!zoom));
  if(focus)railButton().focus({preventScroll:true});
 }
 function layout(){
  if(!zoom)return;
  const r=rectOf(zoom.viewport),b=zoom.box;
  zoom.source.style.clipPath=`inset(${b.y}px ${Math.max(0,zoom.width-b.x-b.width)}px ${Math.max(0,zoom.height-b.y-b.height)}px ${b.x}px)`;
  zoom.scale=Math.min(6,Math.max(1,Math.min(r.width/b.width,r.height/b.height)));
  const x=(r.width-b.width*zoom.scale)/2-b.x*zoom.scale,y=(r.height-b.height*zoom.scale)/2-b.y*zoom.scale;
  zoom.source.style.transform=`translate(${x}px,${y}px) scale(${zoom.scale})`;
  redraw();
 }
 function reset(focus=false){
  cancel(false);if(!zoom){if(focus)railButton().focus({preventScroll:true});return;}
  const old=zoom;zoom=null;document.body.classList.remove('teacher-region-active');if(old.marker)old.marker.replaceWith(old.source);
  if(old.style===null)old.source.removeAttribute('style');else old.source.setAttribute('style',old.style);
  if(old.page){old.viewport.removeAttribute('style');old.viewport.removeAttribute('class');}else old.viewport.remove();
  document.body.style.overflow=old.overflow;
  if(old.page)window.scrollTo(old.scrollX,old.scrollY);
  restoreSource?.(old.source);
  $('viewReset').hidden=true;railButton().setAttribute('aria-pressed','false');announce('已還原原本大小。');redraw();
  window.dispatchEvent(new Event('resize'));
  if(focus)(old.focus?.isConnected?old.focus:railButton()).focus({preventScroll:true});
 }
 function enlarge(source,region){
  const r=rectOf(source),page=source===content;
  const viewport=page?pageViewport:document.createElement('div');viewport.className='teacher-region-viewport';viewport.setAttribute('aria-label','已放大的教材區域');
  // Page content and shadow tools retain their own style scopes.
  if(!page)root.append(viewport);
  if(page){viewport.style.cssText='position:fixed;inset:0 '+(innerWidth<=600?78:100)+'px 0 0;z-index:9000;background:white;overflow:hidden;isolation:isolate;';}
  const marker=page?null:document.createComment('restore teacher zoom source');if(marker)source.before(marker);
  zoom={source,viewport,marker,page,style:source.getAttribute('style'),overflow:document.body.style.overflow,scrollX:scrollX,scrollY:scrollY,focus:lastFocus,width:r.width,height:r.height,scale:1,box:{x:region.x-r.left,y:region.y-r.top,width:region.width,height:region.height}};
  document.body.classList.add('teacher-region-active');document.body.style.overflow='hidden';if(!page)viewport.append(source);
  Object.assign(source.style,{position:'absolute',inset:'auto',left:'0px',top:'0px',width:r.width+'px',height:r.height+'px',minWidth:'0',maxWidth:'none',maxHeight:'none',margin:'0',transformOrigin:'0 0'});
  $('viewReset').hidden=false;railButton().setAttribute('aria-pressed','true');layout();
  announce('已放大選取區域，可繼續操作教材。按側欄「還原」或 Esc 返回。');$('viewReset').focus({preventScroll:true});
 }
 function start(){
  reset();prepare();lastFocus=root.activeElement||document.activeElement;selector.hidden=false;
  $('regionHint').textContent='在教材上拖曳框選要放大的區域，放開後放大；按 Esc 可取消。';
  railButton().setAttribute('aria-pressed','true');announce('');selector.focus({preventScroll:true});
 }
 selector.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
 selector.onpointerdown=e=>{
  if(e.button!==0||selection||e.target.closest('button')||e.target.closest('#regionInstructions'))return;
  const source=sourceAt(e.clientX,e.clientY),b=bounds(source);
  if(b.right<=b.left||b.bottom<=b.top)return;
  e.preventDefault();selection={id:e.pointerId,source,bounds:b,start:clampPoint(e,b)};selector.setPointerCapture(e.pointerId);
 };
 selector.onpointermove=e=>{
  if(selection?.id!==e.pointerId)return;e.preventDefault();
  const b=box(selection.start,clampPoint(e,selection.bounds)),el=$('regionSelection');el.hidden=false;Object.assign(el.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});
 };
 selector.onpointerup=e=>{
  if(selection?.id!==e.pointerId)return;
  const s=selection,b=box(s.start,clampPoint(e,s.bounds));
  if(b.width<40||b.height<40){selection=null;selector.releasePointerCapture(e.pointerId);$('regionSelection').hidden=true;$('regionHint').textContent='選取範圍太小，請重新拖曳一個較大的區域。';return;}
  cancel(false);enlarge(s.source,b);
 };
 selector.onpointercancel=()=>cancel();selector.onlostpointercapture=()=>{selection=null;};
 $('regionCancel').onclick=()=>{cancel();announce('已取消框選。');};
 railButton().onclick=()=>selector.hidden?start():cancel();$('viewReset').onclick=()=>reset(true);
 function escape(){if(!selector.hidden){cancel();announce('已取消框選。');return true;}if(zoom){reset(true);return true;}return false;}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&escape()){e.preventDefault();e.stopImmediatePropagation();}},true);
 // Restore live nodes before the application's route handlers hide or update them.
 window.addEventListener('hashchange',()=>reset(),true);
 window.addEventListener('readingimagechange',()=>reset(),true);
 window.addEventListener('annotationcontextchange',()=>reset(),true);
 window.addEventListener('resize',()=>{if(!selector.hidden)cancel();if(zoom?.page)zoom.viewport.style.right=(innerWidth<=600?78:100)+'px';layout();redraw();});
 function syncFullscreen(){
  const full=!!document.fullscreenElement,button=$('viewFullscreen');button.setAttribute('aria-pressed',String(full));button.querySelector('.label').textContent=full?'退出全螢幕':'全螢幕';
  layout();redraw();
 }
 $('viewFullscreen').onclick=async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
   else{announce('此瀏覽器不支援全螢幕，仍可使用框選放大。');return;}
   announce('');
  }catch{announce('無法切換全螢幕，請確認瀏覽器允許此功能。');}
  syncFullscreen();
 };
 document.addEventListener('fullscreenchange',syncFullscreen);
 return{reset,escape,keepVisible(){if(zoom)zoom.source.hidden=false;},pageSpace(){
  if($('ink').parentNode!==root)return null;
  const r=rectOf(content),s=zoom?.page?zoom.scale:1;
  let clip=null;
  if(zoom?.page){const v=rectOf(zoom.viewport),b=zoom.box;clip={x:r.left+b.x*s,y:r.top+b.y*s,width:Math.min(v.width,b.width*s),height:Math.min(v.height,b.height*s)};}
  return{left:r.left,top:r.top,scale:s,clip};
 }};
}
return{createDrawing,createView};
})();

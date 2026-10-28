(()=>{
'use strict';
// Keep the challenge list identical to the existing Bopomofo learning page.
const GROUPS=[
 {title:'聲母', id:'challengeInitials', symbols:['ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ']},
 {title:'介音與韻母', id:'challengeFinals', symbols:['ㄧ','ㄨ','ㄩ','ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ']},
 {title:'結合韻', id:'challengeCompound', symbols:['ㄧㄚ','ㄧㄛ','ㄧㄝ','ㄧㄞ','ㄧㄠ','ㄧㄡ','ㄧㄢ','ㄧㄣ','ㄧㄤ','ㄧㄥ','ㄨㄚ','ㄨㄛ','ㄨㄞ','ㄨㄟ','ㄨㄢ','ㄨㄣ','ㄨㄤ','ㄨㄥ','ㄩㄝ','ㄩㄢ','ㄩㄣ','ㄩㄥ']}
];
const STORAGE_KEY='zhuyin-challenge-v1';
const SYMBOLS=GROUPS.flatMap(group=>group.symbols);
const validSymbols=new Set(SYMBOLS);
const cells=new Map();
const records=Object.create(null);
let initialized=false;
const clamp=value=>Math.max(0,Math.min(10,value));
function readRecords(){
 try{
  const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
  const items=stored&&typeof stored==='object'&&stored.items&&typeof stored.items==='object'?stored.items:{};
  for(const [symbol,item] of Object.entries(items)){
   if(!validSymbols.has(symbol)||!item||typeof item!=='object')continue;
   const points=Number.isFinite(item.points)?clamp(Math.round(item.points)):0;
   const flag=['none','review','boss'].includes(item.flag)?item.flag:'none';
   records[symbol]={points,flag};
  }
 }catch(error){console.warn('無法讀取本機注音檢核紀錄',error);}
}
function storeRecords(){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,items:records}));}
 catch(error){announce('瀏覽器禁止儲存，這次變更只會保留到關閉頁面。');console.warn('無法儲存注音檢核紀錄',error);}
}
function current(symbol){return records[symbol]||(records[symbol]={points:0,flag:'none'});}
function mix(from,to,fraction){return Math.round(from+(to-from)*fraction);}
function backgroundColor(item){
 const targets={none:[99,188,124],review:[255,212,67],boss:[238,92,94]};
 const target=targets[item.flag];
 // Normal: white at zero, greener as points increase.
 // Needs-work / Boss: yellow or red at zero, fading to white by 10 points.
 const amount=item.flag==='none'?item.points/10:1-item.points/10;
 return 'rgb('+[0,1,2].map(i=>mix(255,target[i],amount)).join(',')+')';
}
function announce(message){
 const status=document.getElementById('challengeStatus');
 if(status)status.textContent=message;
}
function renderStats(){
 const summary=document.getElementById('challengeSummary');
 let practiced=0,review=0,boss=0;
 for(const symbol of SYMBOLS){
  const item=current(symbol);
  if(item.points>0)practiced++;
  if(item.flag==='review')review++;
  if(item.flag==='boss')boss++;
 }
 summary.textContent='已有分數 '+practiced+'／'+SYMBOLS.length+' 項　｜　待加強 '+review+' 項　｜　大魔王 '+boss+' 項';
}
function render(symbol){
 const cell=cells.get(symbol);if(!cell)return;
 const item=current(symbol);
 const tag=item.flag==='review'?'待加強':item.flag==='boss'?'大魔王':'';
 cell.dataset.flag=item.flag;
 cell.style.backgroundColor=backgroundColor(item);
 cell.querySelector('.challenge-points').textContent=item.points+' / 10';
 const label=cell.querySelector('.challenge-tag');
 label.textContent=tag;
 label.hidden=!tag;
 cell.setAttribute('aria-label',symbol+'，'+item.points+'分'+(tag?'，'+tag:'')+'。向上滑加分、向下滑減分；快速按三下標記待加強、長按三秒標記大魔王');
}
function changePoints(symbol,amount){
 const item=current(symbol),next=clamp(item.points+amount);
 if(next===item.points){announce(symbol+(amount>0?' 已達10分':' 已是0分'));return;}
 item.points=next;
 storeRecords();render(symbol);renderStats();
 announce(symbol+' '+(amount>0?'加1分':'減1分')+'，目前'+next+'分'+(item.flag==='review'?'（待加強）':item.flag==='boss'?'（大魔王）':''));
}
function toggleFlag(symbol,flag){
 const item=current(symbol);
 item.flag=item.flag===flag?'none':flag;
 // Keep the existing point value when changing a flag.
 storeRecords();render(symbol);renderStats();
 announce(symbol+'：'+(item.flag==='review'?'待加強':item.flag==='boss'?'大魔王':'已取消特殊標記')+'，'+item.points+'分');
}
function makeCell(symbol){
 const cell=document.createElement('button');
 cell.type='button';cell.className='challenge-cell';cell.dataset.flag='none';
 const glyph=document.createElement('span');glyph.className='challenge-glyph';glyph.textContent=symbol;
 const points=document.createElement('span');points.className='challenge-points';
 const tag=document.createElement('span');tag.className='challenge-tag';tag.hidden=true;
 cell.append(glyph,points,tag);
 cells.set(symbol,cell);
 let active=null,timer=0,taps=0,lastTap=0;
 function cancelTimer(){if(timer){clearTimeout(timer);timer=0;}}
 function resetPress(){cancelTimer();active=null;}
 cell.addEventListener('pointerdown',event=>{
  if(active||(event.pointerType==='mouse'&&event.button!==0))return;
  active={id:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false,held:false};
  try{cell.setPointerCapture(event.pointerId);}catch(error){}
  timer=setTimeout(()=>{
   timer=0;
   if(active&&!active.moved){
    active.held=true;taps=0;lastTap=0;toggleFlag(symbol,'boss');
   }
  },3000);
 });
 cell.addEventListener('pointermove',event=>{
  if(!active||active.id!==event.pointerId)return;
  if(Math.hypot(event.clientX-active.startX,event.clientY-active.startY)>=12){
   active.moved=true;cancelTimer();
  }
 });
 cell.addEventListener('pointerup',event=>{
  if(!active||active.id!==event.pointerId)return;
  const dy=event.clientY-active.startY,dx=event.clientX-active.startX,held=active.held;
  resetPress();
  if(held)return;
  if(Math.abs(dy)>=28&&Math.abs(dy)>Math.abs(dx)*1.2){
   taps=0;lastTap=0;changePoints(symbol,dy<0?1:-1);return;
  }
  if(Math.abs(dx)>18||Math.abs(dy)>18){taps=0;lastTap=0;return;}
  const now=Date.now();
  taps=now-lastTap<650?taps+1:1;
  lastTap=now;
  if(taps>=3){taps=0;lastTap=0;toggleFlag(symbol,'review');}
 });
 cell.addEventListener('pointercancel',()=>{resetPress();taps=0;lastTap=0;});
 cell.addEventListener('contextmenu',event=>event.preventDefault());
 cell.addEventListener('dragstart',event=>event.preventDefault());
 cell.addEventListener('keydown',event=>{
  if(event.key==='ArrowUp'){event.preventDefault();changePoints(symbol,1);}
  else if(event.key==='ArrowDown'){event.preventDefault();changePoints(symbol,-1);}
  else if(event.key.toLowerCase()==='y'){event.preventDefault();toggleFlag(symbol,'review');}
  else if(event.key.toLowerCase()==='r'){event.preventDefault();toggleFlag(symbol,'boss');}
 });
 return cell;
}
function initialize(){
 if(initialized)return;
 initialized=true;
 readRecords();
 for(const group of GROUPS){
  const grid=document.getElementById(group.id);
  if(!grid)continue;
  for(const symbol of group.symbols)grid.appendChild(makeCell(symbol));
 }
 const reset=document.getElementById('challengeReset');
 reset.addEventListener('click',()=>{
  if(!confirm('要清除全部59個注音的分數與待加強／大魔王標記嗎？此動作無法復原。'))return;
  for(const key of Object.keys(records))delete records[key];
  storeRecords();
  for(const symbol of SYMBOLS)render(symbol);
  renderStats();announce('已清除全部注音檢核紀錄');
 });
}
window.ZhuyinChallenge={
 enter(){
  initialize();
  for(const symbol of SYMBOLS)render(symbol);
  renderStats();
  announce('已載入本機檢核紀錄。向上滑加1分、向下滑減1分；三連點為待加強，長按3秒為大魔王。');
 }
};
})();
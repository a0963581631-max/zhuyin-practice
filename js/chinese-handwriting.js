/* Traditional-character writing mode for the resource classroom.
 * Powered by Hanzi Writer (MIT) and its independent stroke dataset (Arphic Public License).
 * The dataset is NOT the Taiwan Ministry of Education's official stroke-order dataset.
 */
(()=>{
 'use strict';
 if(window.ChineseHandwriting)return;
 const byId=id=>document.getElementById(id);
 const elements={
  form:byId('hanziSearchForm'),input:byId('hanziSearchInput'),searchStatus:byId('hanziSearchStatus'),
  results:byId('hanziSearchResults'),searchChoices:byId('hanziSearchChoices'),lessonChoices:byId('hanziLessonChoices'),
  char:byId('hanziCurrentCharacter'),count:byId('hanziStrokeCount'),progress:byId('hanziProgress'),
  target:byId('hanziWritingTarget'),play:byId('hanziPlayAll'),practice:byId('hanziStartPractice'),
  previous:byId('hanziPrevious'),next:byId('hanziNext'),step:byId('hanziStep'),
  hint:byId('hanziHint'),restart:byId('hanziRestart'),speed:byId('hanziSpeed')
 };
 const dataCache=new Map();
 let characters=[],activeIndex=0,writer=null,strokeData=null,strokeTotal=0,strokeNumber=0,runToken=0,loadToken=0,mode='idle',stepBusy=false,boardSize=0;

 const isPracticeRoute=()=>location.hash==='#chinese-vocabulary-practice';
 const feedback=()=>window.TeachingFeedback;
 function setProgress(message){elements.progress.textContent=message;}
 function setButtons(loading){
  const disabled=loading||!writer;
  for(const el of [elements.play,elements.practice,elements.restart])el.disabled=disabled;
  elements.step.disabled=disabled||mode==='practice'||mode==='complete'||stepBusy;
  elements.hint.disabled=disabled||mode!=='practice'||strokeNumber>=strokeTotal;
  elements.play.classList.toggle('is-active',mode==='play'||mode==='step');
  elements.practice.classList.toggle('is-active',mode==='practice'||mode==='complete');
  elements.previous.disabled=!characters.length||activeIndex===0;
  elements.next.disabled=!characters.length||activeIndex===characters.length-1;
 }
 function characterButtons(container,isLesson){
  container.replaceChildren();
  characters.forEach((ch,index)=>{
   const button=document.createElement('button');
   button.type='button';
   button.className='hanzi-choice';
   button.textContent=ch;
   button.setAttribute('aria-label','教學國字「'+ch+'」');
   if(isLesson&&index===activeIndex)button.setAttribute('aria-current','true');
   button.addEventListener('click',()=>{
    activeIndex=index;
    if(isLesson){renderLessonButtons();loadCurrent();}
    else location.hash='#chinese-vocabulary-practice';
   });
   container.append(button);
  });
 }
 function renderLessonButtons(){characterButtons(elements.lessonChoices,true);}
 function search(value){
  const letters=Array.from(value.normalize('NFC')).filter(ch=>/\p{Script=Han}/u.test(ch));
  const unique=[...new Set(letters)];
  if(!unique.length){
   elements.results.hidden=true;
   elements.searchStatus.textContent='請輸入至少一個國字（標點與數字不會納入）。';
   return;
  }
  characters=unique.slice(0,20);
  activeIndex=0;
  elements.results.hidden=false;
  elements.searchStatus.textContent='已找到 '+characters.length+' 個不同國字'+(unique.length>20?'（最多顯示前20字）':'')+'，請點選想先教的字。';
  characterButtons(elements.searchChoices,false);
 }
 elements.form.addEventListener('submit',event=>{event.preventDefault();search(elements.input.value);});
 function getCharacterData(ch){
  if(dataCache.has(ch))return dataCache.get(ch);
  const promise=window.HanziWriter.loadCharacterData(ch);
  dataCache.set(ch,promise);
  promise.catch(()=>dataCache.delete(ch));
  return promise;
 }
 function sizeOfBoard(){
  return Math.max(160,Math.round(elements.target.getBoundingClientRect().width||elements.target.clientWidth||340));
 }
 function resetWriter(){
  runToken++;
  if(writer){try{writer.cancelQuiz();}catch{}}
  writer=null;mode='idle';strokeNumber=0;stepBusy=false;
  elements.target.replaceChildren();
 }
 function buildWriter(data){
  resetWriter();
  strokeData=data;
  boardSize=sizeOfBoard();
  writer=window.HanziWriter.create(elements.target,characters[activeIndex],{
   width:boardSize,height:boardSize,padding:18,
   showCharacter:false,showOutline:true,outlineColor:'#d6e0e6',
   strokeColor:'#253946',drawingColor:'#267e9a',drawingWidth:10,
   strokeAnimationSpeed:Number(elements.speed.value),delayBetweenStrokes:380,
   strokeHighlightSpeed:1.4,highlightColor:'#71acde',
   charDataLoader:()=>data
  });
  setButtons(false);
 }
 async function loadCurrent(){
  const selected=characters[activeIndex];
  if(!selected||!isPracticeRoute())return;
  const token=++loadToken;
  resetWriter();strokeData=null;strokeTotal=0;
  elements.char.textContent=selected;
  elements.count.textContent='';
  setProgress('正在載入「'+selected+'」的筆順資料……');
  renderLessonButtons();
  setButtons(true);
  try{
   if(!window.HanziWriter)throw new Error('筆順互動程式尚未載入');
   const data=await getCharacterData(selected);
   if(token!==loadToken||!isPracticeRoute()||characters[activeIndex]!==selected)return;
   if(!data||!Array.isArray(data.strokes)||!data.strokes.length||!Array.isArray(data.medians))throw new Error('筆順資料不完整');
   strokeTotal=data.strokes.length;
   buildWriter(data);
   elements.count.textContent='共 '+strokeTotal+' 畫';
   setProgress('請選擇「播放筆順」或「練習筆順」。');
  }catch(err){
   if(token!==loadToken||!isPracticeRoute())return;
   resetWriter();setButtons(true);
   setProgress('目前無法載入「'+selected+'」的筆順資料。可能沒有此字的資料，或網路無法連接字庫。請換字或稍後再試。');
   console.error('Hanzi character data failed',err);
  }
 }
 function playAll(){
  if(!writer)return;
  const thisWriter=writer,token=++runToken;
  thisWriter.cancelQuiz();
  mode='play';strokeNumber=0;stepBusy=false;
  thisWriter.hideCharacter({duration:0});
  setProgress('正在播放「'+characters[activeIndex]+'」的筆順……');
  setButtons(false);
  thisWriter.animateCharacter({onComplete:()=>{
   if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
   strokeNumber=strokeTotal;
   setProgress('播放完成，共 '+strokeTotal+' 畫。可以按「練習筆順」動手寫。');
   setButtons(false);
  }});
 }
 function nextStroke(){
  if(!writer||stepBusy||mode==='practice'||mode==='complete')return;
  const thisWriter=writer;
  if(mode!=='step'){
   runToken++;
   thisWriter.cancelQuiz();
   thisWriter.hideCharacter({duration:0});
   strokeNumber=0;mode='step';
  }
  if(strokeNumber>=strokeTotal){
   thisWriter.hideCharacter({duration:0});
   strokeNumber=0;
  }
  const index=strokeNumber,token=++runToken;
  stepBusy=true;setButtons(false);
  setProgress('正在示範第 '+(index+1)+' 畫／共 '+strokeTotal+' 畫');
  thisWriter.animateStroke(index,{onComplete:()=>{
   if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
   strokeNumber=index+1;stepBusy=false;
   setProgress('已播放第 '+strokeNumber+' 畫／共 '+strokeTotal+' 畫'+(strokeNumber===strokeTotal?'，示範完成。':''));
   setButtons(false);
  }});
 }
 function startPractice(){
  if(!writer)return;
  const thisWriter=writer,token=++runToken;
  thisWriter.cancelQuiz();
  thisWriter.hideCharacter({duration:0});
  mode='practice';strokeNumber=0;stepBusy=false;
  feedback()?.clearConfetti();
  setProgress('請從第1畫開始，沿著淺色筆畫一筆一畫書寫。');
  setButtons(false);
  thisWriter.quiz({
   leniency:1.2,acceptBackwardsStrokes:false,showHintAfterMisses:3,
   onCorrectStroke:details=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    strokeNumber=details.strokeNum+1;
    feedback()?.playCorrectSound();
    if(strokeNumber<strokeTotal)setProgress('第 '+strokeNumber+' 畫正確！請接著寫第 '+(strokeNumber+1)+' 畫／共 '+strokeTotal+' 畫。');
    setButtons(false);
   },
   onMistake:details=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    feedback()?.playWrongSound();
    setProgress('第 '+(details.strokeNum+1)+' 畫還需要調整，請再試一次。寫錯不會跳到下一畫。');
   },
   onComplete:()=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    mode='complete';strokeNumber=strokeTotal;
    setProgress('太棒了！「'+characters[activeIndex]+'」共 '+strokeTotal+' 畫全部完成！');
    setButtons(false);
    feedback()?.playApplauseSound();
    feedback()?.launchConfetti();
   }
  });
 }
 elements.play.addEventListener('click',playAll);
 elements.practice.addEventListener('click',startPractice);
 elements.step.addEventListener('click',nextStroke);
 elements.hint.addEventListener('click',()=>{
  if(writer&&mode==='practice'&&strokeNumber<strokeTotal){
   writer.highlightStroke(strokeNumber);
   setProgress('已提示第 '+(strokeNumber+1)+' 畫，請跟著方向寫一次。');
  }
 });
 elements.restart.addEventListener('click',()=>{if(mode==='practice'||mode==='complete')startPractice();else playAll();});
 elements.previous.addEventListener('click',()=>{if(activeIndex>0){activeIndex--;loadCurrent();}});
 elements.next.addEventListener('click',()=>{if(activeIndex<characters.length-1){activeIndex++;loadCurrent();}});
 elements.speed.addEventListener('change',()=>{
  if(!writer||!strokeData)return;
  buildWriter(strokeData);
  setProgress('播放速度已更新，請重新選擇播放或練習模式。');
 });
 if('ResizeObserver' in window){
  new ResizeObserver(()=>{
   if(!writer||!isPracticeRoute())return;
   const next=sizeOfBoard();
   if(next!==boardSize){boardSize=next;writer.updateDimensions({width:next,height:next,padding:18});}
  }).observe(elements.target);
 }
 function enter(route){
  if(route==='chineseVocabulary'){
   if(characters.length){
    elements.results.hidden=false;
    characterButtons(elements.searchChoices,false);
   }
   return;
  }
  if(!characters.length){location.hash='#chinese-vocabulary';return;}
  loadCurrent();
 }
 function leave(){
  ++loadToken;
  resetWriter();
  feedback()?.clearConfetti();
 }
 window.ChineseHandwriting={enter,leave};
})();

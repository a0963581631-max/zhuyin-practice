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
  hint:byId('hanziHint'),restart:byId('hanziRestart'),speed:byId('hanziSpeed'),
  level:byId('hanziHintLevel'),levelText:byId('hanziHintLevelText'),radical:byId('hanziRadical'),
  radicalHelp:byId('hanziRadicalHelp'),dot:byId('hanziStartDot'),guide:byId('hanziGuideLayer')
 };
 const dataCache=new Map();
 let characters=[],activeIndex=0,writer=null,strokeData=null,strokeTotal=0,strokeNumber=0,runToken=0,loadToken=0,mode='idle',stepBusy=false,boardSize=0,strokeNames=[];

 const isPracticeRoute=()=>location.hash==='#chinese-vocabulary-practice';
 const feedback=()=>window.TeachingFeedback;

 const radicalOverrides={花:'艸',開:'門'};
 const fallbackRadicals={大:'大',象:'豕',鼻:'鼻',子:'子',長:'長',河:'水',馬:'馬',小:'小',蝌:'虫',蚪:'虫',找:'手',媽:'女',剪:'刀',石:'石',頭:'頁',布:'巾',印:'卩',手:'手'};
 const radicalVariants={'艹':'艸','门':'門','氵':'水','氺':'水','亻':'人','扌':'手','忄':'心','攵':'攴','刂':'刀','灬':'火','礻':'示','衤':'衣','讠':'言','訁':'言','犭':'犬','钅':'金','釒':'金','纟':'糸','糹':'糸','饣':'食','飠':'食','辶':'辵','贝':'貝','见':'見','车':'車','页':'頁','风':'風','马':'馬'};
 const strokeChars={'横':'橫','竖':'豎','钩':'鉤','弯':'彎','卧':'臥','点':'點'};
 const levelExplanations=['無提示（不顯示起筆點及下一畫）','部分提示（只有綠色起筆點）','完全提示（綠色起筆點＋藍色下一畫）'];
 function updateRadical(ch){
  let result=radicalOverrides[ch]||'';
  if(!result){
   try{
    const lookup=window.cnchar?.radical||window.CncharRadical?.radical;
    if(typeof lookup==='function'){
     let raw=lookup(ch,'array');raw=Array.isArray(raw)?raw[0]:raw;
     if(raw&&typeof raw==='object')raw=raw.radical;
     if(typeof raw==='string'&&raw.length&&raw!=='*')result=radicalVariants[raw]||raw;
    }
   }catch(error){console.warn('Radical lookup failed',error);}
  }
  result=result||fallbackRadicals[ch]||'';
  elements.radical.textContent=result||'—';
  elements.radicalHelp.textContent=result?'康熙部首':'尚無可用部首資料';
 }
 function namesFor(ch,count){
  try{
   let raw=window.cnchar?.stroke?.(ch,'order','name');
   if(Array.isArray(raw)&&raw.length===1&&typeof raw[0]==='string')raw=raw[0];
   if(typeof raw==='string')raw=raw.trim().split(/\s+/);
   if(!Array.isArray(raw)||raw.length!==count)return [];
   const labels=raw.map(name=>Array.from(String(name)).map(c=>strokeChars[c]||c).join(''));
   return labels.every(label=>/^[\p{Script=Han}]{1,9}$/u.test(label))?labels:[];
  }catch(error){console.warn('Stroke names unavailable',error);return [];}
 }
 function clearGuides(){elements.dot.hidden=true;elements.guide.replaceChildren();}
 function renderHints(){
  const level=Number(elements.level.value);
  elements.levelText.textContent='目前提示程度：'+levelExplanations[level];
  clearGuides();
  if(!writer||mode!=='practice'||strokeNumber>=strokeTotal||!strokeData)return;
  if(level===2)writer.showOutline({duration:0});
  else writer.hideOutline({duration:0});
  const scale=(boardSize-36)/1024;
  if(level===2&&strokeData.strokes[strokeNumber]){
   elements.guide.setAttribute('viewBox','0 0 '+boardSize+' '+boardSize);
   const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
   shape.setAttribute('d',strokeData.strokes[strokeNumber]);
   shape.setAttribute('fill','#9ec9f4');shape.setAttribute('opacity','.75');
   const transform=document.createElementNS('http://www.w3.org/2000/svg','g');
   transform.setAttribute('transform','translate(18 18) scale('+scale+') translate(0 900) scale(1 -1)');
   transform.append(shape);elements.guide.append(transform);
  }
  if(level>=1){
   const start=strokeData.medians?.[strokeNumber]?.[0];
   if(Array.isArray(start)&&start.length>=2){
    elements.dot.style.left=(18+start[0]*scale)+'px';
    elements.dot.style.top=(18+(900-start[1])*scale)+'px';
    elements.dot.hidden=false;
   }
  }
 }
 function sayStroke(number,token,next){
  if(token!==runToken||!writer)return;
  const phrase='第'+(number+1)+'畫'+(strokeNames[number]?'，'+strokeNames[number]:'');
  if(!('speechSynthesis' in window)||!window.TeachingFeedback?.speakText){next();return;}
  let completed=false,timer;
  const done=()=>{if(completed)return;completed=true;clearTimeout(timer);if(token===runToken&&writer)next();};
  const utterance=TeachingFeedback.speakText(phrase,.88,true);
  if(!utterance){next();return;}
  utterance.onend=done;utterance.onerror=done;
  timer=setTimeout(done,Math.max(2200,Math.min(4600,phrase.length*320)));
 }
 function animateLabeled(index,token,callback){
  const current=writer;if(!current||token!==runToken)return;
  const label=strokeNames[index]?'「'+strokeNames[index]+'」':'';
  setProgress('第 '+(index+1)+' 畫'+label+'／共 '+strokeTotal+' 畫');
  sayStroke(index,token,()=>{
   if(token!==runToken||writer!==current)return;
   current.animateStroke(index,{onComplete:()=>{
    if(token!==runToken||writer!==current)return;
    strokeNumber=index+1;callback();
   }});
  });
 }
 elements.level.addEventListener('input',renderHints);

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
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  clearGuides();
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
  resetWriter();strokeData=null;strokeTotal=0;strokeNames=[];
  updateRadical(selected);
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
   strokeNames=namesFor(selected,strokeTotal);
   buildWriter(data);
   elements.count.textContent='共 '+strokeTotal+' 畫';
   setProgress('請選擇「播放筆順」或「練習筆順」。'+(strokeNames.length?'播放時同步念出筆畫名稱。':'此字的筆畫名稱暫未收錄，播放時改念畫數。'));
  }catch(err){
   if(token!==loadToken||!isPracticeRoute())return;
   resetWriter();setButtons(true);
   setProgress('目前無法載入「'+selected+'」的筆順資料。可能沒有此字的資料，或網路無法連接字庫。請換字或稍後再試。');
   console.error('Hanzi character data failed',err);
  }
 }
 function playAll(){
  if(!writer)return;
  const current=writer,token=++runToken;
  current.cancelQuiz();mode='play';strokeNumber=0;stepBusy=true;
  current.hideCharacter({duration:0});current.showOutline({duration:0});clearGuides();setButtons(false);
  const walk=index=>{
   if(token!==runToken||writer!==current)return;
   if(index>=strokeTotal){
    stepBusy=false;strokeNumber=strokeTotal;
    setProgress('播放完成，共 '+strokeTotal+' 畫。可以按「練習筆順」動手寫。');
    setButtons(false);return;
   }
   animateLabeled(index,token,()=>walk(index+1));
  };
  walk(0);
 }
 function nextStroke(){
  if(!writer||stepBusy||mode==='practice'||mode==='complete')return;
  const current=writer;
  if(mode!=='step'){
   runToken++;current.cancelQuiz();current.hideCharacter({duration:0});
   strokeNumber=0;mode='step';clearGuides();current.showOutline({duration:0});
  }
  if(strokeNumber>=strokeTotal){current.hideCharacter({duration:0});strokeNumber=0;}
  const index=strokeNumber,token=++runToken;
  stepBusy=true;setButtons(false);
  animateLabeled(index,token,()=>{
   stepBusy=false;
   setProgress('已播放第 '+strokeNumber+' 畫／共 '+strokeTotal+' 畫'+(strokeNumber===strokeTotal?'，示範完成。':''));
   setButtons(false);
  });
 }
 function startPractice(){
  if(!writer)return;
  const thisWriter=writer,token=++runToken;
  thisWriter.cancelQuiz();
  thisWriter.hideCharacter({duration:0});
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  mode='practice';strokeNumber=0;stepBusy=false;
  feedback()?.clearConfetti();
  setProgress('請從第1畫開始，依照提示程度練習書寫。');
  setButtons(false);
  thisWriter.quiz({
   leniency:1.2,acceptBackwardsStrokes:false,showHintAfterMisses:false,
   onCorrectStroke:details=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    strokeNumber=details.strokeNum+1;
    feedback()?.playCorrectSound();
    if(strokeNumber<strokeTotal)setProgress('第 '+strokeNumber+' 畫正確！請接著寫第 '+(strokeNumber+1)+' 畫／共 '+strokeTotal+' 畫。');
    renderHints();setButtons(false);
   },
   onMistake:details=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    feedback()?.playWrongSound();
    setProgress('第 '+(details.strokeNum+1)+' 畫還需要調整，請再試一次。寫錯不會跳到下一畫。');
   },
   onComplete:()=>{
    if(token!==runToken||thisWriter!==writer||!isPracticeRoute())return;
    mode='complete';strokeNumber=strokeTotal;clearGuides();
    setProgress('太棒了！「'+characters[activeIndex]+'」共 '+strokeTotal+' 畫全部完成！');
    setButtons(false);
    feedback()?.playApplauseSound();
    feedback()?.launchConfetti();
   }
  });
  renderHints();
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
   if(next!==boardSize){boardSize=next;writer.updateDimensions({width:next,height:next,padding:18});renderHints();}
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

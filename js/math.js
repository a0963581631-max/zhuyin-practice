(()=>{
const {speakText,speakSymbol,speakStrokeNumber,getAudioContext,playCorrectSound,playWrongSound,playApplauseSound,clearConfetti,launchConfetti}=TeachingFeedback;
/* All quantities are whole numbers and each total stays within ten. */
function createShopQuestionPicker(rng=Math.random){
 const foods=[{name:'蘋果',icon:'🍎'},{name:'香蕉',icon:'🍌'},{name:'橘子',icon:'🍊'},{name:'草莓',icon:'🍓'},{name:'雞蛋',icon:'🥚'},{name:'麵包',icon:'🍞'},{name:'水餃',icon:'🥟'},{name:'飯糰',icon:'🍙'},{name:'番茄',icon:'🍅'},{name:'馬鈴薯',icon:'🥔'}];
 // Reversed addends belong to the same group. Keep each mode's unfinished round.
 const pools=new Map();
 let previousKey=null,previousFood=null;
 function shuffle(items){
  for(let i=items.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
 }
 return function(total){
  const mode=total==='mixed'?'mixed':String(Math.max(2,Math.min(10,Math.trunc(Number(total))||10)));
  let pool=pools.get(mode);
  if(!pool||pool.length===0){
   pool=[];
   for(let sum=2;sum<=10;sum++){
    if(mode!=='mixed'&&sum!==Number(mode))continue;
    for(let first=1;first<=Math.floor(sum/2);first++)pool.push({total:sum,first,second:sum-first,key:first+':'+(sum-first)});
   }
   shuffle(pool);pools.set(mode,pool);
  }
  // Avoid repeating the last group at a round boundary when alternatives exist.
  let index=pool.length-1;
  if(pool[index].key===previousKey&&pool.length>1)index=pool.findIndex(q=>q.key!==previousKey);
  const pair=pool.splice(index,1)[0];
  previousKey=pair.key;
  const choices=foods.filter(food=>food.name!==previousFood);
  const food=choices[Math.floor(rng()*choices.length)];previousFood=food.name;
  const taken=rng()<.5?pair.first:pair.second;
  return {total:pair.total,taken,answer:pair.total-taken,food};
 };
}
const makeShopQuestion=createShopQuestionPicker();
function judgeShopAnswer(raw,q){
 const value=String(raw).trim();
 if(!/^[0-9]$/.test(value)) return 'invalid';
 return Number(value)===q.answer?'correct':Number(value)<q.answer?'short':'extra';
}
const ShopSplit=(()=>{
 const $=id=>document.getElementById(id);
 const panel=$('splitShop'),input=$('shopAnswer');
 let question=null,solved=false,completed=0,active=false;
 const added=new Set();
 const drawer=$('shopDrawer'),scene=panel.querySelector('.shop-scene');
 let restoringAnswerFocus=false;
 function setDrawer(open,restoreFocus=false){
  open=Boolean(open&&active&&!solved);
  drawer.classList.toggle('is-open',open);drawer.inert=!open;
  drawer.setAttribute('aria-hidden',String(!open));input.setAttribute('aria-expanded',String(open));
  if(restoreFocus&&!input.disabled){restoringAnswerFocus=true;input.focus({preventScroll:true});restoringAnswerFocus=false;}
 }
 input.addEventListener('click',()=>setDrawer(true));
 input.addEventListener('focus',()=>{if(!restoringAnswerFocus)setDrawer(true);});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();setDrawer(true);$('shopKeypad').querySelector('button').focus();}});
 $('shopDrawerClose').addEventListener('click',()=>setDrawer(false,true));
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&drawer.classList.contains('is-open')){e.preventDefault();setDrawer(false,true);}});

 function feedback(text,kind='neutral'){$('shopFeedback').textContent=text;$('shopFeedback').dataset.kind=kind;}
 function syncEntry(){ $('shopRegisterValue').textContent=input.value||'？'; }
 function showItems(){
   const holder=$('shopItems');holder.replaceChildren();
   for(let i=0;i<question.total;i++){
     const taken=i<question.taken;
     const cell=document.createElement(taken?'span':'button');
     cell.className='shop-item'+(taken?' taken':added.has(i)?' added':'');
     cell.textContent=taken||added.has(i)?question.food.icon:'＋';
     if(taken){cell.setAttribute('role','img');cell.setAttribute('aria-label','已拿的'+question.food.name);}
     else {cell.type='button';cell.disabled=solved;cell.setAttribute('aria-label',(added.has(i)?'拿回':'放入')+'一個'+question.food.name);cell.setAttribute('aria-pressed',String(added.has(i)));cell.onclick=()=>{
       if(!active||solved)return;
       const removing=added.has(i);
       if(removing)added.delete(i);else added.add(i);
       showItems();
       const count=added.size;
       const message=removing?'現在補了'+count+'個':count===question.answer?count+'。我還需要'+count+'個。':String(count);

       speakText(message,.72,true);
     };}
     holder.appendChild(cell);
   }
   $('shopHintCount').textContent='你補了 '+added.size+' 個。';
 }
 function newQuestion(){
   setDrawer(false);
   clearConfetti();if('speechSynthesis' in window) speechSynthesis.cancel();
   question=makeShopQuestion($('shopTotal').value);solved=false;added.clear();
   $('shopWanted').textContent=question.total;$('shopTaken').textContent=question.taken;
   $('shopFoodName').textContent=question.food.name;$('shopFoodEmoji').textContent=question.food.icon;
   input.value='';input.disabled=false;input.removeAttribute('aria-invalid');syncEntry();
   $('shopCheck').disabled=false;$('shopNext').disabled=true;
   $('shopKeypad').querySelectorAll('button').forEach(b=>b.disabled=false);
   $('shopSplitDiagram').hidden=true;
   $('shopDecomposition').hidden=true;$('shopDecomposition').textContent='';
   feedback('想一想，還需要幾個？');showItems();
 }
 function check(){
   if(!active||solved||!question)return;
   const result=judgeShopAnswer(input.value,question);
   if(result==='invalid'){input.setAttribute('aria-invalid','true');feedback('請輸入 0～9 的一個數字，再按確認答案。','retry');input.focus();return;}
   if(result!=='correct'){
     input.setAttribute('aria-invalid','true');playWrongSound();
     feedback(result==='short'?'還不夠喔！可以按「數數看」，再試一次。':'拿得太多了！可以按「數數看」，再試一次。','retry');input.focus();input.select();return;
   }
   setDrawer(false);

   solved=true;completed++;input.removeAttribute('aria-invalid');input.disabled=true;
   $('shopCheck').disabled=true;$('shopKeypad').querySelectorAll('button').forEach(b=>b.disabled=true);
   $('shopNext').disabled=false;$('shopScore').textContent='完成 '+completed+' 題';
   feedback('答對了！再拿 '+question.answer+' 個，就有 '+question.total+' 個！','success');
   $('shopDiagramTotal').textContent=question.total;
   $('shopDiagramTaken').textContent=question.taken;
   $('shopDiagramAnswer').textContent=question.answer;
   $('shopSplitDiagramTitle').textContent=question.total+'可以分成'+question.taken+'和'+question.answer;
   $('shopSplitDiagram').hidden=false;
   $('shopDecomposition').textContent=question.total+' 可以分成 '+question.taken+' 和 '+question.answer;
   $('shopDecomposition').hidden=false;showItems();playCorrectSound();launchConfetti();
   speakText(question.total+'可以分成'+question.taken+'和'+question.answer+'。',.72,true);

 }
 $('shopAnswerForm').addEventListener('submit',e=>{e.preventDefault();check();});
 $('shopKeyCheck').addEventListener('click',check);
 $('shopKeypad').querySelectorAll('[data-shop-digit]').forEach(b=>b.addEventListener('click',()=>{if(solved)return;input.value=b.dataset.shopDigit;input.removeAttribute('aria-invalid');syncEntry();}));
 $('shopErase').addEventListener('click',()=>{if(solved)return;input.value='';input.removeAttribute('aria-invalid');syncEntry();input.focus();});
 input.addEventListener('input',()=>{input.value=input.value.replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/[^0-9]/g,'').slice(0,2);input.removeAttribute('aria-invalid');syncEntry();});
 $('shopTotal').addEventListener('change',newQuestion);
 $('shopNext').addEventListener('click',()=>{newQuestion();$('shopCheck').focus({preventScroll:true});});
 $('shopRead').addEventListener('click',()=>{if(!question)return;speakText('我要'+question.total+'個'+question.food.name+'，拿了'+question.taken+'個，還需要幾個？',.8,true);});
 $('shopHintToggle').addEventListener('click',()=>{const open=$('shopHint').hidden;$('shopHint').hidden=!open;$('shopHintToggle').setAttribute('aria-expanded',String(open));scene.classList.toggle('hint-hidden',!open);});
 return {enter(){active=true;panel.hidden=false;if(!question)newQuestion();},leave(){setDrawer(false);active=false;panel.hidden=true;}};
})();

function createJoinQuestionPicker(rng=Math.random){
 const names=['小睿','小賴','小彥','小勛','小愷','小程'];
 const pools=new Map();let previous=null;
 return function(limit=10){
  limit=Math.max(2,Math.min(10,Math.trunc(Number(limit))||10));
  let pool=pools.get(limit);
  if(!pool||!pool.length){
   pool=[];
   for(let sum=2;sum<=limit;sum++)for(let a=1;a<=Math.floor(sum/2);a++)pool.push({a,b:sum-a,key:a+':'+(sum-a)});
   for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
   pools.set(limit,pool);
  }
  let index=pool.length-1;
  if(pool[index].key===previous&&pool.length>1)index=pool.findIndex(q=>q.key!==previous);
  const pair=pool.splice(index,1)[0];previous=pair.key;
  const a=rng()<.5?pair.a:pair.b,b=pair.a+pair.b-a;
  const first=Math.floor(rng()*names.length),others=names.filter((_,i)=>i!==first);
  const food=rng()<.5?'candy':'cookie';
  return {a,b,total:a+b,nameA:names[first],nameB:others[Math.floor(rng()*others.length)],food,icon:food==='candy'?'🍬':'🍪',unit:food==='candy'?'顆糖果':'片餅乾'};
 };
}
const JoinGame=(()=>{
 const $=id=>document.getElementById(id),panel=$('joinGame'),input=$('joinAnswer');
 const pick=createJoinQuestionPicker();
 let active=false,solved=false,question=null,completed=0,counting=true;
 const collected=new Set();
 const drawer=$('joinDrawer');let restoringFocus=false;
 function syncEntry(){$('joinRegisterValue').textContent=input.value||'？';}
 function setDrawer(open,restore=false){
  open=Boolean(open&&active&&!solved);drawer.classList.toggle('is-open',open);drawer.inert=!open;
  drawer.setAttribute('aria-hidden',String(!open));input.setAttribute('aria-expanded',String(open));
  if(restore&&!input.disabled){restoringFocus=true;input.focus({preventScroll:true});restoringFocus=false;}
 }
 input.addEventListener('click',()=>setDrawer(true));
 input.addEventListener('focus',()=>{if(!restoringFocus)setDrawer(true);});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();setDrawer(true);$('joinKeypad').querySelector('button').focus();}});
 $('joinDrawerClose').addEventListener('click',()=>setDrawer(false,true));
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&drawer.classList.contains('is-open')){e.preventDefault();setDrawer(false,true);}});
 $('joinKeypad').querySelectorAll('[data-join-digit]').forEach(button=>button.addEventListener('click',()=>{
  if(!active||solved)return;
  const digit=button.dataset.joinDigit;
  input.value=input.value==='1'&&digit==='0'?'10':digit;
  input.removeAttribute('aria-invalid');syncEntry();
 }));
 $('joinErase').addEventListener('click',()=>{if(solved)return;input.value='';input.removeAttribute('aria-invalid');syncEntry();});
 $('joinKeyCheck').addEventListener('click',check);

 function feedback(text,kind='neutral'){$('joinFeedback').textContent=text;$('joinFeedback').dataset.kind=kind;}
 function draw(){
  for(const [side,n] of [['A',question.a],['B',question.b]]){
   const holder=$('joinItems'+side);holder.replaceChildren();
   for(let i=0;i<n;i++){
    const key=side+i,used=collected.has(key),button=document.createElement('button');
    button.type='button';button.className='join-treat'+(used?' used':'');button.textContent=question.icon;
    button.disabled=used||solved||!counting;
    button.setAttribute('aria-label',question['name'+side]+'的第'+(i+1)+(question.food==='candy'?'顆糖果':'片餅乾')+(used?'，已放入盤子':'，放進盤子'));
    button.onclick=()=>{
     if(!active||solved||!counting||collected.has(key))return;
     collected.add(key);draw();
     const count=collected.size;
     speakText(count===question.total?count+'。我總共拿到了'+count+question.unit+'。':String(count),.72,true);
    };
    holder.appendChild(button);
   }
  }
  const plate=$('joinPlateItems');plate.replaceChildren();
  for(const key of collected){const item=document.createElement('span');item.textContent=question.icon;item.className=key[0]==='B'?'from-b':'from-a';item.setAttribute('aria-hidden','true');plate.appendChild(item);}
  $('joinPlateEmpty').hidden=collected.size>0;
  plate.setAttribute('aria-label','盤子裡有'+collected.size+question.unit);
 }
 function next(){
  setDrawer(false);
  if('speechSynthesis' in window)speechSynthesis.cancel();clearConfetti();
  question=pick($('joinLimit').value);solved=false;collected.clear();
  $('joinNameA').textContent=question.nameA;$('joinNameB').textContent=question.nameB;
  $('joinCountA').textContent=question.a;$('joinCountB').textContent=question.b;
  panel.querySelectorAll('.join-unit').forEach(e=>e.textContent=question.unit);
  $('joinAnswerUnit').textContent=question.unit;
  input.value='';syncEntry();input.disabled=false;input.removeAttribute('aria-invalid');
  $('joinCheck').disabled=false;$('joinReset').disabled=false;$('joinResult').hidden=true;
  feedback('兩位同學給你的點心，合起來有幾個？');draw();
 }
 function check(){
  if(!active||solved)return;
  const value=input.value.trim();
  if(!/^(?:[0-9]|10)$/.test(value)){input.setAttribute('aria-invalid','true');feedback('請填入 0～10 的數字。','retry');input.focus();return;}
  if(Number(value)!==question.total){input.setAttribute('aria-invalid','true');playWrongSound();feedback(Number(value)<question.total?'還有點心沒有數到喔！再把兩邊一起數數看。':'數得太多了，再把兩邊一起數數看。','retry');input.focus();input.select();return;}
  setDrawer(false);
  solved=true;completed++;input.disabled=true;input.removeAttribute('aria-invalid');$('joinCheck').disabled=true;$('joinReset').disabled=true;
  $('joinScore').textContent='完成 '+completed+' 題';
  const sentence=question.a+' 和 '+question.b+' 合起來是 '+question.total;
  $('joinDiagramA').textContent=question.a;$('joinDiagramB').textContent=question.b;$('joinDiagramTotal').textContent=question.total;
  $('joinDiagramTitle').textContent=sentence;$('joinResultSentence').textContent=sentence;$('joinResult').hidden=false;
  feedback('答對了！你總共拿到了 '+question.total+question.unit+'！','success');
  draw();playCorrectSound();launchConfetti();speakText(sentence+'。',.72,true);
 }
 $('joinAnswerForm').addEventListener('submit',e=>{e.preventDefault();check();});
 input.addEventListener('input',()=>{input.value=input.value.replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/[^0-9]/g,'').slice(0,2);input.removeAttribute('aria-invalid');syncEntry();});
 $('joinNext').addEventListener('click',()=>{next();$('joinCheck').focus({preventScroll:true});});
 $('joinLimit').addEventListener('change',next);
 $('joinRead').addEventListener('click',()=>{if(!active||!question)return;speakText(question.nameA+'給你'+question.a+question.unit+'，'+question.nameB+'給你'+question.b+question.unit+'。我總共拿到了幾'+(question.food==='candy'?'顆糖果':'片餅乾')+'？',.72,true);});
 $('joinCountToggle').addEventListener('click',()=>{counting=!counting;$('joinCounting').hidden=!counting;$('joinCountToggle').setAttribute('aria-expanded',String(counting));draw();});
 $('joinReset').addEventListener('click',()=>{if(solved)return;if('speechSynthesis' in window)speechSynthesis.cancel();collected.clear();draw();});
 return {enter(){active=true;panel.hidden=false;if(!question)next();},leave(){setDrawer(false);active=false;panel.hidden=true;}};
})();



window.MathLessons={enter(hash){if(hash==="math-1-parts-split")ShopSplit.enter();if(hash==="math-1-parts-join")JoinGame.enter();},leave(){ShopSplit.leave();JoinGame.leave();}};
})();

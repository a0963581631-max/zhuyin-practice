(()=>{
const $=id=>document.getElementById(id),route='#chinese-1-first-pretty-quiz';
const questions=[
 {prompt:'誰的鼻子長？',answer:'elephant',type:'animal',slide:0,skill:'動物與特徵',hint:'想想課文：哪一隻動物有長長的鼻子？'},
 {prompt:'誰長得壯？',answer:'hippo',type:'animal',slide:1,skill:'動物與特徵',hint:'想想課文裡舉起槓鈴的動物。'},
 {prompt:'老虎的毛皮是什麼顏色？',answer:'yellow',type:'color',slide:2,skill:'顏色特徵',hint:'回想老虎身上大部分的毛皮顏色，不是黑色條紋。'},
 {prompt:'蝴蝶的「花衣裳」在哪裡？請點一點。',answer:'wings',type:'parts',slide:3,skill:'花衣裳的意思',hint:'「花衣裳」是在說蝴蝶身上有好多顏色和花紋的地方。'},
 {prompt:'哪一張是「笑一笑」？',answer:'happy',type:'face',slide:4,skill:'表情與詞意',hint:'看看嘴巴和眼睛，哪一張臉看起來很開心？'},
 {prompt:'換一隻蝴蝶，牠的「花衣裳」在哪裡？請點一點。',answer:'wings',type:'transfer',slide:3,skill:'換圖理解（進階）',hint:'這隻蝴蝶的顏色不同，也有花紋。找找看牠的翅膀。'}
];
const names={elephant:'大象',hippo:'河馬',tiger:'老虎',yellow:'黃色',blue:'藍色',green:'綠色',happy:'笑臉',sad:'哭臉',neutral:'平靜的臉',wings:'翅膀',body:'身體',head:'頭部'};
let items=[],records=[],current=0,choiceCount=2,autoRead=true,session=false,speechId=0;
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function stop(){speechId++;if('speechSynthesis'in window)speechSynthesis.cancel()}
function speak(text){stop();const token=speechId;if(!('speechSynthesis'in window)){$('quizFeedback').textContent='此裝置不支援語音，請由老師念題目。';return;}const u=new SpeechSynthesisUtterance(text),v=speechSynthesis.getVoices().filter(v=>/^zh|^cmn/i.test(v.lang)).sort((a,b)=>(/TW/i.test(b.lang)?1:0)-(/TW/i.test(a.lang)?1:0))[0];if(v)u.voice=v;u.lang=v?v.lang:'zh-TW';u.rate=.7;u.onerror=e=>{if(token===speechId&&e.error!=='canceled'&&e.error!=='interrupted'&&location.hash===route)$('quizFeedback').textContent='語音無法播放，可由老師念題目。'};speechSynthesis.speak(u)}
function currentQ(){return questions[items[current]]}function record(){return records[current]}
function svg(content,view='0 0 300 260'){return `<svg viewBox="${view}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`}
function choiceArt(key){
 if(['elephant','hippo','tiger'].includes(key)){const i={elephant:0,hippo:1,tiger:2}[key];const artWidth={elephant:1090,hippo:1150,tiger:1100}[key];return svg(`<defs><clipPath id="quiz-art-${key}" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="${artWidth}" height="1086"/></clipPath></defs><image href="${window.prettyLessonSlides[i].src}" x="0" y="0" width="1448" height="1086" clip-path="url(#quiz-art-${key})"/>`,`0 0 ${artWidth} 1086`)}
 if(['yellow','blue','green'].includes(key))return svg(`<rect x="35" y="20" width="230" height="220" rx="38" fill="${{yellow:'#f4ca32',blue:'#448cd4',green:'#50a568'}[key]}"/>`);
 return svg(`<circle cx="150" cy="130" r="100" fill="#ffe2a8" stroke="#ab8059" stroke-width="5"/><circle cx="113" cy="108" r="8" fill="#433931"/><circle cx="187" cy="108" r="8" fill="#433931"/><path d="${key==='happy'?'M102 155 Q150 218 198 155':key==='sad'?'M102 190 Q150 135 198 190':'M106 171 H194'}" fill="none" stroke="#433931" stroke-width="8" stroke-linecap="round"/>${key==='sad'?'<path d="M193 128 Q173 155 193 161 Q215 155 193 128" fill="#56a5d6"/>':''}`)
}
function butterfly(transfer){const c=transfer?['#f5ad56','#8acfc2','#f7dc69']:['#aea1e6','#86cceb','#f4a2c2'];const headOption=choiceCount===3;
 const attr=(id,label)=>`class="quiz-hotspot" role="button" tabindex="0" data-answer="${id}" aria-label="${label}"`;
 const pattern=transfer?'<path d="M60 115 Q140 95 212 164 M65 148 Q148 133 209 185 M285 166 Q345 100 425 118 M287 190 Q361 130 430 152" fill="none" stroke="#7564a9" stroke-width="15"/>':'<g fill="#f3dd6b"><circle cx="113" cy="111" r="24"/><circle cx="383" cy="112" r="24"/><circle cx="136" cy="263" r="20"/><circle cx="360" cy="263" r="20"/></g>';
 return `<svg class="quiz-butterfly" viewBox="0 0 500 360" xmlns="http://www.w3.org/2000/svg" aria-label="請點選蝴蝶的部位">
 <path d="M240 113 Q207 12 183 39 M260 113 Q293 12 318 39" stroke="#715844" stroke-width="8" fill="none"/>
 <g ${attr('wings','蝴蝶的翅膀')}><path d="M235 185 C190 20 26 10 42 145 C48 199 123 215 228 211 C73 161 65 341 164 319 C215 307 241 242 235 185" fill="${c[0]}"/><path d="M265 185 C310 20 474 10 458 145 C452 199 377 215 272 211 C427 161 435 341 336 319 C285 307 259 242 265 185" fill="${c[1]}"/>${pattern}<g fill="${c[2]}"><circle cx="94" cy="165" r="13"/><circle cx="405" cy="166" r="13"/><circle cx="174" cy="106" r="10"/><circle cx="326" cy="106" r="10"/></g></g>
 <g ${attr('body','蝴蝶的身體')}><ellipse cx="250" cy="220" rx="22" ry="83" fill="#bf8655"/>${headOption?'':'<circle cx="250" cy="121" r="32" fill="#e6b678"/>'}</g>
 ${headOption?`<g ${attr('head','蝴蝶的頭部')}><circle cx="250" cy="121" r="32" fill="#e6b678"/></g>`:''}
 <g pointer-events="none" fill="#40352d"><circle cx="239" cy="116" r="4"/><circle cx="261" cy="116" r="4"/><path d="M240 133 Q250 143 260 133" fill="none" stroke="#40352d" stroke-width="3"/></g></svg>`;
}
function renderAnswers(){const q=currentQ(),box=$('quizAnswers');box.innerHTML='';box.style.setProperty('--quiz-cols',choiceCount);
 if(q.type==='parts'||q.type==='transfer'){box.innerHTML=butterfly(q.type==='transfer');box.querySelectorAll('[data-answer]').forEach(el=>{el.addEventListener('click',()=>answer(el.dataset.answer,el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();answer(el.dataset.answer,el)}})});return;}
 const pool=q.type==='animal'?['elephant','hippo','tiger']:q.type==='color'?['yellow','blue','green']:['happy','sad','neutral'];const keys=shuffle([q.answer,...shuffle(pool.filter(k=>k!==q.answer)).slice(0,choiceCount-1)]);
 for(const key of keys){const btn=document.createElement('button');btn.type='button';btn.className='quiz-answer';btn.setAttribute('aria-label',names[key]);btn.innerHTML=choiceArt(key);btn.addEventListener('click',()=>answer(key,btn));box.append(btn)}
}
function helpCount(r){return r.replays+r.hints+r.reviews}
function answer(key,el){const r=record(),q=currentQ();if(r.solved)return;stop();const correct=key===q.answer;r.attempts.push({answer:names[key],correct,assistance:helpCount(r)});if(r.attempts.length===1)r.firstIndependent=correct&&helpCount(r)===0;
 if(correct){r.solved=true;r.outcome=helpCount(r)===0?(r.attempts.length===1?'第一次獨立答對':'再選後答對（無提示）'):(r.hints+r.reviews>0?'提示／回看後答對':'重聽後答對');el.classList.add('correct');$('quizFeedback').textContent=['對了，大象的鼻子長。','對了，課文說河馬長得壯。','對了，老虎的毛皮是黃色。','對了，花衣裳是在形容蝴蝶有花紋的翅膀。','對了，這是開心的笑臉。','對了，換了顏色和花紋，花衣裳一樣是在說翅膀。'][items[current]];$('quizNext').hidden=false;$('quizSkip').hidden=true;$('quizNext').textContent=current===items.length-1?'查看學習紀錄 →':'下一題 →';}
 else{el.classList.add('wrong');$('quizFeedback').textContent='我們再想一想。可以再聽一次、看提示，或回看課文。';}
}
function showQuestion(){stop();window.dispatchEvent(new Event('readingimagechange'));$('quizProgress').textContent=`第 ${current+1} 題／共 ${items.length} 題`;$('quizLevel').textContent=items[current]===5?'進階題':'基本題';$('quizQuestion').textContent=currentQ().prompt;$('quizHintText').hidden=true;$('quizHintText').textContent='';$('quizFeedback').textContent='';$('quizNext').hidden=true;$('quizSkip').hidden=false;renderAnswers();$('quizQuestion').focus({preventScroll:true});if(autoRead)speak(currentQ().prompt)}
function start(){stop();choiceCount=Number($('quizChoiceCount').value);autoRead=$('quizAutoRead').checked;items=$('quizAdvanced').checked?[0,1,2,3,4,5]:[0,1,2,3,4];records=items.map(()=>({attempts:[],replays:0,hints:0,reviews:0,solved:false,firstIndependent:false,outcome:'未作答'}));current=0;session=true;$('quizSetup').hidden=true;$('quizResults').hidden=true;$('quizPlay').hidden=false;showQuestion()}
function finish(){stop();window.dispatchEvent(new Event('readingimagechange'));$('quizPlay').hidden=true;$('quizResults').hidden=false;const basic=records.slice(0,5);$('quizSummary').textContent=`基本題：${basic.filter(r=>r.firstIndependent).length}／5 題第一次獨立答對；${basic.filter(r=>r.solved).length}／5 題最後答對。`;
 const table=document.createElement('table');table.innerHTML='<thead><tr><th>題目／理解重點</th><th>第一次作答</th><th>重聽／提示／回看</th><th>本次表現</th></tr></thead>';const tbody=document.createElement('tbody');records.forEach((r,i)=>{const tr=document.createElement('tr');const first=r.attempts[0];for(const value of [`${i+1}. ${questions[items[i]].skill}`,first?`${first.answer}（${first.correct?'答對':'未答對'}${first.assistance?'，已使用協助':''}）`:'未作答',`${r.replays}／${r.hints}／${r.reviews}`,r.outcome]){const td=document.createElement('td');td.textContent=value;tr.append(td)}tbody.append(tr)});table.append(tbody);$('quizResultTable').replaceChildren(table);$('quizResults').querySelector('h2').focus({preventScroll:true})}
function next(){if(current===items.length-1){finish();return;}current++;showQuestion()}
$('quizStart').onclick=start;$('quizNext').onclick=next;$('quizSkip').onclick=()=>{record().outcome=record().attempts.length?'嘗試後跳過':'未作答／跳過';next()};
$('quizRead').onclick=()=>{if(!record().solved)record().replays++;speak(currentQ().prompt)};
$('quizHint').onclick=()=>{if(!record().solved)record().hints++;$('quizHintText').hidden=false;$('quizHintText').textContent=currentQ().hint;speak(currentQ().hint)};
$('quizReview').onclick=()=>{stop();if(!record().solved)record().reviews++;const slide=window.prettyLessonSlides[currentQ().slide];$('quizReviewImage').src=slide.src;$('quizReviewImage').alt=slide.alt;$('quizReviewDialog').showModal()};
$('quizReviewClose').onclick=()=>$('quizReviewDialog').close();$('quizReviewDialog').addEventListener('click',e=>{if(e.target===$('quizReviewDialog'))$('quizReviewDialog').close()});
$('quizRestart').onclick=()=>{stop();session=false;$('quizResults').hidden=true;$('quizPlay').hidden=true;$('quizSetup').hidden=false;window.dispatchEvent(new Event('annotationcontextchange'))};
window.addEventListener('hashchange',()=>{stop();if($('quizReviewDialog').open)$('quizReviewDialog').close();});
})();

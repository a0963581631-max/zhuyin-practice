// Load each script once, retaining successful dependencies when retrying a failed request.
const scriptLoads=new Map(),styleLoads=new Map();
function loadScript(path){
 if(scriptLoads.has(path))return scriptLoads.get(path);
 const task=new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=path;el.async=false;el.onload=()=>resolve();el.onerror=()=>{scriptLoads.delete(path);el.remove();reject(new Error(path));};document.head.append(el);});
 scriptLoads.set(path,task);return task;
}
function loadStyle(path){
 if(styleLoads.has(path))return styleLoads.get(path);
 const task=new Promise((resolve,reject)=>{const el=document.createElement('link');el.rel='stylesheet';el.href=path;el.onload=()=>resolve();el.onerror=()=>{styleLoads.delete(path);el.remove();reject(new Error(path));};document.head.append(el);});styleLoads.set(path,task);return task;
}
async function ensureTeacherTools(){await loadScript('teacher-view-tools.js');await loadScript('js/teacher-tools.js');}
async function loadBopomofo(){
 await Promise.all([loadStyle('teaching-order.css'),loadStyle('vocab-image-upload.css'),loadScript('js/feedback.js'),loadScript('teaching-order.js?v=2'),loadScript('compound-grid-practice.js'),loadScript('vocab-image-upload.js')]);
 await loadScript('js/bopomofo.js');
}
async function loadMath(){await loadScript('js/feedback.js');await loadScript('js/math.js');}
async function loadReading(){await Promise.all([loadScript('js/reading-data.js'),loadScript('lesson-scissors-rock-paper.js'),loadScript('lesson-tadpole-mom.js')]);await loadScript('js/reading.js');}
async function loadQuiz(){await loadScript('js/reading-data.js');await loadScript('js/reading-quiz.js');}
let navigationEpoch=0;
const loadStatus=document.createElement('div');loadStatus.id='lessonLoadStatus';loadStatus.hidden=true;loadStatus.setAttribute('role','status');loadStatus.style.cssText='position:fixed;bottom:12px;left:12px;right:100px;z-index:11000;padding:12px;background:#f7fcfd;border:2px solid #c7e1e7;border-radius:12px;color:#214858;';
const loadMessage=document.createElement('span'),retry=document.createElement('button');retry.type='button';retry.textContent='重新載入';retry.style.marginLeft='12px';retry.onclick=()=>showPortalPage();loadStatus.append(loadMessage,retry);document.body.append(loadStatus);
function showLoad(text,failed=false){loadMessage.textContent=text;retry.hidden=!failed;loadStatus.hidden=false;}
function hideLoad(){loadStatus.hidden=true;}
async function showPortalPage(){
  const epoch=++navigationEpoch;
  window.Bopomofo?.leave();window.MathLessons?.leave();
  const hash=location.hash.slice(1);
  const chineseTermMatch=/^chinese-1-(first|second)$/.exec(hash);
  const isPretty=hash==='chinese-1-first-pretty';
  const isScissors=hash==='chinese-1-first-scissors-rock-paper';
  const isTadpole=hash==='chinese-1-first-tadpole-mom';
  const isReading=isPretty||isScissors||isTadpole;
  const chineseGradeMatch=/^chinese-([1-6])$/.exec(hash);
  const gradeMatch=/^math-([1-6])$/.exec(hash);
  const topicMatch=/^math-1-parts-(split|join|practice)$/.exec(hash);
  const topicTitles={split:'分',join:'合',practice:'綜合練習'};
  const route=hash==='chinese-1-first-pretty-quiz'?'chineseQuiz':isReading?'chineseReading':chineseTermMatch?'chineseLessons':topicMatch?'mathPartsTopic':hash==='math-1-parts'?'mathParts':hash==='math-1-count30'?'mathCount30':gradeMatch?'mathGrade':chineseGradeMatch?'chineseGrade':(['home','learn','help','math','chinese'].includes(hash)?hash:'home');
  if(topicMatch) document.getElementById('mathPartsTopicTitle').textContent=topicTitles[topicMatch[1]];
  const isShop=hash==='math-1-parts-split';
  document.body.classList.toggle('shop-active',isShop);
  const isJoin=hash==='math-1-parts-join';
  document.body.classList.toggle('join-active',isJoin);
  document.getElementById('mathTopicPlaceholder').hidden=isShop||isJoin;
  if(chineseGradeMatch){
    document.getElementById('chineseGradeTitle').textContent=chineseGradeMatch[1]+'年級國語科';
    document.getElementById('chineseTerms').hidden=chineseGradeMatch[1]!=='1';
    document.getElementById('chineseGradePlaceholder').hidden=chineseGradeMatch[1]==='1';
  }
  if(chineseTermMatch){
    const first=chineseTermMatch[1]==='first';
    document.getElementById('chineseLessonsTitle').textContent='一年級'+(first?'上學期':'下學期')+'｜課文選擇';
    document.getElementById('chineseFirstLessons').hidden=!first;
    document.getElementById('chineseSecondLessons').hidden=first;
  }
  document.body.classList.toggle('reading-active',isReading);
  if(isReading){
    document.querySelector('#chineseReadingPage h1').textContent=(isTadpole?'小蝌蚪找媽媽':isScissors?'剪刀石頭布':'好漂亮')+'｜課文理解';
    document.querySelector('#chineseReadingPage .reading-quiz').hidden=!isPretty;
  }
  if(gradeMatch){
    document.getElementById('mathGradeTitle').textContent=gradeMatch[1]+'年級數學';
    document.getElementById('gradeOneUnits').hidden=gradeMatch[1]!=='1';
    document.getElementById('otherGradeContent').hidden=gradeMatch[1]==='1';
  }
  const sockFrame=document.getElementById('sockLaundryFrame');
  if(route!=='mathCount30'&&sockFrame&&sockFrame.contentWindow){sockFrame.contentWindow.postMessage('sockGamePause',location.origin);}

  if ('speechSynthesis' in window) speechSynthesis.cancel();

  document.getElementById('helpBackdrop').classList.remove('show');
  window.TeachingFeedback?.clearConfetti();

  const pages={chineseQuiz:document.getElementById('chineseQuizPage'),chineseReading:document.getElementById('chineseReadingPage'),chineseLessons:document.getElementById('chineseLessonsPage'),chinese:document.getElementById('chinesePage'),chineseGrade:document.getElementById('chineseGradePage'),home:document.getElementById('homePage'),learn:document.getElementById('learningPage'),help:document.getElementById('guidePage'),math:document.getElementById('mathPage'),mathGrade:document.getElementById('mathGradePage'),mathCount30:document.getElementById('mathCount30Page'),mathParts:document.getElementById('mathPartsPage'),mathPartsTopic:document.getElementById('mathPartsTopicPage')};
  for(const [name,page] of Object.entries(pages)) page.hidden=name!==route;
  document.getElementById('helpBtn').hidden=route!=='learn';
  document.body.classList.toggle('learn-active',route==='learn');
  document.querySelector('.portal-links').hidden=route==='learn';
  document.querySelectorAll('[data-route]').forEach(a=>{
    if(a.dataset.route===route) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  document.title='教學互動學習網站｜'+(hash==='chinese-1-first-pretty-quiz'?'好漂亮｜小測驗':isTadpole?'小蝌蚪找媽媽｜課文理解':isScissors?'剪刀石頭布｜課文理解':isPretty?'好漂亮｜課文理解':chineseTermMatch?'一年級'+(chineseTermMatch[1]==='first'?'上學期':'下學期')+'｜課文選擇':topicMatch?'1年級數學・分與合・'+topicTitles[topicMatch[1]]:gradeMatch?gradeMatch[1]+'年級數學':chineseGradeMatch?chineseGradeMatch[1]+'年級國語科':{chinese:'國語科',home:'首頁',learn:'注音學習',help:'幫助',math:'數學',mathParts:'1年級數學・分與合',mathCount30:'1年級數學・數到30'}[route]);
  window.scrollTo(0,0);
  (pages[route].querySelector('h1') || pages[route].querySelector('a')).focus({preventScroll:true});
  const page=pages[route];
  const teacher=route!=='home'&&route!=='help';
  page.inert=true;
  try{
    if(teacher){showLoad('教材載入中……');await ensureTeacherTools();}
    if(epoch!==navigationEpoch)return;
    if(route==='learn')await loadBopomofo();
    if(isShop||isJoin)await loadMath();
    if(isReading)await loadReading();
    if(route==='chineseQuiz')await loadQuiz();
    if(epoch!==navigationEpoch)return;
    page.inert=false;hideLoad();
    if(route==='learn')Bopomofo.enter();
    if(isShop||isJoin)MathLessons.enter(hash);
    if(route==='mathCount30'&&!sockFrame.getAttribute('src'))sockFrame.src=sockFrame.dataset.src;
  }catch(error){
    if(epoch!==navigationEpoch)return;
    page.inert=true;showLoad('教材未成功載入，請確認網路後再試一次。',true);
    console.error('Lesson load failed',error);
  }
}
window.addEventListener('hashchange',showPortalPage);
showPortalPage();

(()=>{
const prettySlides=window.prettyLessonSlides;
let slides=prettySlides,index=0;
const newLesson=window.scissorsRockPaperLesson;
const tadpoleLesson=window.tadpoleMomLesson;
const readingRoutes=['#chinese-1-first-pretty',newLesson.route,tadpoleLesson.route];
const isReadingRoute=()=>readingRoutes.includes(location.hash);
// Decode the current picture first and warm only its immediate successor.
const warmedLessonImages=new Set();let warmingLessonImages=false;
async function warmLessonImages(){
 if(warmingLessonImages||!isReadingRoute()||document.hidden)return;
 warmingLessonImages=true;const currentSlides=slides,currentIndex=index;
 try{
  for(const n of [currentIndex,currentIndex+1]){
   if(document.hidden||!isReadingRoute()||slides!==currentSlides||index!==currentIndex)break;
   if(n>=currentSlides.length||warmedLessonImages.has(currentSlides[n].src))continue;
   const ok=await new Promise(resolve=>{const card=new Image();card.decoding='async';card.fetchPriority='low';card.onload=()=>resolve(true);card.onerror=()=>resolve(false);card.src=currentSlides[n].src;});
   if(ok)warmedLessonImages.add(currentSlides[n].src);
  }
 }finally{warmingLessonImages=false;if(slides!==currentSlides||index!==currentIndex)warmLessonImages();}
}
window.addEventListener('hashchange',warmLessonImages);
document.addEventListener('visibilitychange',warmLessonImages);
const image=document.getElementById('prettyImage'),prev=document.getElementById('prettyPrev'),next=document.getElementById('prettyNext'),position=document.getElementById('prettyPosition');
function draw(){image.fetchPriority='high';image.src=slides[index].src;image.alt=slides[index].alt;prev.disabled=index===0;next.disabled=index===slides.length-1;position.textContent=(index+1)+' / '+slides.length;window.dispatchEvent(new Event('readingimagechange'));}
function move(delta){stopReading();const target=Math.max(0,Math.min(slides.length-1,index+delta));if(target===index)return;index=target;draw();}
prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
function fit(){if(!isReadingRoute())return;document.body.style.setProperty('--reading-nav-bottom',document.body.classList.contains('reading-fullscreen')?'0px':Math.ceil(document.querySelector('.portal-nav').getBoundingClientRect().bottom)+'px');}
window.addEventListener('resize',fit);window.addEventListener('hashchange',()=>{stopReading();if(isReadingRoute()){selectLesson();draw();requestAnimationFrame(fit);warmLessonImages();}});
window.addEventListener('keydown',e=>{if(!isReadingRoute()||e.altKey||e.ctrlKey||e.metaKey)return;if(e.composedPath().some(n=>n.tagName==='INPUT'||n.tagName==='TEXTAREA'||n.tagName==='SELECT'||n.isContentEditable))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});

const listen=document.getElementById('prettyListen'),audioStatus=document.getElementById('prettyAudioStatus');
let reading=false,speechToken=0;
// Word groups keep connected pronunciation when a voice offers no boundary events.
const prettyReadingGroups=[['大象','鼻子長'],['河馬','長得壯'],['老虎','毛皮黃'],['蝴蝶','花衣裳'],['笑一笑','好漂亮']];
// Original picture coordinates, one rectangle per printed syllable, including tone marks.
const prettySyllableRects=[
 [[1170,55,1385,240],[1170,255,1385,447],[1170,465,1385,645],[1170,665,1385,820],[1170,837,1385,1025]],
 [[1200,52,1385,216],[1200,245,1385,410],[1200,436,1385,602],[1200,625,1385,805],[1200,827,1385,1024]],
 [[1180,50,1390,228],[1180,255,1390,425],[1180,450,1390,625],[1180,648,1390,817],[1180,839,1390,1040]],
 [[1195,42,1395,214],[1195,235,1395,427],[1195,446,1395,629],[1195,657,1395,814],[1195,835,1395,1047]],
 [[1290,87,1394,298],[1290,320,1394,533],[1290,552,1394,780],[1095,87,1220,298],[1095,320,1220,533],[1095,552,1220,780]]
];
let readingGroups=prettyReadingGroups,syllableRects=prettySyllableRects,canvasWidth=1448,canvasHeight=1086;
const highlight=document.getElementById('prettyHighlight'),highlightContext=highlight.getContext('2d');
const sourceCanvas=document.createElement('canvas');sourceCanvas.width=canvasWidth;sourceCanvas.height=canvasHeight;
const sourceContext=sourceCanvas.getContext('2d',{willReadFrequently:true});
let maskIndex=-1,sourcePixels=null,selectedSyllables=[];
const syllablePatches=new Map();
function selectLesson(){
 const selected=location.hash===tadpoleLesson.route?tadpoleLesson:location.hash===newLesson.route?newLesson:null;
 slides=selected?selected.slides:prettySlides;
 readingGroups=selected?selected.groups:prettyReadingGroups;
 syllableRects=selected?selected.syllableRects:prettySyllableRects;
 canvasWidth=selected?selected.width:1448;canvasHeight=selected?selected.height:1086;
 highlight.width=sourceCanvas.width=canvasWidth;highlight.height=sourceCanvas.height=canvasHeight;
 index=0;maskIndex=-1;sourcePixels=null;selectedSyllables=[];syllablePatches.clear();
}
function clearHighlight(){selectedSyllables=[];highlightContext.clearRect(0,0,canvasWidth,canvasHeight);}
function markSyllables(indices){
 selectedSyllables=indices;highlightContext.clearRect(0,0,canvasWidth,canvasHeight);
 if(!indices.length||!image.complete||!image.naturalWidth)return;
 if(maskIndex!==index){syllablePatches.clear();sourceContext.clearRect(0,0,canvasWidth,canvasHeight);sourceContext.drawImage(image,0,0,canvasWidth,canvasHeight);sourcePixels=sourceContext.getImageData(0,0,canvasWidth,canvasHeight).data;maskIndex=index;}
 for(const number of indices){const rect=syllableRects[index][number];if(!rect)continue;const [x,y,right,bottom]=rect,w=right-x,h=bottom-y;let patch=syllablePatches.get(number);
  if(!patch){patch=highlightContext.createImageData(w,h);
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){const src=((y+py)*canvasWidth+x+px)*4,r=sourcePixels[src],g=sourcePixels[src+1],b=sourcePixels[src+2];
   if(Math.max(r,g,b)<180&&Math.max(r,g,b)-Math.min(r,g,b)<65){const dst=(py*w+px)*4;patch.data[dst]=220;patch.data[dst+1]=20;patch.data[dst+2]=35;patch.data[dst+3]=255;}}
   syllablePatches.set(number,patch);
  }
  highlightContext.putImageData(patch,x,y);
 }
}
image.addEventListener('load',()=>{
 maskIndex=-1;syllablePatches.clear();if(reading)markSyllables(selectedSyllables);
 warmLessonImages();
});
function resetListen(keepHighlight=false){reading=false;listen.textContent='🔊 聆聽課文';listen.setAttribute('aria-pressed','false');if(!keepHighlight)clearHighlight();}
function stopReading(){speechToken++;if('speechSynthesis' in window)window.speechSynthesis.cancel();resetListen();audioStatus.textContent='';}
function chooseVoice(){const voices=window.speechSynthesis.getVoices();const chinese=voices.filter(v=>/^zh|^cmn/i.test(v.lang));return chinese.sort((a,b)=>score(b)-score(a))[0];function score(v){return (/^(zh-TW|cmn-TW)$/i.test(v.lang)?100:0)+(/natural|neural|online|自然/i.test(v.name)?20:0)+(/zh/i.test(v.lang)?5:0);}}
listen.addEventListener('click',()=>{
 if(reading){stopReading();return;}
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){audioStatus.textContent='此瀏覽器不支援朗讀，請改用支援語音的瀏覽器。';return;}
 stopReading();const token=speechToken,voice=chooseVoice(),groups=readingGroups[index];
 reading=true;listen.textContent='■ 停止朗讀';listen.setAttribute('aria-pressed','true');
 function readGroup(groupNumber,offset){
  if(token!==speechToken)return;if(groupNumber>=groups.length){resetListen(true);return;}
  const text=groups[groupNumber],utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=voice?voice.lang:'zh-TW';if(voice)utterance.voice=voice;utterance.rate=.65;utterance.pitch=1;utterance.volume=1;
  let reached=-1,advanceTimer=null,ended=false;
  function showThrough(n){if(token!==speechToken||ended)return;reached=Math.max(reached,Math.min(n,text.length-1));markSyllables(Array.from({length:reached+1},(_,i)=>offset+i));}
  // Boundary events are authoritative. Voices without character boundaries use
  // a slow, approximate progression while retaining natural phrase speech.
  function estimateNext(){clearTimeout(advanceTimer);if(reached>=text.length-1)return;advanceTimer=setTimeout(()=>{if(token!==speechToken||ended)return;showThrough(reached+1);estimateNext();},650);}
  utterance.onstart=()=>{if(token!==speechToken)return;clearHighlight();showThrough(0);estimateNext();};
  utterance.onboundary=e=>{
   if(token!==speechToken||ended||e.name==='sentence'||!Number.isInteger(e.charIndex)||e.charIndex<0||e.charIndex>=text.length)return;
   // Do not highlight charLength characters at once: some engines report a whole phrase.
   showThrough(e.charIndex);estimateNext();
  };
  utterance.onend=()=>{
   clearTimeout(advanceTimer);if(token!==speechToken)return;
   showThrough(text.length-1);ended=true;
   // Keep the completed phrase red during the comma pause, then clear on next onstart.
   if(groupNumber+1>=groups.length){resetListen(true);return;}
   setTimeout(()=>{if(token===speechToken)readGroup(groupNumber+1,offset+text.length);},350);
  };
  utterance.onerror=e=>{ended=true;clearTimeout(advanceTimer);if(token!==speechToken)return;resetListen();if(e.error!=='interrupted'&&e.error!=='canceled')audioStatus.textContent='目前無法播放語音，請確認裝置的中文語音與音量後再試。';};
  window.speechSynthesis.speak(utterance);
 }
 readGroup(0,0);
});
if('speechSynthesis' in window)window.speechSynthesis.getVoices();

function syncReadingFullscreen(){document.body.classList.toggle('reading-fullscreen',isReadingRoute()&&!!document.fullscreenElement);requestAnimationFrame(fit);}
document.addEventListener('fullscreenchange',syncReadingFullscreen);
window.addEventListener('hashchange',syncReadingFullscreen);
syncReadingFullscreen();
window.addEventListener('pagehide',stopReading);
if(isReadingRoute()){selectLesson();draw();requestAnimationFrame(fit);}
warmLessonImages();
})();

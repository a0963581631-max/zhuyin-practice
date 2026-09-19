async function selectSymbol(sym){
clearConfetti();
currentSymbol=sym;components=Array.from(sym);componentIndex=0;
bigSymbol.textContent=sym;
document.querySelectorAll(".symbol").forEach(b=>b.classList.toggle("active",b.dataset.symbol===sym));
updateNavigationButtons();
if(vocabBackdrop.classList.contains("show")) renderVocabularyModal();
speakSymbol(sym);
await loadComponent(0,true);
}
async function goToPreviousSymbol(){
clearConfetti();
const index=navigationOrder.indexOf(currentSymbol);
if(index>0) await selectSymbol(navigationOrder[index-1]);
}
async function goToNextSymbol(){
clearConfetti();
const index=navigationOrder.indexOf(currentSymbol);
if(index>=0&&index<navigationOrder.length-1) await selectSymbol(navigationOrder[index+1]);
}
function animateStroke(i,done){
if(!strokes[i]){done&&done();return;}
speakStrokeNumber(i+1);
const start=performance.now(),ms=duration();
function frame(now){
const p=Math.min(1,(now-start)/ms);
render(strokes[i],p);
if(p<1) raf=requestAnimationFrame(frame);
else{
strokeIndex=i+1;render();renderPracticeOverlay();updateProgress();
done&&done();
}
}
raf=requestAnimationFrame(frame);
}
function playCurrent(){
closeVocab(false);clearConfetti();
if(!strokes.length||playing) return;
mode="play";updateModeUI();clearStudentTrace();
stop();playing=true;
function loop(){
if(strokeIndex<strokes.length){
animateStroke(strokeIndex,()=>timer=setTimeout(loop,170));
return;
}
if(componentIndex<components.length-1){
const next=componentIndex+1;
timer=setTimeout(async()=>{
await loadComponent(next,true);
playing=true;loop();
},650);
}else{
playing=false;updateProgress();
statusEl.textContent=`已完成 ${currentSymbol} 的筆順播放`;
}
}
loop();
}
function nextStrokePlayback(){
closeVocab(false);clearConfetti();
mode="play";updateModeUI();clearStudentTrace();
stop();
if(strokeIndex>=strokes.length) strokeIndex=0;
animateStroke(strokeIndex,()=>{});
}
async function enterPracticeMode(){
closeVocab(false);clearConfetti();
mode="practice";updateModeUI();stop();
componentIndex=0;strokeIndex=0;
await loadComponent(0,true);
render();renderPracticeOverlay();updateProgress();
statusEl.textContent=components.length>1
?`請依照筆畫順序描寫 ${currentSymbol}，先寫「${components[0]}」`
:`請依照筆畫順序描寫 ${currentSymbol}`;
}
function getSvgPointFromEvent(evt){
const rect=practiceLayer.getBoundingClientRect();
return {
x:(evt.clientX-rect.left)/rect.width*2048,
y:(evt.clientY-rect.top)/rect.height*2048
};
}
function dist(a,b){
const dx=a.x-b.x,dy=a.y-b.y;
return Math.hypot(dx,dy);
}
function polylineLength(points){
let sum=0;
for(let i=1;i<points.length;i++) sum+=dist(points[i-1],points[i]);
return sum;
}
function pointToSegmentDistance(p,a,b){
const l2=(b.x-a.x)**2+(b.y-a.y)**2;
if(l2===0) return dist(p,a);
let t=((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/l2;
t=Math.max(0,Math.min(1,t));
const proj={x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)};
return dist(p,proj);
}
function pointToPolylineDistance(point,points){
let best=Infinity;
for(let i=1;i<points.length;i++) best=Math.min(best,pointToSegmentDistance(point,points[i-1],points[i]));
return best===Infinity?dist(point,points[0]):best;
}
function nearestTrackIndex(point,track){
let best=0,bestD=Infinity;
for(let i=0;i<track.length;i++){
const d=dist(point,track[i]);
if(d<bestD){bestD=d;best=i;}
}
return best;
}
function evaluateStudentTrace(student,targetTrack){
if(!targetTrack||targetTrack.length<2) return {ok:false,message:"這一畫暫時無法練習"};
if(student.length<5) return {ok:false,message:"請把這一畫寫完整再放開"};
const studentLen=polylineLength(student),targetLen=polylineLength(targetTrack);
if(studentLen<Math.max(120,targetLen*0.35)) return {ok:false,message:"這一畫寫得太短，請再試一次"};
if(studentLen>targetLen*3.2) return {ok:false,message:"這一畫超出太多，請沿著字形再試一次"};
const startTol=220,endTol=260,coverTol=180;
if(dist(student[0],targetTrack[0])>startTol) return {ok:false,message:"請從正確的起筆位置開始"};
if(dist(student[student.length-1],targetTrack[targetTrack.length-1])>endTol) return {ok:false,message:"收筆位置不太對，請再試一次"};
const mapped=student.map(p=>nearestTrackIndex(p,targetTrack));
let backtracks=0;
for(let i=1;i<mapped.length;i++) if(mapped[i]+1<mapped[i-1]) backtracks++;
if(backtracks>Math.max(2,Math.floor(student.length*0.08))) return {ok:false,message:"筆畫方向不正確，請依照正確方向書寫"};
let covered=0;
for(let i=0;i<targetTrack.length;i++){
if(pointToPolylineDistance(targetTrack[i],student)<=coverTol) covered++;
}
if(covered/targetTrack.length<0.6) return {ok:false,message:"請沿著提示字形把這一畫寫完整"};
return {ok:true};
}
async function completeCurrentPracticeStroke(){
playCorrectSound();
strokeIndex++;
clearStudentTrace();render();renderPracticeOverlay();updateProgress();
if(strokeIndex<strokes.length){
statusEl.textContent=`很好！這一筆正確，請繼續寫第 ${strokeIndex+1} 畫`;
return;
}
if(componentIndex<components.length-1){
const next=componentIndex+1;
statusEl.textContent=`很好！接下來練習「${components[next]}」`;
await loadComponent(next,true);
render();renderPracticeOverlay();updateProgress();
}else{
statusEl.textContent=`太棒了！你已完成 ${currentSymbol} 的筆順練習`;
progressEl.textContent=`${currentSymbol}：全部筆順練習完成`;
setTimeout(()=>{
playApplauseSound();
launchConfetti();
},180);
}
}
async function finishPracticeAttempt(){
if(mode!=="practice"||!strokes[strokeIndex]) return;
const result=evaluateStudentTrace(studentPoints,strokes[strokeIndex].track);
if(result.ok){
await completeCurrentPracticeStroke();
}else{
playWrongSound();
statusEl.textContent=`${result.message}，再試一次`;
clearStudentTrace();render();renderPracticeOverlay();updateProgress();
}
}
practiceLayer.addEventListener("pointerdown",(evt)=>{
getAudioContext();
if(mode!=="practice"||!strokes.length||strokeIndex>=strokes.length) return;
stop();isDrawing=true;
studentPoints=[getSvgPointFromEvent(evt)];
practiceLayer.setPointerCapture(evt.pointerId);
renderPracticeOverlay();
});
practiceLayer.addEventListener("pointermove",(evt)=>{
if(!isDrawing||mode!=="practice") return;
const p=getSvgPointFromEvent(evt);
const last=studentPoints[studentPoints.length-1];
if(!last||dist(p,last)>8){
studentPoints.push(p);
renderPracticeOverlay();
}
});
async function endPointer(evt){
if(!isDrawing) return;
isDrawing=false;
if(practiceLayer.hasPointerCapture(evt.pointerId)) practiceLayer.releasePointerCapture(evt.pointerId);
await finishPracticeAttempt();
}
practiceLayer.addEventListener("pointerup",endPointer);
practiceLayer.addEventListener("pointercancel",()=>{isDrawing=false;});
async function replayAction(){
closeVocab(false);clearConfetti();stop();
if(mode==="practice"){
componentIndex=0;strokeIndex=0;
await loadComponent(0,true);
render();renderPracticeOverlay();updateProgress();
statusEl.textContent=`已重新開始 ${currentSymbol} 的筆順練習`;
}else{
componentIndex=0;
await loadComponent(0,true);
playCurrent();
}
}
function clearAction(){
closeVocab(false);clearConfetti();stop();
if(mode==="practice"){
clearStudentTrace();render();renderPracticeOverlay();updateProgress();
statusEl.textContent="已清除目前這一筆，請再試一次";
}else{
strokeIndex=0;render();renderPracticeOverlay();updateProgress();
statusEl.textContent="已清除目前播放結果";
}
}
function renderGroup(id,arr){
const box=document.getElementById(id);
arr.forEach(sym=>{
const b=document.createElement("button");
b.className="symbol";b.type="button";b.textContent=sym;b.dataset.symbol=sym;
b.addEventListener("click",()=>selectSymbol(sym));
box.appendChild(b);
});
}
renderGroup("initials",groups.initials);
renderGroup("finals",groups.finals);
renderGroup("compound",groups.compound);
speakBtn.onclick=()=>{closeVocab(false);clearConfetti();getAudioContext();speakSymbol(currentSymbol);};
mainPlayBtn.onclick=playCurrent;
practiceBtn.onclick=enterPracticeMode;
vocabBtn.onclick=openVocab;
prevSymbolBtn.onclick=goToPreviousSymbol;
nextSymbolBtn.onclick=goToNextSymbol;
playBtn.onclick=playCurrent;
nextBtn.onclick=nextStrokePlayback;
replayBtn.onclick=replayAction;
clearBtn.onclick=clearAction;
vocabCloseBtn.addEventListener("click",()=>closeVocab());
vocabBackdrop.addEventListener("click",(event)=>{if(event.target===vocabBackdrop) closeVocab();});
hintLevelRange.addEventListener("input",()=>{
hintLevel=Number(hintLevelRange.value);
updateHintLevelUI();render();renderPracticeOverlay();
});
function openHelp(){
closeVocab(false);clearConfetti();
helpBackdrop.classList.add("show");
helpCloseBtn.focus();
}
function closeHelp(){
helpBackdrop.classList.remove("show");
helpBtn.focus();
}
helpBtn.addEventListener("click",openHelp);
helpCloseBtn.addEventListener("click",closeHelp);
helpBackdrop.addEventListener("click",(event)=>{if(event.target===helpBackdrop) closeHelp();});
document.addEventListener("keydown",(event)=>{
if(event.key==="Escape"&&vocabBackdrop.classList.contains("show")){closeVocab();return;}
if(event.key==="Escape"&&helpBackdrop.classList.contains("show")) closeHelp();
});
async function preloadAll(){
const all=[...groups.initials,...groups.finals];
for(const ch of all){
try{await getStrokeData(ch);}catch(e){}
await new Promise(r=>setTimeout(r,30));
}
}
updateModeUI();
updateHintLevelUI();
selectSymbol("ㄅ").then(()=>setTimeout(preloadAll,800));

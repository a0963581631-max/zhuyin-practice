const DATA_BASE="https://raw.githubusercontent.com/g0v/zh-stroke-data/develop/json/";
const CACHE_PREFIX="bopo-moe-stroke-v5:";
const stage=document.getElementById("stage");
const practiceLayer=document.getElementById("practiceLayer");
const statusEl=document.getElementById("status");
const progressEl=document.getElementById("progress");
const bigSymbol=document.getElementById("bigSymbol");
const speakBtn=document.getElementById("speakBtn");
const mainPlayBtn=document.getElementById("mainPlayBtn");
const practiceBtn=document.getElementById("practiceBtn");
const prevSymbolBtn=document.getElementById("prevSymbolBtn");
const nextSymbolBtn=document.getElementById("nextSymbolBtn");
const playBtn=document.getElementById("playBtn");
const nextBtn=document.getElementById("nextBtn");
const replayBtn=document.getElementById("replayBtn");
const clearBtn=document.getElementById("clearBtn");
const hintLevelRange=document.getElementById("hintLevelRange");
const hintLevelText=document.getElementById("hintLevelText");
const helpBtn=document.getElementById("helpBtn");
const helpBackdrop=document.getElementById("helpBackdrop");
const helpCloseBtn=document.getElementById("helpCloseBtn");
const confettiLayer=document.getElementById("confettiLayer");
const vocabBtn=document.getElementById("vocabBtn");
const vocabBackdrop=document.getElementById("vocabBackdrop");
const vocabCloseBtn=document.getElementById("vocabCloseBtn");
const vocabTitle=document.getElementById("vocabTitle");
const vocabGrid=document.getElementById("vocabGrid");
const vocabNote=document.getElementById("vocabNote");
let currentSymbol="ㄅ";
let components=["ㄅ"];
let componentIndex=0;
let strokes=[];
let strokeIndex=0;
let raf=null,timer=null,playing=false,voices=[];
let mode="play";
let hintLevel=2;
let isDrawing=false;
let studentPoints=[];
function cpHex(ch){return ch.codePointAt(0).toString(16);}
function cacheKey(ch){return CACHE_PREFIX+cpHex(ch);}
async function getStrokeData(ch){
const key=cacheKey(ch);
try{
const saved=localStorage.getItem(key);
if(saved) return JSON.parse(saved);
}catch(e){}
const url=DATA_BASE+cpHex(ch)+".json";
const res=await fetch(url,{cache:"force-cache"});
if(!res.ok) throw new Error("HTTP "+res.status);
const data=await res.json();
if(!Array.isArray(data)||!data.length) throw new Error("筆順資料格式錯誤");
try{localStorage.setItem(key,JSON.stringify(data));}catch(e){}
return data;
}
function setEnabled(ok){
[mainPlayBtn,playBtn,nextBtn,replayBtn,clearBtn,practiceBtn].forEach(b=>b.disabled=!ok);
}
function updateNavigationButtons(){
const index=navigationOrder.indexOf(currentSymbol);
prevSymbolBtn.disabled=index<=0;
nextSymbolBtn.disabled=index<0 || index>=navigationOrder.length-1;
}
function updateHintLevelUI(){
const labels=["無提示","部分提示","完全提示"];
hintLevelText.textContent=`目前提示程度：${labels[hintLevel]}`;
hintLevelRange.value=String(hintLevel);
}
function escapeHtml(str){
return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function parseBopomofoSyllable(syllable){
const toneChars=new Set(["ˊ","ˇ","ˋ","˙","ˉ"]);
const chars=Array.from(syllable);
let tone="";
const base=[];
for(const ch of chars){
if(toneChars.has(ch)) tone=ch;
else base.push(ch);
}
if(tone==="ˉ") tone="";
return {base,tone};
}
function renderBopoSyllable(syllable,targetSymbol){
const {base,tone}=parseBopomofoSyllable(syllable);
const neutral=tone==="˙";
const regularTone=["ˊ","ˇ","ˋ"].includes(tone)?tone:"";
const charsHtml=base.map((ch,idx)=>{
const cls=ch===targetSymbol?"bopo-char target":"bopo-char";
const isLast=idx===base.length-1;
const toneHtml=(isLast&&regularTone)?`<span class="tone-mark" aria-hidden="true">${regularTone}</span>`:"";
return `<span class="${cls}">${escapeHtml(ch)}${toneHtml}</span>`;
}).join("");
const neutralHtml=neutral?'<span class="neutral-tone" aria-hidden="true">˙</span>':"";
return `<span class="bopo-syllable">${neutralHtml}${charsHtml}</span>`;
}
function renderWordWithBopomofo(item){
const chars=Array.from(item.word);
return chars.map((ch,idx)=>{
const syllable=item.bopomofo[idx]||"";
return `
<span class="word-unit">
<span class="han-char">${escapeHtml(ch)}</span>
${renderBopoSyllable(syllable,currentSymbol)}
</span>
`;
}).join("");
}
function renderVocabularyModal(){
const items=vocabularyBank[currentSymbol];
vocabTitle.textContent=`${currentSymbol} 詞彙`;
if(!items){
vocabNote.textContent="目前詞彙功能提供 37 個單一注音符號。請先選擇單一注音，再查看對應詞彙。";
vocabGrid.innerHTML=`<div class="no-vocab">目前選到的是「${escapeHtml(currentSymbol)}」。<br>請切換到單一注音（例如：ㄅ、ㄆ、ㄇ、ㄚ、ㄧ、ㄨ、ㄩ），即可看到至少兩個搭配圖片的生活詞彙。</div>`;
return;
}
vocabNote.textContent="直式注音依教育部體式呈現：二、三、四聲標在最後一個注音符號右上角；輕聲標在字音上方。紅色注音表示目前正在學習的符號。";
vocabGrid.innerHTML=items.map((item,index)=>`
<button class="vocab-card" type="button" data-word="${escapeHtml(item.word)}" aria-label="詞彙 ${escapeHtml(item.word)}">
<div class="vocab-emoji" aria-hidden="true">${item.emoji}</div>
<div class="vocab-word-wrap">
${renderWordWithBopomofo(item)}
</div>
<div class="vocab-subtext">詞彙 ${index+1}　點一下可以再聽一次</div>
</button>
`).join("");
vocabGrid.querySelectorAll(".vocab-card").forEach(card=>{
card.addEventListener("click",()=>{
const word=card.dataset.word||"";
speakText(word,0.76,true);
});
});
}
function openVocab(){
clearConfetti();
if(helpBackdrop.classList.contains("show")) helpBackdrop.classList.remove("show");
renderVocabularyModal();
vocabBackdrop.classList.add("show");
vocabCloseBtn.focus();
}
function closeVocab(focusBack=true){
vocabBackdrop.classList.remove("show");
if(focusBack) vocabBtn.focus();
}
function updateModeUI(){
const practiceActive=mode==="practice";
practiceBtn.classList.toggle("active-mode",practiceActive);
practiceBtn.textContent=practiceActive?"✍️ 練習中":"✍️ 練習筆順";
practiceLayer.style.pointerEvents=practiceActive?"auto":"none";
}
function outlinePath(commands){
let d="";
for(const c of commands){
if(c.type==="M") d+=`M ${c.x} ${c.y} `;
else if(c.type==="L") d+=`L ${c.x} ${c.y} `;
else if(c.type==="Q") d+=`Q ${c.begin.x} ${c.begin.y} ${c.end.x} ${c.end.y} `;
else if(c.type==="C") d+=`C ${c.begin.x} ${c.begin.y} ${c.mid.x} ${c.mid.y} ${c.end.x} ${c.end.y} `;
}
return d+"Z";
}
function trackPath(track){
if(!track||!track.length) return "";
let d=`M ${track[0].x} ${track[0].y} `;
for(let i=1;i<track.length;i++) d+=`L ${track[i].x} ${track[i].y} `;
return d;
}
function svgEl(name,attrs={}){
const e=document.createElementNS("http://www.w3.org/2000/svg",name);
for(const [k,v] of Object.entries(attrs)) e.setAttribute(k,v);
return e;
}
function stop(){
playing=false;
if(raf) cancelAnimationFrame(raf);
if(timer) clearTimeout(timer);
raf=timer=null;
}
function clearStudentTrace(){
isDrawing=false;
studentPoints=[];
renderPracticeOverlay();
}
function estimateRevealWidth(stroke){
const pts=[];
for(const c of stroke.outline||[]){
if("x" in c) pts.push([c.x,c.y]);
if(c.begin) pts.push([c.begin.x,c.begin.y]);
if(c.mid) pts.push([c.mid.x,c.mid.y]);
if(c.end) pts.push([c.end.x,c.end.y]);
}
if(!pts.length) return 260;
const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
const w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
const minor=Math.min(w||9999,h||9999);
return Math.max(150,Math.min(360,minor*1.35));
}
function drawCrossGrid(){
const vertical=svgEl("line",{x1:"1024",y1:"0",x2:"1024",y2:"2048",stroke:"var(--grid)","stroke-width":"10",opacity:"0.55"});
const horizontal=svgEl("line",{x1:"0",y1:"1024",x2:"2048",y2:"1024",stroke:"var(--grid)","stroke-width":"10",opacity:"0.55"});
stage.appendChild(vertical);
stage.appendChild(horizontal);
}
function render(active=null,progress=0){
stage.innerHTML="";
drawCrossGrid();
const defs=svgEl("defs");
stage.appendChild(defs);
strokes.forEach((s)=>{
const p=svgEl("path",{d:outlinePath(s.outline),fill:"#f7f7f7",stroke:"none"});
stage.appendChild(p);
});
if(mode==="practice"&&hintLevel===2&&strokes[strokeIndex]){
const hint=svgEl("path",{d:outlinePath(strokes[strokeIndex].outline),fill:"#9fc0ee",opacity:"0.88",stroke:"none"});
stage.appendChild(hint);
}
for(let i=0;i<strokeIndex;i++){
const p=svgEl("path",{d:outlinePath(strokes[i].outline),fill:"#080808",stroke:"none"});
stage.appendChild(p);
}
if(active){
const id="revealMask";
const mask=svgEl("mask",{id,maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"2048",height:"2048"});
const black=svgEl("rect",{x:"0",y:"0",width:"2048",height:"2048",fill:"black"});
mask.appendChild(black);
const tp=trackPath(active.track);
if(tp){
const guide=svgEl("path",{d:tp,fill:"none",stroke:"white","stroke-width":estimateRevealWidth(active),"stroke-linecap":"round","stroke-linejoin":"round"});
mask.appendChild(guide);
defs.appendChild(mask);
const hidden=svgEl("path",{d:tp,fill:"none",stroke:"white","stroke-width":estimateRevealWidth(active),"stroke-linecap":"round","stroke-linejoin":"round",opacity:"0"});
stage.appendChild(hidden);
const len=Math.max(1,hidden.getTotalLength());
hidden.remove();
guide.setAttribute("stroke-dasharray",len);
guide.setAttribute("stroke-dashoffset",len*(1-progress));
const ink=svgEl("path",{d:outlinePath(active.outline),fill:"#080808",stroke:"none",mask:`url(#${id})`});
stage.appendChild(ink);
}else if(progress>=1){
stage.appendChild(svgEl("path",{d:outlinePath(active.outline),fill:"#080808"}));
}
}
}
function renderPracticeOverlay(){
practiceLayer.innerHTML="";
if(mode!=="practice") return;
if(studentPoints.length){
let d=`M ${studentPoints[0].x} ${studentPoints[0].y} `;
for(let i=1;i<studentPoints.length;i++) d+=`L ${studentPoints[i].x} ${studentPoints[i].y} `;
const line=svgEl("path",{d,fill:"none",stroke:"var(--student)","stroke-width":"48","stroke-linecap":"round","stroke-linejoin":"round",opacity:"0.85"});
practiceLayer.appendChild(line);
}
if(hintLevel>=1&&strokes[strokeIndex]&&strokes[strokeIndex].track&&strokes[strokeIndex].track.length){
const start=strokes[strokeIndex].track[0];
const dot=svgEl("circle",{cx:start.x,cy:start.y,r:"28",fill:"#49a76b",opacity:"0.9"});
practiceLayer.appendChild(dot);
}
}
function duration(){
const s=document.querySelector('input[name="speed"]:checked').value;
return s==="slow"?1800:s==="fast"?750:1150;
}
function updateProgress(){
if(!strokes.length){progressEl.textContent="沒有可用筆順資料";return;}
const comp=components[componentIndex];
if(mode==="practice"){
if(strokeIndex>=strokes.length){
progressEl.textContent=`${comp}：練習完成`;
}else{
const prefix=components.length>1?`${currentSymbol} 中的「${comp}」　`:"";
progressEl.textContent=`${prefix}請練習第 ${strokeIndex+1} 畫／共 ${strokes.length} 畫`;
}
return;
}
if(strokeIndex>=strokes.length){
progressEl.textContent=`${comp}：${strokes.length} 畫完成`;
}else{
const prefix=components.length>1?`${currentSymbol} 中的「${comp}」　`:"";
progressEl.textContent=`${prefix}第 ${strokeIndex+1} 畫／共 ${strokes.length} 畫`;
}
}
function getReadyMessage(ch){
if(mode==="practice"){
return components.length>1?`練習 ${currentSymbol}：請先寫「${ch}」的第 1 畫`:`練習 ${currentSymbol}：請先寫第 1 畫`;
}
return components.length>1?`已選擇 ${currentSymbol}；筆順會依序示範 ${components.join("、")}`:`已載入「${ch}」的標準筆順資料`;
}
async function loadComponent(index,reset=true){
componentIndex=index;
const ch=components[index];
stop();clearStudentTrace();setEnabled(false);
statusEl.textContent=`正在載入「${ch}」的標準筆順資料……`;
progressEl.textContent="筆順資料載入中";
stage.innerHTML="";
try{
strokes=await getStrokeData(ch);
if(reset) strokeIndex=0;
render();
renderPracticeOverlay();
updateProgress();
setEnabled(true);
updateModeUI();
statusEl.textContent=getReadyMessage(ch);
}catch(err){
strokes=[];strokeIndex=0;render();renderPracticeOverlay();setEnabled(false);
statusEl.textContent="筆順資料未成功載入；為避免誤教，本網站不會顯示猜測筆順。請確認網路後重新點選。";
progressEl.textContent="標準筆順資料載入失敗";
console.error(err);
}
}
function loadVoices(){voices=speechSynthesis.getVoices();}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function pickZhTWVoice(){
return voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith("zh-tw"))||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith("zh"));
}
function speakText(text,rate=0.68,interrupt=true){
if(!("speechSynthesis" in window)) return;
if(interrupt) speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(String(text));
u.lang="zh-TW";u.rate=rate;u.pitch=1;u.volume=1;
const v=pickZhTWVoice();
if(v) u.voice=v;
speechSynthesis.speak(u);
}
function speakSymbol(symbol){speakText(symbol,0.68,true);}
function speakStrokeNumber(num){speakText(String(num),0.92,true);}
let audioCtx=null;
function getAudioContext(){
if(!audioCtx){
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC) return null;
audioCtx=new AC();
}
if(audioCtx.state==="suspended") audioCtx.resume();
return audioCtx;
}
function playTone(freq,start,duration,type="sine",gain=0.12){
const ctx=getAudioContext();
if(!ctx) return;
const osc=ctx.createOscillator();
const g=ctx.createGain();
osc.type=type;
osc.frequency.setValueAtTime(freq,ctx.currentTime+start);
g.gain.setValueAtTime(0.0001,ctx.currentTime+start);
g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+start+0.02);
g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+start+duration);
osc.connect(g);g.connect(ctx.destination);
osc.start(ctx.currentTime+start);
osc.stop(ctx.currentTime+start+duration+0.03);
}
function playCorrectSound(){
playTone(523.25,0.00,0.16,"sine",0.11);
playTone(659.25,0.11,0.18,"sine",0.12);
}
function playWrongSound(){
playTone(330.00,0.00,0.18,"triangle",0.08);
playTone(246.94,0.13,0.22,"triangle",0.07);
}
function createNoiseBuffer(seconds=0.18){
const ctx=getAudioContext();
if(!ctx) return null;
const length=Math.floor(ctx.sampleRate*seconds);
const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
const data=buffer.getChannelData(0);
for(let i=0;i<length;i++){
const envelope=Math.pow(1-i/length,1.6);
data[i]=(Math.random()*2-1)*envelope;
}
return buffer;
}
function playClapBurst(start,volume=0.18){
const ctx=getAudioContext();
if(!ctx) return;
const src=ctx.createBufferSource();
const filter=ctx.createBiquadFilter();
const gain=ctx.createGain();
src.buffer=createNoiseBuffer(0.13+Math.random()*0.08);
filter.type="bandpass";
filter.frequency.value=1200+Math.random()*900;
filter.Q.value=0.7;
gain.gain.setValueAtTime(0.0001,ctx.currentTime+start);
gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+start+0.008);
gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+start+0.17);
src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
src.start(ctx.currentTime+start);
}
function playApplauseSound(){
const clapTimes=[0.00,0.08,0.16,0.25,0.33,0.42,0.51,0.60,0.68,0.78,0.88,0.98,1.08,1.18,1.29,1.40,1.52,1.64];
clapTimes.forEach((t,i)=>{
playClapBurst(t+Math.random()*0.035,0.10+Math.random()*0.08);
if(i%3===0) playClapBurst(t+0.025+Math.random()*0.025,0.07+Math.random()*0.06);
});
playTone(523.25,1.55,0.30,"sine",0.08);
playTone(659.25,1.62,0.34,"sine",0.08);
playTone(783.99,1.69,0.38,"sine",0.09);
}
function clearConfetti(){
if(!confettiLayer) return;
confettiLayer.innerHTML="";
}
function randomConfettiColor(){
const colors=["#ff5d73","#ffd84d","#4fc3f7","#66d18f","#9b7cff","#ff8b3d","#f062c0"];
return colors[Math.floor(Math.random()*colors.length)];
}
function launchConfetti(){
clearConfetti();
if(!confettiLayer) return;
for(let i=0;i<85;i++){
const piece=document.createElement("div");
const shapeRoll=Math.random();
piece.className="confetti-piece"+(shapeRoll<0.22?" circle":shapeRoll<0.42?" ribbon":"");
piece.style.left=(Math.random()*100)+"vw";
piece.style.top=(-5-Math.random()*16)+"vh";
piece.style.background=randomConfettiColor();
piece.style.setProperty("--drift",((Math.random()*2-1)*180)+"px");
piece.style.setProperty("--rotate",(540+Math.random()*900)+"deg");
piece.style.setProperty("--duration",(2.2+Math.random()*1.9)+"s");
piece.style.animationDelay=(Math.random()*0.28)+"s";
confettiLayer.appendChild(piece);
}
for(let i=0;i<38;i++){
const burst=document.createElement("div");
burst.className="confetti-burst";
burst.style.background=randomConfettiColor();
const angle=(Math.PI*2*i/38)+(Math.random()*.18);
const distance=140+Math.random()*270;
const x=Math.cos(angle)*distance;
const y=Math.sin(angle)*distance-(40+Math.random()*120);
burst.style.setProperty("--x",x+"px");
burst.style.setProperty("--y",y+"px");
burst.style.setProperty("--rotate",(360+Math.random()*720)+"deg");
burst.style.setProperty("--duration",(1.15+Math.random()*.8)+"s");
confettiLayer.appendChild(burst);
}
window.setTimeout(clearConfetti,4300);
}

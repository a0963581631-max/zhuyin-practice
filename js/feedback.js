(()=>{
const confettiLayer=document.getElementById("confettiLayer");
let voices=[];
/* 語音 */
function loadVoices(){voices=speechSynthesis.getVoices();}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function pickZhTWVoice(){
  return voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith("zh-tw")) ||
         voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith("zh"));
}
function speakText(text, rate=0.68, interrupt=true){
  if(!("speechSynthesis" in window)) return;
  if(interrupt) speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text));
  u.lang="zh-TW";u.rate=rate;u.pitch=1;u.volume=1;
  const v=pickZhTWVoice();
  if(v) u.voice=v;
  speechSynthesis.speak(u);
  return u;
}
function speakSymbol(symbol){ speakText(symbol, 0.68, true); }
function speakStrokeNumber(num){ speakText(String(num), 0.92, true); }

/* 練習回饋音效：全部使用瀏覽器 Web Audio 產生，不需外部音檔 */
let audioCtx = null;

function getAudioContext(){
  if(!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    audioCtx = new AC();
  }
  if(audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq, start, duration, type="sine", gain=0.12){
  const ctx = getAudioContext();
  if(!ctx) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.03);
}

function playCorrectSound(){
  // 短促上行音：清楚但不尖銳
  playTone(523.25, 0.00, 0.16, "sine", 0.11);
  playTone(659.25, 0.11, 0.18, "sine", 0.12);
}

function playWrongSound(){
  // 柔和下降音，避免讓學生感覺被責備
  playTone(330.00, 0.00, 0.18, "triangle", 0.08);
  playTone(246.94, 0.13, 0.22, "triangle", 0.07);
}

function createNoiseBuffer(seconds=0.18){
  const ctx = getAudioContext();
  if(!ctx) return null;

  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for(let i=0;i<length;i++){
    const envelope = Math.pow(1 - i/length, 1.6);
    data[i] = (Math.random()*2 - 1) * envelope;
  }
  return buffer;
}

function playClapBurst(start, volume=0.18){
  const ctx = getAudioContext();
  if(!ctx) return;

  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  src.buffer = createNoiseBuffer(0.13 + Math.random()*0.08);
  filter.type = "bandpass";
  filter.frequency.value = 1200 + Math.random()*900;
  filter.Q.value = 0.7;

  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.17);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  src.start(ctx.currentTime + start);
}

function playApplauseSound(){
  // 多個不同時間與音量的 noise burst，模擬一小段鼓掌
  const clapTimes = [
    0.00,0.08,0.16,0.25,0.33,0.42,0.51,0.60,0.68,
    0.78,0.88,0.98,1.08,1.18,1.29,1.40,1.52,1.64
  ];

  clapTimes.forEach((t,i)=>{
    playClapBurst(t + Math.random()*0.035, 0.10 + Math.random()*0.08);
    if(i % 3 === 0) playClapBurst(t + 0.025 + Math.random()*0.025, 0.07 + Math.random()*0.06);
  });

  // 鼓掌後加一個簡短成功和弦
  playTone(523.25, 1.55, 0.30, "sine", 0.08);
  playTone(659.25, 1.62, 0.34, "sine", 0.08);
  playTone(783.99, 1.69, 0.38, "sine", 0.09);
}

/* 彩帶獎勵效果 */
let confettiCleanupTimer=null;
function clearConfetti(){
  if(confettiCleanupTimer!==null){
    window.clearTimeout(confettiCleanupTimer);
    confettiCleanupTimer=null;
  }
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

  // 上方落下彩帶
  for(let i=0;i<85;i++){
    const piece=document.createElement("div");
    const shapeRoll=Math.random();
    piece.className="confetti-piece" + (shapeRoll<0.22 ? " circle" : shapeRoll<0.42 ? " ribbon" : "");
    piece.style.left=(Math.random()*100)+"vw";
    piece.style.top=(-5-Math.random()*16)+"vh";
    piece.style.background=randomConfettiColor();
    piece.style.setProperty("--drift",((Math.random()*2-1)*180)+"px");
    piece.style.setProperty("--rotate",(540+Math.random()*900)+"deg");
    piece.style.setProperty("--duration",(2.2+Math.random()*1.9)+"s");
    piece.style.animationDelay=(Math.random()*0.28)+"s";
    confettiLayer.appendChild(piece);
  }

  // 中央爆發彩帶
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

  // 自動清掉殘留節點
  confettiCleanupTimer=window.setTimeout(clearConfetti,4600);
}


window.TeachingFeedback={speakText,speakSymbol,speakStrokeNumber,getAudioContext,playCorrectSound,playWrongSound,playApplauseSound,clearConfetti,launchConfetti};
})();

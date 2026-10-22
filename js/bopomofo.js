(()=>{
const {speakText,speakSymbol,speakStrokeNumber,getAudioContext,playCorrectSound,playWrongSound,playApplauseSound,clearConfetti,launchConfetti}=TeachingFeedback;

const groups={
 initials:["ㄅ","ㄆ","ㄇ","ㄈ","ㄉ","ㄊ","ㄋ","ㄌ","ㄍ","ㄎ","ㄏ","ㄐ","ㄑ","ㄒ","ㄓ","ㄔ","ㄕ","ㄖ","ㄗ","ㄘ","ㄙ"],
 finals:["ㄧ","ㄨ","ㄩ","ㄚ","ㄛ","ㄜ","ㄝ","ㄞ","ㄟ","ㄠ","ㄡ","ㄢ","ㄣ","ㄤ","ㄥ","ㄦ"],
 compound:["ㄧㄚ","ㄧㄛ","ㄧㄝ","ㄧㄞ","ㄧㄠ","ㄧㄡ","ㄧㄢ","ㄧㄣ","ㄧㄤ","ㄧㄥ","ㄨㄚ","ㄨㄛ","ㄨㄞ","ㄨㄟ","ㄨㄢ","ㄨㄣ","ㄨㄤ","ㄨㄥ","ㄩㄝ","ㄩㄢ","ㄩㄣ","ㄩㄥ"]
};
const navigationOrder=[...groups.initials,...groups.finals,...groups.compound];
const TeachingOrder=createTeachingOrder({groups,navigationOrder,selectSymbol,fitPracticeBoard});

const vocabularyBank = {
  "ㄅ":[
    {word:"包子", emoji:"🥟", bopomofo:["ㄅㄠ","ㄗ˙"]},
    {word:"杯子", emoji:"🥤", bopomofo:["ㄅㄟ","ㄗ˙"]}
  ],
  "ㄆ":[
    {word:"泡泡", emoji:"🫧", bopomofo:["ㄆㄠˋ","ㄆㄠ˙"]},
    {word:"葡萄", emoji:"🍇", bopomofo:["ㄆㄨˊ","ㄊㄠˊ"]}
  ],
  "ㄇ":[
    {word:"帽子", emoji:"🧢", bopomofo:["ㄇㄠˋ","ㄗ˙"]},
    {word:"貓咪", emoji:"🐱", bopomofo:["ㄇㄠ","ㄇㄧ"]}
  ],
  "ㄈ":[
    {word:"風箏", emoji:"🪁", bopomofo:["ㄈㄥ","ㄓㄥ"]},
    {word:"飛機", emoji:"✈️", bopomofo:["ㄈㄟ","ㄐㄧ"]}
  ],
  "ㄉ":[
    {word:"蛋糕", emoji:"🎂", bopomofo:["ㄉㄢˋ","ㄍㄠ"]},
    {word:"電燈", emoji:"💡", bopomofo:["ㄉㄧㄢˋ","ㄉㄥ"]}
  ],
  "ㄊ":[
    {word:"兔子", emoji:"🐰", bopomofo:["ㄊㄨˋ","ㄗ˙"]},
    {word:"太陽", emoji:"☀️", bopomofo:["ㄊㄞˋ","ㄧㄤˊ"]}
  ],
  "ㄋ":[
    {word:"牛奶", emoji:"🥛", bopomofo:["ㄋㄧㄡˊ","ㄋㄞˇ"]},
    {word:"南瓜", emoji:"🎃", bopomofo:["ㄋㄢˊ","ㄍㄨㄚ"]}
  ],
  "ㄌ":[
    {word:"老虎", emoji:"🐯", bopomofo:["ㄌㄠˇ","ㄏㄨˇ"]},
    {word:"梨子", emoji:"🍐", bopomofo:["ㄌㄧˊ","ㄗ˙"]}
  ],
  "ㄍ":[
    {word:"狗狗", emoji:"🐶", bopomofo:["ㄍㄡˇ","ㄍㄡ˙"]},
    {word:"公車", emoji:"🚌", bopomofo:["ㄍㄨㄥ","ㄔㄜ"]}
  ],
  "ㄎ":[
    {word:"口罩", emoji:"😷", bopomofo:["ㄎㄡˇ","ㄓㄠˋ"]},
    {word:"恐龍", emoji:"🦖", bopomofo:["ㄎㄨㄥˇ","ㄌㄨㄥˊ"]}
  ],
  "ㄏ":[
    {word:"河馬", emoji:"🦛", bopomofo:["ㄏㄜˊ","ㄇㄚˇ"]},
    {word:"火車", emoji:"🚂", bopomofo:["ㄏㄨㄛˇ","ㄔㄜ"]}
  ],
  "ㄐ":[
    {word:"積木", emoji:"🧱", bopomofo:["ㄐㄧ","ㄇㄨˋ"]},
    {word:"剪刀", emoji:"✂️", bopomofo:["ㄐㄧㄢˇ","ㄉㄠ"]}
  ],
  "ㄑ":[
    {word:"氣球", emoji:"🎈", bopomofo:["ㄑㄧˋ","ㄑㄧㄡˊ"]},
    {word:"汽車", emoji:"🚗", bopomofo:["ㄑㄧˋ","ㄔㄜ"]}
  ],
  "ㄒ":[
    {word:"香蕉", emoji:"🍌", bopomofo:["ㄒㄧㄤ","ㄐㄧㄠ"]},
    {word:"西瓜", emoji:"🍉", bopomofo:["ㄒㄧ","ㄍㄨㄚ"]}
  ],
  "ㄓ":[
    {word:"蜘蛛", emoji:"🕷️", bopomofo:["ㄓ","ㄓㄨ"]},
    {word:"指甲", emoji:"💅", bopomofo:["ㄓˇ","ㄐㄧㄚˇ"]}
  ],
  "ㄔ":[
    {word:"車子", emoji:"🚗", bopomofo:["ㄔㄜ","ㄗ˙"]},
    {word:"尺子", emoji:"📏", bopomofo:["ㄔˇ","ㄗ˙"]}
  ],
  "ㄕ":[
    {word:"獅子", emoji:"🦁", bopomofo:["ㄕ","ㄗ˙"]},
    {word:"書包", emoji:"🎒", bopomofo:["ㄕㄨ","ㄅㄠ"]}
  ],
  "ㄖ":[
    {word:"日曆", emoji:"📅", bopomofo:["ㄖˋ","ㄌㄧˋ"]},
    {word:"熱狗", emoji:"🌭", bopomofo:["ㄖㄜˋ","ㄍㄡˇ"]}
  ],
  "ㄗ":[
    {word:"自行車", emoji:"🚲", bopomofo:["ㄗˋ","ㄒㄧㄥˊ","ㄔㄜ"]},
    {word:"足球", emoji:"⚽", bopomofo:["ㄗㄨˊ","ㄑㄧㄡˊ"]}
  ],
  "ㄘ":[
    {word:"刺蝟", emoji:"🦔", bopomofo:["ㄘˋ","ㄨㄟˋ"]},
    {word:"草莓", emoji:"🍓", bopomofo:["ㄘㄠˇ","ㄇㄟˊ"]}
  ],
  "ㄙ":[
    {word:"三明治", emoji:"🥪", bopomofo:["ㄙㄢ","ㄇㄧㄥˊ","ㄓˋ"]},
    {word:"掃把", emoji:"🧹", bopomofo:["ㄙㄠˋ","ㄅㄚˇ"]}
  ],
  "ㄚ":[
    {word:"沙發", emoji:"🛋️", bopomofo:["ㄕㄚ","ㄈㄚ"]},
    {word:"喇叭", emoji:"📣", bopomofo:["ㄌㄚˇ","ㄅㄚ"]}
  ],
  "ㄛ":[
    {word:"火鍋", emoji:"🍲", bopomofo:["ㄏㄨㄛˇ","ㄍㄨㄛ"]},
    {word:"蘿蔔", emoji:"🥕", bopomofo:["ㄌㄨㄛˊ","ㄅㄛ˙"]}
  ],
  "ㄜ":[
    {word:"鵝", emoji:"🪿", bopomofo:["ㄜˊ"]},
    {word:"可樂", emoji:"🥤", bopomofo:["ㄎㄜˇ","ㄌㄜˋ"]}
  ],
  "ㄝ":[
    {word:"爺爺", emoji:"👴", bopomofo:["ㄧㄝˊ","ㄧㄝ˙"]},
    {word:"椰子", emoji:"🥥", bopomofo:["ㄧㄝˊ","ㄗ˙"]}
  ],
  "ㄞ":[
    {word:"白菜", emoji:"🥬", bopomofo:["ㄅㄞˊ","ㄘㄞˋ"]},
    {word:"海豚", emoji:"🐬", bopomofo:["ㄏㄞˇ","ㄊㄨㄣˊ"]}
  ],
  "ㄟ":[
    {word:"飛機", emoji:"✈️", bopomofo:["ㄈㄟ","ㄐㄧ"]},
    {word:"杯子", emoji:"🥤", bopomofo:["ㄅㄟ","ㄗ˙"]}
  ],
  "ㄠ":[
    {word:"貓咪", emoji:"🐱", bopomofo:["ㄇㄠ","ㄇㄧ"]},
    {word:"桃子", emoji:"🍑", bopomofo:["ㄊㄠˊ","ㄗ˙"]}
  ],
  "ㄡ":[
    {word:"口罩", emoji:"😷", bopomofo:["ㄎㄡˇ","ㄓㄠˋ"]},
    {word:"豆子", emoji:"🫘", bopomofo:["ㄉㄡˋ","ㄗ˙"]}
  ],
  "ㄢ":[
    {word:"饅頭", emoji:"🍞", bopomofo:["ㄇㄢˊ","ㄊㄡ˙"]},
    {word:"番茄", emoji:"🍅", bopomofo:["ㄈㄢ","ㄑㄧㄝˊ"]}
  ],
  "ㄣ":[
    {word:"門", emoji:"🚪", bopomofo:["ㄇㄣˊ"]},
    {word:"枕頭", emoji:"🛏️", bopomofo:["ㄓㄣˇ","ㄊㄡ˙"]}
  ],
  "ㄤ":[
    {word:"羊", emoji:"🐑", bopomofo:["ㄧㄤˊ"]},
    {word:"房子", emoji:"🏠", bopomofo:["ㄈㄤˊ","ㄗ˙"]}
  ],
  "ㄥ":[
    {word:"燈籠", emoji:"🏮", bopomofo:["ㄉㄥ","ㄌㄨㄥˊ"]},
    {word:"風箏", emoji:"🪁", bopomofo:["ㄈㄥ","ㄓㄥ"]}
  ],
  "ㄦ":[
    {word:"耳朵", emoji:"👂", bopomofo:["ㄦˇ","ㄉㄨㄛ˙"]},
    {word:"兒童車", emoji:"🚲", bopomofo:["ㄦˊ","ㄊㄨㄥˊ","ㄔㄜ"]}
  ],
  "ㄧ":[
    {word:"衣服", emoji:"👕", bopomofo:["ㄧ","ㄈㄨˊ"]},
    {word:"椅子", emoji:"🪑", bopomofo:["ㄧˇ","ㄗ˙"]}
  ],
  "ㄨ":[
    {word:"烏龜", emoji:"🐢", bopomofo:["ㄨ","ㄍㄨㄟ"]},
    {word:"屋子", emoji:"🏠", bopomofo:["ㄨ","ㄗ˙"]}
  ],
  "ㄩ":[
    {word:"魚", emoji:"🐟", bopomofo:["ㄩˊ"]},
    {word:"雨傘", emoji:"☂️", bopomofo:["ㄩˇ","ㄙㄢˇ"]}
  ],
  "ㄧㄚ":[
    {word:"鴨子", emoji:"🦆", bopomofo:["ㄧㄚ","ㄗ˙"]},
    {word:"牙刷", emoji:"🪥", bopomofo:["ㄧㄚˊ","ㄕㄨㄚ"]}
  ],
  "ㄧㄛ":[
    {word:"唉唷", emoji:"😣", bopomofo:["ㄞ","ㄧㄛ"], tip:"撞到或痛時發出的聲音"},
    {word:"哼唷", emoji:"💪", bopomofo:["ㄏㄥ","ㄧㄛ"], tip:"一起用力搬東西時喊的聲音"}
  ],
  "ㄧㄝ":[
    {word:"葉子", emoji:"🍃", bopomofo:["ㄧㄝˋ","ㄗ˙"]},
    {word:"爺爺", emoji:"👴", bopomofo:["ㄧㄝˊ","ㄧㄝ˙"]}
  ],
  "ㄧㄞ":[
    {word:"山崖", emoji:"⛰️", bopomofo:["ㄕㄢ","ㄧㄞˊ"], tip:"山邊很陡的地方"},
    {word:"懸崖", emoji:"🧗", bopomofo:["ㄒㄩㄢˊ","ㄧㄞˊ"], tip:"很高、很陡的山邊"}
  ],
  "ㄧㄠ":[
    {word:"搖籃", emoji:"🛏️", bopomofo:["ㄧㄠˊ","ㄌㄢˊ"]},
    {word:"腰帶", emoji:"👖", bopomofo:["ㄧㄠ","ㄉㄞˋ"]}
  ],
  "ㄧㄡ":[
    {word:"郵票", emoji:"✉️", bopomofo:["ㄧㄡˊ","ㄆㄧㄠˋ"]},
    {word:"油條", emoji:"🥖", bopomofo:["ㄧㄡˊ","ㄊㄧㄠˊ"]}
  ],
  "ㄧㄢ":[
    {word:"眼鏡", emoji:"👓", bopomofo:["ㄧㄢˇ","ㄐㄧㄥˋ"]},
    {word:"鹽巴", emoji:"🧂", bopomofo:["ㄧㄢˊ","ㄅㄚ"]}
  ],
  "ㄧㄣ":[
    {word:"音樂", emoji:"🎵", bopomofo:["ㄧㄣ","ㄩㄝˋ"]},
    {word:"飲料", emoji:"🧃", bopomofo:["ㄧㄣˇ","ㄌㄧㄠˋ"]}
  ],
  "ㄧㄤ":[
    {word:"洋蔥", emoji:"🧅", bopomofo:["ㄧㄤˊ","ㄘㄨㄥ"]},
    {word:"太陽", emoji:"☀️", bopomofo:["ㄊㄞˋ","ㄧㄤˊ"]}
  ],
  "ㄧㄥ":[
    {word:"影子", emoji:"🕴️", image:"assets/vocabulary/shadow-puppet.webp", bopomofo:["ㄧㄥˇ","ㄗ˙"]},
    {word:"櫻桃", emoji:"🍒", bopomofo:["ㄧㄥ","ㄊㄠˊ"]}
  ],
  "ㄨㄚ":[
    {word:"娃娃", emoji:"🪆", bopomofo:["ㄨㄚˊ","ㄨㄚ˙"]},
    {word:"青蛙", emoji:"🐸", bopomofo:["ㄑㄧㄥ","ㄨㄚ"]}
  ],
  "ㄨㄛ":[
    {word:"鳥窩", emoji:"🪺", bopomofo:["ㄋㄧㄠˇ","ㄨㄛ"]},
    {word:"火鍋", emoji:"🍲", bopomofo:["ㄏㄨㄛˇ","ㄍㄨㄛ"]}
  ],
  "ㄨㄞ":[
    {word:"外套", emoji:"🧥", bopomofo:["ㄨㄞˋ","ㄊㄠˋ"]},
    {word:"怪獸", emoji:"👾", bopomofo:["ㄍㄨㄞˋ","ㄕㄡˋ"]}
  ],
  "ㄨㄟ":[
    {word:"圍巾", emoji:"🧣", bopomofo:["ㄨㄟˊ","ㄐㄧㄣ"]},
    {word:"尾巴", emoji:"🐈", bopomofo:["ㄨㄟˇ","ㄅㄚ˙"]}
  ],
  "ㄨㄢ":[
    {word:"玩具", emoji:"🧸", bopomofo:["ㄨㄢˊ","ㄐㄩˋ"]},
    {word:"飯碗", emoji:"🍚", bopomofo:["ㄈㄢˋ","ㄨㄢˇ"]}
  ],
  "ㄨㄣ":[
    {word:"蚊子", emoji:"🦟", bopomofo:["ㄨㄣˊ","ㄗ˙"]},
    {word:"文具", emoji:"✏️", bopomofo:["ㄨㄣˊ","ㄐㄩˋ"]}
  ],
  "ㄨㄤ":[
    {word:"國王", emoji:"👑", bopomofo:["ㄍㄨㄛˊ","ㄨㄤˊ"]},
    {word:"網子", emoji:"🥅", bopomofo:["ㄨㄤˇ","ㄗ˙"]}
  ],
  "ㄨㄥ":[
    {word:"嗡嗡", emoji:"🐝", bopomofo:["ㄨㄥ","ㄨㄥ"], tip:"蜜蜂飛行時發出的聲音"},
    {word:"水甕", emoji:"🏺", bopomofo:["ㄕㄨㄟˇ","ㄨㄥˋ"], tip:"以前裝水用的大陶罐"}
  ],
  "ㄩㄝ":[
    {word:"月亮", emoji:"🌙", bopomofo:["ㄩㄝˋ","ㄌㄧㄤˋ"]},
    {word:"月餅", emoji:"🥮", bopomofo:["ㄩㄝˋ","ㄅㄧㄥˇ"]}
  ],
  "ㄩㄢ":[
    {word:"公園", emoji:"🛝", bopomofo:["ㄍㄨㄥ","ㄩㄢˊ"]},
    {word:"湯圓", emoji:"🍡", image:"assets/vocabulary/tangyuan.webp", bopomofo:["ㄊㄤ","ㄩㄢˊ"]}
  ],
  "ㄩㄣ":[
    {word:"雲朵", emoji:"☁️", bopomofo:["ㄩㄣˊ","ㄉㄨㄛˇ"]},
    {word:"運動", emoji:"🏃", bopomofo:["ㄩㄣˋ","ㄉㄨㄥˋ"]}
  ],
  "ㄩㄥ":[
    {word:"游泳", emoji:"🏊", bopomofo:["ㄧㄡˊ","ㄩㄥˇ"]},
    {word:"泳圈", emoji:"🛟", bopomofo:["ㄩㄥˇ","ㄑㄩㄢ"]}
  ]
};

const DATA_BASE="assets/strokes/16cb7fa/";
const CACHE_PREFIX="bopo-moe-stroke-16cb7fa:";
const strokeRequests=new Map();
let componentLoadEpoch=0;

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
let raf=null,timer=null,playing=false;
let mode="play"; // play | practice
let hintLevel=2; // 0: 無提示 1: 部分提示 2: 完全提示
let isDrawing=false;
let studentPoints=[];
let compoundPhase=false;       // only after both symbols are individually practised
let compoundLoading=false;
let compoundRanges=[];
let practiceEpoch=0;            // ignore stale asynchronous combined-load results

function cpHex(ch){return ch.codePointAt(0).toString(16);}
function cacheKey(ch){return CACHE_PREFIX+cpHex(ch);}

function validStrokeData(data){return Array.isArray(data)&&data.length>0&&data.every(s=>Array.isArray(s.outline)&&s.outline.length&&Array.isArray(s.track)&&s.track.length>1);}
function getStrokeData(ch){
 if(strokeRequests.has(ch))return strokeRequests.get(ch);
 const task=(async()=>{
  const key=cacheKey(ch);
  try{const saved=JSON.parse(localStorage.getItem(key));if(validStrokeData(saved))return saved;}catch{}
  const res=await fetch(DATA_BASE+cpHex(ch)+'.json',{cache:'force-cache'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  const data=await res.json();if(!validStrokeData(data))throw new Error('筆順資料格式錯誤');
  try{localStorage.setItem(key,JSON.stringify(data));}catch{}
  return data;
 })();
 strokeRequests.set(ch,task);task.catch(()=>strokeRequests.delete(ch));return task;
}

function setEnabled(ok){
  [mainPlayBtn,playBtn,nextBtn,replayBtn,clearBtn,practiceBtn].forEach(b=>b.disabled=!ok);
}

function updateNavigationButtons(){
  const order=TeachingOrder.order();
  const index=order.indexOf(currentSymbol);
  prevSymbolBtn.disabled=index<=0;
  nextSymbolBtn.disabled=index<0 || index>=order.length-1;
  TeachingOrder.syncStatus(currentSymbol);
}

function updateHintLevelUI(){
  const labels = ["無提示","部分提示","完全提示"];
  hintLevelText.textContent = `目前提示程度：${labels[hintLevel]}`;
  hintLevelRange.value = String(hintLevel);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function parseBopomofoSyllable(syllable){
  const toneChars = new Set(["ˊ","ˇ","ˋ","˙","ˉ"]);
  const chars = Array.from(syllable);
  let tone = "";
  const base = [];
  for(const ch of chars){
    if(toneChars.has(ch)) tone = ch;
    else base.push(ch);
  }
  // 教育部手冊：陰平調號注音時可省略不標
  if(tone === "ˉ") tone = "";
  return {base, tone};
}

function renderBopoSyllable(syllable, targetSymbol){
  const {base, tone} = parseBopomofoSyllable(syllable);
  const neutral = tone === "˙";
  const regularTone = ["ˊ","ˇ","ˋ"].includes(tone) ? tone : "";

  const charsHtml = base.map((ch, idx) => {
    // A compound final highlights its whole matching sequence; initials and
    // tone marks remain unchanged. Single-symbol lessons retain their behavior.
    const start = targetSymbol.length > 1 ? base.join("").indexOf(targetSymbol) : -1;
    const taught = targetSymbol.length > 1
      ? start >= 0 && idx >= start && idx < start + targetSymbol.length
      : ch === targetSymbol;
    const cls = taught ? "bopo-char target" : "bopo-char";
    const isLast = idx === base.length - 1;
    const toneHtml = (isLast && regularTone)
      ? `<span class="tone-mark" aria-hidden="true">${regularTone}</span>`
      : "";
    const neutralHtml = neutral && idx === 0
      ? `<span class="neutral-tone" aria-hidden="true">˙</span>`
      : "";
    return `<span class="${cls}">${escapeHtml(ch)}${toneHtml}${neutralHtml}</span>`;
  }).join("");

  return `<span class="bopo-syllable" data-note-count="${base.length}">${charsHtml}</span>`;
}

function renderWordWithBopomofo(item){
  const chars = Array.from(item.word);
  return chars.map((ch, idx) => {
    const syllable = item.bopomofo[idx] || "";
    return `
      <span class="word-unit">
        <span class="han-char">${escapeHtml(ch)}</span>
        ${renderBopoSyllable(syllable, currentSymbol)}
      </span>
    `;
  }).join("");
}

function renderVocabularyModal(){
  const items = vocabularyBank[currentSymbol];
  vocabTitle.textContent = `${currentSymbol} 詞彙`;
  if(!items){
    vocabNote.textContent = "請從下方注音清單選擇要練習的注音或結合韻。";
    vocabGrid.innerHTML = `<div class="no-vocab">目前選到的是「${escapeHtml(currentSymbol)}」，尚無對應詞彙。請選擇其他注音。</div>`;
    return;
  }

  vocabNote.textContent = "點選 emoji 圖片可上傳自己的插圖；詞彙下方可點選朗讀。直式注音和紅字提示維持原本設定。";
  vocabGrid.innerHTML = items.map((item, index) => `
    <div class="vocab-card" data-word="${escapeHtml(item.word)}" data-symbol="${escapeHtml(currentSymbol)}" data-default-image="${escapeHtml(item.image||"")}">
      <label class="vocab-emoji vocab-image-picker">
        <span class="vocab-default-emoji" aria-hidden="true" ${item.image?"hidden":""}>${item.emoji}</span>
        <img class="vocab-uploaded-image" ${item.image?`src="${escapeHtml(item.image)}"`:"hidden"} alt="">
        <input class="vocab-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="上傳「${escapeHtml(item.word)}」的圖片">
      </label>
      <button class="vocab-reset-image" type="button" hidden>${item.image?"↩ 還原預設插圖":"↩ 還原原本的 emoji"}</button>
      <div class="vocab-word-wrap">
        ${renderWordWithBopomofo(item)}
      </div>
      <div class="vocab-subtext">詞彙 ${index+1}　${item.tip ? escapeHtml(item.tip) : "點一下可以再聽一次"}</div>
      <button class="vocab-audio-button" type="button" aria-label="播放「${escapeHtml(item.word)}」的讀音">🔊 聽詞彙</button>
    </div>
  `).join("");

  vocabGrid.querySelectorAll(".vocab-card").forEach(card => {
    const word=card.dataset.word||"";
    const play=()=>speakText(word,0.76,true);
    card.querySelector(".vocab-audio-button").addEventListener("click",play);
    // Clicking the written word or empty card space still plays the vocabulary.
    // Clicking the image or restoring its emoji never triggers the voice.
    card.addEventListener("click",event=>{
      if(event.target.closest(".vocab-image-picker,.vocab-reset-image,.vocab-audio-button"))return;
      play();
    });
    const picker=card.querySelector(".vocab-image-input");
    picker.addEventListener("change",()=>{
      const file=picker.files&&picker.files[0];
      if(file)VocabImageUpload.upload(card,file);
      picker.value="";
    });
    card.querySelector(".vocab-reset-image").addEventListener("click",()=>VocabImageUpload.reset(card));
    VocabImageUpload.mount(card);
  });
}

function openVocab(){
  clearConfetti();
  if(helpBackdrop.classList.contains("show")){
    helpBackdrop.classList.remove("show");
  }
  document.getElementById("vocabUploadStatus").textContent="";
  renderVocabularyModal();
  vocabBackdrop.classList.add("show");
  vocabCloseBtn.focus();
}

function closeVocab(focusBack=true){
  vocabBackdrop.classList.remove("show");
  if(focusBack) vocabBtn.focus();
}

function updateModeUI(){
  const practiceActive = mode==="practice";
  practiceBtn.classList.toggle("active-mode", practiceActive);
  practiceBtn.textContent = practiceActive ? "✍️ 練習中" : "✍️ 練習筆順";
  practiceLayer.style.pointerEvents = practiceActive ? "auto" : "none";
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
  const vertical = svgEl("line", {
    x1:"1024", y1:"0", x2:"1024", y2:"2048",
    stroke:"var(--grid)", "stroke-width":"10", opacity:"0.55"
  });
  const horizontal = svgEl("line", {
    x1:"0", y1:"1024", x2:"2048", y2:"1024",
    stroke:"var(--grid)", "stroke-width":"10", opacity:"0.55"
  });
  stage.appendChild(vertical);
  stage.appendChild(horizontal);
}

let animationRender=null;
function render(active=null,progress=0){
  if(active&&animationRender?.stroke===active&&animationRender.index===strokeIndex&&animationRender.guide.isConnected){
    animationRender.guide.setAttribute('stroke-dashoffset',animationRender.length*(1-progress));return;
  }
  animationRender=null;
  stage.innerHTML="";
  if(compoundPhase){
    const activePart=strokes[Math.min(strokeIndex,strokes.length-1)]?.combinedPart ?? 1;
    CompoundGridPractice.drawGuides(stage,svgEl,components,activePart);
  }
  drawCrossGrid();

  const defs=svgEl("defs");
  stage.appendChild(defs);

  // 淡色完整提示字形
  strokes.forEach((s)=>{
    const p=svgEl("path",{d:outlinePath(s.outline),fill:"#f7f7f7",stroke:"none"});
    stage.appendChild(p);
  });

  // 練習模式下，只有「完全提示」才顯示藍色底提示下一筆畫
  if(mode==="practice" && hintLevel===2 && strokes[strokeIndex]){
    const hint=svgEl("path",{
      d:outlinePath(strokes[strokeIndex].outline),fill:"#9fc0ee",opacity:"0.88",stroke:"none"
    });
    stage.appendChild(hint);
  }

  // 已完成筆畫
  for(let i=0;i<strokeIndex;i++){
    const p=svgEl("path",{d:outlinePath(strokes[i].outline),fill:"#080808",stroke:"none"});
    stage.appendChild(p);
  }

  // 播放中的目前筆畫
  if(active){
    const id="revealMask";
    const mask=svgEl("mask",{id,maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"2048",height:"2048"});
    const black=svgEl("rect",{x:"0",y:"0",width:"2048",height:"2048",fill:"black"});
    mask.appendChild(black);

    const tp=trackPath(active.track);
    if(tp){
      const guide=svgEl("path",{
        d:tp,fill:"none",stroke:"white",
        "stroke-width":estimateRevealWidth(active),
        "stroke-linecap":"round","stroke-linejoin":"round"
      });
      mask.appendChild(guide);
      defs.appendChild(mask);

      const hidden=svgEl("path",{
        d:tp,fill:"none",stroke:"white",
        "stroke-width":estimateRevealWidth(active),
        "stroke-linecap":"round","stroke-linejoin":"round",
        opacity:"0"
      });
      stage.appendChild(hidden);
      const len=Math.max(1,hidden.getTotalLength());
      hidden.remove();
      guide.setAttribute("stroke-dasharray",len);
      guide.setAttribute("stroke-dashoffset",len*(1-progress));
      animationRender={stroke:active,index:strokeIndex,guide,length:len};

      const ink=svgEl("path",{
        d:outlinePath(active.outline),fill:"#080808",stroke:"none",
        mask:`url(#${id})`
      });
      stage.appendChild(ink);
    }else{
      if(progress>=1){
        stage.appendChild(svgEl("path",{d:outlinePath(active.outline),fill:"#080808"}));
      }
    }
  }
}

let practiceOverlay=null;
function renderPracticeOverlay(){
 if(mode!=="practice"){practiceLayer.replaceChildren();practiceOverlay=null;return;}
 if(!practiceOverlay||!practiceOverlay.hit.isConnected){
  const hit=svgEl('rect',{x:'0',y:'0',width:'2048',height:'2048',fill:'transparent','pointer-events':'all'});
  const line=svgEl('path',{fill:'none',stroke:'var(--student)','stroke-linecap':'round','stroke-linejoin':'round',opacity:'0.85','pointer-events':'none'});
  const dot=svgEl('circle',{fill:'#49a76b',opacity:'0.9','pointer-events':'none'});
  practiceLayer.replaceChildren(hit,line,dot);practiceOverlay={hit,line,dot};
 }
 const {line,dot}=practiceOverlay;
 line.setAttribute('d',studentPoints.map((p,i)=>(i?'L':'M')+' '+p.x+' '+p.y).join(' '));line.setAttribute('stroke-width',compoundPhase?'36':'48');
 const start=hintLevel>=1?strokes[strokeIndex]?.track?.[0]:null;
 dot.style.display=start?'':'none';
 if(start){dot.setAttribute('cx',start.x);dot.setAttribute('cy',start.y);dot.setAttribute('r',compoundPhase?'22':'28');}
}

function duration(){
  const s=document.querySelector('input[name="speed"]:checked').value;
  return s==="slow"?1800:s==="fast"?750:1150;
}

function updateProgress(){
  if(!strokes.length){progressEl.textContent="沒有可用筆順資料";return;}
  if(compoundPhase){
    if(strokeIndex>=strokes.length){
      progressEl.textContent=`${currentSymbol}：第三階段／同格書寫全部完成！`;
    }else{
      const s=strokes[strokeIndex];
      progressEl.textContent=`第三階段／同格書寫：${s.combinedPart===0?"上面":"下面"}「${components[s.combinedPart]}」第 ${s.partStroke} 畫／共 ${s.partStrokeTotal} 畫`;
    }
    return;
  }
  const comp=components[componentIndex];

  if(mode==="practice"){
    if(strokeIndex>=strokes.length){
      progressEl.textContent=`${comp}：練習完成`;
    }else{
      const prefix=components.length>1?`第 ${componentIndex+1} 階段／個別練習：「${comp}」　`:"";
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
    return components.length>1
      ? `練習 ${currentSymbol}：請先寫「${ch}」的第 1 畫`
      : `練習 ${currentSymbol}：請先寫第 1 畫`;
  }
  return components.length>1
    ? `已選擇 ${currentSymbol}；筆順會依序示範 ${components.join("、")}`
    : `已載入「${ch}」的標準筆順資料`;
}

async function loadComponent(index,reset=true){
  const request=++componentLoadEpoch,epoch=practiceEpoch;
  componentIndex=index;
  const ch=components[index];
  stop();clearStudentTrace();setEnabled(false);
  statusEl.textContent=`正在載入「${ch}」的標準筆順資料……`;
  progressEl.textContent="筆順資料載入中";
  stage.innerHTML="";
  try{
    const data=await getStrokeData(ch);
    if(request!==componentLoadEpoch||epoch!==practiceEpoch)return;
    strokes=data;
    if(reset) strokeIndex=0;
    render();
    renderPracticeOverlay();
    updateProgress();
    setEnabled(true);
    updateModeUI();
    statusEl.textContent=getReadyMessage(ch);
  }catch(err){
    if(request!==componentLoadEpoch||epoch!==practiceEpoch)return;
    strokes=[];strokeIndex=0;render();renderPracticeOverlay();setEnabled(false);
    statusEl.textContent="筆順資料未成功載入；為避免誤教，本網站不會顯示猜測筆順。請確認網路後重新點選。";
    progressEl.textContent="標準筆順資料載入失敗";
    console.error(err);
  }
}

/* 第三階段：兩個注音都在各自的大格練習過後，
   才將標準筆順縮放並排到同一個十字格的上、下兩區。 */
async function enterCombinedPractice(){
  if(components.length!==2 || mode!=="practice" || compoundLoading)return;
  const epoch=practiceEpoch, symbol=currentSymbol;
  compoundLoading=true;
  stop();clearStudentTrace();setEnabled(false);
  statusEl.textContent=`前兩階段都完成了！現在練習把「${components[0]}」寫上面、「${components[1]}」寫下面。`;
  progressEl.textContent="正在準備第三階段：兩個注音一起寫在同一格";
  try{
    const originals=await Promise.all(components.map(getStrokeData));
    if(epoch!==practiceEpoch || currentSymbol!==symbol || mode!=="practice")return;
    const built=CompoundGridPractice.build(components,originals);
    strokes=built.strokes;
    compoundRanges=built.ranges;
    compoundPhase=true;
    componentIndex=0;
    strokeIndex=0;
    render();
    renderPracticeOverlay();
    updateProgress();
    setEnabled(true);
    updateModeUI();
    statusEl.textContent=`同格書寫：先在上半格寫「${components[0]}」，再在下半格寫「${components[1]}」。請注意兩個注音的上下位置。`;
  }catch(error){
    if(epoch!==practiceEpoch)return;
    strokes=[];strokeIndex=0;compoundPhase=false;compoundRanges=[];
    render();renderPracticeOverlay();setEnabled(false);
    statusEl.textContent="同格練習需要兩個注音的標準筆順資料；目前載入失敗，請重新選擇注音後再試。";
    progressEl.textContent="同格筆順資料未成功載入";
    console.error(error);
  }finally{
    if(epoch===practiceEpoch)compoundLoading=false;
  }
}

/* 導覽 */
async function selectSymbol(sym){
  clearConfetti();
  practiceEpoch++;
  compoundPhase=false;
  compoundLoading=false;
  compoundRanges=[];
  TeachingOrder.beforeSelect(sym,currentSymbol);
  currentSymbol=sym;components=Array.from(sym);componentIndex=0;
  bigSymbol.textContent=sym;
  window.dispatchEvent(new Event('annotationcontextchange'));
  document.querySelectorAll(".symbol").forEach(b=>b.classList.toggle("active",b.dataset.symbol===sym));
  updateNavigationButtons();
  if(vocabBackdrop.classList.contains("show")){
    renderVocabularyModal();
  }
  speakSymbol(sym);
  await loadComponent(0,true);
}
async function goToPreviousSymbol(){
  clearConfetti();
  const order=TeachingOrder.order();
  const index=order.indexOf(currentSymbol);
  if(index>0) await selectSymbol(order[index-1]);
}
async function goToNextSymbol(){
  clearConfetti();
  const order=TeachingOrder.order();
  const index=order.indexOf(currentSymbol);
  if(index>=0 && index<order.length-1){
    await selectSymbol(order[index+1]);
  }
}

/* 播放 */
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
  closeVocab(false);
  clearConfetti();
  if(compoundPhase || compoundLoading){
    practiceEpoch++;
    compoundPhase=false;compoundLoading=false;compoundRanges=[];
    mode="play";updateModeUI();
    loadComponent(0,true).then(()=>{
      if(strokes.length)playCurrent();
    });
    return;
  }
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
      statusEl.textContent = `已完成 ${currentSymbol} 的筆順播放`;
    }
  }
  loop();
}
function nextStrokePlayback(){
  closeVocab(false);
  clearConfetti();
  if(compoundPhase || compoundLoading){
    practiceEpoch++;
    compoundPhase=false;compoundLoading=false;compoundRanges=[];
    mode="play";updateModeUI();
    loadComponent(0,true).then(()=>{
      if(strokes.length)nextStrokePlayback();
    });
    return;
  }
  mode="play";updateModeUI();clearStudentTrace();
  stop();
  if(strokeIndex>=strokes.length) strokeIndex=0;
  animateStroke(strokeIndex,()=>{});
}

/* 練習模式 */
async function enterPracticeMode(){
  closeVocab(false);
  clearConfetti();
  practiceEpoch++;
  compoundPhase=false;compoundLoading=false;compoundRanges=[];
  mode="practice";
  updateModeUI();
  stop();
  componentIndex=0;
  strokeIndex=0;
  await loadComponent(0,true);
  render();
  renderPracticeOverlay();
  updateProgress();
  statusEl.textContent = components.length>1
    ? `請依照筆畫順序描寫 ${currentSymbol}，先寫「${components[0]}」`
    : `請依照筆畫順序描寫 ${currentSymbol}`;
}
function getSvgPointFromEvent(evt){
  const rect = practiceLayer.getBoundingClientRect();
  const x = (evt.clientX - rect.left) / rect.width * 2048;
  const y = (evt.clientY - rect.top) / rect.height * 2048;
  return {x, y};
}
function dist(a,b){
  const dx=a.x-b.x, dy=a.y-b.y;
  return Math.hypot(dx,dy);
}
function polylineLength(points){
  let sum=0;
  for(let i=1;i<points.length;i++) sum += dist(points[i-1], points[i]);
  return sum;
}
function pointToSegmentDistance(p,a,b){
  const l2 = (b.x-a.x)**2 + (b.y-a.y)**2;
  if(l2===0) return dist(p,a);
  let t = ((p.x-a.x)*(b.x-a.x) + (p.y-a.y)*(b.y-a.y))/l2;
  t = Math.max(0, Math.min(1,t));
  const proj = {x:a.x + t*(b.x-a.x), y:a.y + t*(b.y-a.y)};
  return dist(p,proj);
}
function pointToPolylineDistance(point, points){
  let best = Infinity;
  for(let i=1;i<points.length;i++){
    best = Math.min(best, pointToSegmentDistance(point, points[i-1], points[i]));
  }
  return best===Infinity ? dist(point, points[0]) : best;
}
function nearestTrackIndex(point, track){
  let best = 0;
  let bestD = Infinity;
  for(let i=0;i<track.length;i++){
    const d = dist(point, track[i]);
    if(d < bestD){ bestD = d; best = i; }
  }
  return best;
}
function evaluateStudentTrace(student, targetTrack){
  if(!targetTrack || targetTrack.length<2){
    return {ok:false, message:"這一畫暫時無法練習"};
  }
  if(student.length < 5){
    return {ok:false, message:"請把這一畫寫完整再放開"};
  }

  const studentLen = polylineLength(student);
  const targetLen = polylineLength(targetTrack);

  if(studentLen < Math.max(compoundPhase?45:120, targetLen*0.35)){
    return {ok:false, message:"這一畫寫得太短，請再試一次"};
  }
  if(studentLen > targetLen*3.2){
    return {ok:false, message:"這一畫超出太多，請沿著字形再試一次"};
  }

  const scale=compoundPhase?(strokes[strokeIndex]?.combinedScale||0.6):1;
  const startTol = compoundPhase?Math.max(85,Math.round(240*scale)):220;
  const endTol = compoundPhase?Math.max(100,Math.round(280*scale)):260;
  const coverTol = compoundPhase?Math.max(80,Math.round(200*scale)):180;

  if(dist(student[0], targetTrack[0]) > startTol){
    return {ok:false, message:"請從正確的起筆位置開始"};
  }
  if(dist(student[student.length-1], targetTrack[targetTrack.length-1]) > endTol){
    return {ok:false, message:"收筆位置不太對，請再試一次"};
  }

  const mapped = student.map(p => nearestTrackIndex(p, targetTrack));
  let backtracks = 0;
  for(let i=1;i<mapped.length;i++){
    if(mapped[i] + 1 < mapped[i-1]) backtracks++;
  }
  if(backtracks > Math.max(2, Math.floor(student.length * 0.08))){
    return {ok:false, message:"筆畫方向不正確，請依照正確方向書寫"};
  }

  let covered = 0;
  for(let i=0;i<targetTrack.length;i++){
    if(pointToPolylineDistance(targetTrack[i], student) <= coverTol) covered++;
  }
  const coverage = covered / targetTrack.length;
  if(coverage < 0.6){
    return {ok:false, message:"請沿著提示字形把這一畫寫完整"};
  }

  return {ok:true};
}

async function completeCurrentPracticeStroke(){
  // 每一筆正確時先給正向聲音回饋
  playCorrectSound();

  strokeIndex++;
  clearStudentTrace();
  render();
  renderPracticeOverlay();
  updateProgress();

  if(strokeIndex < strokes.length){
    if(compoundPhase && strokes[strokeIndex]?.combinedPart!==strokes[strokeIndex-1]?.combinedPart){
      statusEl.textContent=`上面的「${components[0]}」完成了！接著在下半格寫「${components[1]}」。`;
    }else{
      statusEl.textContent = `很好！這一筆正確，請繼續寫第 ${compoundPhase?strokes[strokeIndex].partStroke:strokeIndex+1} 畫`;
    }
    return;
  }

  // 個別練習完成後，先處理兩個注音的下一個階段
  if(!compoundPhase && componentIndex===components.length-1 && components.length===2){
    await enterCombinedPractice();
    return;
  }

  // 當前組件完成
  if(!compoundPhase && componentIndex < components.length - 1){
    const next = componentIndex + 1;
    statusEl.textContent = `很好！接下來練習「${components[next]}」`;
    await loadComponent(next,true);
    render();
    renderPracticeOverlay();
    updateProgress();
  } else {
    statusEl.textContent = compoundPhase
      ? `太棒了！你已把「${components[0]}」和「${components[1]}」依照上下順序寫在同一格！`
      : `太棒了！你已完成 ${currentSymbol} 的筆順練習`;
    progressEl.textContent = compoundPhase
      ? `${currentSymbol}：個別練習＋同格書寫全部完成`
      : `${currentSymbol}：全部筆順練習完成`;
    // 整個注音完成後播放鼓掌與彩帶獎勵
    setTimeout(()=>{
      playApplauseSound();
      launchConfetti();
    }, 180);
  }
}

async function finishPracticeAttempt(){
  if(mode!=="practice" || compoundLoading || !strokes[strokeIndex]) return;
  const result = evaluateStudentTrace(studentPoints, strokes[strokeIndex].track);
  if(result.ok){
    await completeCurrentPracticeStroke();
  }else{
    playWrongSound();
    statusEl.textContent = `${result.message}，再試一次`;
    clearStudentTrace();
    render();
    renderPracticeOverlay();
    updateProgress();
  }
}

practiceLayer.addEventListener("pointerdown", (evt)=>{
  if(evt.button!==0 || mode!=="practice" || compoundLoading || !strokes.length || strokeIndex>=strokes.length) return;
  evt.preventDefault(); // Never begin browser text selection while writing.
  getAudioContext();
  stop();
  isDrawing = true;
  studentPoints = [getSvgPointFromEvent(evt)];
  practiceLayer.setPointerCapture(evt.pointerId);
  renderPracticeOverlay();
});

practiceLayer.addEventListener("pointermove", (evt)=>{
  if(!isDrawing || mode!=="practice") return;
  evt.preventDefault();
  const p = getSvgPointFromEvent(evt);
  const last = studentPoints[studentPoints.length-1];
  if(!last || dist(p,last) > 8){
    studentPoints.push(p);
    renderPracticeOverlay();
  }
});

async function endPointer(evt){
  if(!isDrawing) return;
  evt.preventDefault();
  isDrawing = false;
  if(practiceLayer.hasPointerCapture(evt.pointerId)){
    practiceLayer.releasePointerCapture(evt.pointerId);
  }
  await finishPracticeAttempt();
}
practiceLayer.addEventListener("pointerup", endPointer);
practiceLayer.addEventListener("pointercancel", ()=>{
  isDrawing = false;
});

async function replayAction(){
  closeVocab(false);
  clearConfetti();
  stop();
  practiceEpoch++;
  compoundPhase=false;compoundLoading=false;compoundRanges=[];
  if(mode==="practice"){
    componentIndex=0;
    strokeIndex=0;
    await loadComponent(0,true);
    render();
    renderPracticeOverlay();
    updateProgress();
    statusEl.textContent = `已重新開始 ${currentSymbol} 的筆順練習`;
  }else{
    componentIndex=0;
    await loadComponent(0,true);
    playCurrent();
  }
}

function clearAction(){
  closeVocab(false);
  clearConfetti();
  stop();
  if(mode==="practice"){
    if(compoundPhase && strokeIndex>=strokes.length){
      strokeIndex=0;
      statusEl.textContent=`重新開始同格書寫：上面寫「${components[0]}」，下面寫「${components[1]}」。`;
    }else{
      statusEl.textContent = `已清除目前這一筆，請再試一次`;
    }
    clearStudentTrace();
    render();
    renderPracticeOverlay();
    updateProgress();
  }else{
    strokeIndex=0;
    render();
    renderPracticeOverlay();
    updateProgress();
    statusEl.textContent = `已清除目前播放結果`;
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

speakBtn.onclick=()=>{ closeVocab(false); clearConfetti(); getAudioContext(); speakSymbol(currentSymbol); };
mainPlayBtn.onclick=playCurrent;
practiceBtn.onclick=enterPracticeMode;
vocabBtn.onclick=openVocab;
prevSymbolBtn.onclick=goToPreviousSymbol;
nextSymbolBtn.onclick=goToNextSymbol;
playBtn.onclick=playCurrent;
nextBtn.onclick=nextStrokePlayback;
replayBtn.onclick=replayAction;
clearBtn.onclick=clearAction;

vocabCloseBtn.addEventListener("click", ()=>closeVocab());
vocabBackdrop.addEventListener("click", (event)=>{
  if(event.target === vocabBackdrop) closeVocab();
});

hintLevelRange.addEventListener("input", ()=>{
  hintLevel = Number(hintLevelRange.value);
  updateHintLevelUI();
  render();
  renderPracticeOverlay();
});

function openHelp(){
  closeVocab(false);
  clearConfetti();
  helpBackdrop.classList.add("show");
  helpCloseBtn.focus();
}
function closeHelp(){
  helpBackdrop.classList.remove("show");
  helpBtn.focus();
}
helpBtn.addEventListener("click", openHelp);
helpCloseBtn.addEventListener("click", closeHelp);
helpBackdrop.addEventListener("click", (event)=>{
  if(event.target === helpBackdrop) closeHelp();
});
document.addEventListener("keydown", (event)=>{
  if(event.key === "Escape" && vocabBackdrop.classList.contains("show")){
    closeVocab();
    return;
  }
  if(event.key === "Escape" && helpBackdrop.classList.contains("show")){
    closeHelp();
  }
});

updateModeUI();
updateHintLevelUI();

// Measure the actual header, player controls and bottom slider rather than
// guessing a fixed height; keep the SVG viewBox and pointer coordinates intact.
function fitPracticeBoard(){
 const page=document.getElementById('learningPage');
 if(page.hidden||document.body.classList.contains('teacher-region-active')) return;
 const workspace=page.querySelector('.practice-workspace');
 const stageBox=page.querySelector('.stage-stack');
 const player=page.querySelector('.player');
 const main=page.querySelector('.practice-main');
 const hint=workspace.querySelector('.hint-control');
 const extraHeight=player.getBoundingClientRect().height-stageBox.getBoundingClientRect().height;
 const mainStyle=getComputedStyle(main);
 const panelPadding=parseFloat(mainStyle.paddingTop)+parseFloat(mainStyle.paddingBottom);
 const availableHeight=window.innerHeight-workspace.getBoundingClientRect().top-hint.getBoundingClientRect().height-extraHeight-panelPadding-18;
 const availableWidth=page.querySelector('.board-wrap').clientWidth;
 const size=Math.max(0,Math.min(460,availableWidth,Math.max(180,availableHeight)));
 workspace.style.setProperty('--practice-board-size',Math.floor(size)+'px');
}
window.addEventListener('resize',()=>requestAnimationFrame(fitPracticeBoard));
if(document.fonts) document.fonts.ready.then(()=>requestAnimationFrame(fitPracticeBoard));



window.Bopomofo={enter(){TeachingOrder.onRoute("learn");requestAnimationFrame(fitPracticeBoard);},leave(){practiceEpoch++;componentLoadEpoch++;stop();isDrawing=false;closeVocab(false);helpBackdrop.classList.remove("show");TeachingOrder.onRoute("other");}};

})();

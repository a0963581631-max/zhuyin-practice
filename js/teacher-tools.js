/* Shared teacher tools: isolated styles, no external dependencies. */
(()=>{
'use strict';
const host=document.createElement('div');host.id='teacherTools';host.style.cssText='position:fixed;inset:0;z-index:10000;pointer-events:none';document.body.append(host);
const root=host.attachShadow({mode:'open'});
root.innerHTML=`<style>
:host{font:16px/1.5 system-ui,"Microsoft JhengHei",sans-serif;color:#214858}*{box-sizing:border-box}[hidden]{display:none!important}button,input,select{font:inherit}button{cursor:pointer;border:1px solid #c4dce1;border-radius:12px;background:#fff;color:#214858;min-height:44px;padding:8px 12px}button:hover{background:#e2f5f6}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #258bba;outline-offset:2px}button[aria-pressed=true]{background:#c6edef;border-color:#398f99}button:disabled{opacity:.45;cursor:default}.glass{background:rgba(244,253,255,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid #ffffffc9;box-shadow:0 8px 32px #234d6530}
#handle{pointer-events:auto;position:fixed;right:0;top:50%;transform:translateY(-50%);width:44px;height:76px;padding:0;border-radius:20px 0 0 20px;font-size:25px;color:#397888}
#rail{pointer-events:auto;position:fixed;right:10px;top:50%;transform:translateY(-50%);padding:8px;display:flex;flex-direction:column;gap:8px;border-radius:22px;max-height:95dvh;overflow:auto;width:82px}#rail button{border:0;background:transparent;padding:6px 2px;flex-shrink:0}#rail button:hover,#rail button[aria-pressed=true]{background:#cdecef}#rail .icon{display:block;font-size:27px;line-height:1.2}#rail .label{font-size:13px;font-weight:700}#rail #collapse{font-size:24px;min-height:36px}
.panel{pointer-events:auto;position:fixed;right:102px;top:50%;transform:translateY(-50%);width:min(340px,calc(100vw - 116px));max-height:90dvh;overflow:auto;border-radius:20px;padding:18px;background:#f7fcfd;box-shadow:0 10px 40px #20485830;border:1px solid #d1e6e9}.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.head h2{font-size:19px;margin:0}.close{font-size:22px;padding:0 10px}.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0}.muted{font-size:13px;color:#5b7782;margin:8px 0}input[type=color]{width:46px;height:44px;padding:3px;border:1px solid #b9d6dd;border-radius:10px}select,input[type=number]{border:1px solid #b9d6dd;border-radius:9px;background:white;padding:8px;max-width:100%}input[type=number]{width:75px}output.big{display:block;text-align:center;font-size:64px;font-weight:750;font-variant-numeric:tabular-nums;line-height:1.3;color:#237b88}.count-actions{justify-content:center}.count-actions button{font-size:25px;min-width:64px}.dots{display:grid;grid-template-columns:repeat(10,1fr);gap:5px;max-height:160px;overflow:auto}.dot{aspect-ratio:1;background:#42a9af;border-radius:50%}.dot:nth-child(10n+6),.dot:nth-child(10n+7),.dot:nth-child(10n+8),.dot:nth-child(10n+9),.dot:nth-child(10n+10){background:#77bacf}#timerStatus{min-height:24px;text-align:center}#timerStatus.done{color:#a44c15;font-weight:bold}#ink{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;touch-action:none}#ink.active{pointer-events:auto;cursor:crosshair}#board{pointer-events:auto;position:fixed;inset:16px 102px 16px 16px;border-radius:20px;overflow:hidden;background:white;box-shadow:0 10px 45px #16394b40;border:1px solid #c9e3e9;display:flex;flex-direction:column}#board .head{padding:12px 16px;margin:0;background:#eef8fa;flex-shrink:0}#board .row{margin:0}#boardArea{position:relative;flex:1;min-height:100px}#boardCanvas{width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}.grid{background-image:linear-gradient(#dce9ef 1px,transparent 1px),linear-gradient(90deg,#dce9ef 1px,transparent 1px);background-size:32px 32px}
@media(max-width:600px){#rail{right:4px;width:68px;padding:5px}#rail .icon{font-size:24px}.panel{right:80px;width:calc(100vw - 90px);padding:12px}#board{inset:8px 80px 8px 8px}#board .head{flex-wrap:wrap;padding:8px}output.big{font-size:48px}.dots{gap:3px}}
/* Counting tool: compact vertical slider and always-visible 10x10 dots */
.dots.grouped .dot{background:#298fa2}.dots.grouped .dot.group-alt{background:#8cc9cc}
#count{width:min(460px,calc(100vw - 116px));height:min(700px,92dvh);max-height:92dvh;display:flex;padding:0;overflow:hidden}
#count .count-shell{display:grid;grid-template-columns:96px minmax(0,1fr);width:100%;height:100%;min-width:0;min-height:0}
#count .count-side{display:flex;flex-direction:column;align-items:center;gap:9px;min-width:0;min-height:0;padding:12px 7px;background:#eaf6f8;border-right:1px solid #c7e1e7;overflow:hidden}
#count .count-step-area{display:flex;align-items:center;flex-direction:column;flex:1;min-height:0;width:100%}
#count .count-step-label{font-size:13px;font-weight:800;color:#426b7a;flex:none;margin:2px 0 5px}
#count .count-step-selector{display:flex;flex:1;min-height:78px;max-height:320px;align-items:stretch;justify-content:center;gap:4px;width:100%}
#countStepSlider{display:block;writing-mode:vertical-lr;direction:rtl;appearance:auto;accent-color:#248e9d;cursor:pointer;min-height:0;width:28px;height:100%;margin:0;padding:0}
#count .count-step-ticks{display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;height:100%;min-width:27px;padding:2px 0}
#count .count-step-ticks span{display:block;text-align:center;font-variant-numeric:tabular-nums;font-size:14px;font-weight:750;line-height:1.2;padding:1px;border-radius:6px;cursor:pointer;user-select:none}
#count .count-step-ticks span.selected{background:#b5e5e2;color:#125d69}
#count #countReset{width:100%;font-size:13px;min-height:40px;padding:4px 2px;flex:none}
#count .count-speech{display:flex;align-items:center;justify-content:center;gap:2px;white-space:nowrap;font-size:12px;min-height:28px;cursor:pointer;flex:none}
#count .count-speech input{margin:0 2px 0 0}
#count .count-stage{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0;min-height:0;padding:39px 14px 14px}
#count .count-close{position:absolute;top:7px;right:8px;font-size:22px;line-height:1;min-height:28px;padding:1px 10px}
#count #number{flex:none;display:block;width:100%;max-width:100%;height:clamp(72px,15vh,110px);text-align:center;font-size:clamp(46px,8vh,92px);font-weight:800;line-height:1.1;color:#237b88;font-variant-numeric:tabular-nums;background:transparent;border:1px dashed #a8d2d8;border-radius:12px;appearance:textfield;padding:0 4px}
#count #number::-webkit-inner-spin-button,#count #number::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
#count .count-actions{flex:none;justify-content:center;gap:12px;margin:0}
#count .count-actions button{font-size:25px;min-width:74px;min-height:46px;padding:5px 12px;font-weight:800}
#count .dots{display:grid;flex:1 1 auto;min-height:0;min-width:0;width:100%;height:auto;max-height:none;overflow:hidden;gap:var(--count-dot-gap,4px);grid-template-columns:repeat(10,var(--count-dot-size,12px));grid-template-rows:repeat(10,var(--count-dot-size,12px));justify-content:center;align-content:center;margin:0;padding:0}
#count .dot{display:block;width:var(--count-dot-size,12px);height:var(--count-dot-size,12px);max-height:none;aspect-ratio:1;border-radius:50%}
#count .dot.is-empty{visibility:hidden}
@media(max-width:600px){
 #count{right:80px;width:calc(100vw - 90px)}
 #count .count-shell{grid-template-columns:65px minmax(0,1fr)}
 #count .count-side{padding:7px 3px;gap:5px}
 #count .count-step-selector{gap:0}
 #countStepSlider{width:25px}
 #count .count-step-ticks{min-width:23px}
 #count .count-step-ticks span{font-size:12px}
 #count .count-stage{padding:34px 5px 7px;gap:6px}
 #count #number{font-size:clamp(38px,8vh,65px);height:clamp(60px,14vh,92px)}
 #count .count-actions button{min-width:52px;font-size:20px;padding:4px 7px;min-height:40px}
}
@media(max-height:480px){
 #count .count-side{gap:4px;padding-top:5px;padding-bottom:5px}
 #count .count-stage{padding-top:27px;gap:4px;padding-bottom:5px}
 #count #number{height:clamp(42px,16vh,70px);font-size:clamp(38px,13vh,64px)}
 #count .count-actions button{min-height:32px;padding:1px 8px;font-size:19px}
 #count #countReset{min-height:30px}
 #count .count-speech{min-height:23px}
}
#boardCanvas{pointer-events:none}#boardCanvas.active{pointer-events:auto}#board .board-panel{position:absolute;inset:80px 12px auto auto;transform:none;width:min(340px,calc(100% - 24px));max-height:calc(100% - 100px);z-index:2}#stopwatchClock{font-size:clamp(26px,4vw,48px);white-space:nowrap}
@media(max-width:600px){#board .board-panel{top:155px;max-height:calc(100% - 170px)}#board .head .row{gap:4px}#board .head button{padding:6px 8px}}

/* Teacher teaching aids: hundred charts */
#aids .chart-list{display:grid;gap:12px}
#aids .chart-choice{display:flex;align-items:center;gap:12px;width:100%;min-height:100px;text-align:left;border:2px solid #bfdce3;border-radius:15px;padding:9px;background:#fff}
#aids .chart-choice:hover,#aids .chart-choice:focus-visible{border-color:#167f94;background:#eaf9f6}
#aids .chart-thumb{display:block;width:76px;height:78px;object-fit:contain;border-radius:6px;border:1px solid #dbe7eb;flex:none;background:white}
#aids .chart-option-text{font-size:15px;font-weight:800;line-height:1.5}
#aids .chart-option-text small{display:block;color:#597786;font-size:12px;font-weight:500}
#hundredOverlay{pointer-events:auto;position:fixed;inset:0;background:rgba(18,44,57,.76);z-index:120;display:grid;place-items:center;padding:12px}
#hundredStage{width:min(970px,calc(100vw - 26px));height:min(98dvh,1050px);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;background:#fff;border:2px solid #c9e5eb;border-radius:20px;overflow:hidden;box-shadow:0 25px 80px #102f475b;pointer-events:auto}
#hundredStage .hundred-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#e8f6f7;padding:9px 15px;flex:none}
#hundredStage .hundred-head strong{font-size:20px;line-height:1.3}
#hundredStage .hundred-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#hundredStage .hundred-actions button{font-size:14px;min-height:39px;padding:6px 10px}
#hundredStage .hundred-switch{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;padding:7px 12px;background:#f7fbfc;flex:none}
#hundredStage .hundred-switch button{font-size:14px;font-weight:750;min-height:36px;padding:5px 10px}
#hundredStage .hundred-switch button[aria-pressed=true]{background:#caeae2;border-color:#458b89}
#hundredStage .hundred-image-area{flex:1;min-height:0;display:block;padding:6px;background:#fff;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;touch-action:pan-x pan-y}
#hundredImageWrap{position:relative;width:100%;height:auto;margin:0 auto;line-height:0}
#hundredStage img#hundredImage{display:block;width:100%;height:auto;max-height:none;object-fit:unset;user-select:none}
#hundredImageWrap #ink{position:absolute;inset:0;width:100%;height:100%;z-index:3}
#hundredStage .hundred-image-area:focus-visible{outline:3px solid #248da0;outline-offset:-3px}
#hundredOverlay{padding:12px 103px 12px 12px}
#hundredStage{width:min(970px,100%)}
#handle,#rail{z-index:230}
.panel{z-index:240}
#board{z-index:200}
#ink{z-index:190}
@media(max-width:600px){#hundredOverlay{padding:5px 77px 5px 4px}#hundredStage{width:100%}}
@media(max-width:640px){#aids .chart-thumb{width:60px;height:66px}#hundredStage .hundred-head{padding:7px}#hundredStage .hundred-head strong{font-size:17px}#hundredStage .hundred-actions button{font-size:12px;padding:4px 7px}}
</style>
<canvas id="ink" hidden aria-label="頁面畫筆區"></canvas>
<section id="board" hidden aria-label="白板"><div class="head"><h2>白板</h2><div class="row"><button id="boardMouse" aria-pressed="true">↖ 滑鼠</button><button id="boardPen" aria-pressed="false">✎ 畫筆</button><button id="boardErase" aria-pressed="false">▱ 橡皮擦</button><button id="boardUndo">復原</button><button id="boardGrid" aria-pressed="false">格線</button><button class="close" data-close aria-label="關閉白板">×</button></div></div><div id="boardArea"><canvas id="boardCanvas" aria-label="白板書寫區"></canvas></div></section>
<button id="handle" class="glass" aria-label="展開教學功能欄" aria-expanded="false" aria-controls="rail" title="教學工具">◀</button>
<aside id="rail" class="glass" hidden aria-label="教學功能欄"><button id="collapse" aria-label="隱藏教學功能欄">×</button><button data-tool="mouse" aria-pressed="true"><span class="icon">↖</span><span class="label">滑鼠</span></button><button data-tool="pen" aria-pressed="false"><span class="icon">✎</span><span class="label">畫筆</span></button><button data-tool="eraser" aria-pressed="false"><span class="icon">▱</span><span class="label">橡皮擦</span></button><button data-tool="count" aria-pressed="false"><span class="icon">①</span><span class="label">數數</span></button><button data-tool="timer" aria-pressed="false"><span class="icon">⏱</span><span class="label">計時器</span></button><button data-tool="board" aria-pressed="false"><span class="icon">▤</span><span class="label">白板</span></button><button id="regionZoom" type="button" aria-pressed="false"><span class="icon">⤢</span><span class="label">框選放大</span></button><button id="viewReset" type="button" hidden><span class="icon">↙</span><span class="label">還原</span></button><button id="viewFullscreen" type="button" aria-pressed="false"><span class="icon">⛶</span><span class="label">全螢幕</span></button><button data-tool="aids" aria-pressed="false"><span class="icon">▦</span><span class="label">教具</span></button></aside>
<section id="pen" class="panel" hidden aria-label="畫筆工具"><div class="head"><h2>畫筆設定</h2><button class="close" data-close aria-label="關閉畫筆">×</button></div><p class="muted">設定完成後按「確認」，收起面板並開始繪畫。</p><div class="row"><label>顏色 <input id="penColor" type="color" value="#e15060"></label><label>粗細 <select id="penWidth"><option value="3">細筆</option><option value="6" selected>中筆</option><option value="12">粗筆</option></select></label></div><div class="row"><label>線條／圖形 <select id="penShape"><option value="free">曲線（自由畫）</option><option value="line">直線</option><option value="square">方形（自由長寬）</option><option value="circle">圓形／橢圓</option></select></label></div><div class="row"><label>圖形填色 <select id="penFill" disabled><option value="outline">空心</option><option value="solid">實心</option></select></label></div><p class="muted">拖曳自由控制圖形長寬；方形與圓形可選實心或空心。</p><div class="row"><button id="penConfirm">確認</button><button id="penUndo">復原上一筆</button></div><p class="muted">按側欄「滑鼠」即可操作教材。畫記依教材分開保留，捲動不會清除；重新整理後不保留。</p></section>
<section id="eraser" class="panel" hidden aria-label="橡皮擦工具"><div class="head"><h2>橡皮擦</h2><button class="close" data-close aria-label="關閉橡皮擦">×</button></div><label for="eraseSize">擦除直徑：<output id="eraseSizeLabel">32</output> px</label><div class="row"><input id="eraseSize" type="range" min="8" max="120" step="4" value="32" style="width:100%"></div><div class="row"><button id="eraseConfirm">確認</button><button id="eraseClear">全部清除</button><button id="eraseUndo">復原上一筆</button></div><p class="muted">按確認後拖曳擦除畫記；按「滑鼠」回復網頁操作。</p></section>
<section id="count" class="panel" hidden aria-label="數數工具">
 <div class="count-shell">
  <aside class="count-side" aria-label="數數控制">
   <div class="count-step-area">
    <label class="count-step-label" for="countStepSlider">跳數</label>
    <div class="count-step-selector">
     <input id="countStepSlider" type="range" min="0" max="4" step="1" value="0" aria-label="每次數幾個" aria-valuetext="每次數1個" />
     <div class="count-step-ticks" aria-hidden="true">
      <span data-count-step-index="4">10</span><span data-count-step-index="3">5</span><span data-count-step-index="2">3</span><span data-count-step-index="1">2</span><span data-count-step-index="0" class="selected">1</span>
     </div>
    </div>
   </div>
   <button id="countReset" type="button">歸零</button>
   <label class="count-speech"><input id="readCount" type="checkbox"> 朗讀</label>
  </aside>
  <div class="count-stage">
   <button class="close count-close" type="button" data-close aria-label="關閉數數">×</button>
   <input id="number" type="number" min="0" max="100" step="1" value="0" inputmode="numeric" aria-label="目前數字，可直接輸入0到100"/>
   <div class="row count-actions"><button id="minus" type="button" aria-label="減少1個">−1</button><button id="plus" type="button" aria-label="增加1個">＋1</button></div>
   <div id="dots" class="dots" aria-hidden="true"></div>
  </div>
 </div>
</section>

<section id="aids" class="panel" hidden aria-label="教具">
  <div class="head"><h2>教具</h2><button class="close" data-close aria-label="關閉教具">×</button></div>
  <p class="muted">選擇百數表。可從側欄框選放大或切換全螢幕，方便帶領學生觀察數字排列。</p>
  <h3 style="margin:14px 0 10px;font-size:18px">百數表</h3>
  <div class="chart-list">
    <button class="chart-choice" type="button" data-chart-choice="2" aria-label="開啟每2個一數百數表">
      <img class="chart-thumb" src="assets/teaching-tools/hundreds-chart-by-2.svg" alt="" loading="lazy"/>
      <span class="chart-option-text">每2個一數<small>黃色：2、4、6、8、10……</small></span>
    </button>
    <button class="chart-choice" type="button" data-chart-choice="5" aria-label="開啟每5個一數百數表">
      <img class="chart-thumb" src="assets/teaching-tools/hundreds-chart-by-5.svg" alt="" loading="lazy"/>
      <span class="chart-option-text">每5個一數<small>粉紅色：5、10、15、20……</small></span>
    </button>
    <button class="chart-choice" type="button" data-chart-choice="3" aria-label="開啟每3個一數百數表">
      <img class="chart-thumb" src="assets/teaching-tools/hundreds-chart-by-3.svg" alt="" loading="lazy"/>
      <span class="chart-option-text">每3個一數<small>橘黃色：3、6、9、12……</small></span>
    </button>
  </div>
</section>
<section id="hundredOverlay" hidden aria-label="百數表放大檢視">
  <div id="hundredStage" role="dialog" aria-modal="false" aria-label="百數表" tabindex="-1">
    <div class="hundred-head">
      <div><strong id="hundredTitle">百數表</strong><div style="font-size:12px;color:#597786">滑動／滾輪看下方數字；畫筆與橡皮擦可從右側工具欄開啟</div></div>
      <div class="hundred-actions">
        <button id="hundredClose" type="button" aria-label="關閉百數表">× 關閉</button>
      </div>
    </div>
    <nav class="hundred-switch" aria-label="切換百數表版本">
      <button type="button" data-hundred-select="2" aria-pressed="false">每2個一數</button>
      <button type="button" data-hundred-select="5" aria-pressed="false">每5個一數</button>
      <button type="button" data-hundred-select="3" aria-pressed="false">每3個一數</button>
    </nav>
    <div id="hundredScroll" class="hundred-image-area" tabindex="0" role="region" aria-label="百數表內容，可上下捲動"><div id="hundredImageWrap"><img id="hundredImage" alt="百數表，數字1到100" width="960" height="940"/></div></div>
  </div>
</section>
<section id="timer" class="panel" hidden aria-label="計時器工具"><div class="head"><h2>計時器</h2><button class="close" data-close aria-label="關閉計時器">×</button></div><div class="row"><button id="countdownTab" aria-pressed="true">倒數計時</button><button id="stopwatchTab" aria-pressed="false">碼錶</button></div><div id="countdownPane"><output id="clock" class="big">05:00</output><div class="row"><label><input id="minutes" type="number" min="0" max="99" value="5"> 分</label><label><input id="seconds" type="number" min="0" max="59" value="0"> 秒</label></div><div class="row"><button id="start">開始</button><button id="resetTimer">重設</button></div><p id="timerStatus" role="status">設定時間後按開始</p><p class="muted">收起工具後仍會繼續計時；時間到會顯示提醒並響鈴。</p></div><div id="stopwatchPane" hidden><output id="stopwatchClock" class="big" aria-label="碼錶時間">00:00.00</output><div class="row"><button id="stopwatchStart">開始</button><button id="stopwatchReset">歸零</button></div><p id="stopwatchStatus" role="status">按開始啟動碼錶</p><p class="muted">分：秒．百分秒。切換模式或收起工具後仍持續計時。</p></div></section>`;
const $=id=>root.getElementById(id);
for(const [source,prefix] of [['pen','wbPen'],['eraser','wbErase']]){
 const panel=$(source).cloneNode(true);panel.id=prefix+'Panel';panel.classList.add('board-panel');
 panel.querySelectorAll('[id]').forEach(el=>el.id='wb'+el.id[0].toUpperCase()+el.id.slice(1));
 panel.querySelectorAll('[for]').forEach(el=>el.htmlFor='wb'+el.htmlFor[0].toUpperCase()+el.htmlFor.slice(1));
 panel.querySelector('[data-close]').removeAttribute('data-close');
 panel.querySelector('.close').onclick=()=>setBoardMode('mouse');
 const hints=panel.querySelectorAll('.muted');hints[hints.length-1].textContent='按白板「滑鼠」可停止繪畫；白板內容會保留。';
 $('board').append(panel);
}
let active='',opened=false,count=0,countStep=1,penMode='mouse';

const hundredChartData={
 '2':{title:'百數表｜每2個一數',src:'assets/teaching-tools/hundreds-chart-by-2.svg',alt:'1到100，每隔兩個一數，2、4、6、8、10等數字以黃色標示'},
 '5':{title:'百數表｜每5個一數',src:'assets/teaching-tools/hundreds-chart-by-5.svg',alt:'1到100，5、10、15、20等每5個一數的數字以粉紅色標示'},
 '3':{title:'百數表｜每3個一數',src:'assets/teaching-tools/hundreds-chart-by-3.svg',alt:'1到100，3、6、9、12等每3個一數的數字以橘黃色標示'}
};
function showHundred(type){
 const chart=hundredChartData[type];if(!chart)return;
 const wasOpen=!$('hundredOverlay').hidden;
 view?.reset();
 pen.setContext('hundred:'+type);
 $('hundredImage').src=chart.src;$('hundredImage').alt=chart.alt;$('hundredTitle').textContent=chart.title;
 root.querySelectorAll('[data-hundred-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hundredSelect===type)));
 $('hundredOverlay').hidden=false;
 const ink=$('ink');
 if(ink.parentNode!==$('hundredImageWrap')){$('hundredImageWrap').append(ink);}
 pen.resize();
 if(!wasOpen)$('hundredScroll').scrollTop=0;
 $('hundredStage').focus();
}
function closeHundred(){
 const overlay=$('hundredOverlay');
 if(overlay.hidden)return;
 view?.reset();pen.finish();
 if($('ink').parentNode===$('hundredImageWrap')){
  root.insertBefore($('ink'),$('board'));pen.resize();
 }
 overlay.hidden=true;
 syncAnnotationContext();
}
root.querySelectorAll('[data-chart-choice]').forEach(b=>b.onclick=()=>showHundred(b.dataset.chartChoice));
root.querySelectorAll('[data-hundred-select]').forEach(b=>b.onclick=()=>showHundred(b.dataset.hundredSelect));
$('hundredClose').onclick=()=>{closeHundred();root.querySelector('[data-tool="aids"]')?.focus()};
$('hundredOverlay').addEventListener('click',e=>{if(e.target===$('hundredOverlay'))closeHundred()});
function updateMode(){
 $('ink').classList.toggle('active',!active&&penMode!=='mouse');
 const selected=active||penMode;
 root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===selected)));
 if(penMode==='eraser'){
  const d=Number($('eraseSize').value),size=d+4;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+d/2+'" fill="none" stroke="white" stroke-width="3"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+d/2+'" fill="none" stroke="#214858"/></svg>';
  $('ink').style.cursor='url("data:image/svg+xml,'+encodeURIComponent(svg)+'") '+size/2+' '+size/2+', crosshair';
 }else $('ink').style.cursor='crosshair';
}
function setOpen(v){opened=v;host.classList.toggle('rail-open',v);$('rail').hidden=!v;$('handle').hidden=v;$('handle').setAttribute('aria-expanded',String(v));if(!v){setTool('');$('handle').focus();}}
function setTool(name){pen.finish();setBoardMode('mouse');active=name==='mouse'?'':name;penMode='mouse';for(const n of ['pen','eraser','count','timer','board','aids'])$(n).hidden=n!==active;updateMode();view?.keepVisible();if(name==='board')requestAnimationFrame(()=>board.resize());if(name==='count')requestAnimationFrame(fitCountDots);}
$('handle').onclick=()=>{setOpen(true);$('collapse').focus()};$('collapse').onclick=()=>setOpen(false);
root.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(active===b.dataset.tool?'':b.dataset.tool));
root.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{const old=active;setTool('');root.querySelector('[data-tool="'+old+'"]').focus()});
root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();if(view?.escape()){return;}if(!$('hundredOverlay').hidden){closeHundred();return;}if(active||penMode!=='mouse')setTool('');else setOpen(false)}});
let view=null;
const drawing=(canvas,color,width,page=false)=>TeacherViewTools.createDrawing({canvas,color:()=>$(color).value,width:()=>Number($(width).value),space:page?()=>view?.pageSpace()||null:null});
const pen=drawing($('ink'),'penColor','penWidth',true),board=drawing($('boardCanvas'),'wbPenColor','wbPenWidth');
function confirmPen(mode){setTool('');penMode=mode;pen.erase=mode==='eraser';pen.eraseWidth=Number($('eraseSize').value);pen.shape=$('penShape').value;pen.fill=$('penFill').value==='solid';$('ink').hidden=false;pen.resize();updateMode();root.querySelector('[data-tool="'+mode+'"]').focus()}
$('penConfirm').onclick=()=>confirmPen('pen');$('eraseConfirm').onclick=()=>confirmPen('eraser');
$('penShape').onchange=()=>{$('penFill').disabled=!['square','circle'].includes($('penShape').value)};
$('eraseSize').oninput=()=>{$('eraseSizeLabel').textContent=$('eraseSize').value};
$('penUndo').onclick=$('eraseUndo').onclick=()=>pen.undo();$('eraseClear').onclick=()=>pen.clear();
function setBoardMode(mode,confirmed=false){
 board.finish();$('wbPenPanel').hidden=mode!=='pen'||confirmed;$('wbErasePanel').hidden=mode!=='eraser'||confirmed;
 $('boardCanvas').classList.toggle('active',confirmed&&mode!=='mouse');
 for(const [id,m]of [['boardMouse','mouse'],['boardPen','pen'],['boardErase','eraser']])$(id).setAttribute('aria-pressed',String(mode===m));
 if(confirmed){board.erase=mode==='eraser';board.eraseWidth=Number($('wbEraseSize').value);board.shape=$('wbPenShape').value;board.fill=$('wbPenFill').value==='solid';board.resize();
 if(board.erase){const d=board.eraseWidth,size=d+4,svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+d/2+'" fill="none" stroke="white" stroke-width="3"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+d/2+'" fill="none" stroke="#214858"/></svg>';$('boardCanvas').style.cursor='url("data:image/svg+xml,'+encodeURIComponent(svg)+'") '+size/2+' '+size/2+', crosshair'}else $('boardCanvas').style.cursor='crosshair';
 }
}
$('boardMouse').onclick=()=>setBoardMode('mouse');$('boardPen').onclick=()=>setBoardMode('pen');$('boardErase').onclick=()=>setBoardMode('eraser');
$('wbPenConfirm').onclick=()=>setBoardMode('pen',true);$('wbEraseConfirm').onclick=()=>setBoardMode('eraser',true);
$('wbPenShape').onchange=()=>{$('wbPenFill').disabled=!['square','circle'].includes($('wbPenShape').value)};
$('wbEraseSize').oninput=()=>{$('wbEraseSizeLabel').textContent=$('wbEraseSize').value};
$('boardUndo').onclick=$('wbPenUndo').onclick=$('wbEraseUndo').onclick=()=>board.undo();$('wbEraseClear').onclick=()=>board.clear();
$('boardGrid').onclick=()=>{$('boardGrid').setAttribute('aria-pressed',String($('boardArea').classList.toggle('grid')))};
const countSteps=[1,2,3,5,10];
function fitCountDots(){
 const dots=$('dots');
 if(dots.clientWidth<10||dots.clientHeight<10)return;
 const style=getComputedStyle(dots),gap=parseFloat(style.columnGap)||4;
 const cell=Math.max(1,Math.floor(Math.min((dots.clientWidth-9*gap)/10,(dots.clientHeight-9*gap)/10)));
 dots.style.setProperty('--count-dot-size',cell+'px');
}
new ResizeObserver(fitCountDots).observe($('dots'));
function showCount(speak=true){
 $('number').value=count;
 $('dots').classList.toggle('grouped',countStep>1);
 $('dots').innerHTML=Array.from({length:100},(_,i)=>'<i class="dot'+(i<count?'':' is-empty')+(countStep>1&&Math.floor(i/countStep)%2?' group-alt':'')+'"></i>').join('');
 $('minus').disabled=count-countStep<0;$('plus').disabled=count+countStep>100;
 $('minus').textContent='−'+countStep;$('plus').textContent='＋'+countStep;
 $('minus').setAttribute('aria-label','減少'+countStep+'個');$('plus').setAttribute('aria-label','增加'+countStep+'個');
 if(speak&&$('readCount').checked&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(count));u.lang='zh-TW';speechSynthesis.speak(u)}
}
function selectCountStep(index){
 const next=countSteps[index];
 if(next===undefined||next===countStep)return;
 countStep=next;count=0;
 $('countStepSlider').value=String(index);
 $('countStepSlider').setAttribute('aria-valuetext','每次數'+countStep+'個');
 root.querySelectorAll('[data-count-step-index]').forEach(t=>t.classList.toggle('selected',Number(t.dataset.countStepIndex)===index));
 showCount(false);
}
$('countStepSlider').oninput=e=>selectCountStep(Number(e.target.value));
root.querySelectorAll('[data-count-step-index]').forEach(t=>t.onclick=()=>selectCountStep(Number(t.dataset.countStepIndex)));
function commitCount(){const raw=$('number').value.trim(),value=Number(raw);if(raw!==''&&Number.isFinite(value))count=Math.max(0,Math.min(100,Math.floor(value)));showCount()}
$('number').onchange=commitCount;$('number').onfocus=()=>$('number').select();$('number').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('number').blur()}else if(e.key==='Escape'){e.stopPropagation();showCount(false);$('number').blur()}};
$('plus').onclick=()=>{if(count+countStep<=100){count+=countStep;showCount()}};
$('minus').onclick=()=>{if(count-countStep>=0){count-=countStep;showCount()}};
$('countReset').onclick=()=>{count=0;showCount()};
showCount(false);
let stopwatchElapsed=0,stopwatchSince=0,stopwatchRunning=false,stopwatchTicker=null;
function stopwatchValue(){return stopwatchElapsed+(stopwatchRunning?performance.now()-stopwatchSince:0)}
function renderStopwatch(){const cs=Math.floor(stopwatchValue()/10),sec=Math.floor(cs/100);$('stopwatchClock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')+'.'+String(cs%100).padStart(2,'0');$('stopwatchStart').textContent=stopwatchRunning?'暫停':stopwatchElapsed?'繼續':'開始'}
function timerMode(mode){const sw=mode==='stopwatch';$('countdownPane').hidden=sw;$('stopwatchPane').hidden=!sw;$('countdownTab').setAttribute('aria-pressed',String(!sw));$('stopwatchTab').setAttribute('aria-pressed',String(sw));renderStopwatch()}
$('countdownTab').onclick=()=>timerMode('countdown');$('stopwatchTab').onclick=()=>timerMode('stopwatch');
$('stopwatchStart').onclick=()=>{if(stopwatchRunning){stopwatchElapsed=stopwatchValue();stopwatchRunning=false;clearInterval(stopwatchTicker);$('stopwatchStatus').textContent='已暫停'}else{stopwatchSince=performance.now();stopwatchRunning=true;stopwatchTicker=setInterval(renderStopwatch,40);$('stopwatchStatus').textContent='計時中'}renderStopwatch()};
$('stopwatchReset').onclick=()=>{clearInterval(stopwatchTicker);stopwatchRunning=false;stopwatchElapsed=0;$('stopwatchStatus').textContent='按開始啟動碼錶';renderStopwatch()};
document.addEventListener('visibilitychange',renderStopwatch);
let remaining=300000,deadline=0,running=false,started=false,ticker=null,audio=null;
function renderTime(){const s=Math.max(0,Math.ceil(remaining/1000));$('clock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');$('start').textContent=running?'暫停':started?'繼續':'開始';$('minutes').disabled=$('seconds').disabled=started}
function configured(){const m=Math.max(0,Math.min(99,Math.floor(Number($('minutes').value)||0))),s=Math.max(0,Math.min(59,Math.floor(Number($('seconds').value)||0)));$('minutes').value=m;$('seconds').value=s;return(m*60+s)*1000}
function beep(){try{if(!audio)return;for(let i=0;i<3;i++){const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.45;o.connect(g);g.connect(audio.destination);o.frequency.value=880;g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.31)}}catch{}}
function tick(){if(!running)return;remaining=Math.max(0,deadline-Date.now());if(!remaining){running=false;started=false;clearInterval(ticker);$('timerStatus').textContent='時間到！';$('timerStatus').className='done';if(!host.hidden){setOpen(true);setTool('timer');timerMode('countdown')}beep()}renderTime()}
$('start').onclick=()=>{if(running){remaining=Math.max(0,deadline-Date.now());running=false;clearInterval(ticker);$('timerStatus').textContent='已暫停'}else{if(!started)remaining=configured();if(!remaining){$('timerStatus').textContent='請設定大於 0 秒的時間';return}try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{})}catch{}started=running=true;deadline=Date.now()+remaining;clearInterval(ticker);ticker=setInterval(tick,150);$('timerStatus').className='';$('timerStatus').textContent='計時中'}renderTime()};
$('resetTimer').onclick=()=>{clearInterval(ticker);running=started=false;remaining=configured();$('timerStatus').className='';$('timerStatus').textContent='設定時間後按開始';renderTime()};for(const id of ['minutes','seconds'])$(id).onchange=()=>{if(!started){remaining=configured();renderTime()}};document.addEventListener('visibilitychange',tick);
function annotationKey(){
 const h=location.hash||'#home';
 if(/^#chinese-1-first-(pretty|scissors-rock-paper|tadpole-mom)$/.test(h))return h+'|'+document.getElementById('prettyImage').getAttribute('src');
 if(h==='#learn')return h+'|'+document.getElementById('bigSymbol').textContent;
 if(h==='#chinese-1-first-pretty-quiz')return h+'|'+(!document.getElementById('quizSetup').hidden?'setup':!document.getElementById('quizResults').hidden?'results':document.getElementById('quizProgress').textContent);
 return h;
}
function syncAnnotationContext(){
 pen.setContext(annotationKey());$('ink').hidden=false;pen.resize();
}
view=TeacherViewTools.createView({host,root,restoreSource(source){if(['count','board'].includes(source.id))source.hidden=active!==source.id;},prepare(){pen.finish();penMode='mouse';updateMode();},redraw(){pen.resize();board.resize();requestAnimationFrame(fitCountDots);}});
function route(){const h=location.hash.slice(1);host.hidden=!(h==='learn'||h==='chinese'||/^chinese-[1-6](?:-(?:first|second)(?:-(?:pretty(?:-quiz)?|scissors-rock-paper|tadpole-mom))?)?$/.test(h)||h==='math'||/^math-[1-6]$/.test(h)||/^math-1-(?:parts(?:-(?:split|join|practice))?|count30)$/.test(h));closeHundred();pen.finish();setTool('');queueMicrotask(syncAnnotationContext);if(host.hidden){opened=false;$('rail').hidden=true;$('handle').hidden=false;$('handle').setAttribute('aria-expanded','false')}}
window.addEventListener('annotationcontextchange',()=>queueMicrotask(syncAnnotationContext));
window.addEventListener('readingimagechange',()=>queueMicrotask(syncAnnotationContext));window.addEventListener('hashchange',route);
window.addEventListener('scroll',()=>pen.repaint(),{passive:true});route();
})();

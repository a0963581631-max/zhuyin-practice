/* Step 1 of 注音學習: choose a font. Step 2 (TeachingOrder) follows after choice.
 * Fonts are loaded only on request. Browser HTTP cache handles subsequent visits.
 */
(function(){
  const learningPage=document.getElementById("learningPage");
  const toolbar=learningPage.querySelector(".teaching-order-toolbar");
  const changeButton=document.createElement("button");
  changeButton.type="button";
  changeButton.id="changeLearningFontBtn";
  changeButton.className="teaching-order-edit";
  changeButton.setAttribute("aria-haspopup","dialog");
  changeButton.textContent="Aa 字型：預設";
  toolbar.insertBefore(changeButton,document.getElementById("editTeachingOrderBtn"));

  const dialog=document.createElement("dialog");
  dialog.id="learningFontDialog";
  dialog.className="teaching-order-dialog learning-font-dialog";
  dialog.setAttribute("aria-labelledby","learningFontTitle");
  dialog.setAttribute("aria-describedby","learningFontDescription");
  dialog.innerHTML=[
    '<div class="learning-font-step" id="learningFontStep">第 1 步／共 2 步</div>',
    '<h2 id="learningFontTitle">選擇注音學習字型</h2>',
    '<p id="learningFontDescription">請選擇本次上課要使用的字型，確認後再編排注音教學順序。</p>',
    '<div class="order-entry learning-font-choices">',
    '<button type="button" id="chooseZihiFont" aria-describedby="zihiFontInfo">',
    '下載並使用字嗨注音標楷',
    '<small id="zihiFontInfo">首次使用需從網路載入字型，由瀏覽器快取；詞彙中的國字與直式注音採用字型內建排版。</small>',
    '</button>',
    '<button type="button" id="chooseDefaultFont" aria-describedby="defaultFontInfo">',
    '使用網站預設字型',
    '<small id="defaultFontInfo">不另外下載字型，使用原本的注音顯示方式與詞彙排列。</small>',
    '</button>',
    '</div>',
    '<p id="learningFontLoadStatus" class="learning-font-status" role="status" aria-live="polite"></p>',
    '<div class="order-actions"><button type="button" id="learningFontCancel" hidden>取消切換</button></div>'
  ].join("");
  document.body.append(dialog);

  const chooseZihi=document.getElementById("chooseZihiFont");
  const chooseDefault=document.getElementById("chooseDefaultFont");
  const cancel=document.getElementById("learningFontCancel");
  const status=document.getElementById("learningFontLoadStatus");
  let mode="default";
  let editing=false;
  let requestToken=0;

  function useZihi(){return mode==="zihi";}
  function applyMode(value){
    mode=value;
    document.body.classList.toggle("zihi-teaching-font",useZihi());
    changeButton.textContent=useZihi()?"Aa 字型：字嗨注音標楷":"Aa 字型：預設";
    changeButton.setAttribute("aria-label","切換注音學習字型，目前使用"+(useZihi()?"字嗨注音標楷":"預設字型"));
    if(typeof renderVocabularyModal==="function" && vocabBackdrop.classList.contains("show")){
      renderVocabularyModal();
    }
  }
  function finish(value){
    const initial=!editing;
    requestToken++;
    applyMode(value);
    if(dialog.open)dialog.close();
    if(initial)TeachingOrder.openIntro();
    else changeButton.focus({preventScroll:true});
  }
  function show(initial){
    editing=!initial;
    requestToken++;
    status.textContent="";
    status.classList.remove("is-error");
    chooseZihi.disabled=false;
    chooseDefault.disabled=false;
    cancel.hidden=initial;
    document.getElementById("learningFontStep").textContent=initial?"第 1 步／共 2 步":"上課中切換字型";
    document.getElementById("learningFontTitle").textContent=initial?"選擇注音學習字型":"切換目前使用的字型";
    document.getElementById("learningFontDescription").textContent=initial
      ?"請先選擇本次上課使用的字型，接著再設定注音教學順序。"
      :"切換後會保留目前的注音、教學順序與筆順練習進度。";
    if(!initial)status.textContent="目前使用："+(useZihi()?"字嗨注音標楷":"網站預設字型");
    if(!dialog.open)dialog.showModal();
    chooseZihi.focus();
  }
  chooseDefault.addEventListener("click",()=>finish("default"));
  chooseZihi.addEventListener("click",async()=>{
    if(ZihiVocabulary.ready){finish("zihi");return;}
    const token=++requestToken;
    chooseZihi.disabled=true;
    status.classList.remove("is-error");
    status.textContent="正在下載字嗨注音標楷字型，首次使用可能需要較長時間。也可以改選預設字型。";
    let loaded=false;
    try{loaded=await ZihiVocabulary.ensure();}
    catch(e){loaded=false;}
    if(token!==requestToken || !dialog.open)return;
    chooseZihi.disabled=false;
    if(loaded){finish("zihi");return;}
    status.classList.add("is-error");
    status.textContent="字型載入失敗，請檢查網路後重試，或使用網站預設字型。";
  });
  cancel.addEventListener("click",()=>{
    requestToken++;
    if(dialog.open)dialog.close();
    changeButton.focus({preventScroll:true});
  });
  dialog.addEventListener("cancel",event=>{
    requestToken++;
    if(!editing)event.preventDefault();
  });
  changeButton.addEventListener("click",()=>show(false));
  function onLeave(){
    requestToken++;
    if(dialog.open)dialog.close();
  }
  window.LearningFontChoice={openFirst:()=>show(true),onLeave,useZihi};
  applyMode("default");
})();

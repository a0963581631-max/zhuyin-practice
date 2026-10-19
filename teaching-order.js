
/* Teacher-facing Bopomofo lesson sequence; loaded before the main app script. */
(() => {
  const page=document.getElementById("learningPage");
  const bar=document.createElement("div");
  bar.className="teaching-order-toolbar";
  bar.innerHTML='<span id="teachingOrderStatus" class="teaching-order-status" aria-live="polite">預設教學順序</span><button type="button" id="editTeachingOrderBtn" class="teaching-order-edit">☷ 設定教學順序</button>';
  page.querySelector(".practice-workspace").before(bar);
  const dialog=document.createElement("dialog");
  dialog.id="teachingOrderDialog";dialog.className="teaching-order-dialog";
  dialog.setAttribute("aria-labelledby","teachingOrderTitle");
  dialog.innerHTML=[
    '<h2 id="teachingOrderTitle">這次要怎麼教注音？</h2>',
    '<p id="teachingOrderDescription">開始前可自訂本次教學順序，或直接使用網站預設順序。</p>',
    '<div id="teachingOrderEntry" class="order-entry">',
    '<button id="teachingOrderChoose" type="button">① 自訂教學順序<small>依上課順序點選注音，再用〈、〉切換。</small></button>',
    '<button id="teachingOrderSkip" type="button">② 略過<small>直接按原本注音排列順序開始教學。</small></button></div>',
    '<div id="teachingOrderBuilder" hidden>',
    '<p>依照教學順序逐個點選注音。選好後可使用 ↑、↓ 調整順序，× 移除；再點一次下方注音也可取消。</p>',
    '<div id="teachingOrderPicked" class="order-picked" aria-live="polite"></div>',
    '<div id="teachingOrderCatalogue"></div><div class="order-actions">',
    '<button id="teachingOrderClear" type="button">清空重選</button>',
    '<button id="teachingOrderBack" type="button">返回選擇</button>',
    '<button id="teachingOrderConfirm" type="button" class="primary" disabled>確認並開始教學</button>',
    '</div></div>'
  ].join("");
  document.body.append(dialog);
  const $=id=>document.getElementById(id);
  const entry=$("teachingOrderEntry"),builder=$("teachingOrderBuilder"),catalogue=$("teachingOrderCatalogue"),picked=$("teachingOrderPicked"),confirm=$("teachingOrderConfirm");
  let sequence=null,draft=[],editing=false,lastRoute=null,added=null,catalogueReady=false;
  function order(){return sequence||navigationOrder;}
  function beforeSelect(symbol,previous){
    added=null;
    if(sequence&&!sequence.includes(symbol)&&navigationOrder.includes(symbol)){
      const at=sequence.indexOf(previous);
      sequence.splice(at>=0?at+1:sequence.length,0,symbol);
      added=symbol;
    }
  }
  function syncStatus(symbol){
    const list=order(),index=list.indexOf(symbol);
    $("teachingOrderStatus").textContent=(sequence?"自訂教學順序":"預設教學順序")+"｜第 "+(index+1)+" / "+list.length+" 個"+(added?"｜已臨時加入 "+added:"");
    added=null;
  }
  function initCatalogue(){
    if(catalogueReady)return;
    for(const [key,title] of [["initials","聲母"],["finals","介音與韻母"],["compound","結合韻"]]){
      const section=document.createElement("section");section.className="order-group";
      const heading=document.createElement("h3");heading.textContent=title;
      const grid=document.createElement("div");grid.className="order-grid";
      for(const symbol of groups[key]){
        const btn=document.createElement("button");
        btn.type="button";btn.textContent=symbol;btn.dataset.orderSymbol=symbol;
        btn.setAttribute("aria-label","選取或取消注音 "+symbol);
        btn.addEventListener("click",()=>{
          const i=draft.indexOf(symbol);
          if(i<0)draft.push(symbol);else draft.splice(i,1);
          render();
        });
        grid.append(btn);
      }
      section.append(heading,grid);catalogue.append(section);
    }
    catalogueReady=true;
  }
  function render(){
    picked.replaceChildren();
    if(!draft.length){
      const hint=document.createElement("span");
      hint.textContent="尚未選擇注音，請依照本次上課順序逐一點選。";
      picked.append(hint);
    }
    draft.forEach((symbol,index)=>{
      const chip=document.createElement("div");chip.className="chip";
      const ordinal=document.createElement("small");ordinal.textContent=(index+1)+".";
      const value=document.createElement("strong");value.textContent=symbol;
      chip.append(ordinal,value);
      for(const action of ["up","down","remove"]){
        const btn=document.createElement("button");
        btn.type="button";btn.textContent=action==="up"?"↑":action==="down"?"↓":"×";
        btn.setAttribute("aria-label",(action==="up"?"上移":action==="down"?"下移":"移除")+"注音 "+symbol);
        btn.disabled=(action==="up"&&index===0)||(action==="down"&&index===draft.length-1);
        btn.addEventListener("click",()=>{
          if(action==="remove")draft.splice(index,1);
          else{
            const dest=index+(action==="up"?-1:1);
            if(dest<0||dest>=draft.length)return;
            [draft[index],draft[dest]]=[draft[dest],draft[index]];
          }
          render();
        });
        chip.append(btn);
      }
      picked.append(chip);
    });
    catalogue.querySelectorAll("[data-order-symbol]").forEach(btn=>{
      const selected=draft.includes(btn.dataset.orderSymbol);
      btn.classList.toggle("selected",selected);
      btn.setAttribute("aria-pressed",String(selected));
    });
    confirm.disabled=!draft.length;
    confirm.textContent="確認並開始教學（"+draft.length+" 個）";
  }
  function intro(){
    entry.hidden=false;builder.hidden=true;
    $("teachingOrderTitle").textContent="這次要怎麼教注音？";
    $("teachingOrderDescription").textContent="開始前可自訂本次教學順序，或直接使用網站預設順序。";
    $("teachingOrderChoose").focus();
  }
  function open(isEditing){
    editing=isEditing;
    if(!dialog.open)dialog.showModal();
    if(isEditing){
      draft=sequence?sequence.slice():[];
      initCatalogue();entry.hidden=true;builder.hidden=false;
      $("teachingOrderTitle").textContent="調整本次教學順序";
      $("teachingOrderDescription").textContent="確認後將從新順序的第一個注音開始；取消則保留目前進度。";
      $("teachingOrderBack").textContent="取消修改";
      render();catalogue.querySelector("button").focus();
    }else{
      draft=[];$("teachingOrderBack").textContent="返回選擇";intro();
    }
  }
  function start(selectedOrder){
    sequence=selectedOrder?selectedOrder.slice():null;
    dialog.close();window.scrollTo(0,0);
    selectSymbol(order()[0]);
    requestAnimationFrame(fitPracticeBoard);
  }
  $("teachingOrderChoose").addEventListener("click",()=>{
    draft=[];initCatalogue();entry.hidden=true;builder.hidden=false;
    $("teachingOrderBack").textContent="返回選擇";
    render();catalogue.querySelector("button").focus();
  });
  $("teachingOrderSkip").addEventListener("click",()=>start(null));
  $("teachingOrderClear").addEventListener("click",()=>{draft=[];render();});
  $("teachingOrderBack").addEventListener("click",()=>editing?dialog.close():intro());
  confirm.addEventListener("click",()=>{if(draft.length)start(draft);});
  $("editTeachingOrderBtn").addEventListener("click",()=>open(true));
  dialog.addEventListener("cancel",e=>{
    if(!editing){e.preventDefault();if(!builder.hidden)intro();}
  });
  function onRoute(route){
    if(route!=="learn"){
      if(dialog.open)dialog.close();
      if(window.LearningFontChoice)window.LearningFontChoice.onLeave();
    }
    if(route==="learn"&&lastRoute!=="learn"){
      if(window.LearningFontChoice)window.LearningFontChoice.openFirst();
      else open(false);
    }
    lastRoute=route;
  }
  window.TeachingOrder={order,beforeSelect,syncStatus,onRoute,openIntro:()=>open(false)};
})();

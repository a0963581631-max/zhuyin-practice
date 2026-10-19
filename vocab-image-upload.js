/* Teacher-uploaded pictures on individual vocabulary cards.
 * Pictures never leave this browser. IndexedDB is primary persistence, and
 * localStorage is a best-effort fallback for restricted environments.
 */
(function(){
  "use strict";
  const DB_NAME="zhuyin-vocabulary-pictures-v1";
  const STORE_NAME="pictures";
  const FALLBACK_PREFIX="zhuyin-picture-v1:";
  const cache=new Map();
  const revisions=new Map();
  let dbPromise=null;

  function db(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise(resolve=>{
      if(!("indexedDB" in window)){resolve(null);return;}
      let settled=false;
      function done(value){if(!settled){settled=true;resolve(value);}}
      try{
        const request=indexedDB.open(DB_NAME,1);
        request.onupgradeneeded=()=>{
          const database=request.result;
          if(!database.objectStoreNames.contains(STORE_NAME))database.createObjectStore(STORE_NAME);
        };
        request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();done(request.result);};
        request.onerror=()=>done(null);
        request.onblocked=()=>done(null);
      }catch(e){done(null);}
    });
    return dbPromise;
  }
  function localGet(key){
    try{return localStorage.getItem(FALLBACK_PREFIX+key);}catch(e){return null;}
  }
  function localSave(key,value){
    try{localStorage.setItem(FALLBACK_PREFIX+key,value);return true;}catch(e){return false;}
  }
  function localRemove(key){
    try{localStorage.removeItem(FALLBACK_PREFIX+key);}catch(e){}
  }
  function transaction(database,operation,key,value){
    return new Promise((resolve,reject)=>{
      try{
        const tx=database.transaction(STORE_NAME,operation==="get"?"readonly":"readwrite");
        const store=tx.objectStore(STORE_NAME);
        const request=operation==="put"?store.put(value,key):operation==="delete"?store.delete(key):store.get(key);
        request.onerror=()=>reject(request.error||new Error("圖片儲存失敗"));
        if(operation==="get")request.onsuccess=()=>resolve(request.result||null);
        else{
          tx.oncomplete=()=>resolve(true);
          tx.onabort=()=>reject(tx.error||new Error("圖片儲存中斷"));
          tx.onerror=()=>reject(tx.error||new Error("圖片儲存失敗"));
        }
      }catch(e){reject(e);}
    });
  }
  async function get(key){
    if(cache.has(key))return cache.get(key);
    let value=null;
    try{
      const database=await db();
      if(database)value=await transaction(database,"get",key);
    }catch(e){}
    if(!value)value=localGet(key);
    cache.set(key,value||null);
    return value||null;
  }
  async function set(key,value){
    const database=await db();
    if(database){
      try{
        await transaction(database,"put",key,value);
        cache.set(key,value);
        localRemove(key);
        return true;
      }catch(e){}
    }
    const saved=localSave(key,value);
    if(saved)cache.set(key,value);
    return saved;
  }
  async function remove(key){
    const database=await db();
    let ok=false;
    if(database){
      try{await transaction(database,"delete",key);ok=true;}catch(e){}
    }
    localRemove(key);
    if(!database)ok=true;
    cache.delete(key);
    return ok;
  }
  function resize(file){
    return new Promise((resolve,reject)=>{
      if(!file || !["image/png","image/jpeg","image/webp","image/avif"].includes(file.type)){
        reject(new Error("請選擇 PNG、JPG、WebP 或 AVIF 圖片。"));return;
      }
      if(file.size>15*1024*1024){
        reject(new Error("原始圖片請小於 15 MB。"));return;
      }
      const objectURL=URL.createObjectURL(file);
      const picture=new Image();
      picture.onload=()=>{
        URL.revokeObjectURL(objectURL);
        const width=picture.naturalWidth,height=picture.naturalHeight;
        if(!width||!height){reject(new Error("無法讀取這張圖片。"));return;}
        const scale=Math.min(1,800/Math.max(width,height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(width*scale));
        canvas.height=Math.max(1,Math.round(height*scale));
        const ctx=canvas.getContext("2d");
        if(!ctx){reject(new Error("瀏覽器無法處理圖片。"));return;}
        try{
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(picture,0,0,canvas.width,canvas.height);
          const data=canvas.toDataURL("image/webp",0.84);
          resolve(data);
        }catch(e){reject(new Error("圖片轉換失敗，請改用其他圖片格式。"));}
      };
      picture.onerror=()=>{URL.revokeObjectURL(objectURL);reject(new Error("圖片格式無法讀取。"));};
      picture.src=objectURL;
    });
  }
  function getKey(card){
    return card.dataset.symbol+"|"+card.dataset.word;
  }
  function message(text,problem){
    const panel=document.getElementById("vocabUploadStatus");
    if(!panel)return;
    panel.textContent=text;
    panel.classList.toggle("is-error",!!problem);
  }
  function display(card,value){
    const img=card.querySelector(".vocab-uploaded-image");
    const original=card.querySelector(".vocab-default-emoji");
    const reset=card.querySelector(".vocab-reset-image");
    if(!img||!original||!reset)return;
    img.hidden=!value;
    original.hidden=!!value;
    reset.hidden=!value;
    if(value){img.src=value;img.alt="自訂詞彙圖片";}
    else{img.removeAttribute("src");img.alt="";}
    card.classList.toggle("has-custom-vocab-picture",!!value);
  }
  async function mount(card){
    const key=getKey(card);
    const originalRevision=revisions.get(key)||0;
    const image=await get(key);
    if(!card.isConnected || originalRevision!==(revisions.get(key)||0))return;
    display(card,image);
  }
  async function upload(card,file){
    if(!file)return;
    const key=getKey(card);
    const revision=(revisions.get(key)||0)+1;
    revisions.set(key,revision);
    card.classList.add("vocab-picture-busy");
    message("正在處理上傳的圖片……",false);
    try{
      const image=await resize(file);
      if(revisions.get(key)!==revision)return;
      const saved=await set(key,image);
      if(revisions.get(key)!==revision)return;
      if(!saved)throw new Error("無法儲存圖片，可能是瀏覽器禁止儲存或空間不足。");
      if(card.isConnected)display(card,image);
      message("已替換「"+card.dataset.word+"」的圖片，重新開啟網站也會保留。",false);
    }catch(e){
      if(revisions.get(key)===revision)message(e.message||"圖片處理失敗。",true);
    }finally{
      if(revisions.get(key)===revision)card.classList.remove("vocab-picture-busy");
    }
  }
  async function reset(card){
    const key=getKey(card);
    const revision=(revisions.get(key)||0)+1;
    revisions.set(key,revision);
    card.classList.add("vocab-picture-busy");
    const ok=await remove(key);
    if(revisions.get(key)!==revision)return;
    card.classList.remove("vocab-picture-busy");
    if(ok){
      if(card.isConnected)display(card,null);
      message("「"+card.dataset.word+"」已還原為原本的 emoji。",false);
    }else message("還原後可能無法永久保存，請檢查瀏覽器儲存權限。",true);
  }
  window.VocabImageUpload={mount,upload,reset};
})();

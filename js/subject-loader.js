/* Separate subject HTML views; keep hash navigation and DOM IDs unchanged. */
(()=>{
 'use strict';
 const entries=[{"key":"bopomofo-entry","path":"subjects/bopomofo/entry.html"},{"key":"chinese","path":"subjects/chinese/page.html"},{"key":"math","path":"subjects/math/page.html"},{"key":"bopomofo-activities","path":"subjects/bopomofo/activities.html"}];
 async function fetchPart(entry){
  const res=await fetch(entry.path,{cache:'no-cache'});
  if(!res.ok)throw Error('教材檔案載入失敗：'+entry.path+' (HTTP '+res.status+')');
  const source=await res.text();
  if(!source.trim())throw Error('教材檔案是空白的：'+entry.path);
  const template=document.createElement('template');
  template.innerHTML=source;
  return {key:entry.key,fragment:template.content};
 }
 function showError(error){
  document.documentElement.classList.remove('subject-booting');
  document.getElementById('homePage').hidden=true;
  const panel=document.createElement('section');panel.setAttribute('role','alert');
  panel.style.cssText='max-width:680px;margin:36px auto;padding:24px;border:2px solid #b35e55;border-radius:14px;background:white;color:#663127';
  const title=document.createElement('h2');title.textContent='教材頁面載入失敗';
  const msg=document.createElement('p');msg.textContent='請檢查網路連線後重新載入網站。';
  const button=document.createElement('button');button.type='button';button.textContent='重新載入網站';button.onclick=()=>location.reload();
  panel.append(title,msg,button);document.querySelector('.portal-nav').after(panel);
  console.error('Subject module loader failed',error);
 }
 async function start(){
  try{
   // Read all HTML first; don't execute the app with missing lesson elements.
   const contents=await Promise.all(entries.map(fetchPart));
   for(const item of contents){
    const anchor=document.querySelector('[data-subject-part="'+item.key+'"]');
    if(!anchor)throw Error('找不到教材掛載位置：'+item.key);
    anchor.replaceWith(item.fragment);
   }
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='js/app.js?v=subject-modules-20261109';
    script.onload=()=>document.getElementById('lessonLoadStatus')?resolve():reject(Error('網站導覽初始化失敗'));
    script.onerror=()=>reject(Error('網站導覽程式載入失敗'));
    document.body.append(script);
   });
   document.documentElement.classList.remove('subject-booting');
  }catch(error){showError(error);}
 }
 start();
})();

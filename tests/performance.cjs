// CHROMIUM_PATH=/usr/bin/chromium node tests/performance.cjs (requires Playwright)
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..'),base='/assets/strokes/16cb7fa/';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const provenance=JSON.parse(fs.readFileSync(path.join(repo,base,'source.json'),'utf8'));
 assert.equal(provenance.files.length,37);
 for(const f of provenance.files){const raw=fs.readFileSync(path.join(repo,base,f.file));assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),f.sha256);const strokes=JSON.parse(raw);assert(strokes.length&&strokes.every(s=>s.outline.length&&s.track.length>1));}
 console.log('PASS: all 37 pinned stroke files match recorded source hashes');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const context=await browser.newContext({viewport:{width:820,height:1180}}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));let failMath=false,delayInitial=false,failStroke=false;
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());requests.push(u.pathname);if(u.hostname!=='audit.local')throw new Error('Unexpected external request: '+u.href);
  if(u.pathname==='/js/math.js'&&failMath){failMath=false;return route.fulfill({status:503,body:'retry test'});}
  if(u.pathname==='/js/bopomofo.js'&&delayInitial)await pause(250);
  if(u.pathname===base+'3106.json')await pause(350);
  if(u.pathname===base+'3108.json'&&failStroke){failStroke=false;return route.fulfill({status:503,body:'retry test'});}
  const file=path.resolve(repo,u.pathname==='/'?'index.html':u.pathname.slice(1));if(!file.startsWith(repo+path.sep))return route.abort();
  try{await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'missing'});}
 });
 async function ready(){await page.waitForFunction(()=>{const p=document.querySelector('main:not([hidden])');return p&&!p.inert&&document.getElementById('lessonLoadStatus')?.hidden;});}
 async function go(hash){await page.evaluate(h=>location.hash=h,hash);await ready();}
 await page.goto('https://audit.local/');await ready();await page.waitForFunction(()=>!!document.querySelector('.home-photo.visible'));
 assert(!requests.some(x=>/bopomofo|math\.js|reading\.js|reading-quiz|teacher-tools|sock-laundry/.test(x)));
 assert(requests.includes('/assets/images/home/home-01-960.webp'));assert(!requests.includes('/assets/images/home/home-01.webp'));
 console.log('PASS: homepage loads no subject/sidebar/iframe scripts and requests responsive image');
 await go('#chinese');assert(requests.includes('/js/teacher-tools.js'));assert(!requests.includes('/js/reading.js'));assert(!requests.includes('/js/bopomofo.js'));
 failMath=true;await page.evaluate(()=>location.hash='#math-1-parts-split');await page.waitForFunction(()=>document.getElementById('lessonLoadStatus').textContent.includes('未成功'));
 assert.equal(await page.locator('#mathPartsTopicPage').evaluate(e=>e.inert),true);await page.locator('#lessonLoadStatus button').click();await ready();assert.equal(requests.filter(x=>x==='/js/math.js').length,2);
 assert(!requests.includes('/js/bopomofo.js'));assert(!requests.includes('/js/reading.js'));console.log('PASS: failed module retry works and math does not load Bopomofo');
 delayInitial=true;await page.evaluate(()=>location.hash='#learn');await page.waitForRequest('**/js/bopomofo.js');await go('#math');await pause(400);assert.equal(await page.locator('#teachingOrderDialog').evaluate(e=>e.open),false);delayInitial=false;
 // Preserve old storage while ignoring malformed cached data for the new revision.
 await page.evaluate(()=>{localStorage.setItem('bopo-moe-stroke-v5:3105','keep old cache');localStorage.setItem('zhuyin-picture-v1:test','keep teacher picture');localStorage.setItem('bopo-moe-stroke-16cb7fa:3105','[{"outline":[],"track":[]}]');});
 await go('#learn');await page.locator('#teachingOrderSkip').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('已載入'));
 assert(requests.includes(base+'3105.json'));assert.equal(await page.evaluate(()=>localStorage.getItem('bopo-moe-stroke-v5:3105')),'keep old cache');assert.equal(await page.evaluate(()=>localStorage.getItem('zhuyin-picture-v1:test')),'keep teacher picture');
 await page.locator('[data-symbol="ㄆ"]').click();await page.locator('[data-symbol="ㄇ"]').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('「ㄇ」'));
 const shape=await page.locator('#stage path').first().getAttribute('d');await pause(450);assert.equal(await page.locator('#bigSymbol').textContent(),'ㄇ');assert.equal(await page.locator('#stage path').first().getAttribute('d'),shape);assert.match(await page.locator('#status').textContent(),/ㄇ/);
 await page.locator('[data-symbol="ㄅ"]').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('「ㄅ」'));assert.equal(requests.filter(x=>x===base+'3105.json').length,1);
 failStroke=true;await page.locator('[data-symbol="ㄈ"]').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('未成功'));await page.locator('[data-symbol="ㄈ"]').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('「ㄈ」'));assert.equal(requests.filter(x=>x===base+'3108.json').length,2);
 console.log('PASS: same-origin stroke loading, malformed-cache recovery, stale-request guard and retry');
 await page.locator('input[name=speed][value=slow]').check();await page.locator('#mainPlayBtn').click();await page.waitForFunction(()=>!!document.querySelector('#stage mask path'));
 const animation=await page.evaluate(async()=>{const stage=document.getElementById('stage'),guide=stage.querySelector('mask path'),before=guide.getAttribute('stroke-dashoffset');let changed=0;const observer=new MutationObserver(records=>changed+=records.filter(r=>r.type==='childList').length);observer.observe(stage,{subtree:true,childList:true});await new Promise(r=>setTimeout(r,300));observer.disconnect();return{same:guide===stage.querySelector('mask path'),changed,moved:before!==guide.getAttribute('stroke-dashoffset')};});
 assert(animation.same&&animation.moved);assert.equal(animation.changed,0);console.log('PASS: animated stroke updates the same SVG node without per-frame DOM rebuilding');
 await go('#chinese-1-first-pretty');await page.waitForFunction(()=>document.getElementById('prettyImage').complete&&document.getElementById('prettyImage').naturalWidth);await pause(150);
 const readingRequests=requests.filter(x=>/reading-0.+fast/.test(x));assert(readingRequests.includes('/assets/images/reading/reading-01-elephant-fast.webp'));assert(readingRequests.includes('/assets/images/reading/reading-02-hippo-fast.webp'));assert(!readingRequests.includes('/assets/images/reading/reading-03-tiger-fast.webp'));
 const cacheTest=await page.evaluate(()=>{let count=0;const original=CanvasRenderingContext2D.prototype.createImageData;CanvasRenderingContext2D.prototype.createImageData=function(...args){count++;return original.apply(this,args);};speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>{u.onstart?.();u.onboundary?.({name:'word',charIndex:0});u.onboundary?.({name:'word',charIndex:0});};document.getElementById('prettyListen').click();CanvasRenderingContext2D.prototype.createImageData=original;return count;});assert.equal(cacheTest,1);
 console.log('PASS: only current/next lesson images load and repeated highlighting reuses pixel masks');
 await go('#home');assert.equal(await page.locator('#teacherTools').isVisible(),false);assert.deepEqual(errors,[]);await context.close();console.log('PASS: no uncaught script errors after rapid navigation and retries');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

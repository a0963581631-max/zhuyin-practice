// Run: CHROMIUM_PATH=/usr/bin/chromium node tests/teacher-view-tools.cjs
// Requires Playwright. All lessons are served from disk; no production requests.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repo=path.resolve(__dirname,'..');
const fixture=[{outline:[{type:'M',x:400,y:400},{type:'L',x:1600,y:1600},{type:'L',x:1650,y:1600},{type:'L',x:450,y:400}],track:Array.from({length:25},(_,i)=>({x:400+i*50,y:400+i*50}))}];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.startsWith('/assets/strokes/')&&url.pathname.endsWith('.json'))return route.fulfill({json:fixture});
  if(url.hostname!=='audit.local')return route.abort();
  const file=path.resolve(repo,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).slice(1));
  if(!file.startsWith(repo+path.sep))return route.abort();
  try{await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'missing'});}
 });
 const tool=id=>page.locator('#teacherTools '+id);
 const settle=()=>page.waitForTimeout(100);
 async function route(hash){await page.evaluate(h=>location.hash=h,hash);await settle();}
 async function open(){if(!await tool('#rail').isVisible())await tool('#handle').click();}
 async function draw(x=300,y=300){await open();await tool('[data-tool=pen]').click();await tool('#penConfirm').click();await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+60,y+45,{steps:10});await page.mouse.up();await tool('[data-tool=mouse]').click();}
 async function ink(){return tool('#ink').evaluate(c=>{const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,x=0,y=0;for(let i=3;i<a.length;i+=4)if(a[i]){n++;x+=(i-3)/4%c.width;y+=Math.floor((i-3)/4/c.width);}return{n,x:x/n,y:y/n};});}
 async function zoom(rect){await open();await tool('#regionZoom').click();await page.mouse.move(rect.x,rect.y);await page.mouse.down();await page.mouse.move(rect.x+rect.width,rect.y+rect.height,{steps:10});await page.mouse.up();assert.equal(await tool('#viewReset').isVisible(),true);}
 await page.goto('https://audit.local/#math-1-count30');await page.frameLocator('#sockLaundryFrame').locator('#startBtn').waitFor();
 await draw();const original=await ink();assert(original.n>0);
 await page.evaluate(()=>scrollTo(0,150));await settle();const scrolled=await ink();assert(Math.abs(original.y-scrolled.y-150)<2);assert.equal(original.n,scrolled.n);
 await page.evaluate(()=>scrollTo(0,0));await route('#math');assert.equal((await ink()).n,0);await route('#math-1-count30');assert.equal((await ink()).n,original.n);
 console.log('PASS: scroll anchoring and separate route annotations');
 // Moving a zoom source must not reload an iframe or lose its game state.
 const game=page.frameLocator('#sockLaundryFrame');await game.locator('#startBtn').click();await page.locator('#sockLaundryFrame').evaluate(f=>f.contentWindow.__zoomSentinel=123);
 await zoom({x:100,y:180,width:600,height:450});assert.equal(await page.locator('#sockLaundryFrame').evaluate(f=>f.contentWindow.__zoomSentinel),123);
 assert.equal(await game.locator('#play').isVisible(),true);await tool('#viewReset').click();assert.equal(await page.locator('#sockLaundryFrame').evaluate(f=>f.contentWindow.__zoomSentinel),123);
 console.log('PASS: iframe activity survives zoom and restoration');
 await route('#chinese-1-first-pretty');await draw(400,300);const slide=await ink();await page.locator('#prettyNext').click();await settle();assert.equal((await ink()).n,0);await page.locator('#prettyPrev').click();await settle();assert.equal((await ink()).n,slide.n);
 await zoom({x:300,y:180,width:450,height:300});assert.equal(await page.locator('#teacherLessonContent').evaluate(e=>!!e.style.clipPath),true);await page.keyboard.press('Escape');assert.equal(await tool('#viewReset').isVisible(),false);assert.equal((await ink()).n,slide.n);
 console.log('PASS: lesson image annotations, crop and Escape');
 // Small/canceled selections do not change layout or lose annotations.
 await tool('#regionZoom').click();await page.mouse.move(300,300);await page.mouse.down();await page.mouse.move(305,305);await page.mouse.up();assert.equal(await tool('#regionSelect').isVisible(),true);await tool('#regionCancel').click();assert.equal((await ink()).n,slide.n);
 // The original live button remains interactive inside the selected region.
 await route('#math-1');const link=page.locator('a[href="#math-1-parts"]').first(),r=await link.boundingBox();await zoom({x:r.x+4,y:r.y+4,width:r.width-8,height:r.height-8});await link.click();await settle();assert.equal(new URL(page.url()).hash,'#math-1-parts');assert.equal(await tool('#viewReset').isVisible(),false);
 console.log('PASS: live controls and route change restore zoom');
 await open();await tool('[data-tool=count]').click();await tool('#plus').click();const cr=await tool('#count').boundingBox();await zoom({x:cr.x+5,y:cr.y+5,width:cr.width-10,height:cr.height-10});await tool('#plus').click();assert.equal(await tool('#number').inputValue(),'2');await tool('#viewReset').click();assert.equal(await tool('#number').inputValue(),'2');
 console.log('PASS: counting panel zoom and state');
 await route('#math-1-parts-split');await page.locator('#shopAnswer').fill(String(Number(await page.locator('#shopWanted').textContent())-Number(await page.locator('#shopTaken').textContent())));await page.locator('#shopCheck').click();assert.match(await page.locator('#shopFeedback').textContent(),/答對/);
 await route('#math-1-parts-join');await page.locator('#joinAnswer').fill(String(Number(await page.locator('#joinCountA').textContent())+Number(await page.locator('#joinCountB').textContent())));await page.locator('#joinCheck').click();assert.match(await page.locator('#joinFeedback').textContent(),/答對/);
 await route('#chinese-1-first-pretty-quiz');await page.locator('#quizStart').click();assert.equal(await page.locator('#quizPlay').isVisible(),true);await page.locator('#quizAnswers [data-answer],#quizAnswers button').first().click();assert.notEqual(await page.locator('#quizFeedback').textContent(),'');
 await route('#math-1');await draw();assert((await ink()).n>0);await tool('[data-tool=eraser]').click();await tool('#eraseClear').click();assert.equal((await ink()).n,0);await route('#chinese-1-first-pretty');assert.equal((await ink()).n,slide.n);await route('#math-1');
 await open();await tool('[data-tool=board]').click();await tool('#boardPen').click();await tool('#wbPenConfirm').click();const wb=await tool('#boardCanvas').boundingBox();await page.mouse.move(wb.x+50,wb.y+50);await page.mouse.down();await page.mouse.move(wb.x+100,wb.y+100,{steps:10});await page.mouse.up();assert.equal(await tool('#boardCanvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)),true);await tool('#boardUndo').click();assert.equal(await tool('#boardCanvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)),false);
 await tool('[data-tool=mouse]').click();
 console.log('PASS: split/join answers, quiz, per-page clear and whiteboard undo');
 // Chart annotations are independent and survive closing/reopening.
 await tool('[data-tool=aids]').click();await tool('[data-chart-choice="2"]').click();await draw(400,350);const chart=await ink();assert(chart.n>0);await tool('[data-hundred-select="3"]').click();await settle();assert.equal((await ink()).n,0);await tool('[data-hundred-select="2"]').click();await settle();assert.equal((await ink()).n,chart.n);await tool('#hundredClose').click();await tool('[data-tool=aids]').click();await tool('[data-chart-choice="2"]').click();await settle();assert.equal((await ink()).n,chart.n);await tool('#hundredClose').click();
 console.log('PASS: chart annotations survive switching and reopening');
 await tool('#viewFullscreen').click();await settle();assert.equal(await page.evaluate(()=>!!document.fullscreenElement),true);assert.equal(await tool('#viewFullscreen').getAttribute('aria-pressed'),'true');await tool('#viewFullscreen').click();await settle();assert.equal(await page.evaluate(()=>!!document.fullscreenElement),false);
 console.log('PASS: unified fullscreen entry and exit');
 await route('#learn');await page.locator('#teachingOrderSkip').click();await draw(200,300);const symbolInk=await ink();await page.locator('[data-symbol="ㄆ"]').click();await settle();assert.equal((await ink()).n,0);await page.locator('[data-symbol="ㄅ"]').click();await settle();await page.evaluate(()=>scrollTo(0,0));await settle();assert.equal((await ink()).n,symbolInk.n);await tool('[data-tool=eraser]').click();await tool('#eraseClear').click();await tool('[data-tool=mouse]').click();await page.locator('#practiceBtn').click();await settle();
 let pr=await page.locator('#practiceLayer').boundingBox();await zoom({x:pr.x+2,y:pr.y+2,width:pr.width-4,height:pr.height-4});pr=await page.locator('#practiceLayer').boundingBox();
 await page.mouse.move(pr.x+400/2048*pr.width,pr.y+400/2048*pr.height);await page.mouse.down();await page.mouse.move(pr.x+1600/2048*pr.width,pr.y+1600/2048*pr.height,{steps:25});await page.mouse.up();await settle();assert.match(await page.locator('#status').textContent(),/完成/);await tool('#viewReset').click();
 console.log('PASS: Bopomofo tracing coordinates under zoom (fixture data)');
 // Fullscreen denial must report the problem without leaving a false active state.
 await page.evaluate(()=>{document.documentElement.requestFullscreen=()=>Promise.reject(new Error('denied'));});await tool('#viewFullscreen').click();assert.equal(await tool('#viewFullscreen').getAttribute('aria-pressed'),'false');assert.match(await tool('#viewStatus').textContent(),/無法/);
 for(const hash of ['home','chinese','chinese-1','chinese-1-first','chinese-1-first-pretty','chinese-1-first-scissors-rock-paper','chinese-1-first-tadpole-mom','chinese-1-first-pretty-quiz','math','math-1','math-1-count30','math-1-parts-split','math-1-parts-join','math-1-parts-practice','help']){await route('#'+hash);assert.equal(await page.locator('main:visible').count(),1);}
 assert.deepEqual(errors,[]);console.log('PASS: 15 routes, fullscreen failure feedback, no uncaught errors');
 // Tablet emulation exercises touch selection without claiming physical-device coverage.
 const tablet=await browser.newContext({viewport:{width:820,height:1180},isMobile:true,hasTouch:true});await tablet.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='audit.local')return r.abort();const f=path.resolve(repo,u.pathname.slice(1)||'index.html');try{await r.fulfill({body:fs.readFileSync(f),contentType:path.extname(f)==='.js'?'text/javascript':path.extname(f)==='.html'?'text/html':undefined});}catch{await r.abort();}});
 const tp=await tablet.newPage();await tp.goto('https://audit.local/#math-1');await tp.locator('#teacherTools #handle').tap();await tp.locator('#teacherTools #regionZoom').tap();const client=await tablet.newCDPSession(tp);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:230}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:550,y:500}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await tp.locator('#teacherTools #viewReset').isVisible(),true);await tp.locator('#teacherTools #viewReset').tap();console.log('PASS: tablet-emulated touch selection and restoration');
 await tablet.close();await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

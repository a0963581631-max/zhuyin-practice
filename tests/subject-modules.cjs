// Structural checks; requires only Node.js.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const index=read('index.html'),boot=read('js/subject-loader.js');
const modules={
 'subjects/chinese/page.html':['chinesePage','chineseGradePage','chineseLessonsPage','chineseVolumePage','chineseReadingPage','chineseQuizPage'],
 'subjects/math/page.html':['mathPage','mathGradePage','mathCount30Page','mathPartsPage','mathPartsTopicPage'],
 'subjects/bopomofo/entry.html':['bopomofoEntryPage'],
 'subjects/bopomofo/activities.html':['challengePage','learningPage','vocabBackdrop','helpBackdrop']
};
const joined=index+Object.keys(modules).map(read).join('');
for(const [path,ids] of Object.entries(modules)){
 const page=read(path);assert(boot.includes(path),'Loader missing '+path);
 for(const id of ids){
  assert(page.includes('id="'+id+'"'),path+' missing '+id);
  assert(!index.includes('id="'+id+'"'),id+' remains in shell');
  assert.equal((joined.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' duplicate');
 }
}
for(const name of ['bopomofo','chinese','math'])assert(fs.existsSync(path.join(root,'css',name+'.css')),'No CSS for '+name);
for(const id of ['homePage','guidePage','confettiLayer'])assert(index.includes('id="'+id+'"'),'No shared '+id);
for(const hash of ['#learn-practice','#learn-challenge','#chinese','#math'])assert(joined.includes(hash),'No route '+hash);
const chinese=read('subjects/chinese/page.html');
const app=read('js/app.js');
for(const route of ['#chinese-1-first-primer','#chinese-1-first-book1'])
 assert(chinese.includes('href="'+route+'"'),'Missing book choice: '+route);
for(const lesson of ['好漂亮','剪刀石頭布','小蝌蚪找媽媽']){
 const volume=chinese.split('<main id="chineseVolumePage"')[1].split('</main>')[0];
 assert(volume.includes(lesson),'Primer is missing lesson '+lesson);
}
assert(chinese.includes('id="chineseBookOnePlaceholder"')&&chinese.includes('href="#chinese-1-first-handprint"'), 'Missing first-book handprint lesson');
const handprint=read('lesson-handprint.js');
assert(app.includes("const isHandprint=hash==='chinese-1-first-handprint'"), 'Handprint route is not registered');
assert(handprint.includes('assets/images/reading/handprint/01.webp')&&handprint.includes('assets/images/reading/handprint/06.webp'), 'Handprint images missing');
assert(chinese.includes('href="#chinese-1-first-primer">← 返回首冊課文選擇'), 'Lesson back link must return to primer');
assert(app.includes("chineseVolumeMatch?'chineseVolume'"),'Book routing missing');
assert(app.includes("chineseVolume:document.getElementById('chineseVolumePage')"),'Book page unregistered');
assert(index.includes('subject-loader.js'));assert(index.includes('home-slideshow.js'));
assert(!index.includes('<style'),'Inline styles remain');
// Chinese handwriting regressions: baseline remains visible in all three hint modes;
// the graded stroke must be close to the model, not merely have the right direction.
const hanzi=read('js/chinese-handwriting.js');
assert(chinese.includes('id="hanziHintLevel"') && chinese.includes('hanzi-hint-base-note'),'Hanzi hint slider or grey-outline instruction missing');
assert(hanzi.includes('writer.showOutline({duration:0});'),'Grey character guide must remain visible');
assert(!hanzi.includes('writer.hideOutline('),'No hint level may hide the grey character');
assert(hanzi.includes('leniency:0.82,averageDistanceThreshold:170'),'Tighter shape and position thresholds missing');
assert(hanzi.includes('markStrokeCorrectAfterMisses:false'),'No forced acceptance after repeated mistakes');
assert(hanzi.includes('if(level===2&&strokeData.strokes[strokeNumber])'),'Blue hint must be limited to full guidance');
assert(hanzi.includes('if(level>=1){'),'Start dot must be limited to partial and full guidance');
console.log('PASS: separate subject markup/styles, shared shell and routes; Hanzi hint and spatial grading invariants');

// Blow Bubbles uses the same reader and one annotation rectangle per printed syllable.
const bubbleSandbox={window:{}};require('node:vm').runInNewContext(read('lesson-bubble.js'),bubbleSandbox);
const bubble=bubbleSandbox.window.bubbleLesson;
assert(chinese.includes('href="'+bubble.route+'"'),'Missing bubble lesson link');
assert(app.includes("const isBubble=hash==='chinese-1-first-bubble'")&&app.includes("loadScript('lesson-bubble.js')"),'Missing bubble route or dependency');
assert(read('js/reading.js').includes('bubbleLesson.route'),'Missing bubble reader route');
assert.equal(bubble.slides.length,6);
for(let i=0;i<6;i++){
 const slide=bubble.slides[i];assert(fs.existsSync(path.join(root,slide.src)),'Missing '+slide.src);
 assert.equal(bubble.groups[i].join('').length,bubble.syllableRects[i].length);
 for(const [x,y,r,b] of bubble.syllableRects[i])assert(x>=0&&y>=0&&r<=bubble.width&&b<=bubble.height&&x<r&&y<b);
}
console.log('PASS: Bubble lesson assets, route and per-character rectangles');

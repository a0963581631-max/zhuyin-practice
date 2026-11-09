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
assert(chinese.includes('id="chineseBookOnePlaceholder"')&&chinese.includes('第一冊課文準備中'), 'Missing empty first volume');
assert(chinese.includes('href="#chinese-1-first-primer">← 返回首冊課文選擇'), 'Lesson back link must return to primer');
assert(app.includes("chineseVolumeMatch?'chineseVolume'"),'Book routing missing');
assert(app.includes("chineseVolume:document.getElementById('chineseVolumePage')"),'Book page unregistered');
assert(index.includes('subject-loader.js'));assert(index.includes('home-slideshow.js'));
assert(!index.includes('<style'),'Inline styles remain');
console.log('PASS: separate subject markup/styles, shared shell and routes');

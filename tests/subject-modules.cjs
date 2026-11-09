// Structural checks; requires only Node.js.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const index=read('index.html'),boot=read('js/subject-loader.js');
const modules={
 'subjects/chinese/page.html':['chinesePage','chineseGradePage','chineseLessonsPage','chineseReadingPage','chineseQuizPage'],
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
assert(index.includes('subject-loader.js'));assert(index.includes('home-slideshow.js'));
assert(!index.includes('<style'),'Inline styles remain');
console.log('PASS: separate subject markup/styles, shared shell and routes');

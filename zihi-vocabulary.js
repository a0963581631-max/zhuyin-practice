/* Accurate Bopomofo rendering: full annotated glyphs from 字嗨注音標楷.
 * Works with the words and pronunciations defined in the main teaching site.
 */
(function(){
  const ivsReadings={
    "子":{"ㄗ˙":"\u{E01E1}"},
    "爺":{"ㄧㄝ˙":"\u{E01E1}"},
    "頭":{"ㄊㄡ˙":"\u{E01E1}"},
    "朵":{"ㄉㄨㄛ˙":"\u{E01E1}"},
    "蔔":{"ㄅㄛ˙":"\u{E01E1}"},
    "掃":{"ㄙㄠˋ":"\u{E01E1}"}
  };
  // Version 1.4 lacks these two light-tone glyph variants.
  const manualNeutral=new Set(["泡|ㄆㄠ˙","狗|ㄍㄡ˙"]);
  let ready=false,request=null;
  function render(item,targetSymbol){
    return Array.from(item.word).map(function(char,index){
      const syllable=item.bopomofo[index]||"";
      const phonetic=parseBopomofoSyllable(syllable);
      const target=phonetic.base.includes(targetSymbol);
      const manual=manualNeutral.has(char+"|"+syllable);
      const selector=manual?"\u{E01E0}":((ivsReadings[char]||{})[syllable]||"");
      const display=escapeHtml(char+selector);
      if(manual){
        const notes=phonetic.base.map(function(s){return "<span>"+escapeHtml(s)+"</span>";}).join("");
        return '<span class="zihi-word-glyph"><span class="zihi-base">'+display+'</span><span class="zihi-manual-annotation'+(target?' target':'')+'" aria-hidden="true"><span class="zihi-manual-neutral">˙</span><span class="zihi-manual-note">'+notes+'</span></span></span>';
      }
      return '<span class="zihi-word-glyph"><span class="zihi-base">'+display+'</span>'+(target?'<span class="zihi-annotation-highlight" aria-hidden="true">'+display+'</span>':'')+'</span>';
    }).join("");
  }
  function ensure(){
    if(ready)return Promise.resolve(true);
    if(request)return request;
    if(!document.fonts)return Promise.resolve(false);
    request=document.fonts.load('70px "ZihiVocabulary"',"包子泡泡狗狗掃把蘿蔔").then(function(faces){
      if(!faces.length){request=null;return false;}
      ready=true;
      if(vocabBackdrop.classList.contains("show"))renderVocabularyModal();
      return true;
    }).catch(function(){request=null;return false;});
    return request;
  }
  window.ZihiVocabulary={
    get ready(){return ready;},
    ensure:ensure,
    render:render
  };
})();
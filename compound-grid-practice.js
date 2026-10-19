/* Same-square combined Bopomofo handwriting: after individual tracing,
 * reuse authentic individual stroke outlines and tracks without guessing shapes.
 * Each component is uniformly scaled and centered inside the upper/lower
 * half of the original 2048 x 2048 practice SVG.
 */
(function(){
  "use strict";
  const ROWS=[
    {centerY:512,top:125,bottom:895,label:"上面"},
    {centerY:1536,top:1150,bottom:1915,label:"下面"}
  ];
  function bounds(data){
    const xs=[],ys=[];
    function take(p){
      if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){xs.push(p.x);ys.push(p.y);}
    }
    data.forEach(stroke=>{
      (stroke.outline||[]).forEach(c=>{
        take(c);
        take(c.begin);
        take(c.mid);
        take(c.end);
      });
      (stroke.track||[]).forEach(take);
    });
    if(!xs.length)throw new Error("原始筆順資料缺少有效座標");
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
    return {left,right,top,bottom,width:Math.max(1,right-left),height:Math.max(1,bottom-top)};
  }
  function build(symbols,parts){
    if(symbols.length!==2||parts.length!==2||parts.some(p=>!Array.isArray(p)||!p.length)){
      throw new Error("同格練習需要兩個注音的完整標準筆順資料");
    }
    const combined=[];
    const ranges=[];
    parts.forEach((part,partIndex)=>{
      const b=bounds(part),row=ROWS[partIndex];
      const maxHeight=row.bottom-row.top;
      const scale=Math.min(1320/b.width,maxHeight/b.height,1.15);
      const cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
      const mapPoint=p=>({x:Math.round((1024+(p.x-cx)*scale)*100)/100,
                           y:Math.round((row.centerY+(p.y-cy)*scale)*100)/100});
      const begin=combined.length;
      part.forEach((stroke,i)=>{
        const outline=(stroke.outline||[]).map(cmd=>{
          const mapped={...cmd};
          if(Number.isFinite(cmd.x)&&Number.isFinite(cmd.y))Object.assign(mapped,mapPoint(cmd));
          for(const tag of ["begin","mid","end"])if(cmd[tag])mapped[tag]=mapPoint(cmd[tag]);
          return mapped;
        });
        const track=(stroke.track||[]).map(mapPoint);
        combined.push({...stroke,outline,track,
          combinedPart:partIndex,partStroke:i+1,partStrokeTotal:part.length,combinedScale:scale});
      });
      ranges.push({from:begin,to:combined.length,symbol:symbols[partIndex],scale});
    });
    return {strokes:combined,ranges};
  }
  function drawGuides(stage,svgEl,symbols,currentPart){
    ROWS.forEach((row,i)=>{
      const active=currentPart===i;
      stage.appendChild(svgEl("rect",{
        x:"14",y:i===0?"14":"1038",width:"2020",height:"996",
        fill:active?"#edf7ff":"#f8fafd",opacity:active?".44":".35",
        "pointer-events":"none"
      }));
      const label=svgEl("text",{
        x:"96",y:i===0?"165":"1188",
        fill:active?"#286c93":"#71889c",
        "font-size":"90","font-weight":active?"800":"600",
        "pointer-events":"none"
      });
      label.textContent=(i===0?"上":"下")+"："+symbols[i];
      stage.appendChild(label);
    });
  }
  window.CompoundGridPractice={build,drawGuides};
})();

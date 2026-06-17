const fs=require('fs');let h=fs.readFileSync('index.html','utf-8');

// Find getExplanation function start and end
var start = h.indexOf('async function getExplanation() {');
var end = h.indexOf('function exportWrong()');
if (start===-1||end===-1){console.log('FIND FAILED');process.exit(1);}

// New function
var newFn = `async function getExplanation() {
  var box = document.getElementById('explainBox');
  var hsContent = document.getElementById('huashengContent');
  var detailContent = document.getElementById('detailContent');
  box.classList.add('show');
  hsContent.innerHTML = '花生十三分析中...';
  detailContent.innerHTML = 'DeepSeek深度解析中...';

  var l = ['A','B','C','D'];
  var qInfo = '题型：'+currentCat+'。题目：'+currentQ.q+'。选项：'+currentQ.o.map(function(o,i){return l[i]+'.'+o}).join(' | ')+'。正确答案：'+l[currentQ.a]+'。我的答案：'+l[selectedOpt];

  try {
    var API='https://api.deepseek.com/chat/completions';
    var KEY='sk-0541b3112cd44ec18041c235d380affc';
    var H={'Content-Type':'application/json','Authorization':'Bearer '+KEY};

    var r1=await fetch(API,{method:'POST',headers:H,body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:'你是花生十三，行测名师。极简口诀式讲题，150字内。'+qInfo}],max_tokens:300,temperature:.5})});
    var d1=await r1.json();hsContent.innerHTML=(d1.choices[0].message.content||'').replace(/\\n/g,'<br>');

    var r2=await fetch(API,{method:'POST',headers:H,body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:'你是行测教研老师。做深度错题解析，300字内。考点分析、正确为什么对、错误为什么错（逐一排除）、解题步骤、通用解法。'+qInfo}],max_tokens:800,temperature:.7})});
    var d2=await r2.json();detailContent.innerHTML=(d2.choices[0].message.content||'').replace(/\\n/g,'<br>');
  } catch(e) { hsContent.innerHTML='解析失败'; detailContent.innerHTML='请重试'; }
}

function exportWrong()`;

h = h.substring(0, start) + newFn + h.substring(end);

// Also update the explain box HTML
h = h.replace(
  '<div class="explain-box" id="explainBox">',
  '<div class="explain-box" id="explainBox">'
);
h = h.replace(
  '<h4>🤖 AI 解析 <span class="ai-label">花生十三风格</span></h4>',
  '<h4>🥜 花生十三 · 口诀解析</h4>'
);
h = h.replace(
  '<div class="xhs-style" id="explainContent"></div>',
  '<div class="xhs-style" id="huashengContent" style="border-left:3px solid var(--accent);padding-left:14px;margin-bottom:16px"></div><h4 style="margin-top:16px">🤖 DeepSeek · 深度解析</h4><div class="xhs-style" id="detailContent" style="color:#555"></div>'
);

fs.writeFileSync('index.html', h);
console.log('patched');

// main.js — базовая логика портретов, чата и сброса всего

// Динамически регистрируемые портреты (пример простых правил)
const portraits = [];
let progress = {};
let identifiedPortrait = null;
let currentGame = null;

window.PortraitModules = []; // для подключения портретов-поведений

// Для регистрации портретов отдельными модулями
window.registerPortrait = function(portrait) {
  portraits.push(portrait);
};

// Сохранение/загрузка состояния
function saveProgress() {
  localStorage.setItem("portraitProgress", JSON.stringify(progress));
  localStorage.setItem("identifiedPortrait", identifiedPortrait || "");
}
function loadProgress() {
  progress = JSON.parse(localStorage.getItem("portraitProgress") || "{}");
  identifiedPortrait = localStorage.getItem("identifiedPortrait") || null;
  updatePortraitIndicator();
}
function resetAll() {
  localStorage.clear();
  progress = {};
  identifiedPortrait = null;
  updatePortraitIndicator();
  document.getElementById('messages').innerHTML = '';
}
function updatePortraitIndicator() {
  let txt = "Определение: 0%";
  if(identifiedPortrait) txt = `Это: ${identifiedPortrait}`;
  else if(Object.keys(progress).length){
    let maxVal=0, maxName="";
    for(let key of Object.keys(progress))
      if(progress[key]>maxVal) {maxVal=progress[key]; maxName=key;}
    if(maxVal>0) txt = `Вероятно: ${maxName}: ${maxVal}%`;
  }
  document.getElementById('portraitIndicator').textContent = txt;
}
// Базовые функции чата:
function addMsgUser(txt) {
  let div = document.createElement('div'); div.className="msg user"; div.textContent=txt;
  document.getElementById('messages').appendChild(div);
}
function addMsgAI(txt) {
  let div = document.createElement('div'); div.className="msg ai"; div.textContent=txt;
  document.getElementById('messages').appendChild(div);
}
// Анализ поведения: вызываем портретные скрипты и накапливаем "очки"
function analyzeInputBehaviour(txt, eventType="message") {
  txt = txt.toLowerCase();
  for(const mod of window.PortraitModules) {
    let deltas = mod.analyzeEvent({ eventType, txt, currentGame });
    for(const name in deltas) {
      if(!progress[name]) progress[name]=0;
      progress[name] += deltas[name];
      if(progress[name]>100) progress[name]=100;
    }
  }
  saveProgress();
  for(const name in progress) {
    let val = progress[name];
    if([25,50,75,100].includes(val) && !identifiedPortrait) {
      setTimeout(()=>{
        addMsgAI(`Это сейчас ${name}? (да/нет)`);
      },350);
    }
    if(progress[name]>=100 && !identifiedPortrait){
      identifiedPortrait=name;
      saveProgress();
    }
  }
  updatePortraitIndicator();
}
// Обработка отправки в чат:
document.getElementById('send-btn').onclick = () => {
  let val = document.getElementById('chat-input').value.trim();
  if(!val) return;
  addMsgUser(val);
  analyzeInputBehaviour(val, "message");
  // stub: просто подтверждаем вход. Игровые логики подружаются в отдельных скриптах по кнопке игры.
  setTimeout(()=>{ addMsgAI("Я записал твой ответ! (ИИ-ответ здесь позже)"); }, 600);
  document.getElementById('chat-input').value='';
};
// Сброс
document.getElementById('resetBtn').onclick = resetAll;
// Динамически регистрируемые игры
window.registerGame = function(title, script, icon=null) {
  let btn = document.createElement('button');
  btn.className = "game-btn";
  btn.textContent = title;
  btn.onclick = ()=> {
    currentGame = script;
    document.getElementById('chatBox').style.display="block";
    window[s­cript].startGame(); // вызов функции стартовой логики игры
    analyzeInputBehaviour(title, "gameSelect");
  };
  document.getElementById('gamesList').appendChild(btn);
};

// Динамически подключаем все внешние игры и портреты
["game_skazka.js","game_ugadai.js"].forEach(src=>{
  let s = document.createElement('script');
  s.src = src; document.body.appendChild(s);
});
["profile_matvei.js","profile_nikita.js","profile_sonya.js"].forEach(src=>{
  let s = document.createElement('script');
  s.src = src; document.body.appendChild(s);
});
// Перед запуском — загрузить состояние
loadProgress();

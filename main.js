const portraits = [];
let progress = {};
let identifiedPortrait = null;
let currentGame = null;

window.PortraitModules = [];

// ===========================
// Консоль-логгер
// ===========================
function logDebug(...msg) {
  // Только инфа для разработки, можно заменить на console.info
  console.log('[DEBUG]', ...msg);
}
function logError(...msg) {
  console.error('[ERROR]', ...msg);
}
function logWarn(...msg) {
  console.warn('[WARN]', ...msg);
}

// ===========================
// Регистрация портретов
// ===========================
window.registerPortrait = function(portrait) {
  logDebug('Регистрируется портрет:', portrait);
  portraits.push(portrait);
};

// ===========================
// Чат с ИИ (с детальной диагностикой)
// ===========================
async function askAI(prompt) {
  logDebug('Запрос к chat API:', prompt);
  try {
    const response = await fetch('https://openai-vercel-backend.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      // Важно — неуспешный HTTP (например, 404, 500 и т.д.)
      logError(`Сервер вернул статус ${response.status} (${response.statusText})`);
      return `Ошибка: Сервер вернул статус ${response.status} (${response.statusText})`;
    }

    const data = await response.json();

    // Проверяем структуру ответа
    if (data.error) {
      logError('Ошибка с backend:', data.error);
      return `Ошибка OpenAI или сервера: ${data.error.message || JSON.stringify(data.error)}`;
    }
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      logWarn('Некорректная структура ответа:', data);
      return "Ошибка: Некорректная структура ответа от сервера (нет поля content)";
    }

    logDebug('Успешный ответ от OpenAI:', data.choices[0].message.content);
    return data.choices[0].message.content.trim();
  } catch (e) {
    logError('Ошибка при обращении к chat API:', e);
    return `Ошибка соединения или парсинга: ${e.message || e}`;
  }
}

// ===========================
// Безопасный вывод
// ===========================
function safeReply(txt) {
  const badWords = ['убить', 'самоуб', 'оружие'];
  for (const w of badWords)
    if (txt.toLowerCase().includes(w))
      return "Извините, этот ответ скрыт по причине безопасности.";
  return txt;
}

// ===========================
// Хранение и восстановление прогресса
// ===========================
function saveProgress() {
  localStorage.setItem("portraitProgress", JSON.stringify(progress));
  localStorage.setItem("identifiedPortrait", identifiedPortrait || "");
  logDebug('Прогресс сохранен:', progress, identifiedPortrait);
}
function loadProgress() {
  try {
    progress = JSON.parse(localStorage.getItem("portraitProgress") || "{}");
    identifiedPortrait = localStorage.getItem("identifiedPortrait") || null;
    logDebug('Прогресс загружен:', progress, identifiedPortrait);
    updatePortraitIndicator();
  } catch(e) {
    logError('Ошибка чтения локального хранилища:', e);
    progress = {};
    identifiedPortrait = null;
  }
}
function resetAll() {
  localStorage.clear();
  progress = {};
  identifiedPortrait = null;
  updatePortraitIndicator();
  document.getElementById('messages').innerHTML = '';
  logWarn('Весь прогресс и чат были сброшены пользователем.');
}

// ===========================
// UI и чат
// ===========================
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
function addMsgUser(txt) {
  let div = document.createElement('div'); div.className="msg user"; div.textContent=txt;
  document.getElementById('messages').appendChild(div);
  logDebug('Пользователь отправил:', txt);
}
function addMsgAI(txt) {
  let div = document.createElement('div'); div.className="msg ai"; div.textContent=txt;
  document.getElementById('messages').appendChild(div);
  logDebug('ИИ ответил:', txt);
}

// ===========================
// Поведение пользователя и анализ профиля
// ===========================
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

// ===========================
// Обработчик чата с логами
// ===========================
document.getElementById('send-btn').onclick = async () => {
  let val = document.getElementById('chat-input').value.trim();
  if (!val) {
    logWarn('Пользователь попытался отправить пустое сообщение!');
    return;
  }
  addMsgUser(val);
  analyzeInputBehaviour(val, "message");
  document.getElementById('chat-input').value = '';

  addMsgAI("Думаю...");
  try {
    let aiReply = await askAI(val);
    let answer = safeReply(aiReply);
    document.querySelector('.msg.ai:last-child').textContent = answer;
    if (answer.startsWith("Ошибка")) {
      logError('Ответ ИИ содержит ошибку:', answer);
    }
  } catch (e) {
    let errText = "Ошибка связи с ИИ: " + (e.message || e);
    document.querySelector('.msg.ai:last-child').textContent = errText;
    logError(errText);
  }
};

document.getElementById('resetBtn').onclick = resetAll;

// ===========================
// Функция регистрации новых игр
// ===========================
window.registerGame = function(title, script, icon=null) {
  let btn = document.createElement('button');
  btn.className = "game-btn";
  btn.textContent = title;
  btn.onclick = ()=> {
    currentGame = script;
    document.getElementById('chatBox').style.display="block";
    try {
      if (!window[script]) {
        logError(`Сценарий игры "${script}" не найден!`);
        addMsgAI(`Ошибка: сценарий "${script}" не загружен.`);
        return;
      }
      window[script].startGame();
      analyzeInputBehaviour(title, "gameSelect");
      logDebug(`Игра "${title}" (${script}) запущена.`);
    } catch(e) {
      logError(`Ошибка при запуске сценария игры "${script}":`, e);
      addMsgAI(`Ошибка запуска игры: ${(e.message || e)}`);
    }
  };
  document.getElementById('gamesList').appendChild(btn);
};

// ===========================
// Динамическая подгрузка игр и профилей
// ===========================
["game_skazka.js","game_ugadai.js"].forEach(src=>{
  let s = document.createElement('script');
  s.src = src;
  s.onload = () => logDebug(`Скрипт игры "${src}" успешно загружен.`);
  s.onerror = () => {
    logError(`Скрипт игры "${src}" не загрузился!`);
    addMsgAI(`Ошибка: не удалось загрузить сценарий "${src}"`);
  };
  document.body.appendChild(s);
});
["profile_matvei.js","profile_nikita.js","profile_vera.js"].forEach(src=>{
  let s = document.createElement('script');
  s.src = src;
  s.onload = () => logDebug(`Профиль "${src}" успешно загружен.`);
  s.onerror = () => {
    logError(`Профиль "${src}" не загрузился!`);
    addMsgAI(`Ошибка: не удалось загрузить профиль "${src}"`);
  };
  document.body.appendChild(s);
});
loadProgress();

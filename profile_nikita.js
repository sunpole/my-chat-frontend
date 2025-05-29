// profile_nikita.js
window.PortraitModules.push({
  analyzeEvent: function({ eventType, txt, currentGame }){
    let result = { "Никита": 0 };
    // Выбирает сложные игры (например, викторины или логические)
    if(currentGame && currentGame==="viktorina") result["Никита"] += 15;
    // Точные, короткие ответы
    if(eventType==="message" && txt.length<=20 && /^[а-яa-z0-9\W]+$/i.test(txt)) result["Никита"] += 10;
    // Выполняет быстро указания/завершает игру быстро
    // ... можно добавить больше логики
    return result;
  }
});

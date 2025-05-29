// profile_sonya.js
window.PortraitModules.push({
  analyzeEvent: function({ eventType, txt, currentGame }){
    let result = { "Соня": 0 };
    // Предпочитает игры с картинками (например, позже добавленные игры с выбором изображений)
    if(currentGame && currentGame==="kартинки") result["Соня"] += 20;
    // Редко меняет игру, не балуется вводом
    // ... добавить нужную логику
    return result;
  }
});

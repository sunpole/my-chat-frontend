// profile_matvei.js
window.PortraitModules.push({
  // "Младший сын Матвей"
  analyzeEvent: function({ eventType, txt, currentGame }){
    let result = { "Матвей": 0 };
    // Быстрое переключение между играми (часто нажимал кнопки)
    if(eventType === "gameSelect" && (Date.now()- (this._lastGame||0)) < 5000) result["Матвей"] += 10;
    this._lastGame = Date.now();
    // Часто вводит что-то вроде "ха-ха" или балуется
    if(eventType==="message" && (txt.includes("ха") || txt.includes("лол") || txt.includes("123"))) result["Матвей"] += 10;
    // Предпочитает "Сказка" или "Угадай героя"
    if(currentGame && (currentGame==="skazka" || currentGame==="ugadai")) result["Матвей"] += 15;
    return result;
  }
});

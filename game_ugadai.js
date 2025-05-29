// game_ugadai.js
window.ugadai = {
  startGame: function(){
    addMsgAI("Загадай известного героя, а я за 20 вопросов попробую угадать!");
    // Здесь дальше логика последовательных вопросов-ответов к ИИ
  }
};
window.registerGame("Угадай героя", "ugadai");

// game_skazka.js
window.skazka = {
  startGame: function(){
    addMsgAI("Ты выбрал игру «Послушать сказку». Про кого будем сочинять сказку?");
    // Здесь можно спросить с кого начинать и передавать в ИИ при активации.
  }
};
// Регистрация игры
window.registerGame("Сказка", "skazka");

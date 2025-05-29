// profile_vera.js
window.PortraitModules.push({
  analyzeEvent: function({ eventType, txt, currentGame }) {
    let result = { "Вера": 0 };
    // Предпочитает игры с картинками (например, позже появится игра с изображениями)
    if(currentGame && currentGame === "kartinki") result["Вера"] += 20;
    // Менее склонна к частой смене игр или баловству в чате
    // Можно добавить условия: если выбор сделан через картинки — балл, если много текста — нет
    if(eventType === "message" && txt.length < 15) result["Вера"] += 5;
    // Можно добавить детальное условие для юной дочки — часто использует уменьшительно-ласкательные слова или эмодзи:
    if(txt.match(/картинк|кошечка|собачка|😍|😊|💖/)) result["Вера"] += 8;
    return result;
  }
});

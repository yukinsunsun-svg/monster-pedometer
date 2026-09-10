// MOTHER風の経験値テーブル × 2000倍（各レベルに必要な累計経験値）
const expTable = [
  0, 2000, 6000, 13200, 25000, 42000, 65400, 96200, 135400, 183800, 242600, 312800, 395400, 491400, 601800, 
  727600, 869600, 1029200, 1207000, 1404200, 1622000, 1861000, 2122600, 2407400, 2716600, 3051400, 3412600, 
  3801000, 4218000, 4664400, 5141200, 5649600, 6190200, 6764400, 7372800, 8016800, 8697400, 9415200, 10171600, 
  10967400, 11803600, 12681400, 13601600, 14565200, 15573400, 16627000, 17727200, 18874800, 20072400, 21321600, 
  22626400, 23988000, 25408000, 26888200, 28431000, 30038000, 31710600, 33451400, 35261800, 37144200, 39100400, 
  41132400, 43241800, 45430600, 47700600, 50053200, 52491000, 55015400, 57628200, 60330600, 63124200, 66010400, 
  68990600, 72066600, 75240400, 78513600, 81888200, 85364800, 88945400, 92631400, 96424400, 100326400, 104338800, 
  108463000, 112700600, 117053400, 121522200, 126109000, 130815000, 135641600, 140590200, 145662400, 150860000, 
  156184600, 161638200, 167221600, 172936800, 178785400, 184769200, 190889400, 197148200, 203547400, 210089000
];

const monsterEmojis = [
  '🐉', '🐲', '🦕', '🦖', '🦗', '🦂', '🕷️', '🦟', '🐛', '🦋',
  '🐌', '🐞', '🐝', '🐜', '🦗', '🦟', '🦠', '🐢', '🐍', '🦎',
  '🦗', '🦟', '🦂', '🕷️', '🦅', '🦉', '🦆', '🦜', '🦚', '🦩',
  '🕊️', '🐧', '🐤', '🐣', '🐥', '🐦', '🐧', '🦢', '🦉', '🦜',
  '🦄', '🐴', '🐝', '🐞', '🦋', '🐛', '🐌', '🐚', '🐙', '🦑',
  '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
  '🐅', '🐆', '🐯', '🦁', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖',
  '🐗', '🐽', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈',
  '🐓', '🦃', '🦚', '🦜', '🦢', '🦗', '🕷️', '🦂', '🦟', '🪳'
];

let gameState = {
  monsterLevel: 1,
  totalExp: 0,
  monsterMaxHp: 20,
  monsterCurrentHp: 20,
  monsterAttack: 5,
  monsterDefense: 3,
  monsterSpeed: 4,
  totalSteps: 0,
  todaySteps: 0,
  monsterEmoji: '🐉',
  monsterName: 'ドラゴン',
  stepHistory: [],
  lastDate: new Date().toLocaleDateString('ja-JP'),
  evolvedMonsters: ['🐉']
};

window.addEventListener('DOMContentLoaded', () => {
  loadGameState();
  updateUI();
  setupEventListeners();
});

function saveGameState() {
  localStorage.setItem('monsterPedometer', JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('monsterPedometer');
  if (saved) {
    gameState = JSON.parse(saved);
  }
}

function updateUI() {
  document.getElementById('monsterDisplay').textContent = gameState.monsterEmoji;
  document.getElementById('monsterName').textContent = gameState.monsterName;
  
  document.getElementById('monsterLevel').textContent = `Lv.${gameState.monsterLevel}`;
  
  const currentLevelExp = expTable[gameState.monsterLevel - 1] || 0;
  const nextLevelExp = expTable[gameState.monsterLevel] || expTable[expTable.length - 1];
  const expInCurrentLevel = gameState.totalExp - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  const expPercent = (expInCurrentLevel / expNeededForNextLevel) * 100;
  
  document.getElementById('expBarFill').style.width = Math.min(expPercent, 100) + '%';
  document.getElementById('expText').textContent = `${expInCurrentLevel}/${expNeededForNextLevel}`;
  
  document.getElementById('hpValue').textContent = `${gameState.monsterCurrentHp}/${gameState.monsterMaxHp}`;
  document.getElementById('attackValue').textContent = gameState.monsterAttack;
  document.getElementById('defenseValue').textContent = gameState.monsterDefense;
  document.getElementById('speedValue').textContent = gameState.monsterSpeed;
  
  document.getElementById('totalSteps').textContent = gameState.todaySteps;
  document.getElementById('playerLevel').textContent = gameState.monsterLevel;
}

function setupEventListeners() {
  document.getElementById('recordBtn').addEventListener('click', recordSteps);
  document.getElementById('historyBtn').addEventListener('click', showHistory);
  document.getElementById('pokedexBtn').addEventListener('click', showPokedex);
  document.getElementById('closeHistory').addEventListener('click', closeHistory);
  document.getElementById('closePokedex').addEventListener('click', closePokedex);
  
  document.getElementById('historyModal').addEventListener('click', (e) => {
    if (e.target.id === 'historyModal') closeHistory();
  });
  document.getElementById('pokedexModal').addEventListener('click', (e) => {
    if (e.target.id === 'pokedexModal') closePokedex();
  });
  
  document.getElementById('stepsInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      recordSteps();
    }
  });
}

function recordSteps() {
  const input = document.getElementById('stepsInput');
  const steps = parseInt(input.value);
  
  if (isNaN(steps) || steps <= 0) {
    alert('正の数字を入力してください');
    return;
  }
  
  const today = new Date().toLocaleDateString('ja-JP');
  
  if (gameState.lastDate !== today) {
    if (gameState.todaySteps > 0) {
      gameState.stepHistory.push({ date: gameState.lastDate, steps: gameState.todaySteps });
    }
    gameState.todaySteps = 0;
    gameState.lastDate = today;
  }
  
  gameState.todaySteps += steps;
  gameState.totalSteps += steps;
  
  const gainedExp = steps;
  gameState.totalExp += gainedExp;
  
  checkLevelUp();
  updateUI();
  saveGameState();
  
  input.value = '';
  alert(`${gainedExp}の経験値を獲得しました！`);
}

function checkLevelUp() {
  while (gameState.monsterLevel < expTable.length && gameState.totalExp >= expTable[gameState.monsterLevel]) {
    levelUp();
  }
}

function levelUp() {
  gameState.monsterLevel++;
  
  gameState.monsterMaxHp += 5;
  gameState.monsterCurrentHp = gameState.monsterMaxHp;
  gameState.monsterAttack += 2;
  gameState.monsterDefense += 1;
  gameState.monsterSpeed += 1;
  
  if (gameState.monsterLevel % 5 === 0) {
    evolveMonster();
  }
  
  updateUI();
  saveGameState();
  alert(`${gameState.monsterName}がレベル${gameState.monsterLevel}になった！`);
}

function evolveMonster() {
  let newEmoji;
  do {
    newEmoji = monsterEmojis[Math.floor(Math.random() * monsterEmojis.length)];
  } while (newEmoji === gameState.monsterEmoji);
  
  gameState.monsterEmoji = newEmoji;
  gameState.monsterName = `モンスター${gameState.monsterLevel}`;
  
  if (!gameState.evolvedMonsters.includes(newEmoji)) {
    gameState.evolvedMonsters.push(newEmoji);
  }
  
  alert(`${gameState.monsterName}に進化した！\n絵文字：${newEmoji}`);
}

function showPokedex() {
  const modal = document.getElementById('pokedexModal');
  const list = document.getElementById('pokedexList');
  
  let html = '';
  gameState.evolvedMonsters.forEach((emoji) => {
    html += `<div class="pokedex-item">${emoji}</div>`;
  });
  
  list.innerHTML = html;
  modal.classList.add('active');
}

function closePokedex() {
  document.getElementById('pokedexModal').classList.remove('active');
}

function showHistory() {
  const modal = document.getElementById('historyModal');
  const list = document.getElementById('historyList');
  
  let html = '';
  
  if (gameState.stepHistory.length === 0 && gameState.todaySteps === 0) {
    html = '<div class="history-empty">まだ記録がありません</div>';
  } else {
    if (gameState.stepHistory.length > 0) {
      [...gameState.stepHistory].reverse().forEach((record) => {
        html += `<div class="history-item"><div class="history-date">${record.date}</div><div class="history-steps">歩数：${record.steps.toLocaleString()}</div></div>`;
      });
    }
    
    if (gameState.todaySteps > 0) {
      const today = new Date().toLocaleDateString('ja-JP');
      html = `<div class="history-item"><div class="history-date">${today}（今日）</div><div class="history-steps">歩数：${gameState.todaySteps.toLocaleString()}</div></div>` + html;
    }
  }
  
  list.innerHTML = html;
  modal.classList.add('active');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('active');
}
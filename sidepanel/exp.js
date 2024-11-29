// exp.js
const xpBar = document.querySelector('.xp-bar-fill');
const xpDisplay = document.querySelector('#xp-display');
const xpTotal = document.querySelector('#xp-total');
const addXpBtn = document.querySelector('#add-xp-btn');
const removeXpBtn = document.querySelector('#remove-xp-btn');
const levelDisplay = document.querySelector('#level-display');



let currentXp = 0;
let maxXp = 100;
let level = 1;

function loadStats() {
    chrome.storage.sync.get('userStats', (data) => {
      const stats = data.userStats;
      if (stats) {
        currentXp = stats.exp_gained;
        maxXp = stats.max_xp;
        level = stats.levels;
        updateXpBar();
      }
    });
    console.log('Stats loaded');
  }

function updateXpBar() {
  const width = (currentXp / maxXp) * 100;
  xpBar.style.width = `${width}%`;
  xpDisplay.textContent = currentXp;
  levelDisplay.textContent = level;
  xpTotal.textContent = maxXp;
}

export function addXp(amount) {
  currentXp += amount;
  if (currentXp >= maxXp) {
    levelUp();
  }
  updateXpBar();
  saveStats();
}

function levelUp() {
  level++;
  currentXp -= maxXp;
  maxXp *= 2;
  updateXpBar();
  saveStats();
}

export function lowerXp(amount) {
    if (currentXp <= 0 && level <= 1) return;
    currentXp -= amount;
    if (currentXp <= 0) {
      levelDown();
    }
    updateXpBar();
    saveStats();
  }
  
  function levelDown() {
    if (level <= 1) return;
    level--;
    maxXp /= 2;
    currentXp = maxXp - 1;
    updateXpBar();
    saveStats();
  }

  function saveStats() {
    chrome.storage.sync.get('userStats', (data) => {
      const stats = data.userStats;
      if (!stats) {
        stats = {
          levels: level,
          exp_gained: currentXp,
          max_xp: maxXp,
          lastUpdated: new Date().toISOString()
        };
      } else {
        stats.levels = level;
        stats.exp_gained = currentXp;
        stats.max_xp = maxXp,
        stats.lastUpdated = new Date().toISOString();
      }
  
      chrome.storage.sync.set({ userStats: stats });
    });
  }

  loadStats();
// Add event listeners to buttons or other elements to call addXp() function

addXpBtn.addEventListener('click', () => {
    addXp(10); // Add 10 XP to the user's current XP
  });

removeXpBtn.addEventListener('click', () => {
    lowerXp(10); // Add 10 XP to the user's current XP
});
  

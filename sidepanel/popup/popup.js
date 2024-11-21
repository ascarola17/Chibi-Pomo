document.getElementById('reset-stats').addEventListener('click', () => {
    chrome.storage.sync.set({
      userStats: {
        visits: 0,
        timeSpent: 0,
        lastUpdated: new Date().toISOString()
      }
    });
    alert('Stats have been reset!');
  });


  document.getElementById('add-stats').addEventListener('click', () => {
    chrome.storage.sync.get('userStats', (data) => {
      const stats = data.userStats;
      stats.visits += 1;
      stats.timeSpent += 1;
      stats.lastUpdated = new Date().toISOString();

      chrome.storage.sync.set({ userStats: stats });
      alert('Stats have been updated!');
    });
  });

  document.getElementById('toggle-box').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBox"});
    });
  });

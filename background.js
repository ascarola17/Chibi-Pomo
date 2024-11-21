chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
  // Initialize default stats
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    userStats: {
      visits: 0,
      timeSpent: 0,
      lastUpdated: new Date().toISOString()
    }
  });
});


// Update stats every minute
// setInterval(() => {
//   chrome.storage.sync.get('userStats', (data) => {
//     const stats = data.userStats;
//     stats.visits += 1;
//     stats.timeSpent += 1;
//     stats.lastUpdated = new Date().toISOString();
    
//     chrome.storage.sync.set({ userStats: stats });
//   });
// }, 10);
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
      userStats: {
        levels: 1,
        exp_gained: 0,
        max_xp: 100,
        lastUpdated: new Date().toISOString()
      }
    });
  });
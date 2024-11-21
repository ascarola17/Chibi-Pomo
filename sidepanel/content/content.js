// Create and inject the floating box
function createFloatingBox() {
  const box = document.createElement('div');
  box.id = 'user-stats-box';
  box.innerHTML = `
    <div class="box-header">
      <h3>User Stats</h3>
      <button id="close-box" aria-label="Close">×</button>
    </div>
    <p>Visits: <span id="visits">0</span></p>
    <p>Time Spent: <span id="time-spent">0</span> minutes</p>
    <p>Last Updated: <span id="last-updated">Never</span></p>
  `;
  document.body.appendChild(box);
  
  // Add close functionality
  const closeButton = document.getElementById('close-box');
  closeButton.addEventListener('click', () => {
    box.style.display = 'none';
  });

  // content.js  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleBox') {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Make the box draggable
  let isDragging = false;
  let dragOffsetX, dragOffsetY;

  box.addEventListener('mousedown', (e) => {
    if (e.target !== closeButton) {
      isDragging = true;
      dragOffsetX = e.clientX - box.offsetLeft;
      dragOffsetY = e.clientY - box.offsetTop;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      box.style.left = (e.clientX - dragOffsetX) + 'px';
      box.style.top = (e.clientY - dragOffsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Update the stats in the floating box
function updateStats() {
  chrome.storage.sync.get('userStats', (data) => {
    const stats = data.userStats;
    document.getElementById('visits').textContent = stats.visits;
    document.getElementById('time-spent').textContent = stats.timeSpent;
    document.getElementById('last-updated').textContent = new Date(stats.lastUpdated).toLocaleString();
  });
}

// Initialize the floating box and start updating stats
createFloatingBox();
updateStats();
setInterval(updateStats, 10);
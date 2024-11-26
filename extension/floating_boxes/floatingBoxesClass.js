
// content.js
class FloatingBox {
    constructor(id, title = 'Floating Box') {
      this.id = id;
      this.title = title;
      this.box = null;
      this.isDragging = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }
  
    create() {
      // Create the container box
      const box = document.createElement('div');
      box.id = this.id;
      box.className = 'floating-box';
      
      // Create the basic structure
      box.innerHTML = `
        <div class="box-header">
          <h3>${this.title}</h3>
          <button class="close-box" aria-label="Close">×</button>
        </div>
        <div class="box-content"></div>
      `;
  
      // Add styles if they haven't been added yet
      this.injectStyles();
      
      // Add the box to the document
      document.body.appendChild(box);
      this.box = box;
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      return this;
    }
  
    // Inject HTML content into the box
    setContent(html) {
      if (!this.box) return;
      const contentContainer = this.box.querySelector('.box-content');
      contentContainer.innerHTML = html;
    }
  
    // Load HTML file content into the box
    async loadHTMLFile(url) {
      try {
        const path = chrome.runtime.getURL(url);
        console.log(path);
        const response = await fetch(path);
        console.log(response);
        const html = await response.text();
        console.log(html);
  
        // const scriptContent = this.extractScripts(html);
        // console.log(scriptContent);
        this.setContent(html);
        // this.executeScripts(scriptContent);
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("extension/index.js");
        script.type = "module";
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading HTML file:', error);
        this.setContent(`
          <p>Error loading content:</p>
          <pre>${error.message}</pre>
          <p>Attempted URL: ${url}</p>
          <p>Check the console for more details.</p>
        `);
      }
    }
     extractScripts(html) {
      const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
      const scripts = []
      let match;
  
      while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
      }
  
      return scripts;
    }
  
    executeScripts(scripts) {
      scripts.forEach(script => {
        try {
          eval(script);
        } catch (error) {
          console.error('Error executing script:', error);
        }
      });
    }
  
    // Set position of the box
    setPosition(x, y) {
      if (!this.box) return;
      this.box.style.left = `${x}px`;
      this.box.style.top = `${y}px`;
    }
  
    // Show the box
    show() {
      if (!this.box) return;
      this.box.style.display = 'block';
    }
  
    // Hide the box
    hide() {
      if (!this.box) return;
      this.box.style.display = 'none';
    }
  
    // Remove the box
    destroy() {
      if (!this.box) return;
      this.box.remove();
      this.box = null;
    }
  
    initializeEventListeners() {
      if (!this.box) return;
  
      // Close button functionality
      const closeButton = this.box.querySelector('.close-box');
      closeButton.addEventListener('click', () => this.hide());
  
      // Dragging functionality
      this.box.addEventListener('mousedown', (e) => {
        if (e.target.className !== 'close-box') {
          this.isDragging = true;
          this.dragOffsetX = e.clientX - this.box.offsetLeft;
          this.dragOffsetY = e.clientY - this.box.offsetTop;
        }
      });
  
      document.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          this.setPosition(
            e.clientX - this.dragOffsetX,
            e.clientY - this.dragOffsetY
          );
        }
      });
  
      document.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
    }
  
    
  
    injectStyles() {
      // Only inject styles once
      if (!document.getElementById('floating-box-styles')) {
        const styles = `
          .floating-box {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 200px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
          }
  
          .floating-box .box-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f5f5f5;
            border-bottom: 1px solid #eee;
            border-radius: 8px 8px 0 0;
            cursor: move;
          }
  
          .floating-box .box-header h3 {
            margin: 0;
            font-size: 16px;
          }
  
          .floating-box .close-box {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
          }
  
          .floating-box .box-content {
            padding: 15px;
            overflow-y: auto;
            max-height: calc(100vh - 200px);
          }
        `;
  
        const styleElement = document.createElement('style');
        styleElement.id = 'floating-box-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
      }
    }
  }
  
  
  // Example usage:
  
  // Create a box with temperature controls
  const tempBox = new FloatingBox('user-stats-box', 'Temperature Controls').create();
  tempBox.setContent(`
    <div>
      Temperature: <span id="label-temperature"></span>
    </div>
    <div>
      Top-k: <span id="label-top-k"></span>
    </div>
    <button onclick="handleRun()">Run</button>
    <button onclick="handleReset()">Reset</button>
  `);
  tempBox.setPosition(20, 20);
  
  // Create another box with different content
  const statsBox = new FloatingBox('stats-box', 'User Stats').create();
  statsBox.setContent(`
    <p>Visits: <span id="visits">0</span></p>
    <p>Time Spent: <span id="time-spent">0</span> minutes</p>
    <p>Last Updated: <span id="last-updated">Never</span></p>
  `);
  statsBox.setPosition(20, 200);
  
  
  const box2 = new FloatingBox('user-stats-box', 'user-stats-box').create();
  
  box2.setContent(`
      <div class="box-header">
        <h3>User Stats</h3>
        <button id="close-box" aria-label="Close">×</button>
      </div>
      <p>Visits: <span id="visits">0</span></p>
      <p>Time Spent: <span id="time-spent">0</span> minutes</p>
      <p>Last Updated: <span id="last-updated">Never</span></p>
    `);
  
  box2.setPosition(20, 400);
  
  
  // Load content from an HTML file
  const contentBox = new FloatingBox('content-box', 'Dynamic Content').create();
  contentBox.loadHTMLFile('extension/index.html');
  contentBox.setPosition(20, 600);
  
  const popup = new FloatingBox('content-box', 'Dynamic Content').create();
  popup.loadHTMLFile('extension/popup/popup.html');
  popup.setPosition(20, 600);
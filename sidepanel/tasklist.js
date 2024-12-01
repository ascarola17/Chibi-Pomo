import { addXp } from './exp.js';
import { startTimer } from './timer.js';
// Task management
let tasks = [];

// DOM elements
const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

function addTask() {
    const taskText = newTaskInput.value.trim();
    console.log(taskText);
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            rewards: { xp: 100, gold: 0 }
        };
        tasks.push(task);
        renderTask(task);
        newTaskInput.value = '';
        saveTasks();
    }
    console.log(tasks);
}

// Render task
function renderTask(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" class="input-task-complete" ${task.completed ? 'checked' : ''}>
        <span ${task.completed ? 'class="completed"' : ''}>${task.text}</span>
        <span class="rewards">+${task.rewards.xp} XP</span>
        <button class="edit-task">Edit</button>
        <button class="delete-task">Delete</button>
        <button class="start-task">Start</button>
    `;
    li.dataset.id = task.id;

    // Event listeners for task actions
    li.querySelector('.input-task-complete').addEventListener('change', toggleComplete);
    li.querySelector('.edit-task').addEventListener('click', editTask);
    li.querySelector('.delete-task').addEventListener('click', deleteTask);
    li.querySelector('.start-task').addEventListener('click', startTask);
    taskList.appendChild(li);
}

// Toggle complete
function toggleComplete(e) {
    const taskId = parseInt(e.target.closest('li').dataset.id);
    const task = tasks.find(t => t.id === taskId);
    task.completed = e.target.checked;
    e.target.nextElementSibling.classList.toggle('completed');
    if (task.completed) {
        addXp(task.rewards.xp);
    }
    saveTasks();
}

// Edit task
function editTask(e) {
    const li = e.target.closest('li');
    const taskId = parseInt(li.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    const newText = prompt('Edit task:', task.text);
    if (newText !== null) {
        task.text = newText.trim();
        li.querySelector('span').textContent = task.text;
        saveTasks();
    }
}

// Delete task
function deleteTask(e) {
    const li = e.target.closest('li');
    const taskId = parseInt(li.dataset.id);
    tasks = tasks.filter(t => t.id !== taskId);
    li.remove();
    saveTasks();
}

// Start task
function startTask(e) {
    console.log('Start button clicked!');
    startTimer();
}


// Chrome storage integration
function saveTasks() {
    chrome.storage.sync.set({ userTasks: tasks }, () => {
        console.log(tasks);
        console.log('Tasks saved to Chrome storage');
    });
}

function loadTasks() {
    chrome.storage.sync.get(['userTasks'], (result) => {
        if (result.userTasks) {
            tasks = result.userTasks;
            tasks.forEach(task => renderTask(task));
        }
    });
    chrome.storage.sync.get(['userTasks'], (result) => {
        if (result.userTasks) {
            console.log(result.userTasks);
            tasks = result.userTasks;
            tasks.forEach(task => addQuest(task.text, task.difficulty, task.rewards.xp, task));
        }
    });
}

// Load tasks when the script runs
loadTasks();


// Event listeners
addTaskButton.addEventListener('click', () => {
    addTask();
});


const currentQuests = document.getElementById('current-quests');
const questBoard = document.getElementById('quest-board');
const newQuestInput = document.getElementById('new-quest-input');
const addQuestBtn = document.getElementById('add-quest-btn');
const difficultyRating = document.getElementById('difficulty-rating');
let currentDifficulty = 0;

// Collapsible sections
const collapsibles = document.getElementsByClassName("collapsible");
Array.from(collapsibles).forEach(coll => {
    coll.addEventListener("click", function() {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// Star rating system
difficultyRating.addEventListener('click', function(e) {
    if (e.target.nodeName === 'SPAN') {
        const stars = difficultyRating.children;
        currentDifficulty = parseInt(e.target.getAttribute('data-rating'));

        Array.from(stars).forEach(star => {
            const rating = parseInt(star.getAttribute('data-rating'));
            star.classList.toggle('active', rating <= currentDifficulty);
        });
    }
});

// Add new quest
addQuestBtn.addEventListener('click', addNewQuest);
newQuestInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addNewQuest();
});

function addNewQuest() {
    const questText = newQuestInput.value.trim();
    if (questText && currentDifficulty > 0) {
        const exp = calculateExp(currentDifficulty);
        const task = {
            id: Date.now(),
            text: questText,
            completed: false,
            rewards: { xp: exp, gold: 0 },
            currentProgress: false,
            difficulty: currentDifficulty
        };
        tasks.push(task);
        renderTask(task);
        saveTasks();
        addQuest(questText, currentDifficulty, exp, task);
        newQuestInput.value = '';
        resetStarRating();
    }
}

function addQuest(text, difficulty, exp, task) {
    const li = document.createElement('li');
    li.className = 'quest-item';
    li.draggable = true;
    li.innerHTML = `
        <span>${text}</span> 
        <span>(Difficulty: ${difficulty}, EXP: ${exp})</span>
        <button class="move-btn">Move</button>
        <input type="checkbox" class="input-task-complete" ${task.completed ? 'checked' : ''}>
        <span ${task.completed ? 'class="completed"' : ''}>${text}</span>
        <span class="rewards">+${task.rewards.xp} XP</span>
        <button class="edit-task">Edit</button>
        <button class="delete-task">Delete</button>
        <button class="start-task">Start</button>
    `;
    li.dataset.id = task.id;

    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragend', dragEnd);
    li.querySelector('.input-task-complete').addEventListener('change', toggleComplete);
    li.querySelector('.edit-task').addEventListener('click', editTask);
    li.querySelector('.delete-task').addEventListener('click', deleteTask);
    li.querySelector('.start-task').addEventListener('click', startTask);
    taskList.appendChild(li);

    if (task.currentProgress === true) {
        currentQuests.appendChild(li);
        updateCollapsibleHeight(currentQuests);
    } else {
        questBoard.appendChild(li);
        updateCollapsibleHeight(questBoard);    
    }

    const moveBtn = li.querySelector('.move-btn');
    moveBtn.addEventListener('click', function() {
        const targetList = li.parentElement === currentQuests ? questBoard : currentQuests;
        console.log(task);
        targetList.appendChild(li);
        const cur_task = tasks.find(t => t.id === task.id);
        cur_task.currentProgress = !task.currentProgress;
        updateCollapsibleHeight(targetList);
        saveTasks();
    });
}

function calculateExp(difficulty) {
    return difficulty * 10;
}

function resetStarRating() {
    const stars = difficultyRating.children;
    Array.from(stars).forEach(star => star.classList.remove('active'));
    currentDifficulty = 0;
}

// Drag and Drop functionality
let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function dragEnd() {
    this.classList.remove('dragging');
}

[currentQuests, questBoard].forEach(list => {
    list.addEventListener('dragover', dragOver);
    list.addEventListener('dragenter', dragEnter);
    list.addEventListener('dragleave', dragLeave);
    list.addEventListener('drop', drop);
});

function dragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(this, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        this.appendChild(draggable);
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave() {
    this.classList.remove('drag-over');
}

function drop() {
    this.classList.remove('drag-over');
    updateCollapsibleHeight(this);
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.quest-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateCollapsibleHeight(list) {
    const content = list.closest('.content');
    content.style.maxHeight = content.scrollHeight + "px";
}
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
}

// Load tasks when the script runs
loadTasks();


// Event listeners
addTaskButton.addEventListener('click', () => {
    addTask();
});
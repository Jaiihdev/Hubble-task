// DOM Elements
const gridCanvas = document.getElementById('grid-canvas');
const taskInput = document.getElementById('task-input');
const timeInput = document.getElementById('time-input');
const createTaskBtn = document.getElementById('create-task-btn');
const clearBtn = document.getElementById('clear-btn');
const taskHistory = document.getElementById('task-history');
const taskTemplate = document.getElementById('task-template');
const timerAudio = document.getElementById('timer-audio');

// Constants
const COLORS = ['task-blue', 'task-green', 'task-orange', 'task-red', 'task-purple'];
const GRID_SNAP = 20; // Size of grid cells in pixels

// Task Management
let tasks = [];
let completedTasks = [];
let nextTaskId = 1;

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderCompletedTasks();
});

// Create a new task
function createTask() {
    const taskName = taskInput.value.trim();
    if (!taskName) {
        alert('Please enter a task name');
        return;
    }
    
    const minutes = parseInt(timeInput.value) || 25;
    const seconds = minutes * 60;
    
    const task = {
        id: nextTaskId++,
        name: taskName,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: false,
        colorClass: getRandomColorClass(),
        position: getRandomPosition(),
        timerInterval: null
    };
    
    tasks.push(task);
    
    // Create task card
    renderTask(task);
    
    // Reset input fields
    taskInput.value = '';
    taskInput.focus();
}

// Render a single task card
function renderTask(task) {
    // Clone the template
    const taskNode = document.importNode(taskTemplate.content, true).querySelector('.task-card');
    
    // Set task attributes
    taskNode.id = `task-${task.id}`;
    taskNode.classList.add(task.colorClass);
    taskNode.style.left = `${task.position.x}px`;
    taskNode.style.top = `${task.position.y}px`;
    
    // Set task content
    taskNode.querySelector('.task-title').textContent = task.name;
    taskNode.querySelector('.task-timer').textContent = formatTime(task.remainingSeconds);
    
    // Setup play/pause button
    const playPauseBtn = taskNode.querySelector('.task-play-pause');
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskTimer(task.id);
    });
    
    // Setup close button
    const closeBtn = taskNode.querySelector('.task-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        completeTask(task.id);
    });
    
    // Make it draggable
    setupDraggable(taskNode);
    
    // Add to grid
    gridCanvas.appendChild(taskNode);
}

// Update all tasks
function updateTaskUI(taskId) {
    const task = findTaskById(taskId);
    if (!task) return;
    
    const taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;
    
    // Update timer display
    const timerElement = taskElement.querySelector('.task-timer');
    timerElement.textContent = formatTime(task.remainingSeconds);
    
    // Update play/pause button
    const playPauseBtn = taskElement.querySelector('.task-play-pause i');
    if (task.isRunning) {
        playPauseBtn.className = 'bi bi-pause-fill';
        timerElement.classList.add('timer-running');
    } else {
        playPauseBtn.className = 'bi bi-play-fill';
        timerElement.classList.remove('timer-running');
    }
    
    // Highlight expired tasks
    if (task.remainingSeconds <= 0) {
        taskElement.classList.add('task-expired');
    } else {
        taskElement.classList.remove('task-expired');
    }
}

// Toggle timer for a task
function toggleTaskTimer(taskId) {
    const task = findTaskById(taskId);
    if (!task) return;
    
    // If the timer is at 0, don't allow starting
    if (task.remainingSeconds <= 0) {
        return;
    }
    
    if (task.isRunning) {
        // Pause the timer
        clearInterval(task.timerInterval);
        task.isRunning = false;
    } else {
        // Start the timer
        task.isRunning = true;
        task.timerInterval = setInterval(() => {
            // Reduce the time
            task.remainingSeconds--;
            
            // Update the UI
            updateTaskUI(task.id);
            
            // Check if timer is complete
            if (task.remainingSeconds <= 0) {
                clearInterval(task.timerInterval);
                task.isRunning = false;
                
                // Play alert sound
                playAlertSound();
                
                // Fire confetti
                showCompletionConfetti(task.id);
            }
        }, 1000);
    }
    
    // Update UI
    updateTaskUI(task.id);
}

// Complete a task (remove from grid and add to history)
function completeTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Stop the timer if it's running
    if (task.isRunning) {
        clearInterval(task.timerInterval);
    }
    
    // Calculate how much time was used
    const timeUsed = task.totalSeconds - task.remainingSeconds;
    
    // Add to completed tasks
    completedTasks.unshift({
        name: task.name,
        totalTime: task.totalSeconds,
        timeUsed: timeUsed,
        completed: new Date().toISOString()
    });
    
    // Remove from active tasks
    tasks.splice(taskIndex, 1);
    
    // Remove from DOM
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
        taskElement.remove();
    }
    
    // Save tasks and update UI
    saveTasks();
    renderCompletedTasks();
}

// Render the list of completed tasks
function renderCompletedTasks() {
    taskHistory.innerHTML = '';
    
    if (completedTasks.length === 0) {
        taskHistory.innerHTML = '<p class="text-center text-muted my-3">No completed tasks yet</p>';
        return;
    }
    
    completedTasks.forEach(task => {
        const element = document.createElement('div');
        element.className = 'list-group-item task-history-item';
        
        element.innerHTML = `
            <div class="task-name">${task.name}</div>
            <div class="task-duration">${formatTime(task.timeUsed)}</div>
        `;
        
        taskHistory.appendChild(element);
    });
}

// Play an alert sound
function playAlertSound() {
    timerAudio.currentTime = 0;
    timerAudio.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// Show confetti when a timer completes
function showCompletionConfetti(taskId) {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;
    
    // Get the position of the task to center confetti
    const rect = taskElement.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
    
    // Fire confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y: y - 0.1 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    });
    
    // Fire a second burst for more effect
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: x - 0.1, y: y - 0.05 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
        });
    }, 250);
    
    // And a third burst
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: x + 0.1, y: y - 0.05 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
        });
    }, 400);
}

// Helper to find a task by ID
function findTaskById(id) {
    return tasks.find(t => t.id === id);
}

// Format seconds into MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Get a random position within the grid
function getRandomPosition() {
    const canvasWidth = gridCanvas.offsetWidth - 220; // Account for card width
    const canvasHeight = gridCanvas.offsetHeight - 120; // Account for card height
    
    // Generate random position and snap to grid
    const x = Math.floor(Math.random() * canvasWidth / GRID_SNAP) * GRID_SNAP;
    const y = Math.floor(Math.random() * canvasHeight / GRID_SNAP) * GRID_SNAP;
    
    return { x, y };
}

// Get a random color class
function getRandomColorClass() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Set up draggable functionality for a task card
function setupDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Mouse events
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    element.addEventListener('touchstart', touchStartDrag);
    element.addEventListener('touchmove', touchDrag);
    element.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        if (e.target.closest('button')) return; // Ignore if clicking buttons
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        
        // Bring to front
        element.style.zIndex = 100;
    }
    
    function touchStartDrag(e) {
        if (e.target.closest('button')) return; // Ignore if clicking buttons
        
        const touch = e.touches[0];
        isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        
        // Bring to front
        element.style.zIndex = 100;
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        // Calculate new position
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Snap to grid
        const newLeft = Math.round((startLeft + deltaX) / GRID_SNAP) * GRID_SNAP;
        const newTop = Math.round((startTop + deltaY) / GRID_SNAP) * GRID_SNAP;
        
        // Apply new position
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
    }
    
    function touchDrag(e) {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling
        
        const touch = e.touches[0];
        
        // Calculate new position
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        // Snap to grid
        const newLeft = Math.round((startLeft + deltaX) / GRID_SNAP) * GRID_SNAP;
        const newTop = Math.round((startTop + deltaY) / GRID_SNAP) * GRID_SNAP;
        
        // Apply new position
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        
        // Update task position in data
        const taskId = parseInt(element.id.replace('task-', ''));
        const task = findTaskById(taskId);
        if (task) {
            task.position = {
                x: parseInt(element.style.left),
                y: parseInt(element.style.top)
            };
        }
        
        // Reset z-index
        element.style.zIndex = 10;
    }
}

// LocalStorage functions
function saveTasks() {
    localStorage.setItem('hubbleTasksActive', JSON.stringify(tasks.map(t => {
        // Don't save the interval functions
        const { timerInterval, ...taskData } = t;
        return taskData;
    })));
    
    localStorage.setItem('hubbleTasksCompleted', JSON.stringify(completedTasks));
    localStorage.setItem('hubbleNextTaskId', nextTaskId.toString());
}

function loadTasks() {
    // Load completed tasks
    const savedCompleted = localStorage.getItem('hubbleTasksCompleted');
    if (savedCompleted) {
        completedTasks = JSON.parse(savedCompleted);
    }
    
    // Load active tasks
    const savedActive = localStorage.getItem('hubbleTasksActive');
    if (savedActive) {
        const loadedTasks = JSON.parse(savedActive);
        
        // Recreate tasks without timer intervals
        loadedTasks.forEach(t => {
            t.timerInterval = null;
            t.isRunning = false;
        });
        
        tasks = loadedTasks;
        
        // Render all tasks
        tasks.forEach(task => renderTask(task));
    }
    
    // Load next task ID
    const savedNextId = localStorage.getItem('hubbleNextTaskId');
    if (savedNextId) {
        nextTaskId = parseInt(savedNextId);
    }
}

// Clear all tasks
function clearAllTasks() {
    if (!confirm('Are you sure you want to clear all tasks?')) return;
    
    // Stop all timers
    tasks.forEach(task => {
        if (task.timerInterval) {
            clearInterval(task.timerInterval);
        }
    });
    
    // Clear arrays
    tasks = [];
    completedTasks = [];
    
    // Clear UI
    gridCanvas.innerHTML = '';
    taskHistory.innerHTML = '';
    
    // Save cleared state
    saveTasks();
    renderCompletedTasks();
}

// Event listeners
createTaskBtn.addEventListener('click', createTask);
clearBtn.addEventListener('click', clearAllTasks);

// Auto-save every minute
setInterval(saveTasks, 60000); 
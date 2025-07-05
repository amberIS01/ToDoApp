const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks',
    USER: 'taskflow_user',
    LAST_SYNC: 'taskflow_last_sync'
};

// Get all tasks from localStorage
function getTasks() {
    try {
        const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (!tasksJson) return [];
        
        const tasks = JSON.parse(tasksJson);
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
        return [];
    }
}

// Save tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

// Get tasks by status
function getTasksByStatus(status) {
    const tasks = getTasks();
    return tasks.filter(task => task.status === status);
}

// Get a single task by ID
function getTaskById(id) {
    const tasks = getTasks();
    return tasks.find(task => task.id === id);
}

// Add a new task
function addTask(taskData) {
    // Handle both old format (just title) and new format (object)
    let title, description, dueDate, priority;
    
    if (typeof taskData === 'string') {
        // Old format: just title
        title = taskData;
        description = undefined;
        dueDate = undefined;
        priority = 'medium';
    } else {
        // New format: object with all properties
        title = taskData.title;
        description = taskData.description;
        dueDate = taskData.dueDate;
        priority = taskData.priority || 'medium';
    }
    
    if (!title || !title.trim()) {
        throw new Error('Task title cannot be empty');
    }
    
    const tasks = getTasks();
    const newTask = {
        id: generateId(),
        title: title.trim(),
        description: description?.trim(),
        dueDate: dueDate || null,
        priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
        status: 'todo',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
    if (!['todo', 'completed', 'archived'].includes(newStatus)) {
        throw new Error('Invalid task status');
    }
    
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].lastModified = new Date().toISOString();
    saveTasks(tasks);
    
    return tasks[taskIndex];
}


// Delete a task
function deleteTask(taskId) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    saveTasks(tasks);
    
    return deletedTask;
}

// Get user data
function getUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) {
        // Redirect to login if no user data found
        window.location.href = '../index.html';
        return null;
    }
    
    return JSON.parse(userJson);
}

// Clear all app data (for sign out)
function clearAppData() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Keep tasks for now, but you might want to clear them too
    // localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
}

// Clear all existing tasks (one-time cleanup)
function clearAllTasks() {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    console.log('All tasks cleared');
}

// Initialize app with empty storage
function initializeEmptyStorage() {
    const tasks = getTasks();
    if (tasks.length === 0) {
        // Start with empty task list
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
}

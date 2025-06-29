// API integration for TaskFlow app

const API_ENDPOINTS = {
    TODOS: 'https://dummyjson.com/todos',
    AVATAR: 'https://ui-avatars.com/api/'
};

// Fetch dummy todos from API
async function fetchDummyTodos() {
    try {
        const response = await fetch(API_ENDPOINTS.TODOS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.todos || [];
    } catch (error) {
        console.error('Error fetching dummy todos:', error);
        showNotification('Failed to load sample tasks', 'error');
        return [];
    }
}

// Process and store dummy todos
async function loadAndStoreDummyTodos() {
    const existingTasks = getTasks();
    
    // Only fetch if we don't have tasks or it's been a while since last sync
    if (existingTasks.length === 0) {
        const todos = await fetchDummyTodos();
        
        if (todos.length > 0) {
            const newTasks = todos.slice(0, 5).map(todo => ({
                id: generateId(),
                title: todo.todo,
                status: todo.completed ? 'completed' : 'todo',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }));
            
            // Save new tasks
            saveTasks([...existingTasks, ...newTasks]);
            return newTasks;
        }
    }
    
    return [];
}

// Get user avatar URL
function getUserAvatarUrl(name) {
    if (!name) name = 'User';
    const params = new URLSearchParams({
        name: name.split(' ').join('+'),
        background: '0D8ABC',
        color: 'fff',
        size: '128',
        rounded: 'true',
        bold: 'true'
    });
    
    return `${API_ENDPOINTS.AVATAR}?${params}`;
}

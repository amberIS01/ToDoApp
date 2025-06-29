// Main application script for TaskFlow
console.log('app.js loaded');

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('taskflow_user'));
    if (!user) {
        console.log('No user found, redirecting to index.html');
        window.location.href = '../index.html';
        return null;
    }
    return user;
}

// Initialize the application
function initApp() {
    console.log('Initializing TaskFlow...');
    
    // Check authentication
    const user = checkAuth();
    if (!user) return;
    
    // Set up the UI
    updateUserInfo();
    
    // Initialize with sample data if needed
    initializeWithSampleData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load and render tasks
    renderAllTasks();
    
    // Try to load dummy data from API
    loadAndStoreDummyTodos().then((newTasks) => {
        if (newTasks && newTasks.length > 0) {
            console.log(`Loaded ${newTasks.length} tasks from API`);
            renderAllTasks();
        }
    }).catch(error => {
        console.error('Error loading dummy data:', error);
    });
}

// Start the app when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initializeApp() {
    // Set up user info
    updateUserInfo();
    
    // Initialize with sample data if empty
    initializeWithSampleData();
    
    // Load tasks
    renderAllTasks();
    
    // Try to load dummy data from API
    loadAndStoreDummyTodos().then(() => {
        // Re-render if we got new tasks
        renderAllTasks();
    });
}

function setupEventListeners() {
    // Add task form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }
    
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            // Reset form
            const form = document.getElementById('add-task-form');
            if (form) {
                form.reset();
                // Set default priority
                const defaultPriority = form.querySelector('input[value="medium"]');
                if (defaultPriority) {
                    defaultPriority.checked = true;
                }
            }
            showAddTaskModal();
        });
    }

    // Close modal buttons
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                closeModal(modal.id);
            }
        }
    });

    // Sign out button
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', handleSignOut);
    }
    
    // Modal close button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTaskModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTaskModal();
            }
        });
    }
    
    // Task action buttons (delegated event listeners)
    document.addEventListener('click', (e) => {
        // Handle task actions
        if (e.target.closest('.task-card') || e.target.closest('.task-actions button')) {
            handleTaskAction(e);
            return;
        }
        
        // Handle column drops for drag and drop
        if (e.target.closest('.task-list')) {
            handleTaskDrop(e);
        }
    });
    
    // Make tasks draggable
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-card')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
            e.target.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-card')) {
            e.target.classList.remove('dragging');
        }
    });
    
    // Add event listeners for drag over on task lists
    document.querySelectorAll('.task-list').forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                list.appendChild(draggable);
            } else {
                list.insertBefore(draggable, afterElement);
            }
        });
    });
}

// Helper function for drag and drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    
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

// Handle task drop
function handleTaskDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = getTaskById(taskId);
    
    if (!task) return;
    
    const newStatus = e.target.closest('.task-board').id.replace('-board', '');
    
    if (task.status !== newStatus) {
        updateTaskStatus(taskId, newStatus);
        showNotification(`Task moved to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`, 'success');
    }
}

// Show add task modal with animation
function showAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    if (modal) {
        // Reset form
        const form = document.getElementById('add-task-form');
        if (form) {
            form.reset();
            // Set default priority
            const defaultPriority = form.querySelector('input[value="medium"]');
            if (defaultPriority) {
                defaultPriority.checked = true;
            }
        }
        
        // Show modal with animation
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Focus on title input after animation
        setTimeout(() => {
            const titleInput = document.getElementById('task-title');
            if (titleInput) {
                titleInput.focus();
            }
        }, 100);
    }
}

// Close modal helper function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Re-enable scrolling
        
        // Remove modal from DOM after animation
        setTimeout(() => {
            if (!modal.classList.contains('show')) {
                modal.style.display = 'none';
            }
        }, 300);
    }
}

// Handle add task form submission
async function handleAddTask(e) {
    e.preventDefault();
    
    const form = e.target;
    const titleInput = form.querySelector('#task-title');
    const descriptionInput = form.querySelector('#task-description');
    const dueDateInput = form.querySelector('#task-due-date');
    const priorityInput = form.querySelector('input[name="task-priority"]:checked');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput?.value || 'medium';
    
    // Validate form
    if (!title) {
        showNotification('Please enter a task title', 'error');
        titleInput.focus();
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const taskData = {
            title,
            description: description || undefined,
            dueDate: dueDate || undefined,
            priority
        };
        
        const newTask = addTask(taskData);
        renderTask(newTask);
        updateTaskCounts();
        
        // Reset form
        form.reset();
        
        // Close modal
        closeModal('add-task-modal');
        
        // Show success message
        showNotification('Task added successfully!', 'success');
        
        // Focus on add task button after a short delay
        setTimeout(() => {
            const addButton = document.getElementById('add-task-btn');
            if (addButton) {
                addButton.focus();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification(error.message || 'Failed to add task. Please try again.', 'error');
        
        // Re-focus on the title input
        titleInput.focus();
        
    } finally {
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}

// Add task with enhanced data
function addTask({ title, description, dueDate, priority = 'medium' }) {
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

function handleTaskAction(e) {
    const target = e.target.closest('[data-id]');
    if (!target) return;
    
    const taskId = target.dataset.id;
    
    if (target.classList.contains('move-todo-btn') || target.closest('.move-todo-btn')) {
        updateTaskStatus(taskId, 'todo');
        showNotification('Task moved to To Do', 'success');
    } 
    else if (target.classList.contains('complete-btn') || target.closest('.complete-btn')) {
        updateTaskStatus(taskId, 'completed');
        showNotification('Task marked as completed', 'success');
    }
    else if (target.classList.contains('archive-btn') || target.closest('.archive-btn')) {
        const task = getTaskById(taskId);
        const newStatus = task.status === 'archived' ? 'todo' : 'archived';
        updateTaskStatus(taskId, newStatus);
        showNotification(
            newStatus === 'archived' ? 'Task archived' : 'Task restored', 
            'success'
        );
    }
    else if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
            showNotification('Task deleted', 'info');
        } else {
            return; // User cancelled
        }
    }
    else if (target.classList.contains('task-card') || target.closest('.task-card')) {
        // Open task details modal
        openTaskModal(taskId);
        return;
    } else {
        return; // Not a recognized action
    }
    
    // Re-render all tasks to reflect changes
    renderAllTasks();
}

function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        clearAppData();
        window.location.href = '../index.html';
    }
}

function updateUserInfo() {
    const user = getUser();
    if (!user) return;
    
    // Update greeting
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
        greetingEl.textContent = `Hello, ${user.name}`;
    }
    
    // Update avatar
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
        avatarEl.src = getUserAvatarUrl(user.name);
        avatarEl.alt = `${user.name}'s avatar`;
    }
}

function renderAllTasks() {
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    const archivedList = document.getElementById('archived-list');
    
    if (!todoList || !completedList || !archivedList) return;
    
    // Clear all lists
    todoList.innerHTML = '';
    completedList.innerHTML = '';
    archivedList.innerHTML = '';
    
    // Get all tasks
    const tasks = getTasks();
    
    if (tasks.length === 0) {
        // Show empty state
        todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks yet. Add one above!</p>
            </div>
        `;
        return;
    }
    
    // Render tasks in their respective lists
    tasks.forEach(task => {
        renderTask(task);
    });
    
    // Update task counts
    updateTaskCounts();
}

function renderTask(task) {
    if (!task) return;
    
    const taskElement = createTaskElement(task);
    const listId = `${task.status}-list`;
    const list = document.getElementById(listId);
    
    if (list) {
        list.appendChild(taskElement);
    }
    
    // Update task counts
    updateTaskCounts();
}

function updateTaskCounts() {
    const todoCount = getTasksByStatus('todo').length;
    const completedCount = getTasksByStatus('completed').length;
    const archivedCount = getTasksByStatus('archived').length;
    
    const todoCountEl = document.getElementById('todo-count');
    const completedCountEl = document.getElementById('completed-count');
    const archivedCountEl = document.getElementById('archived-count');
    
    if (todoCountEl) todoCountEl.textContent = todoCount;
    if (completedCountEl) completedCountEl.textContent = completedCount;
    if (archivedCountEl) archivedCountEl.textContent = archivedCount;
}

function openTaskModal(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-task-title');
    const modalMeta = document.getElementById('modal-task-meta');
    
    if (!modal || !modalTitle || !modalMeta) return;
    
    // Update modal content
    modalTitle.textContent = task.title;
    
    const createdDate = new Date(task.createdAt).toLocaleString();
    const modifiedDate = new Date(task.lastModified).toLocaleString();
    
    modalMeta.innerHTML = `
        <p>Created: ${createdDate}</p>
        <p>Last Modified: ${modifiedDate}</p>
        <p>Status: ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</p>
    `;
    
    // Update action buttons based on task status
    const moveTodoBtn = document.getElementById('move-todo-btn');
    const completeBtn = document.getElementById('complete-btn');
    const archiveBtn = document.getElementById('archive-btn');
    
    if (moveTodoBtn) {
        moveTodoBtn.style.display = task.status !== 'todo' ? 'inline-block' : 'none';
        moveTodoBtn.onclick = () => {
            updateTaskStatus(taskId, 'todo');
            closeTaskModal();
            renderAllTasks();
            showNotification('Task moved to To Do', 'success');
        };
    }
    
    if (completeBtn) {
        completeBtn.style.display = task.status !== 'completed' ? 'inline-block' : 'none';
        completeBtn.onclick = () => {
            updateTaskStatus(taskId, 'completed');
            closeTaskModal();
            renderAllTasks();
            showNotification('Task marked as completed', 'success');
        };
    }
    
    if (archiveBtn) {
        const isArchived = task.status === 'archived';
        archiveBtn.innerHTML = `<i class="fas fa-${isArchived ? 'trash-restore' : 'archive'}"></i> ${isArchived ? 'Restore' : 'Archive'}`;
        archiveBtn.onclick = () => {
            const newStatus = isArchived ? 'todo' : 'archived';
            updateTaskStatus(taskId, newStatus);
            closeTaskModal();
            renderAllTasks();
            showNotification(
                newStatus === 'archived' ? 'Task archived' : 'Task restored', 
                'success'
            );
        };
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
                closeTaskModal();
                renderAllTasks();
                showNotification('Task deleted', 'info');
            }
        };
    }
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function loadInitialData() {
    // This function can be expanded to load more initial data if needed
    updateTaskCounts();
}

// Utility functions for the TaskFlow app

// Format date to readable string
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    return date.toLocaleString('en-US', options);
}

// Generate a unique ID for tasks
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Create a task element
function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-card';
    taskEl.dataset.id = task.id;
    taskEl.draggable = true;
    
    const createdDate = new Date(task.createdAt);
    const lastModified = task.lastModified ? new Date(task.lastModified) : createdDate;
    const now = new Date();
    
    // Format relative time (e.g., "2 hours ago")
    const timeDiff = Math.floor((now - lastModified) / 1000);
    let timeAgo = '';
    
    if (timeDiff < 60) {
        timeAgo = 'Just now';
    } else if (timeDiff < 3600) {
        const mins = Math.floor(timeDiff / 60);
        timeAgo = `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (timeDiff < 86400) {
        const hours = Math.floor(timeDiff / 3600);
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(timeDiff / 86400);
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Priority badge
    const priority = task.priority || 'medium';
    const priorityColors = {
        high: '#dc3545',
        medium: '#ffc107',
        low: '#28a745'
    };
    
    taskEl.innerHTML = `
        <div class="task-header">
            <h4>${escapeHtml(task.title)}</h4>
            <span class="priority-badge" style="background-color: ${priorityColors[priority] || '#6c757d'}">
                ${priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        </div>
        
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
        
        <div class="task-footer">
            <div class="task-meta">
                <span class="time-ago" title="${formatDate(lastModified)}">
                    <i class="far fa-clock"></i> ${timeAgo}
                </span>
                ${task.dueDate ? `
                    <span class="due-date" style="color: ${new Date(task.dueDate) < now ? '#dc3545' : '#6c757d'}">
                        <i class="far fa-calendar-alt"></i> Due: ${formatDate(task.dueDate)}
                    </span>
                ` : ''}
            </div>
            
            <div class="task-actions">
                ${task.status !== 'todo' ? `
                    <button class="btn btn-sm btn-action move-todo-btn" data-id="${task.id}" title="Move to To Do">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                ` : ''}
                ${task.status !== 'completed' ? `
                    <button class="btn btn-sm btn-action complete-btn" data-id="${task.id}" title="Mark as Complete">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-action archive-btn" data-id="${task.id}" 
                    title="${task.status === 'archived' ? 'Restore Task' : 'Archive Task'}">
                    <i class="fas fa-${task.status === 'archived' ? 'trash-restore' : 'archive'}"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${task.id}" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return taskEl;
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles if not already added
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            background-color: #333;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification.fade-out {
            opacity: 0;
            transform: translateY(-20px);
        }
        
        .notification.success {
            background-color: #2ecc71;
        }
        
        .notification.error {
            background-color: #e74c3c;
        }
        
        .notification.info {
            background-color: #3498db;
        }
    `;
    document.head.appendChild(style);
}

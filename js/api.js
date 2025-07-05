// API integration for TaskFlow app

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
    
    return `https://ui-avatars.com/api/?${params}`;
}

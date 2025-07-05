//age veriffication logic
// Helper function to show error messages
function showError(message, element) {
    if (!element) {
        element = document.getElementById('error-message');
    }
    element.textContent = message;
    element.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ageVerificationForm');
    const errorElement = document.getElementById('error-message');
    const MIN_AGE = 10;

    // Set max date to today - 10 years
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
    document.getElementById('dob').max = maxDate.toISOString().split('T')[0];
    
    // Set min date to 150 years ago
    const minDate = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate());
    document.getElementById('dob').min = minDate.toISOString().split('T')[0];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset previous errors
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Get form values
        const name = form.name.value.trim();
        const dobValue = form.dob.value;
        
        // Validate name
        if (name.length < 2) {
            showError('Please enter a valid name (at least 2 characters)', errorElement);
            form.name.focus();
            return;
        }
        
        // Validate date of birth
        if (!dobValue) {
            showError('Please enter your date of birth', errorElement);
            form.dob.focus();
            return;
        }
        
        const dob = new Date(dobValue);
        
        // Calculate age
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        // Check if birthday has occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        // Check if user is at least 10 years old
        if (age < MIN_AGE) {
            showError(`You must be at least ${MIN_AGE} years old to use this app`, errorElement);
            form.dob.focus();
            return;
        }
        
        // Save user data to localStorage
        const userData = {
            name: name,
            age: age,
            joinedDate: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('taskflow_user', JSON.stringify(userData));
            console.log('User data saved:', userData);
            
            // Redirect to the app
            window.location.href = 'app/app.html';
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            showError('An error occurred. Please try again.', errorElement);
        }
    });
});

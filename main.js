// Main application entry point
// Initializes and connects all modules

// Import modules
// Note: In a production environment, you would use import statements
// For simplicity in this demo, we'll assume script tags in HTML

document.addEventListener('DOMContentLoaded', function() {
    // Initialize data manager
    const dataManager = window.dataManager;
    
    // Initialize user authentication
    const userAuth = new UserAuth(dataManager);
    
    // Initialize game manager
    const gameManager = new GameManager(dataManager, userAuth);
    
    // Initialize Flappy Bird game
    const flappyBirdGame = new FlappyBirdGame(dataManager);
    
    // Initialize Spin to Earn game
    const spinToEarnGame = new SpinToEarnGame(dataManager);
    
    // Register game modules with game manager
    gameManager.registerModule('flappy', flappyBirdGame);
    gameManager.registerModule('spin', spinToEarnGame);
    
    // Initialize leaderboard
    const leaderboard = new Leaderboard(dataManager);
    
    // Initialize UI
    initializeUI(gameManager, userAuth, leaderboard);
    
    // Default to Flappy Bird mode
    gameManager.switchMode('flappy');
    
    console.log('Application initialized');
});

// Initialize UI
function initializeUI(gameManager, userAuth, leaderboard) {
    // Login/Register modal
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userDisplay = document.getElementById('user-display');
    
    // Game mode buttons
    const flappyModeBtn = document.getElementById('flappy-mode-btn');
    const spinModeBtn = document.getElementById('spin-mode-btn');
    
    // Leaderboard button
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardClose = document.getElementById('leaderboard-close');
    
    // Check if user is logged in
    updateUserDisplay();
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            const result = userAuth.login(username, password);
            
            if (result.success) {
                closeModal(loginModal);
                updateUserDisplay();
            } else {
                showMessage(loginForm, result.message, 'error');
            }
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            const result = userAuth.register(username, email, password);
            
            if (result.success) {
                closeModal(loginModal);
                updateUserDisplay();
            } else {
                showMessage(registerForm, result.message, 'error');
            }
        });
    }
    
    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openModal(loginModal);
            showForm(loginForm);
            hideForm(registerForm);
        });
    }
    
    // Register button click
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            openModal(loginModal);
            hideForm(loginForm);
            showForm(registerForm);
        });
    }
    
    // Logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            userAuth.logout();
            updateUserDisplay();
        });
    }
    
    // Leaderboard button click
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            openModal(leaderboardModal);
            leaderboard.displayLeaderboard(gameManager.currentMode);
        });
    }
    
    // Leaderboard close button
    if (leaderboardClose) {
        leaderboardClose.addEventListener('click', function() {
            closeModal(leaderboardModal);
        });
    }
    
    // Update user display
    function updateUserDisplay() {
        if (userDisplay) {
            const userData = userAuth.getSafeUserData();
            
            if (userData) {
                userDisplay.innerHTML = `
                    <span class="username">${userData.username}</span>
                    <span class="coins">${userData.coins || 0} coins</span>
                `;
                
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'block';
            } else {
                userDisplay.innerHTML = 'Guest';
                
                if (loginBtn) loginBtn.style.display = 'block';
                if (registerBtn) registerBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        }
    }
    
    // Helper functions
    function openModal(modal) {
        if (modal) modal.style.display = 'flex';
    }
    
    function closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }
    
    function showForm(form) {
        if (form) form.style.display = 'block';
    }
    
    function hideForm(form) {
        if (form) form.style.display = 'none';
    }
    
    function showMessage(form, message, type) {
        const messageElement = form.querySelector('.message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
        }
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeModal(loginModal);
        }
        
        if (e.target === leaderboardModal) {
            closeModal(leaderboardModal);
        }
    });
}

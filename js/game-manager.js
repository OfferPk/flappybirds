// Game Manager - Handles switching between game modes and common game logic

class GameManager {
    constructor(dataManager, userAuth) {
        this.dataManager = dataManager;
        this.userAuth = userAuth;
        this.currentMode = null; // 'flappy' or 'spin'
        this.gameModules = {};
        this.isGameActive = false;
        
        // DOM elements
        this.gameContainer = document.getElementById('game-container');
        this.modeButtons = {
            flappy: document.getElementById('flappy-mode-btn'),
            spin: document.getElementById('spin-mode-btn')
        };
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    // Initialize event listeners for mode switching
    initEventListeners() {
        if (this.modeButtons.flappy) {
            this.modeButtons.flappy.addEventListener('click', () => this.switchMode('flappy'));
        }
        
        if (this.modeButtons.spin) {
            this.modeButtons.spin.addEventListener('click', () => this.switchMode('spin'));
        }
    }
    
    // Register a game module
    registerModule(name, moduleInstance) {
        this.gameModules[name] = moduleInstance;
        console.log(`Registered game module: ${name}`);
    }
    
    // Switch between game modes
    switchMode(mode) {
        if (this.currentMode === mode) return;
        
        // Stop current game if active
        if (this.isGameActive && this.currentMode && this.gameModules[this.currentMode]) {
            this.gameModules[this.currentMode].stop();
        }
        
        // Clear game container
        this.gameContainer.innerHTML = '';
        
        // Update active button styling
        if (this.modeButtons.flappy) {
            this.modeButtons.flappy.classList.toggle('active', mode === 'flappy');
        }
        if (this.modeButtons.spin) {
            this.modeButtons.spin.classList.toggle('active', mode === 'spin');
        }
        
        // Set current mode
        this.currentMode = mode;
        
        // Initialize selected game mode
        if (this.gameModules[mode]) {
            this.gameModules[mode].init(this.gameContainer);
            console.log(`Switched to ${mode} mode`);
        } else {
            console.error(`Game module ${mode} not registered`);
        }
    }
    
    // Start the current game
    startGame() {
        if (!this.currentMode || !this.gameModules[this.currentMode]) {
            console.error('No game mode selected');
            return false;
        }
        
        this.isGameActive = true;
        this.gameModules[this.currentMode].start();
        return true;
    }
    
    // Stop the current game
    stopGame() {
        if (!this.isGameActive || !this.currentMode || !this.gameModules[this.currentMode]) {
            return false;
        }
        
        this.isGameActive = false;
        this.gameModules[this.currentMode].stop();
        return true;
    }
    
    // Handle game over
    handleGameOver(score) {
        this.isGameActive = false;
        
        // Save score to leaderboard
        if (this.currentMode) {
            this.dataManager.saveScore(this.currentMode, score);
        }
        
        // Update UI to show game over
        console.log(`Game over. Score: ${score}`);
    }
    
    // Get current user data
    getCurrentUser() {
        return this.userAuth.getSafeUserData();
    }
    
    // Check if user is logged in
    isUserLoggedIn() {
        return this.userAuth.isLoggedIn;
    }
}

// Export class
// Will be instantiated in main.js with dependencies

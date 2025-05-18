// Flappy Bird Game Module
// Core game logic for Flappy Bird with combat features

class FlappyBirdGame {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.canvas = null;
        this.ctx = null;
        this.gameContainer = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.highScore = 0;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        
        // Game objects
        this.bird = {
            x: 100,
            y: 250,
            width: 40,
            height: 30,
            velocityY: 0,
            velocityX: 0,
            gravity: 800,
            jumpForce: -300,
            rotation: 0,
            flapPhase: 0,
            trail: [],
            invincible: false,
            isBlinking: false,
            isPowerUpActive: false,
            health: 5,
            maxHealth: 15,
            lastStoneTime: 0,
            lastMissileTime: 0,
            stones: [],
            missiles: [],
            isAttacking: false,
            attackCooldown: 0
        };
        
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        this.powerUps = [];
        this.doublePointsActive = false;
        this.turboBoostActive = false;
        this.enemies = [];
        this.enemyProjectiles = [];
        this.enemySpawnTimer = 0;
        this.powerMeter = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        
        // Game constants
        this.BIRD_FLAP_SPEED = 20;
        this.PIPE_SPEED = 200;
        this.PIPE_SPAWN_INTERVAL = 2.0;
        this.PIPE_GAP = 300;
        this.STONE_COOLDOWN = 200;
        this.STONE_SPEED = 22;
        this.STONE_DAMAGE = 2;
        this.STONE_SIZE = 25;
        this.MISSILE_COOLDOWN = 3000;
        this.MISSILE_DAMAGE = 3;
        this.MISSILE_SPEED = 1.8;
        this.MISSILE_SIZE = 50;
        this.ENEMY_SPAWN_INTERVAL = 3000;
        this.COMBO_TIMEOUT = 3000;
        
        // UI elements
        this.uiElements = {};
        
        // Event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    // Initialize game
    init(container) {
        this.gameContainer = container;
        
        // Create game UI
        this.createGameUI();
        
        // Get canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('click', this.handleClick);
        
        // Initialize UI elements
        this.initUIElements();
        
        // Load high score
        this.highScore = this.dataManager.getFromLocal('flappy_high_score') || 0;
        
        // Show start screen
        this.showOverlay('start-screen');
        
        console.log('Flappy Bird game initialized');
    }
    
    // Create game UI
    createGameUI() {
        this.gameContainer.innerHTML = `
            <canvas id="game-canvas"></canvas>
            
            <!-- UI Elements -->
            <div id="score-display" class="game-ui">0</div>
            <div id="health-bar-container">
                <div id="health-bar"></div>
            </div>
            <div id="power-bar-container">
                <div id="power-bar"></div>
            </div>
            <div id="power-up-notification" class="game-ui"></div>
            <div id="combo-display" class="game-ui">x1 COMBO!</div>
            
            <!-- Mobile Controls -->
            <div id="mobile-controls">
                <div class="mobile-button" id="mobile-up"><i class="fas fa-arrow-up"></i></div>
                <div class="mobile-button" id="mobile-down"><i class="fas fa-arrow-down"></i></div>
            </div>
            
            <!-- Game Overlays -->
            <div id="start-screen" class="game-overlay">
                <h1 class="overlay-title">Flappy Forest Flight</h1>
                <p class="overlay-text">Combat Enhanced Edition</p>
                <button id="start-button" class="overlay-button">Start Game</button>
            </div>
            
            <div id="game-over-screen" class="game-overlay">
                <h1 class="overlay-title">Game Over</h1>
                <p class="overlay-text">Score: <span id="final-score">0</span></p>
                <p class="overlay-text">High Score: <span id="high-score">0</span></p>
                <button id="restart-button" class="overlay-button">Play Again</button>
            </div>
            
            <div id="pause-screen" class="game-overlay">
                <h1 class="overlay-title">Game Paused</h1>
                <button id="resume-button" class="overlay-button">Resume</button>
            </div>
        `;
    }
    
    // Initialize UI elements
    initUIElements() {
        this.uiElements = {
            scoreDisplay: document.getElementById('score-display'),
            healthBar: document.getElementById('health-bar'),
            powerBar: document.getElementById('power-bar'),
            powerUpNotification: document.getElementById('power-up-notification'),
            comboDisplay: document.getElementById('combo-display'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            finalScore: document.getElementById('final-score'),
            highScore: document.getElementById('high-score'),
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button'),
            resumeButton: document.getElementById('resume-button'),
            mobileUp: document.getElementById('mobile-up'),
            mobileDown: document.getElementById('mobile-down')
        };
        
        // Add event listeners to UI elements
        if (this.uiElements.startButton) {
            this.uiElements.startButton.addEventListener('click', () => this.startGame());
        }
        
        if (this.uiElements.restartButton) {
            this.uiElements.restartButton.addEventListener('click', () => this.restartGame());
        }
        
        if (this.uiElements.resumeButton) {
            this.uiElements.resumeButton.addEventListener('click', () => this.resumeGame());
        }
        
        if (this.uiElements.mobileUp) {
            this.uiElements.mobileUp.addEventListener('touchstart', () => this.bird.velocityY = this.bird.jumpForce);
            this.uiElements.mobileUp.addEventListener('touchend', () => this.bird.velocityY = 0);
        }
        
        if (this.uiElements.mobileDown) {
            this.uiElements.mobileDown.addEventListener('touchstart', () => this.bird.velocityY = 200);
            this.uiElements.mobileDown.addEventListener('touchend', () => this.bird.velocityY = 0);
        }
    }
    
    // Resize canvas
    resizeCanvas() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth;
            this.canvas.height = this.canvas.parentElement.clientHeight;
        }
    }
    
    // Start game
    start() {
        this.startGame();
    }
    
    // Start game
    startGame() {
        // Hide start screen
        this.hideOverlay('start-screen');
        
        // Reset game state
        this.gameState = 'playing';
        this.score = 0;
        this.updateScoreDisplay();
        
        // Reset bird
        this.bird.x = 100;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocityY = 0;
        this.bird.velocityX = 0;
        this.bird.rotation = 0;
        this.bird.trail = [];
        this.bird.health = this.bird.maxHealth;
        this.bird.invincible = false;
        this.bird.isBlinking = false;
        this.bird.isPowerUpActive = false;
        
        // Reset pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // Reset power-ups
        this.powerUps = [];
        this.doublePointsActive = false;
        this.turboBoostActive = false;
        
        // Reset combat features
        this.bird.stones = [];
        this.bird.missiles = [];
        this.bird.lastStoneTime = 0;
        this.bird.lastMissileTime = 0;
        this.enemies = [];
        this.enemyProjectiles = [];
        this.enemySpawnTimer = 0;
        this.powerMeter = 0;
        this.resetCombo();
        
        // Update UI
        this.updateHealthBar();
        this.updatePowerBar();
        
        // Start game loop
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
        
        console.log('Flappy Bird game started');
    }
    
    // Stop game
    stop() {
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
        }
        
        console.log('Flappy Bird game stopped');
    }
    
    // Restart game
    restartGame() {
        // Hide game over screen
        this.hideOverlay('game-over-screen');
        
        // Start new game
        this.startGame();
    }
    
    // Pause game
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('pause-screen');
        }
    }
    
    // Resume game
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay('pause-screen');
            this.lastFrameTime = performance.now();
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    // Game over
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.dataManager.saveToLocal('flappy_high_score', this.highScore);
        }
        
        // Save score to leaderboard
        this.dataManager.saveScore('flappy', this.score);
        
        // Update game over screen
        if (this.uiElements.finalScore) {
            this.uiElements.finalScore.textContent = this.score;
        }
        
        if (this.uiElements.highScore) {
            this.uiElements.highScore.textContent = this.highScore;
        }
        
        // Show game over screen
        this.showOverlay('game-over-screen');
    }
    
    // Show overlay
    showOverlay(id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    // Hide overlay
    hideOverlay(id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Update score display
    updateScoreDisplay() {
        if (this.uiElements.scoreDisplay) {
            this.uiElements.scoreDisplay.textContent = this.score;
        }
    }
    
    // Update health bar
    updateHealthBar() {
        if (this.uiElements.healthBar) {
            const healthPercent = (this.bird.health / this.bird.maxHealth) * 100;
            this.uiElements.healthBar.style.width = `${healthPercent}%`;
        }
    }
    
    // Update power bar
    updatePowerBar() {
        if (this.uiElements.powerBar) {
            this.uiElements.powerBar.style.width = `${this.powerMeter}%`;
        }
    }
    
    // Show power-up notification
    showPowerUpNotification(message) {
        if (this.uiElements.powerUpNotification) {
            this.uiElements.powerUpNotification.textContent = message;
            this.uiElements.powerUpNotification.style.opacity = 1;
            
            setTimeout(() => {
                this.uiElements.powerUpNotification.style.opacity = 0;
            }, 2000);
        }
    }
    
    // Reset combo
    resetCombo() {
        this.comboCount = 0;
        this.comboTimer = 0;
        
        if (this.uiElements.comboDisplay) {
            this.uiElements.comboDisplay.style.opacity = 0;
        }
    }
    
    // Handle key down
    handleKeyDown(event) {
        if (this.gameState !== 'playing') return;
        
        switch (event.key) {
            case ' ':
            case 'ArrowUp':
                this.bird.velocityY = this.bird.jumpForce;
                break;
                
            case 'ArrowDown':
                this.bird.velocityY = 200;
                break;
                
            case 'Escape':
                this.pauseGame();
                break;
        }
    }
    
    // Handle click
    handleClick(event) {
        if (this.gameState !== 'playing') return;
        
        this.bird.velocityY = this.bird.jumpForce;
    }
    
    // Game loop
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw game objects
        if (this.gameState === 'playing') {
            this.update(deltaTime);
            this.draw();
        }
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    
    // Update game objects
    update(deltaTime) {
        // Update bird
        this.updateBird(deltaTime);
        
        // Update pipes
        this.updatePipes(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update combo
        this.updateCombo(deltaTime);
    }
    
    // Draw game objects
    draw() {
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw power-ups
        this.drawPowerUps();
        
        // Draw enemies
        this.drawEnemies();
        
        // Draw projectiles
        this.drawProjectiles();
        
        // Draw bird
        this.drawBird();
    }
    
    // Update bird
    updateBird(deltaTime) {
        // Apply gravity
        this.bird.velocityY += this.bird.gravity * deltaTime;
        
        // Update position
        this.bird.y += this.bird.velocityY * deltaTime;
        
        // Update rotation
        this.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.bird.velocityY * 0.005));
        
        // Check boundaries
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocityY = 0;
        } else if (this.bird.y + this.bird.height > this.canvas.height) {
            this.bird.y = this.canvas.height - this.bird.height;
            this.bird.velocityY = 0;
            
            // Game over if bird hits the ground
            this.gameOver();
        }
        
        // Update bird trail
        if (this.bird.isPowerUpActive || this.turboBoostActive) {
            this.bird.trail.unshift({
                x: this.bird.x,
                y: this.bird.y,
                rotation: this.bird.rotation
            });
            
            if (this.bird.trail.length > 15) {
             
(Content truncated due to size limit. Use line ranges to read in chunks)

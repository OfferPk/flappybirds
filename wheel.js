// Spin to Earn Game Module
// Core game logic for Spin to Earn wheel game

class SpinToEarnGame {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.gameContainer = null;
        this.isSpinning = false;
        this.selectedCurrency = 'usd';
        this.spinResult = null;
        this.spinButton = null;
        this.wheelElement = null;
        this.resultDisplay = null;
        this.resultAmount = null;
        this.resultMessage = null;
        this.currencyButtons = {};
        
        // Wheel segments configuration
        this.segments = [
            { value: 100, color: '#FF9800', label: '100' },
            { value: 50, color: '#4CAF50', label: '50' },
            { value: 10, color: '#2196F3', label: '10' },
            { value: 500, color: '#F44336', label: '500' },
            { value: 20, color: '#9C27B0', label: '20' },
            { value: 200, color: '#FFEB3B', label: '200' },
            { value: 0, color: '#607D8B', label: '0' },
            { value: 1000, color: '#E91E63', label: '1000' }
        ];
        
        // Currency conversion rates (relative to USD)
        this.conversionRates = {
            usd: 1,
            inr: 75,
            pkr: 280,
            crypto: 0.000025 // BTC equivalent
        };
        
        // Event handlers
        this.handleSpinClick = this.handleSpinClick.bind(this);
        this.handleCurrencySelect = this.handleCurrencySelect.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    // Initialize game
    init(container) {
        this.gameContainer = container;
        
        // Create game UI
        this.createGameUI();
        
        // Initialize UI elements
        this.initUIElements();
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        
        console.log('Spin to Earn game initialized');
    }
    
    // Create game UI
    createGameUI() {
        this.gameContainer.innerHTML = `
            <div class="p-4 flex flex-col items-center justify-center h-full">
                <h1 class="text-4xl font-bold text-white mb-6">Spin to Earn</h1>
                
                <div class="currency-options mb-6">
                    <button id="usd-button" class="currency-button usd active">
                        <i class="fas fa-dollar-sign"></i> USD
                    </button>
                    <button id="inr-button" class="currency-button inr">
                        <i class="fas fa-rupee-sign"></i> INR
                    </button>
                    <button id="pkr-button" class="currency-button pkr">
                        <i class="fas fa-money-bill-wave"></i> PKR
                    </button>
                    <button id="crypto-button" class="currency-button crypto">
                        <i class="fab fa-bitcoin"></i> BTC
                    </button>
                </div>
                
                <div class="spin-wheel-container">
                    <div class="spin-wheel" id="spin-wheel">
                        ${this.segments.map((segment, index) => {
                            const rotation = (index * 45) + 'deg';
                            return `
                                <div class="wheel-segment" style="transform: rotate(${rotation}); background-color: ${segment.color};">
                                    <span class="segment-label">${segment.label}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="wheel-center"></div>
                    <div class="wheel-pointer"></div>
                </div>
                
                <button id="spin-button" class="spin-button">
                    <i class="fas fa-sync-alt mr-2"></i> SPIN
                </button>
                
                <div class="result-display">
                    <div id="result-amount" class="result-amount">0</div>
                    <div id="result-message" class="result-message">Spin the wheel to win!</div>
                </div>
            </div>
        `;
        
        // Add wheel segment styles
        const styleElement = document.createElement('style');
        styleElement.textContent = this.segments.map((segment, index) => {
            const rotation = index * 45;
            return `
                .wheel-segment:nth-child(${index + 1}) {
                    transform: rotate(${rotation}deg);
                    background-color: ${segment.color};
                }
                
                .wheel-segment:nth-child(${index + 1}) .segment-label {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    color: white;
                    font-weight: bold;
                    transform: rotate(${-rotation - 45}deg);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }
            `;
        }).join('');
        
        document.head.appendChild(styleElement);
    }
    
    // Initialize UI elements
    initUIElements() {
        this.spinButton = document.getElementById('spin-button');
        this.wheelElement = document.getElementById('spin-wheel');
        this.resultDisplay = document.querySelector('.result-display');
        this.resultAmount = document.getElementById('result-amount');
        this.resultMessage = document.getElementById('result-message');
        
        // Currency buttons
        this.currencyButtons = {
            usd: document.getElementById('usd-button'),
            inr: document.getElementById('inr-button'),
            pkr: document.getElementById('pkr-button'),
            crypto: document.getElementById('crypto-button')
        };
        
        // Add event listeners
        if (this.spinButton) {
            this.spinButton.addEventListener('click', this.handleSpinClick);
        }
        
        // Add currency button event listeners
        for (const [currency, button] of Object.entries(this.currencyButtons)) {
            if (button) {
                button.addEventListener('click', () => this.handleCurrencySelect(currency));
            }
        }
    }
    
    // Start game
    start() {
        console.log('Spin to Earn game started');
    }
    
    // Stop game
    stop() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        
        if (this.spinButton) {
            this.spinButton.removeEventListener('click', this.handleSpinClick);
        }
        
        // Remove currency button event listeners
        for (const [currency, button] of Object.entries(this.currencyButtons)) {
            if (button) {
                button.removeEventListener('click', () => this.handleCurrencySelect(currency));
            }
        }
        
        console.log('Spin to Earn game stopped');
    }
    
    // Handle spin button click
    handleSpinClick() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        
        // Generate random result
        const randomIndex = Math.floor(Math.random() * this.segments.length);
        const randomDegrees = 1800 + (randomIndex * 45) + Math.floor(Math.random() * 45);
        
        // Animate wheel
        this.wheelElement.style.transform = `rotate(${randomDegrees}deg)`;
        
        // Calculate result
        const resultIndex = Math.floor(((randomDegrees % 360) / 45)) % this.segments.length;
        const resultValue = this.segments[resultIndex].value;
        
        // Convert to selected currency
        const convertedValue = this.convertCurrency(resultValue);
        
        // Save result
        this.spinResult = {
            value: resultValue,
            convertedValue: convertedValue,
            currency: this.selectedCurrency,
            timestamp: Date.now()
        };
        
        // Update user data if logged in
        const userData = this.dataManager.getCurrentUserData();
        if (userData) {
            if (!userData.spinResults) {
                userData.spinResults = [];
            }
            
            userData.spinResults.push(this.spinResult);
            
            // Add to user's coins
            if (!userData.coins) {
                userData.coins = 0;
            }
            
            userData.coins += resultValue;
            
            // Save updated user data
            this.dataManager.saveUserData(userData);
        }
        
        // Show result after animation completes
        setTimeout(() => {
            this.showResult(convertedValue);
            this.isSpinning = false;
            this.spinButton.disabled = false;
        }, 5000);
    }
    
    // Handle currency selection
    handleCurrencySelect(currency) {
        this.selectedCurrency = currency;
        
        // Update active button
        for (const [curr, button] of Object.entries(this.currencyButtons)) {
            if (button) {
                button.classList.toggle('active', curr === currency);
            }
        }
        
        // Update result display if there's a result
        if (this.spinResult) {
            const convertedValue = this.convertCurrency(this.spinResult.value);
            this.showResult(convertedValue, false);
        }
    }
    
    // Handle key down
    handleKeyDown(event) {
        if (event.key === 'Enter' && !this.isSpinning) {
            this.handleSpinClick();
        }
    }
    
    // Convert currency
    convertCurrency(value) {
        return value * this.conversionRates[this.selectedCurrency];
    }
    
    // Format currency
    formatCurrency(value) {
        switch (this.selectedCurrency) {
            case 'usd':
                return `$${value.toFixed(2)}`;
                
            case 'inr':
                return `₹${value.toFixed(2)}`;
                
            case 'pkr':
                return `Rs ${value.toFixed(2)}`;
                
            case 'crypto':
                return `${value.toFixed(8)} BTC`;
                
            default:
                return value.toString();
        }
    }
    
    // Show result
    showResult(value, animate = true) {
        const formattedValue = this.formatCurrency(value);
        
        this.resultAmount.textContent = formattedValue;
        
        if (value > 0) {
            this.resultMessage.textContent = 'Congratulations! You won!';
            
            if (animate) {
                this.createConfetti();
            }
        } else {
            this.resultMessage.textContent = 'Better luck next time!';
        }
    }
    
    // Create confetti effect
    createConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-5%`;
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = `${5 + Math.random() * 10}px`;
            confetti.style.opacity = Math.random();
            confetti.style.animation = `fall ${1 + Math.random() * 3}s linear forwards`;
            
            this.gameContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }
    
    // Get random color
    getRandomColor() {
        const colors = ['#FF9800', '#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#FFEB3B', '#E91E63'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Export class
// Will be instantiated in main.js with dataManager dependency

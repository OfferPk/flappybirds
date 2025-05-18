// Spin Wheel with 24-hour Timer and DWHL Betting System
class SpinWheelAdvanced {
    constructor(container, dataManager, currencySystem, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        
        // Default options
        this.options = {
            segments: 8,
            segmentColors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF', '#FF00FF'],
            spinDuration: 7000, // 7 seconds
            spinRevolutions: 10, // Number of full revolutions
            wheelSize: 400, // Diameter in pixels
            lineWidth: 2,
            textColor: '#FFFFFF',
            textSize: '16px',
            buttonText: 'SPIN',
            buttonColor: '#FF4136',
            buttonTextColor: '#FFFFFF',
            betAmount: 5, // DWHL coins per spin
            maxWin: 100, // Maximum DOGE win
            cooldownHours: 24, // Hours between spins
            ...options
        };
        
        // Wheel properties
        this.angle = 0;
        this.isSpinning = false;
        this.spinStartTime = 0;
        this.spinEndTime = 0;
        this.spinResult = null;
        this.spinResultCallback = null;
        
        // Canvas elements
        this.canvas = null;
        this.ctx = null;
        this.spinButton = null;
        this.timerDisplay = null;
        this.betDisplay = null;
        
        // Segments and rewards
        this.segments = this.generateSegments();
        
        // Initialize wheel
        this.init();
    }
    
    // Generate segments with probability-based rewards
    generateSegments() {
        // Define reward tiers with probabilities
        const rewardTiers = [
            { min: 1, max: 5, probability: 0.40 },     // 40% chance for 1-5 DOGE
            { min: 6, max: 15, probability: 0.30 },    // 30% chance for 6-15 DOGE
            { min: 16, max: 30, probability: 0.15 },   // 15% chance for 16-30 DOGE
            { min: 31, max: 50, probability: 0.10 },   // 10% chance for 31-50 DOGE
            { min: 51, max: 75, probability: 0.04 },   // 4% chance for 51-75 DOGE
            { min: 76, max: 100, probability: 0.01 }   // 1% chance for 76-100 DOGE
        ];
        
        // Generate segments
        const segments = [];
        
        for (let i = 0; i < this.options.segments; i++) {
            // Determine which tier this segment belongs to
            let random = Math.random();
            let cumulativeProbability = 0;
            let selectedTier = rewardTiers[0]; // Default to first tier
            
            for (const tier of rewardTiers) {
                cumulativeProbability += tier.probability;
                if (random <= cumulativeProbability) {
                    selectedTier = tier;
                    break;
                }
            }
            
            // Generate a random value within the tier
            const value = Math.floor(Math.random() * (selectedTier.max - selectedTier.min + 1)) + selectedTier.min;
            
            // Create segment
            segments.push({
                value: value,
                label: `${value} DOGE`,
                color: this.options.segmentColors[i % this.options.segmentColors.length],
                probability: selectedTier.probability / this.options.segments
            });
        }
        
        return segments;
    }
    
    // Initialize wheel
    init() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'spin-wheel-container';
            document.body.appendChild(this.container);
        }
        
        // Set container style
        this.container.style.position = 'relative';
        this.container.style.width = `${this.options.wheelSize}px`;
        this.container.style.height = `${this.options.wheelSize + 100}px`; // Extra space for timer and bet display
        this.container.style.margin = '0 auto';
        
        // Create bet display
        this.createBetDisplay();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.wheelSize;
        this.canvas.height = this.options.wheelSize;
        this.container.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Create spin button
        this.createSpinButton();
        
        // Create timer display
        this.createTimerDisplay();
        
        // Draw initial wheel
        this.drawWheel();
        
        // Add event listeners
        this.addEventListeners();
        
        // Check cooldown
        this.checkCooldown();
    }
    
    // Create bet display
    createBetDisplay() {
        this.betDisplay = document.createElement('div');
        this.betDisplay.className = 'bet-display';
        this.betDisplay.innerHTML = `<span>Bet: <strong>${this.options.betAmount} DWHL</strong></span>`;
        this.betDisplay.style.textAlign = 'center';
        this.betDisplay.style.marginBottom = '10px';
        this.betDisplay.style.fontSize = '16px';
        this.betDisplay.style.color = '#FFFFFF';
        this.container.appendChild(this.betDisplay);
    }
    
    // Create spin button
    createSpinButton() {
        // Create button
        this.spinButton = document.createElement('button');
        this.spinButton.textContent = this.options.buttonText;
        this.spinButton.style.position = 'absolute';
        this.spinButton.style.top = '50%';
        this.spinButton.style.left = '50%';
        this.spinButton.style.transform = 'translate(-50%, -50%)';
        this.spinButton.style.padding = '15px 30px';
        this.spinButton.style.fontSize = '20px';
        this.spinButton.style.fontWeight = 'bold';
        this.spinButton.style.backgroundColor = this.options.buttonColor;
        this.spinButton.style.color = this.options.buttonTextColor;
        this.spinButton.style.border = 'none';
        this.spinButton.style.borderRadius = '50px';
        this.spinButton.style.cursor = 'pointer';
        this.spinButton.style.zIndex = '10';
        this.spinButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        this.spinButton.style.transition = 'all 0.3s ease';
        
        // Add hover effect
        this.spinButton.addEventListener('mouseover', () => {
            this.spinButton.style.backgroundColor = this.lightenDarkenColor(this.options.buttonColor, 20);
            this.spinButton.style.transform = 'translate(-50%, -50%) scale(1.05)';
        });
        
        this.spinButton.addEventListener('mouseout', () => {
            this.spinButton.style.backgroundColor = this.options.buttonColor;
            this.spinButton.style.transform = 'translate(-50%, -50%)';
        });
        
        // Add to container
        this.container.appendChild(this.spinButton);
    }
    
    // Create timer display
    createTimerDisplay() {
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'timer-display';
        this.timerDisplay.style.textAlign = 'center';
        this.timerDisplay.style.marginTop = '15px';
        this.timerDisplay.style.fontSize = '14px';
        this.timerDisplay.style.color = '#FFFFFF';
        this.container.appendChild(this.timerDisplay);
    }
    
    // Add event listeners
    addEventListeners() {
        // Spin button click
        this.spinButton.addEventListener('click', () => {
            this.spin();
        });
        
        // Keyboard enter
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !this.isSpinning && this.canSpin()) {
                this.spin();
            }
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (event) => {
            if (!this.isSpinning && this.canSpin()) {
                this.spin();
            }
        });
    }
    
    // Draw wheel
    drawWheel() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width / 2 - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw segments
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        for (let i = 0; i < this.segments.length; i++) {
            const startAngle = this.angle + i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            // Fill segment
            ctx.fillStyle = this.segments[i].color;
            ctx.fill();
            
            // Draw segment border
            ctx.lineWidth = this.options.lineWidth;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
            
            // Draw segment label
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this.options.textColor;
            ctx.font = `bold ${this.options.textSize} Arial`;
            
            const label = this.segments[i].label;
            ctx.fillText(label, radius - 20, 0);
            
            ctx.restore();
        }
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        
        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius - 10);
        ctx.lineTo(centerX - 10, centerY - radius + 10);
        ctx.lineTo(centerX + 10, centerY - radius + 10);
        ctx.closePath();
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    
    // Check if user can spin
    canSpin() {
        // Check if user has enough DWHL coins
        if (this.currencySystem.getBalance('DWHL') < this.options.betAmount) {
            this.showError('Not enough DWHL coins to spin!');
            return false;
        }
        
        // Check cooldown
        const lastSpinTime = this.getLastSpinTime();
        if (lastSpinTime) {
            const now = Date.now();
            const cooldownTime = this.options.cooldownHours * 60 * 60 * 1000; // Convert hours to milliseconds
            const timeElapsed = now - lastSpinTime;
            
            if (timeElapsed < cooldownTime) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get last spin time
    getLastSpinTime() {
        const currentUser = this.dataManager.getCurrentUser();
        
        if (currentUser) {
            const spinHistory = this.dataManager.getData(`spinHistory_${currentUser.id}`) || [];
            
            if (spinHistory.length > 0) {
                // Get the most recent spin
                const lastSpin = spinHistory.sort((a, b) => b.timestamp - a.timestamp)[0];
                return lastSpin.timestamp;
            }
        }
        
        return null;
    }
    
    // Check cooldown and update timer
    checkCooldown() {
        const lastSpinTime = this.getLastSpinTime();
        
        if (lastSpinTime) {
            const now = Date.now();
            const cooldownTime = this.options.cooldownHours * 60 * 60 * 1000; // Convert hours to milliseconds
            const timeElapsed = now - lastSpinTime;
            
            if (timeElapsed < cooldownTime) {
                // Calculate remaining time
                const timeRemaining = cooldownTime - timeElapsed;
                
                // Disable spin button
                this.spinButton.disabled = true;
                this.spinButton.style.opacity = '0.5';
                this.spinButton.style.cursor = 'not-allowed';
                
                // Update timer display
                this.updateTimerDisplay(timeRemaining);
                
                // Set timer to update display
                setTimeout(() => this.checkCooldown(), 1000);
            } else {
                // Enable spin button
                this.spinButton.disabled = false;
                this.spinButton.style.opacity = '1';
                this.spinButton.style.cursor = 'pointer';
                
                // Update timer display
                this.timerDisplay.textContent = 'Ready to spin!';
            }
        } else {
            // No previous spin, ready to spin
            this.timerDisplay.textContent = 'Ready to spin!';
        }
    }
    
    // Update timer display
    updateTimerDisplay(timeRemaining) {
        // Calculate hours, minutes, seconds
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        
        // Format time
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update display
        this.timerDisplay.textContent = `Next spin available in: ${formattedTime}`;
    }
    
    // Spin wheel
    spin() {
        // Check if already spinning
        if (this.isSpinning) return;
        
        // Check if user can spin
        if (!this.canSpin()) return;
        
        // Charge bet amount
        this.currencySystem.removeCurrency(this.options.betAmount, 'DWHL', 'spin_bet');
        
        // Set spinning state
        this.isSpinning = true;
        this.spinStartTime = Date.now();
        this.spinEndTime = this.spinStartTime + this.options.spinDuration;
        
        // Disable spin button
        this.spinButton.disabled = true;
        this.spinButton.style.opacity = '0.5';
        this.spinButton.style.cursor = 'not-allowed';
        
        // Determine result based on probabilities
        this.spinResult = this.getRandomSegment();
        
        // Calculate target angle
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        const segmentIndex = this.segments.indexOf(this.spinResult);
        
        // Target angle: pointer at the middle of the segment + full revolutions
        const targetAngle = this.angle + 
                           (2 * Math.PI * this.options.spinRevolutions) + 
                           (segmentIndex * segmentAngle) + 
                           (segmentAngle / 2);
        
        // Start animation
        this.animateSpin(targetAngle);
    }
    
    // Animate spin
    animateSpin(targetAngle) {
        const now = Date.now();
        const elapsed = now - this.spinStartTime;
        const duration = this.options.spinDuration;
        
        // Calculate progress (0 to 1)
        let progress = Math.min(elapsed / duration, 1);
        
        // Apply easing function for more realistic spin (ease-out)
        progress = this.easeOutCubic(progress);
        
        // Calculate current angle
        const currentAngle = this.angle + (targetAngle - this.angle) * progress;
        
        // Update angle
        this.angle = currentAngle % (2 * Math.PI);
        
        // Draw wheel
        this.drawWheel();
        
        // Continue animation if not complete
        if (progr
(Content truncated due to size limit. Use line ranges to read in chunks)

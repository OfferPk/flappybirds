// Real-time Profile Updates with Multi-Currency Support
class ProfileUpdaterAdvanced {
    constructor(dataManager, currencySystem) {
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        
        // UI elements
        this.profileElements = {
            coinBalance: [],
            dwhlBalance: [],
            dogeBalance: [],
            totalWinnings: [],
            rank: [],
            nextSpin: []
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.registerProfileElement = this.registerProfileElement.bind(this);
        this.updateAllDisplays = this.updateAllDisplays.bind(this);
        this.handleCurrencyUpdate = this.handleCurrencyUpdate.bind(this);
        this.handleSpinResult = this.handleSpinResult.bind(this);
        this.updateNextSpinTimer = this.updateNextSpinTimer.bind(this);
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    // Initialize profile updater
    init() {
        // Find and register all profile elements on the page
        this.findProfileElements();
        
        // Initial update of all displays
        this.updateAllDisplays();
        
        // Start timer update
        this.startTimerUpdates();
        
        console.log('Advanced profile updater initialized');
    }
    
    // Find profile elements
    findProfileElements() {
        // Find coin balance elements
        document.querySelectorAll('[data-profile="coin-balance"]').forEach(element => {
            this.registerProfileElement('coinBalance', element);
        });
        
        // Find DWHL balance elements
        document.querySelectorAll('[data-profile="dwhl-balance"]').forEach(element => {
            this.registerProfileElement('dwhlBalance', element);
        });
        
        // Find DOGE balance elements
        document.querySelectorAll('[data-profile="doge-balance"]').forEach(element => {
            this.registerProfileElement('dogeBalance', element);
        });
        
        // Find total winnings elements
        document.querySelectorAll('[data-profile="total-winnings"]').forEach(element => {
            this.registerProfileElement('totalWinnings', element);
        });
        
        // Find rank elements
        document.querySelectorAll('[data-profile="rank"]').forEach(element => {
            this.registerProfileElement('rank', element);
        });
        
        // Find next spin elements
        document.querySelectorAll('[data-profile="next-spin"]').forEach(element => {
            this.registerProfileElement('nextSpin', element);
        });
    }
    
    // Register profile element
    registerProfileElement(type, element) {
        if (this.profileElements[type]) {
            this.profileElements[type].push(element);
        }
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Listen for currency updates
        document.addEventListener('currency:updated', this.handleCurrencyUpdate);
        
        // Listen for spin results
        document.addEventListener('spin:result', this.handleSpinResult);
        
        // Listen for user login/logout
        document.addEventListener('user:login', () => this.updateAllDisplays());
        document.addEventListener('user:logout', () => this.updateAllDisplays());
    }
    
    // Start timer updates
    startTimerUpdates() {
        // Update timer immediately
        this.updateNextSpinTimer();
        
        // Update timer every second
        setInterval(() => {
            this.updateNextSpinTimer();
        }, 1000);
    }
    
    // Handle currency update
    handleCurrencyUpdate(event) {
        const { amount, currency, source, balance } = event.detail;
        
        // Update currency balance displays
        switch (currency) {
            case 'COINS':
                this.updateCoinBalanceDisplays(balance);
                break;
            case 'DWHL':
                this.updateDwhlBalanceDisplays(balance);
                break;
            case 'DOGE':
                this.updateDogeBalanceDisplays(balance);
                break;
        }
        
        // Log transaction
        console.log(`Currency update: ${amount} ${currency} from ${source}, new balance: ${balance}`);
        
        // Create notification if significant amount
        if (Math.abs(amount) >= 10) {
            this.showNotification(amount > 0 ? 'earned' : 'spent', amount, currency);
        }
    }
    
    // Handle spin result
    handleSpinResult(event) {
        const { result } = event.detail;
        
        // Update all displays
        this.updateAllDisplays();
        
        // Log spin result
        console.log(`Spin result: ${result.label} (${result.value} DOGE)`);
    }
    
    // Update all displays
    updateAllDisplays() {
        // Update currency balances
        this.updateCoinBalanceDisplays(this.currencySystem.getBalance('COINS'));
        this.updateDwhlBalanceDisplays(this.currencySystem.getBalance('DWHL'));
        this.updateDogeBalanceDisplays(this.currencySystem.getBalance('DOGE'));
        
        // Update next spin timer
        this.updateNextSpinTimer();
        
        // Get current user
        const currentUser = this.dataManager.getCurrentUser();
        
        if (currentUser) {
            // Get user's spin history
            const spinHistory = this.dataManager.getData(`spinHistory_${currentUser.id}`) || [];
            
            // Calculate total winnings
            const totalWinnings = spinHistory.reduce((total, entry) => {
                return total + (entry.result ? entry.result.value : 0);
            }, 0);
            
            // Update total winnings displays
            this.updateTotalWinningsDisplays(totalWinnings);
            
            // Get user's rank
            const leaderboardData = this.dataManager.getData('spinLeaderboard') || [];
            const userEntries = leaderboardData.filter(entry => entry.playerId === currentUser.id);
            
            if (userEntries.length > 0) {
                // Sort leaderboard by winnings
                const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.winnings - a.winnings);
                
                // Find user's highest entry
                const highestUserEntry = userEntries.sort((a, b) => b.winnings - a.winnings)[0];
                
                // Find rank
                const rank = sortedLeaderboard.findIndex(entry => 
                    entry.playerId === currentUser.id && entry.winnings === highestUserEntry.winnings
                ) + 1;
                
                // Update rank displays
                this.updateRankDisplays(rank);
            } else {
                // No entries yet
                this.updateRankDisplays('-');
            }
        } else {
            // Guest user
            this.updateTotalWinningsDisplays(0);
            this.updateRankDisplays('-');
        }
    }
    
    // Update coin balance displays
    updateCoinBalanceDisplays(balance) {
        this.profileElements.coinBalance.forEach(element => {
            element.textContent = balance.toLocaleString();
        });
        
        // Also update any elements with class 'coin-balance'
        document.querySelectorAll('.coin-balance').forEach(element => {
            element.textContent = balance.toLocaleString();
        });
    }
    
    // Update DWHL balance displays
    updateDwhlBalanceDisplays(balance) {
        this.profileElements.dwhlBalance.forEach(element => {
            element.textContent = balance.toLocaleString();
        });
        
        // Also update any elements with class 'dwhl-balance'
        document.querySelectorAll('.dwhl-balance').forEach(element => {
            element.textContent = balance.toLocaleString();
        });
        
        // Update withdrawal eligibility
        const canWithdraw = this.currencySystem.canWithdraw('DWHL');
        
        document.querySelectorAll('.withdraw-dwhl-button').forEach(button => {
            button.disabled = !canWithdraw;
            button.title = canWithdraw ? 'Withdraw DWHL' : 'Need at least 1000 DWHL to withdraw';
            
            if (canWithdraw) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }
    
    // Update DOGE balance displays
    updateDogeBalanceDisplays(balance) {
        this.profileElements.dogeBalance.forEach(element => {
            element.textContent = balance.toLocaleString();
        });
        
        // Also update any elements with class 'doge-balance'
        document.querySelectorAll('.doge-balance').forEach(element => {
            element.textContent = balance.toLocaleString();
        });
        
        // Update withdrawal eligibility
        const canWithdraw = this.currencySystem.canWithdraw('DOGE');
        
        document.querySelectorAll('.withdraw-doge-button').forEach(button => {
            button.disabled = !canWithdraw;
            button.title = canWithdraw ? 'Withdraw DOGE' : 'Need at least 100 DOGE to withdraw';
            
            if (canWithdraw) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }
    
    // Update total winnings displays
    updateTotalWinningsDisplays(totalWinnings) {
        this.profileElements.totalWinnings.forEach(element => {
            element.textContent = totalWinnings.toLocaleString();
        });
    }
    
    // Update rank displays
    updateRankDisplays(rank) {
        this.profileElements.rank.forEach(element => {
            element.textContent = rank;
        });
    }
    
    // Update next spin timer
    updateNextSpinTimer() {
        const currentUser = this.dataManager.getCurrentUser();
        
        if (!currentUser) {
            // Guest user - no cooldown
            this.profileElements.nextSpin.forEach(element => {
                element.textContent = 'Ready to spin!';
            });
            return;
        }
        
        // Get spin history
        const spinHistory = this.dataManager.getData(`spinHistory_${currentUser.id}`) || [];
        
        if (spinHistory.length === 0) {
            // No previous spins
            this.profileElements.nextSpin.forEach(element => {
                element.textContent = 'Ready to spin!';
            });
            return;
        }
        
        // Get last spin time
        const lastSpin = spinHistory.sort((a, b) => b.timestamp - a.timestamp)[0];
        const lastSpinTime = lastSpin.timestamp;
        
        // Calculate cooldown
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const timeElapsed = now - lastSpinTime;
        
        if (timeElapsed >= cooldownTime) {
            // Cooldown complete
            this.profileElements.nextSpin.forEach(element => {
                element.textContent = 'Ready to spin!';
            });
        } else {
            // Still in cooldown
            const timeRemaining = cooldownTime - timeElapsed;
            
            // Calculate hours, minutes, seconds
            const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
            
            // Format time
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            this.profileElements.nextSpin.forEach(element => {
                element.textContent = `Next spin in: ${formattedTime}`;
            });
        }
    }
    
    // Show notification
    showNotification(type, amount, currency) {
        // Create notification if it doesn't exist
        let notification = document.getElementById('profile-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'profile-notification';
            notification.className = 'profile-notification';
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .profile-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: opacity 0.3s, transform 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .profile-notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .notification-icon {
                    font-size: 24px;
                }
                
                .notification-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .notification-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .notification-amount {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .notification-amount.positive {
                    color: #4CAF50;
                }
                
                .notification-amount.negative {
                    color: #FF5252;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(notification);
        }
        
        // Set notification content
        let icon, title, amountClass;
        
        if (type === 'earned') {
            icon = '🎉';
            title = `${currency} Earned!`;
            amountClass = 'positive';
        } else if (type === 'spent') {
            icon = '💰';
            title = `${currency} Spent`;
            amountClass = 'negative';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-amount ${amountClass}">
                    ${type === 'earned' ? '+' : '-'}${Math.abs(amount)} ${currency}
                </div>
            </div>
        `;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Export class
// Will be instantiated in the main game module

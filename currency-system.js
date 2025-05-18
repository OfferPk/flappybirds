// In-game currency system for hybrid game
class CurrencySystem {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentBalance = 0;
        this.currencyName = 'coins';
        this.currencyIcon = '🪙';
        this.transactionHistory = [];
        this.listeners = [];
        
        // Initialize currency display
        this.initCurrencyDisplay();
        
        // Load initial balance
        this.loadBalance();
    }
    
    // Initialize currency display in UI
    initCurrencyDisplay() {
        // Create currency display if it doesn't exist
        if (!document.getElementById('currency-display')) {
            const header = document.querySelector('.header');
            if (header) {
                const currencyDisplay = document.createElement('div');
                currencyDisplay.id = 'currency-display';
                currencyDisplay.className = 'currency-display';
                currencyDisplay.innerHTML = `
                    <span id="currency-icon" class="currency-icon">${this.currencyIcon}</span>
                    <span id="currency-amount" class="currency-amount">0</span>
                `;
                
                // Add to header
                const userInfo = header.querySelector('.user-info');
                if (userInfo) {
                    userInfo.insertBefore(currencyDisplay, userInfo.firstChild);
                } else {
                    header.appendChild(currencyDisplay);
                }
                
                // Add styles
                const style = document.createElement('style');
                style.textContent = `
                    .currency-display {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        background: rgba(255, 215, 0, 0.2);
                        padding: 5px 10px;
                        border-radius: 15px;
                        color: var(--accent-color);
                        font-weight: bold;
                        margin-right: 10px;
                    }
                    
                    .currency-icon {
                        font-size: 18px;
                    }
                    
                    .currency-amount {
                        font-size: 16px;
                    }
                    
                    @keyframes currency-pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                    
                    .currency-pulse {
                        animation: currency-pulse 0.5s ease;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // Load balance from storage
    loadBalance() {
        const userData = this.dataManager.getCurrentUserData();
        if (userData && userData.coins !== undefined) {
            this.currentBalance = userData.coins;
        } else {
            // Default starting balance
            this.currentBalance = 500;
            this.saveBalance();
        }
        
        this.updateDisplay();
    }
    
    // Save balance to storage
    saveBalance() {
        const userData = this.dataManager.getCurrentUserData();
        if (userData) {
            userData.coins = this.currentBalance;
            this.dataManager.saveUserData(userData);
        } else {
            // Save for guest user
            this.dataManager.saveToLocal('guest_coins', this.currentBalance);
        }
        
        // Notify listeners
        this.notifyListeners();
    }
    
    // Update currency display
    updateDisplay() {
        const currencyAmount = document.getElementById('currency-amount');
        if (currencyAmount) {
            currencyAmount.textContent = this.currentBalance.toLocaleString();
        }
    }
    
    // Add currency
    addCurrency(amount, source = 'game') {
        if (amount <= 0) return false;
        
        const oldBalance = this.currentBalance;
        this.currentBalance += amount;
        
        // Record transaction
        this.recordTransaction({
            type: 'credit',
            amount: amount,
            source: source,
            timestamp: Date.now(),
            oldBalance: oldBalance,
            newBalance: this.currentBalance
        });
        
        // Save and update display
        this.saveBalance();
        this.updateDisplay();
        this.animateCurrencyChange(true);
        
        return true;
    }
    
    // Remove currency
    removeCurrency(amount, reason = 'purchase') {
        if (amount <= 0) return false;
        if (this.currentBalance < amount) return false;
        
        const oldBalance = this.currentBalance;
        this.currentBalance -= amount;
        
        // Record transaction
        this.recordTransaction({
            type: 'debit',
            amount: amount,
            reason: reason,
            timestamp: Date.now(),
            oldBalance: oldBalance,
            newBalance: this.currentBalance
        });
        
        // Save and update display
        this.saveBalance();
        this.updateDisplay();
        this.animateCurrencyChange(false);
        
        return true;
    }
    
    // Check if user has enough currency
    hasEnoughCurrency(amount) {
        return this.currentBalance >= amount;
    }
    
    // Record transaction
    recordTransaction(transaction) {
        this.transactionHistory.push(transaction);
        
        // Keep history limited to last 100 transactions
        if (this.transactionHistory.length > 100) {
            this.transactionHistory.shift();
        }
        
        // Save transaction history
        this.dataManager.saveToLocal('transaction_history', this.transactionHistory);
    }
    
    // Get transaction history
    getTransactionHistory() {
        return this.transactionHistory;
    }
    
    // Animate currency change
    animateCurrencyChange(isIncrease) {
        const currencyDisplay = document.getElementById('currency-display');
        const currencyAmount = document.getElementById('currency-amount');
        
        if (currencyDisplay && currencyAmount) {
            // Remove existing animation
            currencyDisplay.classList.remove('currency-pulse');
            
            // Set color based on increase/decrease
            if (isIncrease) {
                currencyAmount.style.color = '#4CAF50';
            } else {
                currencyAmount.style.color = '#FF5252';
            }
            
            // Trigger animation
            void currencyDisplay.offsetWidth; // Force reflow
            currencyDisplay.classList.add('currency-pulse');
            
            // Reset color after animation
            setTimeout(() => {
                currencyAmount.style.color = '';
            }, 500);
        }
    }
    
    // Add listener for currency changes
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }
    
    // Remove listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    // Notify all listeners
    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.currentBalance);
        }
    }
    
    // Get current balance
    getBalance() {
        return this.currentBalance;
    }
    
    // Format currency amount with icon
    formatCurrency(amount) {
        return `${this.currencyIcon} ${amount.toLocaleString()}`;
    }
}

// Export class
// Will be instantiated in main.js with dataManager dependency

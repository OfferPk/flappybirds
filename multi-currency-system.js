// Multi-currency System for Game
class MultiCurrencySystem {
    constructor(dataManager) {
        this.dataManager = dataManager;
        
        // Currency types
        this.currencies = {
            'COINS': { symbol: '🪙', name: 'Coins', exchangeRate: 1 },
            'DWHL': { symbol: '💎', name: 'DWHL', exchangeRate: 10 },
            'DOGE': { symbol: '🐕', name: 'DOGE', exchangeRate: 50 }
        };
        
        // Bind methods
        this.getBalance = this.getBalance.bind(this);
        this.addCurrency = this.addCurrency.bind(this);
        this.removeCurrency = this.removeCurrency.bind(this);
        this.convertCurrency = this.convertCurrency.bind(this);
    }
    
    // Get user balance for specific currency
    getBalance(currencyType = 'COINS') {
        const currentUser = this.dataManager.getCurrentUser();
        
        if (!currentUser) {
            // Guest user - use session storage
            const balance = sessionStorage.getItem(`balance_${currencyType}`) || '0';
            return parseInt(balance, 10);
        }
        
        // Get user balances
        const balances = this.dataManager.getData(`balances_${currentUser.id}`) || {};
        
        // Return balance for currency type, default to 0
        return balances[currencyType] || 0;
    }
    
    // Add currency to user balance
    addCurrency(amount, currencyType = 'COINS', source = 'unknown') {
        if (amount <= 0) return false;
        
        const currentUser = this.dataManager.getCurrentUser();
        
        if (!currentUser) {
            // Guest user - use session storage
            const currentBalance = parseInt(sessionStorage.getItem(`balance_${currencyType}`) || '0', 10);
            const newBalance = currentBalance + amount;
            sessionStorage.setItem(`balance_${currencyType}`, newBalance.toString());
            
            // Dispatch currency update event
            this.dispatchCurrencyEvent('updated', amount, currencyType, source, newBalance);
            
            return true;
        }
        
        // Get user balances
        const balances = this.dataManager.getData(`balances_${currentUser.id}`) || {};
        
        // Update balance
        balances[currencyType] = (balances[currencyType] || 0) + amount;
        
        // Save balances
        this.dataManager.saveData(`balances_${currentUser.id}`, balances);
        
        // Dispatch currency update event
        this.dispatchCurrencyEvent('updated', amount, currencyType, source, balances[currencyType]);
        
        return true;
    }
    
    // Remove currency from user balance
    removeCurrency(amount, currencyType = 'COINS', source = 'unknown') {
        if (amount <= 0) return false;
        
        const currentUser = this.dataManager.getCurrentUser();
        let currentBalance = 0;
        
        if (!currentUser) {
            // Guest user - use session storage
            currentBalance = parseInt(sessionStorage.getItem(`balance_${currencyType}`) || '0', 10);
            
            // Check if user has enough currency
            if (currentBalance < amount) {
                return false;
            }
            
            // Update balance
            const newBalance = currentBalance - amount;
            sessionStorage.setItem(`balance_${currencyType}`, newBalance.toString());
            
            // Dispatch currency update event
            this.dispatchCurrencyEvent('updated', -amount, currencyType, source, newBalance);
            
            return true;
        }
        
        // Get user balances
        const balances = this.dataManager.getData(`balances_${currentUser.id}`) || {};
        currentBalance = balances[currencyType] || 0;
        
        // Check if user has enough currency
        if (currentBalance < amount) {
            return false;
        }
        
        // Update balance
        balances[currencyType] = currentBalance - amount;
        
        // Save balances
        this.dataManager.saveData(`balances_${currentUser.id}`, balances);
        
        // Dispatch currency update event
        this.dispatchCurrencyEvent('updated', -amount, currencyType, source, balances[currencyType]);
        
        return true;
    }
    
    // Convert between currency types
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (amount <= 0) return false;
        if (fromCurrency === toCurrency) return true;
        
        // Check if currencies exist
        if (!this.currencies[fromCurrency] || !this.currencies[toCurrency]) {
            return false;
        }
        
        // Calculate conversion
        const fromRate = this.currencies[fromCurrency].exchangeRate;
        const toRate = this.currencies[toCurrency].exchangeRate;
        
        // Calculate equivalent amount in target currency
        const equivalentAmount = Math.floor((amount * fromRate) / toRate);
        
        // Check if user has enough currency
        if (!this.removeCurrency(amount, fromCurrency, 'conversion')) {
            return false;
        }
        
        // Add converted amount
        this.addCurrency(equivalentAmount, toCurrency, 'conversion');
        
        // Dispatch conversion event
        this.dispatchCurrencyEvent('converted', amount, fromCurrency, 'conversion', this.getBalance(fromCurrency), equivalentAmount, toCurrency);
        
        return true;
    }
    
    // Dispatch currency event
    dispatchCurrencyEvent(eventType, amount, currencyType, source, balance, targetAmount = null, targetCurrency = null) {
        const event = new CustomEvent(`currency:${eventType}`, {
            detail: {
                amount: amount,
                currency: currencyType,
                source: source,
                balance: balance,
                targetAmount: targetAmount,
                targetCurrency: targetCurrency
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Check if user can withdraw
    canWithdraw(currencyType = 'DWHL') {
        const balance = this.getBalance(currencyType);
        
        // DWHL withdrawal threshold is 1000
        if (currencyType === 'DWHL') {
            return balance >= 1000;
        }
        
        // DOGE withdrawal threshold is 100
        if (currencyType === 'DOGE') {
            return balance >= 100;
        }
        
        return false;
    }
    
    // Get formatted balance with symbol
    getFormattedBalance(currencyType = 'COINS') {
        const balance = this.getBalance(currencyType);
        const currency = this.currencies[currencyType] || { symbol: '', name: currencyType };
        
        return `${currency.symbol} ${balance.toLocaleString()}`;
    }
    
    // Get all balances
    getAllBalances() {
        const result = {};
        
        for (const currencyType in this.currencies) {
            result[currencyType] = this.getBalance(currencyType);
        }
        
        return result;
    }
}

// Export class
// Will be instantiated in the main game module

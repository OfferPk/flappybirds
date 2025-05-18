// Enhanced Multi-currency System for Doge Whale Game
class MultiCurrencySystem {
    constructor(dataManager) {
        this.dataManager = dataManager;
        
        // Currency types with DWHL as default
        this.currencies = {
            'DWHL': { symbol: '💎', name: 'DWHL', exchangeRate: 10, visible: true, default: true },
            'BTC': { symbol: '₿', name: 'BTC', exchangeRate: 100000, visible: true, default: false },
            'USD': { symbol: '$', name: 'USD/USDT', exchangeRate: 5000, visible: true, default: false },
            'PKR': { symbol: '₨', name: 'PKR/INR', exchangeRate: 50, visible: true, default: false }
        };
        
        // Admin settings
        this.adminSettings = {
            password: '143143143',
            currencyVisibility: {
                'DWHL': true, // DWHL is always visible
                'BTC': true,
                'USD': true,
                'PKR': true
            }
        };
        
        // Load admin settings
        this.loadAdminSettings();
        
        // Bind methods
        this.getBalance = this.getBalance.bind(this);
        this.addCurrency = this.addCurrency.bind(this);
        this.removeCurrency = this.removeCurrency.bind(this);
        this.convertCurrency = this.convertCurrency.bind(this);
        this.setCurrencyVisibility = this.setCurrencyVisibility.bind(this);
        this.getVisibleCurrencies = this.getVisibleCurrencies.bind(this);
    }
    
    // Load admin settings from storage
    loadAdminSettings() {
        const savedSettings = this.dataManager.getData('admin_currency_settings');
        if (savedSettings) {
            // Always ensure DWHL is visible regardless of saved settings
            savedSettings.currencyVisibility.DWHL = true;
            this.adminSettings = savedSettings;
            
            // Update currency visibility based on admin settings
            for (const currencyType in this.currencies) {
                if (currencyType !== 'DWHL') { // Skip DWHL as it's always visible
                    this.currencies[currencyType].visible = this.adminSettings.currencyVisibility[currencyType];
                }
            }
        }
    }
    
    // Save admin settings to storage
    saveAdminSettings() {
        this.dataManager.saveData('admin_currency_settings', this.adminSettings);
    }
    
    // Set currency visibility (admin function)
    setCurrencyVisibility(currencyType, isVisible, password) {
        // Verify admin password
        if (password !== this.adminSettings.password) {
            console.error('Invalid admin password');
            return false;
        }
        
        // Cannot hide DWHL
        if (currencyType === 'DWHL' && !isVisible) {
            console.error('Cannot hide DWHL currency');
            return false;
        }
        
        // Check if currency exists
        if (!this.currencies[currencyType]) {
            console.error(`Currency ${currencyType} does not exist`);
            return false;
        }
        
        // Update visibility
        this.currencies[currencyType].visible = isVisible;
        this.adminSettings.currencyVisibility[currencyType] = isVisible;
        
        // Save settings
        this.saveAdminSettings();
        
        // Dispatch event
        this.dispatchCurrencyEvent('visibility', 0, currencyType, 'admin', 0, isVisible);
        
        return true;
    }
    
    // Get visible currencies
    getVisibleCurrencies() {
        const visibleCurrencies = {};
        
        for (const currencyType in this.currencies) {
            if (this.currencies[currencyType].visible) {
                visibleCurrencies[currencyType] = this.currencies[currencyType];
            }
        }
        
        return visibleCurrencies;
    }
    
    // Get user balance for specific currency
    getBalance(currencyType = 'DWHL') {
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
    addCurrency(amount, currencyType = 'DWHL', source = 'unknown') {
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
    removeCurrency(amount, currencyType = 'DWHL', source = 'unknown') {
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
        
        // BTC withdrawal threshold
        if (currencyType === 'BTC') {
            return balance >= 0.001;
        }
        
        // USD/USDT withdrawal threshold
        if (currencyType === 'USD') {
            return balance >= 10;
        }
        
        // PKR/INR withdrawal threshold
        if (currencyType === 'PKR') {
            return balance >= 1000;
        }
        
        return false;
    }
    
    // Get formatted balance with symbol
    getFormattedBalance(currencyType = 'DWHL') {
        const balance = this.getBalance(currencyType);
        const currency = this.currencies[currencyType] || { symbol: '', name: currencyType };
        
        return `${currency.symbol} ${balance.toLocaleString()}`;
    }
    
    // Get all balances
    getAllBalances() {
        const result = {};
        
        for (const currencyType in this.currencies) {
            if (this.currencies[currencyType].visible) {
                result[currencyType] = this.getBalance(currencyType);
            }
        }
        
        return result;
    }
    
    // Process withdrawal request
    requestWithdrawal(currencyType, address) {
        if (!this.canWithdraw(currencyType)) {
            return {
                success: false,
                message: `Insufficient balance for withdrawal. Minimum required: ${this.getWithdrawalThreshold(currencyType)} ${currencyType}`
            };
        }
        
        const currentUser = this.dataManager.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'You must be logged in to request a withdrawal'
            };
        }
        
        // Create withdrawal request
        const withdrawalRequest = {
            userId: currentUser.id,
            username: currentUser.username,
            currencyType: currencyType,
            amount: this.getBalance(currencyType),
            address: address,
            status: 'pending',
            timestamp: Date.now()
        };
        
        // Get existing withdrawal requests
        const withdrawalRequests = this.dataManager.getData('withdrawal_requests') || [];
        
        // Add new request
        withdrawalRequests.push(withdrawalRequest);
        
        // Save requests
        this.dataManager.saveData('withdrawal_requests', withdrawalRequests);
        
        return {
            success: true,
            message: 'Withdrawal request submitted successfully. An admin will process your request.'
        };
    }
    
    // Get withdrawal threshold for currency
    getWithdrawalThreshold(currencyType) {
        switch (currencyType) {
            case 'DWHL': return 1000;
            case 'BTC': return 0.001;
            case 'USD': return 10;
            case 'PKR': return 1000;
            default: return 0;
        }
    }
    
    // Get pending withdrawal requests (admin function)
    getPendingWithdrawals(password) {
        // Verify admin password
        if (password !== this.adminSettings.password) {
            console.error('Invalid admin password');
            return [];
        }
        
        // Get withdrawal requests
        const withdrawalRequests = this.dataManager.getData('withdrawal_requests') || [];
        
        // Filter pending requests
        return withdrawalRequests.filter(request => request.status === 'pending');
    }
    
    // Process withdrawal (admin function)
    processWithdrawal(requestId, approved, password) {
        // Verify admin password
        if (password !== this.adminSettings.password) {
            console.error('Invalid admin password');
            return false;
        }
        
        // Get withdrawal requests
        const withdrawalRequests = this.dataManager.getData('withdrawal_requests') || [];
        
        // Find request
        const requestIndex = withdrawalRequests.findIndex(request => request.id === requestId);
        if (requestIndex === -1) {
            console.error(`Withdrawal request ${requestId} not found`);
            return false;
        }
        
        // Update request status
        withdrawalRequests[requestIndex].status = approved ? 'approved' : 'rejected';
        withdrawalRequests[requestIndex].processedAt = Date.now();
        
        // If approved, deduct balance
        if (approved) {
            const request = withdrawalRequests[requestIndex];
            
            // Get user balances
            const balances = this.dataManager.getData(`balances_${request.userId}`) || {};
            
            // Update balance
            balances[request.currencyType] = 0; // Zero out the balance after withdrawal
            
            // Save balances
            this.dataManager.saveData(`balances_${request.userId}`, balances);
        }
        
        // Save requests
        this.dataManager.saveData('withdrawal_requests', withdrawalRequests);
        
        return true;
    }
    
    // Change admin password
    changeAdminPassword(currentPassword, newPassword) {
        // Verify current password
        if (currentPassword !== this.adminSettings.password) {
            console.error('Invalid current password');
            return false;
        }
        
        // Update password
        this.adminSettings.password = newPassword;
        
        // Save settings
        this.saveAdminSettings();
        
        return true;
    }
}

// Export class
// Will be instantiated in the main game module

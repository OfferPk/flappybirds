// Data management module for hybrid storage
// Handles local storage and prepares for Firebase integration

class DataManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.attemptSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    // Save data to local storage
    saveToLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            
            // If online and logged in, queue for sync
            if (this.isOnline && this.isUserLoggedIn()) {
                this.queueForSync(key, data);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to local storage:', error);
            return false;
        }
    }
    
    // Get data from local storage
    getFromLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving from local storage:', error);
            return null;
        }
    }
    
    // Check if user is logged in
    isUserLoggedIn() {
        return !!this.getFromLocal('currentUser');
    }
    
    // Queue data for sync with future Firebase
    queueForSync(key, data) {
        this.syncQueue.push({
            key,
            data,
            timestamp: Date.now()
        });
        
        // Store sync queue in local storage
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }
    
    // Attempt to sync data with server (placeholder for Firebase)
    attemptSync() {
        if (!this.isOnline || !this.isUserLoggedIn()) {
            return false;
        }
        
        // Load sync queue from storage
        const storedQueue = localStorage.getItem('syncQueue');
        if (storedQueue) {
            this.syncQueue = JSON.parse(storedQueue);
        }
        
        // Process sync queue (will be implemented with Firebase)
        console.log('Syncing data with server...', this.syncQueue);
        
        // Clear sync queue after successful sync
        this.syncQueue = [];
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        
        return true;
    }
    
    // Save user data
    saveUserData(userData) {
        const username = userData.username;
        this.saveToLocal(`user_${username}`, userData);
        
        if (userData.isLoggedIn) {
            this.saveToLocal('currentUser', username);
        }
    }
    
    // Get current user data
    getCurrentUserData() {
        const currentUser = this.getFromLocal('currentUser');
        if (!currentUser) return null;
        
        return this.getFromLocal(`user_${currentUser}`);
    }
    
    // Save game score
    saveScore(gameType, score) {
        const currentUser = this.getFromLocal('currentUser') || 'anonymous';
        const scoresKey = `scores_${gameType}`;
        
        // Get existing scores
        let scores = this.getFromLocal(scoresKey) || [];
        
        // Add new score
        scores.push({
            username: currentUser,
            score: score,
            timestamp: Date.now()
        });
        
        // Sort scores (descending)
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100
        if (scores.length > 100) {
            scores = scores.slice(0, 100);
        }
        
        // Save scores
        this.saveToLocal(scoresKey, scores);
        
        // Update user's high score if needed
        if (currentUser !== 'anonymous') {
            const userData = this.getFromLocal(`user_${currentUser}`);
            if (userData) {
                if (!userData.highScores) {
                    userData.highScores = {};
                }
                
                if (!userData.highScores[gameType] || score > userData.highScores[gameType]) {
                    userData.highScores[gameType] = score;
                    this.saveUserData(userData);
                }
            }
        }
        
        return scores;
    }
    
    // Get leaderboard
    getLeaderboard(gameType) {
        const scoresKey = `scores_${gameType}`;
        return this.getFromLocal(scoresKey) || [];
    }
    
    // Clear all data (for testing)
    clearAllData() {
        localStorage.clear();
        this.syncQueue = [];
    }
}

// Export as singleton
const dataManager = new DataManager();

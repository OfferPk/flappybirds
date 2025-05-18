// User authentication module
// Handles login, registration, and session management

class UserAuth {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Check if user is already logged in
        this.checkLoginStatus();
    }
    
    // Check if user is already logged in from previous session
    checkLoginStatus() {
        const userData = this.dataManager.getCurrentUserData();
        if (userData) {
            this.currentUser = userData;
            this.isLoggedIn = true;
            return true;
        }
        return false;
    }
    
    // Register a new user
    register(username, email, password) {
        // Check if username already exists
        const existingUser = this.dataManager.getFromLocal(`user_${username}`);
        if (existingUser) {
            return {
                success: false,
                message: 'Username already exists'
            };
        }
        
        // Create new user
        const newUser = {
            username,
            email,
            password, // In a real app, this would be hashed
            createdAt: Date.now(),
            isLoggedIn: true,
            highScores: {},
            coins: 0,
            lastLogin: Date.now()
        };
        
        // Save user data
        this.dataManager.saveUserData(newUser);
        
        // Set as current user
        this.currentUser = newUser;
        this.isLoggedIn = true;
        
        return {
            success: true,
            message: 'Registration successful',
            user: this.getSafeUserData()
        };
    }
    
    // Login user
    login(username, password) {
        const userData = this.dataManager.getFromLocal(`user_${username}`);
        
        if (!userData || userData.password !== password) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        // Update user data
        userData.isLoggedIn = true;
        userData.lastLogin = Date.now();
        this.dataManager.saveUserData(userData);
        
        // Set as current user
        this.currentUser = userData;
        this.isLoggedIn = true;
        
        return {
            success: true,
            message: 'Login successful',
            user: this.getSafeUserData()
        };
    }
    
    // Logout user
    logout() {
        if (!this.isLoggedIn) {
            return {
                success: false,
                message: 'No user is logged in'
            };
        }
        
        // Update user data
        this.currentUser.isLoggedIn = false;
        this.dataManager.saveUserData(this.currentUser);
        
        // Clear current user
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.isLoggedIn = false;
        
        return {
            success: true,
            message: 'Logout successful'
        };
    }
    
    // Get current user data (without sensitive info)
    getSafeUserData() {
        if (!this.currentUser) {
            return null;
        }
        
        // Return user data without password
        const { password, ...safeData } = this.currentUser;
        return safeData;
    }
    
    // Update user profile
    updateProfile(updates) {
        if (!this.isLoggedIn) {
            return {
                success: false,
                message: 'User not logged in'
            };
        }
        
        // Update user data
        Object.assign(this.currentUser, updates);
        this.dataManager.saveUserData(this.currentUser);
        
        return {
            success: true,
            message: 'Profile updated successfully',
            user: this.getSafeUserData()
        };
    }
    
    // Add coins to user account
    addCoins(amount) {
        if (!this.isLoggedIn) {
            return {
                success: false,
                message: 'User not logged in'
            };
        }
        
        // Update coins
        if (!this.currentUser.coins) {
            this.currentUser.coins = 0;
        }
        
        this.currentUser.coins += amount;
        this.dataManager.saveUserData(this.currentUser);
        
        return {
            success: true,
            message: `Added ${amount} coins`,
            totalCoins: this.currentUser.coins
        };
    }
}

// Export class
// Will be instantiated in main.js with dataManager dependency

// Admin Panel for Multi-Currency System Management
class AdminPanel {
    constructor(dataManager, currencySystem) {
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        
        // Admin credentials (in a real app, this would be stored securely)
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        
        // Currency visibility settings
        this.currencyVisibility = {
            'COINS': true,
            'DWHL': true,  // Always visible by default
            'DOGE': false
        };
        
        // UI elements
        this.adminPanelContainer = null;
        this.loginForm = null;
        this.controlPanel = null;
        
        // Authentication state
        this.isAuthenticated = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.createUI = this.createUI.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.toggleCurrencyVisibility = this.toggleCurrencyVisibility.bind(this);
        this.loadSettings = this.loadSettings.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
    }
    
    // Initialize admin panel
    init(container) {
        // Set container
        this.adminPanelContainer = typeof container === 'string' ? document.getElementById(container) : container;
        
        // Load settings
        this.loadSettings();
        
        // Create UI
        if (this.adminPanelContainer) {
            this.createUI();
        }
        
        // Apply initial visibility settings
        this.applyVisibilitySettings();
        
        console.log('Admin panel initialized');
    }
    
    // Create UI
    createUI() {
        // Clear container
        this.adminPanelContainer.innerHTML = '';
        
        // Create panel header
        const header = document.createElement('div');
        header.className = 'admin-panel-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Admin Panel';
        title.className = 'admin-panel-title';
        header.appendChild(title);
        
        this.adminPanelContainer.appendChild(header);
        
        // Create login form if not authenticated
        if (!this.isAuthenticated) {
            this.createLoginForm();
        } else {
            this.createControlPanel();
        }
        
        // Add styles
        this.addStyles();
    }
    
    // Create login form
    createLoginForm() {
        this.loginForm = document.createElement('div');
        this.loginForm.className = 'admin-login-form';
        
        // Create username input
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'admin-input-group';
        
        const usernameLabel = document.createElement('label');
        usernameLabel.htmlFor = 'admin-username';
        usernameLabel.textContent = 'Username';
        usernameGroup.appendChild(usernameLabel);
        
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.id = 'admin-username';
        usernameInput.className = 'admin-input';
        usernameInput.placeholder = 'Enter admin username';
        usernameGroup.appendChild(usernameInput);
        
        this.loginForm.appendChild(usernameGroup);
        
        // Create password input
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'admin-input-group';
        
        const passwordLabel = document.createElement('label');
        passwordLabel.htmlFor = 'admin-password';
        passwordLabel.textContent = 'Password';
        passwordGroup.appendChild(passwordLabel);
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.id = 'admin-password';
        passwordInput.className = 'admin-input';
        passwordInput.placeholder = 'Enter admin password';
        passwordGroup.appendChild(passwordInput);
        
        this.loginForm.appendChild(passwordGroup);
        
        // Create login button
        const loginButton = document.createElement('button');
        loginButton.className = 'admin-login-button';
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => {
            this.handleLogin(usernameInput.value, passwordInput.value);
        });
        
        this.loginForm.appendChild(loginButton);
        
        // Create status message
        const statusMessage = document.createElement('div');
        statusMessage.className = 'admin-status-message';
        this.loginForm.appendChild(statusMessage);
        
        this.adminPanelContainer.appendChild(this.loginForm);
    }
    
    // Create control panel
    createControlPanel() {
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'admin-control-panel';
        
        // Create currency visibility section
        const visibilitySection = document.createElement('div');
        visibilitySection.className = 'admin-section';
        
        const visibilityTitle = document.createElement('h3');
        visibilityTitle.textContent = 'Currency Visibility';
        visibilityTitle.className = 'admin-section-title';
        visibilitySection.appendChild(visibilityTitle);
        
        // Create currency toggles
        for (const currency in this.currencyVisibility) {
            const toggleGroup = document.createElement('div');
            toggleGroup.className = 'admin-toggle-group';
            
            const toggleLabel = document.createElement('label');
            toggleLabel.className = 'admin-toggle-label';
            toggleLabel.textContent = `${currency} Currency`;
            
            // Create toggle switch
            const toggleSwitch = document.createElement('label');
            toggleSwitch.className = 'admin-toggle-switch';
            
            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.checked = this.currencyVisibility[currency];
            toggleInput.disabled = currency === 'DWHL'; // DWHL is always visible
            
            toggleInput.addEventListener('change', () => {
                this.toggleCurrencyVisibility(currency, toggleInput.checked);
            });
            
            const toggleSlider = document.createElement('span');
            toggleSlider.className = 'admin-toggle-slider';
            
            toggleSwitch.appendChild(toggleInput);
            toggleSwitch.appendChild(toggleSlider);
            
            toggleGroup.appendChild(toggleLabel);
            toggleGroup.appendChild(toggleSwitch);
            
            visibilitySection.appendChild(toggleGroup);
        }
        
        this.controlPanel.appendChild(visibilitySection);
        
        // Create logout button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'admin-logout-button';
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', () => {
            this.handleLogout();
        });
        
        this.controlPanel.appendChild(logoutButton);
        
        this.adminPanelContainer.appendChild(this.controlPanel);
    }
    
    // Add styles
    addStyles() {
        if (!document.getElementById('admin-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-panel-styles';
            style.textContent = `
                .admin-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .admin-panel-title {
                    margin: 0;
                    color: var(--primary-color);
                    font-size: 24px;
                }
                
                .admin-login-form {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    border-radius: 10px;
                }
                
                .admin-input-group {
                    margin-bottom: 15px;
                }
                
                .admin-input-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .admin-input {
                    width: 100%;
                    padding: 10px 15px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 5px;
                    background-color: rgba(0, 0, 0, 0.2);
                    color: white;
                    font-size: 14px;
                }
                
                .admin-login-button {
                    width: 100%;
                    padding: 12px 0;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin-top: 10px;
                }
                
                .admin-login-button:hover {
                    background-color: var(--secondary-color);
                }
                
                .admin-status-message {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 14px;
                    min-height: 20px;
                }
                
                .admin-status-message.success {
                    color: #4CAF50;
                }
                
                .admin-status-message.error {
                    color: #FF5252;
                }
                
                .admin-control-panel {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    border-radius: 10px;
                }
                
                .admin-section {
                    margin-bottom: 20px;
                }
                
                .admin-section-title {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: var(--primary-color);
                    font-size: 18px;
                }
                
                .admin-toggle-group {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                }
                
                .admin-toggle-label {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.9);
                }
                
                .admin-toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 30px;
                }
                
                .admin-toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .admin-toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                
                .admin-toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 22px;
                    width: 22px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .admin-toggle-slider {
                    background-color: var(--primary-color);
                }
                
                input:focus + .admin-toggle-slider {
                    box-shadow: 0 0 1px var(--primary-color);
                }
                
                input:checked + .admin-toggle-slider:before {
                    transform: translateX(30px);
                }
                
                input:disabled + .admin-toggle-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .admin-logout-button {
                    width: 100%;
                    padding: 12px 0;
                    background-color: #FF5252;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin-top: 20px;
                }
                
                .admin-logout-button:hover {
                    background-color: #FF1744;
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // Handle login
    handleLogin(username, password) {
        const statusMessage = this.loginForm.querySelector('.admin-status-message');
        
        // Check credentials
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            // Set authenticated
            this.isAuthenticated = true;
            
            // Show success message
            statusMessage.textContent = 'Login successful!';
            statusMessage.className = 'admin-status-message success';
            
            // Recreate UI
            setTimeout(() => {
                this.createUI();
            }, 1000);
        } else {
            // Show error message
            statusMessage.textContent = 'Invalid username or password';
            statusMessage.className = 'admin-status-message error';
        }
    }
    
    // Handle logout
    handleLogout() {
        // Set not authenticated
        this.isAuthenticated = false;
        
        // Recreate UI
        this.createUI();
    }
    
    // Toggle currency visibility
    toggleCurrencyVisibility(currency, isVisible) {
        // Update visibility
        this.currencyVisibility[currency] = isVisible;
        
        // Save settings
        this.saveSettings();
        
        // Apply visibility settings
        this.applyVisibilitySettings();
    }
    
    // Load settings
    loadSettings() {
        // Try to load from local storage
        const storedSettings = this.dataManager.getData('adminSettings');
        
        if (storedSettings && storedSettings.currencyVisibility) {
            // Ensure DWHL is always visible
            storedSettings.currencyVisibility.DWHL = true;
            
            this.currencyVisibility = storedSettings.currencyVisibility;
        }
    }
    
    // Save settings
    saveSettings() {
        // Ensure DWHL is always visible
        this.currencyVisibility.DWHL = true;
        
        // Save to local storage
        this.dataManager.saveData('adminSettings', {
            currencyVisibility: this.currencyVisibility
        });
    }
    
    // Apply visibil
(Content truncated due to size limit. Use line ranges to read in chunks)

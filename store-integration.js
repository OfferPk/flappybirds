// Store UI and Logic Integration
class StoreIntegration {
    constructor(dataManager, currencySystem, gameStore, weaponsSystem) {
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        this.gameStore = gameStore;
        this.weaponsSystem = weaponsSystem;
        
        // Store UI elements
        this.storeButton = null;
        this.storeModal = null;
        
        // Bind methods
        this.initStoreUI = this.initStoreUI.bind(this);
        this.handlePurchase = this.handlePurchase.bind(this);
        this.handleEquip = this.handleEquip.bind(this);
        this.updateCurrencyDisplay = this.updateCurrencyDisplay.bind(this);
        
        // Listen for currency changes
        this.currencySystem.addListener(this.updateCurrencyDisplay);
    }
    
    // Initialize store UI and logic
    init() {
        // Create store UI elements
        this.initStoreUI();
        
        // Add event listeners
        this.addEventListeners();
        
        console.log('Store integration initialized');
    }
    
    // Initialize store UI
    initStoreUI() {
        // Create store button if it doesn't exist
        if (!document.getElementById('store-button')) {
            const header = document.querySelector('.header');
            if (header) {
                const storeButton = document.createElement('button');
                storeButton.id = 'store-button';
                storeButton.className = 'nav-button';
                storeButton.innerHTML = '<i class="fas fa-store"></i> Store';
                
                const navButtons = header.querySelector('.nav-buttons');
                if (navButtons) {
                    navButtons.appendChild(storeButton);
                } else {
                    header.appendChild(storeButton);
                }
                
                this.storeButton = storeButton;
            }
        }
        
        // Create store modal if it doesn't exist
        if (!document.getElementById('store-modal')) {
            const storeModal = document.createElement('div');
            storeModal.id = 'store-modal';
            storeModal.className = 'modal';
            
            storeModal.innerHTML = `
                <div class="modal-content store-modal-content">
                    <span class="modal-close" id="store-close">&times;</span>
                    <h2 class="modal-title">Game Store</h2>
                    
                    <div class="store-balance">
                        <span id="store-currency-icon" class="currency-icon">🪙</span>
                        <span id="store-currency-amount" class="currency-amount">${this.currencySystem.getBalance()}</span>
                        <button id="buy-coins-btn" class="buy-coins-btn">+ Buy Coins</button>
                    </div>
                    
                    <div class="store-tabs">
                        <button id="weapons-tab" class="store-tab active" data-section="weapons">Weapons</button>
                        <button id="skins-tab" class="store-tab" data-section="skins">Skins</button>
                        <button id="boosters-tab" class="store-tab" data-section="boosters">Boosters</button>
                    </div>
                    
                    <div id="store-container" class="store-container">
                        <!-- Store content will be dynamically generated -->
                    </div>
                </div>
            `;
            
            document.body.appendChild(storeModal);
            this.storeModal = storeModal;
            
            // Add store styles
            this.addStoreStyles();
        }
    }
    
    // Add store styles
    addStoreStyles() {
        if (!document.getElementById('store-styles')) {
            const style = document.createElement('style');
            style.id = 'store-styles';
            style.textContent = `
                .store-modal-content {
                    max-width: 800px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    background: #1a1a1a;
                    color: white;
                }
                
                .store-balance {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 215, 0, 0.2);
                    padding: 10px 15px;
                    border-radius: 15px;
                    margin-bottom: 20px;
                    justify-content: center;
                }
                
                .store-balance .currency-icon {
                    font-size: 24px;
                    color: var(--accent-color);
                }
                
                .store-balance .currency-amount {
                    font-size: 20px;
                    color: var(--accent-color);
                    font-weight: bold;
                }
                
                .buy-coins-btn {
                    padding: 5px 10px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-left: auto;
                }
                
                .buy-coins-btn:hover {
                    background: var(--secondary-color);
                }
                
                .store-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .store-tab {
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'Bangers', 'Arial', sans-serif;
                    letter-spacing: 1px;
                }
                
                .store-tab:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .store-tab.active {
                    background: var(--primary-color);
                }
                
                .store-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 10px;
                }
                
                .store-item {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .store-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }
                
                .store-item.locked::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1;
                }
                
                .store-item.locked::before {
                    content: '🔒';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 30px;
                    z-index: 2;
                }
                
                .item-icon {
                    font-size: 40px;
                    margin-bottom: 10px;
                }
                
                .item-name {
                    font-size: 18px;
                    color: white;
                    margin-bottom: 5px;
                    text-align: center;
                }
                
                .item-description {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 10px;
                    text-align: center;
                }
                
                .item-price {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255, 215, 0, 0.2);
                    padding: 5px 10px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                }
                
                .item-price-icon {
                    font-size: 16px;
                    color: var(--accent-color);
                }
                
                .item-price-amount {
                    font-size: 14px;
                    color: var(--accent-color);
                }
                
                .item-button {
                    width: 100%;
                    padding: 8px 0;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'Bangers', 'Arial', sans-serif;
                    letter-spacing: 1px;
                }
                
                .item-button:hover {
                    background: var(--secondary-color);
                }
                
                .item-button.equipped {
                    background: var(--secondary-color);
                }
                
                .item-button:disabled {
                    background: #666;
                    cursor: not-allowed;
                }
                
                .equipped-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--secondary-color);
                    color: white;
                    padding: 3px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                    z-index: 3;
                }
                
                /* Confirmation modal */
                .confirm-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                
                .confirm-content {
                    background: #1a1a1a;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }
                
                .confirm-title {
                    font-size: 24px;
                    color: white;
                    margin-bottom: 20px;
                }
                
                .confirm-message {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 20px;
                }
                
                .confirm-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }
                
                .confirm-button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'Bangers', 'Arial', sans-serif;
                    letter-spacing: 1px;
                }
                
                .confirm-yes {
                    background: var(--primary-color);
                    color: white;
                }
                
                .confirm-yes:hover {
                    background: var(--secondary-color);
                }
                
                .confirm-no {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .confirm-no:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                /* Success notification */
                .success-notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 15px 30px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    z-index: 2000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    text-align: center;
                }
                
                .success-notification.show {
                    opacity: 1;
                }
                
                @media (max-width: 768px) {
                    .store-container {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // Add event listeners
    addEventListeners() {
        // Store button click
        if (this.storeButton) {
            this.storeButton.addEventListener('click', () => {
                this.openStore();
            });
        }
        
        // Close button click
        const closeButton = document.getElementById('store-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeStore();
            });
        }
        
        // Tab buttons click
        const tabButtons = document.querySelectorAll('.store-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.section);
            });
        });
        
        // Buy coins button click
        const buyCoinsButton = document.getElementById('buy-coins-btn');
        if (buyCoinsButton) {
            buyCoinsButton.addEventListener('click', () => {
                this.showBuyCoinsModal();
            });
        }
    }
    
    // Open store
    openStore() {
        if (this.storeModal) {
            this.storeModal.style.display = 'flex';
            
            // Update currency display
            this.updateCurrencyDisplay();
            
            // Render initial tab
            this.renderStoreItems('weapons');
        }
    }
    
    // Close store
    closeStore() {
        if (this.storeModal) {
            this.storeModal.style.display = 'none';
        }
    }
    
    // Switch tab
    switchTab(section) {
        // Update active tab
        const tabs = document.querySelectorAll('.store-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });
        
        // Render items for selected section
        this.renderStor
(Content truncated due to size limit. Use line ranges to read in chunks)

// Game Store module for hybrid game
class GameStore {
    constructor(dataManager, currencySystem) {
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        this.storeContainer = null;
        this.isOpen = false;
        this.activeSection = 'weapons';
        this.equippedItems = {
            weapon: null,
            skin: null,
            activeBooster: null
        };
        
        // Store inventory
        this.inventory = {
            weapons: [
                {
                    id: 'ak47',
                    name: 'AK-47',
                    description: 'Fast fire, medium damage',
                    price: 5000,
                    icon: '🔫',
                    features: ['Fast fire rate', 'Medium damage', 'Long range'],
                    stats: {
                        damage: 7,
                        fireRate: 9,
                        range: 6
                    },
                    unlocked: false
                },
                {
                    id: 'laser',
                    name: 'Laser Beam',
                    description: 'Piercing beam, short burst',
                    price: 7000,
                    icon: '⚡',
                    features: ['Pierces multiple enemies', 'Short burst', 'High damage'],
                    stats: {
                        damage: 9,
                        fireRate: 5,
                        range: 8
                    },
                    unlocked: false
                },
                {
                    id: 'missile',
                    name: 'Missile Launcher',
                    description: 'Auto-target, high damage',
                    price: 10000,
                    icon: '🚀',
                    features: ['Auto-targeting', 'Area damage', 'Slow fire rate'],
                    stats: {
                        damage: 10,
                        fireRate: 3,
                        range: 10
                    },
                    unlocked: false
                },
                {
                    id: 'flame',
                    name: 'Flame Thrower',
                    description: 'Burns enemies, short range',
                    price: 6000,
                    icon: '🔥',
                    features: ['Continuous damage', 'Short range', 'Multiple targets'],
                    stats: {
                        damage: 8,
                        fireRate: 10,
                        range: 4
                    },
                    unlocked: false
                },
                {
                    id: 'electric',
                    name: 'Electric Wings',
                    description: 'AOE shock effect',
                    price: 4500,
                    icon: '⚡',
                    features: ['Area of effect', 'Stuns enemies', 'Medium damage'],
                    stats: {
                        damage: 6,
                        fireRate: 7,
                        range: 5
                    },
                    unlocked: false
                }
            ],
            skins: [
                {
                    id: 'gold',
                    name: 'Gold Bird',
                    description: 'Just cosmetic',
                    price: 3000,
                    icon: '🟡',
                    features: ['Shiny gold appearance', 'Particle effects', 'No gameplay benefits'],
                    preview: 'gold-bird.png',
                    unlocked: false
                },
                {
                    id: 'shadow',
                    name: 'Shadow Bird',
                    description: 'Faster flap',
                    price: 4000,
                    icon: '⚫',
                    features: ['Dark appearance', 'Faster flap rate', 'Improved maneuverability'],
                    preview: 'shadow-bird.png',
                    unlocked: false
                },
                {
                    id: 'warrior',
                    name: 'Warrior Bird',
                    description: 'Looks + bonus damage',
                    price: 5000,
                    icon: '⚔️',
                    features: ['Armored appearance', 'Bonus damage', 'Intimidating presence'],
                    preview: 'warrior-bird.png',
                    unlocked: false
                }
            ],
            boosters: [
                {
                    id: 'shield',
                    name: 'Shield',
                    description: 'Protects from one hit',
                    price: 500,
                    icon: '🛡️',
                    duration: 0, // One-time use
                    features: ['Absorbs one hit', 'Visual shield effect', 'Sound effect on hit'],
                    unlocked: false
                },
                {
                    id: 'magnet',
                    name: 'Magnet',
                    description: 'Pulls coins for 10 sec',
                    price: 800,
                    icon: '🧲',
                    duration: 10, // seconds
                    features: ['Attracts coins', 'Wider collection radius', 'Visual effect'],
                    unlocked: false
                },
                {
                    id: 'double',
                    name: 'Double Coins',
                    description: '2x coins for 20 secs',
                    price: 1000,
                    icon: '💰',
                    duration: 20, // seconds
                    features: ['Double coin value', 'Coin glow effect', 'Sound effect on collection'],
                    unlocked: false
                },
                {
                    id: 'health',
                    name: 'Health Pack',
                    description: 'Restores one life',
                    price: 600,
                    icon: '❤️',
                    duration: 0, // One-time use
                    features: ['Restores one health point', 'Visual healing effect', 'Sound effect'],
                    unlocked: false
                }
            ]
        };
        
        // Load unlocked items
        this.loadUnlockedItems();
        
        // Bind methods
        this.openStore = this.openStore.bind(this);
        this.closeStore = this.closeStore.bind(this);
        this.switchSection = this.switchSection.bind(this);
        this.purchaseItem = this.purchaseItem.bind(this);
        this.equipItem = this.equipItem.bind(this);
    }
    
    // Initialize store
    init() {
        // Create store button in header
        this.createStoreButton();
        
        // Create store modal
        this.createStoreModal();
        
        console.log('Game Store initialized');
    }
    
    // Create store button in header
    createStoreButton() {
        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            const storeButton = document.createElement('button');
            storeButton.id = 'store-btn';
            storeButton.className = 'nav-button';
            storeButton.innerHTML = '<i class="fas fa-store"></i> Store';
            storeButton.addEventListener('click', this.openStore);
            
            navButtons.appendChild(storeButton);
        }
    }
    
    // Create store modal
    createStoreModal() {
        // Create modal if it doesn't exist
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
                        <span id="store-currency-amount" class="currency-amount">0</span>
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
            
            // Add event listeners
            document.getElementById('store-close').addEventListener('click', this.closeStore);
            
            // Add tab event listeners
            const tabs = document.querySelectorAll('.store-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchSection(tab.dataset.section);
                });
            });
            
            // Add buy coins button event listener
            document.getElementById('buy-coins-btn').addEventListener('click', () => {
                alert('This feature will be available in the future!');
            });
            
            // Add store styles
            this.addStoreStyles();
        }
        
        // Set store container reference
        this.storeContainer = document.getElementById('store-container');
    }
    
    // Add store styles
    addStoreStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .store-modal-content {
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
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
            
            .item-features {
                margin-top: 10px;
                width: 100%;
            }
            
            .item-feature {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 3px;
            }
            
            .item-stats {
                width: 100%;
                margin-top: 10px;
            }
            
            .stat-bar {
                height: 5px;
                background: rgba(255, 255, 255, 0.2);
    
(Content truncated due to size limit. Use line ranges to read in chunks)

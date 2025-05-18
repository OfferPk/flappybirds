// Spin to Earn Leaderboard with Multi-Currency Support
class SpinToEarnLeaderboardAdvanced {
    constructor(dataManager, currencySystem) {
        this.dataManager = dataManager;
        this.currencySystem = currencySystem;
        
        // Leaderboard data
        this.leaderboardData = [];
        
        // Current currency
        this.currentCurrency = 'DOGE';
        
        // UI elements
        this.leaderboardContainer = null;
        this.currencySelector = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadLeaderboard = this.loadLeaderboard.bind(this);
        this.updateLeaderboard = this.updateLeaderboard.bind(this);
        this.addSpinResult = this.addSpinResult.bind(this);
    }
    
    // Initialize leaderboard
    init(container) {
        // Set container
        this.leaderboardContainer = typeof container === 'string' ? document.getElementById(container) : container;
        
        // Create UI if container exists
        if (this.leaderboardContainer) {
            this.createUI();
        }
        
        // Load initial data
        this.loadLeaderboard();
        
        // Add event listeners
        this.addEventListeners();
        
        console.log('Spin to Earn leaderboard initialized');
    }
    
    // Create UI
    createUI() {
        // Clear container
        this.leaderboardContainer.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'leaderboard-header';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Spin to Earn Leaderboard';
        title.className = 'leaderboard-title';
        header.appendChild(title);
        
        this.leaderboardContainer.appendChild(header);
        
        // Create leaderboard table
        const table = document.createElement('table');
        table.className = 'leaderboard-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Rank', 'Player', 'Winnings', 'Date'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        tbody.id = 'leaderboard-body';
        table.appendChild(tbody);
        
        this.leaderboardContainer.appendChild(table);
        
        // Add styles
        this.addStyles();
    }
    
    // Add styles
    addStyles() {
        if (!document.getElementById('leaderboard-styles')) {
            const style = document.createElement('style');
            style.id = 'leaderboard-styles';
            style.textContent = `
                .leaderboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .leaderboard-title {
                    margin: 0;
                    color: var(--primary-color);
                    font-size: 24px;
                }
                
                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .leaderboard-table th {
                    background-color: var(--primary-color);
                    color: white;
                    font-weight: bold;
                }
                
                .leaderboard-table tbody tr:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                
                .leaderboard-table tbody tr:nth-child(even) {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .leaderboard-table .rank {
                    text-align: center;
                    font-weight: bold;
                }
                
                .leaderboard-table .rank-1 {
                    color: gold;
                }
                
                .leaderboard-table .rank-2 {
                    color: silver;
                }
                
                .leaderboard-table .rank-3 {
                    color: #cd7f32; /* bronze */
                }
                
                .leaderboard-table .winnings {
                    font-weight: bold;
                    color: var(--accent-color);
                }
                
                @media (max-width: 768px) {
                    .leaderboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    
                    .leaderboard-table th,
                    .leaderboard-table td {
                        padding: 8px 10px;
                        font-size: 14px;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // Add event listeners
    addEventListeners() {
        // Listen for spin results
        document.addEventListener('spin:result', (event) => {
            const { result } = event.detail;
            this.addSpinResult(result);
        });
    }
    
    // Load leaderboard data
    loadLeaderboard() {
        // Try to load from local storage first
        const storedData = this.dataManager.getData('spinLeaderboard');
        
        if (storedData && Array.isArray(storedData)) {
            this.leaderboardData = storedData;
            this.updateLeaderboard();
        } else {
            // Initialize with empty array if no data
            this.leaderboardData = [];
            this.saveLeaderboard();
        }
    }
    
    // Save leaderboard data
    saveLeaderboard() {
        this.dataManager.saveData('spinLeaderboard', this.leaderboardData);
    }
    
    // Update leaderboard UI
    updateLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;
        
        // Clear table body
        tbody.innerHTML = '';
        
        // Sort data by winnings (descending)
        const sortedData = [...this.leaderboardData].sort((a, b) => b.winnings - a.winnings);
        
        // Add rows
        sortedData.slice(0, 100).forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // Rank
            const rankCell = document.createElement('td');
            rankCell.className = `rank rank-${index + 1}`;
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
            
            // Player
            const playerCell = document.createElement('td');
            playerCell.textContent = entry.playerName || 'Anonymous';
            row.appendChild(playerCell);
            
            // Winnings
            const winningsCell = document.createElement('td');
            winningsCell.className = 'winnings';
            winningsCell.textContent = `${entry.winnings} ${entry.currency}`;
            row.appendChild(winningsCell);
            
            // Date
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(entry.timestamp).toLocaleDateString();
            row.appendChild(dateCell);
            
            tbody.appendChild(row);
        });
        
        // If no data, show message
        if (sortedData.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No spin results yet. Be the first to spin and win!';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            row.appendChild(cell);
            tbody.appendChild(row);
        }
    }
    
    // Add spin result to leaderboard
    addSpinResult(result) {
        // Get current user
        const currentUser = this.dataManager.getCurrentUser();
        
        // Create entry
        const entry = {
            playerName: currentUser ? currentUser.username : 'Guest',
            playerId: currentUser ? currentUser.id : `guest-${Date.now()}`,
            winnings: result.value,
            currency: 'DOGE',
            timestamp: Date.now()
        };
        
        // Add to leaderboard
        this.leaderboardData.push(entry);
        
        // Sort and limit to top 100
        this.leaderboardData.sort((a, b) => b.winnings - a.winnings);
        if (this.leaderboardData.length > 100) {
            this.leaderboardData = this.leaderboardData.slice(0, 100);
        }
        
        // Save leaderboard
        this.saveLeaderboard();
        
        // Update UI
        this.updateLeaderboard();
        
        return entry;
    }
    
    // Get user's spin history
    getUserSpinHistory(userId) {
        return this.dataManager.getData(`spinHistory_${userId}`) || [];
    }
    
    // Get user's total winnings
    getUserTotalWinnings(userId) {
        const spinHistory = this.getUserSpinHistory(userId);
        
        return spinHistory.reduce((total, entry) => {
            return total + entry.result.value;
        }, 0);
    }
    
    // Get user's rank
    getUserRank(userId) {
        // Sort all users by winnings
        const allUsers = {};
        
        // Aggregate winnings by user
        this.leaderboardData.forEach(entry => {
            if (!allUsers[entry.playerId]) {
                allUsers[entry.playerId] = {
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    totalWinnings: 0
                };
            }
            
            allUsers[entry.playerId].totalWinnings += entry.winnings;
        });
        
        // Convert to array and sort
        const sortedUsers = Object.values(allUsers).sort((a, b) => b.totalWinnings - a.totalWinnings);
        
        // Find user's rank
        const userIndex = sortedUsers.findIndex(user => user.playerId === userId);
        
        return userIndex !== -1 ? userIndex + 1 : null;
    }
}

// Export class
// Will be instantiated in the Spin to Earn game module

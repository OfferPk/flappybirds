// Leaderboard module
// Handles score tracking and leaderboard display

class Leaderboard {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.leaderboardContainer = null;
        this.currentGameType = null;
    }
    
    // Initialize leaderboard
    init(container) {
        this.leaderboardContainer = container;
    }
    
    // Display leaderboard for specific game type
    displayLeaderboard(gameType) {
        if (!this.leaderboardContainer) {
            console.error('Leaderboard container not initialized');
            return;
        }
        
        this.currentGameType = gameType;
        
        // Get leaderboard data
        const scores = this.dataManager.getLeaderboard(gameType);
        
        // Create leaderboard HTML
        let html = `
            <div class="leaderboard-header">
                <h2>${gameType === 'flappy' ? 'Flappy Bird' : 'Spin to Earn'} Leaderboard</h2>
                <div class="leaderboard-tabs">
                    <button class="tab-button ${gameType === 'flappy' ? 'active' : ''}" 
                            onclick="leaderboard.displayLeaderboard('flappy')">
                        Flappy Bird
                    </button>
                    <button class="tab-button ${gameType === 'spin' ? 'active' : ''}" 
                            onclick="leaderboard.displayLeaderboard('spin')">
                        Spin to Earn
                    </button>
                </div>
            </div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (scores.length === 0) {
            html += `
                <tr>
                    <td colspan="4" class="no-scores">No scores yet. Be the first to play!</td>
                </tr>
            `;
        } else {
            // Add scores to table
            scores.slice(0, 100).forEach((score, index) => {
                const date = new Date(score.timestamp);
                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                
                html += `
                    <tr class="${index < 3 ? 'top-score' : ''}">
                        <td>${index + 1}</td>
                        <td>${score.username}</td>
                        <td>${score.score}</td>
                        <td>${formattedDate}</td>
                    </tr>
                `;
            });
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        // Update container
        this.leaderboardContainer.innerHTML = html;
    }
    
    // Add score to leaderboard
    addScore(gameType, username, score) {
        return this.dataManager.saveScore(gameType, score);
    }
    
    // Get user's highest score
    getUserHighScore(gameType, username) {
        const scores = this.dataManager.getLeaderboard(gameType);
        
        const userScores = scores.filter(score => score.username === username);
        
        if (userScores.length === 0) {
            return 0;
        }
        
        return Math.max(...userScores.map(score => score.score));
    }
    
    // Get user's rank
    getUserRank(gameType, username) {
        const scores = this.dataManager.getLeaderboard(gameType);
        
        // Group scores by username and get highest score for each user
        const userHighScores = {};
        
        scores.forEach(score => {
            if (!userHighScores[score.username] || score.score > userHighScores[score.username]) {
                userHighScores[score.username] = score.score;
            }
        });
        
        // Convert to array and sort
        const sortedScores = Object.entries(userHighScores)
            .map(([username, score]) => ({ username, score }))
            .sort((a, b) => b.score - a.score);
        
        // Find user's rank
        const userIndex = sortedScores.findIndex(score => score.username === username);
        
        return userIndex === -1 ? null : userIndex + 1;
    }
}

// Export class
// Will be instantiated in main.js with dataManager dependency

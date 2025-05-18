  // Missile Launcher System for Flappy Bird
class MissileLauncherSystem {
    constructor(gameCanvas, gameContext, bird, enemies) {
        this.gameCanvas = gameCanvas;
        this.gameContext = gameContext;
        this.bird = bird;
        this.enemies = enemies;
        
        // Missile properties
        this.missiles = [];
        this.missileSpeed = 8;
        this.missileSize = 10;
        this.missileDamage = 15;
        this.explosionRadius = 80;
        
        // Launcher properties
        this.cooldown = 3000; // ms
        this.lastLaunchTime = 0;
        this.ammo = 5;
        this.maxAmmo = 5;
        this.unlocked = false;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.launchMissile = this.launchMissile.bind(this);
    }
    
    // Launch missile
    launchMissile(timestamp) {
        // Check cooldown
        if (timestamp - this.lastLaunchTime < this.cooldown) {
            return false;
        }
        
        // Check ammo
        if (this.ammo <= 0) {
            console.log('Missile launcher out of ammo!');
            return false;
        }
        
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - this.bird.x;
            const dy = enemy.y - this.bird.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        // Create missile
        const missile = {
            x: this.bird.x + this.bird.width,
            y: this.bird.y + this.bird.height / 2 - this.missileSize / 2,
            width: this.missileSize * 2,
            height: this.missileSize,
            speed: this.missileSpeed,
            damage: this.missileDamage,
            target: nearestEnemy,
            explosionRadius: this.explosionRadius,
            trail: []
        };
        
        this.missiles.push(missile);
        
        // Update launcher state
        this.lastLaunchTime = timestamp;
        this.ammo--;
        
        return true;
    }
    
    // Update missiles
    update(deltaTime) {
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            
            // Add trail point
            missile.trail.push({
                x: missile.x + missile.width / 2,
                y: missile.y + missile.height / 2,
                age: 0
            });
            
            // Limit trail length
            if (missile.trail.length > 10) {
                missile.trail.shift();
            }
            
            // Age trail points
            for (let j = 0; j < missile.trail.length; j++) {
                missile.trail[j].age += deltaTime;
            }
            
            // Update position based on target
            if (missile.target) {
                const targetX = missile.target.x + missile.target.width / 2;
                const targetY = missile.target.y + missile.target.height / 2;
                
                const dx = targetX - (missile.x + missile.width / 2);
                const dy = targetY - (missile.y + missile.height / 2);
                const angle = Math.atan2(dy, dx);
                
                // Calculate rotation for rendering
                missile.rotation = angle;
                
                // Move missile towards target
                missile.x += Math.cos(angle) * missile.speed;
                missile.y += Math.sin(angle) * missile.speed;
                
                // Check if missile hit target
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < missile.target.width / 2) {
                    // Create explosion
                    this.createExplosion(missile);
                    
                    // Remove missile
                    this.missiles.splice(i, 1);
                }
            } else {
                // If no target, move straight
                missile.x += missile.speed;
                
                // Remove if out of bounds
                if (missile.x > this.gameCanvas.width) {
                    this.missiles.splice(i, 1);
                }
            }
        }
    }
    
    // Create explosion
    createExplosion(missile) {
        // This would be handled by the combat system
        // We'll dispatch an event for the combat system to handle
        const explosionEvent = new CustomEvent('missile:explosion', {
            detail: {
                x: missile.x + missile.width / 2,
                y: missile.y + missile.height / 2,
                radius: missile.explosionRadius,
                damage: missile.damage
            }
        });
        
        document.dispatchEvent(explosionEvent);
    }
    
    // Render missiles
    render() {
        for (const missile of this.missiles) {
            // Save context
            this.gameContext.save();
            
            // Translate to missile center
            this.gameContext.translate(
                missile.x + missile.width / 2,
                missile.y + missile.height / 2
            );
            
            // Rotate to missile direction
            if (missile.rotation !== undefined) {
                this.gameContext.rotate(missile.rotation);
            }
            
            // Draw missile body
            this.gameContext.fillStyle = '#FF4136';
            this.gameContext.fillRect(
                -missile.width / 2,
                -missile.height / 2,
                missile.width,
                missile.height
            );
            
            // Draw missile tip
            this.gameContext.fillStyle = '#FF851B';
            this.gameContext.beginPath();
            this.gameContext.moveTo(missile.width / 2, 0);
            this.gameContext.lineTo(missile.width / 2 - 5, -5);
            this.gameContext.lineTo(missile.width / 2 - 5, 5);
            this.gameContext.closePath();
            this.gameContext.fill();
            
            // Draw missile fins
            this.gameContext.fillStyle = '#AAAAAA';
            this.gameContext.fillRect(
                -missile.width / 2,
                -missile.height / 2 - 3,
                missile.width / 3,
                3
            );
            this.gameContext.fillRect(
                -missile.width / 2,
                missile.height / 2,
                missile.width / 3,
                3
            );
            
            // Restore context
            this.gameContext.restore();
            
            // Draw missile trail
            for (let i = 0; i < missile.trail.length; i++) {
                const point = missile.trail[i];
                const alpha = 1 - (point.age / 200); // Fade out over 200ms
                
                if (alpha > 0) {
                    const size = 5 * (1 - i / missile.trail.length);
                    
                    this.gameContext.fillStyle = `rgba(255, 165, 0, ${alpha})`;
                    this.gameContext.beginPath();
                    this.gameContext.arc(point.x, point.y, size, 0, Math.PI * 2);
                    this.gameContext.fill();
                }
            }
        }
    }
    
    // Reset missile launcher
    reset() {
        this.missiles = [];
        this.ammo = this.maxAmmo;
        this.lastLaunchTime = 0;
    }
    
    // Set unlocked state
    setUnlocked(unlocked) {
        this.unlocked = unlocked;
    }
    
    // Get ammo
    getAmmo() {
        return this.ammo;
    }
    
    // Set ammo
    setAmmo(ammo) {
        this.ammo = Math.min(ammo, this.maxAmmo);
    }
    
    // Reload ammo
    reload() {
        this.ammo = this.maxAmmo;
    }
}

// Export class
// Will be instantiated in the Flappy Bird game module

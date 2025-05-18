// Combat functions for Flappy Bird game
class CombatSystem {
    constructor(gameCanvas, gameContext, bird, obstacles) {
        this.gameCanvas = gameCanvas;
        this.gameContext = gameContext;
        this.bird = bird;
        this.obstacles = obstacles;
        
        // Combat properties
        this.projectiles = [];
        this.enemies = [];
        this.explosions = [];
        this.powerUps = [];
        
        // Weapon properties
        this.currentWeapon = 'default';
        this.weapons = {
            default: {
                damage: 1,
                cooldown: 500,
                projectileSpeed: 10,
                projectileSize: 5,
                lastFired: 0
            },
            ak47: {
                damage: 3,
                cooldown: 200,
                projectileSpeed: 15,
                projectileSize: 5,
                lastFired: 0,
                ammo: 100,
                maxAmmo: 100,
                autoFire: true
            },
            laser: {
                damage: 5,
                cooldown: 1000,
                projectileSpeed: 20,
                projectileSize: 3,
                lastFired: 0,
                ammo: 20,
                maxAmmo: 20,
                isPiercing: true
            },
            missile: {
                damage: 10,
                cooldown: 2000,
                projectileSpeed: 8,
                projectileSize: 8,
                lastFired: 0,
                ammo: 5,
                maxAmmo: 5,
                isHoming: true,
                explosionRadius: 50
            },
            electric: {
                damage: 4,
                cooldown: 3000,
                range: 100,
                lastFired: 0,
                ammo: 10,
                maxAmmo: 10,
                isAOE: true
            }
        };
        
        // Enemy types
        this.enemyTypes = {
            drone: {
                width: 30,
                height: 30,
                speed: 3,
                health: 5,
                damage: 1,
                points: 10,
                color: '#FF4136'
            },
            bat: {
                width: 25,
                height: 15,
                speed: 5,
                health: 3,
                damage: 1,
                points: 5,
                color: '#85144b'
            },
            bee: {
                width: 20,
                height: 20,
                speed: 4,
                health: 2,
                damage: 1,
                points: 3,
                color: '#FFDC00'
            }
        };
        
        // Combat stats
        this.score = 0;
        this.combo = 0;
        this.lastKillTime = 0;
        
        // UI elements
        this.healthBar = null;
        this.powerBar = null;
        this.scoreDisplay = null;
        this.comboDisplay = null;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.fireWeapon = this.fireWeapon.bind(this);
        this.spawnEnemy = this.spawnEnemy.bind(this);
        this.checkCollisions = this.checkCollisions.bind(this);
        
        // Initialize UI
        this.initUI();
    }
    
    // Initialize UI elements
    initUI() {
        // Health bar
        this.healthBar = document.getElementById('health-bar');
        
        // Power bar
        this.powerBar = document.getElementById('power-bar');
        
        // Score display
        this.scoreDisplay = document.getElementById('score-display');
        
        // Combo display
        this.comboDisplay = document.getElementById('combo-display');
        
        // Update UI
        this.updateUI();
    }
    
    // Update UI elements
    updateUI() {
        // Update health bar
        if (this.healthBar && this.bird.health !== undefined) {
            const healthPercent = (this.bird.health / this.bird.maxHealth) * 100;
            this.healthBar.style.width = `${healthPercent}%`;
        }
        
        // Update power bar
        if (this.powerBar && this.bird.power !== undefined) {
            const powerPercent = (this.bird.power / this.bird.maxPower) * 100;
            this.powerBar.style.width = `${powerPercent}%`;
        }
        
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.score;
        }
        
        // Update combo display
        if (this.comboDisplay) {
            if (this.combo > 1) {
                this.comboDisplay.textContent = `Combo x${this.combo}`;
                this.comboDisplay.style.opacity = '1';
            } else {
                this.comboDisplay.style.opacity = '0';
            }
        }
    }
    
    // Fire weapon
    fireWeapon(timestamp) {
        const weapon = this.weapons[this.currentWeapon];
        
        // Check cooldown
        if (timestamp - weapon.lastFired < weapon.cooldown) {
            return false;
        }
        
        // Check ammo for special weapons
        if (this.currentWeapon !== 'default' && weapon.ammo <= 0) {
            console.log('Out of ammo!');
            return false;
        }
        
        // Update last fired time
        weapon.lastFired = timestamp;
        
        // Decrease ammo for special weapons
        if (this.currentWeapon !== 'default' && weapon.ammo !== undefined) {
            weapon.ammo--;
        }
        
        // Handle different weapon types
        if (weapon.isAOE) {
            // Electric wings - AOE attack
            this.createElectricEffect();
        } else if (weapon.isHoming) {
            // Missile - homing projectile
            this.createMissile();
        } else {
            // Regular projectile
            this.createProjectile();
        }
        
        return true;
    }
    
    // Create projectile
    createProjectile() {
        const weapon = this.weapons[this.currentWeapon];
        
        const projectile = {
            x: this.bird.x + this.bird.width,
            y: this.bird.y + this.bird.height / 2,
            width: weapon.projectileSize,
            height: weapon.projectileSize,
            speed: weapon.projectileSpeed,
            damage: weapon.damage,
            type: this.currentWeapon,
            isPiercing: weapon.isPiercing || false
        };
        
        this.projectiles.push(projectile);
    }
    
    // Create missile (homing projectile)
    createMissile() {
        const weapon = this.weapons[this.currentWeapon];
        
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
        
        const missile = {
            x: this.bird.x + this.bird.width,
            y: this.bird.y + this.bird.height / 2,
            width: weapon.projectileSize,
            height: weapon.projectileSize,
            speed: weapon.projectileSpeed,
            damage: weapon.damage,
            type: this.currentWeapon,
            target: nearestEnemy,
            explosionRadius: weapon.explosionRadius
        };
        
        this.projectiles.push(missile);
    }
    
    // Create electric effect (AOE attack)
    createElectricEffect() {
        const weapon = this.weapons[this.currentWeapon];
        
        // Create visual effect
        const effect = {
            x: this.bird.x + this.bird.width / 2,
            y: this.bird.y + this.bird.height / 2,
            radius: weapon.range,
            damage: weapon.damage,
            duration: 500, // ms
            startTime: Date.now()
        };
        
        // Apply damage to enemies in range
        for (const enemy of this.enemies) {
            const dx = enemy.x + enemy.width / 2 - effect.x;
            const dy = enemy.y + enemy.height / 2 - effect.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= effect.radius) {
                this.damageEnemy(enemy, effect.damage);
            }
        }
        
        // Add visual effect
        this.explosions.push({
            x: effect.x - effect.radius,
            y: effect.y - effect.radius,
            width: effect.radius * 2,
            height: effect.radius * 2,
            type: 'electric',
            duration: effect.duration,
            startTime: effect.startTime
        });
    }
    
    // Spawn enemy
    spawnEnemy(timestamp) {
        // Determine spawn rate based on score
        const baseSpawnRate = 3000; // ms
        const minSpawnRate = 500; // ms
        const spawnRateDecrease = 100; // ms per 100 points
        
        const spawnRate = Math.max(
            minSpawnRate,
            baseSpawnRate - (this.score / 100) * spawnRateDecrease
        );
        
        // Check if it's time to spawn
        if (!this.lastSpawnTime || timestamp - this.lastSpawnTime >= spawnRate) {
            this.lastSpawnTime = timestamp;
            
            // Choose enemy type
            const enemyTypes = Object.keys(this.enemyTypes);
            const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyType = this.enemyTypes[randomType];
            
            // Determine spawn position
            const spawnY = Math.random() * (this.gameCanvas.height - enemyType.height);
            
            // Create enemy
            const enemy = {
                x: this.gameCanvas.width,
                y: spawnY,
                width: enemyType.width,
                height: enemyType.height,
                speed: enemyType.speed,
                health: enemyType.health,
                maxHealth: enemyType.health,
                damage: enemyType.damage,
                points: enemyType.points,
                type: randomType,
                color: enemyType.color
            };
            
            this.enemies.push(enemy);
        }
    }
    
    // Update game state
    update(timestamp, deltaTime) {
        // Spawn enemies
        this.spawnEnemy(timestamp);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update explosions
        this.updateExplosions(timestamp);
        
        // Check collisions
        this.checkCollisions();
        
        // Update combo
        this.updateCombo(timestamp);
        
        // Update UI
        this.updateUI();
    }
    
    // Update projectiles
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Update position based on type
            if (projectile.target && projectile.type === 'missile') {
                // Homing missile logic
                if (projectile.target) {
                    const targetX = projectile.target.x + projectile.target.width / 2;
                    const targetY = projectile.target.y + projectile.target.height / 2;
                    
                    const dx = targetX - projectile.x;
                    const dy = targetY - projectile.y;
                    const angle = Math.atan2(dy, dx);
                    
                    projectile.x += Math.cos(angle) * projectile.speed;
                    projectile.y += Math.sin(angle) * projectile.speed;
                } else {
                    // If target is gone, move straight
                    projectile.x += projectile.speed;
                }
            } else {
                // Regular projectile movement
                projectile.x += projectile.speed;
            }
            
            // Remove if out of bounds
            if (projectile.x > this.gameCanvas.width) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    // Update enemies
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update position
            enemy.x -= enemy.speed;
            
            // Remove if out of bounds
            if (enemy.x + enemy.width < 0) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    // Update explosions
    updateExplosions(timestamp) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            
            // Remove if duration expired
            if (timestamp - explosion.startTime >= explosion.duration) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    // Check collisions
    checkCollisions() {
        // Check projectile-enemy collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let hasHit = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // Skip if projectile has already hit and is not piercing
                if (hasHit && !projectile.isPiercing) continue;
                
                // Check collision
                if (this.checkCollision(projectile, enemy)) {
                    // Apply damage
                    this.damageEnemy(enemy, projectile.damage);
                    
                    hasHit = true;
                    
                    // Handle missile explosion
                    if (projectile.type === 'missile') {
                        this.createExplosion(projectile);
                        break; // Missile explodes on first hit
                    }
                }
            }
            
            // Remove projectile if it hit and is not piercing
            if (hasHit && !projectile.isPiercing) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Check bird-enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.checkCollision(this.bird, enemy)) {
                // Damage bird
                this.damageBird(enemy.damage);
                
                // Remove enemy
                this.enemies.splice(i, 1);
            }
        }
    }
    
    // Check collision between two objects
    checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    
    // Damage enemy
    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
            // Add points
            this.addPoints(enemy.points);
            
            // Increment combo
            this.incrementCombo();
            
            // Remove enemy
            const index = this.enemies.indexOf(enemy);
            if (index !== -1) {
                this.enemies.splice(index, 1);
            }
            
            // Create explosion
            this.createExplosion({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                width: enemy.width,
                height: enemy.height
            });
        }
    }
    
    // Damage bird
    damageBird(damage) {
        if (this.bird.health !== undefined) {
            this.bird.health -= damage;
            
            // Check if
(Content truncated due to size limit. Use line ranges to read in chunks)

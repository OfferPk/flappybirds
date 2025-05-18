// Weapons system for Flappy Bird combat
class WeaponsSystem {
    constructor(dataManager, gameStore) {
        this.dataManager = dataManager;
        this.gameStore = gameStore;
        this.currentWeapon = null;
        this.weapons = {
            ak47: {
                id: 'ak47',
                name: 'AK-47',
                damage: 7,
                fireRate: 200, // ms between shots
                range: 600,
                projectileSpeed: 15,
                projectileSize: 5,
                ammo: 100,
                maxAmmo: 100,
                cooldown: 0,
                lastFireTime: 0,
                icon: '🔫',
                sound: 'ak47-sound.mp3',
                autoFire: true
            },
            laser: {
                id: 'laser',
                name: 'Laser Beam',
                damage: 9,
                fireRate: 500, // ms between shots
                range: 800,
                projectileSpeed: 25,
                projectileSize: 3,
                ammo: 50,
                maxAmmo: 50,
                cooldown: 0,
                lastFireTime: 0,
                icon: '⚡',
                sound: 'laser-sound.mp3',
                autoFire: false,
                isPiercing: true
            },
            missile: {
                id: 'missile',
                name: 'Missile Launcher',
                damage: 10,
                fireRate: 2000, // ms between shots
                range: 1000,
                projectileSpeed: 8,
                projectileSize: 10,
                ammo: 20,
                maxAmmo: 20,
                cooldown: 0,
                lastFireTime: 0,
                icon: '🚀',
                sound: 'missile-sound.mp3',
                autoFire: false,
                isHoming: true,
                explosionRadius: 50
            },
            flame: {
                id: 'flame',
                name: 'Flame Thrower',
                damage: 8,
                fireRate: 50, // ms between shots
                range: 400,
                projectileSpeed: 12,
                projectileSize: 8,
                ammo: 200,
                maxAmmo: 200,
                cooldown: 0,
                lastFireTime: 0,
                icon: '🔥',
                sound: 'flame-sound.mp3',
                autoFire: true,
                isContinuous: true
            },
            electric: {
                id: 'electric',
                name: 'Electric Wings',
                damage: 6,
                fireRate: 1000, // ms between shots
                range: 150, // radius around bird
                projectileSpeed: 0, // instant effect
                projectileSize: 0, // no projectile
                ammo: 30,
                maxAmmo: 30,
                cooldown: 0,
                lastFireTime: 0,
                icon: '⚡',
                sound: 'electric-sound.mp3',
                autoFire: false,
                isAOE: true,
                effectDuration: 500 // ms
            }
        };
        
        // Projectiles array
        this.projectiles = [];
        
        // UI elements
        this.weaponDisplay = null;
        this.ammoDisplay = null;
        
        // Bind methods
        this.fireWeapon = this.fireWeapon.bind(this);
        this.updateProjectiles = this.updateProjectiles.bind(this);
        this.checkWeaponCollisions = this.checkWeaponCollisions.bind(this);
        this.handleEquippedWeaponChange = this.handleEquippedWeaponChange.bind(this);
        
        // Listen for equipped weapon changes
        document.addEventListener('store:item-equipped', this.handleEquippedWeaponChange);
    }
    
    // Initialize weapons system
    init(gameContainer) {
        // Create weapon UI
        this.createWeaponUI(gameContainer);
        
        // Load equipped weapon
        this.loadEquippedWeapon();
        
        console.log('Weapons system initialized');
    }
    
    // Create weapon UI
    createWeaponUI(gameContainer) {
        // Create weapon display if it doesn't exist
        if (!document.getElementById('weapon-display')) {
            const weaponUI = document.createElement('div');
            weaponUI.id = 'weapon-ui';
            weaponUI.className = 'weapon-ui';
            weaponUI.innerHTML = `
                <div id="weapon-display" class="weapon-display">
                    <span id="weapon-icon" class="weapon-icon">🔫</span>
                    <span id="weapon-name" class="weapon-name">No Weapon</span>
                </div>
                <div id="ammo-display" class="ammo-display">
                    <span id="ammo-current" class="ammo-current">0</span>
                    <span class="ammo-separator">/</span>
                    <span id="ammo-max" class="ammo-max">0</span>
                </div>
            `;
            
            gameContainer.appendChild(weaponUI);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .weapon-ui {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    z-index: 20;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
                }
                
                .weapon-display {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                
                .weapon-icon {
                    font-size: 24px;
                }
                
                .weapon-name {
                    color: white;
                    font-size: 16px;
                }
                
                .ammo-display {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: white;
                }
                
                .ammo-current {
                    font-weight: bold;
                }
                
                .ammo-max {
                    opacity: 0.7;
                }
                
                .ammo-separator {
                    opacity: 0.5;
                }
                
                .projectile {
                    position: absolute;
                    background-color: #FFF;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 15;
                }
                
                .projectile.ak47 {
                    background-color: #FFA500;
                }
                
                .projectile.laser {
                    background-color: #00FFFF;
                    box-shadow: 0 0 10px #00FFFF;
                }
                
                .projectile.missile {
                    background-color: #FF0000;
                }
                
                .projectile.flame {
                    background-color: #FF4500;
                    box-shadow: 0 0 5px #FF4500;
                }
                
                .electric-effect {
                    position: absolute;
                    border-radius: 50%;
                    border: 2px solid #00FFFF;
                    box-shadow: 0 0 20px #00FFFF;
                    pointer-events: none;
                    z-index: 15;
                    animation: pulse 0.5s ease-out;
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set UI element references
        this.weaponDisplay = document.getElementById('weapon-display');
        this.ammoDisplay = document.getElementById('ammo-display');
    }
    
    // Load equipped weapon
    loadEquippedWeapon() {
        const equippedWeapon = this.gameStore.getEquippedItem('weapon');
        if (equippedWeapon) {
            this.setCurrentWeapon(equippedWeapon.id);
        }
    }
    
    // Set current weapon
    setCurrentWeapon(weaponId) {
        if (!this.weapons[weaponId]) return;
        
        this.currentWeapon = this.weapons[weaponId];
        
        // Update UI
        this.updateWeaponUI();
        
        console.log(`Weapon set to ${this.currentWeapon.name}`);
    }
    
    // Update weapon UI
    updateWeaponUI() {
        if (!this.weaponDisplay || !this.ammoDisplay) return;
        
        if (this.currentWeapon) {
            // Update weapon display
            document.getElementById('weapon-icon').textContent = this.currentWeapon.icon;
            document.getElementById('weapon-name').textContent = this.currentWeapon.name;
            
            // Update ammo display
            document.getElementById('ammo-current').textContent = this.currentWeapon.ammo;
            document.getElementById('ammo-max').textContent = this.currentWeapon.maxAmmo;
            
            // Show UI
            this.weaponDisplay.style.display = 'flex';
            this.ammoDisplay.style.display = 'flex';
        } else {
            // Hide UI if no weapon
            this.weaponDisplay.style.display = 'none';
            this.ammoDisplay.style.display = 'none';
        }
    }
    
    // Fire weapon
    fireWeapon(bird, timestamp) {
        if (!this.currentWeapon) return;
        
        // Check cooldown
        if (timestamp - this.currentWeapon.lastFireTime < this.currentWeapon.fireRate) {
            return;
        }
        
        // Check ammo
        if (this.currentWeapon.ammo <= 0) {
            // Play empty sound
            console.log('Click! Out of ammo');
            return;
        }
        
        // Update last fire time
        this.currentWeapon.lastFireTime = timestamp;
        
        // Decrease ammo
        this.currentWeapon.ammo--;
        
        // Update UI
        this.updateWeaponUI();
        
        // Handle different weapon types
        switch (this.currentWeapon.id) {
            case 'ak47':
                this.createProjectile(bird, this.currentWeapon);
                break;
                
            case 'laser':
                this.createLaserBeam(bird, this.currentWeapon);
                break;
                
            case 'missile':
                this.createMissile(bird, this.currentWeapon);
                break;
                
            case 'flame':
                this.createFlame(bird, this.currentWeapon);
                break;
                
            case 'electric':
                this.createElectricEffect(bird, this.currentWeapon);
                break;
        }
        
        // Play sound
        console.log(`Fired ${this.currentWeapon.name}!`);
    }
    
    // Create projectile
    createProjectile(bird, weapon) {
        const projectile = {
            x: bird.x + bird.width,
            y: bird.y + bird.height / 2,
            size: weapon.projectileSize,
            speed: weapon.projectileSpeed,
            damage: weapon.damage,
            range: weapon.range,
            distanceTraveled: 0,
            type: weapon.id,
            isPiercing: weapon.isPiercing || false,
            isHoming: weapon.isHoming || false,
            isContinuous: weapon.isContinuous || false,
            target: null
        };
        
        this.projectiles.push(projectile);
        
        // Create projectile element
        const projectileElement = document.createElement('div');
        projectileElement.className = `projectile ${weapon.id}`;
        projectileElement.style.width = `${projectile.size}px`;
        projectileElement.style.height = `${projectile.size}px`;
        projectileElement.style.left = `${projectile.x}px`;
        projectileElement.style.top = `${projectile.y}px`;
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(projectileElement);
            projectile.element = projectileElement;
        }
    }
    
    // Create laser beam
    createLaserBeam(bird, weapon) {
        // Laser is a special type of projectile that travels instantly
        const laser = {
            x: bird.x + bird.width,
            y: bird.y + bird.height / 2,
            size: weapon.projectileSize,
            speed: weapon.projectileSpeed * 2, // Lasers are faster
            damage: weapon.damage,
            range: weapon.range,
            distanceTraveled: 0,
            type: weapon.id,
            isPiercing: true,
            isHoming: false,
            isContinuous: false,
            element: null
        };
        
        this.projectiles.push(laser);
        
        // Create laser element
        const laserElement = document.createElement('div');
        laserElement.className = `projectile ${weapon.id}`;
        laserElement.style.width = `${laser.range}px`; // Laser extends to full range
        laserElement.style.height = `${laser.size}px`;
        laserElement.style.left = `${laser.x}px`;
        laserElement.style.top = `${laser.y}px`;
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(laserElement);
            laser.element = laserElement;
        }
    }
    
    // Create missile
    createMissile(bird, weapon) {
        // Find nearest enemy
        const enemies = document.querySelectorAll('.enemy');
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const enemyRect = enemy.getBoundingClientRect();
            const enemyX = enemyRect.left + enemyRect.width / 2;
            const enemyY = enemyRect.top + enemyRect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(bird.x - enemyX, 2) + 
                Math.pow(bird.y - enemyY, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = {
                    element: enemy,
                    x: enemyX,
                    y: enemyY
                };
            }
        });
        
        // Create missile
        const missile = {
            x: bird.x + bird.width,
            y: bird.y + bird.height / 2,
            size: weapon.projectileSize,
            speed: weapon.projectileSpeed,
            damage: weapon.damage,
            range: weapon.range,
            distanceTraveled: 0,
            type: weapon.id,
            isPiercing: false,
            isHoming: true,
            isContinuous: false,
            target: nearestEnemy,
            explosionRadius: weapon.explosionRadius
        };
        
        this.projectiles.push(missile);
        
        // Create missile element
        const missileElement = document.createElement('div');
        missileElement.className = `projectile ${weapon.id}`;
        missileElement.style.width = `${missile.size}px`;
        missileElement.style.height = `${missile.size}px`;
        missileElement.style.left = `${missile.x}px`;
        missileElement.style.top = `${missile.y}px`;
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(missileElement);
            missile.
(Content truncated due to size limit. Use line ranges to read in chunks)

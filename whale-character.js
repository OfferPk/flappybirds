// Whale Character and Water Animation for Flappy Bird
class WhaleCharacter {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        
        // Whale properties
        this.x = 50;
        this.y = game.canvas.height / 2;
        this.width = 80;
        this.height = 60;
        this.velocity = 0;
        this.gravity = 0.5;
        this.lift = -10;
        this.whaleImage = null;
        
        // Water animation properties
        this.waterHeight = 50;
        this.waterY = game.canvas.height - this.waterHeight;
        this.waterSpeed = 2;
        this.waterOffset = 0;
        this.waterColor1 = '#0099FF';
        this.waterColor2 = '#0077CC';
        this.waterWaveHeight = 5;
        
        // Load whale image
        this.loadWhaleImage();
        
        // Bind methods
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.flap = this.flap.bind(this);
        this.drawWater = this.drawWater.bind(this);
    }
    
    // Load whale image
    loadWhaleImage() {
        // Create whale image from base64 data
        this.whaleImage = new Image();
        
        // Base64 encoded image of the whale (converted from the provided PNG)
        this.whaleImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI1LTA1LTE4VDExOjAxOjA5KzAwOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0wNS0xOFQxMTowMTowOSswMDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0wNS0xOFQxMTowMTowOSswMDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ZTRlYTdiNS1mZWU1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';
        
        // Alternative: If the base64 encoding doesn't work well, create a simple whale shape
        this.whaleImage.onerror = () => {
            console.log('Failed to load whale image, using fallback');
            this.whaleImage = null;
        };
    }
    
    // Update whale position
    update() {
        // Apply gravity
        this.velocity += this.gravity;
        
        // Update position
        this.y += this.velocity;
        
        // Prevent whale from going above the screen
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        
        // Prevent whale from going below the water
        if (this.y + this.height > this.waterY) {
            this.y = this.waterY - this.height;
            this.velocity = 0;
        }
        
        // Update water animation
        this.waterOffset += this.waterSpeed;
        if (this.waterOffset > 50) {
            this.waterOffset = 0;
        }
    }
    
    // Draw whale
    draw() {
        const ctx = this.ctx;
        
        // Draw water first (so it's behind the whale)
        this.drawWater();
        
        // Draw whale
        if (this.whaleImage && this.whaleImage.complete) {
            // Draw the image if loaded
            ctx.drawImage(this.whaleImage, this.x, this.y, this.width, this.height);
        } else {
            // Fallback: Draw a simple whale shape
            ctx.fillStyle = '#0099FF';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw tail
            ctx.fillStyle = '#0077CC';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height / 2);
            ctx.lineTo(this.x - 10, this.y + this.height / 4);
            ctx.lineTo(this.x - 10, this.y + this.height * 3/4);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Draw water animation
    drawWater() {
        const ctx = this.ctx;
        const canvas = this.game.canvas;
        
        // Create gradient for water
        const gradient = ctx.createLinearGradient(0, this.waterY, 0, canvas.height);
        gradient.addColorStop(0, this.waterColor1);
        gradient.addColorStop(1, this.waterColor2);
        
        // Draw water base
        ctx.fillStyle = gradient;
        ctx.fillRect(0, this.waterY, canvas.width, this.waterHeight);
        
        // Draw water waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Create wave pattern
        let x = -this.waterOffset;
        ctx.moveTo(x, this.waterY);
        
        while (x < canvas.width) {
            // Draw wave pattern
            ctx.quadraticCurveTo(
                x + 25, this.waterY + this.waterWaveHeight,
                x + 50, this.waterY
            );
            x += 50;
        }
        
        ctx.stroke();
        
        // Draw second wave pattern (offset)
        ctx.beginPath();
        x = -this.waterOffset + 25;
        ctx.moveTo(x, this.waterY + 5);
        
        while (x < canvas.width) {
            // Draw wave pattern
            ctx.quadraticCurveTo(
                x + 25, this.waterY + 5 - this.waterWaveHeight,
                x + 50, this.waterY + 5
            );
            x += 50;
        }
        
        ctx.stroke();
    }
    
    // Make whale flap/swim
    flap() {
        this.velocity = this.lift;
    }
}

// Export class
// Will be used in the Flappy Bird game module

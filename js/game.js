class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.colorScheme = new ColorScheme();
        this.gameState = 'menu';
        this.score = 0;
        this.highScore = 0;
        this.startTime = null;
        this.animationFrame = null;

        this.soundManager = new SoundManager();
// In the constructor
this.gamepad = null;
this.rtPressed = false;
this.xPressed = false;
this.yPressed = false;
this.startPressed = false;
this.slowModeActive = false;
this.originalSpeed = null;
this.debugMode = true;
this.restartButtons = Array.from({length: 16}, (_, i) => i); // All buttons
// Add event listeners for gamepad
window.addEventListener("gamepadconnected", (e) => {
    this.gamepad = e.gamepad;
});
window.addEventListener("gamepaddisconnected", (e) => {
    if (e.gamepad === this.gamepad) {
        this.gamepad = null;
    }
});
this.slowModeFactor = 0.5;
this.slowModeEffect = document.createElement('div');

// Add to constructor
this.initSlowModeEffect();

        this.setupSoundControls();

        this.setupEventListeners();
        this.resizeCanvas();

        // Remove theme button as it's no longer needed
        const themeButton = document.getElementById('themeButton');
        if (themeButton) {
            themeButton.remove();
        }
    }
    initSlowModeEffect() {
        this.slowModeEffect.style.position = 'fixed';
        this.slowModeEffect.style.top = '0';
        this.slowModeEffect.style.left = '0';
        this.slowModeEffect.style.width = '100%';
        this.slowModeEffect.style.height = '100%';
        this.slowModeEffect.style.pointerEvents = 'none';
        this.slowModeEffect.style.opacity = '0';
        this.slowModeEffect.style.background = 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)';
        this.slowModeEffect.style.transition = 'opacity 0.3s';
        document.body.appendChild(this.slowModeEffect);
    }
    
// Add these methods to the Game class
handleGamepadInput(gp) {
    // RT (Right Trigger) - Axis 5 (adjust if needed)
    if (gp.buttons[1]?.pressed && !this.bPressed) {
        this.bPressed = true;
        this.handleClick();
    } else if (!gp.buttons[1]?.pressed) {
        this.bPressed = false;
    }

    // X Button (Button 2)
    if (gp.buttons[2]?.pressed && !this.xPressed) {
        this.xPressed = true;
        this.changeColorScheme();
    } else if (!gp.buttons[2]?.pressed) {
        this.xPressed = false;
    }

    // Y Button (Button 3) - Slow Mode
    if (gp.buttons[3]?.pressed) {
        if (!this.slowModeActive) {
            this.originalSpeed = this.player.baseSpeed;
            this.player.baseSpeed *= this.slowModeFactor;
            this.slowModeActive = true;
            this.slowModeEffect.style.opacity = '1';
        }
    } else {
        if (this.slowModeActive) {
            this.player.baseSpeed = this.originalSpeed;
            this.slowModeActive = false;
            this.slowModeEffect.style.opacity = '0';
        }
    }
    if (this.debugMode) {
        console.group('Gamepad Input');
        console.log('Game state:', this.gameState);
        gp.buttons.forEach((btn, i) => {
            if (btn.pressed) console.log(`Button ${i} pressed`);
        });
        console.groupEnd();
    }

    // Universal restart handling for any configured button
    if (this.gameState === 'gameOver') {
        this.restartButtons.forEach(buttonIndex => {
            if (gp.buttons[buttonIndex]?.pressed && !this.startPressed) {
                this.logDebug('Restart triggered by button', buttonIndex);
                this.startPressed = true;
                this.startGame();
            }
        });
    }

     // Start Button (Button 9)
     if (gp.buttons[9]?.pressed && !this.startPressed) {
        this.startPressed = true;
        
        if (this.gameState === 'gameOver') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.togglePause();
        }
    } else if (!gp.buttons[9]?.pressed) {
        this.startPressed = false;
    }
}
logDebug(...messages) {
    if (this.debugMode) console.debug('[DEBUG]', ...messages);
}

changeColorScheme() {
    this.colorScheme.baseHue = (this.colorScheme.baseHue + 137.5) % 360;
    this.colorScheme.targetColors = {
        background: this.colorScheme.hslToHex(this.colorScheme.baseHue, 70, 85),
        trackColor: this.colorScheme.hslToHex((this.colorScheme.baseHue + 180) % 360, 60, 45),
        playerColor: this.colorScheme.hslToHex((this.colorScheme.baseHue + 120) % 360, 80, 60),
        particleColor: this.colorScheme.hslToHex((this.colorScheme.baseHue + 60) % 360, 90, 70),
    };
}

activateSlowMode() {
    if (this.slowModeActive) return;
    this.slowModeActive = true;
    const originalSpeed = this.player.baseSpeed;
    this.player.baseSpeed *= 0.5;
    setTimeout(() => {
        this.player.baseSpeed = originalSpeed;
        this.slowModeActive = false;
    }, 10000);
}

togglePause() {
    if (this.gameState === 'playing') {
        this.gameState = 'paused';
        cancelAnimationFrame(this.animationFrame);
        this.soundManager.pauseBackgroundMusic();
    } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.soundManager.resumeBackgroundMusic();
        this.animate();
    }
}

    setupSoundControls() {
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');

        // Set initial slider values
        musicSlider.value = this.soundManager.musicVolume;
        sfxSlider.value = this.soundManager.sfxVolume;

        // Add event listeners
        musicSlider.addEventListener('input', (e) => {
            this.soundManager.setMusicVolume(parseFloat(e.target.value));
        });

        sfxSlider.addEventListener('input', (e) => {
            this.soundManager.setSFXVolume(parseFloat(e.target.value));
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleClick() {
        if (this.gameState === 'playing') {
            this.soundManager.playClickSound();
            this.player?.changeDirection();
        }
    }

    startGame() {
        // Full game reset
        const baseShortSide = 100;
        const baseLongSide = 300;
        const N = 10;
        const initialSpeed = 4;
        this.logDebug('Attempting game start from state:', this.gameState);
    
    if (this.gameState === 'gameOver' || this.gameState === 'menu') {
        this.logDebug('Performing full game reset');
        // Add your full reset code here
        this.player = new Player(baseShortSide / 2, baseShortSide / 2, baseShortSide * 0.2, initialSpeed);
        this.track = new Track(0, 0, N, baseShortSide, baseLongSide);
        this.score = 0;
        this.startTime = Date.now();
        this.gameState = 'playing';
        this.colorScheme = new ColorScheme();
    }

    this.gameState = 'playing';
    this.logDebug('New game state:', this.gameState);
 
        
    
        // UI updates
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('scoreDisplay').style.display = 'block';
    
        // Sound
        this.soundManager.playBackgroundMusic();
        
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.animate();
    }

    endGame() {
        this.logDebug('Ending game, previous state:', this.gameState);
        this.gameState = 'gameOver';
        this.logDebug('New game state:', this.gameState);
        
    
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        // Stop background music
        this.soundManager.stopBackgroundMusic();

        // Update UI
        document.getElementById('scoreDisplay').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverHighScore').textContent = this.highScore;
        document.getElementById('menuHighScore').textContent = this.highScore;
    }

    animate() {
        if (this.gamepad) {
    const gp = navigator.getGamepads()[this.gamepad.index];
    if (gp) this.handleGamepadInput(gp);
}
        if (this.gameState !== 'playing') return;
// In the animate() method, add this at the beginning:

        const elapsedTime = Date.now() - this.startTime;
        this.player.move(elapsedTime);
        this.track.adjustFor(this.player);

        if (!this.track.contains(this.player)) {
            this.endGame();
            return;
        }

        this.score++;
        document.getElementById('currentScore').textContent = this.score;

        // Get current color scheme based on score
        const colors = this.colorScheme.generateScheme(this.score);

        // Apply background color
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        document.body.style.backgroundColor = colors.background;

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(-3 * Math.PI / 4);

        this.ctx.translate(-this.player.x, -this.player.y);

        // Draw track with dynamic color
        this.ctx.fillStyle = colors.trackColor;
        this.track.draw(this.ctx);

        // Draw player with dynamic colors
        this.player.draw(this.ctx, colors);

        this.ctx.restore();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};

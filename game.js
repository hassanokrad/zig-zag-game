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

        this.setupSoundControls();

        this.setupEventListeners();
        this.resizeCanvas();

        // Remove theme button as it's no longer needed
        const themeButton = document.getElementById('themeButton');
        if (themeButton) {
            themeButton.remove();
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
        const baseShortSide = 100;
        const baseLongSide = 300;
        const N = 10;
        const initialSpeed = 4;

        this.player = new Player(
            baseShortSide / 2,
            baseShortSide / 2,
            baseShortSide * 0.2,
            initialSpeed
        );

        this.track = new Track(0, 0, N, baseShortSide, baseLongSide);
        this.score = 0;
        this.startTime = Date.now();
        this.gameState = 'playing';

        // Reset color scheme
        this.colorScheme = new ColorScheme();

        // Update UI
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('scoreDisplay').style.display = 'block';

        // Play background music
        this.soundManager.playBackgroundMusic();

        this.animate();
    }

    endGame() {
        this.gameState = 'gameOver';

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
        if (this.gameState !== 'playing') return;

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

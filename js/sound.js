class SoundManager {
    constructor() {
        this.backgroundMusic = new Audio('assets/8bit-sample-69080.mp3');
        this.backgroundMusic.loop = true;
        this.clickSound = new Audio('assets/click-tone-2568.wav');

        // Set initial volumes from localStorage or default to 50%
        this.musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.5;
        this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 0.5;

        // Apply initial volumes
        this.backgroundMusic.volume = this.musicVolume;
        this.clickSound.volume = this.sfxVolume;
    }
// Add these methods
pauseBackgroundMusic() {
    this.backgroundMusic.pause();
}

resumeBackgroundMusic() {
    if (this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(() => { });
    }
}

    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.backgroundMusic.volume = volume;
        localStorage.setItem('musicVolume', volume);
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
        this.clickSound.volume = volume;
        localStorage.setItem('sfxVolume', volume);
    }

    playBackgroundMusic() {
        if (this.backgroundMusic.paused) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(() => { });
        }
        }

    stopBackgroundMusic() {
        this.backgroundMusic.pause();
    }

    playClickSound() {
        this.clickSound.currentTime = 0;
        this.clickSound.play().catch(() => { });
    }
}
class Track {
    constructor(left, top, num, baseShortSide, baseLongSide) {
        this.left = left;
        this.top = top;
        this.baseShortSide = baseShortSide;
        this.baseLongSide = baseLongSide;
        this.rectangles = [];
        this.index = 0;

        // Add difficulty parameters
        this.startTime = Date.now();
        this.initialEasyTime = 5000;
        this.difficultyRampUpTime = 60000;
        this.minWidthMultiplier = 0.7;

        while (this.index < num) {
            this.enqueueRectangle();
        }
    }

    getDifficultyMultiplier() {
        const elapsedTime = Date.now() - this.startTime;

        if (elapsedTime < this.initialEasyTime) {
            return 1.3;
        }

        const adjustedTime = elapsedTime - this.initialEasyTime;
        const difficultyProgress = Math.min(adjustedTime / this.difficultyRampUpTime, 1);

        const maxMultiplier = 1.3 - (0.6 * difficultyProgress);
        return maxMultiplier;
    }

    getRandomSize(baseSize) {
        const maxMultiplier = this.getDifficultyMultiplier();
        // Minimum size is always 70% of base size
        const minSize = baseSize * this.minWidthMultiplier;
        const maxSize = baseSize * maxMultiplier;
        return Math.random() * (maxSize - minSize) + minSize;
    }

    enqueueRectangle() {
        const shortSide = this.getRandomSize(this.baseShortSide);
        const longSide = this.getRandomSize(this.baseLongSide);

        if (this.index % 2 == 0) {
            const width = longSide;
            const height = shortSide;
            this.rectangles.push(new Rectangle(this.left, this.top, width, height));
            this.left += width - (shortSide / 2);  // Adjust overlap
        } else {
            const width = shortSide;
            const height = longSide;
            this.rectangles.push(new Rectangle(this.left, this.top, width, height));
            this.top += height - (shortSide / 2);  // Adjust overlap
        }
        this.index++;
    }

    // Rest of the original methods remain unchanged
    dequeueRectangle() {
        this.rectangles.shift();
    }

    adjustFor(player) {
        for (let i = 0; i < this.rectangles.length; i++) {
            const rect = this.rectangles[i];
            if (rect.contains(player)) {
                if (i > this.rectangles.length / 2) {
                    this.dequeueRectangle();
                    this.enqueueRectangle();
                    return;
                }
            }
        }
    }

    contains(player) {
        for (const rect of this.rectangles) {
            if (rect.contains(player)) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        for (const rect of this.rectangles) {
            rect.draw(ctx);
        }
    }
}
class Player {
    constructor(x, y, radius, initialSpeed = 2) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.direction = "right";
        this.speed = initialSpeed;
        this.baseSpeed = initialSpeed;
        this.particles = [];
    }

    move(elapsedTime) {
        // Increase speed over time
        this.speed = this.baseSpeed + (elapsedTime / 10000);

        if (this.direction == "right") {
            this.x += this.speed;
        } else {
            this.y += this.speed;
        }

        // Update particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;
            p.size *= 0.95;
        });
    }

    changeDirection() {
        this.direction = this.direction == "right" ? "down" : "right";
        // Add particles on direction change
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20,
                size: this.radius * 0.5
            });
        }
    }

    draw(ctx, theme) {
        // Draw particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = theme.particleColor;
            ctx.fill();
        });

        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme.playerColor;
        ctx.fill();
    }
}

class ColorScheme {
    constructor() {
        this.baseHue = Math.random() * 360;
        this.lastUpdate = 0;
        this.currentColors = {
            background: this.hslToHex(this.baseHue, 70, 85),
            trackColor: this.hslToHex((this.baseHue + 180) % 360, 60, 45),
            playerColor: this.hslToHex((this.baseHue + 120) % 360, 80, 60),
            particleColor: this.hslToHex((this.baseHue + 60) % 360, 90, 70),
        };
        this.targetColors = { ...this.currentColors };
    }

    // Convert HSL to RGB then to hex
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Helper function to interpolate between two hex colors
    lerpColor(start, end, t) {
        // Convert hex to RGB
        const startRGB = start.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
        const endRGB = end.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));

        // Interpolate each component
        const resultRGB = startRGB.map((start, i) => {
            const end = endRGB[i];
            return Math.round(start + (end - start) * t);
        });

        // Convert back to hex
        return (
            "#" +
            resultRGB
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    }
    
    // Generate a color scheme based on score
    generateScheme(score) {
        // Update target colors every 800 points
        if (Math.floor(score / 800) > this.lastUpdate) {
            this.baseHue = (this.baseHue + 137.5) % 360;
            this.lastUpdate = Math.floor(score / 500);

            const oscillation = Math.sin(score / 100) * 10;
            const currentHue = (this.baseHue + oscillation) % 360;
            const complement = (currentHue + 180) % 360;
            const triadic = (currentHue + 120) % 360;

            this.targetColors = {
                background: this.hslToHex(currentHue, 70, 85),
                trackColor: this.hslToHex(complement, 60, 45),
                playerColor: this.hslToHex(triadic, 80, 60),
                particleColor: this.hslToHex((currentHue + 60) % 360, 90, 70),
            };
        }

        // Interpolate between current and target colors
        const t = 0.05; // Adjust this value to control transition speed
        const colors = {};
        for (const key in this.currentColors) {
            colors[key] = this.lerpColor(
                this.currentColors[key],
                this.targetColors[key],
                t
            );
            this.currentColors[key] = colors[key];
        }

        return colors;
    }
}

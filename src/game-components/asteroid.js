
export class Asteroid {
    constructor(p5, size) {
        this.radius = this.asteroidInitialRadius(size);
        this.position = this.asteroidInitialPosition(p5);
        this.sides = Math.floor(Math.random() * 5) + 7;
        this.rotation = {
            angle: 0,
            velocity: Math.random() / 50,
        }
        this.velocity = {
            x: Math.random() - Math.random(),
            y: Math.random() - Math.random(),
        }
    }

    asteroidInitialPosition(p5) {
        // not to overlap with the ship's initial position
        return {
            x: p5.width * Math.random(),
            y: p5.height * Math.random(),
        }
    }

    asteroidInitialRadius(size) {
        return (
            size === 'big' ? Math.random() * 20 + 46
                : size === 'middle' ? Math.random() * 20 + 26
                    : size === 'small' ? Math.random() * 20 + 6
                        : null
        );
    }

    drawPolygon(p5, x, y, radius, npoints) {
        let angle = p5.TWO_PI / npoints;
        p5.beginShape();
        for (let a = 0; a < p5.TWO_PI; a += angle) {
            let sx = x + p5.cos(a) * radius;
            let sy = y + p5.sin(a) * radius;
            p5.vertex(sx, sy);
        }
        p5.endShape(p5.CLOSE);
    }

    calcRotation() {
        this.rotation.angle += this.rotation.velocity;
    }

    calcPosition(p5) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > p5.width) {
            this.position.x %= p5.width;
        }

        if (this.position.x < 0) {
            this.position.x += p5.width;
        }

        if (this.position.y > p5.height) {
            this.position.y %= p5.width;
        }

        if (this.position.y < 0) {
            this.position.y += p5.height;
        }
    }

    draw(p5) {
        this.calcRotation();
        this.calcPosition(p5);

        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(8);
        p5.stroke('lightgray');
        p5.fill('gray')
        this.drawPolygon(p5, 0, 0, this.radius, this.sides);
        p5.pop();
    }
}
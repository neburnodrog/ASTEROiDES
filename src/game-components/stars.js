
export class Stars {
    constructor(p5) {
        this.stars = new Array(1000).fill().map(() => new Star(p5));
    }

    draw(p5) {
        this.stars.map(star => star.draw(p5));
    }
}

class Star {
    constructor(p5) {
        this.position = {
            x: Math.random() * p5.width,
            y: Math.random() * p5.height,
        }
    }

    draw(p5) {
        p5.stroke('#AFE4FF');
        p5.strokeWeight(2);
        p5.point(this.position.x, this.position.y);
    }
}
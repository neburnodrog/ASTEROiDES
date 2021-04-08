
export class Star {
    constructor(p5) {
        this.position = {
            x: Math.random() * p5.width,
            y: Math.random() * p5.height,
        }
    }

    draw(p5) {
        p5.stroke('white');
        p5.strokeWeight(2);
        p5.point(this.position.x, this.position.y);
    }
}
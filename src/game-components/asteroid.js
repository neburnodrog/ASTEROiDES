
function asteroidInitialPosition(p5) {
    // not to overlap with the ship's initial position
    return {
        x: p5.windowWidth * Math.random(),
        y: p5.windowHeight * Math.random(),
    }
}

export class Asteroid {
    constructor(p5, image) {
        this.image = image;
        this.size = {
            x: 50,
            y: 50,
        }
        this.position = asteroidInitialPosition(p5);
    }

    draw(p5) {
        p5.image(this.image, this.position.x, this.position.y, this.size.x, this.size.y)
    }
}
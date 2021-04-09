import { Stars } from "./stars";

export class StartMenu {
    constructor(p5, level) {
        this.started = false;
        this.stars = new Stars(p5);
        this.level = level;
    }

    listenToStart(p5) {
        p5.keyPressed = () => {
            this.started = true;
        }
    }

    draw(p5) {
        p5.frameRate(1);
        p5.background(1, 5, 15);
        this.stars.draw(p5);
        p5.push()
        p5.textSize(42);
        p5.fill("#AFE4FF");
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.translate(p5.width / 2, p5.height / 2)
        p5.text('ASTEROIDS', 0, 0)
        p5.textSize(32);
        p5.text(`LEVEL: ${this.level}`, 0, 100);
        p5.text(`PRESS A BUTTON TO START`, 0, 200);

        this.listenToStart(p5);

        p5.pop();
    }
}
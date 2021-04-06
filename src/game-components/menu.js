export class Menu {
    constructor() {
        this.text = 'Press Start to begin the game';
    }

    draw(p5) {
        p5.textSize(42);
        p5.fill("#00ca8d");
        p5.translate(p5.width * 0.2, p5.height / 2)
        p5.text(this.text, 0, 0)
    }
}
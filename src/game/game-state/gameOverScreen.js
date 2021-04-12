import { Canvas } from '../../index'

export default class GameOverScreen {
    constructor(p5, game) {
        this.p5 = p5;
        this.game = game;
        this.textSize = 42;
        this.color = "#AFE4FF";
    }

    draw() {
        const p5 = this.p5;

        p5.push()

        p5.frameRate(20);

        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.translate(p5.width / 2, p5.height / 2);

        p5.textSize(this.textSize);
        p5.fill(this.color);

        p5.text('GAME OVER', 0, 0)
        p5.text(`SCORE: ${this.game.score.value}`, 0, 100);
        p5.text('PRESS SPACE TO PLAY AGAIN', 0, 200)

        p5.pop();

        p5.keyPressed = () => {
            if (p5.keyCode === 32 || p5.keyCode === 13) {
                Canvas.resetSketch(false, 1);
            }
        }
    }
}
export class GameOver {
    constructor(score) {
        this.score = score;
    }

    draw(p5) {
        p5.background(80, 0, 0, 5);
        p5.push()
        p5.textSize(42);
        p5.fill("#AFE4FF");
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.translate(p5.width / 2, p5.height / 2)
        p5.text('GAME OVER', 0, 0)
        p5.text(`SCORE: ${this.score}`, 0, 100);
        p5.pop();
    }
}
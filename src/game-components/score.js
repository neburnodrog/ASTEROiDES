
export default class Score {
    constructor(score) {
        this.value = score;
    }

    draw(p5) {
        p5.textSize(24);
        p5.fill("#00ca8d");
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.text(this.value, 100, 20);
    }
}
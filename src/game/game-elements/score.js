
export default class Score {
    constructor(p5) {
        this.p5 = p5
        this.value = 0;
    }

    draw() {
        const p5 = this.p5;

        p5.push()
        p5.textSize(24);
        p5.fill("#00ca8d");
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.text(this.value, 100, 12);
        p5.pop()
    }
}
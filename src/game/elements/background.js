import Stars from './stars';

export default class Background {
    constructor(p5) {
        this.p5 = p5;

        this.colorRGB = [1, 5, 15];
        this.stars = new Stars(p5);
    }

    draw() {
        //first and only clear()
        this.p5.clear();

        //drawing background
        this.p5.background(...this.colorRGB);
        this.stars.draw();
    }
}
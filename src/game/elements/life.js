
export default class Life {
    constructor(p5, image) {
        this.p5 = p5;
        this.image = image;
    }

    draw(pos) {
        this.p5.image(this.image, pos * 20, 15, 20, 20);
    }
}
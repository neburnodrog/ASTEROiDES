import p5 from "p5";

export class Life {
    constructor(image) {
        this.image = image;
    }

    draw(p5, pos) {
        p5.image(this.image, pos * 20, 15, 20, 20);
    }
}
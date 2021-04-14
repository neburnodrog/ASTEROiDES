import { randomInteger } from "../helpers";


export default class ShipDebris {
    constructor(p5, ship) {
        this.p5 = p5;
        this.ship = ship;
        this.color = {
            fill: '#ff01f1',
            stroke: '#ff0062',
        };
        this.sides = 3;
        this.radius = 3;
    }

    draw() {
        const p5 = this.p5;

        p5.push();

        p5.stroke(this.color.fill);
        p5.fill(this.color.stroke);
        drawPolygon(p5, 0, 0, this.radius, this.sides);

        p5.pop();
    }
}
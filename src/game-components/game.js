import { Ship } from './ship';
import { Menu } from './menu';

export class Game {
    constructor() {
        this.started = true;
        this.ship = new Ship();
        this.menu = new Menu();
    }

    setup(shipImage) {
        this.ship.image = shipImage;
    }

    draw(p5) {
        if (this.started) {
            this.ship.draw(p5);
        } else {
            this.menu.draw(p5)
        }
    }
}
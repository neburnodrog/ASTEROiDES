import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import ship from './images/ship3.png';


let game;
let shipImage;

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        shipImage = p5.loadImage(ship);
    }

    p5.setup = () => {
        p5.createCanvas(1200, 800);
        p5.imageMode(p5.CENTER)

        p5.frameRate(30);
        game = new Game();
        game.setup(p5, shipImage);

    }

    p5.draw = () => {
        p5.clear();
        p5.background(0, 0, 0)
        game.draw(p5);
    }

});

import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import background from './images/space2.jpg';
import ship from './images/ship.png';

const container = document.querySelector('.container');
let game;
let bgImage;
let shipImage;

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        bgImage = p5.loadImage(background);
        shipImage = p5.loadImage(ship)
    }

    p5.setup = () => {
        p5.createCanvas(800, 800);
        p5.frameRate(1);
        game = new Game();
        game.setup(shipImage);
    }

    p5.draw = () => {
        p5.clear();
        p5.imageMode(p5.CORNER)
        p5.background(bgImage);
        p5.imageMode(p5.CENTER)
        game.draw(p5);
    }

}, container);

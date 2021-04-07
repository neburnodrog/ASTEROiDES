import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import background from './images/space3.jpg';
import ship from './images/ship.png';
import ast1 from "./images/asteroids/ast1.png";
import ast2 from "./images/asteroids/ast2.png";
import ast3 from "./images/asteroids/ast3.png";
import ast4 from "./images/asteroids/ast4.png";
import ast5 from "./images/asteroids/ast5.png";
import ast6 from "./images/asteroids/ast6.png";
import ast7 from "./images/asteroids/ast7.png";
import ast8 from "./images/asteroids/ast8.png";
import ast9 from "./images/asteroids/ast9.png";

let game;
let bgImage;
let shipImage;
let asteroidImage;
// const asteroidsImagesArray = [ast1, ast2, ast3, ast4, ast5, ast6, ast7, ast8, ast9];

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        bgImage = p5.loadImage(background);
        shipImage = p5.loadImage(ship);
        asteroidImage = p5.loadImage(ast1);
        // asteroidsImagesArray.forEach(path => p5.loadImage(path));
    }

    p5.setup = () => {
        p5.createCanvas(0.9 * p5.windowWidth, 0.9 * p5.windowHeight);
        p5.frameRate(60);
        game = new Game();
        game.setup(p5, shipImage, asteroidImage);
    }

    p5.draw = () => {
        p5.clear();
        p5.imageMode(p5.CORNER)
        p5.background(bgImage);
        p5.imageMode(p5.CENTER)
        game.draw(p5);
    }

    p5.windowResized = () => {
        p5.resizeCanvas(0.9 * p5.windowWidth, 0.9 * p5.windowHeight);
    }

});

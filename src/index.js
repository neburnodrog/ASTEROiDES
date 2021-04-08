import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import { GameOver } from './game-components/gameover';
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';

let game;
let ship;
let heart;
const container = document.querySelector('.container');

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    const resetSketch = (p5, started = false) => {
        game = new Game(started);
        game.setup(p5, ship, heart);
    }

    p5.setup = () => {
        p5.createCanvas(1200, 800);
        p5.imageMode(p5.CENTER)
        resetSketch(p5);
    }

    p5.draw = () => {
        if (game.started === false) {
            p5.frameRate(1);
            p5.background(1, 5, 15);
            game.stars.forEach(star => star.draw(p5));

        } else if (game.gameover) {
            game.gameoverScreen = new GameOver(game.score.value);
            game.gameoverScreen.draw(p5);

        } else {
            p5.frameRate(60)
            p5.clear();
            p5.background(1, 5, 15)
            game.draw(p5);
        }
    }

    const navLeft = document.querySelector(".nav-left");
    navLeft.addEventListener("click", () => {
        resetSketch(p5, true);
    })
}, container);


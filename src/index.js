import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import { GameOver } from './game-components/gameover';
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';

let game;
let ship;
let heart;

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    p5.setup = () => {
        p5.createCanvas(1200, 800);
        p5.imageMode(p5.CENTER)

        p5.frameRate(50);
        game = new Game();
        game.setup(p5, ship, heart);
    }

    p5.draw = () => {
        if (game.started === false) {
            p5.background(1, 5, 15);
            game.stars.forEach(star => star.draw(p5));
            game.menu.draw(p5);

        } else if (game.gameover) {
            game.gameoverScreen = new GameOver(game.score.value);
            game.gameoverScreen.draw(p5);

        } else {
            p5.clear();
            p5.background(1, 5, 15)
            game.draw(p5);
        }
    }

    p5.keyPressed = () => {
        if (p5.keyCode === 32 && game.gameover) {
            game = new Game();
            game.setup(p5, ship, heart)
        }

        if (p5.keyCode === 32 && game.started === false) {
            game.started = true;
        }
    }

    p5.mousePressed = () => {
        if (game.started === false) {
            game.started = true;
        }

        if (game.gameover) {
            game = new Game();
            game.setup(p5, ship, heart)
        }
    }
});

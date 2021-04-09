import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import { GameOver } from './game-components/gameover';
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';
import { StartMenu } from './game-components/startmenu';

let startmenu;
let game;
let ship;
let heart;
const container = document.querySelector('.container');

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    const resetSketch = (p5, level) => {
        game = new Game(p5, level);
        game.setup(p5, ship, heart);
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight);
        p5.imageMode(p5.CENTER)
        resetSketch(p5, 1);
        startmenu = new StartMenu(p5, game.level);
    }

    p5.draw = () => {
        if (startmenu.started === false) {
            startmenu.draw(p5)

        } else if (game.gameover) {
            game.gameoverScreen = new GameOver(game.score.value);
            p5.frameRate(1);
            game.gameoverScreen.draw(p5);

        } else {
            p5.frameRate(60)
            p5.clear();
            p5.background(1, 5, 15)
            game.draw(p5);

            if (game.lvlCompleted) {
                const oldGame = game;
                game = new Game(p5, oldGame.level + 1, oldGame.score)
                game.setup(p5, ship, heart);
                startmenu = new StartMenu(p5, game.level);
            }
        }
    }

    const navLeft = document.querySelector("#new-game");
    navLeft.addEventListener("click", () => {
        startmenu.started = true;
        resetSketch(p5, 1);
    })
}, container);

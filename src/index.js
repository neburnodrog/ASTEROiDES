import './css/index.css';
import p5 from 'p5';
import { Game } from './game-components/game';
import { GameOver } from './game-state/gameover';
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';
import { StartMenu, LevelScreen } from './game-state/startmenu';
import Background from 'background';

let background;
let startmenu;
let game;
let ship;
let heart;

export const Canvas = new p5((p5) => {
    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    const resetSketch = (p5, level) => {
        game = new Game(p5, level);
        game.setup(ship, heart);
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight);
        background = new Background(p5);
        p5.imageMode(p5.CENTER)
        resetSketch(p5, 1);
        startmenu = new StartMenu(game.level);
    }

    p5.draw = () => {
        background.draw();

        if (startmenu.started === false) {
            startmenu.draw(p5)

        } else if (game.gameover) {
            game.gameoverScreen = new GameOver(game.score.value);
            p5.frameRate(1);
            game.gameoverScreen.draw(p5);
            p5.keyPressed = () => {
                if (p5.keyCode === 32 || p5.keyCode == 13) {
                    resetSketch(p5, 1);
                    startmenu = new StartMenu(game.level);
                }
            }

        } else {
            p5.frameRate(60)
            game.draw(p5)

            if (game.lvlCompleted) {
                const newGame = new Game(p5, game.level + 1, game.score.value)
                newGame.setup(p5, ship, heart);
                const levelScreen = new LevelScreen(p5, newGame.level);
                levelScreen.draw(p5);

                if (levelScreen.started) {
                    game = newGame;
                }
            }
        }
    }
});

window.onkeydown = function (e) {
    return !(e.keyCode == 32 && e.target == document.body);
};

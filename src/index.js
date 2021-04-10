import p5 from 'p5';
import './css/index.css';

// IMAGES
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';

// GAME STATE COMPONENTS
import { StartMenuScreen, LevelUpScreen } from './game/game-state/startMenuScreen';
import { GameOverScreen } from './game/game-state/gameOverScreen';

// GAME COMPONENTS
import Background from 'background';
import { Game } from './game/game';

// global variables
let background;
let startmenu;
let game;
let ship;
let heart;

// p5 SKETCH
export const Canvas = new p5((p5) => {
    const resetSketch = (p5) => {
        game = new Game(p5);
        game.setup(ship, heart);
    }

    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight);
        p5.imageMode(p5.CENTER);

        background = new Background(p5);
        resetSketch(p5);
    }

    p5.draw = () => {
        background.draw();

        if (startmenu.started === false) {
            startmenu.draw(p5)

        } else if (game.gameover) {
            game.gameoverScreen = new GameOverScreen(game.score.value);
            p5.frameRate(1);
            game.gameoverScreen.draw(p5);
            p5.keyPressed = () => {
                if (p5.keyCode === 32 || p5.keyCode == 13) {
                    resetSketch(p5, 1);
                    startmenu = new StartMenuScreen(game.level);
                }
            }

        } else {
            p5.frameRate(60)
            game.draw(p5)

            if (game.lvlCompleted) {
                const newGame = new Game(p5, game.level + 1, game.score.value)
                newGame.setup(p5, ship, heart);
                const levelScreen = new LevelUpScreen(p5, newGame.level);
                levelScreen.draw(p5);

                if (levelScreen.started) {
                    game = newGame;
                }
            }
        }
    }
});

window.onkeydown = function (e) {
    if (e.keyCode == 32 && e.target == document.body) e.preventDefault();
};

window.onkeydown = function (e) {
    if (e.keyCode == 37 && e.target == document.body) e.preventDefault();
};

window.onkeydown = function (e) {
    if (e.keyCode == 38 && e.target == document.body) e.preventDefault();
};

window.onkeydown = function (e) {
    if (e.keyCode == 39 && e.target == document.body) e.preventDefault();
};

window.onkeydown = function (e) {
    if (e.keyCode == 40 && e.target == document.body) e.preventDefault();
};

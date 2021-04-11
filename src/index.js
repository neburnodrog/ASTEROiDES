import p5 from 'p5';
import './css/index.css';

// IMAGES
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';

// GAME STATE COMPONENTS
import { LevelUpScreen } from './game/game-state/startMenuScreen';

// GAME COMPONENTS
import Background from './game/game-elements/background';
import Game from './game/game';
import { spaceOrEnterPressed, findOutHeight, findOutWidth } from './game/helpers';

// global variables
let background;
let game;
let ship;
let heart;
let score;

// p5 SKETCH
export const Canvas = new p5((p5) => {
    const resetSketch = (score, started, level) => {
        game = new Game(p5, started, level);
        score = score || new Score(p5);
        game.setup(ship, heart, score);
    }

    p5.preload = () => {
        ship = p5.loadImage(shipImage);
        heart = p5.loadImage(heartImage);
    }

    p5.setup = () => {
        p5.createCanvas(findOutWidth(), findOutHeight());
        p5.imageMode(p5.CENTER);
        background = new Background(p5);
        resetSketch();
    }

    p5.draw = () => {
        background.draw();
        game.draw();

        // handling STATE CHANGES
        if (game.gameover && spaceOrEnterPressed(p5)) resetSketch(p5, game.score);

        if (game.levelCompleted) {
            const newGame = new Game(p5, game.level + 1, game.score.value)
            newGame.setup(p5, ship, heart);
            const levelScreen = new LevelUpScreen(p5, newGame.level);
            levelScreen.draw(p5);
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(findOutWidth(), findOutHeight());
    };

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

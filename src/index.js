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
import Score from './game/game-elements/score';
import { findOutHeight, findOutWidth } from './game/helpers';

// global variables
let background;
let game;
let ship;
let heart;
let score;

// p5 SKETCH
export const Canvas = new p5((p5) => {
    const resetSketch = (started, level, oldScore) => {
        game = new Game(p5, started, level);
        score = oldScore || new Score(p5);
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
        resetSketch(false, 1);
    }

    p5.draw = () => {
        background.draw();
        game.draw();
        if (game.gameOver) {
            p5.keyPressed = () => {
                if (p5.keyCode === 32 || p5.keyCode === 13) {
                    resetSketch(false, 1);
                }
            }
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(findOutWidth(), findOutHeight());
        background = new Background(p5);
    };

});


window.top.document.onkeydown = function (evt) {
    evt = evt || window.event;
    var keyCode = evt.keyCode;
    if (keyCode >= 37 && keyCode <= 40 || keyCode === 32) {
        return false;
    }
};

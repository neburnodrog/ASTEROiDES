import p5 from 'p5';
import './css/index.css';

// FONTS
import font from './font/SpaceQuest-yOY3.ttf'

// IMAGES
import shipImage from './images/ship.png';
import heartImage from './images/heart.png';
import './images/favicon.ico';

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
let spaceQuest;

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
        spaceQuest = p5.loadFont(font);
    }

    p5.setup = () => {
        p5.createCanvas(findOutWidth(), findOutHeight());
        p5.imageMode(p5.CENTER);
        background = new Background(p5);
        resetSketch(false, 1);
        p5.textFont(spaceQuest);
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

        let fps = p5.frameRate();
        p5.fill(255);
        p5.stroke(0);
        p5.text("FPS: " + fps.toFixed(2), 10, p5.height - 10);
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

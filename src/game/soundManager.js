import shipShoot from "../sounds/shoot.wav";
import shipExplosion from "../sounds/explosion.wav";
import asteroidBreakS from "../sounds/bang_05.ogg";
import asteroidBreakM from "../sounds/bang_08.ogg";
import asteroidBreakL from "../sounds/bang_03.ogg";

export default class SoundManager {
  constructor(p5) {
    this.p5 = p5;
    this.sounds = {};
    this.reverb = new p5.constructor.Reverb();
  }

  preload() {
    this.sounds["shoot"] = this.p5.loadSound(shipShoot);
    this.sounds["shipExplosion"] = this.p5.loadSound(shipExplosion);
    this.sounds.asteroidBreakS = this.p5.loadSound(asteroidBreakS);
    this.sounds.asteroidBreakM = this.p5.loadSound(asteroidBreakM);
    this.sounds.asteroidBreakL = this.p5.loadSound(asteroidBreakL);
    // this.sounds.shipThrust = this.p5.loadSound("assets/sounds/thrust.wav");
    // this.sounds["gameOver"] = this.p5.loadSound("assets/sounds/gameOver.mp3");
    // this.sounds["levelUp"] = this.p5.loadSound("assets/sounds/levelUp.mp3");
    // this.sounds["life"] = this.p5.loadSound("assets/sounds/life.mp3");
    // this.sounds["background"] = this.p5.loadSound(
    //   "assets/sounds/background.mp3"
    // );
  }

  addReverb() {
    // add to explosion and break sounds
    this.reverb.process(this.sounds["shipExplosion"], 2, 2);
    this.reverb.process(this.sounds["asteroidBreakS"], 2, 2);
    this.reverb.process(this.sounds["asteroidBreakM"], 2, 2);
    this.reverb.process(this.sounds["asteroidBreakL"], 2, 2);
  }

  play(sound) {
    this.sounds[sound].play();
  }

  stop(sound) {
    this.sounds[sound].stop();
  }
}

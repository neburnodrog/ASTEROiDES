export default class GameState {
  constructor({ started = false, respawnDelayMs = 3000 } = {}) {
    this.current = started ? "playing" : "menu";
    this.wantsRebuild = false;
    this.rebuildArgs = null;
    this.respawnDelayMs = respawnDelayMs;
    this._timer = null;
  }

  startPlaying() {
    if (this.current === "menu") this.current = "playing";
  }

  shipDied({ wasFinalDeath, level, score, lifes }) {
    if (this.current !== "playing") return;
    if (wasFinalDeath) {
      this.current = "gameOver";
    } else {
      this.current = "dying";
      this._timer = setTimeout(() => {
        this.rebuildArgs = [true, level, score, lifes];
        this.wantsRebuild = true;
      }, this.respawnDelayMs);
    }
  }

  levelCleared() {
    if (this.current === "playing") this.current = "levelComplete";
  }

  acknowledgeLevelUp({ level, score, lifes }) {
    if (this.current !== "levelComplete") return;
    this.rebuildArgs = [true, level, score, lifes];
    this.wantsRebuild = true;
  }

  acknowledgeGameOver() {
    if (this.current !== "gameOver") return;
    this.rebuildArgs = [false, 1, null, null];
    this.wantsRebuild = true;
  }

  isPlaying() {
    return this.current === "playing";
  }

  isDying() {
    return this.current === "dying";
  }
}

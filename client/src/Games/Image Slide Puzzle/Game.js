import GameBody from "./GameBody.js";
import MouseListener from "./MouseListener.js";
import TouchListener from "./TouchListener.js";

export default class GameManager {
  constructor({ ctx, canvas, gameImage, gameWidth, gameHeight }) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameImage = gameImage;
    this.GameBody = new GameBody(this);
    this.touchListener = new TouchListener(this);
    this.mouseListener = new MouseListener(this);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.GameBody.animate();
    if (this.Tiles) this.Tiles.animate();
  }
}

import { detectCollision } from "./detectCollision.js";

export default class Paddle {
  constructor(game, positionx) {
    this.gameWidth = game.gameWidth;
    this.width = this.gameWidth > 480 ? 120 : this.gameWidth / 4;
    this.height = 10;
    this.game = game;
    this.speed = -4;
    this.position = {
      x: positionx,
      y: game.gameHeight,
    };
  }
  draw(ctx) {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.position.y += this.speed;
    if (!detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = 2;
    } else {
      this.game.ball.speed.y = 0;
      this.game.ball.position.y = this.position.y - this.game.ball.height;
    }
    if (this.position.y + this.height < 0) {
      this.markedForDeletion = true;
    }
  }
}

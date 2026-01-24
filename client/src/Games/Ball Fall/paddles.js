import { detectCollision } from "./detectCollision.js";

export default class Paddle {
  constructor(game, positionx, paddleType) {
    this.gameWidth = game.gameWidth;
    this.width = this.gameWidth > 480 ? 120 : this.gameWidth / 4;
    this.height = 10;
    this.game = game;
    this.speed = -4;
    this.position = {
      x: positionx,
      y: game.gameHeight,
    };
    this.paddleType = paddleType;
  }
  draw(ctx) {
    ctx.fillStyle = this.paddleType === "normal" ? "#0ff" : "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.position.y += this.speed;
    if (!detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = 2;
    } else {
      if (this.paddleType === "normal") {
        this.game.ball.speed.y = 0;
        this.game.ball.position.y = this.position.y - this.game.ball.size;
      } else {
        this.game.lives -= 1;
        document.getElementById("lives").innerText = this.game.lives;
        this.game.ball.reset();
        this.game.gamestate = 5;
      }
    }
    if (this.position.y + this.height < 0) {
      this.markedForDeletion = true;
    }
  }
}

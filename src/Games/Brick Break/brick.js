import { detectCollision } from "./collisionDetection.js";

export default class Brick {
  constructor(game, position, width) {
    this.image = new Image();
    this.image.src = "/assets/BrickBreak/bricksx64.png";
    this.position = position;
    this.width = width;
    this.height = 24;
    this.game = game;

    this.markedForDeletion = false;
  }
  update() {
    if (detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = -this.game.ball.speed.y;
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

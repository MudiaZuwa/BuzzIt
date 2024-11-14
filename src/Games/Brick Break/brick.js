import { detectCollision } from "./collisionDetection.js";

export default class Brick {
  constructor(game, brickIndex, rowIndex) {
    this.image = new Image();
    this.image.src = "/assets/BrickBreak/bricksx64.png";
    this.game = game;
    this.width = this.game.gameWidth / 12;
    this.height = this.game.gameHeight / 30;
    this.brickIndex = brickIndex;
    this.rowIndex = rowIndex;
    this.getPosition();

    this.markedForDeletion = false;
  }
  update() {
    this.height = this.game.gameHeight / 30;
    this.width = this.game.gameWidth / 12;
    this.getPosition();

    if (detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = -this.game.ball.speed.y;
      this.markedForDeletion = true;
    }
  }

  getPosition() {
    this.position = {
      x: this.width * this.brickIndex,
      y: this.game.gameHeight / 10 + this.height * this.rowIndex,
    };
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

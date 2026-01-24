import { detectCollision } from "./collisionDetection.js";

export default class Ball {
  constructor(game) {
    this.image = new Image();
    this.image.src = "/assets/BrickBreak/PngItem_2373133.png";
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.size = this.gameHeight * 0.03;
    this.game = game;
    this.reset();
  }

  reset() {
    this.position = {
      x:
        this.game.paddle.position.x +
        this.game.paddle.width / 2 -
        this.size / 2,
      y: this.game.gameHeight - this.size - this.game.paddle.height - 10,
    };
    this.speed = { x: 0, y: 0 };
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size,
      this.size
    );
  }

  update(deltaTime) {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
    this.size = this.game.gameHeight * 0.03;

    //wall on left or right
    if (
      this.position.x + this.size > this.game.gameWidth ||
      this.position.x < 0
    ) {
      this.speed.x = -this.speed.x;
    }

    //wall on top
    if (this.position.y < 0) {
      this.speed.y = -this.speed.y;
    }
    //wall on bottom{
    if (this.position.y + this.size > this.game.gameHeight) {
      this.game.lives--;
      document.getElementById("lives").innerText = this.game.lives;
      this.reset();
      this.game.gamestate = 5;
    }

    //check collision with paddle
    let bottomofBall = this.position.y + this.size;
    let topofPaddle = this.game.paddle.position.y;
    let leftsideofPaddle = this.game.paddle.position.x;
    let rightSideofPaddle =
      this.game.paddle.position.x + this.game.paddle.width;

    if (detectCollision(this, this.game.paddle)) {
      this.speed.y = -this.speed.y;
      this.position.y = this.game.paddle.position.y - this.size;
    }
  }
}

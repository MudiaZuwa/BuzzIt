import { detectCollision } from "./detectCollision.js";

export default class extraHealth {
  constructor(game, positionX) {
    const healthImage = new Image();
    healthImage.src = "/assets/BallFall/pngwing.com.png";
    this.image = healthImage;
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.height = this.gameHeight * 0.03;
    this.width = this.gameWidth * 0.03;
    this.game = game;
    this.speed = -4;
    this.position = {
      x: positionX,
      y: game.gameHeight - this.height,
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

  update(deltaTime) {
    this.position.y += this.speed;

    if (detectCollision(this.game.ball, this)) {
      if (this.game.lives < 5) {
        this.markedForDeletion = true;
        this.game.lives += 1;
        document.getElementById("lives").innerText = this.game.lives;
      }
    }
    if (this.position.y + this.height < 0) {
      this.markedForDeletion = true;
    }
  }
}

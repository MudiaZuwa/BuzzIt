export default class Ball {
  constructor(game) {
    const ballImage = new Image();
    ballImage.src = "/assets/BallFall/PngItem_2373133.png";
    this.image = ballImage;
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.height = this.gameHeight * 0.03;
    this.width = this.gameWidth * 0.03;
    this.game = game;
    this.maxSpeed = 10;
    this.reset();
  }

  reset() {
    this.position = {
      x: this.gameWidth / 2 - this.width / 2,
      y: this.gameHeight / 2 - this.height / 2,
    };
    this.speed = { x: 0, y: 0 };
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

  moveLeft() {
    this.speed.x = -this.maxSpeed;
  }

  moveRight() {
    this.speed.x = this.maxSpeed;
  }

  stop() {
    this.speed.x = 0;
  }

  update(deltaTime) {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
    //wall on top
    if (this.position.y < 0) {
      this.game.lives -= 1;
      document.getElementById("lives").innerText = this.game.lives;
      this.reset();
      this.game.gamestate = 5;
    }
    //wall on bottom{
    if (this.position.y + this.height > this.gameHeight) {
      this.game.lives -= 1;
      document.getElementById("lives").innerText = this.game.lives;
      this.reset();
      this.game.gamestate = 5;
    }
    if (this.position.x < 0) this.position.x = 0;

    if (this.position.x + this.width > this.gameWidth)
      this.position.x = this.gameWidth - this.width;
  }
}

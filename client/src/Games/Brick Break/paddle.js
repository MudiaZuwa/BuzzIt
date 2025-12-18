export default class Paddle {
  constructor(game) {
    this.game = game;
    this.width = this.game.gameWidth / 7;
    this.height = this.game.gameHeight / 36;

    this.maxSpeed = !game.isMobile ? 10 : 5;
    this.speed = 0;
    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10,
    };
  }

  moveLeft() {
    this.speed = -this.maxSpeed;
  }
  moveRight() {
    this.speed = this.maxSpeed;
  }
  draw(ctx) {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  stop() {
    this.speed = 0;
  }

  update(deltaTime) {
    this.position.x += this.speed;
    this.width = this.game.gameWidth / 7;
    this.height = this.game.gameHeight / 36;
    if (this.game.gamestate === 5) {
      this.game.ball.position.x =
        this.position.x + this.width / 2 - this.game.ball.size / 2;
    }
    if (this.position.x < 0) this.position.x = 0;

    if (this.position.x + this.width > this.game.gameWidth)
      this.position.x = this.game.gameWidth - this.width;
  }
}

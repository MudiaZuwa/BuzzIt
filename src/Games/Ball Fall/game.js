import PadHandler from "./gamepad.js";
import Ball from "./ball.js";
import { buildPaddle } from "./RandomPaddle.js";
import InputHandler from "./input.js";
import TouchHandler from "./touch.js";

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4,
  STARTED: 5,
  PAUSE: 6,
};

export default class Game {
  constructor(GAMEWIDTH, GAMEHEIGHT) {
    this.gameWidth = GAMEWIDTH;
    this.gameHeight = GAMEHEIGHT;
    this.gamestate = GAMESTATE.MENU;
    this.ball = new Ball(this);
    this.lives = 3;
    this.gameObjects = [];
    this.newPaddle = 0;
    this.paddles = [];
    this.extraHealths = [];
    this.score = 0;
    this.gamepad = new PadHandler(this, this.ball);
    new InputHandler(this, this.ball);
    new TouchHandler(this, this.ball);
  }
  start() {
    if (
      this.gamestate !== GAMESTATE.MENU &&
      this.gamestate !== GAMESTATE.NEWLEVEL &&
      this.gamestate !== GAMESTATE.GAMEOVER
    )
      return;
    if (this.gamestate === GAMESTATE.GAMEOVER) this.lives = 3;
    document.getElementById("lives").innerText = this.lives;
    this.ball.reset();
    this.paddles = [];
    this.extraHealths = [];
    this.score = 0;
    this.gamestate = GAMESTATE.STARTED;
    document.getElementById("pause_img").style.zIndex = 10;
  }

  update(deltaTime) {
    if (this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;
    if (
      this.gamestate === GAMESTATE.PAUSED ||
      this.gamestate === GAMESTATE.PAUSE ||
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER
    )
      return;
    this.paddles = buildPaddle(
      this.gameWidth,
      this,
      this.paddles,
      this.extraHealths
    );
    [this.ball, ...this.extraHealths, ...this.paddles].forEach((object) =>
      object.update(deltaTime)
    );
    this.paddles = this.paddles.filter((paddle) => !paddle.markedForDeletion);
    this.extraHealths = this.extraHealths.filter(
      (health) => !health.markedForDeletion
    );
    this.score += 1;
    document.getElementById("score").innerText = Math.round(this.score / 5);
    if (this.gamepad.connected) this.gamepad.update();
  }

  draw(ctx) {
    [this.ball, ...this.extraHealths, ...this.paddles].forEach((object) =>
      object.draw(ctx)
    );

    if (
      this.gamestate == GAMESTATE.PAUSED ||
      this.gamestate == GAMESTATE.PAUSE
    ) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();
      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);
    }
    if (this.gamestate == GAMESTATE.MENU) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press Spacebar or Tap the Screen to Start",
        this.gameWidth / 2,
        this.gameHeight / 2
      );
      document.getElementById("pause_img").style.zIndex = 0;
    }
    if (this.gamestate == GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", this.gameWidth / 2, this.gameHeight / 2);
      document.getElementById("pause_img").style.zIndex = 0;
    }
  }

  togglePause() {
    switch (this.gamestate) {
      case GAMESTATE.PAUSED:
        this.gamestate = GAMESTATE.RUNNING;
        break;
      case GAMESTATE.RUNNING:
        this.gamestate = GAMESTATE.PAUSED;
        break;
      case GAMESTATE.STARTED:
        this.gamestate = GAMESTATE.PAUSE;
        break;
      case GAMESTATE.PAUSE:
        this.gamestate = GAMESTATE.STARTED;
        break;
    }
  }
}

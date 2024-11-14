import PadHandler from "./gamepad.js";
import InputHandler from "./input.js";
import Paddle from "./paddle.js";
import Ball from "./ball.js";
import TouchHandler from "./touch.js";
import { buildLevel, levels } from "./level.js";

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
  constructor(gameWidth, gameHeight, canvas, isMobile) {
    if (isMobile && gameHeight > gameWidth) {
      this.gameWidth = gameHeight;
      this.gameHeight = gameWidth;
    } else {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
    }
    this.gamestate = GAMESTATE.MENU;
    this.isMobile = isMobile;
    this.canvas = canvas;
    this.paddle = new Paddle(this);
    this.ball = new Ball(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 3;
    this.levels = levels;
    this.currentLevel = 1;
    new InputHandler(this.paddle, this, this.ball);
    new TouchHandler(this.paddle, this, this.ball);
    this.gamepad = new PadHandler(this.paddle, this, this.ball, 1);
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
    this.bricks = buildLevel(
      this,
      this.levels[this.currentLevel],
      this.gameWidth
    );

    this.gameObjects = [this.ball, this.paddle];
    this.ball.reset();
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
    if (this.bricks.length === 0) {
      this.currentLevel = this.currentLevel < 10 ? +1 : 1;
      this.gamestate = GAMESTATE.NEWLEVEL;
      this.start();
    }
    [...this.gameObjects, ...this.bricks].forEach((object) =>
      object.update(deltaTime)
    );
    this.bricks = this.bricks.filter((brick) => !brick.markedForDeletion);
    if (this.gamepad.connected) this.gamepad.update();
  }

  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx));

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

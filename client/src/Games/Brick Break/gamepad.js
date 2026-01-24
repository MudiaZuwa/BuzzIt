export default class GamepadHandler {
  constructor(Paddle, game, ball, gamepadIndex) {
    this.myGamepad = null;
    this.connected = false;
    this.gamepadIndex = gamepadIndex;
    this.Paddle = Paddle;
    this.game = game;
    this.ball = ball;

    window.addEventListener("gamepadconnected", (event) => {
      if (!this.connected && this.gamepadIndex === event.gamepad.index)
        this.connected = true;
    });

    window.addEventListener("gamepaddisconnected", (event) => {
      if (this.gamepadIndex === event.gamepad.index) this.connected = false;
    });
  }

  update() {
    this.myGamepad = navigator.getGamepads()[this.gamepadIndex];
    this.myGamepad.buttons
      .map((e) => e.pressed)
      .forEach((isPressed, buttonIndex) => {
        if (isPressed) {
          switch (buttonIndex) {
            case 2:
              if (
                this.game.gamestate !== 0 &&
                this.game.gamestate !== 2 &&
                this.game.gamestate !== 3
              ) {
                this.ball.speed = { x: 8, y: -8 };
                this.game.gamestate = 1;
              }
              break;
            case 9:
              this.game.togglePause();
              break;
          }
        }
      });

    var LeftStickX = this.applyDeadzone(this.myGamepad.axes[0], 0.25);
    var RightStickX = this.applyDeadzone(this.myGamepad.axes[2], 0.25);
    var LeftStickY = this.applyDeadzone(this.myGamepad.axes[1], 0.25);
    var RightStickY = this.applyDeadzone(
      this.myGamepad.axes[5] === undefined
        ? this.myGamepad.axes[3]
        : this.myGamepad.axes[5],
      0.25
    );

    if (LeftStickX === 0) {
      if (this.Paddle.speed < 0) this.Paddle.stop();
      if (this.Paddle.speed > 0) this.Paddle.stop();
    }
    if (LeftStickX < 0) {
      this.Paddle.moveLeft();
      return;
    }
    if (LeftStickX > 0) {
      this.Paddle.moveRight();
      return;
    }
  }

  applyDeadzone(number, threshold, percentage) {
    percentage = (Math.abs(number) - threshold) / (1 - threshold);

    if (percentage < 0) percentage = 0;

    return percentage * (number > 0 ? 1 : -1);
  }
}

export default class GamepadHandler {
  constructor(game, ball) {
    this.myGamepad = null;
    this.connected = false;
    this.game = game;
    this.ball = ball;
    window.addEventListener("gamepadconnected", (event) => {
      if (
        !this.connected &&
        (this.gamepadIndex === event.gamepad.index || !this.gamepadIndex)
      ) {
        this.connected = true;
        this.gamepadIndex = event.gamepad.index;
      }
    });

    window.addEventListener("gamepaddisconnected", (event) => {
      if (this.gamepadIndex === event.gamepad.index) this.connected = false;
    });

    //[5] right_y
    //[0] left-x
    //[1] left_y
    //[2] right_x
    //[3] right_y(xbox)
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

    if (LeftStickX === 0) {
      if (this.ball.speed.x < 0) this.ball.stop();
      if (this.ball.speed.x > 0) this.ball.stop();
    }
    if (LeftStickX < 0) {
      this.ball.moveLeft();
      return;
    }
    if (LeftStickX > 0) {
      this.ball.moveRight();
      return;
    }
  }

  applyDeadzone(number, threshold, percentage) {
    percentage = (Math.abs(number) - threshold) / (1 - threshold);

    if (percentage < 0) percentage = 0;

    return percentage * (number > 0 ? 1 : -1);
  }
}

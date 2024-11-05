export default class TouchHandler {
  constructor(Paddle, game, ball) {
    document
      .getElementById("left_touch")
      .addEventListener("touchstart", function () {
        Paddle.moveLeft();
      });
    document
      .getElementById("right_touch")
      .addEventListener("touchstart", function () {
        Paddle.moveRight();
      });
    document.getElementById("left_touch").addEventListener("touchend", (e) => {
      if (Paddle.speed < 0) Paddle.stop();
    });
    document.getElementById("right_touch").addEventListener("touchend", (e) => {
      if (Paddle.speed > 0) Paddle.stop();
    });
    document
      .getElementById("center_touch")
      .addEventListener("touchstart", function () {
        if (game.gamestate === 5) {
          ball.speed = { x: 3, y: -3 };
          game.gamestate = 1;
        } else if (game.gamestate === 2 || game.gamestate === 3) {
          game.start();
        }
      });
    document.getElementById("pause_img").addEventListener("click", function () {
      game.togglePause();
    });
  }
}

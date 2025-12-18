export default class TouchHandler {
  constructor(game, ball) {
    document
      .getElementById("left_touch")
      .addEventListener("touchstart", function () {
        ball.moveLeft();
      });
    document
      .getElementById("right_touch")
      .addEventListener("touchstart", function () {
        ball.moveRight();
      });
    document.getElementById("left_touch").addEventListener("touchend", (e) => {
      if (ball.speed.x < 0) ball.stop();
    });
    document.getElementById("right_touch").addEventListener("touchend", (e) => {
      if (ball.speed.x > 0) ball.stop();
    });
    document
      .getElementById("center_touch")
      .addEventListener("touchstart", function () {
        if (game.gamestate === 5) {
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

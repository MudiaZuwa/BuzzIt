export default class InputHandler {
  constructor(game, ball) {
    document.addEventListener("keydown", (event) => {
      switch (event.keyCode) {
        case 37:
          ball.moveLeft();
          break;
        case 39:
          ball.moveRight();
          break;
        case 27:
          game.togglePause();
          break;
        case 32:
          game.start();
          break;
        case 13:
          if (
            game.gamestate !== 0 &&
            game.gamestate !== 2 &&
            game.gamestate !== 3
          ) {
            game.gamestate = 1;
          }
          break;
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.keyCode) {
        case 37:
          if (ball.speed.x < 0) ball.stop();
          break;
        case 39:
          if (ball.speed.x > 0) ball.stop();
          break;
      }
    });
  }
}

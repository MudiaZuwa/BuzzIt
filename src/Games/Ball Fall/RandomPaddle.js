import extraHealth from "./health.js";
import Paddle from "./paddles.js";

export function buildPaddle(gameWidth, game, paddles, extraHealths) {
  game.newPaddle++;
  if (game.newPaddle === Math.round(gameWidth / (gameWidth / 24))) {
    var paddleWidth = gameWidth > 480 ? 120 : gameWidth / 4;
    var min = 0,
      max = gameWidth - paddleWidth;
    var positionx = Math.floor(Math.random() * (max - min + 1) + min);
    (min = 1), (max = 10);
    var spawnHealth = Math.floor(Math.random() * (max - min + 1) + min);
    if (spawnHealth === 3) extraHealths.push(new extraHealth(game, positionx));
    paddles.push(new Paddle(game, positionx));
    game.newPaddle = 0;
  }
  return paddles;
}

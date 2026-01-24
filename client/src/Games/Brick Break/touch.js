export default class TouchHandler {
  constructor(Paddle, game, ball) {
    this.game = game;
    this.canvas = game.canvas;

    this.canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      const [clientX] = this.reverseCoordinates(touch.clientX, touch.clientY);
      const canvasHeight = this.canvas.height;

      // Determine which section of the canvas was touched
      if (clientX < canvasHeight / 3) {
        Paddle.moveLeft(); // Left third of the canvas
      } else if (clientX > (2 * canvasHeight) / 3) {
        Paddle.moveRight(); // Right third of the canvas
      } else {
        if (game.gamestate === 5) {
          if (!this.game.isMobile) ball.speed = { x: 3, y: -3 };
          else ball.speed = { x: 2, y: -2 };
          game.gamestate = 1;
        } else if (game.gamestate === 2 || game.gamestate === 3) {
          game.start();
        }
      }
    });

    // Add a touchend event listener to the canvas
    this.canvas.addEventListener("touchend", (e) => {
      if (Paddle.speed !== 0) Paddle.stop();
    });

    document.getElementById("pause_img").addEventListener("click", function () {
      game.togglePause();
    });
  }

  reverseCoordinates(clientX, clientY) {
    const isMobile = this.game.isMobile;
    if (isMobile) {
      const canvasRect = this.canvas.getBoundingClientRect();
      let x = clientX - canvasRect.left;
      let y = clientY - canvasRect.top;

      const originalX = x * Math.cos(-Math.PI / 2) - y * Math.sin(-Math.PI / 2);
      const originalY = x * Math.sin(Math.PI / 2) + y * Math.cos(-Math.PI / 2);

      const reversedOriginalY = this.canvas.width - originalY;

      return [originalX, reversedOriginalY];
    } else {
      return [clientX, clientY];
    }
  }
}

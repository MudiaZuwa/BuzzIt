export default class TouchHandler {
  constructor(Paddle, game, ball) {
    this.game = game;
    this.canvas = game.canvas;

    this.canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      const [clientX] = this.reverseCoordinates(touch.clientX, touch.clientY);
      const canvasWidth = this.canvas.width;
      
      // Determine which section of the canvas was touched
      if (clientX < canvasWidth / 3) {
        Paddle.moveLeft(); // Left third of the canvas
      } else if (clientX > (2 * canvasWidth) / 3) {
        Paddle.moveRight(); // Right third of the canvas
      } else {
        // Center third of the canvas
        if (game.gamestate === 5) {
          ball.speed = { x: 3, y: -3 };
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

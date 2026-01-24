export default class MouseListener {
  constructor(gameManager) {
    this.canvas = gameManager.canvas;
    this.gameManager = gameManager;
    var touchX = 0;
    var touchY = 0;
    this.canvas.addEventListener("mousedown", (e) => {
      if (this.gameManager.Tiles) {
        const clientX = e.offsetX;
        const clientY = e.offsetY;
        this.gameManager.Tiles.tileData.forEach((tile) => {
          touchX = clientX;
          touchY = clientY;
          // Check if the touch is inside the shape
          if (
            touchX >= tile.position.x &&
            touchX <= tile.position.x + tile.width &&
            touchY >= tile.position.y &&
            touchY <= tile.position.y + tile.height
          ) {
            // Start dragging the shape
            tile.selected = true;
            // Set the offset to ensure the shape is dragged from the touch point
            tile.dragOffset.x = touchX - tile.position.x;
            tile.dragOffset.y = touchY - tile.position.y;
          }
        });
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.gameManager.Tiles) {
        const tile = this.gameManager.Tiles.tileData.find(
          (tile) => tile.selected
        );
        if (tile !== undefined) {
          const tileIndex = this.gameManager.Tiles.tileData.indexOf(tile);
          const clientX = e.offsetX;
          const clientY = e.offsetY;
          // Calculate the canvas coordinates from touch coordinates
          const x = clientX;
          const y = clientY;
          const deltaX = x - touchX;
          const deltaY = y - touchY;

          // Update the shape position while dragging
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0)
              this.gameManager.Tiles.moveSelectedTile("left", tileIndex);
            else if (deltaX > 0)
              this.gameManager.Tiles.moveSelectedTile("right", tileIndex);
          } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
            if (deltaY < 0)
              this.gameManager.Tiles.moveSelectedTile("up", tileIndex);
            else if (deltaY > 0)
              this.gameManager.Tiles.moveSelectedTile("down", tileIndex);
          }
          touchX = x;
          touchY = y;
        }
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.gameManager.Tiles) {
        const tile = this.gameManager.Tiles.tileData.find(
          (tile) => tile.selected
        );
        if (tile !== undefined) {
          touchX = 0;
          touchY = 0;
          const tile = this.gameManager.Tiles.tileData.find(
            (tile) => tile.selected
          );
          const tileIndex = this.gameManager.Tiles.tileData.indexOf(tile);
          this.gameManager.Tiles.tileData[tileIndex].selected = false;
        }
      }
    });
  }
}

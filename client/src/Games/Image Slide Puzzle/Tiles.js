export default class Tiles {
  constructor(gameManager, gameImage) {
    this.tileData = [];
    this.gameManager = gameManager;
    this.gameImage = gameImage;
    const gameImageWidth = this.gameImage.width;
    const gameImageHeight = this.gameImage.height;
    const gameWidth = this.gameManager.gameWidth;
    const gameHeight = this.gameManager.gameHeight;
    for (let row = 0; row < 4; row++) {
      for (let col = 1; col <= 6; col++) {
        this.tileData.push({
          offset: {
            x: row * (gameImageWidth / 4),
            y: (col - 1) * (gameImageHeight / 6),
          },
          position: {
            x: row * ((gameWidth - 10) / 4) + 5,
            y: col * ((gameHeight - 10) / 7) + 5,
          },
          selected: false,
          width: (gameWidth - 10) / 4,
          height: (gameHeight - 10) / 7,
          row: row,
          column: col,
          dragOffset: {
            x: 0,
            y: 0,
          },
        });
      }
    }
    this.initialTileData = Array.from(this.tileData);

    const randomTilesPosition = [];
    for (let i = 0; i < 24; i++) {
      let positionX, positionY;
      do {
        positionX = Math.floor(Math.random() * 4);
        positionY = Math.floor(Math.random() * 6) + 1;
      } while (
        randomTilesPosition.some(
          (item) => item.positionX === positionX && item.positionY === positionY
        )
      );
      this.tileData[i]["position"] = {
        x: positionX * ((gameWidth - 10) / 4) + 5,
        y: positionY * ((gameHeight - 10) / 7) + 5,
      };

      this.tileData[i]["row"] = positionX;
      this.tileData[i]["column"] = positionY;
      randomTilesPosition.push({ positionX, positionY });
    }
  }

  animate() {
    const gameWidth = this.gameManager.gameWidth;
    const gameHeight = this.gameManager.gameHeight;
    const gameImage = this.gameImage;
    this.tileData.forEach((tile) => {
      this.gameManager.ctx.drawImage(
        gameImage,
        tile.offset.x,
        tile.offset.y,
        gameImage.width / 4,
        gameImage.height / 6,
        tile.position.x,
        tile.position.y,
        tile.width,
        tile.height
      );
    });

    this.gameManager.ctx.drawImage(
      gameImage,
      3 * ((gameWidth - 10) / 4) + 5,
      5,
      (gameWidth - 10) / 4,
      (gameHeight - 10) / 7 - 5
    );
  }

  moveSelectedTile(direction, index) {
    const gameWidth = this.gameManager.gameWidth;
    const gameHeight = this.gameManager.gameHeight;
    const selectedTile = this.tileData[index];

    if (!selectedTile) {
      return;
    }

    let newRow = selectedTile.row;
    let newColumn = selectedTile.column;

    switch (direction) {
      case "up":
        newColumn = Math.max(selectedTile.column - 1, 0);
        break;
      case "down":
        newColumn = Math.min(selectedTile.column + 1, 6);
        break;
      case "left":
        newRow = Math.max(selectedTile.row - 1, 0);
        break;
      case "right":
        newRow = Math.min(selectedTile.row + 1, 3);
        break;
    }

    if (
      ((newRow === 0 && newColumn === 0) ||
        this.isValidPosition(newRow, newColumn)) &&
      !this.tileData.some(
        (tile) => tile.row === newRow && tile.column === newColumn // Check for occupied positions
      )
    ) {
      this.tileData[index].row = newRow;
      this.tileData[index].column = newColumn;
      this.tileData[index].position = {
        x: newRow * ((gameWidth - 10) / 4) + 5,
        y: newColumn * ((gameHeight - 10) / 7) + 5,
      };
    }
  }

  isValidPosition(row, column) {
    return row >= 0 && row <= 3 && column >= 1 && column <= 6;
  }
}

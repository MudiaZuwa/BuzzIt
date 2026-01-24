export default class GameBody {
  constructor(GameManager) {
    this.GameManager = GameManager;
    this.ctx = GameManager.ctx
    this.lightImage = new Image();
    this.darkImage = new Image();
    this.highlightedImage = new Image();

    this.lightImage.src = "/assets/Chess/square brown light_2x.png";
    this.darkImage.src = "/assets/Chess/square brown dark_2x.png";
    this.highlightedImage.src = "/assets/Chess/square gray light _2x.png";
    this.tiles = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.tiles.push({
          row,
          column: col,
          highlighted: false,
          check: false,
        });
      }
    }
  }

  animate() {
    const gameDimensions = this.GameManager.gameDimensions;

    //Aninimate Background/ |Bottom Frame
    this.ctx.fillStyle = "#eee";
    this.ctx.fillRect(0, 0, gameDimensions, gameDimensions);

    //Animate Board Patterns
    const tileSize = (gameDimensions - 10) / 8;
    this.tiles.forEach((tile) => {
      const isLight = (tile.row + tile.column) % 2 === 0;
      let tileImage = isLight ? this.lightImage : this.darkImage;
      this.ctx.drawImage(
        tileImage,
        tile.column * tileSize + 5,
        tile.row * tileSize + 5,
        tileSize,
        tileSize
      );

      if (tile.highlighted || tile.check) {
        const imageData = this.ctx.getImageData(
          tile.column * tileSize + 5,
          tile.row * tileSize + 5,
          tileSize,
          tileSize
        );
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (tile.check) {
            data[i] = 255;
            data[i + 1] = 0;
            data[i + 2] = 0;
          } else {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            const greyValue = (red + green + blue) / 3;

            data[i] = greyValue;
            data[i + 1] = greyValue;
            data[i + 2] = greyValue;
          }
        }

        this.ctx.putImageData(
          imageData,
          tile.column * tileSize + 5,
          tile.row * tileSize + 5
        );
      
      }
    });
  }
}

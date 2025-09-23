import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import { GAMESTATE } from "./gameControls.js";
import { pieceImages } from "./piecesData.js";

export default class Pieces {
  constructor(gameManager, setWinnerName) {
    this.gameManager = gameManager;
    this.ctx = gameManager.ctx;
    this.pieceImages = pieceImages;
    this.selectedPiece = null;
    this.Restart();
  }

  animate() {
    const gameDimensions = this.gameManager.gameDimensions;
    const pieceSize = gameDimensions / 8 - 4;

    Object.keys(this.playerPieces).forEach((player) => {
      this.playerPieces[player].forEach((piece) => {
        if (piece.visible)
          this.ctx.drawImage(
            this.pieceImages[player][piece["piece"]],
            piece.column * (gameDimensions / 8) + 5,
            piece.row * (gameDimensions / 8) + 5,
            pieceSize,
            pieceSize
          );
      });
    });
  }

  Restart() {
    const piecesOrder = [
      "Rook",
      "Knight",
      "Bishop",
      "Queen",
      "King",
      "Bishop",
      "Knight",
      "Rook",
    ];

    this.playerPieces = {
      Player1: [],
      Player2: [],
    };
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        switch (row) {
          case 0:
            this.playerPieces.Player2.push({
              row,
              column: col,
              piece: piecesOrder[col],
              visible: true,
              selected: false,
            });
            break;
          case 7:
            this.playerPieces.Player1.push({
              row,
              column: col,
              piece: piecesOrder[col],
              visible: true,
              selected: false,
            });
            break;
          case 1:
            this.playerPieces.Player2.push({
              row,
              column: col,
              piece: "Pawn",
              visible: true,
              moved: false,
              selected: false,
            });
            break;
          case 6:
            this.playerPieces.Player1.push({
              row,
              column: col,
              piece: "Pawn",
              visible: true,
              selected: false,
            });
            break;
        }
      }
    }
  }

  movePiece(pieceIndex, newRow, newColumn) {
    this.gameManager.GameBody.tiles.forEach((tile) => {
      if (tile.highlighted) tile.highlighted = false;
      if (tile.check) tile.check = false;
    });
    const playerTurn = this.gameManager.playerTurn;
    this.playerPieces[playerTurn][pieceIndex].row = newRow;
    this.playerPieces[playerTurn][pieceIndex].column = newColumn;
    this.playerPieces[playerTurn][pieceIndex].selected = false;
    if (this.playerPieces[playerTurn][pieceIndex].piece === "Pawn")
      this.playerPieces[playerTurn][pieceIndex].moved = true;
    this.gameManager.playerTurn =
      playerTurn === "Player1" ? "Player2" : "Player1";
    if (this.gameManager.gameControl.gameMode === "local")
      this.gameManager.player =
        playerTurn === "Player1" ? "Player2" : "Player1";
    else if (this.gameManager.player === playerTurn) {
      const room = this.gameManager.gameControl.room;
      const playerId = this.gameManager.gameControl.playerId;
      const piecesPath = `Games/Chess/${room}/players/${playerId}/`;
      updateDataInNode(piecesPath, {
        pieces: this.playerPieces[playerTurn],
        playerTurn: this.gameManager.playerTurn,
      });
    }
    const opponent = playerTurn === "Player1" ? "Player2" : "Player1";
    const opponentPieces = this.playerPieces[opponent];
    const opponentPieceIndex = opponentPieces.findIndex(
      (piece) => piece.row === newRow && piece.column === newColumn
    );
    if (opponentPieceIndex >= 0) {
      this.playerPieces[opponent][opponentPieceIndex].visible = false;
      const targetPiece = opponentPieces[opponentPieceIndex];
      if (targetPiece.piece === "King") {
        setTimeout(() => {
          this.gameManager.gameControl.gamestate = GAMESTATE.GAMEOVER;
          this.gameManager.gameControl.restart();
        }, 3000);
        return;
      }
    }
  }
}

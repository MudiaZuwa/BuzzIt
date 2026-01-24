import { GAMESTATE } from "./gameControls.js";
import ListenDataFromNode from "../../Functions/ListenDataFromNode.js";

const initGame = (gameManager, playerId) => {
  const Room = gameManager?.gameControl?.room;
  const allPlayersRef = `Games/Chess/${Room}/players`;

  ListenDataFromNode(allPlayersRef, (players = {}) => {
    if (gameManager?.gameControl?.gamestate !== GAMESTATE.RUNNING) return;

    for (const opponent of Object.values(players)) {
      if (
        opponent.id !== playerId &&
        opponent.player === gameManager?.playerTurn
      ) {
        const opponentPieces = gameManager.Pieces.playerPieces[opponent.player];
        const changedPieceIndex = opponent.pieces.findIndex(
          (piece, index) =>
            piece.row !== opponentPieces[index].row ||
            piece.column !== opponentPieces[index].column
        );

        if (changedPieceIndex !== -1) {
          const changedPieceRow = opponent.pieces[changedPieceIndex].row;
          const changedPieceColumn = opponent.pieces[changedPieceIndex].column;

          gameManager.Pieces.movePiece(
            changedPieceIndex,
            changedPieceRow,
            changedPieceColumn
          );
          break; // Move the loop on to the next one
        }
      }
    }
  });
};

export default initGame;

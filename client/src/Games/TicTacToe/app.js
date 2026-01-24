import ListenDataFromNode from "../../Functions/ListenDataFromNode.js";

const initGame = (uid, room, playerTurnRef, tilesValue, HandlePVPUpdate) => {
  const allPlayersRef = `Games/TicTacToe/${room}/players/`;
  ListenDataFromNode(allPlayersRef, (players = {}) => {
    const opponent = Object.values(players).find((player) => player.id !== uid);
    const playerTurn = playerTurnRef.current;
    if (!opponent) return;

    if (opponent.player === playerTurn) {
      let changedTileIndex = null;
      const curTilesValue = tilesValue.current;
      const opponentCurTileValue = opponent.tiles;
      changedTileIndex = Object.keys(opponentCurTileValue).findIndex(
        (tile) => opponentCurTileValue[tile].value !== curTilesValue[tile].value
      );
      if (changedTileIndex) {
        HandlePVPUpdate(changedTileIndex, playerTurn);
      }
    }
  });
};

export default initGame;

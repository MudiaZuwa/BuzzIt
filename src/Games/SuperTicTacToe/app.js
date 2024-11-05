import ListenDataFromNode from "../../Functions/ListenDataFromNode";

const initGame = (
  room,
  opponentId,
  playerTurnRef,
  tilesValue,
  curSuperTileRef,
  HandlePVPUpdate
) => {
  const allPlayersRef = `Games/SuperTicTacToe/${room}/players/${opponentId}/`;
  ListenDataFromNode(allPlayersRef, (opponent = {}) => {
    const curSuperTile = curSuperTileRef.current;
    const playerTurn = playerTurnRef.current;
    if (!opponent) return;
    if (opponent.player === playerTurn) {
      let changedTileIndex = null;
      if (curSuperTile) {
        const curSuperTilevalue = `Stile${curSuperTile}`;
        const curTilesValue = tilesValue.current[curSuperTilevalue]?.tiles;
        const opponentCurTileValue = opponent.tiles[curSuperTilevalue]?.tiles;
        changedTileIndex = Object.keys(opponentCurTileValue).findIndex(
          (tile) =>
            opponentCurTileValue[tile].value !== curTilesValue[tile].value
        );
      }

      if (changedTileIndex || curSuperTile !== opponent.curSuperTile) {
        HandlePVPUpdate(
          changedTileIndex,
          opponent.curSuperTile,
          curSuperTile,
          playerTurn
        );
      }
    }
  });
};

export default initGame;

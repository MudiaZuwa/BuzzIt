import ListenDataFromNode from "../../Functions/ListenDataFromNode.js";

const initGame = (
  uid,
  room,
  playerTurnRef,
  tilesValue,
  curSuperTileRef,
  HandlePVPUpdate
) => {
 const allPlayersRef = `Games/SuperTicTacToe/${room}/players/`;
 ListenDataFromNode(allPlayersRef, (players = {}) => {
   const opponent = Object.values(players).find((player) => player.id !== uid);
   const playerTurn = playerTurnRef.current;
   const curSuperTile = curSuperTileRef.current;

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

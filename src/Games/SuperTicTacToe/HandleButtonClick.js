import updateDataInNode from "../../Functions/UpdateDataInNode";
import CheckWinCondition from "./CheckWinCondition";

const HandleButtonClick = (
  setTileValue,
  index,
  curSuperTile,
  setCurSuperTile,
  player,
  setCurPlayer,
  room,
  uid
) => {
  setTileValue((tilesValue) => {
    let newTilesValue = tilesValue;
    const tileIndex = index + 1;
    if (!curSuperTile) curSuperTile = tileIndex;
    const curSuperTilevalue = newTilesValue[`Stile${curSuperTile}`];
    const curSuperTileTiles = curSuperTilevalue.tiles;
    const clickedTile = curSuperTileTiles[`tile${tileIndex}`].value;
    if (clickedTile !== "") return newTilesValue;
    newTilesValue[`Stile${curSuperTile}`].tiles[`tile${tileIndex}`].value =
      player;

    if (Object.values(curSuperTileTiles).every((tile) => tile.value !== ""))
      newTilesValue[`Stile${curSuperTile}`].value = "-";

    if (CheckWinCondition(tileIndex, curSuperTileTiles, "tile", player)) {
      newTilesValue[`Stile${curSuperTile}`].value = player;
      if (CheckWinCondition(tileIndex, newTilesValue, "Stile", player))
        console.log("win");
    }

    let newSuperTileValue =
      newTilesValue[`Stile${tileIndex}`].value === "" ? tileIndex : null;

    setCurSuperTile(newSuperTileValue);

    setCurPlayer((curPlayer) => {
      return curPlayer === "Player1" ? "Player2" : "Player1";
    });
    if (room)
      updateDataInNode(`Games/SuperTicTacToe/${room}/players/${uid}`, {
        tiles: newTilesValue,
        curSuperTile: newSuperTileValue,
      });

    return newTilesValue;
  });
};

export default HandleButtonClick;

import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import CheckWinCondition from "./CheckWinCondition.js";

const HandleButtonClick = (
  setTileValue,
  index,
  curSuperTile,
  setCurSuperTile,
  played,
  setCurPlayer,
  setWinnerName,
  curPlayer,
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
      played;

    if (Object.values(curSuperTileTiles).every((tile) => tile.value !== ""))
      newTilesValue[`Stile${curSuperTile}`].value = "-";

    let newSuperTileValue =
      newTilesValue[`Stile${tileIndex}`].value === "" ? tileIndex : null;
    let newCurPlayer = curPlayer === "Player1" ? "Player2" : "Player1";

    setCurSuperTile(newSuperTileValue);

    setCurPlayer(newCurPlayer);
    if (room)
      updateDataInNode(`Games/SuperTicTacToe/${room}/players/${uid}`, {
        tiles: newTilesValue,
        curSuperTile: newSuperTileValue,
        curPlayer: newCurPlayer,
      });

    if (CheckWinCondition(tileIndex, curSuperTileTiles, "tile", played)) {
      newTilesValue[`Stile${curSuperTile}`].value = played;
      if (CheckWinCondition(tileIndex, newTilesValue, "Stile", played))
        setWinnerName(curPlayer);
    }

    return newTilesValue;
  });
};

export default HandleButtonClick;

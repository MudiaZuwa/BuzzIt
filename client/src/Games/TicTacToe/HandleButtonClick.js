import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import CheckWinCondition from "./CheckWinCondition.js";

const HandleButtonClick = (
  setTileValue,
  index,
  played,
  setCurPlayer,
  setWinnerName,
  player,
  room,
  uid
) => {
  setTileValue((tilesValue) => {
    let newTilesValue = { ...tilesValue };
    const tileIndex = index + 1;
    const clickedTile = newTilesValue[`tile${tileIndex}`].value;

    if (clickedTile !== "") return newTilesValue;

    newTilesValue[`tile${tileIndex}`].value = played;

    const newCurPlayer = player === "Player1" ? "Player2" : "Player1";

    setCurPlayer(newCurPlayer);
    if (room && uid) {
      updateDataInNode(`Games/TicTacToe/${room}/players/${uid}`, {
        tiles: newTilesValue,
        curPlayer: newCurPlayer,
      });
    }
    if (CheckWinCondition(tileIndex, newTilesValue, "tile", played)) {
      setWinnerName(player);
    }

    return newTilesValue;
  });
};

export default HandleButtonClick;

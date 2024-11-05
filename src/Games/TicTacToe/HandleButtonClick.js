import updateDataInNode from "../../Functions/UpdateDataInNode";
import CheckWinCondition from "./CheckWinCondition";

const HandleButtonClick = (
  setTileValue,
  index,
  player,
  setCurPlayer,
  room,
  uid
) => {
  setTileValue((tilesValue) => {
    let newTilesValue = { ...tilesValue };
    const tileIndex = index + 1;
    const clickedTile = newTilesValue[`tile${tileIndex}`].value;

    if (clickedTile !== "") return newTilesValue;

    newTilesValue[`tile${tileIndex}`].value = player;

    if (CheckWinCondition(tileIndex, newTilesValue, "tile", player)) {
      console.log(`${player} wins!`);
    }

    setCurPlayer((curPlayer) =>
      curPlayer === "Player1" ? "Player2" : "Player1"
    );
    if (room)
      updateDataInNode(`Games/TicTacToe/${room}/players/${uid}`, {
        tiles: newTilesValue,
      });
    return newTilesValue;
  });
};

export default HandleButtonClick;

import updateDataInNode from "../../Functions/UpdateDataInNode.js";

const HandleHintClick = (
  setDisplayHint,
  tilesValue,
  curSuperTile,
  setCurSuperTile,
  index,
  mode,
  room,
  uid
) => {
  if (!mode) return;
  const newSuperTile = index + 1;
  const newSuperTileValue = tilesValue[`Stile${newSuperTile}`].value;
  if (curSuperTile === null && newSuperTileValue === "") {
    setCurSuperTile(index + 1);
    if (room)
      updateDataInNode(`Games/SuperTicTacToe/${room}/players/${uid}`, {
        curSuperTile: newSuperTile,
      });
  } else setDisplayHint(true);
};

export default HandleHintClick;

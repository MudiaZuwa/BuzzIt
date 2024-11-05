import ListenDataFromNode from "../../../Functions/ListenDataFromNode";
import updateDataInNode from "../../../Functions/UpdateDataInNode";

export const setupMultiplayerListeners = async (
  gameManager,
  updateGameStacks
) => {
  const room = gameManager.room;
  await ListenDataFromNode(`Games/Whot/${room}/data/`, (data) =>
    updateGameStacks(data)
  );
};

export const updateNodeStacks = async (data, gameManager) => {
  const room = gameManager.room;
  await updateDataInNode(`Games/Whot/${room}/data/`, data);
};

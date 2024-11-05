import updateDataInNode from "./UpdateDataInNode";

const HandleGameRequest = async (
  chatId,
  Game,
  messageId,
  requestStatus,
  room
) => {
  const messagePath = `Messages/${chatId}/${messageId}`;
  const nodeUpdate = { requestStatus };

  await updateDataInNode(messagePath, nodeUpdate);

  if (requestStatus) {
    window.location.href = `/Games/${Game}/${room}`;
  }
};

export default HandleGameRequest;

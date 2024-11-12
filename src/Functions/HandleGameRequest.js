import updateDataInNode from "./UpdateDataInNode";

const HandleGameRequest = async (
  chatId,
  Game,
  messageId,
  requestStatus,
  room,
  navigate // Pass navigate as an argument
) => {
  const messagePath = `Messages/${chatId}/${messageId}`;
  const nodeUpdate = { requestStatus };

  await updateDataInNode(messagePath, nodeUpdate);

  if (requestStatus) {
    navigate(`/Games/${Game}/${room}`);
  }
};

export default HandleGameRequest;

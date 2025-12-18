import fetchDataFromNode from "./fetchDataFromNode";
import sendMessage from "./sendMessage";

const sendGameRequest = async (userId, recipientId, game, room) => {
  const userChatPath = `UserChats/${userId}`;

  try {
    const userChats = await fetchDataFromNode(userChatPath);
    const chatId = userChats
      ? Object.keys(userChats).find(
          (chat) => userChats[chat].chatWith === recipientId
        )
      : null;

    await sendMessage({
      currentUserId: userId,
      recipientUserId: recipientId,
      chatId,
      messageContent: game,
      messageType: "GameRequest",
      room: room,
    });
  } catch (error) {
    console.error("Error sending game request:", error);
  }
};

export default sendGameRequest;

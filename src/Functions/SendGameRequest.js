import FetchDataFromNode from "./FetchDataFromNode";
import sendMessage from "./SendMessage";

const sendGameRequest = async (userId, recipientId, game, room) => {
  const chatIdPath = `UserChats/${userId}/${recipientId}/id`;

  try {
    const chatId = await FetchDataFromNode(chatIdPath);

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

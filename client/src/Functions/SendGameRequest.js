import FetchDataFromNode from "./FetchDataFromNode.js";
import sendMessage from "./SendMessage.js";

const sendGameRequest = async (userId, recipientId, game, room) => {
  const userChatPath = `UserChats/${userId}`;

  try {
    const userChats = await FetchDataFromNode(userChatPath);
    const chatId = Object.keys(userChats).find(
      (chat) => userChats[chat].chatWith === recipientId
    );
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

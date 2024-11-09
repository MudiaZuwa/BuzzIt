import { getDatabase, ref, update, push } from "firebase/database";
import updateDataInNode from "../Functions/UpdateDataInNode";

const sendMessage = async ({
  currentUserId,
  recipientUserId,
  chatId,
  messageContent,
  mediaUrl,
  messageType,
  isGroupChat = false,
  groupParticipants = [],
  room,
}) => {
  let chatID = chatId;
  const db = getDatabase();
  let groupMembers;
  if (groupParticipants) {
    groupMembers = Object.keys(groupParticipants);
  }
  if (!chatID) {
    const chatRef = push(ref(db, "Message"));
    chatID = chatRef.key;
  }

  const timestamp = Date.now();
  const messageId = `-MSG${timestamp}`;

  const readBy = {};
  if (isGroupChat) {
    groupMembers.forEach((participantId) => {
      readBy[participantId] = participantId === currentUserId;
    });
  } else {
    readBy[currentUserId] = true;
    readBy[recipientUserId] = false;
  }

  const messageData = {
    sender: currentUserId,
    message: messageContent,
    timestamp,
    readBy,
    messageType,
  };

  if (room) messageData.room = room;
  if (mediaUrl) messageData.media = mediaUrl;

  const messagesPath = `Messages/${chatID}/${messageId}`;
  await updateDataInNode(messagesPath, messageData);

  // Update chat information with last message
  const chatDataUpdate = {
    lastMessage: messageContent,
    lastMessageTimestamp: timestamp,
  };

  const chatPath = `Chats/${chatID}`;
  await updateDataInNode(chatPath, chatDataUpdate);

  // Update UserChats for group participants or the single recipient
  const participants = isGroupChat
    ? groupMembers
    : [currentUserId, recipientUserId];

  const chatWithValue = (participantId) =>
    isGroupChat
      ? groupMembers.filter((id) => id !== participantId)
      : participantId === recipientUserId
      ? currentUserId
      : recipientUserId;

  for (const participantId of participants) {
    const chatWith = chatWithValue(participantId);
    const userChatPath = `UserChats/${participantId}/${chatID}`;

    const chatDataUpdateForUser = {
      lastMessage: messageContent,
      lastMessageTimestamp: timestamp,
      isGroupChat,
      chatWith,
      id: chatID,
    };

    await updateDataInNode(userChatPath, chatDataUpdateForUser);
  }
};

export default sendMessage;

import { database } from "../config/firebase";

const sendMessage = async ({
  currentUserId,
  recipientUserId,
  chatId,
  messageContent,
  mediaUrl,
  messageType,
  isGroupChat = false,
  groupParticipants = [],
}) => {
  let chatID = chatId;

  let groupMembers;
  if (groupParticipants && Object.keys(groupParticipants).length > 0) {
    groupMembers = Object.keys(groupParticipants);
  }

  if (!chatID) {
    const chatRef = database.ref("Message").push();
    chatID = chatRef.key;
  }

  const timestamp = Date.now();
  const messageId = `-MSG${timestamp}`;

  const readBy = {};
  if (isGroupChat && groupMembers) {
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

  if (mediaUrl) messageData.media = mediaUrl;

  // Save the message
  const messagesPath = `Messages/${chatID}/${messageId}`;
  await database.ref(messagesPath).update(messageData);

  // Update chat information with last message
  const chatDataUpdate = {
    lastMessage: messageContent,
    lastMessageTimestamp: timestamp,
  };

  const chatPath = `Chats/${chatID}`;
  await database.ref(chatPath).update(chatDataUpdate);

  // Update UserChats for group participants or the single recipient
  const participants =
    isGroupChat && groupMembers
      ? groupMembers
      : [currentUserId, recipientUserId];

  const chatWithValue = (participantId) =>
    isGroupChat && groupMembers
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

    await database.ref(userChatPath).update(chatDataUpdateForUser);
  }

  return chatID;
};

export default sendMessage;

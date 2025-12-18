import React, { useState, useEffect } from "react";
import { Box, Spinner, Text } from "native-base";
import CurrentChat from "../components/CurrentChat";
import useVerifyUser from "../hooks/useVerifyUser";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";

const Chat = ({ route }) => {
  const { chatId, userId, isGroupChat: routeIsGroupChat } = route.params || {};
  const { uid, loggedIn, isPending } = useVerifyUser();
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chat details (user or group)
  const fetchChatDetails = async (isGroup, chatIdParam, chatWithUserId) => {
    const path = isGroup
      ? `Groups/${chatIdParam}`
      : `UsersDetails/${chatWithUserId}`;
    const details = await fetchDataFromNode(path);

    return details
      ? {
          name: isGroup ? details.groupName : details.name,
          profilePhoto: isGroup ? details.groupIcon : details.profilePhoto,
          date: details.createdAt || details.date,
          id: isGroup ? chatIdParam : details.id || chatWithUserId,
          ...(isGroup && {
            members: details.members,
            createdBy: details.createdBy,
          }),
          isGroupChat: isGroup,
        }
      : null;
  };

  // Initialize chat and fetch recipient details
  useEffect(() => {
    if (!uid || !userId) return;

    const initializeChat = async () => {
      setIsLoading(true);

      try {
        // Check if we already have a chat with this user
        const userChats = await fetchDataFromNode(`UserChats/${uid}`);
        let existingChatId = chatId;

        if (userChats) {
          const existingChat = Object.entries(userChats).find(
            ([_, chat]) => chat.id === userId || chat.chatWith === userId
          );
          if (existingChat) {
            existingChatId = existingChat[0];
          }
        }

        // If no existing chat, we'll create one when the first message is sent
        setCurrentChatId(existingChatId || userId);

        // Fetch recipient details
        const isGroup = routeIsGroupChat || false;
        const details = await fetchChatDetails(isGroup, existingChatId, userId);
        setRecipientDetails(details);
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [uid, userId, chatId, routeIsGroupChat]);

  // Listen for messages
  useEffect(() => {
    if (!currentChatId) return;

    const chatMessagesPath = `Messages/${currentChatId}`;
    const unsubscribe = listenDataFromNode(
      chatMessagesPath,
      async (messagesData) => {
        if (!messagesData) {
          setCurrentMessages([]);
          return;
        }

        const isGroup = recipientDetails?.isGroupChat || false;

        const enrichedMessages = await Promise.all(
          Object.keys(messagesData).map(async (msgId) => {
            const message = { id: msgId, ...messagesData[msgId] };

            if (isGroup) {
              const senderDetails = await fetchDataFromNode(
                `UsersDetails/${message.sender}`
              );
              if (senderDetails) {
                message.senderName = senderDetails.name;
                message.senderProfilePhoto = senderDetails.profilePhoto;
              }
            }

            return message;
          })
        );

        // Sort by timestamp
        enrichedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setCurrentMessages(enrichedMessages);
      }
    );

    return () => unsubscribe();
  }, [currentChatId, recipientDetails?.isGroupChat]);

  if (isPending || isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="white"
        safeArea
      >
        <Spinner size="lg" color="primary.600" />
        <Text mt={4} color="gray.500">
          Loading chat...
        </Text>
      </Box>
    );
  }

  if (!loggedIn) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="white"
        safeArea
      >
        <Text color="gray.500">Please log in to view messages</Text>
      </Box>
    );
  }

  return (
    <CurrentChat
      chatId={currentChatId}
      uid={uid}
      messages={currentMessages}
      recipientDetails={recipientDetails}
      isLoading={false}
    />
  );
};

export default Chat;

import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import { sendMessageNotification } from "../services/notificationService";

/**
 * Hook to listen for new messages and send notifications
 * Place in a component that's always mounted (e.g., AppNavigator wrapper)
 */
const useMessageNotifications = (uid) => {
  const lastMessageTimestamps = useRef({});
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!uid) return;

    // Listen to user's chats for new messages
    const unsubscribe = listenDataFromNode(
      `UserChats/${uid}`,
      async (chatsData) => {
        if (!chatsData) return;

        // Skip notification on first load
        if (isFirstLoad.current) {
          // Store initial timestamps
          Object.entries(chatsData).forEach(([chatId, chat]) => {
            if (chat.lastMessage?.timestamp) {
              lastMessageTimestamps.current[chatId] =
                chat.lastMessage.timestamp;
            }
          });
          isFirstLoad.current = false;
          return;
        }

        // Check for new messages
        for (const [chatId, chat] of Object.entries(chatsData)) {
          const lastTimestamp = lastMessageTimestamps.current[chatId] || 0;
          const newTimestamp = chat.lastMessage?.timestamp || 0;

          // If there's a new message and it's not from the current user
          if (
            newTimestamp > lastTimestamp &&
            chat.lastMessage?.senderId !== uid &&
            AppState.currentState !== "active"
          ) {
            // Get sender details
            const senderId = chat.chatWith || chat.lastMessage?.senderId;
            if (senderId) {
              const senderDetails = await fetchDataFromNode(
                `UsersDetails/${senderId}`
              );

              if (senderDetails) {
                await sendMessageNotification({
                  senderName: senderDetails.name || "Someone",
                  senderPhoto: senderDetails.profilePhoto,
                  message: chat.lastMessage?.text || "Sent a message",
                  chatData: {
                    chatId,
                    recipientId: senderId,
                    chatInfo: {
                      name: senderDetails.name,
                      profilePhoto: senderDetails.profilePhoto,
                    },
                  },
                });
              }
            }
          }

          // Update stored timestamp
          lastMessageTimestamps.current[chatId] = newTimestamp;
        }
      }
    );

    return () => unsubscribe();
  }, [uid]);
};

export default useMessageNotifications;

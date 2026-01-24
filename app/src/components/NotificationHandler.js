import React, { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import {
  setupNotificationCategories,
  requestNotificationPermissions,
  NOTIFICATION_ACTIONS,
} from "../services/notificationService";
import { getDatabase, ref, remove, set } from "../config/firebase";
import useMessageNotifications from "../hooks/useMessageNotifications";
import useActivityNotifications from "../hooks/useActivityNotifications";

/**
 * NotificationHandler - Manages notification setup and response handling
 * Place this component at the app root level
 */
const NotificationHandler = ({
  uid,
  onAnswerCall,
  onDeclineCall,
  onReplyToMessage,
}) => {
  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  // Use notification hooks for messages and activities
  useMessageNotifications(uid);
  useActivityNotifications(uid);

  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await setupNotificationCategories();
      }
    };

    initNotifications();

    // Listen for incoming notifications (when app is in foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // You can handle foreground notification display here
      });

    // Listen for notification responses (when user interacts with notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [uid]);

  const handleNotificationResponse = async (response) => {
    const { notification, actionIdentifier, userText } = response;
    const data = notification.request.content.data;

    console.log("Notification response:", { actionIdentifier, data, userText });

    switch (actionIdentifier) {
      // Call actions
      case NOTIFICATION_ACTIONS.ANSWER_CALL:
        if (onAnswerCall && data) {
          onAnswerCall(data);
        }
        break;

      case NOTIFICATION_ACTIONS.DECLINE_CALL:
        if (onDeclineCall && data) {
          onDeclineCall(data);
          // Remove call from Firebase
          if (uid && data.callerId) {
            const db = getDatabase();
            const callRef = ref(db, `UsersCalls/${uid}/${data.callerId}`);
            await remove(callRef);
          }
        }
        break;

      // Message actions
      case NOTIFICATION_ACTIONS.REPLY:
        if (userText && data) {
          if (onReplyToMessage) {
            onReplyToMessage(data, userText);
          }
          // Also send the message to Firebase
          await sendQuickReply(data, userText, uid);
        }
        break;

      case NOTIFICATION_ACTIONS.MARK_READ:
        // Mark message as read logic
        if (data?.chatId && uid) {
          const db = getDatabase();
          const readRef = ref(db, `Chats/${data.chatId}/readBy/${uid}`);
          await set(readRef, Date.now());
        }
        break;

      // Activity actions
      case NOTIFICATION_ACTIONS.VIEW:
        if (data?.postId) {
          navigation.navigate("PostDetails", { postId: data.postId });
        } else if (data?.userId) {
          navigation.navigate("UserProfile", { userId: data.userId });
        }
        break;

      // Default tap action (opens app)
      case Notifications.DEFAULT_ACTION_IDENTIFIER:
        handleDefaultAction(data);
        break;

      default:
        console.log("Unknown action:", actionIdentifier);
    }
  };

  const handleDefaultAction = (data) => {
    if (!data) return;

    switch (data.type) {
      case "call":
        // Call is handled by IncomingCallModal
        break;
      case "message":
        if (data.chatId) {
          navigation.navigate("Chat", {
            recipientId: data.recipientId,
            chatInfo: data.chatInfo,
          });
        }
        break;
      case "activity":
        if (data.postId) {
          navigation.navigate("PostDetails", { postId: data.postId });
        } else {
          navigation.navigate("NotificationsTab");
        }
        break;
    }
  };

  // This component doesn't render anything
  return null;
};

/**
 * Send a quick reply to a message from notification
 */
async function sendQuickReply(data, messageText, uid) {
  if (!data?.chatId || !uid || !messageText) return;

  try {
    const db = getDatabase();
    const messageId = Date.now().toString();
    const messageRef = ref(db, `Chats/${data.chatId}/messages/${messageId}`);

    await set(messageRef, {
      text: messageText,
      senderId: uid,
      timestamp: Date.now(),
      type: "text",
    });

    // Update last message
    const lastMessageRef = ref(db, `Chats/${data.chatId}/lastMessage`);
    await set(lastMessageRef, {
      text: messageText,
      senderId: uid,
      timestamp: Date.now(),
    });

    console.log("Quick reply sent successfully");
  } catch (error) {
    console.error("Error sending quick reply:", error);
  }
}

export default NotificationHandler;

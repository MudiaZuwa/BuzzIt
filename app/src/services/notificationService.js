import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification category identifiers
export const NOTIFICATION_CATEGORIES = {
  CALL: "call",
  MESSAGE: "message",
  ACTIVITY: "activity",
};

// Action identifiers
export const NOTIFICATION_ACTIONS = {
  // Call actions
  ANSWER_CALL: "answer",
  DECLINE_CALL: "decline",
  // Message actions
  REPLY: "reply",
  MARK_READ: "markRead",
  // Activity actions
  VIEW: "view",
};

/**
 * Initialize notification categories with custom actions
 */
export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES.CALL,
    [
      {
        identifier: NOTIFICATION_ACTIONS.ANSWER_CALL,
        buttonTitle: "Answer",
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.DECLINE_CALL,
        buttonTitle: "Decline",
        options: {
          isDestructive: true,
        },
      },
    ]
  );

  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES.MESSAGE,
    [
      {
        identifier: NOTIFICATION_ACTIONS.REPLY,
        buttonTitle: "Reply",
        textInput: {
          submitButtonTitle: "Send",
          placeholder: "Type a reply...",
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.MARK_READ,
        buttonTitle: "Mark as Read",
      },
    ]
  );

  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES.ACTIVITY,
    [
      {
        identifier: NOTIFICATION_ACTIONS.VIEW,
        buttonTitle: "View",
        options: {
          opensAppToForeground: true,
        },
      },
    ]
  );
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    console.log("Notifications require a physical device");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return false;
  }

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0d7059",
    });

    await Notifications.setNotificationChannelAsync("calls", {
      name: "Calls",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500],
      lightColor: "#0d7059",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("messages", {
      name: "Messages",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0d7059",
    });
  }

  return true;
}

/**
 * Send a call notification
 */
export async function sendCallNotification({
  callerName,
  callerPhoto,
  callType,
  callData,
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Incoming ${callType === "video" ? "Video" : "Audio"} Call`,
      body: `${callerName} is calling you...`,
      data: {
        type: "call",
        callType,
        ...callData,
      },
      categoryIdentifier: NOTIFICATION_CATEGORIES.CALL,
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "calls" }),
    },
    trigger: null, // Immediate
  });
}

/**
 * Send a message notification
 */
export async function sendMessageNotification({
  senderName,
  senderPhoto,
  message,
  chatData,
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: senderName,
      body: message,
      data: {
        type: "message",
        ...chatData,
      },
      categoryIdentifier: NOTIFICATION_CATEGORIES.MESSAGE,
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "messages" }),
    },
    trigger: null, // Immediate
  });
}

/**
 * Send an activity notification (likes, comments, friend requests)
 */
export async function sendActivityNotification({ title, body, activityData }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        type: "activity",
        ...activityData,
      },
      categoryIdentifier: NOTIFICATION_CATEGORIES.ACTIVITY,
      sound: "default",
    },
    trigger: null, // Immediate
  });
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the push token for remote notifications (requires development build)
 */
export async function getPushToken() {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "your-project-id", // Replace with your Expo project ID
    });
    return token.data;
  } catch (error) {
    console.log("Error getting push token:", error);
    return null;
  }
}

export default {
  setupNotificationCategories,
  requestNotificationPermissions,
  sendCallNotification,
  sendMessageNotification,
  sendActivityNotification,
  cancelAllNotifications,
  getPushToken,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ACTIONS,
};

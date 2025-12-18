import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import { sendActivityNotification } from "../services/notificationService";

/**
 * Hook to listen for activity notifications and send push notifications
 * Handles: likes, comments, friend requests
 */
const useActivityNotifications = (uid) => {
  const lastNotificationTimestamp = useRef(Date.now());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = listenDataFromNode(
      `notifications/${uid}`,
      async (data) => {
        if (!data) return;

        // Skip on first load
        if (isFirstLoad.current) {
          lastNotificationTimestamp.current = Date.now();
          isFirstLoad.current = false;
          return;
        }

        // Only send notifications when app is in background
        if (AppState.currentState === "active") return;

        // Check friend requests
        if (data.friendRequest) {
          for (const [requesterId, request] of Object.entries(
            data.friendRequest
          )) {
            if (request.date > lastNotificationTimestamp.current) {
              const requesterDetails = await fetchDataFromNode(
                `UsersDetails/${requesterId}`
              );

              if (requesterDetails) {
                await sendActivityNotification({
                  title: "Friend Request",
                  body: `${
                    requesterDetails.name || "Someone"
                  } sent you a friend request`,
                  activityData: {
                    type: "friendRequest",
                    userId: requesterId,
                  },
                });
              }
            }
          }
        }

        // Check posts for new likes and comments
        if (data.posts) {
          for (const [postId, postActivity] of Object.entries(data.posts)) {
            // Check new likes
            if (postActivity.likes) {
              for (const like of postActivity.likes) {
                if (
                  like.date > lastNotificationTimestamp.current &&
                  like.uid !== uid
                ) {
                  const likerDetails = await fetchDataFromNode(
                    `UsersDetails/${like.uid}`
                  );

                  if (likerDetails) {
                    await sendActivityNotification({
                      title: "New Like",
                      body: `${likerDetails.name || "Someone"} liked your post`,
                      activityData: {
                        type: "like",
                        postId,
                        userId: like.uid,
                      },
                    });
                  }
                }
              }
            }

            // Check new comments
            if (postActivity.comments) {
              for (const comment of postActivity.comments) {
                if (
                  comment.date > lastNotificationTimestamp.current &&
                  comment.uid !== uid
                ) {
                  const commenterDetails = await fetchDataFromNode(
                    `UsersDetails/${comment.uid}`
                  );

                  if (commenterDetails) {
                    await sendActivityNotification({
                      title: "New Comment",
                      body: `${
                        commenterDetails.name || "Someone"
                      } commented on your post`,
                      activityData: {
                        type: "comment",
                        postId,
                        userId: comment.uid,
                      },
                    });
                  }
                }
              }
            }
          }
        }

        // Update timestamp
        lastNotificationTimestamp.current = Date.now();
      }
    );

    return () => unsubscribe();
  }, [uid]);
};

export default useActivityNotifications;

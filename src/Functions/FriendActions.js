import DeleteDataInNode from "./DeleteDataInNode.js";
import { getDatabase, ref, set } from "firebase/database";

// Function to remove a friend from both user's friend lists
export const removeFriend = async (friendUID, currentUserID) => {
  try {
    await DeleteDataInNode(`friend/${currentUserID}/Friends/${friendUID}`);
    await DeleteDataInNode(`friend/${friendUID}/Friends/${currentUserID}`);
  } catch (error) {
    console.error("Error removing friend:", error);
  }
};

export const acceptFriendRequest = async (requestUID, currentUserID) => {
  const db = getDatabase();

  try {
    const currentUserFriendRef = ref(
      db,
      `friend/${currentUserID}/Friends/${requestUID}`
    );
    await set(currentUserFriendRef, {
      dateAdded: Date.now(),
    });

    const requestUserFriendRef = ref(
      db,
      `friend/${requestUID}/Friends/${currentUserID}`
    );
    await set(requestUserFriendRef, {
      dateAdded: Date.now(),
    });

    await DeleteDataInNode(
      `friend/${currentUserID}/Friendrequest/${requestUID}`
    );
    await DeleteDataInNode(
      `friend/${requestUID}/Friendrequest/${currentUserID}`
    );
    await DeleteDataInNode(
      `notifications/${currentUserID}/Friendrequest/${requestUID}`
    );
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

// Function to reject a friend request
export const rejectFriendRequest = async (requestUID, currentUserID) => {
  try {
    // Remove friend request from both users' request lists
    await DeleteDataInNode(
      `friend/${currentUserID}/Friendrequest/${requestUID}`
    );
    await DeleteDataInNode(
      `friend/${requestUID}/Friendrequest/${currentUserID}`
    );

    await DeleteDataInNode(
      `notifications/${currentUserID}/Friendrequest/${requestUID}`
    );
  } catch (error) {
    console.error("Error rejecting friend request:", error);
  }
};

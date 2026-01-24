import handleFileUpload from "../functions/handleFileUpload";
import updateDataInNode from "../functions/updateDataInNode";
import { database } from "../config/firebase";
import { push, ref } from "firebase/database";

/**
 * Handle saving a group chat (create or update)
 */
export const handleSaveGroup = async ({
  groupName,
  selectedFriends,
  groupIcon,
  groupIconUrl,
  uid,
  groupDetails,
  onClose,
}) => {
  if (!groupName || selectedFriends.length < 1) return;

  try {
    let updatedGroupIconUrl = groupIconUrl;

    // Upload group icon if a new one was selected
    if (groupIcon) {
      const uploadResult = await handleFileUpload(
        [groupIcon],
        "GroupIcons",
        groupName
      );
      updatedGroupIconUrl = uploadResult[0];
    }

    let GroupID = groupDetails ? groupDetails.id : null;

    // Create new group if it doesn't exist
    if (!groupDetails) {
      const groupRef = push(ref(database, "Group"));
      GroupID = groupRef.key;
    }

    // Prepare group data
    const groupDataUpdate = {
      groupName,
      groupIcon: updatedGroupIconUrl,
      members: {
        [uid]: true,
        ...selectedFriends.reduce((acc, friendId) => {
          acc[friendId] = true;
          return acc;
        }, {}),
      },
      createdBy: groupDetails ? groupDetails.createdBy : uid,
      createdAt: groupDetails ? groupDetails.date : Date.now(),
      id: groupDetails ? groupDetails.createdBy : GroupID,
    };

    const GroupPath = `Groups/${GroupID}`;
    await updateDataInNode(GroupPath, groupDataUpdate);

    // Update UserChats for all members
    const membersToUpdate = groupDetails
      ? [...Object.keys(groupDetails.members), ...selectedFriends, uid]
      : [...selectedFriends, uid];

    await Promise.all(
      membersToUpdate.map(async (friendId) => {
        const userChatUpdate = {
          lastMessage: "Group updated",
          lastMessageTimestamp: Date.now(),
          isGroupChat: true,
          chatWith: GroupID,
          id: GroupID,
        };
        await updateDataInNode(
          `UserChats/${friendId}/${GroupID}`,
          userChatUpdate
        );
      })
    );

    onClose();
  } catch (error) {
    console.error("Error updating group:", error);
  }
};

export default handleSaveGroup;

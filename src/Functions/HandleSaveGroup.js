import HandleFileUpload from "./HandleFileUpload";
import updateDataInNode from "./UpdateDataInNode";
import { getDatabase, push, ref } from "firebase/database";

export const handleSaveGroup = async ({
  groupName,
  selectedFriends,
  groupIcon,
  groupIconUrl,
  uid,
  groupDetails,
  onClose,
}) => {
  if ((!groupName, selectedFriends.length < 1)) return;
  try {
    let updatedGroupIconUrl = groupIconUrl;
    if (groupIcon) {
      const uploadResult = await HandleFileUpload(
        [groupIcon],
        "GroupIcons",
        groupName
      );
      updatedGroupIconUrl = uploadResult[0];
    }

    const db = getDatabase();
    let GroupID = groupDetails ? groupDetails.id : null;

    if (!groupDetails) {
      const groupRef = push(ref(db, "Group"));
      GroupID = groupRef.key;
    }

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

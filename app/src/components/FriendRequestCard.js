import React, { useState } from "react";
import { Box, HStack, Text, Avatar, Button, Pressable } from "native-base";
import { useNavigation } from "@react-navigation/native";
import updateDataInNode from "../functions/updateDataInNode";
import deleteDataInNode from "../functions/deleteDataInNode";

const FriendRequestCard = ({ request, currentUserID }) => {
  const navigation = useNavigation();
  const { uid, name, profilePhoto } = request;
  const [loading, setLoading] = useState(false);
  const [handled, setHandled] = useState(false);

  const navigateToProfile = () => {
    navigation.navigate("UserProfile", { userId: uid });
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Add to friends list for both users
      const friendData = { Date: Date.now(), id: uid };
      const currentUserFriendData = { Date: Date.now(), id: currentUserID };

      await Promise.all([
        updateDataInNode(`friend/${currentUserID}/Friends/${uid}`, friendData),
        updateDataInNode(
          `friend/${uid}/Friends/${currentUserID}`,
          currentUserFriendData
        ),
        deleteDataInNode(`friend/${currentUserID}/Friendrequest/${uid}`),
        deleteDataInNode(`friend/${uid}/Friendrequest/${currentUserID}`),
        deleteDataInNode(`notifications/${currentUserID}/Friendrequest/${uid}`),
      ]);

      setHandled(true);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await Promise.all([
        deleteDataInNode(`friend/${currentUserID}/Friendrequest/${uid}`),
        deleteDataInNode(`friend/${uid}/Friendrequest/${currentUserID}`),
        deleteDataInNode(`notifications/${currentUserID}/Friendrequest/${uid}`),
      ]);

      setHandled(true);
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
    setLoading(false);
  };

  if (handled) return null;

  return (
    <Box bg="white" rounded="lg" shadow={1} p={3} mb={2}>
      <HStack space={3} alignItems="center">
        <Pressable onPress={navigateToProfile}>
          <Avatar
            size="md"
            source={{
              uri:
                profilePhoto ||
                "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
            }}
          />
        </Pressable>
        <Text flex={1} fontWeight="bold" fontSize="sm" numberOfLines={1}>
          {name || "Unknown User"}
        </Text>
        <HStack space={2}>
          <Button
            size="sm"
            colorScheme="primary"
            onPress={handleAccept}
            isLoading={loading}
            isDisabled={loading}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            onPress={handleDecline}
            isLoading={loading}
            isDisabled={loading}
          >
            Decline
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default FriendRequestCard;

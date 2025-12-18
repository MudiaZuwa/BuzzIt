import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Avatar,
  Badge,
} from "native-base";
import { useNavigation } from "@react-navigation/native";

const MessageListItem = ({ chat, openProfileModal, isProfileComplete }) => {
  const navigation = useNavigation();
  const chatLink = chat.isGroupChat ? chat.id : chat.chatWith;

  // Default profile images
  const defaultProfilePhoto =
    "https://ui-avatars.com/api/?name=User&size=50&background=cccccc&color=666666";
  const defaultGroupPhoto =
    "https://ui-avatars.com/api/?name=Group&size=50&background=cccccc&color=666666";

  const chatProfilePhoto = chat.profilePhoto
    ? chat.profilePhoto
    : chat.isGroupChat
    ? defaultGroupPhoto
    : defaultProfilePhoto;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const getLastMessagePreview = () => {
    if (chat.lastMessageType === "image") {
      return "🖼️ Image";
    } else if (chat.lastMessageType === "video") {
      return "🎥 Video";
    } else if (chat.lastMessageType === "media") {
      return "📎 Media";
    }
    return chat.lastMessage || "No messages yet";
  };

  const handlePress = () => {
    // 1. Check Recipient Name
    if (!chat.name) {
      alert("This user has an incomplete profile. You cannot chat with them.");
      return;
    }

    // 2. Check Current User Profile
    if (!isProfileComplete) {
      if (openProfileModal) {
        openProfileModal();
      } else {
        alert("Please complete your profile first.");
      }
      return;
    }

    // 3. Navigate
    navigation.navigate("Chat", {
      chatId: chat.id,
      userId: chatLink,
      isGroupChat: chat.isGroupChat,
    });
  };

  return (
    <Pressable onPress={handlePress}>
      {({ isPressed }) => (
        <Box
          bg={isPressed ? "gray.100" : "white"}
          px={4}
          py={3}
          borderBottomWidth={1}
          borderBottomColor="gray.100"
        >
          <HStack space={3} alignItems="center">
            <Avatar size="md" source={{ uri: chatProfilePhoto }} bg="gray.300">
              {chat.name ? chat.name.charAt(0).toUpperCase() : "?"}
            </Avatar>

            <VStack flex={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontWeight="600"
                  fontSize="md"
                  color="gray.800"
                  numberOfLines={1}
                  flex={1}
                >
                  {chat.name || "Unknown"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatTime(chat.lastMessageTimestamp)}
                </Text>
              </HStack>

              <Text fontSize="sm" color="gray.500" numberOfLines={1} mt={0.5}>
                {getLastMessagePreview()}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  );
};

export default MessageListItem;

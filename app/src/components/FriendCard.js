import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Pressable,
  Button,
  Icon,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FriendCard = ({ friend, isCurrentUser, onRemoveFriend }) => {
  const navigation = useNavigation();
  const { uid, name, profilePhoto } = friend;

  const navigateToProfile = () => {
    navigation.navigate("UserProfile", { userId: uid });
  };

  const navigateToChat = () => {
    navigation.navigate("Chat", { userId: uid });
  };

  return (
    <Pressable onPress={navigateToProfile}>
      <Box bg="white" rounded="lg" shadow={1} p={3} mb={2}>
        <HStack space={3} alignItems="center">
          <Avatar
            size="md"
            source={{
              uri:
                profilePhoto ||
                "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
            }}
          />
          <VStack flex={1}>
            <Text fontWeight="bold" fontSize="md">
              {name || "Unknown User"}
            </Text>
          </VStack>

          {/* Action buttons (shown when viewing own friends list) */}
          {isCurrentUser && (
            <HStack space={2}>
              <Button
                size="sm"
                colorScheme="primary"
                leftIcon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="message-text"
                    size="xs"
                  />
                }
                onPress={(e) => {
                  e.stopPropagation?.();
                  navigateToChat();
                }}
              >
                Message
              </Button>
              {onRemoveFriend && (
                <Button
                  size="sm"
                  colorScheme="danger"
                  variant="outline"
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onRemoveFriend(uid);
                  }}
                >
                  Remove
                </Button>
              )}
            </HStack>
          )}
        </HStack>
      </Box>
    </Pressable>
  );
};

export default FriendCard;

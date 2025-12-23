import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Input,
  Pressable,
  Icon,
  ScrollView,
  IconButton,
} from "native-base";
import { Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { handleSaveGroup } from "../functions/handleSaveGroup";

/**
 * GroupChatModal - Modal to create or edit a group chat
 */
const GroupChatModal = ({
  isOpen,
  onClose,
  uid,
  friendsList = [],
  groupDetails,
}) => {
  // Don't treat as group if it's not a group chat
  const group = groupDetails?.isGroupChat ? groupDetails : null;

  const [groupIcon, setGroupIcon] = useState(null);
  const [groupIconUrl, setGroupIconUrl] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = group?.createdBy === uid;
  const isEditMode = !!group;

  // Initialize form when modal opens or groupDetails changes
  useEffect(() => {
    if (group) {
      setGroupIconUrl(group.profilePhoto || "");
      setGroupName(group.name || "");
      setSelectedFriends(Object.keys(group.members || {}));
    } else {
      setGroupIconUrl("");
      setGroupName("");
      setSelectedFriends([]);
    }
    setGroupIcon(null);
    setSearchQuery("");
  }, [group, isOpen]);

  const handlePickImage = async () => {
    if (!isAdmin && isEditMode) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGroupIcon(result.assets[0]);
        setGroupIconUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const toggleFriendSelection = (friendId) => {
    if (!isAdmin && isEditMode) return;

    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.length < 1) {
      Alert.alert("Error", "Please select at least one friend");
      return;
    }

    setSaving(true);
    try {
      await handleSaveGroup({
        groupName: groupName.trim(),
        selectedFriends,
        groupIcon,
        groupIconUrl,
        uid,
        groupDetails: group,
        onClose,
      });
    } catch (error) {
      console.error("Error saving group:", error);
      Alert.alert("Error", "Failed to save group");
    } finally {
      setSaving(false);
    }
  };

  // Filter friends based on search query
  const filteredFriends = friendsList.filter((friend) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultGroupAvatar =
    "https://ui-avatars.com/api/?name=Group&size=100&background=0d7059&color=fff";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <Modal.Content maxHeight="90%">
        <Modal.CloseButton />
        <Modal.Header>
          <HStack justifyContent="space-between" alignItems="center" flex={1}>
            <Text fontSize="lg" fontWeight="bold">
              {isEditMode ? "Group Info" : "Create Group"}
            </Text>
            {(isAdmin || !isEditMode) && (
              <Button
                size="sm"
                onPress={handleSave}
                isLoading={saving}
                isDisabled={!groupName.trim() || selectedFriends.length < 1}
              >
                Save
              </Button>
            )}
          </HStack>
        </Modal.Header>

        <Modal.Body>
          <VStack space={4}>
            {/* Group Icon */}
            <Pressable
              alignSelf="center"
              onPress={handlePickImage}
              disabled={!isAdmin && isEditMode}
            >
              <Box position="relative">
                <Avatar
                  size="xl"
                  source={{ uri: groupIconUrl || defaultGroupAvatar }}
                  bg="primary.600"
                >
                  G
                </Avatar>
                {(isAdmin || !isEditMode) && (
                  <IconButton
                    position="absolute"
                    bottom={0}
                    right={0}
                    size="sm"
                    bg="white"
                    rounded="full"
                    shadow={2}
                    icon={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="camera"
                        size="sm"
                        color="gray.600"
                      />
                    }
                    onPress={handlePickImage}
                  />
                )}
              </Box>
            </Pressable>

            {/* Group Name */}
            <VStack space={1}>
              <Text fontWeight="medium" color="gray.600">
                Group Name
              </Text>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChangeText={setGroupName}
                isDisabled={!isAdmin && isEditMode}
                borderRadius="lg"
              />
            </VStack>

            {/* Search Friends */}
            <VStack space={1}>
              <Text fontWeight="medium" color="gray.600">
                {isAdmin || !isEditMode ? "Add Friends" : "Members"}
              </Text>
              <Input
                placeholder="Search friends"
                value={searchQuery}
                onChangeText={setSearchQuery}
                borderRadius="lg"
                InputLeftElement={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="magnify"
                    size="sm"
                    ml={3}
                    color="gray.400"
                  />
                }
              />
            </VStack>

            {/* Friends List */}
            <ScrollView maxHeight={300}>
              <VStack space={2}>
                {filteredFriends.map((friend) => {
                  const isMember = selectedFriends.includes(
                    friend.id || friend.uid
                  );
                  return (
                    <HStack
                      key={friend.id || friend.uid}
                      alignItems="center"
                      justifyContent="space-between"
                      p={2}
                      bg="gray.50"
                      rounded="lg"
                    >
                      <HStack alignItems="center" space={3}>
                        <Avatar
                          size="sm"
                          source={{
                            uri:
                              friend.profilePhoto ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                friend.name || "User"
                              )}&background=cccccc&color=666666`,
                          }}
                        >
                          {friend.name?.charAt(0).toUpperCase() || "?"}
                        </Avatar>
                        <Text fontWeight="medium">{friend.name}</Text>
                      </HStack>

                      {(isAdmin || !isEditMode) && (
                        <Button
                          size="sm"
                          colorScheme={isMember ? "red" : "green"}
                          variant={isMember ? "outline" : "solid"}
                          onPress={() =>
                            toggleFriendSelection(friend.id || friend.uid)
                          }
                        >
                          {isMember ? "Remove" : "Add"}
                        </Button>
                      )}
                    </HStack>
                  );
                })}

                {filteredFriends.length === 0 && (
                  <Text textAlign="center" color="gray.500" py={4}>
                    {friendsList.length === 0
                      ? "Add friends to create a group"
                      : "No friends match your search"}
                  </Text>
                )}
              </VStack>
            </ScrollView>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default GroupChatModal;

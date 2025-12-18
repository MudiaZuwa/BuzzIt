import React, { useState } from "react";
import {
  Modal,
  VStack,
  HStack,
  Button,
  Text,
  Avatar,
  ScrollView,
  Pressable,
  Box,
  Icon,
} from "native-base";
import { Input } from "./PatchedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SelectPlayersModal = ({
  isOpen,
  onClose,
  friendsList,
  game,
  maxPlayers,
  onPlayersSelected,
}) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else if (prevSelected.length < (maxPlayers || 1) - 1) {
        return [...prevSelected, friendId];
      }
      return prevSelected;
    });
  };

  const handleSendRequest = () => {
    if (selectedFriends.length > 0) {
      onPlayersSelected(selectedFriends);
      setSelectedFriends([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setSearchQuery("");
    onClose();
  };

  const filteredFriends = friendsList.filter((friend) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>
          <HStack justifyContent="space-between" alignItems="center" flex={1}>
            <Text fontSize="lg" fontWeight="bold">
              Select Players for {game?.name}
            </Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            {/* Search Input */}
            <Input
              placeholder="Search friends"
              value={searchQuery}
              onChangeText={setSearchQuery}
              InputLeftElement={
                <Icon
                  as={MaterialCommunityIcons}
                  name="magnify"
                  size={5}
                  ml={2}
                  color="gray.400"
                />
              }
            />

            {/* Selected count */}
            <Text color="gray.500" fontSize="sm">
              Selected: {selectedFriends.length} / {(maxPlayers || 2) - 1}{" "}
              players
            </Text>

            {/* Friends List */}
            <ScrollView maxHeight={300}>
              <VStack space={2}>
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.uid);
                    return (
                      <Pressable
                        key={friend.uid}
                        onPress={() => toggleFriendSelection(friend.uid)}
                      >
                        <HStack
                          bg={isSelected ? "primary.50" : "white"}
                          p={3}
                          rounded="md"
                          alignItems="center"
                          justifyContent="space-between"
                          borderWidth={1}
                          borderColor={isSelected ? "primary.500" : "gray.200"}
                        >
                          <HStack space={3} alignItems="center">
                            <Avatar
                              size="sm"
                              source={{
                                uri:
                                  friend.profilePhoto ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    friend.name || "User"
                                  )}&background=0d7059&color=fff`,
                              }}
                            />
                            <Text fontWeight="medium">{friend.name}</Text>
                          </HStack>
                          <Button
                            size="sm"
                            colorScheme={isSelected ? "red" : "green"}
                            variant={isSelected ? "outline" : "solid"}
                            onPress={() => toggleFriendSelection(friend.uid)}
                          >
                            {isSelected ? "Remove" : "Add"}
                          </Button>
                        </HStack>
                      </Pressable>
                    );
                  })
                ) : (
                  <Box py={4}>
                    <Text color="gray.500" textAlign="center">
                      {friendsList.length === 0
                        ? "Add friends to play multiplayer games!"
                        : "No friends match your search"}
                    </Text>
                  </Box>
                )}
              </VStack>
            </ScrollView>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              onPress={handleSendRequest}
              isDisabled={selectedFriends.length === 0}
            >
              Send Game Request
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default SelectPlayersModal;

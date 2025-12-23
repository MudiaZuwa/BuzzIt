import React from "react";
import {
  Modal,
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
  ScrollView,
  Button,
} from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { gameData } from "../config/gameData";
import createGameRoom from "../functions/createGameRoom";
import sendGameRequest from "../functions/sendGameRequest";

const WEB_BASE_URL = "https://buzz-it-eight.vercel.app";

/**
 * GameListModal - Modal to select and invite friend to a multiplayer game from chat
 */
const GameListModal = ({ isOpen, onClose, uid, friendId }) => {
  const navigation = useNavigation();

  const handleGameSelected = async (game) => {
    try {
      // Create game room
      const roomKey = await createGameRoom(game.path, [friendId], uid);

      // Send game request to friend
      await sendGameRequest(uid, friendId, game.path, roomKey);

      // Close modal
      onClose();

      // Navigate to game
      navigation.navigate("GameWebView", {
        gameUrl: `${WEB_BASE_URL}/Games/${game.path}/${roomKey}`,
        gameName: game.name,
      });
    } catch (error) {
      console.error("Error creating game room:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Select Game</Modal.Header>
        <Modal.Body>
          <ScrollView>
            <VStack space={3}>
              {gameData.MultiPlayer.map((game) => (
                <Pressable
                  key={game.name + game.path}
                  onPress={() => handleGameSelected(game)}
                >
                  <Box
                    bg="gray.50"
                    p={4}
                    rounded="lg"
                    borderWidth={1}
                    borderColor="gray.200"
                    _pressed={{ bg: "gray.100" }}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack>
                        <Text fontSize="md" fontWeight="semibold">
                          {game.name}
                        </Text>
                        {game.maxPlayers && (
                          <Text fontSize="xs" color="gray.500">
                            {game.maxPlayers} players
                          </Text>
                        )}
                      </VStack>
                      <Icon
                        as={MaterialCommunityIcons}
                        name="chevron-right"
                        size="md"
                        color="primary.500"
                      />
                    </HStack>
                  </Box>
                </Pressable>
              ))}
            </VStack>
          </ScrollView>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default GameListModal;

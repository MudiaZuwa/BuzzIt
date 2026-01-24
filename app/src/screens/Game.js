import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  ScrollView,
  Pressable,
  Text,
  Center,
  useToast,
  Avatar,
  Icon,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useVerifyUser from "../hooks/useVerifyUser";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import createGameRoom from "../functions/createGameRoom";
import sendGameRequest from "../functions/sendGameRequest";
import SelectPlayersModal from "../components/SelectPlayersModal";
import AuthModal from "../components/AuthModal";
import { gameData } from "../config/gameData";

const WEB_BASE_URL = "https://buzz-it-eight.vercel.app";

const Game = () => {
  const navigation = useNavigation();
  const { uid, loggedIn } = useVerifyUser();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("single");
  const [friendsList, setFriendsList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSelectPlayers, setShowSelectPlayers] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);

  // Fetch user profile pic
  useEffect(() => {
    if (uid) {
      fetchDataFromNode(`UsersDetails/${uid}`).then((data) => {
        if (data) {
          setUserProfilePic(data.profilePhoto);
        }
      });
    } else {
      setUserProfilePic(null);
    }
  }, [uid]);

  // Fetch friends list for multiplayer
  useEffect(() => {
    const loadFriends = async () => {
      if (!uid) return;
      const friendsData = await fetchDataFromNode(`friend/${uid}/Friends`);
      if (!friendsData) {
        setFriendsList([]);
        return;
      }

      const friendsArray = await Promise.all(
        Object.keys(friendsData).map(async (friendId) => {
          const friendDetails = await fetchDataFromNode(
            `UsersDetails/${friendId}`
          );
          return friendDetails
            ? {
                uid: friendId,
                name: friendDetails.name,
                profilePhoto: friendDetails.profilePhoto,
              }
            : null;
        })
      );

      setFriendsList(friendsArray.filter(Boolean));
    };

    if (uid) loadFriends();
  }, [uid]);

  const handleProfilePress = () => {
    if (loggedIn) {
      navigation.navigate("UserProfile", { userId: uid });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSinglePlayerGame = (game) => {
    // Navigate to WebView with Single room key
    navigation.navigate("GameWebView", {
      gameUrl: `${WEB_BASE_URL}/Games/${game.path}/Single`,
      gameName: game.name,
    });
  };

  const handleMultiPlayerGame = (game) => {
    if (!loggedIn) {
      toast.show({ description: "Please login to play multiplayer games" });
      setShowAuthModal(true);
      return;
    }

    if (friendsList.length === 0) {
      toast.show({ description: "Add friends to play multiplayer games!" });
      return;
    }

    setSelectedGame(game);
    setShowSelectPlayers(true);
  };

  const handlePlayersSelected = async (selectedPlayerIds) => {
    if (!selectedGame || !uid) return;

    try {
      // Create game room
      const roomKey = await createGameRoom(
        selectedGame.path,
        selectedPlayerIds,
        uid
      );

      // Send game request to each selected friend
      await Promise.all(
        selectedPlayerIds.map((friendId) =>
          sendGameRequest(uid, friendId, selectedGame.path, roomKey)
        )
      );

      toast.show({ description: "Game request sent!" });

      // Navigate to game
      navigation.navigate("GameWebView", {
        gameUrl: `${WEB_BASE_URL}/Games/${selectedGame.path}/${roomKey}`,
        gameName: selectedGame.name,
      });
    } catch (error) {
      console.error("Error creating game:", error);
      toast.show({ description: "Error creating game room" });
    }
  };

  const renderGameCard = (game, onPress) => (
    <Pressable key={game.name + game.path} onPress={() => onPress(game)}>
      <Box
        bg="white"
        p={4}
        mb={3}
        rounded="lg"
        shadow={1}
        borderWidth={1}
        borderColor="gray.100"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              {game.name}
            </Text>
            {game.maxPlayers && (
              <Text fontSize="sm" color="gray.500">
                Up to {game.maxPlayers} players
              </Text>
            )}
          </VStack>
          <Icon
            as={MaterialCommunityIcons}
            name="chevron-right"
            size="lg"
            color="primary.500"
          />
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1} bg="background.light" safeArea>
      {/* Header */}
      <HStack
        bg="white"
        px={4}
        py={3}
        justifyContent="space-between"
        alignItems="center"
        shadow={1}
      >
        <Heading size="md" color="primary.500">
          Games
        </Heading>
        <HStack space={3} alignItems="center">
          <Pressable onPress={() => navigation.navigate("Settings")}>
            <Icon
              as={MaterialCommunityIcons}
              name="cog"
              size="md"
              color="gray.600"
            />
          </Pressable>
          <Pressable onPress={handleProfilePress}>
            {loggedIn && userProfilePic ? (
              <Avatar size="sm" source={{ uri: userProfilePic }} />
            ) : loggedIn ? (
              <Avatar
                size="sm"
                source={{
                  uri: "https://ui-avatars.com/api/?name=User&background=0d7059&color=fff",
                }}
              />
            ) : (
              <Icon
                as={MaterialCommunityIcons}
                name="login"
                size="lg"
                color="gray.600"
              />
            )}
          </Pressable>
        </HStack>
      </HStack>

      {/* Tabs */}
      <HStack bg="white" shadow={1}>
        <Pressable
          flex={1}
          py={3}
          onPress={() => setActiveTab("single")}
          borderBottomWidth={2}
          borderBottomColor={
            activeTab === "single" ? "primary.500" : "transparent"
          }
        >
          <Text
            textAlign="center"
            fontWeight={activeTab === "single" ? "bold" : "normal"}
            color={activeTab === "single" ? "primary.500" : "gray.600"}
          >
            Single Player
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          py={3}
          onPress={() => setActiveTab("multi")}
          borderBottomWidth={2}
          borderBottomColor={
            activeTab === "multi" ? "primary.500" : "transparent"
          }
        >
          <Text
            textAlign="center"
            fontWeight={activeTab === "multi" ? "bold" : "normal"}
            color={activeTab === "multi" ? "primary.500" : "gray.600"}
          >
            Multiplayer
          </Text>
        </Pressable>
      </HStack>

      {/* Game List */}
      <ScrollView>
        <VStack p={4}>
          {activeTab === "single" ? (
            gameData.SinglePlayer.map((game) =>
              renderGameCard(game, handleSinglePlayerGame)
            )
          ) : (
            <>
              {gameData.MultiPlayer.map((game) =>
                renderGameCard(game, handleMultiPlayerGame)
              )}
              {!loggedIn && (
                <Center py={4}>
                  <Text color="gray.500" textAlign="center">
                    Login to play multiplayer games with friends!
                  </Text>
                  <Button
                    mt={2}
                    onPress={() => setShowAuthModal(true)}
                    size="sm"
                  >
                    Login
                  </Button>
                </Center>
              )}
            </>
          )}
        </VStack>
      </ScrollView>

      {/* Select Players Modal */}
      <SelectPlayersModal
        isOpen={showSelectPlayers}
        onClose={() => setShowSelectPlayers(false)}
        friendsList={friendsList}
        game={selectedGame}
        maxPlayers={selectedGame?.maxPlayers || 2}
        onPlayersSelected={handlePlayersSelected}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => setShowAuthModal(false)}
      />
    </Box>
  );
};

export default Game;

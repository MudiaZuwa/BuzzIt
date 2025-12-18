import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  FlatList,
  Center,
  Spinner,
  Button,
  Icon,
  Pressable,
  Avatar,
  Heading,
} from "native-base";
import { Input } from "../components/PatchedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import MessageListItem from "../components/MessageListItem";
import AuthModal from "../components/AuthModal";
import ProfileEditModal from "../components/ProfileEditModal";
import { useProfile } from "../context/ProfileContext";

const Messages = () => {
  const navigation = useNavigation();
  const {
    uid,
    loggedIn,
    loading: profileLoading,
    showProfileModal,
    closeProfileModal,
    isProfileComplete,
  } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Fetch chat details from Firebase
  const fetchChatDetails = async (isGroupChat, chatId, chatWithUserId) => {
    const path = isGroupChat
      ? `Groups/${chatId}`
      : `UsersDetails/${chatWithUserId}`;
    const details = await fetchDataFromNode(path);

    return details
      ? {
          name: isGroupChat ? details.groupName : details.name,
          profilePhoto: isGroupChat ? details.groupIcon : details.profilePhoto,
          date: details.createdAt || details.date,
          id: details.id,
          ...(isGroupChat && {
            members: details.members,
            createdBy: details.createdBy,
          }),
          isGroupChat,
        }
      : null;
  };

  // Listen for user chats
  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userChatsPath = `UserChats/${uid}`;

    const unsubscribe = listenDataFromNode(userChatsPath, async (chatsData) => {
      if (!chatsData) {
        setPreviousChats([]);
        setIsLoading(false);
        return;
      }

      try {
        const chatsArray = await Promise.all(
          Object.keys(chatsData).map(async (chatId) => {
            const { chatWith, isGroupChat } = chatsData[chatId];
            const chatDetails = { ...chatsData[chatId] };

            const details = await fetchChatDetails(
              isGroupChat,
              chatsData[chatId].id,
              chatWith
            );

            return details
              ? {
                  ...chatDetails,
                  name: details.name,
                  profilePhoto: details.profilePhoto,
                }
              : chatDetails;
          })
        );

        // Sort by last message timestamp
        const sortedChats = chatsArray.sort(
          (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
        setPreviousChats(sortedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!loggedIn) {
      setShowAuthModal(true);
    }
  }, [loggedIn]);

  const filteredChats = previousChats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    // The listener will handle the refresh automatically
  };

  const handleProfilePress = () => {
    if (loggedIn) {
      navigation.navigate("UserProfile", { userId: uid });
    } else {
      setShowAuthModal(true);
    }
  };

  const renderEmptyState = () => (
    <Center flex={1} px={8}>
      <Icon
        as={MaterialCommunityIcons}
        name="message-text-outline"
        size="6xl"
        color="gray.300"
        mb={4}
      />
      <Text fontSize="lg" fontWeight="600" color="gray.600" textAlign="center">
        No messages yet
      </Text>
      <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
        Start a conversation with your friends
      </Text>
    </Center>
  );

  const renderNotLoggedIn = () => (
    <Center flex={1} px={8}>
      <Icon
        as={MaterialCommunityIcons}
        name="login"
        size="6xl"
        color="gray.300"
        mb={4}
      />
      <Text fontSize="lg" fontWeight="600" color="gray.600" textAlign="center">
        Sign in to view messages
      </Text>
      <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
        You need to be logged in to see your conversations
      </Text>
      <Button
        mt={6}
        colorScheme="primary"
        onPress={() => setShowAuthModal(true)}
      >
        Sign In
      </Button>
    </Center>
  );

  if (profileLoading) {
    return (
      <Box flex={1} bg="white" safeArea>
        <Center flex={1}>
          <Spinner size="lg" color="primary.600" />
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="white" safeArea>
      {/* Header */}
      <HStack
        px={4}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="gray.100"
      >
        <Heading size="md" color="primary.500">
          Messages
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

      {!loggedIn ? (
        renderNotLoggedIn()
      ) : (
        <VStack flex={1}>
          {/* Search Input */}
          <Box px={4} py={2}>
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              borderRadius="full"
              bg="gray.100"
              borderWidth={0}
              size="lg"
              InputLeftElement={
                <Icon
                  as={MaterialCommunityIcons}
                  name="magnify"
                  size="sm"
                  ml={3}
                  color="gray.400"
                />
              }
              InputRightElement={
                searchTerm ? (
                  <Pressable onPress={() => setSearchTerm("")} mr={3}>
                    <Icon
                      as={MaterialCommunityIcons}
                      name="close-circle"
                      size="sm"
                      color="gray.400"
                    />
                  </Pressable>
                ) : null
              }
            />
          </Box>

          {/* Chat List */}
          {isLoading ? (
            <Center flex={1}>
              <Spinner size="lg" color="primary.600" />
            </Center>
          ) : (
            <FlatList
              data={filteredChats}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageListItem
                  chat={item}
                  openProfileModal={openProfileModal}
                  isProfileComplete={isProfileComplete}
                  uid={uid}
                />
              )}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#0d7059"]}
                  tintColor="#0d7059"
                />
              }
              contentContainerStyle={{ flexGrow: 1 }}
            />
          )}
        </VStack>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Profile Edit Modal - shows when profile is incomplete */}
      <ProfileEditModal
        isOpen={showProfileModal && loggedIn && !isProfileComplete}
        onClose={closeProfileModal}
        isFirstTime={true}
        uid={uid}
      />
    </Box>
  );
};

export default Messages;

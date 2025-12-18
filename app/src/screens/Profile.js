import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Avatar,
  Button,
  Image,
  Pressable,
  Center,
  Spinner,
  Heading,
  Icon,
  IconButton,
  Divider,
} from "native-base";
import { RefreshControl, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PostCard from "../components/PostCard";
import FriendCard from "../components/FriendCard";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import updateDataInNode from "../functions/updateDataInNode";
import deleteDataInNode from "../functions/deleteDataInNode";
import useVerifyUser from "../hooks/useVerifyUser";
import ProfileEditModal from "../components/ProfileEditModal";
import { useProfile } from "../context/ProfileContext";

const { width } = Dimensions.get("window");

const Profile = ({ route: propRoute }) => {
  const navigation = useNavigation();
  const routeHook = useRoute();
  const route = propRoute || routeHook;
  const { userId: routeUserId } = route.params || {};
  const { uid: currentUserID, loggedIn } = useVerifyUser();
  const {
    showProfileModal,
    closeProfileModal,
    isProfileComplete,
    openProfileModal,
  } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);

  const userId = routeUserId || currentUserID;
  const isOwnProfile = userId === currentUserID;

  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch user details
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenDataFromNode(`UsersDetails/${userId}`, (data) => {
      if (data) {
        setUserDetails({
          name: data.name,
          profilePhoto: data.profilePhoto,
          coverPhoto: data.coverPhoto,
          about: data.about,
          joinedDate: data.date,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Fetch user's posts
  useEffect(() => {
    if (!userId || !userDetails) return;

    const unsubscribe = listenDataFromNode("Posts/", (postsData) => {
      if (postsData) {
        const userPosts = Object.entries(postsData)
          .filter(([_, post]) => post.uid === userId)
          .map(([postId, post]) => ({
            id: postId,
            ...post,
            username: userDetails.name,
            profilePic: userDetails.profilePhoto,
          }))
          .sort((a, b) => b.date - a.date);
        setPosts(userPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, [userId, userDetails]);

  // Fetch friends and friend status
  useEffect(() => {
    if (!userId || !currentUserID) return;

    // Get user's friends list
    const friendsUnsubscribe = listenDataFromNode(
      `friend/${userId}/Friends`,
      async (data) => {
        const friendIds = data ? Object.keys(data) : [];
        setFriendsList(friendIds);
        setIsFriend(friendIds.includes(currentUserID));

        // Fetch friend details
        const friendsDetails = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendData = await fetchDataFromNode(
              `UsersDetails/${friendId}`
            );
            return {
              uid: friendId,
              name: friendData?.name,
              profilePhoto: friendData?.profilePhoto,
            };
          })
        );
        setFriendsData(friendsDetails);
      }
    );

    // Check friend request status
    const requestsUnsubscribe = listenDataFromNode(
      `friend/${currentUserID}/Friendrequest/${userId}`,
      (data) => {
        if (data) {
          setFriendRequestSent(data.Request === "sent");
          setFriendRequestReceived(data.Request === "received");
        } else {
          setFriendRequestSent(false);
          setFriendRequestReceived(false);
        }
      }
    );

    return () => {
      friendsUnsubscribe();
      requestsUnsubscribe();
    };
  }, [userId, currentUserID]);

  const handleFriendToggle = async () => {
    if (!currentUserID || !userId) return;

    if (isFriend) {
      // Unfriend
      await Promise.all([
        deleteDataInNode(`friend/${userId}/Friends/${currentUserID}`),
        deleteDataInNode(`friend/${currentUserID}/Friends/${userId}`),
      ]);
    } else if (friendRequestSent) {
      // Cancel request
      await Promise.all([
        deleteDataInNode(`friend/${userId}/Friendrequest/${currentUserID}`),
        deleteDataInNode(`friend/${currentUserID}/Friendrequest/${userId}`),
        deleteDataInNode(
          `notifications/${userId}/Friendrequest/${currentUserID}`
        ),
      ]);
    } else if (friendRequestReceived) {
      // Accept request
      const friendData = { Date: Date.now(), id: userId };
      const currentUserFriendData = { Date: Date.now(), id: currentUserID };

      await Promise.all([
        updateDataInNode(
          `friend/${currentUserID}/Friends/${userId}`,
          friendData
        ),
        updateDataInNode(
          `friend/${userId}/Friends/${currentUserID}`,
          currentUserFriendData
        ),
        deleteDataInNode(`friend/${currentUserID}/Friendrequest/${userId}`),
        deleteDataInNode(`friend/${userId}/Friendrequest/${currentUserID}`),
        deleteDataInNode(
          `notifications/${currentUserID}/Friendrequest/${userId}`
        ),
      ]);
    } else {
      // Send request
      const friendRequestForUser = {
        Date: Date.now(),
        Request: "received",
        id: currentUserID,
      };
      const friendRequestForCurrentUser = {
        Date: Date.now(),
        Request: "sent",
        id: userId,
      };

      await Promise.all([
        updateDataInNode(
          `friend/${userId}/Friendrequest/${currentUserID}`,
          friendRequestForUser
        ),
        updateDataInNode(
          `friend/${currentUserID}/Friendrequest/${userId}`,
          friendRequestForCurrentUser
        ),
        updateDataInNode(
          `notifications/${userId}/Friendrequest/${currentUserID}`,
          friendRequestForUser
        ),
        updateDataInNode(`notifications/${userId}`, { viewed: false }),
      ]);
    }
  };

  const getFriendButtonText = () => {
    if (isFriend) return "Unfriend";
    if (friendRequestSent) return "Cancel Request";
    if (friendRequestReceived) return "Accept Request";
    return "Add Friend";
  };

  const getFriendButtonVariant = () => {
    if (isFriend || friendRequestSent) return "outline";
    return "solid";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Data will refresh via listeners
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRemoveFriend = async (friendId) => {
    if (!currentUserID || !friendId) return;
    await Promise.all([
      deleteDataInNode(`friend/${friendId}/Friends/${currentUserID}`),
      deleteDataInNode(`friend/${currentUserID}/Friends/${friendId}`),
    ]);
  };

  const getMediaFromPosts = () => {
    const mediaItems = [];
    posts.forEach((post) => {
      if (post.media && post.media.length > 0) {
        post.media.forEach((mediaItem) => {
          mediaItems.push({ url: mediaItem, postId: post.id, userId });
        });
      }
    });
    return mediaItems;
  };

  if (loading) {
    return (
      <Box flex={1} bg="background.light" safeArea>
        <Center flex={1}>
          <Spinner size="lg" />
          <Text mt={2}>Loading profile...</Text>
        </Center>
      </Box>
    );
  }

  if (!userDetails) {
    return (
      <Box flex={1} bg="background.light" safeArea>
        <Center flex={1}>
          <Text color="gray.500">User not found</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="background.light" safeArea>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cover Photo */}
        <Box height={150} bg="gray.300">
          {userDetails.coverPhoto ? (
            <Image
              source={{ uri: userDetails.coverPhoto }}
              alt="Cover"
              width="100%"
              height="100%"
              resizeMode="cover"
            />
          ) : (
            <Box flex={1} bg="primary.100" />
          )}

          {/* Back button */}
          {routeUserId && (
            <IconButton
              position="absolute"
              top={2}
              left={2}
              icon={
                <Icon
                  as={MaterialCommunityIcons}
                  name="arrow-left"
                  size="md"
                  color="white"
                />
              }
              bg="rgba(0,0,0,0.3)"
              rounded="full"
              onPress={() => navigation.goBack()}
            />
          )}
        </Box>

        {/* Profile Header */}
        <VStack px={4} pb={4}>
          {/* Avatar */}
          <Avatar
            size="xl"
            source={{
              uri:
                userDetails.profilePhoto ||
                "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
            }}
            position="relative"
            top={-40}
            borderWidth={4}
            borderColor="white"
          />

          {/* User Info */}
          <VStack mt={-8} space={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Heading size="lg">{userDetails.name}</Heading>
                <Text color="gray.500" fontSize="sm">
                  {friendsList.length} friends
                </Text>
              </VStack>

              {/* Friend Button (not shown on own profile) */}
              {!isOwnProfile && currentUserID && (
                <HStack space={2}>
                  <Button
                    size="sm"
                    colorScheme="primary"
                    variant={getFriendButtonVariant()}
                    onPress={handleFriendToggle}
                  >
                    {getFriendButtonText()}
                  </Button>
                  {isFriend && (
                    <Button
                      size="sm"
                      colorScheme="primary"
                      variant="outline"
                      leftIcon={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="message-text"
                          size="xs"
                        />
                      }
                      onPress={() =>
                        navigation.navigate("Chat", { userId: userId })
                      }
                    >
                      Message
                    </Button>
                  )}
                </HStack>
              )}

              {/* Edit Profile Button (shown on own profile) */}
              {isOwnProfile && currentUserID && (
                <Button
                  size="sm"
                  colorScheme="primary"
                  variant="outline"
                  leftIcon={
                    <Icon as={MaterialCommunityIcons} name="pencil" size="xs" />
                  }
                  onPress={() => setShowEditModal(true)}
                >
                  Edit Profile
                </Button>
              )}
            </HStack>

            {userDetails.about && (
              <Text color="gray.600" mt={2}>
                {userDetails.about}
              </Text>
            )}

            {userDetails.joinedDate && (
              <HStack alignItems="center" space={1} mt={1}>
                <Icon
                  as={MaterialCommunityIcons}
                  name="calendar"
                  size="xs"
                  color="gray.500"
                />
                <Text color="gray.500" fontSize="xs">
                  Joined{" "}
                  {new Date(userDetails.joinedDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Text>
              </HStack>
            )}
          </VStack>
        </VStack>

        {/* Tabs */}
        <HStack bg="white" shadow={1}>
          <Pressable
            flex={1}
            py={3}
            onPress={() => setActiveTab("posts")}
            borderBottomWidth={2}
            borderBottomColor={
              activeTab === "posts" ? "primary.500" : "transparent"
            }
          >
            <Text
              textAlign="center"
              fontWeight={activeTab === "posts" ? "bold" : "normal"}
              color={activeTab === "posts" ? "primary.500" : "gray.600"}
            >
              Posts
            </Text>
          </Pressable>
          <Pressable
            flex={1}
            py={3}
            onPress={() => setActiveTab("friends")}
            borderBottomWidth={2}
            borderBottomColor={
              activeTab === "friends" ? "primary.500" : "transparent"
            }
          >
            <Text
              textAlign="center"
              fontWeight={activeTab === "friends" ? "bold" : "normal"}
              color={activeTab === "friends" ? "primary.500" : "gray.600"}
            >
              Friends
            </Text>
          </Pressable>
          <Pressable
            flex={1}
            py={3}
            onPress={() => setActiveTab("media")}
            borderBottomWidth={2}
            borderBottomColor={
              activeTab === "media" ? "primary.500" : "transparent"
            }
          >
            <Text
              textAlign="center"
              fontWeight={activeTab === "media" ? "bold" : "normal"}
              color={activeTab === "media" ? "primary.500" : "gray.600"}
            >
              Media
            </Text>
          </Pressable>
        </HStack>

        {/* Tab Content */}
        <VStack p={4} space={2}>
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserID={currentUserID}
                  />
                ))
              ) : (
                <Center py={8}>
                  <Text color="gray.500">No posts yet</Text>
                </Center>
              )}
            </>
          )}

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <>
              {friendsData.length > 0 ? (
                friendsData.map((friend) => (
                  <FriendCard
                    key={friend.uid}
                    friend={friend}
                    isCurrentUser={isOwnProfile}
                    onRemoveFriend={handleRemoveFriend}
                  />
                ))
              ) : (
                <Center py={8}>
                  <Text color="gray.500">No friends yet</Text>
                </Center>
              )}
            </>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <>
              {getMediaFromPosts().length > 0 ? (
                <HStack flexWrap="wrap">
                  {getMediaFromPosts().map((item, index) => (
                    <Pressable
                      key={index}
                      width={(width - 48) / 3}
                      height={(width - 48) / 3}
                      m={1}
                      onPress={() =>
                        navigation.navigate("PostDetails", {
                          userId: item.userId,
                          postId: item.postId,
                        })
                      }
                    >
                      <Image
                        source={{ uri: item.url }}
                        alt={`Media ${index}`}
                        width="100%"
                        height="100%"
                        resizeMode="cover"
                        rounded="md"
                      />
                    </Pressable>
                  ))}
                </HStack>
              ) : (
                <Center py={8}>
                  <Text color="gray.500">No media yet</Text>
                </Center>
              )}
            </>
          )}
        </VStack>
      </ScrollView>

      <ProfileEditModal
        isOpen={
          (showProfileModal &&
            loggedIn &&
            !isProfileComplete &&
            isOwnProfile) ||
          showEditModal
        }
        onClose={() => {
          closeProfileModal();
          setShowEditModal(false);
        }}
        isFirstTime={!isProfileComplete}
        uid={currentUserID}
        userProfile={userDetails}
      />
    </Box>
  );
};

export default Profile;

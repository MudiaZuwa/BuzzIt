import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  ScrollView,
  Heading,
  Button,
  Fab,
  Icon,
  useToast,
  Spinner,
  Center,
  HStack,
  Avatar,
  IconButton,
  Pressable,
  Text,
} from "native-base";
import { RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import CreatePostForm from "../components/CreatePostForm";
import AuthModal from "../components/AuthModal";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import useVerifyUser from "../hooks/useVerifyUser";

const Home = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const { uid, loggedIn } = useVerifyUser();
  const toast = useToast();

  const updatePosts = (postsData) => {
    if (postsData) {
      const postDetailsPromises = Object.entries(postsData).map(
        async ([postId, post]) => {
          const postWithUser = await handleGetPostUser(postId, post);
          return postWithUser;
        }
      );

      Promise.all(postDetailsPromises).then((fetchedPosts) => {
        // Sort by date descending
        const sortedPosts = fetchedPosts.sort((a, b) => b.date - a.date);
        setPosts(sortedPosts);
      });
    } else {
      setPosts([]);
    }
  };

  const handleGetPostUser = async (postId, post) => {
    try {
      const userPath = `UsersDetails/${post.uid}`;
      const userData = await fetchDataFromNode(userPath);

      return {
        postId,
        id: postId,
        ...post,
        username: userData?.name || "Unknown User",
        profilePic: userData?.profilePhoto || null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { postId, id: postId, ...post };
    }
  };

  useEffect(() => {
    const postUnsubscribe = listenDataFromNode("Posts/", updatePosts);
    return () => postUnsubscribe();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Force refresh posts
    const postsData = await fetchDataFromNode("Posts/");
    updatePosts(postsData);
    setRefreshing(false);
  };

  const handleProfilePress = () => {
    if (loggedIn) {
      navigation.navigate("UserProfile", { userId: uid });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleCreatePost = () => {
    if (loggedIn) {
      setShowCreatePost(true);
    } else {
      toast.show({ description: "Please login to create a post" });
      setShowAuthModal(true);
    }
  };

  return (
    <Box flex={1} bg="background.light" safeArea>
      {/* Custom Header */}
      <HStack
        bg="white"
        px={4}
        py={3}
        justifyContent="space-between"
        alignItems="center"
        shadow={1}
      >
        <Heading size="md" color="primary.500">
          BuzzIt
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack space={4} p={4}>
          <Heading size="md">Feed</Heading>

          {/* Create Post Form (inline like web) */}
          <Box bg="white" p={4} rounded="md" shadow={1} mb={2}>
            {loggedIn ? (
              <CreatePostForm uid={uid} />
            ) : (
              <Pressable onPress={() => setShowAuthModal(true)}>
                <HStack alignItems="center">
                  <Avatar
                    size="sm"
                    source={{
                      uri: "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
                    }}
                    mr={3}
                  />
                  <Box
                    bg="gray.100"
                    flex={1}
                    p={2}
                    rounded="full"
                    borderWidth={1}
                    borderColor="gray.200"
                  >
                    <Text color="gray.500" ml={2}>
                      Log in to post...
                    </Text>
                  </Box>
                </HStack>
              </Pressable>
            )}
          </Box>

          {posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard key={index} post={post} currentUserID={uid} />
            ))
          ) : (
            <Center py={10}>
              <Spinner size="lg" />
            </Center>
          )}
        </VStack>
      </ScrollView>

      {/* Floating Action Button for Create Post */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={
          <Icon
            as={MaterialCommunityIcons}
            name="plus"
            size="sm"
            color="white"
          />
        }
        onPress={handleCreatePost}
        bg="primary.500"
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        uid={uid}
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

export default Home;

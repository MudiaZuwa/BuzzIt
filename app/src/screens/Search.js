import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  ScrollView,
  Pressable,
  Center,
  Spinner,
  Avatar,
  Heading,
} from "native-base";
import { Input } from "../components/PatchedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PostCard from "../components/PostCard";
import FriendCard from "../components/FriendCard";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import useVerifyUser from "../hooks/useVerifyUser";
import AuthModal from "../components/AuthModal";

const Search = () => {
  const navigation = useNavigation();
  const { uid: currentUserID, loggedIn } = useVerifyUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState({
    people: [],
    posts: [],
  });
  const [loading, setLoading] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch user profile pic
  useEffect(() => {
    if (currentUserID) {
      fetchDataFromNode(`UsersDetails/${currentUserID}`).then((data) => {
        if (data) {
          setUserProfilePic(data.profilePhoto);
        }
      });
    } else {
      setUserProfilePic(null);
    }
  }, [currentUserID]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ people: [], posts: [] });
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    const lowerQuery = query.toLowerCase();

    // Search Users
    const usersData = await fetchDataFromNode("UsersDetails");
    let filteredUsers = [];
    if (usersData) {
      filteredUsers = Object.entries(usersData)
        .filter(
          ([id, user]) =>
            user.name?.toLowerCase().includes(lowerQuery) &&
            id !== currentUserID
        )
        .map(([id, user]) => ({
          uid: id,
          ...user,
        }));
    }

    // Search Posts
    const postsData = await fetchDataFromNode("Posts");
    let filteredPosts = [];
    if (postsData) {
      const validPosts = Object.entries(postsData).filter(([id, post]) =>
        post.postText?.toLowerCase().includes(lowerQuery)
      );

      filteredPosts = await Promise.all(
        validPosts.map(async ([id, post]) => {
          const userData = await fetchDataFromNode(`UsersDetails/${post.uid}`);
          return {
            id,
            ...post,
            username: userData?.name || "Unknown User",
            profilePic: userData?.profilePhoto,
          };
        })
      );
    }

    setSearchResults({
      people: filteredUsers,
      posts: filteredPosts,
    });
    setLoading(false);
  };

  const handleProfilePress = () => {
    if (loggedIn) {
      navigation.navigate("UserProfile", { userId: currentUserID });
    } else {
      setShowAuthModal(true);
    }
  };

  const renderTabs = () => (
    <HStack bg="white" shadow={1} mb={2}>
      {["all", "people", "posts"].map((tab) => (
        <Pressable
          key={tab}
          flex={1}
          py={3}
          onPress={() => setActiveTab(tab)}
          borderBottomWidth={2}
          borderBottomColor={activeTab === tab ? "primary.500" : "transparent"}
        >
          <Text
            textAlign="center"
            fontWeight={activeTab === tab ? "bold" : "normal"}
            color={activeTab === tab ? "primary.500" : "gray.600"}
            textTransform="capitalize"
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </HStack>
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
          Search
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

      <VStack space={2} p={4} bg="white" shadow={1}>
        <Input
          placeholder="Search users and posts..."
          size="lg"
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
          InputRightElement={
            searchQuery ? (
              <IconButton
                icon={
                  <Icon as={MaterialCommunityIcons} name="close" size={5} />
                }
                onPress={() => setSearchQuery("")}
                variant="ghost"
              />
            ) : null
          }
        />
      </VStack>

      {renderTabs()}

      <ScrollView>
        {loading ? (
          <Center py={10}>
            <Spinner size="lg" />
          </Center>
        ) : (
          <VStack space={4} p={4}>
            {/* People Section */}
            {(activeTab === "all" || activeTab === "people") &&
              searchResults.people.length > 0 && (
                <VStack space={2}>
                  {activeTab === "all" && (
                    <Text fontWeight="bold" color="gray.500">
                      People
                    </Text>
                  )}
                  {searchResults.people.map((user) => (
                    <FriendCard key={user.uid} friend={user} />
                  ))}
                </VStack>
              )}

            {/* Posts Section */}
            {(activeTab === "all" || activeTab === "posts") &&
              searchResults.posts.length > 0 && (
                <VStack space={4}>
                  {activeTab === "all" && (
                    <Text fontWeight="bold" color="gray.500">
                      Posts
                    </Text>
                  )}
                  {searchResults.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserID={currentUserID}
                    />
                  ))}
                </VStack>
              )}

            {/* No Results State */}
            {!loading &&
              searchQuery &&
              searchResults.people.length === 0 &&
              searchResults.posts.length === 0 && (
                <Center py={10}>
                  <Text color="gray.500">
                    No results found for "{searchQuery}"
                  </Text>
                </Center>
              )}

            {/* Empty State */}
            {!searchQuery && (
              <Center py={20}>
                <Icon
                  as={MaterialCommunityIcons}
                  name="magnify"
                  size={16}
                  color="gray.300"
                  mb={4}
                />
                <Text color="gray.400">
                  Type to search for people and posts
                </Text>
              </Center>
            )}
          </VStack>
        )}
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => setShowAuthModal(false)}
      />
    </Box>
  );
};

export default Search;

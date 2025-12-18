import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Avatar,
  Pressable,
  Center,
  Spinner,
  Heading,
  Divider,
  Icon,
} from "native-base";
import { RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FriendRequestCard from "../components/FriendRequestCard";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import ProfileEditModal from "../components/ProfileEditModal";
import AuthModal from "../components/AuthModal";
import { useProfile } from "../context/ProfileContext";

const Notifications = () => {
  const navigation = useNavigation();
  const {
    uid: currentUserID,
    loggedIn,
    showProfileModal,
    closeProfileModal,
    isProfileComplete,
  } = useProfile();

  const [activeTab, setActiveTab] = useState("activities");
  const [activities, setActivities] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    if (!currentUserID) return;

    const unsubscribe = listenDataFromNode(
      `notifications/${currentUserID}`,
      async (data) => {
        if (data) {
          await processNotifications(data);
        } else {
          setActivities([]);
          setFriendRequests([]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserID]);

  const fetchUserDetails = async (uid) => {
    const userDetails = await fetchDataFromNode(`UsersDetails/${uid}`);
    return {
      uid,
      name: userDetails?.name || "Unknown User",
      profilePhoto: userDetails?.profilePhoto,
    };
  };

  const processNotifications = async (data) => {
    // Process friend requests
    if (data.Friendrequest) {
      const requests = await Promise.all(
        Object.values(data.Friendrequest)
          .filter((request) => request.Request === "received")
          .map(async (request) => {
            const userDetails = await fetchUserDetails(request.id);
            return { ...request, ...userDetails };
          })
      );
      setFriendRequests(requests);
    } else {
      setFriendRequests([]);
    }

    // Process activities (likes, comments, reposts)
    if (data.Activities) {
      const processedActivities = [];

      for (const [postId, activity] of Object.entries(data.Activities)) {
        // Process comments
        if (activity.comments && activity.comments.length > 0) {
          const commentUsers = await Promise.all(
            activity.comments.map(async (comment) => ({
              ...comment,
              user: await fetchUserDetails(comment.uid),
            }))
          );
          const latestComment = commentUsers[commentUsers.length - 1];
          processedActivities.push({
            type: "comment",
            postId,
            count: commentUsers.length,
            latestUser: latestComment.user,
            date: latestComment.date,
          });
        }

        // Process likes
        if (activity.likes && activity.likes.length > 0) {
          const likeUsers = await Promise.all(
            activity.likes.map(async (like) => ({
              ...like,
              user: await fetchUserDetails(like.uid),
            }))
          );
          const latestLike = likeUsers[likeUsers.length - 1];
          processedActivities.push({
            type: "like",
            postId,
            count: likeUsers.length,
            latestUser: latestLike.user,
            date: latestLike.date,
          });
        }

        // Process reposts
        if (activity.reposts && activity.reposts.length > 0) {
          const repostUsers = await Promise.all(
            activity.reposts.map(async (repost) => ({
              ...repost,
              user: await fetchUserDetails(repost.uid || repost.userID),
            }))
          );
          const latestRepost = repostUsers[repostUsers.length - 1];
          processedActivities.push({
            type: "repost",
            postId,
            count: repostUsers.length,
            latestUser: latestRepost.user,
            date: latestRepost.date,
          });
        }
      }

      // Sort by date descending
      processedActivities.sort((a, b) => b.date - a.date);
      setActivities(processedActivities);
    } else {
      setActivities([]);
    }
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((activity) => {
      const dateKey = new Date(activity.date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    return groups;
  };

  const getActivityMessage = (activity) => {
    const { type, count, latestUser } = activity;
    const userName = latestUser?.name || "Someone";

    switch (type) {
      case "comment":
        return count === 1
          ? `${userName} commented on your post.`
          : `${userName} and ${count - 1} others commented on your post.`;
      case "like":
        return count === 1
          ? `${userName} liked your post.`
          : `${userName} and ${count - 1} others liked your post.`;
      case "repost":
        return count === 1
          ? `${userName} reposted your post.`
          : `${userName} and ${count - 1} others reposted your post.`;
      default:
        return "New activity on your post.";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "repost":
        return "🔄";
      default:
        return "📣";
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Data will refresh via listener
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateToPost = (postId) => {
    navigation.navigate("PostDetails", { postId });
  };

  const handleProfilePress = () => {
    if (loggedIn) {
      navigation.navigate("UserProfile", { userId: currentUserID });
    } else {
      setShowAuthModal(true);
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg="background.light" safeArea>
        <Center flex={1}>
          <Spinner size="lg" />
          <Text mt={2}>Loading notifications...</Text>
        </Center>
      </Box>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(b) - new Date(a)
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
          Notifications
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
          onPress={() => setActiveTab("activities")}
          borderBottomWidth={2}
          borderBottomColor={
            activeTab === "activities" ? "primary.500" : "transparent"
          }
        >
          <Text
            textAlign="center"
            fontWeight={activeTab === "activities" ? "bold" : "normal"}
            color={activeTab === "activities" ? "primary.500" : "gray.600"}
          >
            Activities
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          py={3}
          onPress={() => setActiveTab("requests")}
          borderBottomWidth={2}
          borderBottomColor={
            activeTab === "requests" ? "primary.500" : "transparent"
          }
        >
          <HStack justifyContent="center" alignItems="center" space={1}>
            <Text
              textAlign="center"
              fontWeight={activeTab === "requests" ? "bold" : "normal"}
              color={activeTab === "requests" ? "primary.500" : "gray.600"}
            >
              Friend Requests
            </Text>
            {friendRequests.length > 0 && (
              <Box
                bg="red.500"
                rounded="full"
                px={2}
                py={0.5}
                minW={5}
                alignItems="center"
              >
                <Text fontSize="xs" color="white" fontWeight="bold">
                  {friendRequests.length}
                </Text>
              </Box>
            )}
          </HStack>
        </Pressable>
      </HStack>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack p={4} space={2}>
          {/* Activities Tab */}
          {activeTab === "activities" && (
            <>
              {sortedDates.length > 0 ? (
                sortedDates.map((date) => (
                  <VStack key={date} mb={4}>
                    <Text
                      color="gray.500"
                      fontSize="sm"
                      fontWeight="bold"
                      mb={2}
                    >
                      {date}
                    </Text>
                    {groupedActivities[date].map((activity, index) => (
                      <Pressable
                        key={`${activity.postId}-${activity.type}-${index}`}
                        onPress={() => navigateToPost(activity.postId)}
                      >
                        <Box bg="white" rounded="lg" shadow={1} p={3} mb={2}>
                          <HStack space={3} alignItems="center">
                            <Avatar
                              size="md"
                              source={{
                                uri:
                                  activity.latestUser?.profilePhoto ||
                                  "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
                              }}
                            />
                            <VStack flex={1}>
                              <HStack alignItems="center" space={1}>
                                <Text fontSize="lg">
                                  {getActivityIcon(activity.type)}
                                </Text>
                                <Text flex={1} fontSize="sm">
                                  {getActivityMessage(activity)}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(activity.date).toLocaleTimeString()}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </Pressable>
                    ))}
                  </VStack>
                ))
              ) : (
                <Center py={10}>
                  <Text color="gray.500">No activities yet</Text>
                </Center>
              )}
            </>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <>
              {friendRequests.length > 0 ? (
                friendRequests.map((request, index) => (
                  <FriendRequestCard
                    key={request.uid || index}
                    request={request}
                    currentUserID={currentUserID}
                  />
                ))
              ) : (
                <Center py={10}>
                  <Text color="gray.500">No friend requests</Text>
                </Center>
              )}
            </>
          )}
        </VStack>
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => setShowAuthModal(false)}
      />

      {/* Profile Edit Modal - shows when profile is incomplete */}
      <ProfileEditModal
        isOpen={showProfileModal && loggedIn && !isProfileComplete}
        onClose={closeProfileModal}
        isFirstTime={true}
        uid={currentUserID}
      />
    </Box>
  );
};

export default Notifications;

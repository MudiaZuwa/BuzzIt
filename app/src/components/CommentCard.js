import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Image,
  Pressable,
  Center,
  Spinner,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import updateDataInNode from "../functions/updateDataInNode";

const isVideo = (url) => {
  if (!url) return false;
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "m4v"];
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  return videoExtensions.includes(extension);
};

const CommentCard = ({ commentIndex, comment, postID, currentUserID }) => {
  const navigation = useNavigation();
  const { uid, date, postText: text, media, likes = [] } = comment;

  const [commentLikes, setCommentLikes] = useState(likes);
  const [userData, setUserData] = useState({
    profilePic: null,
    username: "User",
  });
  const hasLiked = commentLikes.includes(currentUserID);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userPath = `UsersDetails/${uid}`;
        const userDetails = await fetchDataFromNode(userPath);
        if (userDetails) {
          setUserData({
            profilePic: userDetails.profilePhoto,
            username: userDetails.name,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (uid) {
      fetchUserData();
    }
  }, [uid]);

  const handleLike = async () => {
    const updatedLikes = hasLiked
      ? commentLikes.filter((id) => id !== currentUserID)
      : [...commentLikes, currentUserID];

    await updateDataInNode(`Posts/${postID}/comments/${commentIndex}`, {
      likes: updatedLikes,
    });

    setCommentLikes(updatedLikes);
  };

  const navigateToProfile = () => {
    navigation.navigate("UserProfile", { userId: uid });
  };

  return (
    <Box bg="white" rounded="lg" shadow={1} mb={3} p={3}>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={2}>
        <Pressable onPress={navigateToProfile}>
          <Avatar
            size="sm"
            source={{
              uri:
                userData.profilePic ||
                "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
            }}
          />
        </Pressable>
        <VStack flex={1}>
          <Pressable onPress={navigateToProfile}>
            <Text fontWeight="bold" fontSize="sm">
              {userData.username}
            </Text>
          </Pressable>
          <Text fontSize="xs" color="gray.500">
            {date ? new Date(date).toLocaleString() : ""}
          </Text>
        </VStack>
      </HStack>

      {/* Comment Text */}
      {text && <Text mb={2}>{text}</Text>}

      {/* Media */}
      {media && (
        <Box height={150} mb={2} rounded="md" overflow="hidden">
          {isVideo(media) ? (
            <Video
              source={{ uri: media }}
              style={{ width: "100%", height: "100%" }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (
            <Image
              source={{ uri: media }}
              alt="Comment media"
              width="100%"
              height="100%"
              resizeMode="contain"
              fallbackElement={
                <Center flex={1} bg="gray.200">
                  <Spinner />
                </Center>
              }
            />
          )}
        </Box>
      )}

      {/* Like Button */}
      <HStack justifyContent="flex-end">
        <HStack space={1} alignItems="center">
          <IconButton
            size="sm"
            icon={
              <MaterialCommunityIcons
                name={hasLiked ? "heart" : "heart-outline"}
                size={18}
                color={hasLiked ? "#e91e63" : "#666"}
              />
            }
            onPress={handleLike}
          />
          <Text fontSize="sm" color="gray.600">
            {commentLikes.length}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default CommentCard;

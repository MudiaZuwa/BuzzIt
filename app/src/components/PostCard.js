import React, { useState, useCallback, memo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Image,
  Pressable,
  ScrollView,
  Divider,
  Badge,
  Center,
  Spinner,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Linking, Share, Dimensions, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import updateDataInNode from "../functions/updateDataInNode";

const { width } = Dimensions.get("window");

const isVideo = (url) => {
  if (!url) return false;
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "m4v"];
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  return videoExtensions.includes(extension);
};

const PostCard = ({ post, currentUserID }) => {
  const navigation = useNavigation();
  const {
    profilePic,
    username,
    uid,
    date,
    postText: text,
    media,
    likes,
    reposts,
    comments,
  } = post;

  const hasLiked = likes && likes.includes(currentUserID);
  const hasReposted =
    reposts && reposts.some((repost) => repost.userID === currentUserID);

  const [currentMedia, setCurrentMedia] = useState(0);

  const handleLike = useCallback(async () => {
    const postRef = `Posts/${post.id}`;
    const notificationsRef = `notifications/${uid}/Activities/${post.id}`;

    const currentDate = Date.now();

    const updatedLikes = hasLiked
      ? likes.filter((id) => id !== currentUserID)
      : [...(likes || []), currentUserID];

    await updateDataInNode(postRef, { likes: updatedLikes });

    if (currentUserID !== post.userId) {
      await updateDataInNode(notificationsRef, {
        likes: updatedLikes.map((likeId) => ({
          uid: likeId,
          date: currentDate,
        })),
      });
    }
  }, [post.id, uid, hasLiked, likes, currentUserID, post.userId]);

  const handleRepost = useCallback(async () => {
    const postRef = `Posts/${post.id}`;
    const notificationsRef = `notifications/${uid}/Activities/${post.id}`;

    const repostData = {
      userID: currentUserID,
      date: Date.now(),
    };

    const updatedReposts = hasReposted
      ? reposts.filter((repost) => repost.userID !== currentUserID)
      : [...(reposts || []), repostData];

    await updateDataInNode(postRef, { reposts: updatedReposts });

    if (currentUserID !== uid) {
      await updateDataInNode(notificationsRef, updatedReposts);
    }
  }, [post.id, uid, hasReposted, reposts, currentUserID]);

  const handleShare = useCallback(async () => {
    const postUrl = `https://buzzit.com/${uid}/${post.id}`;

    try {
      await Share.share({
        message: `Check out ${username}'s post!\n\n${text || ""}\n\n${postUrl}`,
        url: postUrl,
        title: `${username}'s Post`,
      });
    } catch (error) {
      console.error("Error sharing post", error);
    }
  }, [uid, post.id, username, text]);

  const navigateToPost = useCallback(() => {
    navigation.navigate("PostDetails", { userId: uid, postId: post.id });
  }, [navigation, uid, post.id]);

  const navigateToProfile = useCallback(() => {
    navigation.navigate("UserProfile", { userId: uid });
  }, [navigation, uid]);

  return (
    <Box bg="white" rounded="lg" shadow={2} mb={4}>
      {/* Header */}
      <HStack p={3} space={3} alignItems="center">
        <Pressable onPress={navigateToProfile}>
          <Avatar
            size="md"
            source={{
              uri:
                profilePic ||
                "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
            }}
          />
        </Pressable>
        <VStack flex={1}>
          <Pressable onPress={navigateToProfile}>
            <Text fontWeight="bold" fontSize="md">
              {username}
            </Text>
          </Pressable>
          <Text fontSize="xs" color="gray.500">
            {new Date(date).toLocaleString()}
          </Text>
        </VStack>
      </HStack>

      {/* Post Body */}
      <Pressable onPress={navigateToPost}>
        <VStack space={2} px={3} pb={2}>
          {text && <Text>{text}</Text>}

          {/* Media Carousel */}
          {media && media.length > 0 && (
            <Box>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / (width - 32)
                  );
                  setCurrentMedia(index);
                }}
              >
                {media.map((mediaItem, index) => (
                  <Box key={index} width={width - 32} height={250}>
                    {isVideo(mediaItem) ? (
                      <Video
                        source={{ uri: mediaItem }}
                        style={{ width: "100%", height: "100%" }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                      />
                    ) : (
                      <Image
                        source={{ uri: mediaItem }}
                        alt={`Media ${index + 1}`}
                        width="100%"
                        height="100%"
                        resizeMode="contain"
                        fallbackElement={
                          <Center flex={1} bg="gray.200">
                            <Spinner size="lg" />
                          </Center>
                        }
                      />
                    )}
                  </Box>
                ))}
              </ScrollView>
              {media.length > 1 && (
                <HStack space={1} justifyContent="center" mt={2}>
                  {media.map((_, index) => (
                    <Box
                      key={index}
                      width={2}
                      height={2}
                      rounded="full"
                      bg={currentMedia === index ? "primary.500" : "gray.300"}
                    />
                  ))}
                </HStack>
              )}
            </Box>
          )}
        </VStack>
      </Pressable>

      <Divider />

      {/* Footer Actions */}
      <HStack p={3} space={4} justifyContent="space-around">
        <HStack space={1} alignItems="center">
          <IconButton
            icon={
              <MaterialCommunityIcons
                name={hasLiked ? "heart" : "heart-outline"}
                size={20}
                color={hasLiked ? "#e91e63" : "#666"}
              />
            }
            onPress={handleLike}
          />
          <Text fontSize="sm">{likes ? likes.length : 0}</Text>
        </HStack>

        <HStack space={1} alignItems="center">
          <IconButton
            icon={
              <MaterialCommunityIcons
                name={hasReposted ? "repeat" : "repeat"}
                size={20}
                color={hasReposted ? "#4caf50" : "#666"}
              />
            }
            onPress={handleRepost}
          />
          <Text fontSize="sm">{reposts ? reposts.length : 0}</Text>
        </HStack>

        <HStack space={1} alignItems="center">
          <IconButton
            icon={
              <MaterialCommunityIcons
                name="comment-outline"
                size={20}
                color="#666"
              />
            }
            onPress={navigateToPost}
          />
          <Text fontSize="sm">{comments ? comments.length : 0}</Text>
        </HStack>

        <IconButton
          icon={
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={20}
              color="#666"
            />
          }
          onPress={handleShare}
        />
      </HStack>
    </Box>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(PostCard, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes?.length === nextProps.post.likes?.length &&
    prevProps.post.reposts?.length === nextProps.post.reposts?.length &&
    prevProps.post.comments?.length === nextProps.post.comments?.length &&
    prevProps.currentUserID === nextProps.currentUserID
  );
});

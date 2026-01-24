import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Button,
  Icon,
  Heading,
  Spinner,
  Center,
  IconButton,
  useToast,
} from "native-base";
import { Input } from "../components/PatchedInput";
import { RefreshControl, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PostCard from "../components/PostCard";
import CommentCard from "../components/CommentCard";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import updateDataInNode from "../functions/updateDataInNode";
import useVerifyUser from "../hooks/useVerifyUser";

const PostDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, postId } = route.params || {};
  const { uid: currentUserID } = useVerifyUser();
  const toast = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleGetPostUser = async (postData) => {
    try {
      const userPath = `UsersDetails/${postData.uid}`;
      const userData = await fetchDataFromNode(userPath);

      return {
        id: postId,
        ...postData,
        username: userData?.name || "Unknown User",
        profilePic: userData?.profilePhoto || null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { id: postId, ...postData };
    }
  };

  const updatePostDetails = async (postData) => {
    if (postData) {
      const postWithUser = await handleGetPostUser(postData);
      setPost(postWithUser);
      setComments(postData.comments || []);
    } else {
      setPost(null);
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!postId) return;

    const unsubscribe = listenDataFromNode(
      `Posts/${postId}`,
      updatePostDetails
    );
    return () => unsubscribe();
  }, [postId]);

  const onRefresh = async () => {
    setRefreshing(true);
    const postData = await fetchDataFromNode(`Posts/${postId}`);
    await updatePostDetails(postData);
    setRefreshing(false);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUserID) return;

    setSubmitting(true);
    try {
      const newComment = {
        uid: currentUserID,
        postText: commentText.trim(),
        date: Date.now(),
        likes: [],
      };

      const updatedComments = [...comments, newComment];
      await updateDataInNode(`Posts/${postId}`, { comments: updatedComments });

      // Send notification to post owner
      if (userId && userId !== currentUserID) {
        const notificationsRef = `notifications/${userId}/Activities/${postId}`;
        const existingNotification = await fetchDataFromNode(notificationsRef);
        const existingComments = existingNotification?.comments || [];

        await updateDataInNode(notificationsRef, {
          comments: [
            ...existingComments,
            { uid: currentUserID, date: Date.now() },
          ],
        });
      }

      setCommentText("");
      toast.show({
        description: "Comment added!",
        placement: "top",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.show({
        description: "Failed to add comment",
        placement: "top",
      });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Box flex={1} bg="background.light" safeArea>
        <Center flex={1}>
          <Spinner size="lg" />
          <Text mt={2}>Loading post...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Box flex={1} bg="background.light" safeArea>
        {/* Header */}
        <HStack p={3} alignItems="center" space={3} bg="white" shadow={1}>
          <IconButton
            icon={
              <Icon as={MaterialCommunityIcons} name="arrow-left" size="md" />
            }
            onPress={() => navigation.goBack()}
          />
          <Heading size="md">Post</Heading>
        </HStack>

        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <VStack space={4} p={4}>
            {/* Post */}
            {post ? (
              <PostCard post={post} currentUserID={currentUserID} />
            ) : (
              <Center py={10}>
                <Text color="gray.500">Post not found</Text>
              </Center>
            )}

            {/* Comments Section */}
            <VStack space={2}>
              <Heading size="sm">Comments ({comments.length})</Heading>

              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <CommentCard
                    key={index}
                    commentIndex={index}
                    comment={comment}
                    postID={postId}
                    currentUserID={currentUserID}
                  />
                ))
              ) : (
                <Center py={6}>
                  <Text color="gray.500">
                    No comments yet. Be the first to comment!
                  </Text>
                </Center>
              )}
            </VStack>
          </VStack>
        </ScrollView>

        {/* Comment Input */}
        <HStack
          p={3}
          space={2}
          bg="white"
          alignItems="center"
          shadow={2}
          borderTopWidth={1}
          borderTopColor="gray.200"
        >
          <Input
            flex={1}
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            isDisabled={submitting}
          />
          <IconButton
            icon={
              <Icon
                as={MaterialCommunityIcons}
                name="send"
                size="md"
                color={commentText.trim() ? "primary.500" : "gray.400"}
              />
            }
            onPress={handleSubmitComment}
            isDisabled={!commentText.trim() || submitting}
            isLoading={submitting}
          />
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default PostDetails;

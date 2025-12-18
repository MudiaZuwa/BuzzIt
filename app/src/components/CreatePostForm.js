import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  TextArea,
  Pressable,
  Image,
  Text,
  useToast,
  Icon,
  Alert,
} from "native-base";
import { Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video } from "expo-av";

import { database } from "../config/firebase";
import handleFileUpload from "../functions/handleFileUpload";
import fetchDataFromNode from "../functions/fetchDataFromNode";

const { width: screenWidth } = Dimensions.get("window");
const mediaHeight = 200;

const CreatePostForm = ({ uid, handleClose, commentDetails }) => {
  const [postText, setPostText] = useState("");
  const [files, setFiles] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const toast = useToast();

  const handleFileChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: !commentDetails,
      quality: 0.8,
      selectionLimit: commentDetails ? 1 : 5,
    });

    if (!result.canceled) {
      setFiles((prevFiles) => [...prevFiles, ...result.assets]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (currentIndex >= files.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!uid) {
      setError("Please log in to post");
      return;
    }
    if (postText.trim() === "" && files.length === 0) {
      return;
    }

    try {
      const userDetails = await fetchDataFromNode(`UsersDetails/${uid}`);
      if (!userDetails || !userDetails.name) {
        setError(
          "Please complete your profile (set a name) in settings before posting."
        );
        return;
      }
    } catch (err) {
      console.error("Error verifying profile:", err);
      setError("Unable to verify profile. Please try again.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      let mediaUrls = [];
      if (files.length > 0) {
        const fileData = files.map((asset, index) => ({
          name: `media_${Date.now()}_${index}${
            asset.type === "video" ? ".mp4" : ".jpg"
          }`,
          uri: asset.uri,
          type: asset.type === "video" ? "video/mp4" : "image/jpeg",
        }));
        mediaUrls = await handleFileUpload(fileData, "posts", uid);
      }

      const postData = {
        uid,
        postText,
        media: mediaUrls,
        date: Date.now(),
        likes: [],
        reposts: [],
        comments: [],
      };

      if (commentDetails) {
        postData.parentPost = commentDetails.parentPostId;
        postData.parentUser = commentDetails.parentUserId;
      }

      const postRef = database.ref("Posts").push();
      await postRef.set(postData);

      setSuccess(true);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Error creating post. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (success) {
      if (typeof handleClose === "function") handleClose();
      setPostText("");
      setFiles([]);
      setCurrentIndex(0);
      setSuccess(false);
      toast.show({ description: "Post created!" });
    }
  }, [success]);

  const goToNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <VStack space={3}>
      {/* Error Alert */}
      {error && (
        <Alert status="error" w="100%">
          <HStack space={2} alignItems="center">
            <Alert.Icon />
            <Text color="error.600" fontSize="sm">
              {error}
            </Text>
          </HStack>
        </Alert>
      )}

      {/* Text Area */}
      <TextArea
        placeholder="What's on your mind?"
        value={postText}
        onChangeText={setPostText}
        h={20}
        fontSize="md"
        borderRadius="md"
        isDisabled={isPending}
        bg="white"
      />

      {/* Media Carousel */}
      {files.length > 0 && (
        <Box
          position="relative"
          height={mediaHeight}
          bg="gray.100"
          borderRadius="md"
          overflow="hidden"
        >
          {/* Current Media */}
          {files[currentIndex]?.type === "video" ? (
            <Video
              source={{ uri: files[currentIndex].uri }}
              style={{ width: "100%", height: mediaHeight }}
              useNativeControls
              resizeMode="contain"
            />
          ) : (
            <Image
              source={{ uri: files[currentIndex]?.uri }}
              alt="Selected media"
              width="100%"
              height={mediaHeight}
              resizeMode="contain"
            />
          )}

          {/* Remove Button (centered like web) */}
          <Pressable
            position="absolute"
            top="50%"
            left="50%"
            style={{ transform: [{ translateX: -25 }, { translateY: -25 }] }}
            onPress={() => handleRemoveFile(currentIndex)}
            bg="rgba(255, 255, 255, 0.7)"
            borderRadius="full"
            p={2}
            width={50}
            height={50}
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              as={MaterialCommunityIcons}
              name="close-circle"
              size="xl"
              color="gray.700"
            />
          </Pressable>

          {/* Navigation Arrows */}
          {files.length > 1 && (
            <>
              {currentIndex > 0 && (
                <Pressable
                  position="absolute"
                  left={2}
                  top="50%"
                  style={{ transform: [{ translateY: -15 }] }}
                  onPress={goToPrev}
                  bg="rgba(0,0,0,0.5)"
                  borderRadius="full"
                  p={1}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="chevron-left"
                    size="lg"
                    color="white"
                  />
                </Pressable>
              )}
              {currentIndex < files.length - 1 && (
                <Pressable
                  position="absolute"
                  right={2}
                  top="50%"
                  style={{ transform: [{ translateY: -15 }] }}
                  onPress={goToNext}
                  bg="rgba(0,0,0,0.5)"
                  borderRadius="full"
                  p={1}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="chevron-right"
                    size="lg"
                    color="white"
                  />
                </Pressable>
              )}
            </>
          )}

          {/* Indicator dots */}
          {files.length > 1 && (
            <HStack position="absolute" bottom={2} alignSelf="center" space={1}>
              {files.map((_, index) => (
                <Box
                  key={index}
                  width={2}
                  height={2}
                  borderRadius="full"
                  bg={index === currentIndex ? "primary.500" : "gray.300"}
                />
              ))}
            </HStack>
          )}
        </Box>
      )}

      {/* Bottom Row: Add Media Icon + Post Button */}
      <HStack justifyContent="space-between" alignItems="center">
        <Pressable onPress={handleFileChange} isDisabled={isPending}>
          <Icon
            as={MaterialCommunityIcons}
            name="image"
            size="2xl"
            color="gray.500"
          />
        </Pressable>

        <Button
          colorScheme="green"
          onPress={handleSubmit}
          isLoading={isPending}
          isDisabled={
            (postText.trim() === "" && files.length === 0) || isPending
          }
        >
          Post
        </Button>
      </HStack>
    </VStack>
  );
};

export default CreatePostForm;

import React, { useEffect, useState } from "react";
import {
  Modal,
  VStack,
  HStack,
  Button,
  Text,
  Box,
  Image,
  FormControl,
  useToast,
  Icon,
  IconButton,
  Pressable,
  ScrollView,
} from "native-base";
import { Input, TextArea } from "./PatchedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import handleProfileEdit from "../functions/handleProfileEdit";
import { useProfile } from "../context/ProfileContext";

const ProfileEditModal = ({
  isOpen,
  onClose,
  isFirstTime = false,
  uid: propUid,
  userProfile: propUserProfile,
}) => {
  const profileContext = useProfile();
  const uid = propUid || profileContext.uid;
  const userProfile = propUserProfile || profileContext.userProfile;
  const toast = useToast();

  const [coverPhotoUri, setCoverPhotoUri] = useState(null);
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [dob, setDob] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [dobError, setDobError] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with current user data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCoverPhotoUri(userProfile?.coverPhoto || null);
      setProfilePhotoUri(userProfile?.profilePhoto || null);
      setName(userProfile?.name || "");
      setAbout(userProfile?.about || "");
      setDob(userProfile?.dob || "");
      setNameError(false);
      setDobError(false);
      setError(null);
      setSuccess(false);
      setCoverPhotoFile(null);
      setProfilePhotoFile(null);
    }
  }, [isOpen, userProfile]);

  // Handle success
  useEffect(() => {
    if (success) {
      toast.show({ description: "Profile updated successfully!" });
      onClose();
      setSuccess(false);
    }
  }, [success]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.show({ description: error });
    }
  }, [error]);

  const pickImage = async (type) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.show({
          description: "Permission to access gallery is required!",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "cover" ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (type === "cover") {
          setCoverPhotoUri(asset.uri);
          setCoverPhotoFile({
            uri: asset.uri,
            fileName: asset.fileName || `cover_${Date.now()}.jpg`,
          });
        } else {
          setProfilePhotoUri(asset.uri);
          setProfilePhotoFile({
            uri: asset.uri,
            fileName: asset.fileName || `profile_${Date.now()}.jpg`,
          });
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
      toast.show({ description: "Failed to pick image" });
    }
  };

  const handleSave = () => {
    // Reset errors
    setNameError(false);
    setDobError(false);
    setError(null);

    // Validate required fields
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (!dob.trim()) {
      setDobError(true);
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      setDobError(true);
      toast.show({ description: "Please enter date in YYYY-MM-DD format" });
      return;
    }

    const userDetails = {
      uid,
      name: name.trim(),
      about: about.trim(),
      dob,
      coverPhoto: coverPhotoFile,
      profilePhoto: profilePhotoFile,
    };

    const setStates = {
      setError,
      setIsPending,
      setSuccess,
    };

    handleProfileEdit(userDetails, setStates);
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  const canSkip = !isFirstTime || (userProfile?.name && userProfile?.dob);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <Modal.Content width="90%" height="500px" maxHeight="85%">
        <Modal.Header>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {canSkip ? (
              <IconButton
                icon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="close"
                    size="md"
                    color="gray.600"
                  />
                }
                onPress={handleClose}
                isDisabled={isPending}
              />
            ) : (
              <Box width={10} />
            )}
            <Text fontSize="lg" fontWeight="bold">
              {isFirstTime ? "Complete Your Profile" : "Edit Profile"}
            </Text>
            <Button
              onPress={handleSave}
              isLoading={isPending}
              isDisabled={isPending}
              size="sm"
            >
              Save
            </Button>
          </HStack>
        </Modal.Header>

        <Modal.Body>
          <ScrollView>
            <VStack space={4} pb={6}>
              {/* Cover Photo */}
              <Pressable
                onPress={() => pickImage("cover")}
                isDisabled={isPending}
              >
                <Box
                  height={150}
                  bg="gray.200"
                  borderRadius="md"
                  overflow="hidden"
                  position="relative"
                >
                  {coverPhotoUri ? (
                    <Image
                      source={{ uri: coverPhotoUri }}
                      alt="Cover"
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                  ) : (
                    <Box flex={1} bg="primary.100" />
                  )}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    style={{
                      transform: [{ translateX: -25 }, { translateY: -25 }],
                    }}
                    bg="rgba(255,255,255,0.8)"
                    borderRadius="full"
                    p={3}
                  >
                    <Icon
                      as={MaterialCommunityIcons}
                      name="camera"
                      size="lg"
                      color="gray.600"
                    />
                  </Box>
                </Box>
                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                  Tap to change cover photo
                </Text>
              </Pressable>

              {/* Profile Photo */}
              <HStack justifyContent="center">
                <Pressable
                  onPress={() => pickImage("profile")}
                  isDisabled={isPending}
                >
                  <Box position="relative">
                    <Image
                      source={{
                        uri:
                          profilePhotoUri ||
                          "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff",
                      }}
                      alt="Profile"
                      size={100}
                      borderRadius="full"
                      borderWidth={3}
                      borderColor="white"
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      bg="primary.500"
                      borderRadius="full"
                      p={2}
                    >
                      <Icon
                        as={MaterialCommunityIcons}
                        name="camera"
                        size="sm"
                        color="white"
                      />
                    </Box>
                  </Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textAlign="center"
                    mt={1}
                  >
                    Tap to change profile photo
                  </Text>
                </Pressable>
              </HStack>

              {/* Name Input */}
              <FormControl isRequired isInvalid={nameError}>
                <FormControl.Label>Name</FormControl.Label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  isDisabled={isPending}
                  size="lg"
                />
                <FormControl.ErrorMessage>
                  Please enter your name
                </FormControl.ErrorMessage>
              </FormControl>

              {/* About Input */}
              <FormControl>
                <FormControl.Label>About</FormControl.Label>
                <TextArea
                  placeholder="Tell us about yourself"
                  value={about}
                  onChangeText={setAbout}
                  isDisabled={isPending}
                  totalLines={3}
                  autoCompleteType={undefined}
                />
              </FormControl>

              {/* Date of Birth Input */}
              <FormControl isRequired isInvalid={dobError}>
                <FormControl.Label>Date of Birth</FormControl.Label>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={dob}
                  onChangeText={setDob}
                  isDisabled={isPending}
                  size="lg"
                  keyboardType="numbers-and-punctuation"
                />
                <FormControl.HelperText>
                  Enter in YYYY-MM-DD format (e.g., 1990-05-15)
                </FormControl.HelperText>
                <FormControl.ErrorMessage>
                  Please enter your date of birth
                </FormControl.ErrorMessage>
              </FormControl>

              {isFirstTime && !canSkip && (
                <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
                  Please complete your profile to continue using the app
                </Text>
              )}
            </VStack>
          </ScrollView>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default ProfileEditModal;

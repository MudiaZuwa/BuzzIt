import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Pressable,
  Icon,
} from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { AppState } from "react-native";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import deleteDataInNode from "../functions/deleteDataInNode";
import AudioCallModal from "./AudioCallModal";
import VideoCallModal from "./VideoCallModal";
import { sendCallNotification } from "../services/notificationService";

const IncomingCallModal = ({ uid }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerDetails, setCallerDetails] = useState(null);
  const [ringtoneSound, setRingtoneSound] = useState(null);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  // Listen for incoming calls
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = listenDataFromNode(
      `UsersCalls/${uid}`,
      async (data) => {
        if (data) {
          // Find incoming calls
          const calls = Object.entries(data);
          const incoming = calls.find(
            ([_, call]) => call.caller === "incoming"
          );

          if (incoming) {
            const [callId, callData] = incoming;
            setIncomingCall({ id: callId, ...callData });

            // Fetch caller details
            const details = await fetchDataFromNode(
              `UsersDetails/${callData.friend}`
            );
            setCallerDetails(details);

            // Send notification if app is in background
            if (AppState.currentState !== "active" && details) {
              sendCallNotification({
                callerName: details.name || "Unknown Caller",
                callerPhoto: details.profilePhoto,
                callType: callData.callType,
                callData: {
                  callId,
                  callerId: callData.friend,
                  callType: callData.callType,
                },
              });
            }
          } else {
            setIncomingCall(null);
            setCallerDetails(null);
          }
        } else {
          setIncomingCall(null);
          setCallerDetails(null);
        }
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // Play ringtone when there's an incoming call
  useEffect(() => {
    if (incomingCall && callerDetails && !showAudioCall && !showVideoCall) {
      playRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [incomingCall, callerDetails, showAudioCall, showVideoCall]);

  const playRingtone = async () => {
    try {
      // Note: Add ringtone.mp3 to assets/audio/ folder
      // For now, silently fail if file doesn't exist
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/ringtone.mp3"),
        { isLooping: true }
      );
      setRingtoneSound(sound);
      await sound.playAsync();
    } catch (error) {
      // Audio file not found - continue without ringtone
      console.log("Ringtone not available:", error.message);
    }
  };

  const stopRingtone = async () => {
    if (ringtoneSound) {
      await ringtoneSound.stopAsync();
      await ringtoneSound.unloadAsync();
      setRingtoneSound(null);
    }
  };

  const handleAccept = () => {
    stopRingtone();
    if (incomingCall.callType === "video") {
      setShowVideoCall(true);
    } else {
      setShowAudioCall(true);
    }
  };

  const handleReject = async () => {
    stopRingtone();

    if (incomingCall) {
      await Promise.all([
        deleteDataInNode(`UsersCalls/${uid}/${incomingCall.id}`),
        deleteDataInNode(
          `UsersCalls/${incomingCall.friend}/${incomingCall.id}`
        ),
        deleteDataInNode(`Calls/${incomingCall.id}`),
      ]);
    }

    setIncomingCall(null);
    setCallerDetails(null);
  };

  const handleCallClose = () => {
    setShowAudioCall(false);
    setShowVideoCall(false);
    setIncomingCall(null);
    setCallerDetails(null);
  };

  const defaultPhoto =
    "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff";

  // Show call modal if accepted
  if (showAudioCall && incomingCall) {
    return (
      <AudioCallModal
        isOpen={true}
        onClose={handleCallClose}
        uid={uid}
        recipientId={incomingCall.friend}
        caller="recipient"
        recipientDetails={callerDetails}
      />
    );
  }

  if (showVideoCall && incomingCall) {
    return (
      <VideoCallModal
        isOpen={true}
        onClose={handleCallClose}
        uid={uid}
        recipientId={incomingCall.friend}
        caller="recipient"
        recipientDetails={callerDetails}
      />
    );
  }

  // Show incoming call UI
  if (!incomingCall || !callerDetails) return null;

  return (
    <Modal isOpen={true} size="full">
      <Modal.Content bg="gray.900" width="100%" height="100%">
        <Modal.Body flex={1} justifyContent="center" alignItems="center">
          <VStack space={6} alignItems="center">
            <Avatar
              size="2xl"
              source={{
                uri: callerDetails.profilePhoto || defaultPhoto,
              }}
            />
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {callerDetails.name}
            </Text>
            <Text color="gray.400" fontSize="lg">
              Incoming {incomingCall.callType === "video" ? "video" : "audio"}{" "}
              call...
            </Text>

            <HStack space={16} mt={10}>
              {/* Reject Button */}
              <VStack alignItems="center" space={2}>
                <Pressable onPress={handleReject}>
                  <Box bg="red.500" borderRadius="full" p={5} shadow={3}>
                    <Icon
                      as={MaterialCommunityIcons}
                      name="phone-hangup"
                      size="2xl"
                      color="white"
                    />
                  </Box>
                </Pressable>
                <Text color="gray.400" fontSize="sm">
                  Decline
                </Text>
              </VStack>

              {/* Accept Button */}
              <VStack alignItems="center" space={2}>
                <Pressable onPress={handleAccept}>
                  <Box bg="green.500" borderRadius="full" p={5} shadow={3}>
                    <Icon
                      as={MaterialCommunityIcons}
                      name={
                        incomingCall.callType === "video" ? "video" : "phone"
                      }
                      size="2xl"
                      color="white"
                    />
                  </Box>
                </Pressable>
                <Text color="gray.400" fontSize="sm">
                  Accept
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default IncomingCallModal;

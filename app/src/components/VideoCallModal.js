import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Icon,
  Pressable,
  Center,
  Button,
} from "native-base";
import { StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { database } from "../config/firebase";
import { ref, set, push, update, onDisconnect } from "firebase/database";
import listenDataFromNode from "../functions/listenDataFromNode";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import deleteDataInNode from "../functions/deleteDataInNode";

// Try to import WebRTC - will fail in Expo Go
let RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  mediaDevices;
let isWebRTCAvailable = false;

try {
  const webrtc = require("react-native-webrtc");
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCSessionDescription = webrtc.RTCSessionDescription;
  RTCIceCandidate = webrtc.RTCIceCandidate;
  RTCView = webrtc.RTCView;
  mediaDevices = webrtc.mediaDevices;
  isWebRTCAvailable = true;
} catch (error) {
  console.log("WebRTC not available - call features disabled in Expo Go");
}

const { width, height } = Dimensions.get("window");

const VideoCallModal = ({
  isOpen,
  onClose,
  uid,
  recipientId,
  caller, // "user" (outgoing) or "recipient" (incoming)
  recipientDetails: propRecipientDetails,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callState, setCallState] = useState("calling");
  const [recipientDetails, setRecipientDetails] =
    useState(propRecipientDetails);
  const [roomId, setRoomId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [ringtoneSound, setRingtoneSound] = useState(null);
  const [localStreamURL, setLocalStreamURL] = useState(null);
  const [remoteStreamURL, setRemoteStreamURL] = useState(null);

  const callStateRef = useRef(callState);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const roomIdRef = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      },
    ],
  };

  // Keep ref in sync
  useEffect(() => {
    callStateRef.current = callState;
    roomIdRef.current = roomId;
  }, [callState, roomId]);

  // Fetch recipient details if not provided
  useEffect(() => {
    if (isOpen && !propRecipientDetails && recipientId) {
      fetchRecipientDetails();
    } else if (propRecipientDetails) {
      setRecipientDetails(propRecipientDetails);
    }
  }, [propRecipientDetails, isOpen, recipientId]);

  // Initialize call when modal opens
  useEffect(() => {
    if (isOpen && recipientDetails && callState === "calling") {
      if (caller === "user") {
        createRoom();
      } else {
        getLocalStream();
      }
    }

    if (!isOpen) {
      cleanup();
    }
  }, [isOpen, recipientDetails, callState, caller]);

  // Handle call state changes
  useEffect(() => {
    if (callState === "answered") {
      joinRoom();
    } else if (callState === "onCall" && elapsedTime === 0) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState, elapsedTime]);

  // Ringtone handling
  useEffect(() => {
    if (isOpen && callState !== "onCall") {
      playRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [isOpen, callState]);

  const playRingtone = async () => {
    try {
      // Note: Add ringtone.mp3 and ringback.mp3 to assets/audio/ folder
      // For now, silently fail if files don't exist
      const audioFile =
        caller === "user"
          ? require("../../assets/audio/ringback.mp3")
          : require("../../assets/audio/ringtone.mp3");
      const { sound } = await Audio.Sound.createAsync(audioFile, {
        isLooping: true,
      });
      setRingtoneSound(sound);
      await sound.playAsync();
    } catch (error) {
      // Audio files not found - continue without ringtone
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

  const fetchRecipientDetails = async () => {
    const details = await fetchDataFromNode(`UsersDetails/${recipientId}`);
    setRecipientDetails(details);
  };

  const getLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStreamURL(stream.toURL());
    } catch (error) {
      console.error("Error getting local stream:", error);
    }
  };

  const createRoom = async () => {
    try {
      pcRef.current = new RTCPeerConnection(servers);
      const pc = pcRef.current;

      // Get local video+audio stream
      const stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStreamURL(stream.toURL());
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStreamURL(event.streams[0].toURL());
        }
      };

      // Create room in Firebase
      const callRef = ref(database, "Calls");
      const newCallRef = push(callRef);
      const newRoomId = newCallRef.key;
      setRoomId(newRoomId);

      // Handle ICE candidates
      const offerCandidatesRef = ref(
        database,
        `Calls/${newRoomId}/offerCandidates`
      );
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          set(push(offerCandidatesRef), event.candidate.toJSON());
        }
      };

      // Create and set offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      await set(newCallRef, {
        offer: { sdp: offerDescription.sdp, type: offerDescription.type },
      });

      // Set UsersCalls nodes for both users
      await set(ref(database, `UsersCalls/${uid}/${newRoomId}`), {
        id: newRoomId,
        caller: "outgoing",
        friend: recipientId,
        callType: "video",
      });
      await set(ref(database, `UsersCalls/${recipientId}/${newRoomId}`), {
        id: newRoomId,
        caller: "incoming",
        friend: uid,
        callType: "video",
      });

      // Listen for answer
      listenDataFromNode(`Calls/${newRoomId}/answer`, async (data) => {
        if (
          data &&
          pc.signalingState !== "closed" &&
          !pc.currentRemoteDescription
        ) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data));
          } catch (e) {
            console.error("Error setting remote description:", e);
          }
        }
      });

      // Listen for answer candidates
      listenDataFromNode(`Calls/${newRoomId}/answerCandidates`, (snapshot) => {
        if (!snapshot && callStateRef.current === "onCall") {
          hangUp();
        } else if (snapshot) {
          Object.values(snapshot).forEach((candidateData) => {
            if (pc.signalingState !== "closed") {
              pc.addIceCandidate(new RTCIceCandidate(candidateData));
            }
          });
          setCallState("onCall");
        }
      });

      setupDisconnectHandlers(newRoomId);
    } catch (error) {
      console.error("Error creating room:", error);
      hangUp();
    }
  };

  const joinRoom = async () => {
    try {
      pcRef.current = new RTCPeerConnection(servers);
      const pc = pcRef.current;

      // Get local video+audio stream
      const stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStreamURL(stream.toURL());
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStreamURL(event.streams[0].toURL());
        }
      };

      // Get room key from UsersCalls
      const userCalls = await fetchDataFromNode(`UsersCalls/${uid}`);
      if (!userCalls) return;
      const roomKey = Object.keys(userCalls)[0];
      setRoomId(roomKey);

      // Handle ICE candidates
      const answerCandidatesRef = ref(
        database,
        `Calls/${roomKey}/answerCandidates`
      );
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          set(push(answerCandidatesRef), event.candidate.toJSON());
        }
      };

      // Get offer and set remote description
      const callData = await fetchDataFromNode(`Calls/${roomKey}`);
      if (!callData?.offer) return;

      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

      // Create and set answer
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      await update(ref(database, `Calls/${roomKey}`), {
        answer: { sdp: answerDescription.sdp, type: answerDescription.type },
      });

      // Listen for offer candidates
      listenDataFromNode(`Calls/${roomKey}/offerCandidates`, (snapshot) => {
        if (!snapshot && callStateRef.current === "onCall") {
          hangUp();
        } else if (snapshot) {
          Object.values(snapshot).forEach((candidateData) => {
            if (pc.signalingState !== "closed") {
              pc.addIceCandidate(new RTCIceCandidate(candidateData));
            }
          });
          setCallState("onCall");
        }
      });

      setupDisconnectHandlers(roomKey);
    } catch (error) {
      console.error("Error joining room:", error);
      hangUp();
    }
  };

  const setupDisconnectHandlers = (roomIdParam) => {
    const userCallRef = ref(
      database,
      `UsersCalls/${recipientId}/${roomIdParam}`
    );
    const ownCallRef = ref(database, `UsersCalls/${uid}/${roomIdParam}`);
    const callRef = ref(database, `Calls/${roomIdParam}`);

    onDisconnect(userCallRef).remove();
    onDisconnect(ownCallRef).remove();
    onDisconnect(callRef).remove();
  };

  const hangUp = async () => {
    const currentRoomId = roomIdRef.current;

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Delete Firebase nodes
    if (currentRoomId) {
      await Promise.all([
        deleteDataInNode(`UsersCalls/${recipientId}/${currentRoomId}`),
        deleteDataInNode(`UsersCalls/${uid}/${currentRoomId}`),
        deleteDataInNode(`Calls/${currentRoomId}`),
      ]);
    }

    cleanup();
    onClose();
  };

  const cleanup = () => {
    setCallState("calling");
    setRoomId(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setElapsedTime(0);
    setLocalStreamURL(null);
    setRemoteStreamURL(null);
    stopRingtone();
  };

  const handleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const handleCameraToggle = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff((prev) => !prev);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const defaultPhoto =
    "https://ui-avatars.com/api/?name=User&size=150&background=0d7059&color=fff";

  // Show message if WebRTC is not available (Expo Go)
  if (!isWebRTCAvailable) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Call Feature Unavailable</Modal.Header>
          <Modal.Body>
            <Center py={4}>
              <Icon
                as={MaterialCommunityIcons}
                name="video-off"
                size="4xl"
                color="gray.400"
                mb={4}
              />
              <Text textAlign="center" color="gray.600">
                Audio/Video calls require a development build.
              </Text>
              <Text textAlign="center" color="gray.500" fontSize="sm" mt={2}>
                Calls are not available in Expo Go. Please use a custom
                development build to access this feature.
              </Text>
            </Center>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={onClose}>Close</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={hangUp} size="full">
      <Modal.Content bg="black" width="100%" height="100%">
        <Modal.Body flex={1} p={0}>
          {recipientDetails && (
            <Box flex={1}>
              {/* Remote Video (Full Screen) */}
              {callState === "onCall" && remoteStreamURL ? (
                <RTCView
                  streamURL={remoteStreamURL}
                  style={styles.remoteVideo}
                  objectFit="cover"
                />
              ) : (
                <Box
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  bg="gray.900"
                >
                  <Avatar
                    size="2xl"
                    source={{
                      uri: recipientDetails.profilePhoto || defaultPhoto,
                    }}
                  />
                  <Text color="white" fontSize="2xl" fontWeight="bold" mt={4}>
                    {recipientDetails.name}
                  </Text>
                  <Text color="gray.400" fontSize="lg" mt={2}>
                    {callState === "calling" && caller === "user"
                      ? "Calling..."
                      : "Incoming video call..."}
                  </Text>
                </Box>
              )}

              {/* Local Video (Picture-in-Picture) */}
              {localStreamURL && (
                <Box style={styles.localVideoContainer}>
                  <RTCView
                    streamURL={localStreamURL}
                    style={styles.localVideo}
                    objectFit="cover"
                    mirror={true}
                  />
                </Box>
              )}

              {/* Call Timer */}
              {callState === "onCall" && (
                <Box position="absolute" top={16} alignSelf="center">
                  <Box bg="rgba(0,0,0,0.5)" px={4} py={2} borderRadius="full">
                    <Text color="white" fontSize="md">
                      {formatTime(elapsedTime)}
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Call Controls */}
              <HStack
                position="absolute"
                bottom={12}
                alignSelf="center"
                space={6}
                bg="rgba(0,0,0,0.3)"
                px={6}
                py={4}
                borderRadius="full"
              >
                {/* Camera Toggle */}
                <Pressable onPress={handleCameraToggle}>
                  <Box
                    bg={isCameraOff ? "red.400" : "gray.600"}
                    borderRadius="full"
                    p={3}
                  >
                    <Icon
                      as={MaterialCommunityIcons}
                      name={isCameraOff ? "camera-off" : "camera"}
                      size="lg"
                      color="white"
                    />
                  </Box>
                </Pressable>

                {/* Mute Toggle */}
                <Pressable onPress={handleMute}>
                  <Box
                    bg={isMuted ? "red.400" : "gray.600"}
                    borderRadius="full"
                    p={3}
                  >
                    <Icon
                      as={MaterialCommunityIcons}
                      name={isMuted ? "microphone-off" : "microphone"}
                      size="lg"
                      color="white"
                    />
                  </Box>
                </Pressable>

                {/* Hang Up */}
                <Pressable onPress={hangUp}>
                  <Box bg="red.500" borderRadius="full" p={3}>
                    <Icon
                      as={MaterialCommunityIcons}
                      name="phone-hangup"
                      size="lg"
                      color="white"
                    />
                  </Box>
                </Pressable>

                {/* Answer (for incoming calls) */}
                {callState === "calling" && caller === "recipient" && (
                  <Pressable onPress={() => setCallState("answered")}>
                    <Box bg="green.500" borderRadius="full" p={3}>
                      <Icon
                        as={MaterialCommunityIcons}
                        name="phone"
                        size="lg"
                        color="white"
                      />
                    </Box>
                  </Pressable>
                )}
              </HStack>
            </Box>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  remoteVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  localVideoContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  localVideo: {
    width: "100%",
    height: "100%",
  },
});

export default VideoCallModal;

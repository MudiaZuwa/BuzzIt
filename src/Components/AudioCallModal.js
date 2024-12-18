import React, { useEffect, useState, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  onDisconnect,
} from "../Components/firebase";
import Draggable from "react-draggable";
import "../CSS/AudioCallModal.css";
import ListenDataFromNode from "../Functions/ListenDataFromNode";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import DeleteDateInNode from "../Functions/DeleteDataInNode";

const AudioCallModal = ({
  show,
  handleClose,
  uid,
  userId,
  caller,
  reciepientDetails,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callState, setCallState] = useState("calling");
  const [userDetails, setUserDetails] = useState(reciepientDetails);
  const [roomId, setRoomId] = useState(null);
  const callStateRef = useRef();
  const roomIdRef = useRef(null);
  const LocalRef = useRef();
  const RemoteRef = useRef();
  const ringtoneRef = useRef();
  const draggableRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const servers = {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
  };
  const pc = new RTCPeerConnection(servers);

  useEffect(() => {
    if (show && !reciepientDetails) fetchReciepientDetails();
    else setUserDetails(reciepientDetails);
  }, [reciepientDetails, show]);

  useEffect(() => {
    if (show && userDetails && callState === "calling") {
      if (caller === "user") createRoom();
      // else getLocalAudio();
    } else if (!show) {
      setCallState("calling");
      setRoomId(null);
      setIsMuted(false);
      setElapsedTime(0);
      setUserDetails(null);
    }
  }, [userDetails, callState, show]);

  useEffect(() => {
    if (loaded && ringtoneRef.current) {
      if (callState !== "onCall" && show)
        ringtoneRef.current
          .play()
          .catch((err) => console.error("Ringtone error:", err));
      else {
        ringtoneRef.current.pause();
      }
    }
    callStateRef.current = callState;
    if (callState === "answered") joinRoom();
    else if (callState === "onCall" && elapsedTime === 0) {
      const interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callState, show, loaded]);

  const fetchReciepientDetails = async () => {
    const details = await FetchDataFromNode(`UsersDetails/${userId}`);
    setUserDetails(details);
  };

  const createRoom = async () => {
    const newCallRef = push(ref(getDatabase(), "Calls"));
    const newRoomId = newCallRef.key;

    const localStream = await setupLocalAudio();
    const offerCandidatesRef = ref(
      getDatabase(),
      `Calls/${newRoomId}/offerCandidates`
    );

    pc.onicecandidate = (event) => {
      if (event.candidate)
        set(push(offerCandidatesRef), event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    await set(newCallRef, {
      offer: { sdp: offerDescription.sdp, type: offerDescription.type },
    });

    // Set UsersCalls nodes
    const callerRef = ref(getDatabase(), `UsersCalls/${uid}/${newRoomId}`);
    const recipientRef = ref(
      getDatabase(),
      `UsersCalls/${userId}/${newRoomId}`
    );
    await set(callerRef, {
      id: newRoomId,
      caller: "outgoing",
      friend: userId,
      callType: "audio",
    });
    await set(recipientRef, {
      id: newRoomId,
      caller: "incoming",
      friend: uid,
      callType: "audio",
    });

    ListenDataFromNode(`Calls/${newRoomId}/answer`, async (data) => {
      if (data && !pc.currentRemoteDescription)
        pc.setRemoteDescription(new RTCSessionDescription(data));
    });

    ListenDataFromNode(`Calls/${newRoomId}/answerCandidates`, (snapshot) => {
      if (!snapshot && callStateRef.current === "onCall") {
        hangUp();
      } else if (snapshot) {
        Object.values(snapshot).forEach((childSnapshot) => {
          const candidate = childSnapshot;
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        setCallState("onCall");
      }
    });
    setupDisconnectHandlers();
    setRoomId(newRoomId);
  };

  const joinRoom = async () => {
    const localStream = await setupLocalAudio();
    const roomKey = Object.keys(
      await FetchDataFromNode(`UsersCalls/${uid}`)
    )[0];

    const callRef = ref(getDatabase(), `Calls/${roomKey}`);
    const answerCandidatesRef = ref(
      getDatabase(),
      `Calls/${roomKey}/answerCandidates`
    );

    // Add ICE candidates to Firebase
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const newCandidateRef = push(answerCandidatesRef);
        set(newCandidateRef, event.candidate.toJSON());
      }
    };

    // Retrieve offer and set remote description
    const callData = await FetchDataFromNode(`Calls/${roomKey}`);
    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    // Create answer and set local description
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };
    await update(callRef, { answer });

    // Listen for offer candidates
    ListenDataFromNode(`Calls/${roomKey}/offerCandidates`, (snapshot) => {
      if (!snapshot && callStateRef.current === "onCall") {
        hangUp();
      } else if (snapshot) {
        Object.values(snapshot).forEach((childSnapshot) => {
          const candidate = childSnapshot;
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        setCallState("onCall");
      }
    });
    setupDisconnectHandlers();
    setRoomId(roomKey);
  };

  const setupLocalAudio = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    LocalRef.current = document.createElement("audio");
    LocalRef.current.srcObject = localStream;

    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
    };
    RemoteRef.current.srcObject = remoteStream;
    RemoteRef.current.play().catch(console.error);

    return localStream;
  };

  const hangUp = async () => {
    if (roomId) {
      await Promise.all([
        DeleteDateInNode(`UsersCalls/${userId}/${roomId}`),
        DeleteDateInNode(`UsersCalls/${uid}/${roomId}`),
        DeleteDateInNode(`Calls/${roomId}/answerCandidates`),
        DeleteDateInNode(`Calls/${roomId}/offerCandidates`),
        DeleteDateInNode(`Calls/${roomId}`),
      ]);
    }
    pc.close();
    [LocalRef, RemoteRef].forEach((ref) => {
      if (ref.current?.srcObject)
        ref.current.srcObject.getTracks().forEach((track) => track.stop());
    });

    if (roomId) {
      await Promise.all([
        DeleteDateInNode(`UsersCalls/${userId}/${roomId}`),
        DeleteDateInNode(`UsersCalls/${uid}/${roomId}`),
        DeleteDateInNode(`Calls/${roomId}/answerCandidates`),
        DeleteDateInNode(`Calls/${roomId}/offerCandidates`),
        DeleteDateInNode(`Calls/${roomId}`),
      ]);
    }

    handleClose();
  };

  const handleMute = () => {
    const localStream = LocalRef.current?.srcObject;
    localStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
  };
  const setupDisconnectHandlers = () => {
    const userCallRef = ref(getDatabase(), `UsersCalls/${userId}/${roomId}`);
    const ownCallRef = ref(getDatabase(), `UsersCalls/${uid}/${roomId}`);
    const answerCandidatesRef = ref(
      getDatabase(),
      `Calls/${roomId}/answerCandidates`
    );
    const offerCandidatesRef = ref(
      getDatabase(),
      `Calls/${roomId}/offerCandidates`
    );
    const callRef = ref(getDatabase(), `Calls/${roomId}`);

    onDisconnect(userCallRef).remove();
    onDisconnect(ownCallRef).remove();
    onDisconnect(answerCandidatesRef).remove();
    onDisconnect(offerCandidatesRef).remove();
    onDisconnect(callRef).remove();
  };

  useEffect(() => {
    const handleDisconnect = async () => {
      await hangUp();
    };

    window.addEventListener("beforeunload", handleDisconnect);
    window.addEventListener("unload", handleDisconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
      window.removeEventListener("unload", handleDisconnect);
    };
  }, [hangUp]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Draggable nodeRef={draggableRef}>
      <div ref={draggableRef}>
        <Modal show={show} onHide={hangUp} backdrop="static">
          <Modal.Body>
            <audio
              ref={ringtoneRef}
              src={
                caller === "user"
                  ? "/audio/COMTelph_Tone ringback tone 1 (ID 1614)_BSB.mp3"
                  : "/audio/standardringtone.mp3"
              }
              loop
              style={{ display: "none" }}
            />
            {userDetails && (
              <div className="audio-call-interface">
                <img
                  src={userDetails.profilePhoto || "/images/defaultProfile.png"}
                  alt="User"
                  className="rounded-circle user-photo"
                />
                <h5 className="user-name">{userDetails.name}</h5>
                <p>{formatTime(elapsedTime)}</p>
                <audio autoPlay ref={RemoteRef} style={{ display: "none" }} />

                <div className="call-controls">
                  <Button variant="danger" onClick={hangUp}>
                    <i className="bi bi-telephone-x-fill"></i>
                  </Button>
                  {callState === "calling" && caller === "reciepient" ? (
                    <Button
                      variant="success"
                      onClick={() => setCallState("answered")}
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </Button>
                  ) : (
                    <Button variant="warning" onClick={handleMute}>
                      <i
                        className={`bi ${
                          isMuted ? "bi-mic-mute-fill" : "bi-mic-fill"
                        }`}
                      ></i>
                    </Button>
                  )}
                </div>
                {!loaded && setLoaded(true)}
              </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </Draggable>
  );
};

export default AudioCallModal;

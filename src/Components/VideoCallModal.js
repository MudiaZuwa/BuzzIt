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
import "bootstrap-icons/font/bootstrap-icons.css";
import "../CSS/VideoCallModal.css";
import ListenDataFromNode from "../Functions/ListenDataFromNode";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import DeleteDateInNode from "../Functions/DeleteDataInNode";

const VideoCallModal = ({
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
  const LocalRef = useRef();
  const RemoteRef = useRef();
  const callStateRef = useRef();
  const ringtoneRef = useRef();
  const draggableRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const servers = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      },
    ],
  };

  const pc = new RTCPeerConnection(servers);
  const database = getDatabase();

  useEffect(() => {
    if (show && !reciepientDetails) fetchReciepientDetails();
    else if (show) setUserDetails(reciepientDetails);
    if (!show) {
      setCallState("calling");
      setRoomId(null);
      setIsMuted(false);
      setElapsedTime(0);
      setUserDetails(null);
    }
  }, [userDetails, reciepientDetails, show]);

  useEffect(() => {
    if (!userDetails || !LocalRef.current || callState !== "calling" || !show)
      return;
    if (LocalRef.current.srcObject) return;
    if (caller === "user") createRoom();
    else getLocalSource();
  }, [callState, LocalRef, show, userDetails]);

  useEffect(() => {
    callStateRef.current = callState;
    if (callState === "answered") joinRoom();
    else if (callState === "onCall" && elapsedTime === 0) {
      const interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
    if (ringtoneRef.current) {
      if (callState !== "onCall" && show)
        ringtoneRef.current
          .play()
          .catch((err) => console.error("Ringtone error:", err));
      else {
        ringtoneRef.current.pause();
        console.log(callState);
      }
    }
  }, [callState, show]);

  const fetchReciepientDetails = async () => {
    const reciepientDetails = await FetchDataFromNode(`UsersDetails/${userId}`);
    setUserDetails(reciepientDetails);
  };

  const getLocalSource = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    LocalRef.current.srcObject = localStream;
  };

  const createRoom = async () => {
    const callRef = ref(database, `Calls`);
    const newCallRef = push(callRef);
    const newRoomId = newCallRef.key;
    const localStream = await setupLocalSource();

    const offerCandidatesRef = ref(
      database,
      `Calls/${newRoomId}/offerCandidates`
    );

    // Add ICE candidates to Firebase
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const newCandidateRef = push(offerCandidatesRef);
        set(newCandidateRef, event.candidate.toJSON());
      }
    };

    // Create offer and set local description
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await set(newCallRef, { offer });

    // Update UsersCalls node for caller and recipient
    const callerRef = ref(database, `UsersCalls/${uid}/${newRoomId}`);
    const recipientRef = ref(database, `UsersCalls/${userId}/${newRoomId}`);
    await set(callerRef, {
      id: newRoomId,
      caller: "outgoing",
      friend: userId,
      callType: "video",
    });
    await set(recipientRef, {
      id: newRoomId,
      caller: "incoming",
      friend: uid,
      callType: "video",
    });

    // Listen for answer using ListenDataFromNode
    const unsubscribeAnswer = ListenDataFromNode(
      `Calls/${newRoomId}/answer`,
      async (data) => {
        if (data && !pc.currentRemoteDescription) {
          const answerDescription = new RTCSessionDescription(data);
          pc.setRemoteDescription(answerDescription);
        }
      }
    );

    // Listen for answer candidates
    ListenDataFromNode(`Calls/${newRoomId}/answerCandidates`, (snapshot) => {
      if (!snapshot && (roomId || callState === "onCall")) {
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
    const localStream = await setupLocalSource();
    const userCalls = await FetchDataFromNode(`UsersCalls/${uid}`);
    if (!userCalls) return;
    const roomKey = Object.keys(userCalls)[0];

    const callRef = ref(database, `Calls/${roomKey}`);
    const answerCandidatesRef = ref(
      database,
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

    const answer = { sdp: answerDescription.sdp, type: answerDescription.type };
    await update(callRef, { answer });

    // Listen for offer candidates
    ListenDataFromNode(`Calls/${roomKey}/offerCandidates`, (snapshot) => {
      if (!snapshot && (roomId || callState === "onCall")) {
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

  const setupLocalSource = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    LocalRef.current.srcObject = localStream;
    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
    };

    RemoteRef.current.srcObject = remoteStream;

    return localStream;
  };

  const hangUp = async () => {
    pc.close();
    if (LocalRef.current?.srcObject) {
      const localStream = LocalRef.current.srcObject;
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (RemoteRef.current?.srcObject) {
      const remoteStream = RemoteRef.current.srcObject;
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (roomId) {
      await DeleteDateInNode(`UsersCalls/${userId}/${roomId}`);
      await DeleteDateInNode(`UsersCalls/${uid}/${roomId}`);
      await DeleteDateInNode(`Calls/${roomId}/answerCandidates`);
      await DeleteDateInNode(`Calls/${roomId}/offerCandidates`);
      await DeleteDateInNode(`Calls/${roomId}`);
    }

    handleClose();
  };

  const setupDisconnectHandlers = () => {
    const userCallRef = ref(database, `UsersCalls/${userId}/${roomId}`);
    const ownCallRef = ref(database, `UsersCalls/${uid}/${roomId}`);
    const answerCandidatesRef = ref(
      database,
      `Calls/${roomId}/answerCandidates`
    );
    const offerCandidatesRef = ref(database, `Calls/${roomId}/offerCandidates`);
    const callRef = ref(database, `Calls/${roomId}`);

    onDisconnect(userCallRef).remove();
    onDisconnect(ownCallRef).remove();
    onDisconnect(answerCandidatesRef).remove();
    onDisconnect(offerCandidatesRef).remove();
    onDisconnect(callRef).remove();
  };

  const handleMute = () => {
    const localStream = LocalRef.current?.srcObject;
    localStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
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
        <Modal
          show={show}
          onHide={hangUp}
          dialogClassName="draggable-modal"
          backdrop="static"
        >
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
              <>
                <div className="call-interface">
                  <img
                    src={userDetails.profilePhoto || "/images/defaultCover.png"}
                    alt="User"
                    className="rounded-circle user-photo"
                  />
                  <h5 className="user-name">{userDetails.name}</h5>
                  <p>{formatTime(elapsedTime)}</p>

                  <video
                    autoPlay
                    className="other-user-video"
                    ref={RemoteRef}
                    style={{
                      display: callState === "onCall" ? "block" : "none",
                    }}
                  />
                  <video
                    autoPlay
                    muted
                    className={`user-video ${
                      callState === "onCall" ? "small-video" : ""
                    }`}
                    ref={LocalRef}
                  />
                  <div className="call-controls">
                    <Button variant="danger" onClick={() => hangUp()}>
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
                      <Button variant="warning" onClick={() => handleMute()}>
                        <i
                          className={`bi ${
                            isMuted ? "bi-mic-mute-fill" : "bi-mic-fill"
                          }`}
                        ></i>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </Draggable>
  );
};

export default VideoCallModal;

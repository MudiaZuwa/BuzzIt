import React, { useEffect, useState } from "react";
import { Button, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import AuthModal from "../Auth/AuthModal";
import CreatePostModal from "./CreatPostModal";
import ProfileEditModal from "./ProfileEditModal";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import signOutUser from "../Functions/SignOutUser";
import { GetUserNotifications } from "../Functions/GetUserNotifications";
import { off, getDatabase, ref, onChildAdded } from "../Components/firebase";
import VideoCallModal from "./VideoCallModal";
import AudioCallModal from "./AudioCallModal";

const HomeLeftSideBar = ({ loggedIn, uid }) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [callerId, setCallerId] = useState(null);
  const [callType, setCallType] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);

  const handleVideoCallModalOpen = () => {
    if (!showAudioCallModal && !showVideoCallModal) setShowVideoCallModal(true);
  };
  const handleVideoCallModalClose = () => setShowVideoCallModal(false);

  const handleAudioCallModalOpen = () => {
    if (!showAudioCallModal && !showVideoCallModal) setShowAudioCallModal(true);
  };
  const handleAudioCallModalClose = () => setShowAudioCallModal(false);

  const handleProfileEditModalOpen = () => {
    if (!showProfileEditModal) setShowProfileEditModal(true);
  };
  const handleProfileEditModalClose = () => setShowProfileEditModal(false);

  const handlePostModalOpen = () => setShowPostModal(true);
  const handlePostModalClose = () => setShowPostModal(false);

  const handleAuthModalOpen = () => setShowAuthModal(true);
  const handleAuthModalClose = () => setShowAuthModal(false);

  const handleLoginToggle = () => {
    if (loggedIn) signOutUser();
    else handleAuthModalOpen();
  };

  useEffect(() => {
    if (loggedIn) {
      checkUserDetails();
      const callsUnsuscribe = ListenForCalls();
      return callsUnsuscribe();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!showVideoCallModal) {
      setCallerId(null);
      setCallType(null);
    }
  }, [showVideoCallModal]);

  useEffect(() => {
    if (callerId) {
      if (callType === "video") handleVideoCallModalOpen();
      else if (callType === "audio") handleAudioCallModalOpen();
    }
  }, [callerId, callType]);

  const checkUserDetails = () => {
    const nodePath = `UsersDetails/${uid}`;
    FetchDataFromNode(nodePath)
      .then((data) => {
        if (!data) return;
        else if (!data.name) handleProfileEditModalOpen();
        if (data) {
          GetUserNotifications(uid);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const ListenForCalls = () => {
    const nodePath = `UsersCalls/${uid}`;
    const database = getDatabase();
    const nodeRef = ref(database, nodePath);
    const unsubscribe = onChildAdded(nodeRef, (snapshot) => {
      if (snapshot?.exists()) {
        const call = snapshot.val();
        console.log(showAudioCallModal, showVideoCallModal);
        if (
          call.caller === "incoming" &&
          !showAudioCallModal &&
          !showVideoCallModal
        ) {
          setCallerId(call.friend);
          setCallType(call.callType);
        }
      } else {
        console.log("No data available at this node.");
      }
    });

    // Return a function to stop listening
    return () => off(nodeRef, "child_added", unsubscribe);
  };

  return (
    <Col md={2} className="d-none d-md-block bg-light vh-100 p-3">
      <h2 className="mb-4">BuzzIt</h2>

      <Link to="/" className="d-flex align-items-center mb-3">
        <Button variant="link" className="d-flex align-items-center">
          <i className="bi bi-house-door-fill me-2"></i> Home
        </Button>
      </Link>
      <Link to="/notifications" className="d-flex align-items-center mb-3">
        <Button
          variant="link"
          className="d-flex align-items-center overflow-x-hidden"
        >
          <i className="bi bi-bell-fill me-2 "></i>{" "}
          <span className="text-truncate">Notification</span>
        </Button>
      </Link>
      <Link to="/messages" className="d-flex align-items-center mb-3">
        <Button
          variant="link"
          className="d-flex align-items-center overflow-x-hidden"
        >
          <i className="bi bi-envelope-fill me-2"></i>{" "}
          <span className="text-truncate">Messages</span>
        </Button>
      </Link>

      {loggedIn && uid ? (
        <Link to={`/${uid}`} className="d-flex align-items-center mb-3">
          <Button
            variant="link"
            className="d-flex align-items-center overflow-x-hidden"
          >
            <i className="bi bi-person-fill me-2"></i>{" "}
            <span className="text-truncate">Profile</span>
          </Button>
        </Link>
      ) : (
        <Button
          variant="link"
          className="d-flex align-items-center mb-3 overflow-x-hidden"
          onClick={handleLoginToggle}
        >
          <i className="bi bi-person-fill me-2"></i>{" "}
          <span className="text-truncate">Profile</span>
        </Button>
      )}
      <Link to="/Games" className="d-flex align-items-center mb-3">
        <Button
          variant="link"
          className="d-flex align-items-center overflow-x-hidden"
        >
          <i className="bi bi-controller me-2"></i>{" "}
          <span className="text-truncate">Games</span>
        </Button>
      </Link>

      <Button
        variant="link"
        className="d-flex align-items-center mb-3 overflow-x-hidden"
      >
        <i className="bi bi-gear-fill me-2"></i>{" "}
        <span className="text-truncate">Settings</span>
      </Button>

      <Button
        variant="primary"
        className="d-flex align-items-center mb-3 w-100  justify-content-center"
        onClick={handlePostModalOpen}
      >
        Post
      </Button>

      <Button
        variant="link"
        className="d-flex align-items-center mt-5"
        onClick={handleLoginToggle}
      >
        <i className="bi bi-box-arrow-in-right me-2"></i>{" "}
        {loggedIn ? "Logout" : "Login/Sign-up"}
      </Button>

      {showAuthModal && (
        <AuthModal
          show={showAuthModal}
          handleClose={handleAuthModalClose}
          handleProfileEdit={handleProfileEditModalOpen}
        />
      )}
      {showPostModal && (
        <CreatePostModal
          show={showPostModal}
          handleClose={handlePostModalClose}
        />
      )}

      <ProfileEditModal
        show={showProfileEditModal}
        handleClose={handleProfileEditModalClose}
      />
      <VideoCallModal
        show={showVideoCallModal}
        handleClose={handleVideoCallModalClose}
        uid={uid}
        userId={callerId}
        caller={"reciepient"}
      />
      <AudioCallModal
        show={showAudioCallModal}
        handleClose={handleAudioCallModalClose}
        uid={uid}
        userId={callerId}
        caller={"reciepient"}
      />
    </Col>
  );
};

export default HomeLeftSideBar;

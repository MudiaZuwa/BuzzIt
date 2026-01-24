import React, { useEffect, useState } from "react";
import { Button, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import AuthModal from "../Auth/AuthModal.js";
import CreatePostModal from "./CreatPostModal.js";
import ProfileEditModal from "./ProfileEditModal.js";
import FetchDataFromNode from "../Functions/FetchDataFromNode.js";
import signOutUser from "../Functions/SignOutUser.js";
import { GetUserNotifications } from "../Functions/GetUserNotifications.js";
import { off, getDatabase, ref, onChildAdded } from "../Components/firebase.js";
import VideoCallModal from "./VideoCallModal.js";
import AudioCallModal from "./AudioCallModal.js";

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
    <Col
      md={2}
      className="d-none d-md-block vh-100 p-3 sidebar-nav"
      style={{
        backgroundColor: "#ffffff",
        borderRight: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <h2 className="mb-4">BuzzIt</h2>

      <Link to="/" className="d-flex align-items-center mb-2">
        <Button
          variant="link"
          className="d-flex align-items-center w-100 text-start"
        >
          <i className="bi bi-house-door-fill me-2"></i> Home
        </Button>
      </Link>
      <Link to="/notifications" className="d-flex align-items-center mb-2">
        <Button
          variant="link"
          className="d-flex align-items-center w-100 text-start"
        >
          <i className="bi bi-bell-fill me-2"></i>
          <span className="text-truncate">Notifications</span>
        </Button>
      </Link>
      <Link to="/messages" className="d-flex align-items-center mb-2">
        <Button
          variant="link"
          className="d-flex align-items-center w-100 text-start"
        >
          <i className="bi bi-envelope-fill me-2"></i>
          <span className="text-truncate">Messages</span>
        </Button>
      </Link>

      <Link to="/Games" className="d-flex align-items-center mb-2">
        <Button
          variant="link"
          className="d-flex align-items-center w-100 text-start"
        >
          <i className="bi bi-controller me-2"></i>
          <span className="text-truncate">Games</span>
        </Button>
      </Link>

      {loggedIn && uid ? (
        <Link to={`/${uid}`} className="d-flex align-items-center mb-2">
          <Button
            variant="link"
            className="d-flex align-items-center w-100 text-start"
          >
            <i className="bi bi-person-fill me-2"></i>
            <span className="text-truncate">Profile</span>
          </Button>
        </Link>
      ) : (
        <Button
          variant="link"
          className="d-flex align-items-center mb-2 w-100 text-start"
          onClick={handleLoginToggle}
        >
          <i className="bi bi-person-fill me-2"></i>
          <span className="text-truncate">Profile</span>
        </Button>
      )}

      <Link to="/settings" style={{ textDecoration: "none" }}>
        <Button
          variant="link"
          className="d-flex align-items-center mb-2 w-100 text-start"
        >
          <i className="bi bi-gear-fill me-2"></i>
          <span className="text-truncate">Settings</span>
        </Button>
      </Link>

      <Button
        variant="primary"
        className="d-flex align-items-center mt-3 mb-3 w-100 justify-content-center py-2"
        onClick={handlePostModalOpen}
        style={{ borderRadius: "20px" }}
      >
        <i className="bi bi-plus-lg me-2"></i> Post
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

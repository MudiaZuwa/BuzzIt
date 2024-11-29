import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { off, getDatabase, ref, onChildAdded } from "../Components/firebase";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import AudioCallModal from "./AudioCallModal";
import VideoCallModal from "./VideoCallModal";
import AuthModal from "../Auth/AuthModal";
import signOutUser from "../Functions/SignOutUser";

const MobileBottomNavbar = ({ uid }) => {
  const [callerId, setCallerId] = useState(null);
  const [callType, setCallType] = useState(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthModalOpen = () => setShowAuthModal(true);
  const handleAuthModalClose = () => setShowAuthModal(false);

  const handleLoginToggle = () => {
    if (uid) signOutUser();
    else handleAuthModalOpen();
  };

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

  useEffect(() => {
    if (uid) checkUserDetails();
  }, [uid]);

  useEffect(() => {
    if (!showVideoCallModal) {
      setCallerId(null);
      setCallType(null);
    }
  }, [showVideoCallModal]);

  useEffect(() => {
    if (callerId) {
      // if (callType === "video") handleVideoCallModalOpen();
      // else if (callType === "audio") handleAudioCallModalOpen();
    }
  }, [callerId, callType]);

  const checkUserDetails = () => {
    const nodePath = `UsersDetails/${uid}`;
    FetchDataFromNode(nodePath)
      .then((data) => {
        if (!data) return;
        else if (!data.name) handleProfileEditModalOpen();
        if (data) {
          ListenForCalls();
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
    <Navbar
      fixed="bottom"
      bg="light"
      className="d-md-none justify-content-between mx-auto px-0"
      style={{ marginTop: "50px" }}
    >
      <Container>
        <Nav className="d-flex w-100 justify-content-between">
          <Nav.Link as={Link} to={`/`}>
            <i
              className="bi bi-house-door-fill"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </Nav.Link>

          <Nav.Link as={Link} to="/search">
            <i className="bi bi-search" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>
          {uid ? (
            <Nav.Link as={Link} to={`/${uid}`}>
              <i
                className="bi bi-people-fill"
                style={{ fontSize: "1.5rem" }}
              ></i>
            </Nav.Link>
          ) : (
            <Nav.Link onClick={handleLoginToggle}>
              <i
                className="bi bi-people-fill"
                style={{ fontSize: "1.5rem" }}
              ></i>
            </Nav.Link>
          )}
          <Nav.Link as={Link} to={`/messages/`}>
            <i
              className="bi bi-envelope-fill"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </Nav.Link>

          <Nav.Link as={Link} to="/Games">
            <i className="bi bi-controller" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>

          <Nav.Link as={Link} to={`#`}>
            <i className="bi bi-gear-fill" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>
        </Nav>
      </Container>
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
      <AuthModal
        show={showAuthModal}
        handleClose={handleAuthModalClose}
        handleProfileEdit={handleProfileEditModalOpen}
      />
    </Navbar>
  );
};

export default MobileBottomNavbar;

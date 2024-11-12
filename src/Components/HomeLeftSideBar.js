import React, { useEffect, useState } from "react";
import { Button, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import AuthModal from "../Auth/AuthModal";
import CreatePostModal from "./CreatPostModal";
import ProfileEditModal from "./ProfileEditModal";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import signOutUser from "../Functions/SignOutUser";
import { GetUserNotifications } from "../Functions/GetUserNotifications";

const HomeLeftSideBar = ({ loggedIn, uid }) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

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
    if (loggedIn) checkUserDetails();
  }, [loggedIn]);

  const checkUserDetails = () => {
    const nodePath = `UsersDetails/${uid}`;
    FetchDataFromNode(nodePath)
      .then((data) => {
        if (!data) return;
        else if (!data.name) handleProfileEditModalOpen();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    GetUserNotifications(uid);
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
        <Button variant="link" className="d-flex align-items-center ">
          <i className="bi bi-bell-fill me-2"></i> Notification
        </Button>
      </Link>
      <Link to="/messages" className="d-flex align-items-center mb-3">
        <Button variant="link" className="d-flex align-items-center ">
          <i className="bi bi-envelope-fill me-2"></i> Messages
        </Button>
      </Link>

      {loggedIn && uid ? (
        <Link to={`/${uid}`} className="d-flex align-items-center mb-3">
          <Button variant="link" className="d-flex align-items-center">
            <i className="bi bi-person-fill me-2"></i> Profile
          </Button>
        </Link>
      ) : (
        <Button
          variant="link"
          className="d-flex align-items-center mb-3"
          onClick={handleLoginToggle}
        >
          <i className="bi bi-person-fill me-2"></i> Profile
        </Button>
      )}
      <Link to="/Games" className="d-flex align-items-center mb-3">
        <Button variant="link" className="d-flex align-items-center">
          <i className="bi bi-controller me-2"></i> Games
        </Button>
      </Link>

      <Button variant="link" className="d-flex align-items-center mb-3">
        <i className="bi bi-gear-fill me-2"></i> Settings
      </Button>

      <Button
        variant="primary"
        className="d-flex align-items-center mb-3"
        onClick={handlePostModalOpen}
      >
        <i className="bi bi-plus-lg me-2"></i> Post
      </Button>

      <Button
        variant="link"
        className="d-flex align-items-center mb-3"
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
    </Col>
  );
};

export default HomeLeftSideBar;

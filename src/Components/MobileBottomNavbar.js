import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import AuthModal from "../Auth/AuthModal";
import signOutUser from "../Functions/SignOutUser";

const MobileBottomNavbar = ({ uid }) => {
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthModalOpen = () => setShowAuthModal(true);
  const handleAuthModalClose = () => setShowAuthModal(false);

  const handleLoginToggle = () => {
    if (uid) signOutUser();
    else handleAuthModalOpen();
  };

  const handleProfileEditModalOpen = () => {
    if (!showProfileEditModal) setShowProfileEditModal(true);
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

      <AuthModal
        show={showAuthModal}
        handleClose={handleAuthModalClose}
        handleProfileEdit={handleProfileEditModalOpen}
      />
    </Navbar>
  );
};

export default MobileBottomNavbar;

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Modal,
  Button,
} from "react-bootstrap";
import HomeLeftSideBar from "../Components/HomeLeftSideBar.js";
import MobileBottomNavbar from "../Components/MobileBottomNavbar.js";
import SupportChat from "../Components/SupportChat.js";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser.js";
import "../CSS/index.css";

const APP_VERSION = "1.0.0";

// Content components
const AboutContent = () => (
  <div>
    <div className="text-center mb-4">
      <h4 className="text-success">BuzzIt</h4>
      <p className="text-muted mb-0">Version {APP_VERSION}</p>
    </div>

    <h6>Welcome to BuzzIt!</h6>
    <p className="small">
      BuzzIt is a modern social media platform designed to connect people
      through meaningful interactions. Share your thoughts, connect with
      friends, play games together, and stay updated with what matters most to
      you.
    </p>

    <h6>Features</h6>
    <ul className="small">
      <li>
        <strong>Posts & Feed:</strong> Share thoughts, images, and videos
      </li>
      <li>
        <strong>Real-time Messaging:</strong> Instant messaging with friends
      </li>
      <li>
        <strong>Audio & Video Calls:</strong> Free calls anytime
      </li>
      <li>
        <strong>Interactive Games:</strong> Play with friends
      </li>
      <li>
        <strong>Friend System:</strong> Build your network
      </li>
    </ul>

    <h6>Our Mission</h6>
    <p className="small">
      We believe in creating a safe, engaging, and fun social experience. Our
      goal is to bring people closer together through technology.
    </p>

    <p className="text-muted mt-3">
      <small>© 2024 BuzzIt. All rights reserved.</small>
    </p>
  </div>
);

const TermsContent = () => (
  <div>
    <p className="text-muted">
      <small>Last updated: December 2024</small>
    </p>

    <h6>1. Acceptance of Terms</h6>
    <p className="small">
      By accessing and using BuzzIt, you accept and agree to be bound by these
      Terms of Service. If you do not agree to these terms, please do not use
      our platform.
    </p>

    <h6>2. User Accounts</h6>
    <p className="small">
      You are responsible for maintaining the confidentiality of your account
      credentials and for all activities that occur under your account. You must
      be at least 13 years old to create an account.
    </p>

    <h6>3. User Content</h6>
    <p className="small">
      You retain ownership of content you post. By posting content, you grant us
      a non-exclusive license to use, display, and distribute your content on
      our platform.
    </p>

    <h6>4. Acceptable Use</h6>
    <ul className="small">
      <li>No illegal purposes</li>
      <li>No harassment or abuse</li>
      <li>No spam or misleading content</li>
      <li>No unauthorized access attempts</li>
    </ul>

    <h6>5. Termination</h6>
    <p className="small">
      We reserve the right to suspend or terminate your account if you violate
      these terms or engage in behavior that harms our community.
    </p>
  </div>
);

const PrivacyContent = () => (
  <div>
    <p className="text-muted">
      <small>Last updated: December 2024</small>
    </p>

    <h6>1. Information We Collect</h6>
    <ul className="small">
      <li>Account information (name, email, profile photo)</li>
      <li>Content you post (posts, messages, comments)</li>
      <li>Usage data (how you interact with our platform)</li>
    </ul>

    <h6>2. How We Use Your Information</h6>
    <ul className="small">
      <li>Provide and improve our services</li>
      <li>Personalize your experience</li>
      <li>Send notifications about activity</li>
      <li>Ensure platform security</li>
    </ul>

    <h6>3. Information Sharing</h6>
    <p className="small">
      We do not sell your personal information. We may share your information
      with other users (based on your settings) and service providers.
    </p>

    <h6>4. Your Rights</h6>
    <ul className="small">
      <li>Access your personal data</li>
      <li>Update or correct your information</li>
      <li>Delete your account and data</li>
      <li>Control your privacy settings</li>
    </ul>

    <h6>5. Children's Privacy</h6>
    <p className="small">
      BuzzIt is not intended for children under 13. We do not knowingly collect
      information from children under 13.
    </p>
  </div>
);

// Settings Right Sidebar Component (similar to HomeRightSideBar pattern)
const SettingsRightSideBar = ({ activeSection, onClose }) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      case "about":
        return "About BuzzIt";
      case "terms":
        return "Terms of Service";
      case "privacy":
        return "Privacy Policy";
      case "support":
        return "Contact Support";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "about":
        return <AboutContent />;
      case "terms":
        return <TermsContent />;
      case "privacy":
        return <PrivacyContent />;
      case "support":
        return <SupportChat onClose={onClose} />;
      default:
        return <div className="text-center text-muted py-5"></div>;
    }
  };

  return (
    <Col
      md={3}
      className="d-none d-md-block bg-light vh-100 p-3"
      style={{ overflowY: "auto" }}
    >
      {activeSection && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 text-truncate">{getSectionTitle()}</h6>
          <Button variant="link" size="sm" className="p-0" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      )}
      {activeSection === "support" ? (
        <div style={{ height: "calc(100vh - 100px)" }}>{renderContent()}</div>
      ) : (
        renderContent()
      )}
    </Col>
  );
};

const Settings = () => {
  const { loggedIn, uid } = UseVerifyUser();
  const [activeSection, setActiveSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveSection(null);
  };

  const handleCloseSection = () => {
    setActiveSection(null);
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "about":
        return "About BuzzIt";
      case "terms":
        return "Terms of Service";
      case "privacy":
        return "Privacy Policy";
      case "support":
        return "Contact Support";
      default:
        return "";
    }
  };

  const renderModalContent = () => {
    switch (activeSection) {
      case "about":
        return <AboutContent />;
      case "terms":
        return <TermsContent />;
      case "privacy":
        return <PrivacyContent />;
      case "support":
        return (
          <div style={{ height: "60vh" }}>
            <SupportChat onClose={handleCloseModal} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area - Settings List (fixed width) */}
          <Col
            md={7}
            className="mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            <div className="p-3">
              <h3>Settings</h3>

              <Card className="mb-4">
                <Card.Header>
                  <strong>App Information</strong>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Version</span>
                    <span className="text-muted">{APP_VERSION}</span>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    onClick={() => handleSectionClick("about")}
                    className="d-flex justify-content-between align-items-center"
                    active={activeSection === "about" && !isMobile}
                  >
                    <span>About BuzzIt</span>
                    <i className="bi bi-chevron-right"></i>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <strong>Legal</strong>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item
                    action
                    onClick={() => handleSectionClick("terms")}
                    className="d-flex justify-content-between align-items-center"
                    active={activeSection === "terms" && !isMobile}
                  >
                    <span>Terms of Service</span>
                    <i className="bi bi-chevron-right"></i>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    onClick={() => handleSectionClick("privacy")}
                    className="d-flex justify-content-between align-items-center"
                    active={activeSection === "privacy" && !isMobile}
                  >
                    <span>Privacy Policy</span>
                    <i className="bi bi-chevron-right"></i>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <strong>Help</strong>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item
                    action
                    onClick={() => handleSectionClick("support")}
                    className="d-flex justify-content-between align-items-center"
                    active={activeSection === "support" && !isMobile}
                  >
                    <span>
                      <i className="bi bi-headset me-2"></i>
                      Contact Support
                    </span>
                    <i className="bi bi-chevron-right"></i>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              <p className="text-center text-muted mt-4">
                <small>Made by Mudia Zuwa</small>
              </p>
            </div>
          </Col>

          {/* Right Sidebar (Desktop only - always visible like HomeRightSideBar) */}
          <SettingsRightSideBar
            activeSection={activeSection}
            onClose={handleCloseSection}
          />
        </Row>
      </Container>

      {/* Mobile Modal */}
      <Modal
        show={showModal && isMobile}
        onHide={handleCloseModal}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{getSectionTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalContent()}</Modal.Body>
        {activeSection !== "support" && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Settings;

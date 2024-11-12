import React, { useEffect, useState } from "react";
import { Modal, Nav } from "react-bootstrap";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ show, handleClose, handleProfileEdit, returnOnClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      if (!isLogin) handleProfileEdit();
      handleClose();
    }
  }, [success]);

  const handleModalClose = () => {
    if (!success && returnOnClose) navigate("/");
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isLogin ? "Login" : "Sign Up"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav
            variant="tabs"
            defaultActiveKey={isLogin ? "login" : "signup"}
            className="mb-3"
          >
            <Nav.Item>
              <Nav.Link
                eventKey="login"
                active={isLogin}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="signup"
                active={!isLogin}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {isLogin ? (
            <LoginForm setSuccess={setSuccess} />
          ) : (
            <RegisterForm setSuccess={setSuccess} />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AuthModal;

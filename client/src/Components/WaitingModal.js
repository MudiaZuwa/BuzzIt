import React, { useState, useEffect } from "react";
import { Modal, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const WaitingModal = ({ show, onClose, playerJoined }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (!playerJoined) {
      navigate(-1); // Redirect to the previous page
    } else if (onClose) {
      onClose(); // Trigger any custom close logic
    }
  };

  useEffect(() => {
    if (playerJoined) {
      console.log("Player joined! Proceeding...");
    }
  }, [playerJoined]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static" // Prevent modal from closing by clicking outside
      keyboard={false} // Prevent closing with the escape key
    >
      <Modal.Header>
        <Modal.Title>Waiting for Other Players</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Waiting for Other Players to Join</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WaitingModal;

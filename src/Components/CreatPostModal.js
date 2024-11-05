import React from "react";
import { Modal } from "react-bootstrap";
import CreatePostform from "./CreatePostform";

const CreatePostModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreatePostform handleClose={handleClose}></CreatePostform>
      </Modal.Body>
    </Modal>
  );
};

export default CreatePostModal;

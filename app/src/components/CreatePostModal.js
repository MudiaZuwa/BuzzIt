import React from "react";
import { Modal } from "native-base";
import CreatePostForm from "./CreatePostForm";

const CreatePostModal = ({ isOpen, onClose, uid, commentDetails }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Create Post</Modal.Header>
        <Modal.Body>
          <CreatePostForm
            uid={uid}
            handleClose={onClose}
            commentDetails={commentDetails}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default CreatePostModal;

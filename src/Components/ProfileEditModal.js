import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Image, Alert } from "react-bootstrap";
import HandleProfileEdit from "../Functions/HandleProfileEdit.js";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser.js";

const ProfileEditModal = ({ show, handleClose, currentUserDetails }) => {
  const [coverPhoto, setCoverPhoto] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [dob, setDob] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [DOBError, setDOBError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { uid } = UseVerifyUser();

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      setCoverPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePhotoUrl(URL.createObjectURL(file));
    }
  };

  const setStates = { setError, setIsPending, setSuccess };

  useEffect(() => {
    if (success) {
      handleClose();
      setIsPending(false);
      setSuccess(false);
    }
  }, [success]);

  useEffect(() => {
    if (show && currentUserDetails) {
      setProfilePhotoUrl(currentUserDetails.profilePhoto);
      setCoverPhotoUrl(currentUserDetails.coverPhoto);
      setName(currentUserDetails.name);
      setAbout(currentUserDetails.about);
      setDob(currentUserDetails.dob);
      setNameError(false);
      setDOBError(false);
      setError(null);
      setSuccess(false);
      setIsPending(false);
    } else if (!currentUserDetails) {
      currentUserDetails = {
        coverPhoto: null,
        profilePhoto: null,
        name: "",
        about: "",
        dob: "",
      };
    }
  }, [show, currentUserDetails]);

  const handleSave = () => {
    if (!name || !dob) {
      if (!name) setNameError(true);
      if (!dob) setDOBError(true);
    } else {
      const userDetails = {
        uid,
        name,
        about,
        dob,
        coverPhoto,
        profilePhoto,
      };
      setIsPending(true);
      setDOBError(false);
      setNameError(false);
      setError(null);
      HandleProfileEdit(userDetails, setStates);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Modal.Header className="d-flex justify-content-between">
        <Button
          variant="close"
          onClick={handleClose}
          className="m-0"
          disabled={isPending}
        />
        <Modal.Title>Edit Profile</Modal.Title>
        <Button
          variant="primary"
          onClick={handleSave}
          // style={{ marginLeft: "auto" }}
          disabled={isPending}
        >
          Save
        </Button>
      </Modal.Header>
      <Modal.Body>
        {/* Cover Photo */}
        <div className="position-relative mb-4">
          <Image
            src={coverPhotoUrl || "/images/defaultCover.png"}
            fluid
            style={{ height: "200px", width: "100%", objectFit: "cover" }}
            alt="Cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoChange}
            style={{ display: "none" }}
            id="cover-photo-upload"
            disabled={isPending}
          />
          <label
            htmlFor="cover-photo-upload"
            className="position-absolute top-50 start-50 translate-middle"
            style={{
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderRadius: "50%",
              padding: "10px",
              textAlign: "center",
              width: "50px",
              height: "50px",
            }}
          >
            <i className="bi bi-camera" style={{ fontSize: "1.5rem" }}></i>
          </label>
        </div>

        {/* Profile Photo */}
        <div className="d-flex align-items-center mb-4 position-relative">
          <div style={{ position: "relative", display: "inline-block" }}>
            <Image
              src={profilePhotoUrl || "/images/defaultProfile.png"}
              roundedCircle
              style={{
                height: "100px",
                width: "100px",
                marginRight: "20px",
                position: "relative",
              }}
              alt="Profile"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              style={{ display: "none" }}
              id="profile-photo-upload"
              disabled={isPending}
            />
            <label
              htmlFor="profile-photo-upload"
              className="d-flex align-items-center justify-content-center"
              style={{
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                borderRadius: "50%",
                padding: "10px",
                width: "40px",
                height: "40px",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-75%, -50%)",
              }}
            >
              <i className="bi bi-camera" style={{ fontSize: "1.5rem" }}></i>
            </label>
          </div>
        </div>

        <Form.Group controlId="formName" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            isInvalid={nameError}
            disabled={isPending}
          />
          <Form.Control.Feedback type="invalid">
            Please Enter Your Name
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formAbout" className="mb-3">
          <Form.Label>About</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell us about yourself"
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group controlId="formDOB" className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            isInvalid={DOBError}
            disabled={isPending}
          />
          <Form.Control.Feedback type="invalid">
            Please Select Your Date of Birth
          </Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileEditModal;

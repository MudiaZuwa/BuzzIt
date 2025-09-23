import React, { useEffect, useState } from "react";
import { Button, Form, Carousel, Alert } from "react-bootstrap";
import HandleCreatePost from "../Functions/HandleCreatePost.js";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser.js";

const CreatePostform = ({ handleClose, commentDetails }) => {
  const [postText, setPostText] = useState("");
  const [files, setFiles] = useState([]);
  const { uid } = UseVerifyUser();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const setStates = { setError, setIsPending, setSuccess };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uid) return;
    if (postText !== "" || files.length > 0) {
      setIsPending(true);
      HandleCreatePost(
        { postText, uid, media: files },
        setStates,
        commentDetails
      );
    }
  };

  useEffect(() => {
    if (success) {
      if (typeof handleClose === "function") handleClose();
      setPostText("");
      setFiles([]);
      setSuccess(false);
    }
  }, [success]);

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="What's on your mind?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          disabled={isPending}
        />
      </Form.Group>
      {files.length > 0 && (
        <Carousel interval={null} indicators={false}>
          {files.map((file, index) => (
            <Carousel.Item key={index}>
              <div className="position-relative ">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Selected"
                    className="media-preview"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    className="media-preview"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                )}
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
                  onClick={() => handleRemoveFile(file.name)}
                >
                  <i
                    className="bi bi-x-circle"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </label>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <input
        type="file"
        onChange={handleFileChange}
        className="file-input"
        style={{ display: "none" }}
        id="file-upload"
        accept="image/*,video/*"
        multiple={!commentDetails}
        disabled={isPending}
      />
      <label htmlFor="file-upload" className="file-upload-label">
        <i className="bi bi-image"></i>
      </label>

      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" type="submit" disabled={isPending}>
          Post
        </Button>
      </div>
    </Form>
  );
};

export default CreatePostform;

import React from "react";
import { Tab, Row, Col, Image } from "react-bootstrap";

const isVideo = (url) => {
  const videoExtensions = ["mp4", "webm", "ogg"];
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  return videoExtensions.includes(extension);
};

const MediaTab = ({ posts, previousProfilePhotos, previousCoverPhotos }) => {
  const media = [];

  posts.forEach((post) => {
    if (post.media && post.media.length > 0) {
      media.push(...post.media);
    }
  });

  media.push(...previousProfilePhotos, ...previousCoverPhotos);

  return (
    <Tab.Pane eventKey="media">
      <Row>
        {media.length > 0 ? (
          media.map((mediaUrl, index) => (
            <Col
              key={index}
              xs={6}
              sm={6}
              md={4}
              lg={4}
              className="mb-4 position-relative"
            >
              {isVideo(mediaUrl) ? (
                <div className="position-relative">
                  <video
                    src={mediaUrl}
                    className="w-100"
                    style={{
                      objectFit: "cover",
                      height: "auto",
                    }}
                    controls={false}
                    muted
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div
                    className="position-absolute bottom-0 start-0 p-2 text-light bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "30px", height: "30px" }}
                  >
                    <i className="bi bi-play-fill"></i>
                  </div>
                </div>
              ) : (
                <Image
                  src={mediaUrl}
                  alt="Media"
                  fluid
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "auto",
                  }}
                />
              )}
            </Col>
          ))
        ) : (
          <p>No media available.</p>
        )}
      </Row>
    </Tab.Pane>
  );
};

export default MediaTab;

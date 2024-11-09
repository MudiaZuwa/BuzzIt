import React, { useState } from "react";
import { Col, Image, Row, Button } from "react-bootstrap";
import ProfileEditModal from "./ProfileEditModal";
import { Link } from "react-router-dom";

const ProfileHeader = ({
  isFriend,
  userDetails,
  friendsList,
  mutualFriends,
  friendRequests,
  renderFriendButton,
  uid,
  userID,
}) => {
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  const handleProfileEditModalOpen = () => setShowProfileEditModal(true);
  const handleProfileEditModalClose = () => setShowProfileEditModal(false);

  const currentUserDetails = {
    coverPhoto: userDetails.coverPhotoPhoto,
    profilePhoto: userDetails.profilePhoto,
    name: userDetails.name,
    about: userDetails.about,
    dob: userDetails.dob,
  };

  const AboutText = ({ aboutText }) => {
    const urlRegex =
      /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?(\/\S*)?)/gi;

    const processedText = aboutText.replace(urlRegex, (match) => {
      const url = match.startsWith("http") ? match : `https://${match}`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    return (
      <p className="mt-3" dangerouslySetInnerHTML={{ __html: processedText }} />
    );
  };

  return (
    <Row className="mb-4 align-items-start">
      {userID === uid && (
        <Col
          xs={12}
          className="d-flex justify-content-md-end justify-content-start "
        >
          <Button
            variant="outline-primary"
            onClick={handleProfileEditModalOpen}
          >
            <i className="bi bi-pencil"></i>
          </Button>
        </Col>
      )}
      <Col
        xs={12}
        md={6}
        className="d-flex flex-column flex-md-row align-items-start"
      >
        <div className="profile-section d-flex align-items-center">
          <Image
            src={userDetails.profilePhoto || "/images/defaultProfile.png"}
            roundedCircle
            alt="Profile"
            className="me-3"
            width="100"
            height="100"
            style={{ objectFit: "cover" }}
          />

          <div className="user-details">
            <h4 className="mb-2" style={{ whiteSpace: "nowrap" }}>
              {userDetails.name}
            </h4>

            <div className="user-info">
              <div className="d-flex" style={{ gap: "10px" }}>
                <p className="mb-1">{friendsList.length} friends</p>
                {uid === userID ? (
                  <p className="mb-1">
                    {friendRequests.length} friend requests
                  </p>
                ) : (
                  <p className="mb-1">{mutualFriends.length} mutual friends</p>
                )}
              </div>
              <p className="mb-1">
                Joined {new Date(userDetails.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Col>

      {userID !== uid && (
        <Col xs={12} className="d-flex justify-content-end mt-3 mt-md-0">
          <div className="d-flex flex-md-row-reverse" style={{ gap: "10px" }}>
            {renderFriendButton()}
            {isFriend && (
              <Link to={`/messages/${userID}`} className="">
                <Button variant="secondary">Message</Button>
              </Link>
            )}
          </div>
        </Col>
      )}

      <Col xs={12}>
        <AboutText aboutText={userDetails.about} />
      </Col>

      <ProfileEditModal
        show={showProfileEditModal}
        handleClose={handleProfileEditModalClose}
        currentUserDetails={currentUserDetails}
      />
    </Row>
  );
};

export default ProfileHeader;

import handleFileUpload from "./handleFileUpload";
import updateDataInNode from "./updateDataInNode";

const handleProfileEdit = async (userDetails, setStates) => {
  const { uid, name, about, dob, coverPhoto, profilePhoto } = userDetails;

  try {
    setStates.setIsPending(true);
    setStates.setError(null);

    let newCoverPhotoUrl = null;
    let newProfilePhotoUrl = null;

    // Upload cover photo if provided
    if (coverPhoto) {
      try {
        const coverPhotoFile = {
          uri: coverPhoto.uri,
          name: coverPhoto.fileName || `cover_${Date.now()}.jpg`,
        };
        const urls = await handleFileUpload(
          [coverPhotoFile],
          "CoverPhotos",
          uid
        );
        newCoverPhotoUrl = urls[0];
      } catch (error) {
        console.error("Cover photo upload failed:", error);
        setStates.setError("Failed to upload cover photo: " + error.message);
        setStates.setIsPending(false);
        return;
      }
    }

    // Upload profile photo if provided
    if (profilePhoto) {
      try {
        const profilePhotoFile = {
          uri: profilePhoto.uri,
          name: profilePhoto.fileName || `profile_${Date.now()}.jpg`,
        };
        const urls = await handleFileUpload(
          [profilePhotoFile],
          "ProfilePhotos",
          uid
        );
        newProfilePhotoUrl = urls[0];
      } catch (error) {
        console.error("Profile photo upload failed:", error);
        setStates.setError("Failed to upload profile photo: " + error.message);
        setStates.setIsPending(false);
        return;
      }
    }

    // Prepare user details to update
    const userDetailsToUpdate = {
      name,
      about: about || "",
      dob,
    };

    // Add cover photo if uploaded
    if (newCoverPhotoUrl) {
      userDetailsToUpdate.coverPhoto = newCoverPhotoUrl;
    }

    // Add profile photo if uploaded
    if (newProfilePhotoUrl) {
      userDetailsToUpdate.profilePhoto = newProfilePhotoUrl;
    }

    // Update user details in Firebase
    const userRef = `UsersDetails/${uid}`;
    await updateDataInNode(userRef, userDetailsToUpdate);

    setStates.setSuccess(true);
    setStates.setIsPending(false);
  } catch (error) {
    console.error("Profile update failed:", error);
    setStates.setError("Failed to update profile: " + error.message);
    setStates.setIsPending(false);
  }
};

export default handleProfileEdit;

import HandleFileUpload from "./HandleFileUpload.js";
import updateDataInNode from "./UpdateDataInNode.js";

const HandleProfileEdit = (userDetails, setStates) => {
  const uid = userDetails.uid;
  const name = userDetails.name;
  const about = userDetails.about;
  const dob = userDetails.dob;

  let coverPhoto = userDetails.coverPhoto;
  let profilePhoto = userDetails.profilePhoto;

  const uploadCoverPhoto = async () => {
    if (coverPhoto) {
      try {
        const urls = await HandleFileUpload([coverPhoto], "CoverPhotos", uid);
        return urls[0];
      } catch (error) {
        console.error("Upload failed:", error);
        setStates.setError("Upload failed: " + error.message);
        return null;
      }
    }
    return null;
  };

  const uploadProfilePhoto = async () => {
    if (profilePhoto) {
      try {
        const urls = await HandleFileUpload(
          [profilePhoto],
          "ProfilePhotos",
          uid
        );
        return urls[0];
      } catch (error) {
        console.error("Upload failed:", error);
        setStates.setError("Upload failed: " + error.message);
        return null;
      }
    }
    return null;
  };

  const uploadUserDetails = async (newCoverPhoto, newProfilePhoto) => {
    const userRef = `UsersDetails/${uid}`;
    const userDetailsToUpdate = {
      name,
      about,
      dob,
      ...(newCoverPhoto && { coverPhoto: newCoverPhoto }),
      ...(newProfilePhoto && { profilePhoto: newProfilePhoto }),
    };

    if (newCoverPhoto) {
      userDetailsToUpdate.previousCoverPhotos = [
        ...(userDetails.previousCoverPhotos || []),
        newCoverPhoto,
      ];
    }

    if (newProfilePhoto) {
      userDetailsToUpdate.previousProfilePhotos = [
        ...(userDetails.previousProfilePhotos || []),
        newProfilePhoto,
      ];
    }

    await updateDataInNode(userRef, userDetailsToUpdate);
    setStates.setSuccess(true);
  };

  const handleUpdate = async () => {
    const newCoverPhoto = await uploadCoverPhoto();
    const newProfilePhoto = await uploadProfilePhoto();
    await uploadUserDetails(newCoverPhoto, newProfilePhoto);
  };

  handleUpdate();
};

export default HandleProfileEdit;

import {
  getStorage,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "../Components/firebase.js";
const HandleFileUpload = async (files, folder, UID) => {
  const storage = getStorage();
  try {
    const downloadURLs = [];

    for (const file of files) {
      const storageReference = storageRef(
        storage,
        `${folder}/${UID}/${file.name}`
      );
      const uploadTaskSnapshot = await uploadBytesResumable(
        storageReference,
        file
      );

      const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
      downloadURLs.push(downloadURL);

      //   setUploadProgress(0);
    }

    return downloadURLs;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

export default HandleFileUpload;

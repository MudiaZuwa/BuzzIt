import { storage } from "../config/firebase";

const handleFileUpload = async (files, folder, UID) => {
  try {
    const downloadURLs = [];

    for (const file of files) {
      const fileRef = storage.ref(`${folder}/${UID}/${file.name}`);

      // Fetch the file as blob for React Native
      const response = await fetch(file.uri);
      const blob = await response.blob();

      await fileRef.put(blob);
      const downloadURL = await fileRef.getDownloadURL();
      downloadURLs.push(downloadURL);
    }

    return downloadURLs;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

export default handleFileUpload;

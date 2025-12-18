import { database } from "../config/firebase";

const updateDataInNode = async (nodePath, data) => {
  const nodeRef = database.ref(nodePath);

  try {
    await nodeRef.update(data);
    console.log("Data updated successfully.");
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

export default updateDataInNode;

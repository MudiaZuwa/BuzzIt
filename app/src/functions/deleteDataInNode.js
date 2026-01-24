import { database } from "../config/firebase";

const deleteDataInNode = async (nodePath) => {
  const nodeRef = database.ref(nodePath);

  try {
    await nodeRef.remove();
    console.log("Data deleted successfully.");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};

export default deleteDataInNode;

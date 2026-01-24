import { getDatabase, ref, update } from "firebase/database";

const updateDataInNode = async (nodePath, data) => {
  const db = getDatabase();
  const nodeRef = ref(db, nodePath);

  try {
    await update(nodeRef, data);
    console.log("Data updated successfully.");
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

export default updateDataInNode;

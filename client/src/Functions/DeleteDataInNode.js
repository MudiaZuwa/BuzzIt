import { getDatabase, ref, remove } from "firebase/database";

const DeleteDateInNode = async (nodePath) => {
  const db = getDatabase();
  const nodeRef = ref(db, nodePath);

  try {
    await remove(nodeRef);
    console.log("Data deleted successfully.");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};

export default DeleteDateInNode;

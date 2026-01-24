import { database } from "../config/firebase";

const fetchDataFromNode = async (nodePath) => {
  const nodeRef = database.ref(nodePath);

  try {
    const snapshot = await nodeRef.once("value");
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available at this node.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export default fetchDataFromNode;

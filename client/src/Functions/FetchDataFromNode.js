import { getDatabase, ref, get } from "firebase/database";

const FetchDataFromNode = async (nodePath) => {
  const db = getDatabase();
  const nodeRef = ref(db, nodePath);

  try {
    const snapshot = await get(nodeRef);
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

export default FetchDataFromNode;

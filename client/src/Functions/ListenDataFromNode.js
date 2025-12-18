import { getDatabase, ref, onValue, off } from "firebase/database";

const ListenDataFromNode = (nodePath, callback) => {
  const db = getDatabase();
  const nodeRef = ref(db, nodePath);

  const unsubscribe = onValue(
    nodeRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        console.log(`No data available at ${nodePath}`);
        callback(null);
      }
    },
    (error) => {
      console.error("Error fetching data from node:", error);
      callback(null, error);
    }
  );

  return () => off(nodeRef, "value", unsubscribe);
};

export default ListenDataFromNode;

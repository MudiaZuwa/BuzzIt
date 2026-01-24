import { database } from "../config/firebase";

const listenDataFromNode = (nodePath, callback) => {
  const nodeRef = database.ref(nodePath);

  const listener = nodeRef.on(
    "value",
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

  return () => nodeRef.off("value", listener);
};

export default listenDataFromNode;

import listenDataFromNode from "./listenDataFromNode";

export const getUserNotifications = (uid) => {
  return new Promise((resolve, reject) => {
    if (!uid) {
      resolve(null);
      return;
    }

    const unsubscribe = listenDataFromNode(`notifications/${uid}`, (data) => {
      if (data) {
        resolve(data);
      } else {
        resolve(null);
      }
      // Clean up after getting data
      unsubscribe();
    });
  });
};

export default getUserNotifications;

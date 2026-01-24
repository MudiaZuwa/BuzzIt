import ListenDataFromNode from "./ListenDataFromNode.js";

export const GetUserNotifications = (uid) => {
  return new Promise((resolve, reject) => {
    ListenDataFromNode(`notifications/${uid}`, (data) => {
      if (data) {
        resolve(data);
      } else {

      }
    });
  });
};

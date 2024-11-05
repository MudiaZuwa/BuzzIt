import ListenDataFromNode from "./ListenDataFromNode";

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

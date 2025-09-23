import admin from "firebase-admin";
import "dotenv/config";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://buzzit-45162-default-rtdb.firebaseio.com/",
  });
}

export const db = admin.database();

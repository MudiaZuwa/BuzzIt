import { signOut, getAuth } from "../Components/firebase.js";

const signOutUser = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};

export default signOutUser;

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "../Components/firebase.js";
import FetchDataFromNode from "../Functions/FetchDataFromNode.js";

const GoogleSignIn = async (createNewProfile, setSuccess) => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const accountExists = await FetchDataFromNode(`UsersDetails/${user.uid}`);

    if (typeof createNewProfile === "function" && !accountExists) {
      createNewProfile(user.email, user.uid);
    } else {
      setSuccess(true);
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
};

export default GoogleSignIn;

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "../Components/firebase";

const GoogleSignIn = (createNewProfile, setSuccess) => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      if (typeof createNewProfile === "function")
        createNewProfile(user.email, user.uid);
      else setSuccess(true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
};

export default GoogleSignIn;

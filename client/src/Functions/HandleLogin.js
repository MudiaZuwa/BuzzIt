import { getAuth, signInWithEmailAndPassword } from "../Components/firebase.js";

const HandleLogin = ({ e, setStates, inputRefs }) => {
  e.preventDefault();
  setStates.setIsPending(true);

  const emailValue = inputRefs.email.ref.current.value;
  const passwordValue = inputRefs.password.ref.current.value;

  const LoginAccount = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, emailValue, passwordValue)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        // getUserData(user.uid);
        setStates.setSuccess(true);
        setStates.setIsPending(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setStates.setError(errorMessage);
        console.log(errorMessage);
        setStates.setIsPending(false);
      });
  };

  setStates.setValidated(true);
  LoginAccount();
};

export default HandleLogin;

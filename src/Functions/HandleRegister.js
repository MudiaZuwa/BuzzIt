import {
  getAuth,
  createUserWithEmailAndPassword,
} from "../Components/firebase.js";

const HandleRegister = ({ e, inputRefs, setStates, createNewProfile }) => {
  e.preventDefault();
  setStates.setIsPending(true);

  const emailValue = inputRefs.email.ref.current.value;
  const passwordValue = inputRefs.password.ref.current.value;
  const rePasswordValue = inputRefs.rePassword.ref.current.value;

  const RegisterAccount = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, emailValue, passwordValue)
      .then((userCredential) => {
        const user = userCredential.user;
        createNewProfile(emailValue, user.uid);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setStates.setError(errorMessage);
        setStates.setIsPending(false);
      });
  };

  if (passwordValue !== rePasswordValue) {
    inputRefs.password.setError("Password does not Match");
    setStates.setIsPending(false);
  } else {
    RegisterAccount();
    setStates.setValidated(true);
  }
};

export default HandleRegister;

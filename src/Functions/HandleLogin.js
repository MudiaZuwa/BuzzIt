import { getAuth, signInWithEmailAndPassword } from "../Components/firebase";

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

  // const getUserData = (userId) => {
  //   const dbRef = ref(getDatabase());
  //   get(child(dbRef, `UsersDetails/${userId}`))
  //     .then((snapshot) => {
  //       if (snapshot.exists()) {
  //         const userDetails = snapshot.val();

  //         const AccountDetails = {
  //           email: userDetails["email"],
  //           fullName: userDetails["name"],
  //         };
  //         localStorage.setItem("details", JSON.stringify(AccountDetails));
  //         setStates.setSuccess(true);
  //         setStates.setIsPending(false);
  //       } else {
  //         setStates.setError("No data available");
  //         setStates.setIsPending(false);
  //       }
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       console.log(errorMessage);
  //       setStates.setError(errorMessage);
  //       setStates.setIsPending(false);
  //     });
  // };
  setStates.setValidated(true);
  LoginAccount();
};

export default HandleLogin;

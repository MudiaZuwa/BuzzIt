import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

const useVerifyUser = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        setUid(user.uid);
      } else {
        setLoggedIn(false);
        setUid(null);
      }
      setIsPending(false);
    });

    return () => unsubscribe();
  }, []);

  return { loggedIn, isPending, uid };
};

export default useVerifyUser;

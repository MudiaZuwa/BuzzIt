import React, { createContext, useContext, useState, useEffect } from "react";
import listenDataFromNode from "../functions/listenDataFromNode";
import useVerifyUser from "../hooks/useVerifyUser";

const ProfileContext = createContext(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    return {
      uid: null,
      loggedIn: false,
      userProfile: null,
      isProfileComplete: true,
      showProfileModal: false,
      loading: false,
      requireCompleteProfile: () => true,
      openProfileModal: () => {},
      closeProfileModal: () => {},
      setShowProfileModal: () => {},
    };
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { uid, loggedIn, isPending } = useVerifyUser();
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset state when logged out
  useEffect(() => {
    if (!loggedIn && !isPending) {
      setUserProfile(null);
      setIsProfileComplete(true);
      setLoading(false);
    }
  }, [loggedIn, isPending]);

  // Listen to user profile changes when authenticated
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenDataFromNode(`UsersDetails/${uid}`, (data) => {
      if (data) {
        setUserProfile(data);
        const isComplete = Boolean(data.name && data.dob);
        setIsProfileComplete(isComplete);

        if (!isComplete) {
          setShowProfileModal(true);
        }
      } else {
        setUserProfile(null);
        setIsProfileComplete(false);
        setShowProfileModal(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const requireCompleteProfile = () => {
    if (uid && !isProfileComplete) {
      setShowProfileModal(true);
      return false;
    }
    return true;
  };

  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  const value = {
    uid,
    loggedIn,
    userProfile,
    isProfileComplete,
    showProfileModal,
    loading: loading || isPending,
    requireCompleteProfile,
    openProfileModal,
    closeProfileModal,
    setShowProfileModal,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export default ProfileContext;

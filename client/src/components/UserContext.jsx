import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    profileImage: "",
  });

  // Load saved profile image when email changes
  useEffect(() => {
    if (user.email) {
      const img = localStorage.getItem(`userProfileImage_${user.email}`);
      setUser((prev) => ({ ...prev, profileImage: img || "" }));
    }
  }, [user.email]);

  // Keep localStorage synced
  useEffect(() => {
    if (user.name) localStorage.setItem("userName", user.name);
    if (user.email) localStorage.setItem("userEmail", user.email);
    if (user.profileImage && user.email)
      localStorage.setItem(`userProfileImage_${user.email}`, user.profileImage);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};


import { AuthContext } from "contexts/Auth";
import { db } from "firebaseApp";
import React, { useContext, useEffect, useState } from "react";

export const AdminContext = React.createContext<any>({});

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState({});
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      db.collection("admins")
        .doc(currentUser.uid)
        .get()
        .then((doc) => {
          const adminData = doc.data();
          setAdmin(adminData);
        })
        .catch((error) => {
          console.log("Error getting admin doc:", error);
        });
    }
  }, [currentUser]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

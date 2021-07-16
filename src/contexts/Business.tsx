import { AdminContext } from "contexts/Admin";
import { db } from "firebaseApp";
import React, { useContext, useEffect, useState } from "react";

export const BusinessContext = React.createContext<any>({});

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState({});
  const { admin } = useContext(AdminContext);

  useEffect(() => {
    if (admin) {
      console.log("Admin defined");
      const businessId = admin["companyID"];
      db.collection("businesses")
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            const businessData = businessDoc.data();
            console.log("Business Data:");
            console.log(businessData);
            if (businessData) {
              console.log("setting business data");
              setBusiness({ ...businessData });
            }
          },
          (error) => {
            console.log("Snapshot permissions error");
          }
        );
    }
  }, [admin]);

  return (
    <BusinessContext.Provider
      value={{
        business,
        setBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

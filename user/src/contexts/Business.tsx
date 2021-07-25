import { AuthContext } from "contexts/Auth";
import { db } from "firebaseApp";
import React, { useContext, useEffect, useState } from "react";

export const BusinessContext = React.createContext<any>({});

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState({});
  const { employee, currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && employee) {
      console.log("user defined");
      console.log(employee);
      const businessId = employee["businessID"];
      console.log(businessId);
      console.log(currentUser.email);
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
  }, [employee]);

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

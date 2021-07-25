import { AuthContext } from "contexts/Auth";
import { db } from "firebaseApp";
import React, { useContext, useEffect, useState } from "react";

export const BusinessContext = React.createContext<any>({});

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState({});
  const { employee, currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && employee) {
      const businessId = employee["businessID"];
      db.collection("businesses")
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            const businessData = businessDoc.data();
            if (businessData) {
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

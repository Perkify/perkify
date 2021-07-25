import { AdminContext } from 'contexts/Admin';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';

export const BusinessContext = React.createContext<any>({});

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState({});
  const { admin } = useContext(AdminContext);

  useEffect(() => {
    if (admin) {
      const businessId = admin['companyID'];
      db.collection('businesses')
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            const businessData = businessDoc.data();
            if (businessData) {
              setBusiness({ ...businessData });
            }
          },
          (error) => {
            console.log('Snapshot permissions error');
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

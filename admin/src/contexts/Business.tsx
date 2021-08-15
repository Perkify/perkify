import { AuthContext } from 'contexts';
import { db } from 'firebaseApp';
import { Business } from 'models';
import React, { useContext, useEffect, useState } from 'react';

interface ContextProps {
  business: Business;
}

export const BusinessContext = React.createContext<ContextProps>(null);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState<Business>();
  const { admin } = useContext(AuthContext);

  useEffect(() => {
    if (admin) {
      const businessId = admin['companyID'];
      db.collection('businesses')
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            const businessData = businessDoc.data() as Business;
            if (Object.keys(businessData).length != 0) {
              setBusiness({ ...businessData });
            }
          },
          (error) => {
            console.error('Snapshot permissions error');
          }
        );
    }
  }, [admin]);

  return (
    <BusinessContext.Provider
      value={{
        business,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

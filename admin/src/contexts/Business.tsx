import { AuthContext } from 'contexts';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';

interface ContextProps {
  business: Business;
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

export const BusinessContext = React.createContext<ContextProps>(null);

export const BusinessProvider = ({ children }: BusinessProviderProps) => {
  const [business, setBusiness] = useState<Business>();
  const { admin } = useContext(AuthContext);

  useEffect(() => {
    if (admin) {
      console.log(admin);
      const businessId = admin['businessID'];
      console.log(businessId);
      db.collection('businesses')
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            const businessData = businessDoc.data() as Business;
            if (businessData && Object.keys(businessData).length != 0) {
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

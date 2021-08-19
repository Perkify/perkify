import { AuthContext } from 'contexts/Auth';
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
  const { employee, currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && employee) {
      const businessId = employee['businessID'];
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
            console.info('Snapshot permissions error');
          }
        );
    }
  }, [employee]);

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

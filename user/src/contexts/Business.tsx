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
      console.log('BUESINSSID');
      console.log(businessId);
      db.collection('businesses')
        .doc(businessId)
        .onSnapshot(
          (businessDoc) => {
            console.log('Business Snapshot ');
            console.log(businessDoc.data());
            const businessData = businessDoc.data() as Business;
            console.log(businessData);
            if (businessData && Object.keys(businessData).length != 0) {
              console.log('Setting business to: ', businessData);
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

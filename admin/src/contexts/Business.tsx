import { AuthContext } from 'contexts';
import React, { useContext, useEffect, useState } from 'react';
import { db } from 'services';

interface ContextProps {
  business: Business;
  employees: Employee[];
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

export const BusinessContext = React.createContext<ContextProps>(null);

export const BusinessProvider = ({ children }: BusinessProviderProps) => {
  const [business, setBusiness] = useState<Business>();
  const [employees, setEmployees] = useState<Employee[]>();
  const { admin } = useContext(AuthContext);

  useEffect(() => {
    if (admin) {
      // get the business ID
      const businessId = admin['businessID'];

      // get business
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

      // get employees
      db.collection('businesses')
        .doc(businessId)
        .collection('employees')
        .onSnapshot((employeesSnapshot) => {
          setEmployees(
            employeesSnapshot.docs.map((doc) => doc.data() as Employee)
          );
        });
    }
  }, [admin]);

  return (
    <BusinessContext.Provider
      value={{
        business,
        employees,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

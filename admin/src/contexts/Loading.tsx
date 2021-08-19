import React, { useState } from 'react';

export const LoadingContext = React.createContext<any>({});

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [freezeNav, setFreezeNav] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        dashboardLoading,
        setDashboardLoading,
        freezeNav,
        setFreezeNav,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

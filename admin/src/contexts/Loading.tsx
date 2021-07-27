import React, { useState } from 'react';

export const LoadingContext = React.createContext<any>({});

export const LoadingProvider = ({ children }) => {
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [freezeNav, setFreezeNav] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        dashboardLoading,
        setDashboardLoading,
        freezeNav,
        setFreezeNav
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

import React, { useState } from "react";

export const LoadingContext = React.createContext<any>({});

export const LoadingProvider = ({ children }) => {
  const [dashboardLoading, setDashboardLoading] = useState(false);

  console.log(dashboardLoading);

  return (
    <LoadingContext.Provider
      value={{
        dashboardLoading,
        setDashboardLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

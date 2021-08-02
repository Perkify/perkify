import LinearProgress from '@material-ui/core/LinearProgress';
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
        setFreezeNav,
      }}
    >
      <div style={freezeNav ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
        <LinearProgress
          hidden={!dashboardLoading}
          style={{
            zIndex: 10000,
            height: '6px',
            width: '100%',
            position: 'absolute',
          }}
        />
        {children}
      </div>
    </LoadingContext.Provider>
  );
};

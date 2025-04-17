import React, { useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

const InactivityHandler = () => {
    const userContext = useContext(AppContext);

    if (!userContext) {
      throw new Error("useUserContext must be used within a UserContext.Provider");
    }
  
    const { setUser} = userContext;

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;

    const logout = () => {
      localStorage.removeItem('token');
      setUser(undefined);
      alert('You have been logged out due to inactivity.');
    };

    const resetTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(logout, 12 * 60 * 60 * 1000); // 12 hours
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // Initialize timer on mount

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    };
  }, [setUser]);

  return null;
};

export default InactivityHandler;

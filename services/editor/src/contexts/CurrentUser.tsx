import React, { createContext, FunctionComponent, useContext, useEffect, useState } from 'react';
import { CurrentUser } from 'tweek-client';
import { tweekManagementClient } from '../utils';

const CurrentUserContext = createContext<CurrentUser | null>(null);
CurrentUserContext.displayName = 'CurrentUser';

export const CurrentUserProvider: FunctionComponent = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    let cancel = false;

    async function run() {
      const user = await tweekManagementClient.currentUser();
      if (!cancel) {
        setCurrentUser(user);
      }
    }

    run();

    return () => {
      cancel = true;
    };
  }, []);

  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
};

export const useCurrentUser = () => useContext(CurrentUserContext);

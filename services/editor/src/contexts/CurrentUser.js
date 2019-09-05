import React, { useContext, useEffect, useState } from 'react';
import { tweekManagementClient } from '../utils/tweekClients';

const CurrentUserContext = React.createContext(null);
CurrentUserContext.displayName = 'CurrentUser';

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    let cancel = false;

    async function run() {
      const user = await tweekManagementClient.currentUser();
      if (!cancel) {
        setCurrentUser(user);
      }
    }

    run();

    return () => (cancel = true);
  }, []);

  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
};

export const useCurrentUser = () => useContext(CurrentUserContext);

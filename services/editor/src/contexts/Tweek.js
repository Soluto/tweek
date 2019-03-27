import React, { useEffect, useState } from 'react';
import { prepareKey, TweekProvider as OriginalTweekProvider } from 'react-tweek';
import { TweekRepository } from 'tweek-local-cache';
import { equals } from 'ramda';
import { tweekClient } from '../utils/tweekClients';
import { useCurrentUser } from './CurrentUser';

prepareKey('@tweek/editor/_');

const toTweekContext = ({ User }) => ({ tweek_editor_user: User });

export const TweekProvider = ({ children }) => {
  const [tweekRepository, setTweekRepository] = useState();

  const user = useCurrentUser();

  useEffect(() => {
    if (!user) {
      return;
    }

    const context = toTweekContext(user);

    if (tweekRepository) {
      tweekRepository.updateContext((prev) => {
        if (equals(prev, context)) {
          return null;
        }
        return context;
      });
    } else {
      setTweekRepository(
        new TweekRepository({
          client: tweekClient,
          context,
        }),
      );
    }
  }, [user]);

  return <OriginalTweekProvider value={tweekRepository}>{children}</OriginalTweekProvider>;
};

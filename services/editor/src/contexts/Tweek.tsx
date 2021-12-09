import { equals } from 'ramda';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { prepareKey, TweekProvider as OriginalTweekProvider } from 'react-tweek';
import { CurrentUser } from 'tweek-client';
import { TweekRepository } from 'tweek-local-cache';
import { tweekClient } from '../utils';
import { useCurrentUser } from './CurrentUser';

prepareKey('@tweek/editor/_');

const toTweekContext = ({ User }: CurrentUser) => ({ tweek_editor_user: User });

export const TweekProvider: FunctionComponent = ({ children }) => {
  const [tweekRepository, setTweekRepository] = useState<TweekRepository>();

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
  }, [user]); //eslint-disable-line react-hooks/exhaustive-deps

  return <OriginalTweekProvider value={tweekRepository}>{children}</OriginalTweekProvider>;
};

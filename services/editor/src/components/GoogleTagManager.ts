import { useEffect } from 'react';
import TagManager from 'react-gtm-module';
import { useTweekValue } from 'react-tweek';

export const useGoogleTagManager = () => {
  const gtmId = useTweekValue('@tweek/editor/google_tag_manager/id', '');
  const isEnabled = useTweekValue('@tweek/editor/google_tag_manager/enabled', false);

  useEffect(() => {
    if (isEnabled && gtmId) {
      TagManager.initialize({ gtmId });
    }
  }, [gtmId, isEnabled]);
};

import React, { useEffect } from 'react';
import gtmParts from 'react-google-tag-manager';
import { useTweekValue } from 'react-tweek';

const GoogleTagManagerContainer = ({
  gtmId,
  dataLayerName = 'dataLayer',
  scriptId = 'react-google-tag-manager-gtm',
  additionalEvents = {},
  previewVariables = false,
}) => {
  useEffect(() => {
    if (!window[dataLayerName]) {
      const gtmScriptNode = document.getElementById(scriptId);

      // eslint-disable-next-line no-eval
      eval(gtmScriptNode.textContent);
    }
  }, []);

  const gtm = gtmParts({
    id: gtmId,
    dataLayerName,
    additionalEvents,
    previewVariables,
  });

  return <div id={this.props.scriptId}>{gtm.scriptAsReact()}</div>;
};

const GoogleTagManager = (props) => {
  const isEnabled = useTweekValue('@tweek/editor/google_tag_manager/enabled', false);
  const gtmId = useTweekValue('@tweek/editor/google_tag_manager/id', '');

  if (!isEnabled || !gtmId) {
    return null;
  }

  return <GoogleTagManagerContainer {...props} gtmId={gtmId} />;
};

export default GoogleTagManager;

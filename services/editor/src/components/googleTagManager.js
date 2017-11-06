import { Observable } from 'rxjs';
import React from 'react';
import PropTypes from 'prop-types';
import gtmParts from 'react-google-tag-manager';
import { componentFromStream } from 'recompose';
import fetch from '../utils/fetch';

class GoogleTagManagerContainer extends React.Component {
  componentDidMount() {
    const { dataLayerName, scriptId } = this.props;
    if (!window[dataLayerName]) {
      const gtmScriptNode = document.getElementById(scriptId);

      eval(gtmScriptNode.textContent);
    }
  }

  render() {
    const gtm = gtmParts({
      id: this.props.gtmId,
      dataLayerName: this.props.dataLayerName,
      additionalEvents: this.props.additionalEvents,
      previewVariables: this.props.previewVariables,
    });

    return (
      <div id={this.props.scriptId}>
        {gtm.scriptAsReact()}
      </div>
    );
  }

  static propTypes = {
    gtmId: PropTypes.string.isRequired,
    dataLayerName: PropTypes.string,
    additionalEvents: PropTypes.object,
    previewVariables: PropTypes.string,
    scriptId: PropTypes.string,
  };

  static defaultProps = {
    dataLayerName: 'dataLayer',
    additionalEvents: {},
    previewVariables: false,
    scriptId: 'react-google-tag-manager-gtm',
  };
}

const getConfigValue = async (configName) => {
  try {
    const response = await fetch(`/api/editor-configuration/google_tag_manager/${configName}`);
    return await response.json();
  } catch (err) {
    console.warn('failed to retrieve configuration', configName, err);
    return null;
  }
};

const GoogleTagManagerWithConfig = componentFromStream((prop$) => {
  const isEnabled$ = Observable.defer(() => getConfigValue('enabled'));
  const gtmId$ = Observable.defer(() => getConfigValue('id'));

  return Observable.combineLatest(isEnabled$, gtmId$, prop$).map(
    ([isEnabled, gtmId, props]) =>
      isEnabled ? <GoogleTagManagerContainer {...props} gtmId={gtmId} /> : null,
  );
});

GoogleTagManagerWithConfig.displayName = 'GoogleTagManager';

export default GoogleTagManagerWithConfig;

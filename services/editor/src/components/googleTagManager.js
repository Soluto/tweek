import { Observable } from 'rxjs';
import React from 'react';
import PropTypes from 'prop-types';
import gtmParts from 'react-google-tag-manager';
import { componentFromStream } from 'recompose';

class GoogleTagManagerContainer extends React.Component {
  componentDidMount() {
    const dataLayerName = this.props.dataLayerName || 'dataLayer';
    const scriptId = this.props.scriptId || 'react-google-tag-manager-gtm';

    if (!window[dataLayerName]) {
      const gtmScriptNode = document.getElementById(scriptId);

      eval(gtmScriptNode.textContent);
    }
  }

  render() {
    const gtm = gtmParts({
      id: this.props.gtmId,
      dataLayerName: this.props.dataLayerName || 'dataLayer',
      additionalEvents: this.props.additionalEvents || {},
      previewVariables: this.props.previewVariables || false,
    });

    return (
      <div>
        <div id={this.props.scriptId || 'react-google-tag-manager-gtm'}>
          {gtm.scriptAsReact()}
        </div>
      </div>
    );
  }
}

GoogleTagManagerContainer.propTypes = {
  gtmId: PropTypes.string.isRequired,
  dataLayerName: PropTypes.string,
  additionalEvents: PropTypes.object,
  previewVariables: PropTypes.string,
  scriptId: PropTypes.string,
};

const GoogleTagManagerWithConfig = componentFromStream((prop$) => {
  const isEnabled$ = Observable.defer(() =>
    fetch('/api/editor-configuration/google_tag_manager/enabled').then(response => response.json()),
  ).distinctUntilChanged();
  const gtmId$ = Observable.defer(() =>
    fetch('/api/editor-configuration/google_tag_manager/id').then(response => response.json()),
  ).distinctUntilChanged();

  return Observable.combineLatest(isEnabled$, gtmId$, prop$).map(
    ([isEnabled, gtmId, props]) =>
      isEnabled ? <GoogleTagManagerContainer {...props} gtmId={gtmId} /> : null,
  );
});

GoogleTagManagerWithConfig.displayName = 'GoogleTagManager';

export default GoogleTagManagerWithConfig;

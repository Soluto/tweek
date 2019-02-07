import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { compose, lifecycle } from 'recompose';

import { processSigninRedirectCallback } from '../../../services/auth-service';

const mapDispatchToProps = (dispatch) => ({
  redirect: (url) => dispatch(replace(url)),
});

const enhance = compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      processSigninRedirectCallback().then(({ state: { redirect = { pathname: '/' } } }) => {
        this.props.redirect(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
      });
    },
  }),
);

export default enhance(() => null);

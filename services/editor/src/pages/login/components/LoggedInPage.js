import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { compose, lifecycle } from 'recompose';

import { processSigninRedirectCallback } from '../../../services/auth-service';

const mapDispatchToProps = dispatch => ({
  redirect: url => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      processSigninRedirectCallback().then(() => this.props.redirect('/'));
    },
  }),
);

export default enhance(() => null);

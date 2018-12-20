import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { compose, lifecycle } from 'recompose';

import { processSilentSigninCallback, storeToken } from '../../../services/auth-service';

const mapDispatchToProps = dispatch => ({
  redirect: url => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      processSilentSigninCallback().then((user) => {
        storeToken(user.access_token);
        this.props.redirect('/');
      });
    },
  }),
);

export default enhance(() => null);

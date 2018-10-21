import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { compose, lifecycle } from 'recompose';
import qs from 'query-string';
import { getAzureToken, getAzureState } from '../../../services/auth-service';

const mapDispatchToProps = dispatch => ({
  redirect: url => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      const state = getAzureState();
      getAzureToken();
      const redirect = (state && state.redirect) || { pathname: '/' };
      this.props.redirect(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
    },
  }),
);

export default enhance(() => null);

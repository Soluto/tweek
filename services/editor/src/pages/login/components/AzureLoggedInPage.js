import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { compose, lifecycle } from 'recompose';
import { getAzureToken, getAzureState } from '../../../services/auth-service';

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
      const { state } = getAzureState();
      getAzureToken();
      const redirect = (state && state.redirect) || { pathname: '/' };
      this.props.redirect(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
    },
  }),
);

export default enhance(() => null);

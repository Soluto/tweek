import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { compose, lifecycle } from 'recompose';
import qs from 'query-string';
import { storeIdToken } from '../../../services/auth-service';

const mapDispatchToProps = dispatch => ({
  redirect: url => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      const { jwt, state } = qs.parse(this.props.location.search);
      storeIdToken(jwt);
      const redirect = JSON.parse(state).redirect;
      this.props.redirect(`${redirect.pathname}${redirect.hash || redirect.search}`);
    },
  }),
);

export default enhance(() => null);

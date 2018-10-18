import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { compose, lifecycle } from 'recompose';
import qs from 'query-string';
import { getAzureToken } from '../../../services/auth-service';

const mapDispatchToProps = dispatch => ({
  redirect: url => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      const { state } = qs.parse(this.props.location.search);
      getAzureToken();
      const redirect = (state && JSON.parse(state).redirect) || { pathname: '/' };
      console.log('REDIRECT TO', `${redirect.pathname}${redirect.hash || redirect.search || ''}`);
      this.props.redirect(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
    },
  }),
);

export default enhance(() => null);

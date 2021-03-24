import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { compose, lifecycle } from 'recompose';
import { getClient } from '../../../services/auth-service';

const mapDispatchToProps = (dispatch) => ({
  redirect: (url) => dispatch(replace(url)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  lifecycle({
    componentDidMount() {
      getClient()
        .processSilentRedirect()
        .then(() => {
          this.props.redirect('/');
        });
    },
  }),
);

export default enhance(() => null);

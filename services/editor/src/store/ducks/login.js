import { push } from 'react-router-redux';

export const redirectToLogin = () => dispatch => dispatch(push('/login'));

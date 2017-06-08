import { notificationTypes } from './constants';
import { redirectToLogin } from './actions';

export default async function handleNotification(notification) {
  notification.close();
  switch (notification.tag) {
  case notificationTypes.LOGIN:
    await redirectToLogin();
    break;
  default:
    break;
  }
}

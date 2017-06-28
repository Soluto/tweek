import { getSelectorByClassNames } from './selectorUtils';

const globalSelectors = {};

globalSelectors.BACKGROUND = getSelectorByClassNames('header');
globalSelectors.ALERT_BACKGROUND = '.rodal-mask';
globalSelectors.ERROR_NOTIFICATION_TITLE = '.notifications-br .notification-error .notification-title';

export default globalSelectors;

import React, {Component} from 'react';
import NotificationSystem from 'react-notification-system';

export default class Notifications extends Component {
  constructor(props) {
    super(props);

    this._notificationSystem = null;
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(nextProps) {
    const {notification:newNotification} = nextProps;
    const {notification:currentNotification} = this.props;
    if (newNotification && (!currentNotification || currentNotification.uid != newNotification.uid)) {
      this._notificationSystem.addNotification(newNotification);
    }
  }

  render() {
    return <NotificationSystem ref="notificationSystem"/>;
  }
}

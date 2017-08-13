import React from 'react';
import './MessageKeyPage.css';

const MessageKeyPage = ({ message, ...props }) => <div className="key-page-message" {...props}>{message}</div>;
export default MessageKeyPage;

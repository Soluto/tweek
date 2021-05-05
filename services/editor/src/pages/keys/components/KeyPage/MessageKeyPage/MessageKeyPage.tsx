import React from 'react';
import './MessageKeyPage.css';

export type MessageKeyPageProps = {
  message: string;
  'data-comp': string;
};

const MessageKeyPage = ({ message, ...props }: MessageKeyPageProps) => (
  <div className="key-page-message" {...props}>
    {message}
  </div>
);

export default MessageKeyPage;

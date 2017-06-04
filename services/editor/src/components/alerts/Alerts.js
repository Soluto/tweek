import React from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import './Alerts.css';

const reactify = (Content, props) =>
  typeof Content === 'string'
    ? <div {...props}>{Content.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
    : <Content {...props} />;

const Alert = ({ title, message, buttons, onClose, showCloseButton = false }) =>
  <Rodal visible showCloseButton={showCloseButton} onClose={onClose} className={'rodal-container'}>
    {title ? reactify(title, { className: 'rodal-header' }) : null}
    {reactify(message, { className: 'rodal-body' })}
    <div className={'rodal-button-container'}>
      {buttons.map(({ text, className, ...props }, i) =>
        <button key={i} className={className} {...props}>{text}</button>,
      )}
    </div>
  </Rodal>;

export default connect(state => state)(({ alerts }) =>
  <div>
    {alerts.map(({ id: key, ...alert }) => <Alert key={key} {...alert} />)}
  </div>,
);

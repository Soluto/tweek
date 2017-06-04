import React from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import style from './Alerts.css';

const reactify = (Content, props) =>
  typeof Content === 'string'
    ? <div {...props}>{Content.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
    : <Content {...props} />;

const Alert = ({ title, message, buttons, onClose, showCloseButton = false }) => (
  <Rodal
    visible
    showCloseButton={showCloseButton}
    onClose={onClose}
    className={style['rodal-container']}
  >
    {title ? reactify(title, { className: style['rodal-header'] }) : null}
    {reactify(message, { className: style['rodal-body'] })}
    <div className={style['rodal-button-container']}>
      {buttons.map(({ text, className, ...props }, i) => (
        <button key={i} className={style[className]} {...props}>{text}</button>
      ))}
    </div>
  </Rodal>
);

export default connect(state => state)(({ alerts }) => (
  <div>
    {alerts.map(({ id: key, ...alert }) => <Alert key={key} {...alert} />)}
  </div>
));

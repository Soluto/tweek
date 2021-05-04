import classNames from 'classnames';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import './Alerts.css';
import './Rodal.css';

const reactify = (Content, props) =>
  typeof Content === 'string' ? (
    <div {...props}>
      {Content.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  ) : (
    <Content {...props} />
  );

const Alert = ({
  title,
  message,
  component: Component,
  buttons,
  onClose,
  showCloseButton = false,
  resizable = false,
}) => {
  const [componentData, setComponentData] = useState();
  return (
    <Rodal
      closeOnEsc={true}
      visible
      showCloseButton={showCloseButton}
      onClose={onClose}
      className={classNames('rodal-container', { resizable })}
    >
      {title && reactify(title, { className: 'rodal-header' })}
      {message && reactify(message, { className: 'rodal-body' })}
      {Component && <Component onChange={setComponentData} componentData={componentData} />}
      <div className={'rodal-button-container'}>
        {buttons.map(({ text, validate, onClick, ...props }, i) => (
          <button
            key={i}
            disabled={validate && !validate(componentData)}
            onClick={() => onClick(componentData)}
            {...props}
          >
            {text}
          </button>
        ))}
      </div>
    </Rodal>
  );
};

export default connect((state) => ({ alerts: state.alerts }))(({ alerts }) => (
  <div id="alerts">
    {alerts.map(({ id: key, ...alert }) => (
      <Alert key={key} {...alert} />
    ))}
  </div>
));

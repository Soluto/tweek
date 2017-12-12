import React from 'react';
import { connect } from 'react-redux';
import { withState, setDisplayName, compose } from 'recompose';
import Rodal from 'rodal';
import './Alerts.css';

const addState = compose(setDisplayName('Alert'), withState('componentData', 'setComponentData'));

const reactify = (Content, props) =>
  typeof Content === 'string' ? (
    <div {...props}>{Content.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
  ) : (
    <Content {...props} />
  );

const Alert = addState(
  ({
    title,
    message,
    component: Component,
    buttons,
    onClose,
    showCloseButton = false,
    componentData,
    setComponentData,
  }) => (
    <Rodal
      closeOnEsc={true}
      visible
      showCloseButton={showCloseButton}
      onClose={onClose}
      className={'rodal-container'}
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
  ),
);

export default connect(state => state)(({ alerts }) => (
  <div id="alerts">{alerts.map(({ id: key, ...alert }) => <Alert key={key} {...alert} />)}</div>
));

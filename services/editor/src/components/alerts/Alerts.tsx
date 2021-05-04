import classNames from 'classnames';
import React, { ComponentType, useState } from 'react';
import { connect } from 'react-redux';
// @ts-ignore
import Rodal from 'rodal';
import './Alerts.css';
import './Rodal.css';
import { AlertButton, AlertData, StyleProps } from './types';

const reactify = (Content: string | ComponentType<StyleProps>, props: StyleProps) =>
  typeof Content === 'string' ? (
    <div {...props}>
      {Content.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  ) : (
    <Content {...props} />
  );

export type AlertButtonProps<T> = Omit<AlertButton<T>, 'value'> & {
  onClick: (data: T) => void;
};

export type AlertProps<T = unknown> = Omit<AlertData<T>, 'buttons'> & {
  buttons: AlertButtonProps<T>[];
  onClose: () => void;
  visible: boolean;
};

export const Alert = ({
  title,
  message,
  component: Component,
  buttons,
  visible,
  onClose,
  showCloseButton = false,
  resizable = false,
}: AlertProps) => {
  const [componentData, setComponentData] = useState<any>();
  return (
    <Rodal
      closeOnEsc={true}
      visible={visible}
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

type State = {
  alerts: Array<Omit<AlertProps, 'visible'> & { id: string }>;
};

const Alerts = ({ alerts }: State) => (
  <div id="alerts">
    {alerts.map(({ id: key, ...alert }) => (
      <Alert key={key} visible {...alert} />
    ))}
  </div>
);

export default connect((state: State) => ({ alerts: state.alerts }))(Alerts);

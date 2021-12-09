import classnames from 'classnames';
import React, { ComponentProps, KeyboardEvent, useEffect, useRef } from 'react';
import './Input.css';

const isEnterKeyPressed = (event: KeyboardEvent) => event.key === 'Enter';

export type InputProps = Omit<ComponentProps<'input'>, 'onChange' | 'value'> & {
  value?: string;
  onEnterKeyPress?: () => void;
  onChange?: (text: string) => void;
  autofocus?: boolean;
};

const Input = ({
  onEnterKeyPress,
  onKeyPress,
  onChange,
  autofocus,
  className,
  ...props
}: InputProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autofocus) {
      ref.current?.focus();
    }
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      className={classnames('text-input', className)}
      onKeyPress={(e) => {
        if (onEnterKeyPress && isEnterKeyPressed(e)) {
          onEnterKeyPress();
          e.preventDefault();
        } else if (onKeyPress) {
          onKeyPress(e);
        }
      }}
      onChange={(e) => onChange && onChange(e.target.value)}
      ref={ref}
      {...props}
    />
  );
};

Input.defaultProps = {
  type: 'text',
  value: '',
};

export default Input;

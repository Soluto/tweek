/* global jest, before, beforeEach, describe, it, expect */
import React from 'react';
import { render } from '@testing-library/react';
import ErrorHandler from './ErrorHandler';

const ErrorComponent = () => {
  throw 'error';
};

describe('ErrorHandler component', () => {
  it('should not render when exception is thrown and no error message is passed', () => {
    const { asFragment } = render(
      <ErrorHandler>
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render error message when exception is thrown', () => {
    const { asFragment } = render(
      <ErrorHandler errorMessage="some error message">
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should call onError when exception is thrown', () => {
    const onErrorMock = jest.fn();
    render(
      <ErrorHandler onError={onErrorMock}>
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(onErrorMock).toHaveBeenCalled();
  });

  it('should render original component correctly', () => {
    const onErrorMock = jest.fn();

    const { asFragment } = render(
      <ErrorHandler errorMessage="some error message" onError={onErrorMock}>
        <div>some element</div>
        <div>another element</div>
      </ErrorHandler>,
    );

    expect(onErrorMock).not.toHaveBeenCalled();
    expect(asFragment()).toMatchSnapshot();
  });
});

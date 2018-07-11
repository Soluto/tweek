/* global jest, before, beforeEach, describe, it, expect */
import React from 'react';
import renderer from 'react-test-renderer';
import ErrorHandler from '../../../../src/components/common/ErrorHandler';

const ErrorComponent = () => {
  throw 'error';
};

describe('ErrorHandler component', () => {
  it('should not render when exception is thrown and no error message is passed', () => {
    const tree = renderer.create(
      <ErrorHandler>
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render error message when exception is thrown', () => {
    const tree = renderer.create(
      <ErrorHandler errorMessage="some error message">
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should call onError when exception is thrown', () => {
    const onErrorMock = jest.fn();
    renderer.create(
      <ErrorHandler onError={onErrorMock}>
        <ErrorComponent />
      </ErrorHandler>,
    );

    expect(onErrorMock).toHaveBeenCalled();
  });

  it('should render original component correctly', () => {
    const onErrorMock = jest.fn();

    const tree = renderer.create(
      <ErrorHandler errorMessage="some error message" onError={onErrorMock}>
        <div>some element</div>
        <div>another element</div>
      </ErrorHandler>,
    );

    expect(onErrorMock).not.toHaveBeenCalled();
    expect(tree).toMatchSnapshot();
  });
});

/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/api/keys/putKey');

import putKey from '../../../../modules/api/keys/putKey';

describe('putKey', () => {
  const metaMock = {
    tags: ['pita1', 'pita2'],
  };

  const expressRequestMock = {
    body: {
      keyDef: {
        source: 'some source',
      },
      meta: metaMock,
    },
  };

  const expressResponseMock = {};

  const keysRepositoryMock = {};
  const metaRepositoryMock = {};

  const validAuthor = {
    name: 'some name',
    email: 'some email',
  };

  const validKeyPath = 'some key path';

  beforeEach(() => {
    const responseSendMock = jest.fn(async () => { });
    expressResponseMock.send = responseSendMock;

    keysRepositoryMock.updateKey = jest.fn(async () => { });
    metaRepositoryMock.updateRuleMeta = jest.fn(async () => { });
  });

  it('should call keysRepository, metaRepository once at this order', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    keysRepositoryMock.updateKey = jest.fn(async () => functionsReferenceOrder.push(keysRepositoryMock.updateKey));
    metaRepositoryMock.updateRuleMeta = jest.fn(async () => functionsReferenceOrder.push(metaRepositoryMock.updateRuleMeta));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      keysRepository: keysRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(keysRepositoryMock.updateKey.mock.calls.length).toEqual(1, 'should call updatre key once');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls.length).toEqual(1, 'should call update key meta once');

    expect(functionsReferenceOrder).toEqual(
      [keysRepositoryMock.updateKey, metaRepositoryMock.updateRuleMeta],
      'shoudl call repositories once');
  });

  it('should call keysRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      keysRepository: keysRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(keysRepositoryMock.updateKey.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update key with correct key path');
    expect(keysRepositoryMock.updateKey.mock.calls[0][1]).toEqual(expressRequestMock.body.keyDef.source, 'should call update ruel with correct key def source');
    expect(keysRepositoryMock.updateKey.mock.calls[0][2]).toEqual(validAuthor, 'should call update key with correct author');
  });

  it('should call metaRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      keysRepository: keysRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update key meta with correct key path');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][1]).toEqual(expressRequestMock.body.meta, 'should call update key meta with correct meta');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][2]).toEqual(validAuthor, 'should call update key meta with correct author');
  });

  it('should call express response once with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      keysRepository: keysRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(expressResponseMock.send.mock.calls.length).toEqual(1, 'should call express response mock once');
    expect(expressResponseMock.send.mock.calls[0][0]).toEqual('OK', 'should call express request with correct parameter');
  });

  it('should call keysRepository, metaRepository with default author if author wasnt given', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    const expectedAuthor = {
      name: 'unknown',
      email: 'unknown@tweek.com',
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      keysRepository: keysRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(keysRepositoryMock.updateKey.mock.calls[0][2]).toEqual(expectedAuthor, 'should call update key with default author');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][2]).toEqual(expectedAuthor, 'should call update key meta with default author');
  });
});

/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/api/keys/deleteKey');

import deleteKey from '../../../modules/api/keys/deleteKey';

describe('deleteKey', () => {
  const expressRequestMock = {};
  const expressResponseMock = {};

  const rulesRepositoryMock = {};
  const metaRepositoryMock = {};

  const validAuthor = {
    name: 'some name',
    email: 'some email',
  };

  const validKeyPath = 'some key path';

  beforeEach(() => {
    const responseSendMock = jest.fn(async () => { });
    expressResponseMock.send = responseSendMock;

    rulesRepositoryMock.deleteKey = jest.fn(async () => { });
    metaRepositoryMock.deleteKeyMeta = jest.fn(async () => { });
  });

  it('should call rulesRepository, metaRepository once at this order', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    rulesRepositoryMock.deleteKey = jest.fn(async () => functionsReferenceOrder.push(rulesRepositoryMock.deleteKey));
    metaRepositoryMock.deleteKeyMeta = jest.fn(async () => functionsReferenceOrder.push(metaRepositoryMock.deleteKeyMeta));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.deleteKey.mock.calls.length).toEqual(1, 'should call delete key once');
    expect(metaRepositoryMock.deleteKeyMeta.mock.calls.length).toEqual(1, 'should call delete key meta once');

    expect(functionsReferenceOrder).toEqual(
      [rulesRepositoryMock.deleteKey, metaRepositoryMock.deleteKeyMeta],
      'shoudl call repositories once');
  });

  it('should call rulesRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.deleteKey.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call delete key with correct key');
    expect(rulesRepositoryMock.deleteKey.mock.calls[0][1]).toEqual(validAuthor, 'should call delete key with correct author');
  });

  it('should call metaRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(metaRepositoryMock.deleteKeyMeta.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call delete key meta with correct key');
    expect(metaRepositoryMock.deleteKeyMeta.mock.calls[0][1]).toEqual(validAuthor, 'should call delete key meta with correct author');
  });

  it('should call express response once with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(expressResponseMock.send.mock.calls.length).toEqual(1, 'should call express response mock once');
    expect(expressResponseMock.send.mock.calls[0][0]).toEqual('OK', 'should call express request with correct parameter');
  });

  it('should call rulesRepository, metaRepository with default author if author wasnt given', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    const expectedAuthor = {
      name: 'unknown',
      email: 'unknown@tweek.com',
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.deleteKey.mock.calls[0][1]).toEqual(expectedAuthor, 'should call delete key with default author');
    expect(metaRepositoryMock.deleteKeyMeta.mock.calls[0][1]).toEqual(expectedAuthor, 'should call delete key meta with default author');
  });
});

/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/api/keys/deleteKey');
jest.unmock('../../../../modules/server/repositories/tweekPathsUtils');

import deleteKey from '../../../../modules/api/keys/deleteKey';

describe('deleteKey', () => {
  const expressRequestMock = {};
  const expressResponseMock = {};

  const gitRepoMock = {};
  const transactionManagerMock = { transact: function(action) { return action(gitRepoMock); }};

  const validAuthor = {
    name: 'some name',
    email: 'some email',
  };

  const validKeyPath = 'some key path';

  beforeEach(() => {
    expressResponseMock.send = jest.fn(async() => { });

    gitRepoMock.pull = jest.fn(async () => { });
    gitRepoMock.deleteFile = jest.fn(async () => { });
    gitRepoMock.commitAndPush = jest.fn(async () => { });
  });

  it('Should pull before deleting and committing', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    gitRepoMock.pull = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.pull));
    gitRepoMock.deleteFile = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.deleteFile));
    gitRepoMock.commitAndPush = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.commitAndPush));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(functionsReferenceOrder).toEqual([
        gitRepoMock.pull,
        gitRepoMock.deleteFile,
        gitRepoMock.deleteFile,
        gitRepoMock.commitAndPush
      ],
      'Operation order is not correct');
  });

  it('should delete the correct files for the key', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(gitRepoMock.deleteFile.mock.calls[0][0]).toEqual(`meta/${paramsMock.splat}.json`, 'Should delete meta file');
    expect(gitRepoMock.deleteFile.mock.calls[1][0]).toEqual(`rules/${paramsMock.splat}.jpad`, 'Should delete jpad');
  });

  it('should call express response once with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(expressResponseMock.send.mock.calls.length).toEqual(1, 'should call express response mock once');
    expect(expressResponseMock.send.mock.calls[0][0]).toEqual('OK', 'should call express request with correct parameter');
  });

  it ('should commit and push with the author send if it was given', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await deleteKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      author: validAuthor,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].name).toEqual(validAuthor.name, 'should call commit and push with default author');
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].email).toEqual(validAuthor.email, 'should call commit and push key with default author');

  });

  it('should call push with default author if author wasnt given', async () => {
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
      gitTransactionManager: transactionManagerMock,
      undefined,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].name).toEqual(expectedAuthor.name, 'should call commit and push with default author');
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].email).toEqual(expectedAuthor.email, 'should call commit and push key with default author');
  });
});

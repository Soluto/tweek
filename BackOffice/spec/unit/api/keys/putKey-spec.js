/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/api/keys/putKey');
jest.unmock('../../../../modules/server/repositories/tweekPathsUtils');

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
    gitRepoMock.updateFile = jest.fn(async () => { });
    gitRepoMock.commitAndPush = jest.fn(async () => { });
  });

  it('Should pull before updating and committing', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    gitRepoMock.pull = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.pull));
    gitRepoMock.updateFile = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.updateFile));
    gitRepoMock.commitAndPush = jest.fn(async () => functionsReferenceOrder.push(gitRepoMock.commitAndPush));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      undefined,
    }, {
        params: paramsMock,
      });

    expect(functionsReferenceOrder).toEqual([
        gitRepoMock.pull,
        gitRepoMock.updateFile,
        gitRepoMock.updateFile,
        gitRepoMock.commitAndPush],
      'should pull, then save files and only then commit and push');
  });

  it('should update the jpad rule file', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(gitRepoMock.updateFile.mock.calls[1][0]).toEqual(`rules/${paramsMock.splat}.jpad`, 'should call update key with correct key path');
    expect(gitRepoMock.updateFile.mock.calls[1][1]).toEqual(expressRequestMock.body.keyDef.source, 'should call update rule with correct key def source');
  });

  it('should update the key meta file', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      author: validAuthor,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(gitRepoMock.updateFile.mock.calls[0][0]).toEqual(`meta/${paramsMock.splat}.json`, 'should call update key with correct meta path');
    expect(gitRepoMock.updateFile.mock.calls[0][1]).toEqual(JSON.stringify(expressRequestMock.body.meta, null, 4), 'should call update meta with correct key meta source');
  });

  it('should call express response once with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      author: validAuthor,
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
    await putKey(expressRequestMock, expressResponseMock, {
      gitTransactionManager: transactionManagerMock,
      author: validAuthor,
    }, {
      params: paramsMock,
    });

    // Assert
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].name).toEqual(validAuthor.name, 'should call commit and push with default author');
    expect(gitRepoMock.commitAndPush.mock.calls[0][1].email).toEqual(validAuthor.email, 'should call commit and push key with default author');

  });


  it('should commit and push with default author if author wasnt given', async () => {
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

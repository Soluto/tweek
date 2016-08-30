/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/api/keys/putKey');

import putKey from '../../../modules/api/keys/putKey';

describe('putKey', () => {
  const metaMock = {
    tags: ['pita1', 'pita2'],
  };

  const expressRequestMock = {
    body: {
      ruleDef: {
        source: 'some source',
      },
      meta: metaMock,
    },
  };

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

    rulesRepositoryMock.updateRule = jest.fn(async () => { });
    metaRepositoryMock.updateRuleMeta = jest.fn(async () => { });
  });

  it('should call rulesRepository, metaRepository once at this order', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    rulesRepositoryMock.updateRule = jest.fn(async () => functionsReferenceOrder.push(rulesRepositoryMock.updateRule));
    metaRepositoryMock.updateRuleMeta = jest.fn(async () => functionsReferenceOrder.push(metaRepositoryMock.updateRuleMeta));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.updateRule.mock.calls.length).toEqual(1, 'should call updatre rule once');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls.length).toEqual(1, 'should call update rule meta once');

    expect(functionsReferenceOrder).toEqual(
      [rulesRepositoryMock.updateRule, metaRepositoryMock.updateRuleMeta],
      'shoudl call repositories once');
  });

  it('should call rulesRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.updateRule.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update rule with correct rule path');
    expect(rulesRepositoryMock.updateRule.mock.calls[0][1]).toEqual(expressRequestMock.body.ruleDef.source, 'should call update ruel with correct rule def source');
    expect(rulesRepositoryMock.updateRule.mock.calls[0][2]).toEqual(validAuthor, 'should call update rule with correct author');
  });

  it('should call metaRepository with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author: validAuthor,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update rule meta with correct rule path');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][1]).toEqual(expressRequestMock.body.meta, 'should call update rule meta with correct meta');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][2]).toEqual(validAuthor, 'should call update rule meta with correct author');
  });

  it('should call express response once with correct parameters', async () => {
    // Arrange
    const paramsMock = {
      splat: validKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
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
    await putKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      undefined,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.updateRule.mock.calls[0][2]).toEqual(expectedAuthor, 'should call update rule with default author');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][2]).toEqual(expectedAuthor, 'should call update rule meta with default author');
  });
});

/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/api/keys/putKey');

import putKey from '../../../modules/api/keys/putKey';

describe('putKey', () => {
  let expressRequestMock = {
    body: {
      ruleDef: {
        source: 'some source',
      },
      meta: '',
    },
  };

  const responseSendMock = jest.fn(() => Promise.resolve(''));
  const expressResponseMock = {
    send: responseSendMock,
  };

  const rulesRepositoryMock = {};
  const metaRepositoryMock = {};

  it('should call rulesRepository and metaRepository at this order with correct parameters', async () => {
    // Arrange
    const functionsReferenceOrder = [];

    rulesRepositoryMock.updateRule = jest.fn(async () => functionsReferenceOrder.push(rulesRepositoryMock.updateRule));
    metaRepositoryMock.updateRuleMeta = jest.fn(async () => functionsReferenceOrder.push(metaRepositoryMock.updateRuleMeta));

    const author = {
      name: 'some name',
      email: 'some email',
    };

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
    };

    // Act
    await putKey(expressRequestMock, expressResponseMock, {
      rulesRepository: rulesRepositoryMock,
      metaRepository: metaRepositoryMock,
      author,
    }, {
        params: paramsMock,
      });

    // Assert
    expect(rulesRepositoryMock.updateRule.mock.calls.length).toEqual(1, 'should call updatre rule once');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls.length).toEqual(1, 'should call update rule meta once');

    expect(functionsReferenceOrder).toEqual([rulesRepositoryMock.updateRule, metaRepositoryMock.updateRuleMeta], 'shoudl call update rule and update rule meta once');

    expect(rulesRepositoryMock.updateRule.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update rule with correct rule path');
    expect(rulesRepositoryMock.updateRule.mock.calls[0][1]).toEqual(expressRequestMock.body.ruleDef.source, 'should call update ruel with correct rule def source');
    expect(rulesRepositoryMock.updateRule.mock.calls[0][2]).toEqual(author, 'should call update rule with correct author');

    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][0]).toEqual(paramsMock.splat, 'should call update rule meta with correct rule path');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][1]).toEqual(expressRequestMock.body.meta, 'should call update rule meta with correct meta');
    expect(metaRepositoryMock.updateRuleMeta.mock.calls[0][2]).toEqual(author, 'should call update rule meta with correct author');

    expect(expressResponseMock.send.mock.calls.length).toEqual(1, 'should call express response mock once');
  });

  it('should call rulesRepository and metaRepository with default author id not given', async () => {
    // Arrange
    rulesRepositoryMock.updateRule = jest.fn(() => Promise.resolve(''));
    metaRepositoryMock.updateRuleMeta = jest.fn(() => Promise.resolve(''));

    const expectedKeyPath = 'some key path';

    const paramsMock = {
      splat: expectedKeyPath,
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

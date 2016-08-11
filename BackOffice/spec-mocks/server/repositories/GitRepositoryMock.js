/* global jest, beforeEach, describe, it, expect */

class GitRepositoryMock {

  setReadFileMock(fileContent, lastModifyDate, lastModifyCompareUrl) {
    const result = {
      fileContent,
      lastModifyDate,
      lastModifyCompareUrl,
    };

    this._setFunctionMock('readFile', true, result);
  }

  setRejectedReadFileMock(exception) {
    this._setFunctionMock('readFile', false, exception);
  }

  setUpdateFile(shouldResolved, returnedValue) {
    this._setFunctionMock('updateFile', shouldResolved, returnedValue);
  }

  setGetFileNames(shouldResolved, returnedValue) {
    this._setFunctionMock('getFileNames', shouldResolved, returnedValue);
  }

  _setFunctionMock(functionName, shouldResolved, returnedValue) {
    if (shouldResolved) {
      this[functionName] = jest.fn(async () => returnedValue);
      return;
    }

    this[functionName] = jest.fn(async () => Promise.reject(returnedValue));
  }
}

export default GitRepositoryMock;

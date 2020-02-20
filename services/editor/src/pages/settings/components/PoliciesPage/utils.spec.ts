import { renderHook, act } from '@testing-library/react-hooks';
import { LoadingState, useRemoteState } from './utils';

describe('useRemoteState', () => {
  it('should load data', async () => {
    const mockLoad = jest.fn().mockResolvedValue({ test: 'abc' });

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState(mockLoad, jest.fn()));
    let [data, , remote] = result.current;

    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(remote.loadingState).toEqual(LoadingState.loading);

    await waitForNextUpdate();
    [data, , remote] = result.current;

    expect(data).toEqual({ test: 'abc' });
    expect(remote.loadingState).toEqual(LoadingState.idle);
  });

  it('should identify dirty state', async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState(mockLoad, jest.fn()));
    await waitForNextUpdate();

    let [, setData, remote] = result.current;
    expect(remote.isDirty).toEqual(false);

    act(() => setData('abc1'));
    [, setData, remote] = result.current;
    expect(remote.isDirty).toEqual(true);

    act(() => setData('abc'));
    [, , remote] = result.current;
    expect(remote.isDirty).toEqual(false);
  });

  it('should save state', async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');
    const mockSave = jest.fn((newData) => {
      mockLoad.mockResolvedValue(newData);
    });

    const { unmount, rerender, result, waitForNextUpdate } = renderHook(() =>
      useRemoteState(mockLoad, mockSave),
    );

    await waitForNextUpdate();
    let [data, setData] = result.current;
    act(() => setData('abc1'));

    let [, , remote] = result.current;
    act(() => {
      remote.save();
    });

    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.saving);
    await waitForNextUpdate();
    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.idle);

    expect(mockSave).toHaveBeenCalledWith('abc1');
  });

  it("save should be no-op if data hasn't changed", async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');
    const mockSave = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState(mockLoad, mockSave));

    await waitForNextUpdate();
    let [, setData] = result.current;
    act(() => setData('abc1'));

    [, setData] = result.current;
    act(() => setData('abc'));

    let [, , remote] = result.current;
    act(() => {
      remote.save();
    });

    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.idle);
    expect(mockSave).toHaveBeenCalledTimes(0);
  });

  it('it should set state to error if failed to load', async () => {
    const mockLoad = jest.fn().mockRejectedValue(new Error('some error'));

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState(mockLoad, jest.fn()));

    let [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.loading);

    await waitForNextUpdate();
    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.error);
    expect(remote.error.message).toEqual('some error');
  });

  it('if failed to save, it should set state to idle, project error value and allow to retry', async () => {
    let tries = 0;
    let remoteData = 'abc';
    const mockLoad = jest.fn(() => Promise.resolve(remoteData));
    const mockSave = jest.fn((newData) =>
      tries++ == 0 ? Promise.reject(new Error('failed to save')) : (remoteData = newData),
    );

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState(mockLoad, mockSave));

    await waitForNextUpdate();
    let [, setData] = result.current;
    act(() => setData('abc1'));

    let [, , remote] = result.current;
    act(() => {
      remote.save();
    });

    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.saving);

    await waitForNextUpdate();
    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.idle);
    expect(remoteData).toEqual('abc');
    expect(remote.error.message).toEqual('failed to save');

    act(() => {
      remote.save();
    });

    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.saving);

    await waitForNextUpdate();
    [, , remote] = result.current;
    expect(remote.loadingState).toEqual(LoadingState.idle);
    expect(remoteData).toEqual('abc1');
    expect(remote.error).toEqual(undefined);
  });
});

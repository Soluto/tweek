import { act, renderHook } from '@testing-library/react-hooks';
import { useRemoteState } from './hooks';

describe('useRemoteState', () => {
  const render = (...args) =>
    renderHook(() => {
      const [data, setData, remote] = useRemoteState(...args);
      return { data, setData, remote };
    });

  it('should load data', async () => {
    const mockLoad = jest.fn(() => Promise.resolve({ test: 'abc' }));

    const { waitForNextUpdate, result } = render(mockLoad, jest.fn());

    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(result.current.remote.loadingState).toEqual('loading');

    await waitForNextUpdate();

    expect(result.current.data).toEqual({ test: 'abc' });
    expect(result.current.remote.loadingState).toEqual('idle');
  });

  it('should identified dirty state', async () => {
    const mockLoad = jest.fn(() => Promise.resolve('abc'));

    const { waitForNextUpdate, result } = render(mockLoad, jest.fn());

    await waitForNextUpdate();

    expect(result.current.remote.isDirty).toEqual(false);

    act(() => {
      result.current.setData('abc1');
    });

    expect(result.current.remote.isDirty).toEqual(true);

    act(() => {
      result.current.setData('abc');
    });

    expect(result.current.remote.isDirty).toEqual(false);
  });

  it('should save state', async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');
    const mockSave = jest.fn();

    const { waitForNextUpdate, result } = render(mockLoad, mockSave);

    expect(result.current.remote.loadingState).toEqual('loading');

    await waitForNextUpdate();

    act(() => {
      result.current.setData('abc1');
    });

    act(() => {
      result.current.remote.save();
    });

    expect(result.current.remote.loadingState).toEqual('saving');

    await waitForNextUpdate();

    expect(result.current.remote.loadingState).toEqual('idle');
    expect(result.current.data).toEqual('abc1');

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith('abc1');
  });

  it("save should be no-op if data hasn't changed", async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');
    const mockSave = jest.fn();

    const { waitForNextUpdate, result } = render(mockLoad, mockSave);

    await waitForNextUpdate();
    act(() => {
      result.current.setData('abc1');
    });
    act(() => {
      result.current.setData('abc');
    });
    act(() => {
      result.current.remote.save();
    });

    expect(result.current.remote.loadingState).toEqual('idle');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('it should set state to error if failed to load', async () => {
    const mockLoad = jest.fn().mockRejectedValue(new Error('some error'));

    const { waitForNextUpdate, result } = render(mockLoad, jest.fn());
    expect(result.current.remote.loadingState).toEqual('loading');
    await waitForNextUpdate();
    expect(result.current.remote.loadingState).toEqual('error');
    expect(result.current.remote.error.message).toEqual('some error');
  });

  it('if failed to save, it should set state to idle, project error value and allow to retry', async () => {
    const mockLoad = jest.fn().mockResolvedValue('abc');
    const mockSave = jest.fn().mockRejectedValueOnce(new Error('failed to save'));

    const { waitForNextUpdate, result } = render(mockLoad, mockSave);

    await waitForNextUpdate();

    act(() => {
      result.current.setData('abc1');
    });
    act(() => {
      result.current.remote.save();
    });

    expect(result.current.remote.loadingState).toEqual('saving');
    await waitForNextUpdate();
    expect(result.current.remote.loadingState).toEqual('idle');
    expect(mockSave).toHaveBeenCalledWith('abc1');
    expect(result.current.remote.isDirty).toEqual(true);
    expect(result.current.remote.error.message).toEqual('failed to save');

    act(() => {
      result.current.remote.save();
    });

    expect(result.current.remote.loadingState).toEqual('saving');
    await waitForNextUpdate();
    expect(result.current.remote.loadingState).toEqual('idle');
    expect(mockSave).toHaveBeenCalledWith('abc1');
    expect(result.current.remote.isDirty).toEqual(false);
    expect(result.current.remote.error).toEqual(undefined);
  });
});

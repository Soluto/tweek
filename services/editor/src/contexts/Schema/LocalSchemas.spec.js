import { act, renderHook } from '@testing-library/react-hooks';
import cogoToast from 'cogo-toast';
import jsonpatch from 'fast-json-patch';
import { MemoryRouter } from 'react-router';
import { tweekManagementClient } from '../../utils';
import { useLocalSchema, useLocalSchemasContext } from './LocalSchemas';
import { useSchemasContext } from './Schemas';

jest.mock('../../utils/tweekClients');
jest.mock('cogo-toast');

describe('useLocalSchema', () => {
  let local$;
  let remote$;

  beforeEach(() => {
    cogoToast.loading.mockReturnValue({ hide: jest.fn() });

    const { result: local } = renderHook(() => useLocalSchemasContext());
    local$ = local.current;
    local$.next({});

    const { result: remote } = renderHook(() => useSchemasContext());
    remote$ = remote.current;
    remote$.next({});
  });

  describe('Manage identity properties', () => {
    it('identity property can be added or updated', () => {
      const { result } = renderHook(() => useLocalSchema('user'));

      act(() => result.current.setProperty('age', 30));

      expect(result.current.local).toMatchObject({ age: 30 });

      act(() => result.current.setProperty('age', 40));

      expect(result.current.local).toMatchObject({ age: 40 });
    });

    it('identity property can be removed', () => {
      const { result } = renderHook(() => useLocalSchema('user'));

      act(() => result.current.setProperty('age', 30));

      expect(result.current.local).toMatchObject({ age: 30 });

      act(() => result.current.removeProperty('age'));

      expect(result.current.local).not.toHaveProperty('age');
    });
  });

  describe('Remote Updates', () => {
    it('saving new identity', async () => {
      const { result } = renderHook(() => useLocalSchema('user'));

      act(() => result.current.setProperty('age', 30));

      await act(() => result.current.saveIdentity());

      expect(tweekManagementClient.saveIdentity).toHaveBeenCalledWith('user', { age: 30 });

      expect(remote$.value).toHaveProperty('user', { age: 30 });
      expect(local$.value).not.toHaveProperty('user');
    });

    it('updating existing identity', async () => {
      const oldState = { age: 30 };
      const newState = { age: 40, gender: 'female' };

      remote$.next({ user: oldState });

      const { result } = renderHook(() => useLocalSchema('user'));

      act(() => result.current.setProperty('age', 40));
      act(() => result.current.setProperty('gender', 'female'));

      await act(() => result.current.saveIdentity());

      const patch = jsonpatch.compare(oldState, newState);
      expect(tweekManagementClient.patchIdentity).toHaveBeenCalledWith('user', patch);
      expect(remote$.value).toHaveProperty('user', newState);
      expect(local$.value).not.toHaveProperty('user');
    });

    it('delete existing identity', async () => {
      remote$.next({ user: {} });
      const { result } = renderHook(() => useLocalSchema('user'), { wrapper: MemoryRouter });

      act(() => result.current.setProperty('age', 30));

      await act(() => result.current.deleteIdentity());

      expect(tweekManagementClient.deleteIdentity).toHaveBeenCalledWith('user');
      expect(remote$.value).not.toHaveProperty('user');
      expect(local$.value).not.toHaveProperty('user');
    });
  });
});

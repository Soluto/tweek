import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Tag } from 'react-tag-input';
import { BehaviorSubject } from 'rxjs';
import { showError, tweekManagementClient } from '../utils';

export const TagsContext = createContext(new BehaviorSubject<Tag[]>([]));

export const useTags = () => {
  const tags$ = useContext(TagsContext);
  const [tags, setTags] = useState(tags$.value);

  useEffect(() => {
    const subscription = tags$.subscribe(setTags);
    return () => subscription.unsubscribe();
  }, [tags$]);

  return tags;
};

export const useLoadTags = () => {
  const tags$ = useContext(TagsContext);
  useEffect(() => {
    const load = async () => {
      try {
        const tags = await tweekManagementClient.getAllTags();
        tags$.next(tags.map((t) => ({ id: t.name.toLowerCase(), text: t.name })));
      } catch (error) {
        showError(error, 'Failed to download tags');
      }
    };

    load();
  }, [tags$]);
};

export const useSaveNewTag = () => {
  const tags$ = useContext(TagsContext);

  return useCallback(
    async (tag: string) => {
      const newTag = { id: tag.toLowerCase(), text: tag };

      if (tags$.value.some((t) => t.id === newTag.id)) {
        console.log('no new tags to save found');
        return;
      }

      try {
        await tweekManagementClient.appendTags([tag]);
        tags$.next([...tags$.value, newTag]);
      } catch (error) {
        showError(error, 'Failed to save new tags');
      }
    },
    [tags$],
  );
};

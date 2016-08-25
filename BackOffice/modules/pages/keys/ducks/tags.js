import { handleActions } from 'redux-actions';
import { withJsonData } from './withJsonData';
import R from 'ramda';

const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
const TAGS_SAVED = 'TAGS_SAVED';

export async function downloadTags() {
  const tags = await (await fetch('/api/tags', { credentials: 'same-origin' })).json();
  return { type: TAGS_DOWNLOADED, payload: tags };
}

export const saveNewTags = (tagsToSave) => async function (dispatch, getState) {
  const currentTags = getState().tags.map(x => x.name);
  const newTags = R.difference(tagsToSave, currentTags);

  if (newTags.length < 1) {
    console.log('no new tags to save found');
    return;
  }

  await fetch('/api/tags', {
    credentials: 'same-origin',
    method: 'put',
    ...withJsonData(newTags),
  });

  dispatch({ type: TAGS_SAVED, payload: newTags });
};

export default handleActions({
  [TAGS_DOWNLOADED]: (state, { payload }) => payload,
  [TAGS_SAVED]: (state, { payload }) => R.uniq([...state, ...(payload.map(x => ({ name: x })))]),
}, []);

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
  console.log(tagsToSave, currentTags);
  return;
  const newTagsDiff = R.symmetricDifference(tagsToSave, currentTags);

  await fetch('/api/tags', {
    credentials: 'same-origin',
    method: 'put',
    ...withJsonData(newTagsDiff),
  });

  dispatch({ type: TAGS_SAVED, payload: newTagsDiff });
};

export default handleActions({
  [TAGS_DOWNLOADED]: (state, { payload }) => payload,
  [TAGS_SAVED]: (state, { payload }) => R.uniq([...state, ...(payload.map(x => ({ name: x })))]),
}, []);

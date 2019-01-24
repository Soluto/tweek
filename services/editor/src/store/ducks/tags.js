/* global process console */
import { handleActions } from 'redux-actions';
import * as R from 'ramda';
import { tweekManagementClient } from '../../utils/tweekClients';
import { showError } from './notifications';

const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
const TAGS_SAVED = 'TAGS_SAVED';

export async function downloadTags() {
  try {
    const tags = await tweekManagementClient.getAllTags();
    return { type: TAGS_DOWNLOADED, payload: tags };
  } catch (error) {
    return showError({ title: 'Failed to download tags', error });
  }
}

export const saveNewTags = tagsToSave =>
  async function (dispatch, getState) {
    const currentTags = getState().tags.map(x => x.name);
    const newTags = R.difference(tagsToSave, currentTags).filter(x => x != null);

    if (newTags.length < 1) {
      console.log('no new tags to save found');
      return;
    }

    try {
      await tweekManagementClient.appendTags(newTags);

      dispatch({ type: TAGS_SAVED, payload: newTags });
    } catch (error) {
      dispatch(showError({ title: 'Failed to save new tags', error }));
    }
  };

export default handleActions(
  {
    [TAGS_DOWNLOADED]: (state, { payload }) => payload,
    [TAGS_SAVED]: (state, { payload }) => R.uniq([...state, ...payload.map(x => ({ name: x }))]),
  },
  [],
);

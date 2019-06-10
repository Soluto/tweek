/* global process console */
import { handleActions } from 'redux-actions';
import { tweekManagementClient } from '../../utils/tweekClients';
import { showError } from './notifications';

const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
const TAGS_SAVED = 'TAGS_SAVED';

export function downloadTags() {
  return async (dispatch) => {
    try {
      const tags = await tweekManagementClient.getAllTags();
      return dispatch({ type: TAGS_DOWNLOADED, payload: tags });
    } catch (error) {
      return dispatch(showError({ title: 'Failed to download tags', error }));
    }
  };
}

export const saveNewTag = (tagToSave) =>
  async function(dispatch, getState) {
    const currentTags = getState().tags;
    if (currentTags[tagToSave.id]) {
      console.log('no new tags to save found');
      return;
    }

    try {
      await tweekManagementClient.appendTags([tagToSave.text]);

      dispatch({ type: TAGS_SAVED, payload: tagToSave });
    } catch (error) {
      dispatch(showError({ title: 'Failed to save new tags', error }));
    }
  };

export default handleActions(
  {
    [TAGS_DOWNLOADED]: (state, { payload }) =>
      payload.reduce((acc, { name }) => ({ ...acc, [name.toLowerCase()]: name }), {}),
    [TAGS_SAVED]: (state, { payload }) => ({ ...state, ...payload }),
  },
  [],
);

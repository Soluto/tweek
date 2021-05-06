import { handleActions } from 'redux-actions';
import { showError, tweekManagementClient } from '../../utils';

const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
const TAGS_SAVED = 'TAGS_SAVED';

export function downloadTags() {
  return async (dispatch) => {
    try {
      const tags = await tweekManagementClient.getAllTags();
      return dispatch({ type: TAGS_DOWNLOADED, payload: tags });
    } catch (error) {
      showError(error, 'Failed to download tags');
    }
  };
}

export const saveNewTag = (tagToSave) =>
  async function (dispatch, getState) {
    const currentTags = getState().tags;
    if (currentTags[tagToSave.id]) {
      console.log('no new tags to save found');
      return;
    }

    try {
      await tweekManagementClient.appendTags([tagToSave.text]);

      dispatch({ type: TAGS_SAVED, payload: tagToSave });
    } catch (error) {
      showError(error, 'Failed to save new tags');
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

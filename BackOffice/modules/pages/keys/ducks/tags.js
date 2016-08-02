import { handleActions } from 'redux-actions';
const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';

export async function downloadTags() {
  const tags = await (await fetch(`/api/tags`, { credentials: 'same-origin' })).json();
  return { type: TAGS_DOWNLOADED, payload: tags };
}

export default handleActions({
  [TAGS_DOWNLOADED]: (state, { payload }) => payload,
}, []);

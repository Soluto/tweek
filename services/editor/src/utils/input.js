export const inputKeyboardHandlers = ({ submit, cancel }) => ({
  onKeyUp: (e) => {
    if (e.keyCode === 13 && submit) submit(e.target.value);
    if (e.keyCode === 27 && cancel) cancel();
  },
});

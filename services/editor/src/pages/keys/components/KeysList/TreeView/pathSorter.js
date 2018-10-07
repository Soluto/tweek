export const leaf = Symbol();
export const compsPathSorter = (l, r) => {
  if (l.props.node === leaf && r.props.node !== leaf) return 1;
  if (r.props.node === leaf && l.props.node !== leaf) return -1;
  return l.props.name.localeCompare(r.props.name);
};

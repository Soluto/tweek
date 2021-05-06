export const leaf = Symbol();

type Tree = { [p: string]: TreeNode };

type TreeNode = Tree | typeof leaf;

export type CompareTreeNode = [string, TreeNode];

export const compsPathSorter = (
  [lname, lnode]: CompareTreeNode,
  [rname, rnode]: CompareTreeNode,
) => {
  if (lnode === leaf && rnode !== leaf) return 1;
  if (rnode === leaf && lnode !== leaf) return -1;
  return lname.localeCompare(rname);
};

export const pathsToTree = (paths: string[]): Tree => {
  const tree: Tree = {};

  paths
    .map((x) => x.split('/'))
    .forEach((fragments) => {
      const last = fragments.pop();
      fragments.reduce((node, frag) => (node[frag] = (node[frag] as Tree) || {}), tree)[
        last!
      ] = leaf;
    });

  return tree;
};

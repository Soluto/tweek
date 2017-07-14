export function getRelativeSelector(selectorsHierarchy) {
  return selectorsHierarchy.join(' ');
}

export function getSelectorByClassNames() {
  let classes = Object.keys(arguments).map(x => arguments[x]);
  classes = classes.map(x => `[class*= ${x}]`);
  return getRelativeSelector(classes);
}

export function _getSelectorByIndex(selector, index) {
  return index ? selector + `:nth-of-type(${index})` : selector;
}

export function _getSelectorWithAttribute(selector, attribute, value) {
  return selector + `[${attribute}*="${value}"]`;
}

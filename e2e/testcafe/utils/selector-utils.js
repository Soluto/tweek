import R from 'ramda';

export const attributeSelector = R.curryN(2, (attribute, name) => `[${attribute}= "${name}"]`);

export const dataComp = attributeSelector('data-comp');

export const dataField = attributeSelector('data-field');

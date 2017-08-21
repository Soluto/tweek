import R from 'ramda';

export const attributeSelector = R.curryN(2, (attribute, name) => `[${attribute}= "${name}"]`);

export const nthSelector = R.curryN(2, (index, selector) => index ? `${selector}:nth-of-type(${index})` : selector);

export const dataComp = attributeSelector('data-comp');

export const dataField = attributeSelector('data-field');

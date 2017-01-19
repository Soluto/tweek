export const boolAllowedValue = [{ label: 'true', value: true }, { label: 'false', value: false }];

export const fromEnum = (...enumValues) => enumValues.map(x => ({ label: x, value: x }));
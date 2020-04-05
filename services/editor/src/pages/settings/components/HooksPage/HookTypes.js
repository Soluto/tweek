export const hookTypes = [
  { label: 'Webhook', value: 'webhook' },
];

export const hookLabelsByType = hookTypes.reduce((labelsByType, typeObject) => {
  labelsByType[typeObject.value] = typeObject.label;
  return labelsByType;
}, {});

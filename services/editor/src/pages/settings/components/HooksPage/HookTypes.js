export const hookTypes = [
  { label: 'Webhook', value: 'webhook' },
];

export const hookLabelsByType = hookTypes.reduce((labelsByType, {value, label}) => ({
  ...labelsByType,
  [value]: label
}), {});

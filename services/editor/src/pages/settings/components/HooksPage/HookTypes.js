export const hookTypes = [
  { label: 'Webhook', value: 'notification_webhook' },
];

export const hookLabelsByType = hookTypes.reduce((labelsByType, {value, label}) => ({
  ...labelsByType,
  [value]: label
}), {});

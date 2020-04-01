export const hookTypes = [
  { label: 'Notification Webhook', value: 'notification_webhook' },
  { label: 'Slack Webhook', value: 'slack_webhook' },
];

export const hookLabelsByType = hookTypes.reduce((labelsByType, typeObject) => {
  labelsByType[typeObject.value] = typeObject.label;
  return labelsByType;
}, {});

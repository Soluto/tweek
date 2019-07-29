export const hookTypes = [{ label: 'Notification Webhook', value: 'notification_webhook' }];

export const hookLabelsByType = hookTypes.reduce((labelsByType, typeObject) => {
  labelsByType[typeObject.value] = typeObject.label;
  return labelsByType;
}, {});

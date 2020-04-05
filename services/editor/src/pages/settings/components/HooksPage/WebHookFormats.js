export const webhookFormats = [
  { label: 'JSON', value: 'json' },
  { label: 'Slack', value: 'slack' },
];

export const webhookLabelsByFormat = webhookFormats.reduce((labelsByFormat, formatObject) => {
  labelsByFormat[formatObject.value] = formatObject.label;
  return labelsByFormat;
}, {});

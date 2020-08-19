export const webhookFormats = [
  { label: 'JSON', value: 'json' },
  { label: 'Slack', value: 'slack' },
];

export const webhookLabelsByFormat = webhookFormats.reduce((labelsByFormat, { value, label }) => ({
  ...labelsByFormat,
  [value]: label,
}), {});

import { createLogger, stdSerializers } from 'bunyan';

export default createLogger({
  name: 'tweek-authoring',
  serializers: stdSerializers,
  level: 0,
});

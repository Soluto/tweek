import morgan from 'morgan';

morgan.token('level', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) {
    return '50';
  }

  if (status >= 400) {
    return '40';
  }

  return '30';
});

const messageFormat =
  '{"level"::level,"msg":"request handling result","method":":method","url":":url","status":":status","content-length":":res[content-length]","response-time-ms":":response-time"}';

export default morgan(messageFormat);

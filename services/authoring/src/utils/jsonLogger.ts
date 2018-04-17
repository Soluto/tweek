import morgan = require('morgan');
import express = require('express');

const getLevelByStatus = (status: string): string => {
    let result: string;
    const intStatus = parseInt(status, 10);
    switch (intStatus / 100) {
        case 4:
            result = 'Warning';
            break;
        case 5:
            result = 'Error';
            break;
        case 1:
        case 2:
        case 3:
        default:
            result = 'Info';
            break;
    }
    return result;
};

const levels: Array<any> = [
    { method: 'info', level: 'Info' },
    { method: 'log', level: 'Info' },
    { method: 'warn', level: 'Warning' },
    { method: 'error', level: 'Error' },
    { method: 'trace', level: 'Trace' },
];

export const logger = levels.reduce((acc, log) => ({
    ...acc,
    [log.method || log]: (Message, ExtraData) => console.log(JSON.stringify({ Level: log.level || log, Message, ExtraData }))
  }), {});

export const morganJSON = morgan((tokens, req, res) => {
    const Method = tokens.method(req, res);
    const Url = tokens.url(req, res);
    const Status = tokens.status(req, res);
    const ContentLength = tokens.res(req, res, 'content-length');
    const ResponseTimeMs = tokens['response-time'](req, res);
    const Message = `${Method} ${Url} ${Status} ${ContentLength} - :${ResponseTimeMs} ms`;
    const Level = getLevelByStatus(Status);
    return JSON.stringify({
        Level,
        Method,
        Url,
        Status,
        ContentLength,
        ResponseTimeMs
    });
});

export default morganJSON;

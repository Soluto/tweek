import morgan = require('morgan');
import express = require('express');

const getLevelByStatus = (status: string): string => {
    var result: string;
    const intStatus = parseInt(status);
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
}

export const morganJSON = morgan((tokens, req, res) =>{
    const Method = tokens.method(req, res);
    const Url = tokens.url(req, res);
    const Status = tokens.status(req, res);
    const ContentLength = tokens.res(req, res, 'content-length')
    const ResponseTimeMs = tokens['response-time'](req, res)
    const Message =  `${Method} ${Url} ${Status} ${ContentLength} - :${ResponseTimeMs} ms`;
    const Level = getLevelByStatus(Status)
    return JSON.stringify({
        Level,
        Method,
        Url,
        Status,
        ContentLength,
        ResponseTimeMs
    })
} )

export default morganJSON;

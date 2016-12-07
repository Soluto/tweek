var webdriverio = require('webdriverio');
var options = {
    services: ['selenium-standalone'],
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {"args": ["--no-sandbox"]}
    },
    host: 'localhost',
    port: 4444
};
webdriverio
    .remote(options)
    .init()
    .url('http://www.google.com')
    .getTitle().then(function(title) {
        console.log('Title was: ' + title);
    })
    .end();
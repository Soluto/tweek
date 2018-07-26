/* global require console __dirname process */
const path = require('path');
const fs = require('fs');
const express = require('express');

const indexFilePath = path.resolve(__dirname, 'build', 'index.html');
const envVarsFilePath = path.resolve(__dirname, 'build', 'envVars.js');

fs.writeFileSync(envVarsFilePath, `window.GATEWAY_URL='${process.env.REACT_APP_GATEWAY_URL}';`);
const indexFileContent = fs.readFileSync(indexFilePath, 'utf8');
const newIndexFileContent = indexFileContent.includes('envVars.js')
  ? indexFileContent
  : indexFileContent.replace(
    '<div id="root"></div>',
    '<div id="root"></div><script type="text/javascript" src="./envVars.js"></script>',
  );

fs.writeFileSync(indexFilePath, newIndexFileContent);

const app = express();
app.use(express.static(path.resolve(__dirname, 'build')));
app.get('/health', (req, res) => res.send('healthy'));
app.get('*', (req, res) => {
  res.sendFile(indexFilePath);
});

app.listen(3000, () => console.log('The server is listening on port 3000'));

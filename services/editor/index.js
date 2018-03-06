/* global require console __dirname */
const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.resolve(__dirname, 'build')));
app.get('/health', (req, res) => res.send('healthy'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(3000, () => console.log('The server is listening on port 3000'));

import express from 'express';
import path from 'path';
import nconf from 'nconf';

nconf.argv().env().defaults({ PORT: '3001'});

const PORT = nconf.get('PORT');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use("/api", (req, res) => {
   res.send("sup yo yo");
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(PORT, () => console.log('Listening on port %d', server.address().port));

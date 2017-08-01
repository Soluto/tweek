const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const deletePath = require('rimraf-promise');
const R = require('ramda');
const JSZip = require('jszip');

const supportedExtensions = ['.jpad', '.json'];

async function bulkKeysUpload(req, res, { keysRepository }) {
  const { 'author.name': name, 'author.email': email } = req.query;
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (!files.bulk) {
      return res.status(400).send('Required file is missing: bulk');
    }
    const root = await new JSZip().loadAsync(fs.readFileSync(files.bulk.path));
    const fileEntries = R.values(root.files)
      .filter(file => !file.dir)
      .map(file => ({
        name: file.name,
        read: () => file.async('string'),
      }))
      .filter(fileEntry =>
        supportedExtensions.find(extension => extension === path.extname(fileEntry.name)),
      );
    try {
      await keysRepository.updateBulkKeys(fileEntries, { name, email });
    } catch (err) {
      console.error('There was a problem with updating keys in repository: ', err);
      return res.sendStatus(500);
    }
    try {
      await deletePath(files.bulk.path);
    } catch (err) {
      console.error('There was a problem with deleting temporary zip path: ', err);
    }
    return res.sendStatus(200);
  });
}

module.exports = { bulkKeysUpload };

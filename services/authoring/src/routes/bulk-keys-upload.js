const fs = require('fs');
const path = require('path');
const R = require('ramda');
const JSZip = require('jszip');

const supportedExtensions = ['.jpad', '.json'];

async function bulkKeysUpload(req, res, { author, keysRepository }) {
  if (!req.files) {
    return res.status(400).send('Required file is missing: bulk');
  }
  let zipRoot = {};
  try {
    zipRoot = await new JSZip().loadAsync(fs.readFileSync(req.files[0].path));
  } catch (err) {
    return res.status(400).send(`Zip is corrupted: ${err}`);
  }
  const transformIntoEntriesArray = R.pipe(
    R.values,
    R.filter(file => !file.dir),
    R.map(file => ({
      name: file.name,
      read: () => file.async('string'),
    })),
    R.filter(file => supportedExtensions.includes(path.extname(file.name))),
  );
  const fileEntries = transformIntoEntriesArray(zipRoot.files);
  await keysRepository.updateBulkKeys(fileEntries, author);
  return res.sendStatus(200);
}

module.exports = { bulkKeysUpload };

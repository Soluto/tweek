const fs = require('fs');
const path = require('path');
const R = require('ramda');
const JSZip = require('jszip');

const supportedPaths = [/^manifests\/.+?\.json/, /^implementations\/.+\/.+?\./];
const isValidPath = x => R.any(R.test(R.__, x))(supportedPaths);

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
  );
  const fileEntries = transformIntoEntriesArray(zipRoot.files);

  if (!R.all(isValidPath, fileEntries.map(x => x.name))) {
    return res
      .status(400)
      .send(`invalid folder structure:${fileEntries.map(x => x.name).join(',')}`);
  }

  await keysRepository.updateBulkKeys(fileEntries, author);
  return res.sendStatus(200);
}

module.exports = { bulkKeysUpload };

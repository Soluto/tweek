const nconf = require('nconf');
const minio = require('minio');
const { getEnv } = require('./clients');
const fs = require('fs');

module.exports.getObjectContentFromMinio = async objectName => {
  nconf.required(['MINIO_HOST', 'MINIO_PORT', 'MINIO_BUCKET']);

  accessKey = await getEnv('MINIO_ACCESS_KEY');
  secretKey = await getEnv('MINIO_SECRET_KEY');

  const mc = new minio.Client({
    endPoint: nconf.get('MINIO_HOST'),
    port: Number(nconf.get('MINIO_PORT')),
    accessKey,
    secretKey,
    secure: false,
  });

  return new Promise((resolve, reject) =>
    mc.getObject(nconf.get('MINIO_BUCKET'), objectName, (err, stream) => {
      if (err) {
        reject(err);
      }
      if (!stream) {
        reject('stream is null.');
      }
      const contentChuncks = [];
      stream.on('data', chunk => contentChuncks.push(chunk));
      stream.on('end', () => {
        resolve(contentChuncks.join(''));
      });
      stream.on('error', err => {
        reject(err);
      });
    }),
  );
};

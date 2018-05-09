const nconf = require('nconf');
const minio = require('minio');
const { getEnv } = require('./clients');
const fs = require('fs');

module.exports.getObjectContentFromMinio = async objectName => {
  nconf.required(['MINIO_HOST', 'MINIO_PORT', 'MINIO_BUCKET']);

  const mc = new minio.Client({
    endPoint: nconf.get('MINIO_HOST'),
    port: Number(nconf.get('MINIO_PORT')),
    accessKey: nconf.get('MINIO_ACCESS_KEY'),
    secretKey: nconf.get('MINIO_SECRET_KEY'),
    secure: false,
  });

  return await new Promise((resolve, reject) =>
    mc.getObject(nconf.get('MINIO_BUCKET'), objectName, (err, stream) => {
      if (err) {
        return reject(err);
      }
      if (!stream) {
        return reject('stream is null.');
      }
      const contentChuncks = [];
      stream.on('data', chunk => contentChuncks.push(chunk));
      stream.on('end', () => {
        return resolve(contentChuncks.join(''));
      });
      stream.on('error', err => {
        return reject(err);
      });
    }),
  );
};

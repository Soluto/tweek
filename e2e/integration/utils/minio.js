const nconf = require('nconf');
const minio = require('minio');
const { getEnv } = require('./clients');

module.exports.getObjectContentFromMinio = async objectName => {
  nconf.required(['MINIO_HOST', 'MINIO_PORT', 'MINIO_BUCKET']);

  const mc = new minio.Client({
    endPoint: nconf.get('MINIO_HOST'),
    port: Number(nconf.get('MINIO_PORT')),
    accessKey: getEnv('MINIO_ACCESS_KEY'),
    secretKey: getEnv('MINIO_SECRET_KEY'),
  });

  await mc.fGetObject(nconf.get('MINIO_BUCKET'), objectName, '/tmp/policy.csv');
  return fs.readFileSync('/tmp/policy.csv', 'utf8');

  // return new Promise((resolve, reject) =>
  //   mc.fGetObject(nconf.get('MINIO_BUCKET'), objectName, '/tmp/policy.csv',
  //     err => err ? reject(err) : fs.readFileSync('/tmp/policy.csv', 'utf8')));

  // return new Promise((resolve, reject) => mc.getObject(nconf.get('MINIO_BUCKET'), objectName, (err, stream) => {
  //   if (err) { reject(err); }
  //   if (!stream) { reject('stream is null.'); }
  //   const contentChuncks = [];
  //   stream.on('data', chunk => contentChuncks.push(chunk));
  //   stream.on('end', () => { resolve(contentChuncks.join('')); });
  //   stream.on('error', err => { reject(err); });
  // }))
};

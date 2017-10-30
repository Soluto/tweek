const fs = require('fs');
const nconf = require('nconf');
const Minio = require('minio');

function useStringFromFileEnvVariable(inlineSecretName, fileSecretName) {
  if (nconf.get(fileSecretName) && !nconf.get(inlineSecretName)) {
    const secret = fs.readFileSync(nconf.get(fileSecretName), 'utf8');
    nconf.set(inlineSecretName, secret);
  }
}

useStringFromFileEnvVariable('MINIO_ACCESS_KEY', 'MINIO_ACCESS_KEY_PATH');
useStringFromFileEnvVariable('MINIO_SECRET_KEY', 'MINIO_SECRET_KEY_PATH');
nconf.required(['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY']);

const minioBucket = nconf.get('MINIO_BUCKET');
const minioEndPoint = nconf.get('MINIO_ENDPOINT').split(':');
const minioClient = new Minio.Client({
  endPoint: minioEndPoint[0],
  port: minioEndPoint[1] && parseInt(minioEndPoint[1]),
  secure: nconf.get('MINIO_SECURE').toLowerCase() === 'true',
  accessKey: nconf.get('MINIO_ACCESS_KEY'),
  secretKey: nconf.get('MINIO_SECRET_KEY'),
});

async function cleanStorage(...allowed) {
  const objectsToRemove = await new Promise((resolve, reject) => {
    const objectsToRemove = [];
    const stream = minioClient.listObjects(minioBucket);
    stream.on('data', (obj) => {
      if (!allowed.includes(obj.name)) {
        objectsToRemove.push(obj.name);
      }
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(objectsToRemove));
  });

  for (let object of objectsToRemove) {
    await minioClient.removeObject(minioBucket, object);
  }
}

async function getObject(objectName) {
  return new Promise(async (resolve, reject) => {
    const stream = await minioClient.getObject(minioBucket, objectName);
    let result = '';
    stream.on('data', chunk => (result += chunk));
    stream.on('end', () => resolve(result));
    stream.on('error', reject);
  });
}

async function updateStorage(version, rules) {
  await minioClient.putObject(minioBucket, version, rules);
  let prevVersions = await getObject('versions');
  prevVersions = JSON.parse(prevVersions);
  const versions = {
    latest: version,
    previous: prevVersions.latest,
  };
  await minioClient.putObject(minioBucket, 'versions', JSON.stringify(versions));
  await cleanStorage('versions', ...Object.values(versions));
}

async function initStorage() {
  try {
    await minioClient.bucketExists(minioBucket);
  } catch (err) {
    if (err.code !== 'NoSuchBucket') throw err;
    await minioClient.makeBucket(minioBucket, nconf.get('MINIO_REGION'));
    await minioClient.putObject(minioBucket, 'versions', JSON.stringify('{}'));
  }
}

module.exports = {
  updateStorage,
  initStorage,
};

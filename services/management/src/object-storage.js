const fs = require('fs');
const nconf = require('nconf');
const Minio = require('minio');
const { Observable } = require('rxjs');

function useStringFromFileEnvVariable(inlineSecretName, fileSecretName) {
  if (nconf.get(fileSecretName) && !nconf.get(inlineSecretName)) {
    const secret = fs.readFileSync(nconf.get(fileSecretName), 'utf8');
    nconf.set(inlineSecretName, secret);
  }
}

const minioEndpoint = nconf.get('MINIO_ENDPOINT');
if (minioEndpoint) {
  useStringFromFileEnvVariable('MINIO_ACCESS_KEY', 'MINIO_ACCESS_KEY_PATH');
  useStringFromFileEnvVariable('MINIO_SECRET_KEY', 'MINIO_SECRET_KEY_PATH');
  nconf.required(['MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY']);
}

module.exports = async function initStorage() {
  if (!minioEndpoint) return;

  const [minioHost, minioPort] = minioEndpoint.split(':');
  const minioClient = new Minio.Client({
    endPoint: minioHost,
    port: minioPort && parseInt(minioPort),
    secure: nconf.get('MINIO_SECURE').toLowerCase() === 'true',
    accessKey: nconf.get('MINIO_ACCESS_KEY'),
    secretKey: nconf.get('MINIO_SECRET_KEY'),
  });

  const minioBucket = nconf.get('MINIO_BUCKET');

  try {
    await minioClient.bucketExists(minioBucket);
  } catch (err) {
    if (err.code !== 'NoSuchBucket') throw err;
    await minioClient.makeBucket(minioBucket, nconf.get('MINIO_REGION'));
    await minioClient.putObject(minioBucket, 'versions', '{}');
  }

  async function getObject(objectName) {
    return new Promise(async (resolve, reject) => {
      const stream = await minioClient.getObject(minioBucket, objectName);
      let result = '';
      stream.on('data', chunk => (result += chunk));
      stream.on('end', () => resolve(JSON.parse(result)));
      stream.on('error', reject);
    });
  }

  async function cleanStorage(exclude) {
    const objects$ = Observable.create((observer) => {
      const stream = minioClient.listObjects(minioBucket);
      stream.on('data', x => observer.next(x));
      stream.on('error', err => observer.error(err));
      stream.on('end', () => observer.complete());
    });

    return objects$
      .pluck('name')
      .filter(name => !exclude.includes(name))
      .mergeMap(name => Observable.fromPromise(minioClient.removeObject(minioBucket, name)))
      .toPromise();
  }

  async function updateStorage(version, rules) {
    const prevVersions = await getObject('versions');
    if (prevVersions.latest === version) return;

    await minioClient.putObject(minioBucket, version, rules, 'application/json');
    const versions = {
      latest: version,
      previous: prevVersions.latest,
    };
    await minioClient.putObject(
      minioBucket,
      'versions',
      JSON.stringify(versions),
      'application/json',
    );
    await cleanStorage(Object.values(versions).concat('versions'));
  }

  return {
    getObject,
    updateStorage,
  };
};

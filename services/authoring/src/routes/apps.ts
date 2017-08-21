import uuid = require('uuid');
import { promisify } from 'util';
import crypto = require('crypto');
const randomBytes = promisify(crypto.randomBytes);
import PERMISSIONS from '../security/permissions/consts';
import R = require('ramda');
import { POST, Path, Errors } from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import { generateHash } from '../apps/apps-utils';
import { Author, InjectAuthor } from '../utils/include-author';
import { Authorize } from '../security/authorize';
import AppsRepository from '../repositories/apps-repository';

async function createSecretKey() {
  const salt = await randomBytes(64);
  const secret = await randomBytes(128);
  const hash = await generateHash(secret, salt);
  const creationDate = new Date();
  return {
    secret: secret.toString('base64'),
    key: {
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
      creationDate,
    },
  };
}

function createNewAppManifest(appName, permissions) {
  return {
    version: '1',
    name: appName,
    secretKeys: [],
    permissions,
  };
}

const allowedPermissions = R.without(<any>PERMISSIONS.ADMIN, R.values(PERMISSIONS));

const hasValidPermissions = R.all(<any>R.contains((<any>R).__, allowedPermissions));

async function createApp(req, res, { appsRepository, author }) {
  const { name: appName, permissions = [] } = req.body;
  // validate permissions
  const appId = uuid.v4();
  const newApp = createNewAppManifest(appName, permissions);
  if (!hasValidPermissions(permissions)) {
    res.status(400).send(`Invalid permissions: ${R.difference(permissions, allowedPermissions)}`);
    return;
  }
  const { secret: appSecret, key } = await createSecretKey();
  newApp.secretKeys.push(key);
  await appsRepository.saveApp(appId, newApp, author);

  res.json({
    appId,
    appSecret,
  });
}

export default {
  createApp,
};

export type AppCreationModel = {
  name: string,
  permissions: Array<string>,
};

@AutoWired
@Path('/apps')
@InjectAuthor
export class AppsController {
  @Inject
  appsRepository: AppsRepository;

  public something: string = 'will it be overriden';

  get author(): Author { return { name: 'unknown', email: 'N/A' }; }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @POST
  async createApp(newAppModel: AppCreationModel) {
    const author: Author = this.author;

    const appId = uuid.v4();
    const newApp = createNewAppManifest(newAppModel.name, newAppModel.permissions);
    // validate permissions
    if (!hasValidPermissions(newAppModel.permissions)) {
      throw new Errors.BadRequestError(`Invalid permissions: ${R.difference(newAppModel.permissions, allowedPermissions)}`);
    }
    const { secret: appSecret, key } = await createSecretKey();
    newApp.secretKeys.push(key);
    // await this.config.appsRepository.saveApp(appId, newApp, {name: 'a', email: 'a@gmail.com'});
    await this.appsRepository.saveApp(appId, newApp, author);

    return ({
      appId,
      appSecret,
    });
  }
}

import uuid = require('uuid');
import { promisify } from 'util';
import crypto = require('crypto');
import R = require('ramda');
import { AutoWired, Inject } from 'typescript-ioc';
import { POST, Path, Errors, Context, ServiceContext } from 'typescript-rest';
import { PERMISSIONS } from '../security/permissions/consts';
import { generateHash } from '../apps/apps-utils';
import { Author, AuthorProvider } from '../utils/include-author';
import { Authorize } from '../security/authorize';
import AppsRepository from '../repositories/apps-repository';

const randomBytes = promisify(crypto.randomBytes);

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

export type AppCreationModel = {
  name: string,
  permissions: Array<string>,
};

@AutoWired
@Path('/apps')
export class AppsController {
  @Context
  context: ServiceContext;

  @Inject
  appsRepository: AppsRepository;

  @Inject
  authorProvider: AuthorProvider;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @POST
  async createApp(newAppModel: AppCreationModel) {
    const author: Author = this.authorProvider.getAuthor(this.context);

    const appId = uuid.v4();
    const newApp = createNewAppManifest(newAppModel.name, newAppModel.permissions);
    // validate permissions
    if (!hasValidPermissions(newAppModel.permissions)) {
      throw new Errors.BadRequestError(`Invalid permissions: ${R.difference(newAppModel.permissions, allowedPermissions)}`);
    }
    const { secret: appSecret, key } = await createSecretKey();
    newApp.secretKeys.push(key);
    await this.appsRepository.saveApp(appId, newApp, author);

    return ({
      appId,
      appSecret,
    });
  }
}

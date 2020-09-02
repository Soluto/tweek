import { v4 as uuidV4 } from 'uuid';
import R = require('ramda');
import { OnlyInstantiableByContainer, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import {
  POST,
  GET,
  DELETE,
  PATCH,
  Path,
  Errors,
  Context,
  ServiceContext,
  QueryParam,
  PathParam,
} from 'typescript-rest';
import { PERMISSIONS } from '../security/permissions/consts';
import { Authorize } from '../security/authorize';
import AppsRepository, { AppSecretKey, AppManifest } from '../repositories/apps-repository';
import { addOid } from '../utils/response-utils';
import { createNewAppManifest, createSecretKey } from '../utils/app-utils';

const allowedPermissions = R.without(<any>PERMISSIONS.ADMIN, R.values(PERMISSIONS));

const hasValidPermissions = R.all(<any>R.contains((<any>R).__, allowedPermissions));

export type AppCreationRequestModel = {
  name: string;
  permissions: Array<string>;
};

export type AppCreationResponseModel = {
  appId: string;
  appSecret: string;
};

export type AppsListResponseModel = {
  [id: string]: string;
};

export type AppSecretKeyCreationResponseModel = {
  appId: string;
  keyId: string;
  secret: string;
};

@OnlyInstantiableByContainer
@Tags('apps')
@Path('/apps')
export class AppsController {
  @Context
  context: ServiceContext;

  @Inject
  appsRepository: AppsRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @GET
  async getApps(): Promise<AppsListResponseModel> {
    const apps = await this.appsRepository.getApps();
    return <any>R.pluck('name')(<any>apps);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId')
  @GET
  async getApp(@PathParam('appId') appId: string): Promise<AppManifest> {
    return await this.appsRepository.getApp(appId);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @POST
  async createApp(
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    newAppModel: AppCreationRequestModel,
  ): Promise<AppCreationResponseModel> {
    const appId = uuidV4();
    newAppModel.permissions = newAppModel.permissions || [];
    const newApp = createNewAppManifest(newAppModel.name, newAppModel.permissions);
    // validate permissions
    if (!hasValidPermissions(newAppModel.permissions)) {
      throw new Errors.BadRequestError(
        `Invalid permissions: ${R.difference(newAppModel.permissions, allowedPermissions)}`,
      );
    }
    const { secret: appSecret, key } = await createSecretKey();
    newApp.secretKeys.push(key);
    const oid = await this.appsRepository.createApp(appId, newApp, { name, email });
    addOid(this.context.response, oid);

    return {
      appId,
      appSecret,
    };
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId')
  @PATCH
  async updateApp(
    @PathParam('appId') appId: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    patchAppModel: Partial<Pick<AppManifest, 'name' | 'permissions'>>,
  ): Promise<void> {
    const oid = await this.appsRepository.updateApp(appId, patchAppModel, { name, email });
    addOid(this.context.response, oid);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId')
  @DELETE
  async deleteApp(
    @PathParam('appId') appId: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
  ): Promise<void> {
    const oid = await this.appsRepository.deleteApp(appId, { name, email });
    addOid(this.context.response, oid);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId/keys')
  @GET
  async getAppKeys(@PathParam('appId') appId: string): Promise<Record<string, AppSecretKey>> {
    return await this.appsRepository.getSecretKeys(appId);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId/keys/:keyId')
  @GET
  async getAppKey(@PathParam('appId') appId: string, @PathParam('keyId') keyId: string): Promise<AppSecretKey> {
    return await this.appsRepository.getSecretKey(appId, keyId);
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId/keys')
  @POST
  async createNewAppKey(
    @PathParam('appId') appId: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
  ): Promise<AppSecretKeyCreationResponseModel> {
    const { secret, key } = await createSecretKey();
    const oid = await this.appsRepository.createSecretKey(appId, key, { name, email });
    addOid(this.context.response, oid);
    return { appId, keyId: key.id, secret };
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @Path('/:appId/keys/:keyId')
  @DELETE
  async deleteAppKey(
    @PathParam('appId') appId: string,
    @PathParam('keyId') keyId: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
  ): Promise<void> {
    const oid = await this.appsRepository.deleteSecretKey(appId, keyId, { name, email });
    addOid(this.context.response, oid);
  }
}

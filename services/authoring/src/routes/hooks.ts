import {
  Path,
  GET,
  PUT,
  POST,
  DELETE,
  Context,
  ServiceContext,
  QueryParam,
  Errors,
} from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import { PERMISSIONS } from '../security/permissions/consts';
import { Authorize } from '../security/authorize';
import { HooksRepositoryFactory, HooksRepository } from '../repositories/hooks-repository';
import { addOid } from '../utils/response-utils';
import { KeyHooks, Hook } from '../utils/hooks';
import logger from '../utils/logger';
import * as R from 'ramda';

interface FlattenedHook {
  keyPath: string;
  type: string;
  url: string;
  hookIndex: number;
}

@AutoWired
@Tags('hooks')
@Path('/')
export class HooksController {
  @Context
  context: ServiceContext;

  @Inject
  hooksRepositoryFactory: HooksRepositoryFactory;

  @Authorize({ permission: PERMISSIONS.HOOKS_READ })
  @GET
  @Path('/hooks')
  async getHooks(): Promise<FlattenedHook[]> {
    const hooksRepository = this.hooksRepositoryFactory.createRepository();
    await this._setETagHeader(hooksRepository);

    const allHooks = await hooksRepository.getHooks();
    return this._flattenHooks(allHooks);
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_READ })
  @GET
  @Path('/hook')
  async getHooksByKeyPath(@QueryParam('keyPath') keyPath: string): Promise<FlattenedHook[]> {
    const hooksRepository = this.hooksRepositoryFactory.createRepository();
    await this._setETagHeader(hooksRepository);

    const hooks = await hooksRepository.getHooksForKeyPath(keyPath);
    return this._flattenHooks([hooks]);
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @Path('/hook')
  @POST
  async createHook(
    @QueryParam('keyPath') keyPath: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    hook: Hook,
  ): Promise<void> {
    const hooksRepository = this.hooksRepositoryFactory.createRepository();
    hook = { type: hook.type, url: hook.url };
    if (!(await this._handleETagValidation(hooksRepository))) return;

    const oid = await hooksRepository.createHook(keyPath, hook, { name, email });
    addOid(this.context.response, oid);
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @Path('/hook')
  @PUT
  async updateHook(
    @QueryParam('keyPath') keyPath: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    @QueryParam('hookIndex') hookIndex: number,
    hook: Hook,
  ): Promise<void> {
    try {
      const hooksRepository = this.hooksRepositoryFactory.createRepository();
      hook = { type: hook.type, url: hook.url };
      if (!(await this._handleETagValidation(hooksRepository))) return;

      const oid = await hooksRepository.updateHook(keyPath, hookIndex, hook, { name, email });
      addOid(this.context.response, oid);
    } catch (err) {
      logger.error({ err, keyPath, hookIndex }, err.message);
      throw new Errors.NotFoundError();
    }
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @Path('/hook')
  @DELETE
  async deleteHook(
    @QueryParam('keyPath') keyPath: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    @QueryParam('hookIndex') hookIndex: number,
  ): Promise<void> {
    try {
      const hooksRepository = this.hooksRepositoryFactory.createRepository();
      if (!(await this._handleETagValidation(hooksRepository))) return;

      const oid = await hooksRepository.deleteHook(keyPath, hookIndex, { name, email });
      addOid(this.context.response, oid);
    } catch (err) {
      logger.error({ err, keyPath, hookIndex }, err.message);
      throw new Errors.NotFoundError();
    }
  }

  private _flattenHooks(hooksToFlatten: KeyHooks[]): FlattenedHook[] {
    return R.chain((keyHooks) => {
      return keyHooks.hooks.map((hook, hookIndex) => ({
        keyPath: keyHooks.keyPath,
        type: hook.type,
        url: hook.url,
        hookIndex,
      }));
    }, hooksToFlatten);
  }

  private async _setETagHeader(hooksRepository: HooksRepository): Promise<void> {
    const etag = await hooksRepository.getETag();
    this.context.response.setHeader('ETag', etag);
  }

  private async _handleETagValidation(hooksRepository: HooksRepository): Promise<boolean> {
    const etag = this.context.request.header('If-Match');
    if (!etag) return true;

    if (!(await hooksRepository.validateETag(etag))) {
      this.context.response.sendStatus(412);
      return false;
    }

    return true;
  }
}

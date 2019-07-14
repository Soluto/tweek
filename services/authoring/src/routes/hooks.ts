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
import HooksRepository from '../repositories/hooks-repository';
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
  hooksRepository: HooksRepository;

  @Authorize({ permission: PERMISSIONS.HOOKS_READ })
  @GET
  @Path('/hooks')
  async getHooks(): Promise<FlattenedHook[]> {
    const allHooks = await this.hooksRepository.getHooks();
    return this._flattenHooks(allHooks);
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_READ })
  @GET
  @Path('/hook')
  async getHooksByKeyPath(@QueryParam('keyPath') keyPath: string): Promise<FlattenedHook[]> {
    const hooks = await this.hooksRepository.getHooksForKeyPath(keyPath);
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
    hook = { type: hook.type, url: hook.url };
    const oid = await this.hooksRepository.createHook(keyPath, hook, { name, email });
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
      hook = { type: hook.type, url: hook.url };
      const oid = await this.hooksRepository.updateHook(keyPath, hookIndex, hook, { name, email });
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
      const oid = await this.hooksRepository.deleteHook(keyPath, hookIndex, { name, email });
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
}

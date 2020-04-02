import {
  Path,
  GET,
  PUT,
  POST,
  DELETE,
  Context,
  ServiceContext,
  QueryParam,
  PathParam,
  Errors,
} from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import { PERMISSIONS } from '../security/permissions/consts';
import { Authorize } from '../security/authorize';
import { HooksRepositoryFactory, HooksRepository } from '../repositories/hooks-repository';
import { addOid } from '../utils/response-utils';
import Hook from '../utils/hook';
import logger from '../utils/logger';

@AutoWired
@Tags('hooks')
@Path('/hooks')
export class HooksController {
  @Context
  context: ServiceContext;

  @Inject
  hooksRepositoryFactory: HooksRepositoryFactory;

  @Authorize({ permission: PERMISSIONS.HOOKS_READ })
  @GET
  async getHooks(@QueryParam('keyPathFilter') keyPath: string): Promise<Hook[]> {
    const hooksRepository = this.hooksRepositoryFactory.createRepository();
    await this._setETagHeader(hooksRepository);

    const allHooks = await hooksRepository.getHooks();
    if (!keyPath) return allHooks;

    return allHooks.filter((hook) => hook.keyPath === keyPath);
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @POST
  async createHook(
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    hook: Hook,
  ): Promise<Hook> {
    const hooksRepository = this.hooksRepositoryFactory.createRepository();
    hook = { keyPath: hook.keyPath, type: hook.type, url: hook.url };
    if (!(await this._handleETagValidation(hooksRepository))) return null;

    const oid = await hooksRepository.createHook(hook, { name, email });
    addOid(this.context.response, oid);

    this.context.response.status(201);
    return hook;
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @Path('/:id')
  @PUT
  async updateHook(
    @PathParam('id') id: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    hook: Hook,
  ): Promise<void> {
    try {
      const hooksRepository = this.hooksRepositoryFactory.createRepository();
      hook = {...hook, id};
      if (!(await this._handleETagValidation(hooksRepository))) return;

      const oid = await hooksRepository.updateHook(hook, { name, email });
      addOid(this.context.response, oid);
    } catch (err) {
      logger.error({ err, hook }, err.message);
      throw new Errors.NotFoundError();
    }
  }

  @Authorize({ permission: PERMISSIONS.HOOKS_WRITE })
  @Path('/:id')
  @DELETE
  async deleteHook(
    @PathParam('id') id: string,
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
  ): Promise<void> {
    try {
      const hooksRepository = this.hooksRepositoryFactory.createRepository();
      if (!(await this._handleETagValidation(hooksRepository))) return;

      const oid = await hooksRepository.deleteHook(id, { name, email });
      addOid(this.context.response, oid);
    } catch (err) {
      logger.error({ err, hookId: id }, err.message);
      throw new Errors.NotFoundError();
    }
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

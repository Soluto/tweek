import { AutoWired, Inject } from 'typescript-ioc';
import { Path, ServiceContext, Context, QueryParam, PUT, PATCH, GET } from 'typescript-rest';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import { PolicyRepository } from '../repositories/policy-repository';
import { addOid } from '../utils/response-utils';
import { JsonValue } from '../utils/jsonValue';
import jsonpatch = require('fast-json-patch');

@AutoWired
@Path('/resource/policies')
export class ResourcePolicyController {
  @Context
  context: ServiceContext;

  @Inject
  policyRepository: PolicyRepository;

  @Authorize({ permission: PERMISSIONS.RESOURCE_POLICIES_READ })
  @GET
  async getPolicy(
    @QueryParam('keyPath') path: string,
    @QueryParam('isKey') isKey: boolean,
  ): Promise<JsonValue> {
    const policy = await this.policyRepository.getPolicy({ path, isKey });
    return policy;
  }

  @Authorize({ permission: PERMISSIONS.RESOURCE_POLICIES_WRITE })
  @PUT
  async replacePolicy(
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    @QueryParam('keyPath') path: string,
    @QueryParam('isKey') isKey: boolean,
    content: JsonValue,
  ): Promise<string> {
    const oid = await this.policyRepository.replacePolicy(
      content,
      { name, email },
      { path, isKey },
    );
    addOid(this.context.response, oid);

    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.RESOURCE_POLICIES_WRITE })
  @PATCH
  async updatePolicy(
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    @QueryParam('keyPath') path: string,
    @QueryParam('isKey') isKey: boolean,
    content: jsonpatch.Operation[],
  ): Promise<string> {
    const oid = await this.policyRepository.updatePolicy(content, { name, email }, { path, isKey });
    addOid(this.context.response, oid);

    return 'OK';
  }
}

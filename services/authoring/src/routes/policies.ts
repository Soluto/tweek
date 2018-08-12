import { AutoWired, Inject } from 'typescript-ioc';
import { Path, ServiceContext, Context, QueryParam, PUT, PATCH, GET } from 'typescript-rest';
import { Operation } from 'fast-json-patch';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import PolicyRepository from '../repositories/policy-repository';
import { addOid } from '../utils/response-utils';
import { JsonValue } from '../utils/jsonValue';

@AutoWired
@Path('/policies')
export class PolicyController {
  @Context
  context: ServiceContext;

  @Inject
  policyRepository: PolicyRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @GET
  async getPolicy(): Promise<JsonValue> {
    const policy = await this.policyRepository.getPolicy();
    return policy;
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PUT
  async replacePolicy( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, content: JsonValue): Promise<string> {
    const oid = await this.policyRepository.replacePolicy(content, { name, email });
    addOid(this.context.response, oid);

    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PATCH
  async updatePolicy( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, content: JsonValue[]): Promise<string> {
    const oid = await this.policyRepository.updatePolicy(content as Operation[], { name, email });
    addOid(this.context.response, oid);

    return 'OK';
  }
}

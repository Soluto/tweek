import { AutoWired, Inject } from 'typescript-ioc';
import { Path, PUT, ServiceContext, Context, QueryParam } from 'typescript-rest';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import PolicyRepository from '../repositories/policy-repository';
import { addOid } from '../utils/response-utils';

@AutoWired
@Path('/policies')
export class PolicyController {
  @Context
  context: ServiceContext;

  @Inject
  policyRepository: PolicyRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PUT
  async updatePolicy( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, content: { policy: string }): Promise<string> {
    const oid = await this.policyRepository.updatePolicy(content.policy, { name, email });
    addOid(this.context.response, oid);

    return 'OK';
  }
}

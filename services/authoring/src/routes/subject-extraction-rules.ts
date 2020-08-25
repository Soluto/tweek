import { OnlyInstantiableByContainer, Inject } from 'typescript-ioc';
import { Path, GET, PUT, ServiceContext, Context, QueryParam } from 'typescript-rest';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import SubjectExtractionRulesRepository from '../repositories/extraction-rules-repository';
import { addOid } from '../utils/response-utils';

@OnlyInstantiableByContainer
@Path('/subject-extraction-rules')
export class SubjectExtractionRulesController {
  @Context
  context: ServiceContext;

  @Inject
  subjectExtractionRulesRepository: SubjectExtractionRulesRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PUT
  async updatePolicy(
    @QueryParam('author.name') name: string,
    @QueryParam('author.email') email: string,
    content: { data: string },
  ): Promise<string> {
    const oid = await this.subjectExtractionRulesRepository.updateSubjectExtractionRules(
      content.data,
      { name, email },
    );
    addOid(this.context.response, oid);

    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @GET
  async get(): Promise<{ data: string }> {
    const policy = await this.subjectExtractionRulesRepository.getSubjectExtractionRules();
    return { data: policy };
  }
}

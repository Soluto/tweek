import { AutoWired, Inject } from 'typescript-ioc';
import { Path, PUT, ServiceContext, Context, QueryParam } from 'typescript-rest';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import SubjectExtractionRulesRepository from '../repositories/extraction-rules-repository';
import { addOid } from '../utils/response-utils';

@AutoWired
@Path('/subject-extraction-rules')
export class SubjectExtractionRulesController {
  @Context
  context: ServiceContext;

  @Inject
  subjectExtractionRulesRepository: SubjectExtractionRulesRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PUT
  async updatePolicy( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, content: { subject_extraction_rules: string }): Promise<string> {
    const oid = await this.subjectExtractionRulesRepository.updateSubjectExtractionRules(content.subject_extraction_rules, { name, email });
    addOid(this.context.response, oid);

    return 'OK';
  }
}

import { AutoWired, Inject } from 'typescript-ioc';
import { Path, PUT, ServiceContext, Context, QueryParam } from 'typescript-rest';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import ExtractionRulesRepository from '../repositories/extraction-rules-repository';
import { addOid } from '../utils/response-utils';

@AutoWired
@Path('/extraction-rules')
export class ExtractionRulesController {
  @Context
  context: ServiceContext;

  @Inject
  extractionRulesRepository: ExtractionRulesRepository;

  @Authorize({ permission: PERMISSIONS.ADMIN })
  @PUT
  async updatePolicy( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, content: { extraction_rules: string }): Promise<string> {
    const oid = await this.extractionRulesRepository.updateExtractionRules(content.extraction_rules, { name, email });
    addOid(this.context.response, oid);

    return 'OK';
  }
}

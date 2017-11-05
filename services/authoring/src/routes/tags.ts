import { Path, GET, PUT, Context, ServiceContext, QueryParam } from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import { PERMISSIONS } from '../security/permissions/consts';
import { Authorize } from '../security/authorize';
import TagsRepository from '../repositories/tags-repository';
import { JsonValue } from '../utils/jsonValue';

@AutoWired
@Tags('tags')
@Path('/tags')
export class TagsController {
  @Context
  context: ServiceContext;

  @Inject
  tagsRepository: TagsRepository;

  @Authorize({ permission: PERMISSIONS.TAGS_READ })
  @GET
  async getTags(): Promise<string[]> {
    return await this.tagsRepository.getTags();
  }

  @Authorize({ permission: PERMISSIONS.TAGS_WRITE })
  @PUT
  async saveTags( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, tagsToSave: JsonValue): Promise<void> {
    await this.tagsRepository.mergeTags(tagsToSave, { name, email });
  }
}

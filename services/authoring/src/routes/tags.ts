import { Path, GET, PUT, Context, ServiceContext } from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';

import PERMISSIONS from '../security/permissions/consts';
import { Authorize } from '../security/authorize';
import TagsRepository from '../repositories/tags-repository';
import { AuthorProvider } from '../utils/include-author';

@AutoWired
@Path('/tags')
export class TagsController {
  @Context
  context: ServiceContext;

  @Inject
  tagsRepository: TagsRepository;

  @Inject
  authorProvider: AuthorProvider;

  @Authorize({ permission: PERMISSIONS.TAGS_READ })
  @GET
  async getTags() {
    return await this.tagsRepository.getTags();
  }

  @Authorize({ permission: PERMISSIONS.TAGS_WRITE })
  @PUT
  async saveTags(tagsToSave) {
    const author = this.authorProvider.getAuthor(this.context);
    await this.tagsRepository.mergeTags(tagsToSave, author);
  }
}

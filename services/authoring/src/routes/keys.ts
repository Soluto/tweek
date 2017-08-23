import R = require('ramda');
import { GET, Path, DELETE, PathParam, ServiceContext, Context, PUT, QueryParam, Errors } from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import searchIndex from '../search-index';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import KeysRepository from '../repositories/keys-repository';
import { AuthorProvider } from '../utils/include-author';

@AutoWired
export class KeysController {
  @Inject
  authorProvider: AuthorProvider;

  @Inject
  keysRepository: KeysRepository;

  @Context
  context: ServiceContext;

  @Authorize({ permission: PERMISSIONS.KEYS_LIST })
  @GET
  @Path('/keys')
  async getAllKeys() {
    const manifests = await searchIndex.manifests;
    return manifests.map(R.prop('key_path'));
  }

  @Authorize({ permission: PERMISSIONS.KEYS_READ })
  @GET
  @Path('/keys/:keyPath*')
  async getKey( @PathParam('keyPath') keyPath, @QueryParam('revision') revision) {
    try {
      return await this.keysRepository.getKeyDetails(keyPath, { revision });
    } catch (exp) {
      console.error(`Error retrieving key ${keyPath}`, exp);
      throw new Errors.NotFoundError();
    }
  }

  @Authorize({ permission: PERMISSIONS.KEYS_WRITE })
  @PUT
  @Path('/keys/:keyPath*')
  async updateKey( @PathParam('keyPath') keyPath, { implementation, manifest }) {
    manifest = Object.assign({ key_path: keyPath }, manifest);
    await this.keysRepository.updateKey(keyPath, manifest, implementation, this.authorProvider.getAuthor(this.context));

    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.KEYS_WRITE })
  @Path('/keys/:keyPath*')
  @DELETE
  async deleteKey( @PathParam('keyPath') keyPath) {
    await this.keysRepository.deleteKey(keyPath, this.authorProvider.getAuthor(this.context));

    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.KEYS_READ })
  @GET
  @Path('/revision')
  async getRevision() {
    const commit = await this.keysRepository.getRevision();
    return commit.sha();
  }

  @Authorize({ permission: PERMISSIONS.HISTORY })
  @GET
  @Path('/revision-history/:keyPath*')
  async getKeyRevisionHistory( @PathParam('keyPath') keyPath, @QueryParam('since') since) {
    return await this.keysRepository.getKeyRevisionHistory(keyPath, { since });
  }

  @Authorize({ permission: PERMISSIONS.KEYS_LIST })
  @GET
  @Path('/manifests')
  async getAllManifests() {
    return await searchIndex.manifests;
  }

  @Authorize({ permission: PERMISSIONS.KEYS_READ })
  @GET
  @Path('/manifests/:keyPath*')
  async getManifest( @PathParam('keyPath') keyPath, @QueryParam('revision') revision) {
    try {
      const manifest = await this.keysRepository.getKeyManifest(keyPath, { revision });
      return manifest;
    } catch (exp) {
      throw new Errors.NotFoundError();
    }
  }

  @Authorize({ permission: PERMISSIONS.KEYS_READ })
  @GET
  @Path('/dependents/:keyPath*')
  async getDependents( @PathParam('keyPath') keyPath) {
    return await searchIndex.dependents(keyPath);
  }
}

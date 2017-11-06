import R = require('ramda');
import jsonpatch = require('fast-json-patch');
import { AutoWired, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import { GET, PATCH, Path, DELETE, POST, PathParam, ServiceContext, Context, QueryParam } from 'typescript-rest';
import searchIndex from '../search-index';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import KeysRepository from '../repositories/keys-repository';
import { JsonValue } from '../utils/jsonValue';

const schemaPrefix = '@tweek/schema/';
const indexSchema = R.pipe(
  R.indexBy((manifest: any) => manifest.key_path.substring(schemaPrefix.length)),
  R.map(R.path(['implementation', 'value'])),
);

@AutoWired
@Tags('schema')
@Path('/')
export class SchemaController {
  @Context
  context: ServiceContext;

  @Inject
  keysRepository: KeysRepository;

  @Authorize({ permission: PERMISSIONS.SCHEMAS_READ })
  @GET
  @Path('/schemas')
  async getSchemas(): Promise<any[]> {
    const allManifests = await searchIndex.manifests;
    const schemaManifests = allManifests.filter(m => m.key_path.startsWith(schemaPrefix));
    return indexSchema(schemaManifests);
  }

  @Authorize({ permission: PERMISSIONS.SCHEMAS_WRITE })
  @DELETE
  @Path('/schemas/:identityType')
  async deleteIdentity( @PathParam('identityType') identityType: string, @QueryParam('author.name') name: string, @QueryParam('author.email') email: string): Promise<string> {
    const keyPath = schemaPrefix + identityType;
    await this.keysRepository.deleteKey(keyPath, { name, email });
    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.SCHEMAS_WRITE })
  @POST
  @Path('/schemas/:identityType')
  async addIdentity( @PathParam('identityType') identityType: string, @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, value: JsonValue): Promise<string> {
    const key = schemaPrefix + identityType;
    const manifest = {
      key_path: key,
      meta: {
        name: key,
        description: `The schema of a ${identityType}`,
        tags: [],
        readOnly: false,
        archived: false,
      },
      implementation: {
        type: 'const',
        value,
      },
      valueType: 'object',
      enabled: true,
      dependencies: [],
    };
    await this.keysRepository.updateKey(key, manifest, null, { name, email });
    return 'OK';
  }

  @Authorize({ permission: PERMISSIONS.SCHEMAS_WRITE })
  @PATCH
  @Path('/schemas/:identityType')
  async patchIdentity( @PathParam('identityType') identityType: string, @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, patch: JsonValue): Promise<string> {
    const key = schemaPrefix + identityType;
    const manifest = await this.keysRepository.getKeyManifest(key);
    const newManifest = R.assocPath(
      ['implementation', 'value'],
      jsonpatch.applyPatch(R.clone(manifest.implementation.value), <any>patch).newDocument,
    )(manifest);
    await this.keysRepository.updateKey(key, newManifest, null, { name, email });
    return 'OK';
  }
}

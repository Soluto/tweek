import fs = require('fs');
import R = require('ramda');
import JSZip = require('jszip');
import { AutoWired, Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';
import { FileParam, Errors, ServiceContext, Context, PUT, Path, QueryParam } from 'typescript-rest';

import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import KeysRepository from '../repositories/keys-repository';

const supportedPaths = [/^manifests\/.+?\.json/, /^implementations\/.+\/.+?\./];
const isValidPath = x => R.any(<any>R.test((<any>R).__, x))(supportedPaths);

@AutoWired
@Tags('bulk-keys-upload')
@Path('/')
export class BulkKeysUpload {
  @Context
  context: ServiceContext;

  @Inject
  keysRepository: KeysRepository;

  @Authorize({ permission: PERMISSIONS.KEYS_WRITE })
  @PUT
  @Path('/bulk-keys-upload')
  async bulkKeysUpload( @QueryParam('author.name') name: string, @QueryParam('author.email') email: string, @FileParam('bulk') zipFile: Express.Multer.File) {
    if (!zipFile) {
      throw new Errors.BadRequestError('Required file is missing: bulk');
    }
    let zipRoot: any = {};
    try {
      zipRoot = await new JSZip().loadAsync(fs.readFileSync(zipFile.path));
    } catch (err) {
      throw new Errors.BadRequestError(`Zip is corrupted: ${err}`);
    }
    const transformIntoEntriesArray = R.pipe(
      R.values,
      R.filter((file: any) => !file.dir),
      R.map((file: any) => ({
        name: file.name,
        read: () => file.async('string'),
      })),
    );
    const fileEntries = transformIntoEntriesArray(zipRoot.files);

    if (!R.all(isValidPath, fileEntries.map(x => x.name))) {
      throw new Errors.BadRequestError(`invalid folder structure:${fileEntries.map(x => x.name).join(',')}`);
    }

    await this.keysRepository.updateBulkKeys(fileEntries, { name, email });
  }
}

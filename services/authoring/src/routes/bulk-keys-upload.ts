import fs = require('fs');
import R = require('ramda');
import JSZip = require('jszip');
import { AutoWired, Inject } from 'typescript-ioc';
import { FileParam, Errors, ServiceContext, Context, PUT, Path } from 'typescript-rest';

import { AuthorProvider } from '../utils/include-author';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import KeysRepository from '../repositories/keys-repository';

const supportedPaths = [/^manifests\/.+?\.json/, /^implementations\/.+\/.+?\./];
const isValidPath = x => R.any(<any>R.test((<any>R).__, x))(supportedPaths);

@AutoWired
@Path('/')
export class BulkKeysUpload {
  @Context
  context: ServiceContext;

  @Inject
  authorProvider: AuthorProvider;

  @Inject
  keysRepository: KeysRepository;

  @Authorize({ permission: PERMISSIONS.KEYS_WRITE })
  @PUT
  @Path('/bulk-keys-upload')
  async bulkKeysUpload( @FileParam('bulk') zipFile: Express.Multer.File) {
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

    await this.keysRepository.updateBulkKeys(fileEntries, this.authorProvider.getAuthor(this.context));
  }
}

import * as R from 'ramda';
import lunr from 'lunr';
import { GET, Path, QueryParam } from 'typescript-rest';
import { Tags } from 'typescript-rest-swagger';
import searchIndex from '../search-index';
import { AutoWired } from 'typescript-ioc';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';
import logger from '../utils/logger';

const separator = /(?:[_/]|\s|-)/;

function addTerm(query, term, field) {
  query.term(term, { field });
  query.term(term, {
    field,
    wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
  });
  query.term(term, {
    field,
    wildcard: lunr.Query.wildcard.LEADING,
    editDistance: 1,
  });
}

function trimResults(maxResults, results) {
  return R.pipe(
    R.slice(0, maxResults || 25),
    R.map<{}, string>(R.prop<string>('ref')),
  )(results);
}

function performSearch(
  searchString = '',
  { field, index }: { field?: string; index: lunr.Index },
): lunr.Index.Result[] {
  searchString = searchString.toLowerCase().trim();
  // tslint:disable-next-line:curly
  if (!index || searchString === '') return [];
  try {
    return index.query((query) => {
      searchString
        .split(separator)
        .filter((s) => s !== '')
        .forEach((term) => addTerm(query, term, field));
    });
  } catch (err) {
    logger.error({ err, searchString }, 'error performing search');
    return [];
  }
}

async function getIndex() {
  return searchIndex.index || (await searchIndex.indexPromise);
}

@AutoWired
@Tags('search')
@Path('/')
export class SearchController {
  @Authorize({ permission: PERMISSIONS.SEARCH_INDEX })
  @GET
  @Path('/search-index')
  async getSearchIndex(): Promise<any> {
    return await getIndex();
  }

  @Authorize({ permission: PERMISSIONS.SEARCH })
  @GET
  @Path('/search')
  async search(
    @QueryParam('q') q: string,
    @QueryParam('type') type: 'free' | 'field' = 'field',
    @QueryParam('field') field?: string,
    @QueryParam('count') count?: number,
  ): Promise<string[]> {
    if (type === 'free') {
      return trimResults(count, (await getIndex()).search(q));
    } else {
      return trimResults(
        count,
        await performSearch(q, {
          field,
          index: await getIndex(),
        }),
      );
    }
  }

  @Authorize({ permission: PERMISSIONS.SEARCH })
  @GET
  @Path('/suggestions')
  async suggestions(
    @QueryParam('q') q: string,
    @QueryParam('count') count?: number,
  ): Promise<string[]> {
    return trimResults(
      count,
      await performSearch(q, {
        field: 'id',
        index: await getIndex(),
      }),
    );
  }
}

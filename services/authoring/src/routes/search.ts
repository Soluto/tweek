import R = require('ramda');
import lunr = require('lunr');
import { GET, Path, QueryParam } from 'typescript-rest';
import { Tags } from 'typescript-rest-swagger';
import searchIndex from '../search-index';
import { AutoWired } from 'typescript-ioc';
import { Authorize } from '../security/authorize';
import { PERMISSIONS } from '../security/permissions/consts';

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

function performSearch(searchString = '', { maxResults = 25, field, index }): string[] {
  searchString = searchString.toLowerCase().trim();
  // tslint:disable-next-line:curly
  if (!index || searchString === '') return [];

  try {
    const searchResults = index.query((query) => {
      searchString
        .split(separator)
        .filter(s => s !== '')
        .forEach(term => addTerm(query, term, field));
    });

    const trimResults = R.pipe(R.slice(0, maxResults || 25), R.map<{}, string>(R.prop<string>('ref')));
    return trimResults(searchResults);
  } catch (error) {
    console.error(`error searching for '${searchString}'`, error);
    return [];
  }
}

@AutoWired
@Tags('search')
@Path('/')
export class SearchController {

  @Authorize({ permission: PERMISSIONS.SEARCH_INDEX })
  @GET
  @Path('/search-index')
  async getSearchIndex(): Promise<any> {
    return await searchIndex.indexPromise;
  }

  @Authorize({ permission: PERMISSIONS.SEARCH })
  @GET
  @Path('/search')
  async search( @QueryParam('q') q: string, @QueryParam('count') count?: number): Promise<string[]> {
    return this.getSearchResult(q, count);
  }

  @Authorize({ permission: PERMISSIONS.SEARCH })
  @GET
  @Path('/suggestions')
  async suggestions( @QueryParam('q') q: string, @QueryParam('count') count?: number): Promise<string[]> {
    return this.getSearchResult(q, count, 'id');
  }

  private async getSearchResult(q: string, count: number, field?: string): Promise<string[]> {
    const index = searchIndex.index || (await searchIndex.indexPromise);
    const result = performSearch(q, {
      maxResults: count,
      field,
      index,
    });
    return result;
  }
}

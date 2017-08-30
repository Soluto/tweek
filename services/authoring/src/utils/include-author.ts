import { ServiceContext, Errors } from 'typescript-rest';

export type Author = {
  name: string;
  email: string;
};

export class AuthorProvider {
  public getAuthor(context: ServiceContext): Author {
    const { 'author.name': name, 'author.email': email } = context.request.query;
    if (context.request.method.toLowerCase() !== 'get' && (!name || !email)) {
      throw new Errors.BadRequestError('Missing name and/or email');
    }
    return { name: name || 'unknown', email: email || 'unknown@tweek.com' };
  }
}

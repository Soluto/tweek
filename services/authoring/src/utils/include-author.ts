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

export default function includeAuthor(handler) {
  return (req, res, config = {}) => {
    const { 'author.name': name, 'author.email': email } = req.query;

    if (req.method.toLowerCase() !== 'get' && (!name || !email)) {
      res.status(400).send('Missing name and/or email');
      return;
    }

    const author = { name: name || 'unknown', email: email || 'unknown@tweek.com' };

    return handler(req, res, Object.assign({ author }, config));
  };
}

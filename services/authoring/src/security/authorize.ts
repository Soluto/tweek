import { PERMISSIONS } from './permissions/consts';
import { Context, ServiceContext, Errors } from 'typescript-rest';

export function Authorize({ permission }) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): any {
    Context(target, 'context');
    const result: PropertyDescriptor = {
      ...descriptor
    };
    result.value = async function(...args: any[]) {
      const context: ServiceContext = this.context;
      const request = context.request;
      const next = async () => await descriptor.value.bind(this)(...args);
      if (request.user.isTweekService) {
        return await next();
      }
      if (
        permission !== PERMISSIONS.ADMIN &&
        request.user &&
        request.user.permissions &&
        request.user.permissions.includes(permission)
      ) {
        return await next();
      }
      throw new Errors.ForbidenError();
    };
    return result;
  };
}

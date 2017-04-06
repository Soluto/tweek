import path from 'path';
import nconf from 'nconf';

export const APP_PATH = process.cwd();
export const PORT = nconf.get('PORT') || 8080;
export const PUBLIC_DIR = path.join(APP_PATH, '.build');
export const SERVER_RENDERING = nconf.get('SERVER_RENDERING') === 'on';
export const NODE_ENV = nconf.get('NODE_ENV') || 'development';

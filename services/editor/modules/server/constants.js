import path from 'path';
import nconf from 'nconf';
nconf.argv().env().defaults({ PORT: 8080, NODE_ENV: 'development' });

export const APP_PATH = process.cwd();
export const PORT = nconf.get('PORT');
export const PUBLIC_DIR = path.join(APP_PATH, '.build');
export const SERVER_RENDERING = nconf.get('SERVER_RENDERING') === 'on';
export const NODE_ENV = nconf.get('NODE_ENV');

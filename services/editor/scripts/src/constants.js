import path from 'path';
import nconf from 'nconf';
nconf.argv().env().defaults({ PORT: 8080, DEV_HOST: 'localhost', DEV_PORT: 8081, NODE_ENV: 'development' });

export const APP_PATH = process.cwd();
export const PORT = nconf.get('PORT');
export const DEV_HOST = nconf.get('DEV_HOST');
export const DEV_PORT = nconf.get('DEV_PORT');
export const PUBLIC_DIR = path.join(APP_PATH, '.build');
export const SERVER_RENDERING = nconf.get('SERVER_RENDERING') === 'on';
export const AUTO_RELOAD = nconf.get('AUTO_RELOAD');
export const NODE_ENV = nconf.get('NODE_ENV');
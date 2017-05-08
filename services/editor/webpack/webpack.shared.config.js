import path from 'path';
import nconf from 'nconf';
nconf.argv().env().defaults({ PORT: 8080, DEV_HOST: 'localhost', DEV_PORT: 8081, NODE_ENV: 'development', PUBLIC_PATH: '/' });

export const APP_PATH = process.cwd();
export const PORT = nconf.get('PORT');
export const DEV_HOST = nconf.get('DEV_HOST');
export const DEV_PORT = nconf.get('DEV_PORT');
export const PUBLIC_PATH = nconf.get('PUBLIC_PATH');
export const PUBLIC_DIR = path.join(APP_PATH, '.build');
export const SERVER_RENDERING = nconf.get('SERVER_RENDERING') === 'on';
export const NODE_ENV = nconf.get('NODE_ENV');
export const FONT_REGEX = /\.(otf|eot|svg|ttf|woff|woff2).*$/;
export const IMAGE_REGEX = /\.(gif|jpe?g|png|ico)$/;
export const CSS_REGEX = /\.css$/;
export const JS_REGEX = /\.js$/;
export const JSON_REGEX = /\.json$/;
export const CSS_LOADER_QUERY = 'modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]';

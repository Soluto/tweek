import path from 'path';

export const APP_PATH = process.cwd();
export const PORT = process.env.PORT || 8080;
export const DEV_HOST = process.env.DEV_HOST || 'localhost';
export const DEV_PORT = process.env.DEV_PORT || 8081;
export const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
export const PUBLIC_DIR = path.join(APP_PATH, '.build');
export const SERVER_RENDERING = process.env.SERVER_RENDERING === 'on';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const FONT_REGEX = /\.(otf|eot|svg|ttf|woff|woff2).*$/;
export const IMAGE_REGEX = /\.(gif|jpe?g|png|ico)$/;
export const CSS_REGEX = /\.css$/;
export const JS_REGEX = /\.js$/;
export const JSON_REGEX = /\.json$/;
export const CSS_LOADER_QUERY = 'modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]';

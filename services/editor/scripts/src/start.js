import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import build from './build'
import {log, logError} from './LogUtils'
import {DEV_PORT, DEV_HOST, PUBLIC_DIR, SERVER_RENDERING, AUTO_RELOAD, NODE_ENV} from './constants'

// should be created by build task already
const WEBPACK_PATH = path.join(PUBLIC_DIR, 'webpack.config.js');

const PROD = NODE_ENV === 'production';

function getAppWebpackConfig() {
  return require(WEBPACK_PATH)
}

export default function start(cb) {
  validateEnv();
  build(() => {
    const appServerPath = path.join(process.cwd(), '.build', 'server.js');
    require(appServerPath);
    runDevServer(cb);
  })
}

function validateEnv() {
  if (!PROD && AUTO_RELOAD === 'hot' && SERVER_RENDERING) {
    logError('Hot Module Replacement is disabled because SERVER_RENDERING is enabled.')
  }
}

function runDevServer(cb) {
  const {ClientConfig} = getAppWebpackConfig();
  const compiler = webpack(ClientConfig);
  const server = new WebpackDevServer(compiler, ClientConfig.devServer);
  server.listen(DEV_PORT, DEV_HOST, () => {
    log('Webpack dev server listening on port', DEV_PORT);
    cb()
  })
}

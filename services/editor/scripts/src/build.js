/* eslint no-console: 0 */
import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import {log} from './LogUtils'
import {APP_PATH, PUBLIC_DIR, NODE_ENV} from './constants'
import ProgressPlugin from 'webpack/lib/ProgressPlugin'
import {transformFile} from 'babel-core'
import {mkdir} from 'shelljs'
import Promise from 'bluebird';

const WEBPACK_PATH = path.join(PUBLIC_DIR, 'webpack.config.js');

export default function build(cb) {
  log(`NODE_ENV=${NODE_ENV}`);
  transpileWebpackConfig(() => {
    bundleServer(() => bundleClient(cb));
  });
}

const transformFileAsync = Promise.promisify(transformFile);
const readDirAsync = Promise.promisify(fs.readdir);

function transpileWebpackConfig(cb) {
  mkdir('-p', PUBLIC_DIR);
  const options = JSON.parse(fs.readFileSync(path.join(APP_PATH, '.babelrc')));
  const configDir = path.join(APP_PATH, 'webpack');
  readDirAsync(configDir).then(files => {
    const writeFiles = files.map(configPath => {
      const fullpath = path.join(configDir, configPath);
      return transformFileAsync(fullpath, options).then(result => fs.writeFileSync(path.join(PUBLIC_DIR, configPath), result.code));
    });
    return Promise.all(writeFiles);
  }).then(cb);
}

function getAppWebpackConfig() {
  return require(WEBPACK_PATH)
}

function bundleClient(cb) {
  log('bundling client');
  bundle(getAppWebpackConfig().ClientConfig, {saveStats: true}, cb)
}

function bundleServer(cb) {
  log('bundling server');
  bundle(getAppWebpackConfig().ServerConfig, {saveStats: false}, cb)
}

function bundle(config, {saveStats}, cb) {
  const compiler = webpack(config);
  compiler.apply(new ProgressPlugin((percentage, msg) => {
    if (!msg.match(/build modules/)) {
      log('[webpack]', msg)
    }
  }));
  compiler.run((err, rawStats) => {
    if (err) {
      throw err
    } else {
      const stats = rawStats.toJson();
      if (stats.errors.length) {
        throw stats.errors[0]
      } else {
        if (saveStats) {
          const statsPath = `${config.output.path}/stats.json`;
          fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
          log('wrote file', path.relative(APP_PATH, statsPath))
        }
        cb()
      }
    }
  })
}

import { ServerConfig, ClientConfig } from 'react-project/webpack';
import {DefinePlugin} from 'webpack';
const nconf = require('nconf');
nconf.argv().env().file({ file: `${process.cwd()}/config.json` });

const cssLoader = ClientConfig.module.loaders.find(x => x.loader.indexOf('style-loader!') !== -1);
cssLoader.exclude = /node_modules/;

let definePlugin = new DefinePlugin({
  "env.TWEEK_API_HOSTNAME": "\"" + nconf.get("TWEEK_API_HOSTNAME") + "\""
});

ClientConfig.plugins.unshift(definePlugin);
ServerConfig.plugins.unshift(definePlugin);

export { ClientConfig, ServerConfig };

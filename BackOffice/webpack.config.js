import { ServerConfig, ClientConfig } from 'react-project/webpack';

const cssLoader = ClientConfig.module.loaders.find(x => x.loader.indexOf('style-loader!') !== -1);
cssLoader.exclude = /node_modules/;

export { ClientConfig, ServerConfig };

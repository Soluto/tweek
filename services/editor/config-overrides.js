/* config-overrides.js */
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
  config.plugins = (config.plugins || []).concat([
    new CopyWebpackPlugin([
      {
        from: 'node_modules/monaco-editor/min/vs',
        to: 'vs',
      },
    ]),
  ]);

  return config;
};

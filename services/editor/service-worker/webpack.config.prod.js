

const webpack = require('webpack');

const config = require('./webpack.config.dev');

module.exports = Object.assign({}, config, {
  plugins: config.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
  ]),
});

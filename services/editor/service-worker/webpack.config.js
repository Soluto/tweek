const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const appSrc = path.join(process.cwd(), 'service-worker', 'src');
const outputDir = path.join(process.cwd(), 'public');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: `${appSrc}/index.js`,
  output: {
    path: outputDir,
    filename: 'service-worker.bundle.js',
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        include: appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
  plugins: [new CaseSensitivePathsPlugin(), new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

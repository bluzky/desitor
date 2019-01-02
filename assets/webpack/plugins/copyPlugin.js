const path = require('path'),
  manifest = require('../manifest'),
  CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = new CopyWebpackPlugin([
  {
    from: path.join(manifest.paths.src, 'static/fonts'),
    to: path.join(manifest.paths.build, 'fonts')
  },
  {
    from: path.join(manifest.paths.src, 'static/images'),
    to: path.join(manifest.paths.build, 'images')
  }
])

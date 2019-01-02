// ------------------
// @Table of Contents
// ------------------

/**
 * + @Loading Dependencies
 * + @Common Plugins
 * + @Merging Production Plugins
 * + @Merging Development Plugins
 * + @Exporting Module
 */

// ---------------------
// @Loading Dependencies
// ---------------------

const manifest = require("../manifest"),
  webpack = require("webpack");

// ---------------
// @Common Plugins
// ---------------

const plugins = [];

plugins.push(
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(manifest.NODE_ENV)
    }
  }),

  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery",
    Popper: ["popper.js", "default"]
  }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
);



// ----------------------------
// @Merging Development Plugins
// ----------------------------
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
if (manifest.IS_DEVELOPMENT) {
  plugins.push(
    new BundleAnalyzerPlugin()
    // new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin()
  );
}

// -----------------
// @Exporting Module
// -----------------

module.exports = plugins;

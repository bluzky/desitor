// ------------------
// @Table of Contents
// ------------------

/**
 * + @Loading Dependencies
 * + @Environment Holders
 * + @Utils
 * + @App Paths
 * + @Output Files Names
 * + @Entries Files Names
 * + @Exporting Module
 */

// ---------------------
// @Loading Dependencies
// ---------------------

const path = require('path')

// --------------------
// @Environment Holders
// --------------------

const NODE_ENV = process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT = NODE_ENV === 'development',
  IS_PRODUCTION = NODE_ENV === 'production'

// ------
// @Utils
// ------

const dir = src => path.join(__dirname, src)

// ----------
// @App Paths
// ----------

const paths = {
  src: dir('..'),
  build: dir('../../build/'),
  publicPath: "/build/"
}

// -------------------
// @Output Files Names
// -------------------

const outputFiles = {
  bundle: 'js/[name].js',
  vendor: 'js/vendor.js',
  css: 'css/[name].css'
}

// --------------------
// @Entries Files Names
// --------------------

const entries = {
  app: 'index.js',
  core: 'core.js',
  canvas_script: 'canvas_script.js'
}

// -----------------
// @Exporting Module
// -----------------

module.exports = {
  paths,
  outputFiles,
  entries,
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION
}

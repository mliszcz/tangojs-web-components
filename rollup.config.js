
export default {
  entry: 'src/tangojs-web-components.js',
  dest: 'dist/tangojs-web-components.js',
  format: 'iife',
  moduleName: 'tangojs.web',
  plugins: [],
  sourceMap: true,
  banner: `
  if (!window.tangojs) {
    throw new Error('tangojs.core not loaded!')
  }
  `
}

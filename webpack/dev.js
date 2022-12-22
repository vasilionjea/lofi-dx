/**
 * Development webpack config.
 * https://webpack.js.org/guides/development
 */
export default ({ distFolderPath, devServerPort }) => ({
  mode: 'development',

  output: {
    filename: '[name].js',
    path: distFolderPath,
    clean: true,
  },

  devtool: 'cheap-module-source-map',

  // Web server with live reload
  devServer: {
    static: distFolderPath,
    port: devServerPort,
    watchFiles: ['src/*.html'],
  },

  optimization: {
    runtimeChunk: 'single',
  },
});

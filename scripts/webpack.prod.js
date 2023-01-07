/**
 * Production webpack config.
 * https://webpack.js.org/guides/production
 */
export default ({ distFolderPath }) => ({
  mode: 'production',

  output: {
    filename: '[name]-[contenthash].js',
    path: distFolderPath,
    clean: true,
  },
});

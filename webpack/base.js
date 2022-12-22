import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * This is the base webpack config and not meant to be used by itself. It's
 * merged into the production and development configs.
 *
 * https://webpack.js.org/configuration
 */
export default ({ isProdMode }) => ({
  // The environment in which the code will run
  target: 'web',

  // Tells webpack to use its built-in optimizations accordingly
  mode: 'none',

  // The entry file(s) from where Webpack will start resolving modules
  entry: {
    app: './src/main.ts',
  },

  module: {
    rules: [
      // Typescript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      // HTML
      {
        test: /\.html$/,
        loader: 'html-loader',
      },

      // Images will be emitted into the assets folder within the output directory
      // https://webpack.js.org/guides/asset-modules
      {
        test: /\.(png|svg|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]',
        },
      },

      // CSS
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,

          // Translates CSS into CommonJS
          'css-loader',

          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  plugins: [
    // Feature flags example
    new webpack.DefinePlugin({
      SOME_FEATURE_FLAG: JSON.stringify(true),
    }),

    // Extract CSS source into its own file
    new MiniCssExtractPlugin({
      filename: isProdMode ? '[name]-[contenthash].css' : '[name].css',
    }),

    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/favicon.ico',
      inject: 'body',
    }),
  ],
});

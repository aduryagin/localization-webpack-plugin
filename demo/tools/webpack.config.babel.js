import path from 'path';
import webpack from 'webpack';
import LocalizationPlugin from '../../source/plugin';

export default {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    path.resolve('demo/source/entry.js'),
  ],

  output: {
    path: path.resolve('demo/dist'),
    filename: 'bundle.js',
  },

  watch: true,

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, '../dist'),
    port: 9000,
    open: true,
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            compact: false,
            presets: [
              ['env', {
                targets: {
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 11',
                  ],
                },
                modules: false,
                useBuiltIns: true,
              }],
              'stage-2',
              'react',
              'react-optimize',
            ],
          },
        },
      ],
    }, {
      test: /locales\/[a-z]{2}\.json$/,
      loader: LocalizationPlugin.replaceJSONByRandomNumber(),
    }],
  },

  plugins: [
    new LocalizationPlugin({
      filename: '[chunkname].[lang].json', // Avaible: [chunkname], [hash], [lang]
      locales: ['en', 'ru'],
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

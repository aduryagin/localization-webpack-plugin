import path from 'path';
import LocalizationPlugin from '../source/plugin';

export default {
  entry: './source/entry.js',

  output: {
    path: path.resolve('dist'),
  },

  module: {
    rules: [{
      test: /\.js$/,
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
        ],
      },
    }],
  },

  plugins: [
    LocalizationPlugin(),
  ],
};

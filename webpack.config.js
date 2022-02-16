const path = require('path');

module.exports = {
  output: {
    filename: '[name].bundle.js',
    library: 'tyko',
  },
  entry: {
    index: './tyko/static/js/index.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/inline',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  path.resolve(__dirname, './node_modules'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
};

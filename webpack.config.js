const path = require('path');
module.exports = {
  output: {
    filename: '[name].bundle.js',
  },
  entry:{
    index: './tyko/static/js/index.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
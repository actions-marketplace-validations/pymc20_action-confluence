const {resolve} = require('path');

module.exports = {
  entry: './lib/main.js',
  target: 'node',
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
  },
};

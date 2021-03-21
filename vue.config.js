const path = require('path');
module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: [
        path.join(__dirname, './node_modules/proxy-polyfill/proxy.min.js'),
        './src/main.js',
      ],
    },
  },
  transpileDependencies: [
    '@antv/g6',
    '@antv/layout',
    'd3-force',
    'd3-dispatch',
    'd3-timer',
    'ml-matrix',
    'regl',
    'image-to-base64',
  ],
};

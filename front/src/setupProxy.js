const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://143.248.140.140:7777',
      changeOrigin: true,
    })
  );
};
const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(proxy('/python', {
        target: 'http://10.76.2.232:7996',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/python": "/"
        },
    }));
    app.use(proxy('/java', {
        target: 'http://10.76.0.163:6004',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/java": "/"
        },
    }));
}
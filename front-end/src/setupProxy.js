const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(proxy('/python', {
        target: 'http://127.0.0.1:8000',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/python": "/"
        },
    }));
    app.use(proxy('/java', {
        target: 'http://127.0.0.1:8080',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/java": "/"
        },
    }));
}
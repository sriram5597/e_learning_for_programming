const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.dev');
const webpackHotMiddleware = require('webpack-hot-middleware');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const compiler = webpack(config);

app.use(webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true
}));
app.use(webpackHotMiddleware(compiler));

app.use('/api', createProxyMiddleware(config.devServer.proxy['/api']));

app.listen(3000, () => {
    console.log('listening to port 3000...');
})

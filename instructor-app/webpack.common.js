module.exports = {
    entry: {
        main: ['@babel/polyfill', './src/index.js'],
        vendor: ['react', 'react-dom']
    }
}
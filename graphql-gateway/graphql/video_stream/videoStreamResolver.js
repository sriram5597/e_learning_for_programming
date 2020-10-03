const { videoStreamHealthCheck, streamVideo } = require('./videoStreamHandler');

module.exports = {
    Query: {
        videoStreamHealthCheck,
        streamVideo,
    },
}
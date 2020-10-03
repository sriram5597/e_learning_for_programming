const axios = require('axios');

const { VIDEO_STREAM_SERVICE } = require('../../services');

exports.videoStreamHealthCheck = async () => {
    try{
        const res = await axios.get(`${VIDEO_STREAM_SERVICE}/`);

        return {
            service: "Video Streaming service",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.streamVideo = async (_, args, context) => {
    try{
        const res = axios.get(`${VIDEO_STREAM_SERVICE}/video/${args.video}`, {
            headers: {
                Authirization: `Bearer ${context.token}`
            }
        });

        return res.data.url;
    }
    catch(err){
        return err;
    }
}
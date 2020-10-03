const path = require('path');
const axios = require('axios');

const { createWriteStream } = require('fs');
const { CONTENT_SERVICE } = require('../../services');

exports.contentHealthCheck = async () => {
    try{
        const res = await axios.get(`${CONTENT_SERVICE}/`);

        return {
            service: 'Content Service',
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.updateContent = async (_, args, context) => {
    try{
        console.log(args.content);
        
        const res = await axios.patch(`${CONTENT_SERVICE}/${args.content_id}/`, { content: args.content }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.removeContent = async (_, args, context) => {
    try{
        const res = await axios.post(`${CONTENT_SERVICE}/${args.content_id}/remove-content/`, { index: args.index, type: args.type }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.addFlowchart = async (_, args, context) => {
    try{
        const res = await axios.get(`${CONTENT_SERVICE}/${args.content_id}/add-flowchart/?index=${args.index}&title=${args.title}`, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return {
            url: res.data.credentials.url,
            fields: JSON.stringify(res.data.credentials.fields)
        }
    }
    catch(err){
        return err;
    }
}
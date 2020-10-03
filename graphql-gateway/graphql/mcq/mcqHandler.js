const axios = require('axios');

const { TEST_SERVICE } = require('../../services');

exports.mcqHealthCheck = async (_, args) => {
    try{
        const res = await axios.get(`${TEST_SERVICE}/`);

        return {
            service: "Mcq Service",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.addQuestion = async (_, args, context) => {
    try{
        const res = await axios.post(`${TEST_SERVICE}/${args.mcq_id}/add-question/`, { ...args.question }, {
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

exports.getFullMcq = async (_, args, context) => {
    try{
        const res = await axios.get(`${TEST_SERVICE}/${args.mcq_id}/`, {
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

exports.updateQuestion = async (_, args, context) => {
    try{
        let data = {
            index: args.index
        }
        data = {
            ...data,
            ...args.question
        }

        const res = await axios.patch(`${TEST_SERVICE}/${args.mcq_id}/question/?op=${args.op}`, data, {
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

exports.validateAnswers = async (_, args, context) => {
    try{
        const url = args.preview ? `${TEST_SERVICE}/${args.mcq_id}/validate/?preview=true` : `${TEST_SERVICE}/${args.mcq_id}/validate/`;
        const res = await axios.post(url, { answers: args.answers, scope: args.scope }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return res.data;
    }
    catch(err){
        return err;
    }
}

exports.updateMcq = async (_, args, context) => {
    try{
        const res = await axios.patch(`${TEST_SERVICE}/${args.mcq_id}/`, { ...args.mcq }, {
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
const axios = require('axios');

const { MODULE_SERVICE } = require('../../services');

const transformModules = (module) => {
    let data = [];
    Object.keys(module.data.res).forEach( (mod) => {
        if(mod !== 'course_id'){
            let temp = {};
            temp.level = mod;
            temp.modules = module.data.res[mod].modules;
            temp.num_of_tasks = module.data.res[mod].num_of_tasks;
            temp.score = module.data.res[mod].score;

            data = [...data, temp];
        }
    });

    return data;
}

exports.moduleHealthCheck = async () => {
    try{
        const res = await axios.get(`${MODULE_SERVICE}`);

        return {
            service: 'Module Service',
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.createModule = async(_, args, context) => {
    try{
        const module = await axios.post(`${MODULE_SERVICE}/${args.course_id}/create/`, args.module, {
            headers: {
                Authorization: context.token
            }
        });

        const data = transformModules(module);
        return data;
    }
    catch(err){
        return err;
    }
}

exports.updateModule = async(_, args, context) => {
    try{
        const module = await axios.patch(`${MODULE_SERVICE}/${args.course_id}/?index=${args.index}&level=${args.level}`, args.module, {
            headers: {
                Authorization: context.token
            }
        });

        const data = transformModules(module);
        return data;
    }
    catch(err){
        return err;
    }
}

exports.deleteModule = async(_, args, context) => {
    try{
        const module = await axios.delete(`${MODULE_SERVICE}/${args.course_id}/?index=${args.index}&level=${args.level}`, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            status: "SUCCESS",
            ...module.data
        }
    }
    catch(err){
        return err;
    }
}

exports.changeLevel = async(_, args, context) => {
    try{
        const module = await axios.patch(`${MODULE_SERVICE}/${args.course_id}/change-level/?level=${args.old_level}`, {index: args.index, level: args.level},
        {
            headers: {
                Authorization: context.token
            }
        });

        return {
            status: "SUCCESS",
            ...module.data
        }
    }
    catch(err){
        return err;
    }
}
const axios = require('axios');

const { COURSE_SERVICE, MODULE_SERVICE } = require('../../services');


exports.courseHealthCheck = async () => {
    const res = await axios.get(COURSE_SERVICE);

    return res.data;
}

exports.getCourse = async (_, args) => {
    try{
        const res = await axios.get(`${COURSE_SERVICE}/${args.course_id}/`);
        
        const module = await axios.get(`${MODULE_SERVICE}/${args.course_id}/`);

        let data = [];
        Object.keys(module.data.modules).forEach( (mod) => {
            let temp = {};
            temp.level = mod;
            temp.modules = module.data.modules[mod].modules;
            temp.num_of_tasks = module.data.modules[mod].num_of_tasks;
            temp.score = module.data.modules[mod].score;

            data = [...data, temp];
        });
        
        return {
            ...res.data.course,
            levels: data
        }
    }
    catch(err){
        return err;
    }
}

exports.createCourse = async (_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_SERVICE}/create/`, args.course, { headers: { Authorization: context.token }});

        return {
            status: "SUCCESS",
            message: res.data.course_id
        }
    }
    catch(err){
        return err;
    }
}

exports.getAllCourses = async () => {
    try{
        const res = await axios.get(`${COURSE_SERVICE}/all/`);

        return res.data.courses;
    }
    catch(err){
        return err;
    }
}

exports.updateCourse = async (_, args, context) => {
    try{
        const res = await axios.patch(`${COURSE_SERVICE}/${args.course_id}/`, args.course, { headers: { Authorization: context.token }});

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.publishCourse = async (_, args, context) => {
    try{
        const res = await axios.get(`${COURSE_SERVICE}/${args.course_id}/publish/`, { headers: { Authorization: context.token }});

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.getInstCourses = async (_, args, context) => {
    try{
        const res = await axios.get(`${COURSE_SERVICE}/home/`, { headers: { Authorization: context.token }});

        return res.data.courses;
    }
    catch(err){
        return err;
    }
}

exports.getCategories = async (_, args) => {
    try{
        const res = await axios.get(`${COURSE_SERVICE}/categories/`);

        return res.data.categories;
    }
    catch(err){
        return err;
    }
}
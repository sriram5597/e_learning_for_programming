const axios = require('axios');

const { CURRENT_COURSE_SERVICE } = require('../../services');

exports.currentCourseHealthCheck = async () => {
    try{
        const res = await axios.get(`${CURRENT_COURSE_SERVICE}/`);

        return {
            service: 'Current Course Service',
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.enrollCourse = async (_, args, context) => {
    try{
        const res = await axios.post(`${CURRENT_COURSE_SERVICE}/${args.course_id}/enroll/`, {
            name: args.name,
            email: args.email,
            course_title: args.course_title
        }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return {
            status: "SUCCESS",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.getCurrentCourse = async (_, args, context) => {
    try{
        const res = await axios.get(`${CURRENT_COURSE_SERVICE}/${args.course_id}/`, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });
        
        res.data.res.completed_tasks = JSON.stringify(res.data.res.completed_tasks);
        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.getUserCourses = async (_, args, context) => {
    try{
        const res = await axios.get(`${CURRENT_COURSE_SERVICE}/user-courses/`, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return res.data.courses;
    }
    catch(err){
        return err;
    }
}

exports.postFeedback = async (_, args, context) => {
    try{
        const res = await axios.post(`${CURRENT_COURSE_SERVICE}/post-feedback/`, { ...args.feedback }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return {
            message: res.data.message,
            status: "SUCCESS"
        }
    }
    catch(err){
        return err;
    }
}

exports.getFeedbacks = async (_, args, context) => {
    try{
        let url = '';
        if(args.key){
            url = `${CURRENT_COURSE_SERVICE}/get-feedbacks/?last-key=${args.key}`;
        }
        else{
            url = `${CURRENT_COURSE_SERVICE}/get-feedbacks/`;
        }
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return {
            feedbacks: res.data.res,
            key: res.data.key
        }
    }
    catch(err){
        return err;
    }
}

exports.unenrollCourse = async (_, args, context) => {
    try{
        const res = await axios.post(`${CURRENT_COURSE_SERVICE}/${args.course_id}/unenroll/`, {
            course_title: args.course_title,
            comment: args.comment
        }, {
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        return {
            status: "SUCCESS",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}
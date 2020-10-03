const axios = require('axios');

const { COURSE_FLOW_SERVICE, ONLINE_CODE_SERVICE, TEST_SERVICE, VIDEO_STREAM_SERVICE, CONTENT_SERVICE } = require('../../services');
const { identity } = require('lodash');

const getAllSources = (flows, course_id) => {
    let links = [];
    flows.forEach( async (source) => {
        switch(source.type){
            case "MCQ":
                links = [...links, `${TEST_SERVICE}/${source.source}/`];
                break;

            case "CODE":
                links = [...links, `${ONLINE_CODE_SERVICE}/${source.source}/`];
                break;

            case "VIDEO":
                links = [...links, `${VIDEO_STREAM_SERVICE}/video/${source.source}/`];
                break;

            case "TEXT":
                links = [...links, `${CONTENT_SERVICE}/${source.source}/`];
                break;
            
            default:
                null;
        }
    });

    return links;
}

const getSources = async (res, course_id, context, isAdd = false) => {
    const links = getAllSources(res.data.res.flows, course_id);
        
    let sources = [];
    let promises = [];

    sources = res.data.res.flows.map( (f) => {
        return {
            source_title: f.source_title,
            type: f.type
        }
    });

    res.data.res.flows.forEach( (source, index) => {
        promises.push( 
            axios.get(links[index], {
                headers: {
                    Authorization: context.token
                }
            }).then( (response) => {

                if(source.type === 'MCQ'){
                    sources[index].source = response.data.res;
                }
                else if(source.type === 'CODE'){
                    sources[index].source = response.data.res;
                }
                else if(source.type === 'VIDEO'){
                    sources[index].source = {
                        url: response.data.url
                    }
                }
                else{
                    sources[index].source = response.data.res;
                }
            })
        )
    });

    await Promise.all(promises);

    return {
        title: res.data.res.title,
        scope: res.data.res.scope,
        scope_value: res.data.res.scope_value,
        course_id: course_id,
        isTrial: res.data.res.isTrial,
        published: res.data.res.published,
        sources
    }
}

exports.courseFlowHealthCheck = async () => {
    try{
        const res = await axios.get(`${COURSE_FLOW_SERVICE}/`);

        return {
            service: "COURS FLOW SERVICE",
            ...res.data
        }
    }
    catch(err){
        return err;
    }
}

exports.addFlowTitle = async (_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/add-title/`, {...args}, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            status: "SUCCESS",
            message: res.data.res
        }
    }
    catch(err){
        return err;
    }
}

exports.addSource = async (_, args, context) => {
    try{
        let sourceData = {};
        switch(args.source.type){
            case 'CODE': 
                sourceData = args.code;
                break;

            case "MCQ":
                sourceData = args.test;
                break;

            case "VIDEO":
                sourceData = args.video;
            
            default:
                null;
        }

        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/add-source/`, { title: args.title, ...args.source, ...sourceData}, {
            headers: {
                Authorization: context.token
            }
        });

        if(args.source.type === 'VIDEO'){
            return {
                flow: getSources(res, args.course_id, context, true),
                credentials: res.data.cred,
                key: res.data.key
            }
        }
        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.getLevelFlows = async (_, args, context) => {
    try{
        let url = '';
        
        if(!args.role){
            url  = `${COURSE_FLOW_SERVICE}/${args.course_id}/`
        }
        else{
            url = `${COURSE_FLOW_SERVICE}/${args.course_id}/?role=${args.role}`
        }
        const res = await axios.get(url, {
            headers: {
                Authorization: context.token
            }
        });

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.getFlow = async (_, args, context) => {
    try{
        let url = '';
        if(args.role){
            url = `${COURSE_FLOW_SERVICE}/${args.course_id}/${args.title}/?role=${args.role}`;
        }
        else{
            url = `${COURSE_FLOW_SERVICE}/${args.course_id}/${args.title}/?pay_status=${args.pay_status}`
        }
        const res = await axios.get(url, {
            headers: {
                Authorization: context.token
            }
        });

        if(!res.data.res.flows ||res.data.res.flows.length === 0){
            return res.data.res;
        }

        console.log(res.data.res.title);
        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.updateFlowTitle = async (_, args, context) => {
    try{
        const res = await axios.patch(`${COURSE_FLOW_SERVICE}/${args.course_id}/${args.old_title}/`, {title: args.title}, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            status: "SUCCESS",
            message: res.data.res
        }
    }
    catch(err){
        return err;
    }
}

exports.changeScope = async (_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/${args.old_title}/change-scope/`, 
            { 
                scope: args.scope, 
                scope_value: args.scope_value
            }, 
            {
                headers: {
                    Authorization: context.token
            }
        });

        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.deleteFlow = async (_, args, context) => {
    try{
        const res = await axios.delete(`${COURSE_FLOW_SERVICE}/${args.course_id}/${args.title}/`, 
            {
                headers: {
                    Authorization: context.token
            }
        });

        return {
            message: "Flow deleted",
            status: "SUCCESS"
        }
    }
    catch(err){
        return err;
    }
}

exports.changeOrder = async (_, args, context) => {
    try{
        const res = await axios.patch(`${COURSE_FLOW_SERVICE}/${args.course_id}/change-order/`, 
            { 
                ...args
            }, 
            {
                headers: {
                    Authorization: context.token
            }
        });

        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.deleteSource = async (_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/remove-source/`, 
            { 
                ...args
            }, 
            {
                headers: {
                    Authorization: context.token
            }
        });

        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.publishFlow = async (_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/publish-flow/?title=${args.title}`, { publish: args.publish }, {
            headers: {
                Authorization: context.token
            }
        });

        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}

exports.makeFlowTrial = async(_, args, context) => {
    try{
        const res = await axios.post(`${COURSE_FLOW_SERVICE}/${args.course_id}/make-trial/?title=${args.title}`, { trial: args.trial }, {
            headers: {
                Authorization: context.token
            }
        });

        return getSources(res, args.course_id, context);
    }
    catch(err){
        return err;
    }
}
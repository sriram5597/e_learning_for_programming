const axios = require('axios');
const FormData = require('form-data');
const request = require('request');

const { ONLINE_CODE_SERVICE, FLOWCHART_SERVICE } = require('../../services');

exports.problemHealthCheck = async () => {
    try{
        const res = await axios.get(`${ONLINE_CODE_SERVICE}/`);

        return {
            service: "Online Code Service",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.updateSampleTestcase = async (_, args, context) => {
    try{
        const res = await axios.post(`${ONLINE_CODE_SERVICE}/${args.problem_id}/sampletest/?op=${args.op}`, { ...args.sample_testcase, index: args.index }, {
            headers: {
                Authorization: context.token
            }
        });

        return res.data.res
    }
    catch(err){
        return err;
    }
}

exports.compileCode = async (_, args,  context) => {
    try{
        let data = {
            scope: args.scope
        };
        if(args.source_type === 'code'){
            data = {
                ...data,
                ...args.code
            }
        }
        else{
            data = {
                ...data,
                components: JSON.parse(args.flowchart.components),
                position: JSON.parse(args.flowchart.position)
            }
        }

        const res = await axios.post(`${ONLINE_CODE_SERVICE}/${args.problem_id}/compile/?source-type=${args.source_type}&type=${args.type}`, data, {
            headers: {
                Authorization: context.token
            }
        });

        let result = [];
        
        Object.keys(res.data.res.result).sort().forEach( (k) => {
            result = [...result, res.data.res.result[k]];
        });
        
        if(args.type === 'sample'){
            return { result };
        }
        else{
            return {
                result,
                score: res.data.score
            }
        }
    }
    catch(err){
        return err;
    }
}

exports.runCode = async (_, args, context) => {
    try{
        let data = {};
        if(args.source_type === 'code'){
            data = args.code;
        }
        else{
            data.components = JSON.parse(args.flowchart.components);
            data.position = JSON.parse(args.flowchart.position);
        }

        data = {
            ...data,
            input: args.input
        }

        const res = await axios.post(`${ONLINE_CODE_SERVICE}/run/?source-type=${args.source_type}&problem_id=${args.problem_id}`, data, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            output: res.data.result
        }
    }
    catch(err){
        return err;
    }
}

exports.updateProblem = async (_, args, context) => {
    try{
        const res = await axios.patch(`${ONLINE_CODE_SERVICE}/${args.problem_id}/`, { ...args.problem }, {
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

exports.deleteTestcases = async (_, args, context) => {
    try{
        const res = await axios.delete(`${ONLINE_CODE_SERVICE}/${args.problem.problem_id}/`, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            ...res.data.res
        }
    }
    catch(err){
        return err;
    }
}

exports.loadCode = async (_, args, context) => {
    try{
        const res = await axios.post(`${ONLINE_CODE_SERVICE}/${args.problem.problem_id}/load-code/`, { language: args.language }, {
            headers: {
                Authorization: context.token
            }
        });

        return res.data.code;
    }
    catch(err){
        return err;
    }
}

exports.getTestcase = async (_, args, context) => {
    try{
        const res = await axios.get(`${ONLINE_CODE_SERVICE}/${args.problem.problem_id}/testcase/?index=${args.index}`, {
            headers: {
                Authorization: context.token
            }
        });

        return {
            input: res.data.input,
            output: res.data.output
        }
    }
    catch(err){
        return err;
    }
}

exports.uploadTestcase = async (_, args, context) => {
    try{
        const res = await axios.post(`${ONLINE_CODE_SERVICE}/${args.problem_id}/upload/testcase/`, 
            {
                ...args,
            },
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            problem: {
                ...res.data.problem
            },
            credentials: {
                url: res.data.credentials.url,
                fields: JSON.stringify(res.data.credentials.fields)
            }
        }
    }
    catch(err){
        return err;
    }
}

exports.deleteTestcases = async (_, args, context) => {
    try{
        const res = await axios.delete(`${ONLINE_CODE_SERVICE}/${args.problem_id}/testcases/`, 
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.deleteTestcase = async (_, args, context) => {
    try{
        const res = await axios.delete(`${ONLINE_CODE_SERVICE}/${args.problem_id}/testcase/?index=${args.index}`, 
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return res.data.res;
    }
    catch(err){
        return err;
    }
}

exports.getTestcase = async (_, args, context) => {
    try{
        const res = await axios.get(`${ONLINE_CODE_SERVICE}/${args.problem_id}/testcase/?index=${args.index}`, 
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            input: res.data.input,
            output: res.data.output
        }
    }
    catch(err){
        return err;
    }
}

exports.saveCode = async (_, args, context) => {
    try{
        const res = await axios.post(`${ONLINE_CODE_SERVICE}/${args.problem_id}/save-code/`, { code: args.code, filename: args.filename },
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            status: "SUCCESS",
            message: "Code Saved"
        }
    }
    catch(err){
        return err;
    }
}

exports.loadCode = async (_, args, context) => {
    try{
        const res = await axios.get(`${ONLINE_CODE_SERVICE}/${args.problem_id}/load-code/?language=${args.language}`,
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            code: res.data.code,
        }
    }
    catch(err){
        return err;
    }
}

exports.saveChart = async (_, args, context) => {
    try{
        const res = await axios.post(`${FLOWCHART_SERVICE}/save-chart/?problem_id=${args.problem_id}`, { chart: args.chart },
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            status: "SUCCESS",
            message: res.data.message
        }
    }
    catch(err){
        return err;
    }
}

exports.loadChart = async (_, args, context) => {
    try{
        const res = await axios.get(`${FLOWCHART_SERVICE}/load-chart/?problem_id=${args.problem_id}`, 
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            url: res.data.url
        }
    }
    catch(err){
        return err;
    }
}

exports.loadComponents = async (_, args, context) => {
    try{
        const res = await axios.get(`${FLOWCHART_SERVICE}/load-components/?problem_id=${args.problem_id}`, 
            {
                headers: {
                    Authorization: `Bearer ${context.token}`
                }
            }
        );

        return {
            components: JSON.stringify(res.data.res.components),
            position: JSON.stringify(res.data.res.position)
        }
    }
    catch(err){
        return err;
    }
}
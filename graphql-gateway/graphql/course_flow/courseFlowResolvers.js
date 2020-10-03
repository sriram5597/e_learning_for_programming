const { addFlowTitle, courseFlowHealthCheck, addSource, getLevelFlows, getFlow, updateFlowTitle , changeScope, deleteFlow, changeOrder,
    deleteSource, publishFlow, makeFlowTrial
} = require('../course_flow/courseFlowHandler');

module.exports = {
    Query: {
        courseFlowHealthCheck,
        getLevelFlows,
        getFlow,
    },

    Mutation: { 
        addFlowTitle,
        addSource,
        updateFlowTitle,
        changeScope,
        changeOrder,
        deleteFlow,
        deleteSource,
        publishFlow,
        makeFlowTrial
    },

    Source: {
        __resolveType: obj => {
            if(obj.problem_id){
                return "Problem";
            }
            else if(obj.mcq_id){
                return "Mcq";
            }
            else if(obj.url){
                return "VideoStream";
            }
            else if(obj.content_id){
                return "Content";
            }
            else{
                return null;
            }
        }
    },

    SourceAddition: {
        __resolveType: obj => {
            if(obj.credentials){
                return "VideoUpload";
            }
            else{
                return "Flow";
            }
        }
    }
}
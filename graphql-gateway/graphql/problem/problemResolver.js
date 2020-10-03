const { problemHealthCheck, updateSampleTestcase, compileCode, runCode, updateProblem, uploadTestcase, deleteTestcases, deleteTestcase,
    getTestcase, saveCode, loadCode, saveChart, loadChart, loadComponents
} = require('./problemHandler');

module.exports = {
    Query: {
        problemHealthCheck,
        getTestcase,
        runCode,
        loadCode,
        loadChart,
        loadComponents,
    },
    Mutation: {
        updateSampleTestcase,
        compileCode,
        updateProblem,
        uploadTestcase,
        deleteTestcases,
        deleteTestcase,
        saveCode,
        saveChart,
    },
    ProblemOutput: {
        __resolveType: obj => {
            if(obj.result[0].expected){
                return "SampleOutput";
            }
            else{
                return "TestcaseOutput";
            }
        }
    }
}
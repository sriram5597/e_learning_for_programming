const { mcqHealthCheck, addQuestion, updateQuestion, validateAnswers, updateMcq } = require('./mcqHandler');

module.exports = {
    Query: {
        mcqHealthCheck,
    },
    Mutation: {
        addQuestion,
        updateQuestion,
        updateMcq,
        validateAnswers,
    }
}
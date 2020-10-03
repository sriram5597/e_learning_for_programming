const { contentHealthCheck, updateContent, removeContent, addFlowchart } = require('./contentHandler');

module.exports = {
    Query: {
        contentHealthCheck,
        addFlowchart,
    },
    Mutation: {
        updateContent,
        removeContent
    }
}
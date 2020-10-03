const { moduleHealthCheck, createModule, updateModule, deleteModule, changeLevel } = require('./moduleHandlers');

module.exports = {
    Query: {
        moduleHealthCheck,
    },

    Mutation: {
        createModule,
        updateModule,
        deleteModule,
        changeLevel,
    }
}
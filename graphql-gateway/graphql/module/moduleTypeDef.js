const { gql } = require('apollo-server-express');

module.exports = gql `
    type Module {
        module_id: ID
        title: String
        index: String
        sub_modules: [String]
    }

    type Level {
        level: String, 
        modules: [Module],
        num_of_tasks: String,
        score: String
    }

    input moduleInput {
        title: String
        sub_modules: [String],
        level: String
    }
`;
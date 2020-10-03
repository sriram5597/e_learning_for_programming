const { gql } = require('apollo-server-express');

module.exports = gql `
    type Content {
        content_id: ID
        content: [SubContent]
    }

    type SubContent {
        title: String
        type: String
        content: String
        code: String
        language: String
        url:String
    }

    input SubContentInput {
        title: String
        type: String
        content: String
        code: String
        language: String
    }
`
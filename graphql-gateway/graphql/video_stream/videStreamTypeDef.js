const { gql } = require('apollo-server-express');

module.exports = gql `
    input videoStreamInput {
        source: String
    }

    type VideoStream {
        url: String
    }
`
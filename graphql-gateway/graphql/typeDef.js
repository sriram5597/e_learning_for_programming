const { gql } = require('apollo-server-express');

const schema = gql`
    type healthCheck {
        message: String
        service: String!
    }

    type MutationResponse {
        status: String!,
        message: String
    }

    type SignedPostResponse {
        url: String
        fields: String
    }
`;

module.exports = schema;
const { gql } = require('apollo-server-express');

module.exports = gql`
    type Flow {
        course_id: ID
        title: String
        scope: String
        scope_value: String
        sources: [Sources]
        index: String
        isTrial: Boolean
        published: Boolean
    }

    union Source = Mcq | Problem | Content | VideoStream

    type Sources {
        source_title: String
        type: String
        source: Source
    }

    type Credentials {
        AccessKeyId: String
        Expiration: String
        SecretAccessKey: String
        SessionToken: String
    }

    type VideoUpload {
        flow: Flow,
        credentials: Credentials
        key: String
    }

    union SourceAddition = Flow | VideoUpload

    input SourceInput {
        source_title: String
        type: String
    }
`;
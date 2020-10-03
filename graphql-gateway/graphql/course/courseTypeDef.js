const { gql } = require('apollo-server-express');

const schema = gql`
    type Course {
        course_id: ID
        course_title: String
        description: String
        outcomes: [String]
        category: String
        price: String
        pre_requisites: [String]
        levels: [Level]
        published: Boolean
        image_url: String
        cover_image_url: String
    }

    type Category {
        category: String
    }

    input CourseInput {
        course_title: String
        description: String
        outcomes: [String]
        category: String
        price: String
        pre_requisites: [String]
    }
`;

module.exports = schema;
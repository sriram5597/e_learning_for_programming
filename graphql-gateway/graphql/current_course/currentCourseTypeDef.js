const { gql } = require('apollo-server-express');

module.exports = gql `
    type CurrentCourse {
        course_id: ID
        username: String
        xp: String
        completed_tasks: String
        pay_status: Boolean
    }

    type Feedback {
        feedback_id: ID
        title: String
        category: String
        comment: String
        email: String
        date: String
        username: String
    }

    type PaginatedFeedback {
        feedbacks: [Feedback]
        key: ID
    }

    input FeedbackInput {
        title: String
        category: String
        comment: String
        date: String
        email: String
    }
`;
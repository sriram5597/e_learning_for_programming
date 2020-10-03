const { gql } = require('apollo-server-express');

module.exports = gql `
    type Mcq {
        mcq_id: ID
        points: String
        coins: String
        questions: [Question]
    }

    type Question {
        question: String
        type: String
        answer: String
        options: [String]
        explanation: String
    }

    type McqValidation {
        score: Float,
        answers: [String],
        explanation: [String],
    }

    input McqInput {
        points: Int
        coins: Int
    }

    input QuestionInput {
        question: String
        type: String
        options: [String]
        answer: String
        explanation: String
    }
`;
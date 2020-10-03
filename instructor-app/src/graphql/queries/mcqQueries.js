import { gql } from '@apollo/client';

export const McqFragment = gql `
    fragment McqFragment on Mcq{
        mcq_id
        points
        questions {
            question
            type
            answer
            options
            explanation
        }
    }
`

export const VALIDATE_ANSWERS = gql `
    query validateAnswers($mcq_id: ID, $answers: [String], $preview: Boolean){
        validateAnswers(mcq_id: $mcq_id, answers: $answers, preview: $preview){
            score
            answers
            explanation
        }
    }
`;
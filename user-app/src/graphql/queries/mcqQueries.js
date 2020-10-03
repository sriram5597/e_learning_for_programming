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
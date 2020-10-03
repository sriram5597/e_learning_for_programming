import { gql } from '@apollo/client';

import { McqFragment } from '../queries/mcqQueries';

export const UPDATE_QUESTION = gql `
    mutation updateQuestion($mcq_id: ID, $index: Int, $op: String, $question: QuestionInput){
        updateQuestion(mcq_id: $mcq_id, index: $index, op: $op, question: $question){
            ...McqFragment
        }
    }
    ${McqFragment}
`

export const ADD_QUESTION = gql `
    mutation addQuestion($mcq_id: ID, $question: QuestionInput){
        addQuestion(mcq_id: $mcq_id, question: $question){
            ...McqFragment
        }
    }
    ${McqFragment}
`

export const UPDATE_MCQ = gql `
    mutation updateMcq($mcq_id: ID, $mcq: McqInput){
        updateMcq(mcq_id: $mcq_id, mcq: $mcq){
            ...McqFragment
        }
    }
    ${McqFragment}
`
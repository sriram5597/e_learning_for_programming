import { gql } from '@apollo/client';

import { McqFragment } from '../queries/mcqQueries';

export const VALIDATE_ANSWERS = gql `
    mutation validateAnswers($mcq_id: ID, $answers: [String], $preview: Boolean, $scope: String){
        validateAnswers(mcq_id: $mcq_id, answers: $answers, preview: $preview, scope: $scope){
            score
            answers
            explanation
        }
    }
`;
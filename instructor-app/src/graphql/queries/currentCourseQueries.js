import { gql } from '@apollo/client';

export const GET_FEEDBACKS = gql `
    query($key: ID) {
        getFeedbacks(key: $key) {
            key
            feedbacks {
                feedback_id
                date
                title
                comment
                category
                email
            }
        }
    }
`
import { gql } from '@apollo/client';

export const ENROLL_COURSE = gql `
    mutation enrollCourse($course_id: ID, $name: String, $email: String, $course_title: String){
        enrollCourse(course_id: $course_id, name : $name, email: $email, course_title: $course_title){
            status
            message
        }
    }
`

export const POST_FEEDBACK = gql `
    mutation postFeedback($feedback: FeedbackInput) {
        postFeedback(feedback: $feedback){
            status
            message
        }
    }
`

export const UNENROLL_COURSE = gql `
    mutation unenrollCourse($course_id: ID, $course_title: String, $comment: String) {
        unenrollCourse(course_id: $course_id, course_title: $course_title, comment: $comment) {
            status
            message
        }
    }
`
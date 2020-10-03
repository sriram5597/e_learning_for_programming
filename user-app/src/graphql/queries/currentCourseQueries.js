import { gql } from '@apollo/client';

export const GET_CURRENT_COURSE = gql `
    query getCurrentCourse($course_id: ID) {
        getCurrentCourse(course_id: $course_id){
            username
            course_id
            pay_status
            completed_tasks
            xp
        }
    }
`;

export const GET_USER_COURSES = gql `
    query getUserCourses{
        getUserCourses{
            course_id
            course_title
            description
            image_url
            price
        }
    }
`
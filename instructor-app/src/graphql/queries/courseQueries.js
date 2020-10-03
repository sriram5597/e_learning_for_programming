import { gql } from 'apollo-boost';

export const GET_COURSES = gql`
    query {
        getInstCourses {
            course_id
            course_title
            description
            image_url
        }
    }
`;

export const GET_COURSE = gql`
    query getCourse($course_id: ID) {
        getCourse(course_id: $course_id){
            course_id
            course_title
            description
            outcomes
            pre_requisites
            price
            cover_image_url
            image_url
            category 
            
            levels {
                modules {
                    module_id
                    title
                    sub_modules
                }
            }
        }
    }
`;

export const GET_CATEGORIES = gql `
    query {
        getCategories {
            category
        }
    }
`;
import { gql } from '@apollo/client';

export const GET_MODULES = gql `
    query getCourse($course_id: ID){
        getCourse(course_id: $course_id){
            levels{
                modules{
                    module_id
                    title
                    sub_modules
                }
            }
        }
    }
`;
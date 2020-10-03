import { gql } from '@apollo/client';

export const FlowFragment = gql `
    fragment CourseFlow on Flow {
        title
        course_id
        scope
        scope_value
        published
        isTrial
        sources {
            source_title
            type
            source {
                ...on Problem{
                    problem_id
                    problem_description
                    input_format
                    output_format
                    constraints
                    max_score
                    need_flowchart

                    sample_testcases{
                        input
                        output
                        explanation
                    }

                    testcases {
                        input
                        output
                        points
                    }
                }
                ...on Mcq{
                    mcq_id
                    questions{
                        question
                        options
                        type
                        answer
                        explanation
                    }
                    points
                }
                ...on Content{
                    content_id
                    content{
                        type
                        content
                        title
                        code
                        language
                        url
                    }
                }
                ...on VideoStream{
                    url
                }
            }
        }
    }
`

export const GET_LEVEL_FLOWS = gql `
    query getLevelFlows($course_id: ID){
        getLevelFlows(course_id: $course_id, role: "instructors"){
            title
            course_id
            scope
            scope_value
        }
    }
`

export const GET_FLOW = gql `
    query getFlow($title: String, $course_id: ID, $role: String){
        getFlow(course_id: $course_id, title: $title, role: $role){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`
import { gql } from '@apollo/client';

export const FlowFragment = gql `
    fragment CourseFlow on Flow {
        title
        course_id
        scope
        scope_value
        isTrial
        published
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
        getLevelFlows(course_id: $course_id){
            title
            course_id
            scope
            scope_value
            published
            isTrial
        }
    }
`

export const GET_FLOW = gql `
    query getFlow($title: String, $course_id: ID, $pay_status: Boolean){
        getFlow(course_id: $course_id, title: $title, pay_status: $pay_status){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`
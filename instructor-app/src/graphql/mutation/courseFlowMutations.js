import { gql } from '@apollo/client';

import { FlowFragment } from '../queries/courseFlowQueries';

export const ADD_TITLE = gql`
    mutation addFlowTitle($course_id: ID, $title: String, $scope: String, $scope_value: String){
        addFlowTitle(course_id: $course_id, title: $title, scope: $scope, scope_value: $scope_value){
            status
            message
        }
    }
`

export const UPDATE_TITLE = gql `
    mutation updateFlowTitle($course_id: ID, $old_title: String, $title: String){
        updateFlowTitle(course_id: $course_id, title: $title, old_title: $old_title){
            status
            message
        }
    }
`

export const ADD_SOURCE = gql `
    mutation addSource($course_id: ID, $title: String, $source: SourceInput, $code: ProblemInput, $test: McqInput, $video: videoStreamInput){
        addSource(course_id: $course_id, title: $title, source: $source, code: $code, test: $test, video: $video){
            ...on VideoUpload{
                flow{
                    ...CourseFlow
                }
                credentials{
                    AccessKeyId
                    Expiration
                    SessionToken
                    SecretAccessKey
                }
                key
            }
            ...on Flow{
                ...CourseFlow
            }
        }
    }
    ${FlowFragment}
`

export const DELETE_FLOW = gql `
    mutation deleteFlow($course_id: ID, $title: String){
        deleteFlow(course_id: $course_id, title: $title){
            status
            message
        }
    }
`

export const DELETE_SOURCE = gql `
    mutation deleteSource($course_id: ID, $title: String, $source: String){
        deleteSource(course_id: $course_id, title: $title, source: $source){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`

export const CHANGE_ORDER = gql `
    mutation changeOrder($course_id: ID, $title: String, $index: Int, $old_index: Int){
        changeOrder(course_id: $course_id, title: $title, index: $index, old_index: $old_index){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`

export const PUBLISH_FLOW = gql `
    mutation publishFlow($course_id: ID, $title: String, $publish: Boolean){
        publishFlow(course_id: $course_id, title: $title, publish: $publish){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`

export const MAKE_FLOW_TRIAL = gql `
    mutation makeFlowTrial($course_id: ID, $title: String, $trial: Boolean){
        makeFlowTrial(course_id: $course_id, title: $title, trial: $trial){
            ...CourseFlow
        }
    }
    ${FlowFragment}
`
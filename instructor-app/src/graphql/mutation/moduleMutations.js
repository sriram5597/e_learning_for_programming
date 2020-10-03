import { gql } from '@apollo/client';

export const CREATE_MODULE = gql `
    mutation createModule($module: moduleInput, $course_id: ID){
        createModule(module: $module, course_id: $course_id){
            modules {
                module_id
                title
                sub_modules
            }
        }
    }
`

export const UPDATE_MODULE = gql `
    mutation updateModule($module: moduleInput, $level: String, $index: String, $course_id: ID){
        updateModule(module: $module, index: $index, level: $level, course_id: $course_id){
            modules {
                module_id
                title
                sub_modules
            }
        }
    }
`

export const DELETE_MODULE = gql`
    mutation deleteModule($level: String, $index: String, $course_id: ID){
        deleteModule(level: $level, index: $index, course_id: $course_id){
            status
            message
        }
    }
`

export const UPDATE_LEVEL = gql `
    mutation changeLevel($index: String, $old_level: String, $level: String, $course_id: ID){
        changeLevel(index: $index, old_level: $old_level, level: $level, course_id: $course_id){
            status
            message
        }
    }
`
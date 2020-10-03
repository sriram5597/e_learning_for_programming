import { gql } from '@apollo/client';

export const UPDATE_COURSE = gql`
    mutation updateCourse($course: CourseInput, $course_id: ID){
        updateCourse(course: $course, course_id: $course_id){
            course_title
            description
            outcomes
            pre_requisites
            category
            price
            published
            cover_image_url
            image_url
        }
    }
`

export const CREATE_COURSE = gql `
    mutation createCourse($course: CourseInput) {
        createCourse(course: $course){
            message
            status
        }
    }
`

export const PUBLISH_COURSE = gql`
    mutation publishCourse($course_id: ID){
        publishCourse(course_id: $course_id){
            course_title
            description
            outcomes
            pre_requisites
            category
            price
            published
            cover_image_url
            image_url
        }
    }
`
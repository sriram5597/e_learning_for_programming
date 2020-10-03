const { courseHealthCheck, getCourse, createCourse, getAllCourses, updateCourse, publishCourse, getInstCourses, getCategories } = require('../course/courseHandler');;

module.exports = {
    Query: {
        courseHealthCheck,
        getCourse,
        getAllCourses,
        getInstCourses,
        getCategories
    },

    Mutation: {
        createCourse,
        updateCourse,
        publishCourse
    }
}
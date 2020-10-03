const { currentCourseHealthCheck, enrollCourse, getUserCourses, getCurrentCourse, postFeedback, getFeedbacks, unenrollCourse,
} = require('./currrentCourseHandler');

module.exports = {
    Query: {
        currentCourseHealthCheck,
        getCurrentCourse,
        getUserCourses,
        getFeedbacks
    },
    Mutation: {
        enrollCourse,
        postFeedback,
        unenrollCourse
    }
}
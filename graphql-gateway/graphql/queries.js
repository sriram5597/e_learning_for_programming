const { gql } = require('apollo-server-express');

module.exports = gql`
    type Query {
        courseHealthCheck: healthCheck
        getCourse(course_id: ID): Course
        getAllCourses: [Course]
        getInstCourses: [Course]
        getCategories: [Category]

        moduleHealthCheck: healthCheck

        courseFlowHealthCheck: healthCheck
        getLevelFlows(course_id: ID, role: String, role: String): [Flow]
        getFlow(course_id: ID, title: String, role: String, pay_status: Boolean): Flow

        problemHealthCheck: healthCheck
        getTestcase(problem_id: ID, index: Int): Testcase
        runCode(source_type: String, input: String, code: CodeInput, flowchart: FlowchartInput, problem_id: ID): CodeOutput
        loadCode(problem_id: ID, language: String): Code
        loadChart(problem_id: ID): FlowchartImage
        loadComponents(problem_id: ID): Flowchart

        mcqHealthCheck: healthCheck

        contentHealthCheck: healthCheck
        addFlowchart(content_id: ID, index: Int, title: String): SignedPostResponse

        videoStreamHealthCheck: healthCheck
        streamVideo(course_id: ID, video: String): VideoStream

        currentCourseHealthCheck: healthCheck
        getUserCourses: [Course]
        getCurrentCourse(course_id: ID): CurrentCourse
        getFeedbacks(key: ID): PaginatedFeedback
    }
`;
const { gql } = require('apollo-server-express');

module.exports = gql`
    type Mutation {
        createCourse(course: CourseInput): MutationResponse,
        updateCourse(course: CourseInput, course_id: ID): Course,
        publishCourse(course_id: ID): Course,
        
        createModule(module: moduleInput, course_id: ID): [Level]
        updateModule(module: moduleInput, index: String, level: String, course_id: ID): [Level],
        deleteModule(level: String, index: String, course_id: ID): MutationResponse,
        changeLevel(old_level: String, index: String, level: String, course_id: ID): MutationResponse,

        addFlowTitle(course_id: ID, scope_value: String, scope: String, title: String): MutationResponse,
        addSource(course_id:ID, title: String, source: SourceInput, code: ProblemInput, test: McqInput, video: videoStreamInput): SourceAddition
        updateFlowTitle(course_id: ID, old_title: String, title: String): MutationResponse,
        changeScope(course_id: ID, title: String, scope: String, scope_value: String): Flow,
        deleteFlow(course_id: ID, title: String): MutationResponse,
        changeOrder(course_id: ID, title: String, index: Int, old_index: Int): Flow
        deleteSource(course_id: ID, title: String, source: String): Flow
        publishFlow(course_id: ID, title: String, publish: Boolean):Flow
        makeFlowTrial(course_id: ID, title: String, trial: Boolean): Flow
       
        uploadTestcase(problem_id: ID, ext: String, input: String, output: String, test_count: Int): TestcaseUpload
        updateSampleTestcase(problem_id: ID, sample_testcase: SampleTestcaseInput, op: String, index: Int): Problem
        compileCode(problem_id: ID, type: String, code: CodeInput, source_type: String, flowchart: FlowchartInput, scope: String): ProblemOutput
        updateProblem(problem_id: ID, problem: ProblemInput): Problem
        deleteTestcases(problem_id: ID): Problem
        deleteTestcase(problem_id: ID, index: Int): Problem
        saveCode(problem_id: ID, code: String, filename: String): MutationResponse
        saveChart(problem_ID: ID, chart: String): MutationResponse

        addQuestion(mcq_id: ID, question: QuestionInput): Mcq
        updateQuestion(mcq_id: ID, question: QuestionInput, index: Int, op: String): Mcq
        updateMcq(mcq_id: ID, mcq: McqInput): Mcq
        validateAnswers(mcq_id: ID, answers: [String], preview: Boolean, scope: String): McqValidation

        updateContent(content_id: ID, content: [SubContentInput]): Content
        removeContent(content_id: ID, index: Int, type:String): Content

        enrollCourse(course_id: ID, name: String, email: String, course_title: String): MutationResponse
        postFeedback(feedback: FeedbackInput): MutationResponse
        unenrollCourse(course_id: ID, course_title: String, comment: String): MutationResponse
    }
`;
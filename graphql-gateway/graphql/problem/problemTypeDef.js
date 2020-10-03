const { gql } = require('apollo-server-express');

module.exports = gql `
    input SampleTestcaseInput {
        input: String
        output: String
        explain: String
    }

    input CodeInput {
        language: String
        code: String
        filename: String
    }

    input FlowchartInput {
        components: String
        position: String
    }

    type Flowchart {
        components: String
        position: String
    }

    type FlowchartImage {
        url: String
    }

    type SampleTestcase {
        input:String
        output:String
        explanation: String
    }

    type Testcase {
        input: String
        output: String
        points: String
    }

    type CodeOutput {
        output: String
    }

    input ProblemInput {
        problem_description: String
        constraints: String
        input_format: String
        output_format: String
        need_flowchart: String
        max_score: Int
    }

    type SampleResult {
        output: String
        expected: String
        status: String
    }

    type TestcaseResult {
        status: String
    }

    type SampleOutput {
        result: [SampleResult]
    }

    type TestcaseOutput {
        result: [TestcaseResult],
        score: Float
    }

    type Code {
        code: String
    }

    union ProblemOutput = SampleOutput | TestcaseOutput

    type Problem {
        problem_id: ID
        problem_description: String
        input_format: String
        output_format: String
        constraints: String
        need_flowchart: String
        max_score: String
        coins: String

        sample_testcases: [SampleTestcase]
        testcases: [Testcase]
    }

    type TestcaseUpload {
        problem: Problem
        credentials: SignedPostResponse
    }
`;
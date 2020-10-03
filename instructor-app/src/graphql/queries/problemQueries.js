import { gql } from '@apollo/client';

export const ProblemFragment = gql `
    fragment ProblemFragment on Problem {
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
`

export const GET_TESTCASE = gql `
    query getTestcase($problem_id: ID, $index: Int){
        getTestcase(problem_id: $problem_id, index: $index){
            input
            output
        }
    }
`

export const RUN_CODE = gql `
    query runCode($source_type: String, $input: String, $code: CodeInput, $flowchart: FlowchartInput, $problem_id: ID){
        runCode(source_type: $source_type, input: $input, code: $code, flowchart: $flowchart, problem_id: $problem_id){
            output
        }
    }
`

export const LOAD_CODE = gql `
    query loadCode($problem_id: ID, $language: String){
        loadCode(problem_id: $problem_id, language: $language){
            code
        }
    }
`

export const LOAD_COMPONENTS = gql `
    query loadComponents($problem_id: ID){
        loadComponents(problem_id: $problem_id){
            components
            position
        }
    }
`

export const LOAD_CHART = gql `
    query saveChart($problem_id: ID){
        saveChart(problem_id: $problem_id){
            url
        }
    }
`
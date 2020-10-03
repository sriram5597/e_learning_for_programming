import { gql } from '@apollo/client';

import { ProblemFragment } from '../queries/problemQueries';

export const UPDATE_PROBLEM = gql `
    mutation updateProblem($problem_id: ID, $problem: ProblemInput){
        updateProblem(problem_id: $problem_id, problem: $problem){
            ...ProblemFragment
        }
    }
    ${ProblemFragment}
`


export const UPDATE_SAMPLE_TESTCASE = gql `
    mutation updateSampleTestcase($problem_id: ID, $sample_testcase: SampleTestcaseInput, $op: String, $index: Int){
        updateSampleTestcase(problem_id: $problem_id, sample_testcase: $sample_testcase, op: $op, index: $index){
            ...ProblemFragment
        }
    }
    ${ProblemFragment}
`

export const UPLOAD_TESTCASE = gql `
    mutation uploadTestcase($problem_id: ID, $ext: String, $input: String, $output: String, $test_count: Int){
        uploadTestcase(problem_id: $problem_id, ext: $ext, input: $input, output: $output, test_count: $test_count){
            problem {
                ...ProblemFragment
            }
            credentials {
                url
                fields
            }
        }
    }
    ${ProblemFragment}
`

export const DELETE_TESTCASES = gql`
    mutation deleteTestcases($problem_id: ID){
        deleteTestcases(problem_id: $problem_id){
            ...ProblemFragment
        }
    }
    ${ProblemFragment}
`

export const DELETE_TESTCASE = gql `
    mutation deleteTestcase($problem_id: ID, $index: Int){
        deleteTestcase(problem_id: $problem_id, index: $index){
            ...ProblemFragment
        }
    }
    ${ProblemFragment}
`

export const COMPILE_CODE = gql `
    mutation compileCode($problem_id: ID, $type: String, $source_type: String, $code: CodeInput, $flowchart: FlowchartInput){
        compileCode(problem_id: $problem_id, type: $type, source_type: $source_type, code: $code, flowchart: $flowchart){
            ...on SampleOutput {
                result{
                    status
                    expected
                    output
                }
            }
            ...on TestcaseOutput{
                result{
                    status
                }
            }
        }
    }
`

export const SAVE_CODE = gql`
    mutation saveCode($problem_id: ID, $code: String, $filename: String){
        saveCode(problem_id: $problem_id, code: $code, filename: $filename){
            status
            message
        }
    }
`

export const SAVE_CHART = gql `
    mutation saveChart($problem_id: ID, $chart: String){
        saveChart(problem_id: $problem_id, chart: $chart){
            status
            message
        }
    }
`
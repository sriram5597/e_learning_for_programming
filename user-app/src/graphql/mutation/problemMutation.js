import { gql } from '@apollo/client';

import { ProblemFragment } from '../queries/problemQueries';

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
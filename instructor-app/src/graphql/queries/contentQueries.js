import { gql } from '@apollo/client';

export const ContentFragment = gql `
    fragment ContentFragment on Content {
        content_id
        content{
            title
            type
            code
            language
            content
            url
        }
    }
`

export const ADD_FLOWCHART = gql `
    query($content_id: ID, $index: Int, $title: String){
        addFlowchart(content_id: $content_id, index: $index, title: $title) {
            url
            fields
        }
    }
`;
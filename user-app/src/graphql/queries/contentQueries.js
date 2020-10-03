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
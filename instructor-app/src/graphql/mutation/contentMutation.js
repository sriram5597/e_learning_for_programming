import { gql } from '@apollo/client';

import { ContentFragment } from '../queries/contentQueries';

export const UPDATE_CONTENT = gql `
    mutation updateContent($content_id: ID, $content: [SubContentInput]) {
        updateContent(content_id: $content_id, content: $content){
            ...ContentFragment
        }
    }
    ${ContentFragment}
`;
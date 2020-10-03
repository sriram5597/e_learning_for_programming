import React from 'react';

//graphql
import { GET_FLOW } from '../../../../graphql/queries/courseFlowQueries';

//components
import VideoUpload from '../content/VideoUpload';
import TextContent from '../content/TextContent';
import CreateMCQ from '../content/CreateMCQ';
import Details from '../problem_components/add_problem/Details';

//mui
import { Typography } from '@material-ui/core';


const getSourceComponent = (type, setOpen, title, course_id) => {
    const updateAfterMutation = (cache, data) => {
        const cache_data = cache.readQuery({
            query: GET_FLOW,
            variables: {
                course_id,
                title,
                role: "instructor"
            }
        });

        console.log(cache_data);

        cache.writeQuery({
            query: GET_FLOW,
            variables: {
                course_id,
                title,
                role: "instructor"
            },
            data: {
                getFlow: {
                    ...data
                }
            }
        });
    }

    switch(type){
        case 'VIDEO':
            return (
                <div>
                    <VideoUpload title={title} course_id={course_id} updateAfterMutation={updateAfterMutation} />
                </div>
            )

        case 'TEXT':
            return (
                <div>
                    <TextContent title={title} course_id={course_id} updateAfterMutation={updateAfterMutation} setOpen={setOpen} />
                </div>
            )

        case 'MCQ':
            return (
                <div>
                    <CreateMCQ title={title} course_id={course_id} updateAfterMutation={updateAfterMutation} setOpen={setOpen} />
                </div>
            )

        case 'CODE':
            return (
                <div>
                    <Details setOpen={setOpen} title={title} course_id={course_id} updateAfterMutation={updateAfterMutation} />
                </div>
            )

        default:
            return (
                <div>
                    <Typography variant='body1'>
                        Invalid Type
                    </Typography>
                </div>
            )
    }
}

export default getSourceComponent;
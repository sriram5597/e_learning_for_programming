import React, { useEffect } from 'react';

//components
import CodeDialog from './CodeDialog';

//utils
import DraftView from '../../../../utils/customEditor/view/DraftView';

//mui
import { Button } from '@material-ui/core';

//mui
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    button: {
        position: 'relative',
        marginTop: 40,
        left: '40%',
    }
}))

const Code = (props) => {
    const classes = useStyles();

    const problem = props.source.source;

    return (
        <div>
            {
                Object.keys(problem).length > 0 ? (
                    <div>
                        <DraftView editorState={JSON.parse(problem.problem_description)} />
                        <CodeDialog source={props.source} course_id={props.course_id} />
                    </div>
                ) : (
                    "Loading..."
                )
            }
        </div>
    )
}

export default Code;
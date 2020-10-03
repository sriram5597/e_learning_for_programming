import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { ADD_SOURCE } from '../../../../graphql/mutation/courseFlowMutations';

//mui
import { TextField, Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    text: {
        margin: 30,
        width: '90%',
    },
}));

const TextContent = (props) => {
    const classes = useStyles();

    const [sourceTitle, setSourceTitle] = useState();
    const [error, setError] = useState();

    const [addSource] = useMutation(ADD_SOURCE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            props.setOpen(false);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data['addSource']);
        }
    })

    const handleChange = (e) => {
        setSourceTitle(e.target.value);
    }

    const handleSubmit = () => {
        if(sourceTitle.trim()){
            addSource({
                variables: {
                    title: props.title,
                    course_id: props.course_id,
                    source: {
                        source_title: sourceTitle,
                        type: "TEXT"
                    }
                }
            });
        }
        else{
            setError("Content Title cannot be empty");
        }
    }

    return (
        <div>
            <TextField variant='outlined' color='primary' className={classes.text} label='Source Title' placeholder='Enter Source Title'
                name='sourceTitle' onChange={handleChange} placeholder={error ? error : null} error={error ? true : false}
            />
            <Button variant='contained' color='primary' onClick={handleSubmit}>
                Create Content
            </Button>
        </div>
    )
}

export default TextContent;